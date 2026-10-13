// Stage 3a — Voice production.
// Generates public/audio/voice/<lineId>.wav for every line in production/script.json.
//
// Provider is chosen by TTS_PROVIDER (elevenlabs | openai | say) or auto-detected
// from ELEVENLABS_API_KEY / OPENAI_API_KEY in .env. `say` (macOS) is only used
// when explicitly requested, so a missing key is reported as a blocker instead of
// silently producing lower-quality audio.
//
// Imported recordings: drop <lineId>.wav into public/audio/voice/ without a
// matching .meta.json and it will be kept (only loudness-normalised once).
//
// Usage: node scripts/voice.mjs [--force] [--only s1_l01,s1_l02]
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import os from "node:os";
import {
  EDITION, VOICE_DIR, allLines, fail, loadEnv, ok, p, readScript, run,
} from "./lib.mjs";

const RAW_DIR = EDITION === "v2" ? p("production", "v2", "voice_raw") : p("production", "voice_raw");

loadEnv();
const args = process.argv.slice(2);
const force = args.includes("--force");
const onlyIdx = args.indexOf("--only");
const only = onlyIdx >= 0 ? new Set(args[onlyIdx + 1].split(",")) : null;

const script = readScript();
const provider =
  process.env.TTS_PROVIDER ||
  (EDITION === "v2" ? "voicestudio" : process.env.ELEVENLABS_API_KEY ? "elevenlabs" : process.env.OPENAI_API_KEY ? "openai" : "say");

if (EDITION === "v2" && provider !== "voicestudio") fail("V2 requires VoiceStudio. Use the legacy pipeline for other providers.");

const voiceStudioBase = (process.env.VOICESTUDIO_BASE_URL || "http://127.0.0.1:3900/v1").replace(/\/$/, "");
const voiceStudioModel = process.env.VOICESTUDIO_MODEL || "omnivoice";
const voiceStudioHeaders = { "Content-Type": "application/json", ...(process.env.VOICESTUDIO_API_KEY ? { Authorization: `Bearer ${process.env.VOICESTUDIO_API_KEY}` } : {}) };
const studioProfiles = {};
if (provider === "voicestudio") {
  let catalog;
  try {
    const response = await fetch(`${voiceStudioBase}/audio/voices`, { headers: voiceStudioHeaders, signal: AbortSignal.timeout(10000) });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    catalog = await response.json();
  } catch (error) { fail(`VoiceStudio unavailable at ${voiceStudioBase}: ${error.message}. Start its backend and finish engine setup; no system-voice fallback will run.`); }
  for (const [speaker, character] of Object.entries(script.characters)) {
    const id = process.env[`VOICESTUDIO_VOICE_${speaker}`] || character.voice?.voicestudio;
    const profile = catalog.voices?.find(v => v.type === "profile" && v.voice_id === id);
    if (!profile) fail(`Set VOICESTUDIO_VOICE_${speaker} to a saved profile ID from VoiceStudio. OpenAI aliases map to one default voice and are not accepted for this cast.`);
    studioProfiles[speaker] = profile.voice_id;
  }
  if (new Set(Object.values(studioProfiles)).size !== Object.keys(script.characters).length) fail("Each V2 character needs a different saved VoiceStudio profile.");
}

if (provider === "say") {
  console.log("ℹ Using macOS voices (TTS_PROVIDER=say). Add ELEVENLABS_API_KEY to .env for studio cloud voices.");
}

fs.mkdirSync(VOICE_DIR, { recursive: true });

// Character-level post-processing filters (applied before loudness normalisation).
const FX = {
  none: "",
  // Robot: slight pitch-up, short metallic comb echo, gentle chorus. Kept mild for intelligibility.
  robot:
    "asetrate=48000*1.06,aresample=48000,atempo=0.95," +
    "aecho=0.8:0.85:7|13:0.30|0.20,chorus=0.6:0.9:25:0.35:0.25:2,",
};

const TRIM =
  "silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.03," +
  "areverse,silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.08,areverse,";

function postProcess(input, output, fxName, tempo = 1) {
  const tempoF = tempo && tempo !== 1 ? `atempo=${tempo},` : "";
  const filter = `${tempoF}${FX[fxName] ?? ""}${TRIM}loudnorm=I=-16:TP=-1.5:LRA=11,aresample=48000`;
  run("ffmpeg", ["-y", "-loglevel", "error", "-i", input, "-af", filter, "-ac", "1", "-ar", "48000", "-c:a", "pcm_s16le", output]);
}

async function ttsElevenLabs(line, voiceCfg, outFile) {
  const voiceId = voiceCfg.elevenlabs;
  if (!voiceId) fail(`No elevenlabs voice id for speaker ${line.speaker}`);
  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
    {
      method: "POST",
      headers: { "xi-api-key": process.env.ELEVENLABS_API_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({
        text: line.text,
        model_id: process.env.ELEVENLABS_MODEL || "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.4, similarity_boost: 0.8, style: 0.45, use_speaker_boost: true, speed: 1.0,
          ...(voiceCfg.settings || {}),
          ...(line.voiceSettings || {}),
        },
      }),
    },
  );
  if (!res.ok) throw new Error(`ElevenLabs ${res.status}: ${await res.text()}`);
  fs.writeFileSync(outFile, Buffer.from(await res.arrayBuffer()));
}

async function ttsOpenAI(line, voiceCfg, outFile) {
  const res = await fetch("https://api.openai.com/v1/audio/speech", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: process.env.OPENAI_TTS_MODEL || "gpt-4o-mini-tts",
      voice: voiceCfg.openai || "alloy",
      input: line.text,
      instructions: [voiceCfg.direction, line.emotion && `Emotion: ${line.emotion}.`].filter(Boolean).join(" "),
      response_format: "wav",
    }),
  });
  if (!res.ok) throw new Error(`OpenAI ${res.status}: ${await res.text()}`);
  fs.writeFileSync(outFile, Buffer.from(await res.arrayBuffer()));
}

async function ttsVoiceStudio(line, outFile) {
  const response = await fetch(`${voiceStudioBase}/audio/speech`, {
    method: "POST", headers: voiceStudioHeaders,
    body: JSON.stringify({ model: voiceStudioModel, voice: studioProfiles[line.speaker], input: line.text, response_format: "wav", language: "en", speed: 1 }),
    signal: AbortSignal.timeout(1800000),
  });
  if (!response.ok) throw new Error(`VoiceStudio ${response.status}: ${await response.text()}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  if (bytes.toString("ascii", 0, 4) !== "RIFF" || bytes.toString("ascii", 8, 12) !== "WAVE") throw new Error("VoiceStudio returned non-WAV audio");
  fs.writeFileSync(outFile, bytes);
}

function ttsSay(line, voiceCfg, outFile) {
  const args = ["-v", voiceCfg.say || "Samantha", "-o", outFile];
  args.push("-r", String(voiceCfg.sayRate || process.env.SAY_RATE || 160));
  run("say", [...args, line.text]);
}

const lines = allLines(script).filter((l) => !only || only.has(l.id));
let generated = 0;
let kept = 0;

for (const srcLine of lines) {
  // ttsText = performance text for the voice; text = display text for captions.
  const line = { ...srcLine, text: srcLine.ttsText ?? srcLine.text };
  const ch = script.characters[line.speaker];
  if (!ch) fail(`Unknown speaker "${line.speaker}" in ${line.id}`);
  const voiceCfg = ch.voice || {};
  const wav = path.join(VOICE_DIR, `${line.id}.wav`);
  const metaFile = path.join(VOICE_DIR, `${line.id}.meta.json`);
  const sha = (x) => crypto.createHash("sha1").update(JSON.stringify(x)).digest("hex");
  const rawHash = sha([provider, line.text, line.emotion, voiceCfg, line.voiceSettings, provider === "voicestudio" ? [voiceStudioBase, voiceStudioModel, studioProfiles[line.speaker]] : null]);
  const hash = sha([rawHash, ch.fx, line.tempo]);

  if (fs.existsSync(wav) && !fs.existsSync(metaFile) && !force) {
    // Imported recording — normalise in place once, then mark as imported.
    const tmp = path.join(os.tmpdir(), `${line.id}.import.wav`);
    postProcess(wav, tmp, "none", line.tempo);
    fs.copyFileSync(tmp, wav);
    fs.writeFileSync(metaFile, JSON.stringify({ imported: true }));
    kept++;
    continue;
  }
  if (fs.existsSync(metaFile) && !force) {
    const meta = JSON.parse(fs.readFileSync(metaFile, "utf8"));
    if (meta.imported || meta.hash === hash) { kept++; continue; }
  }

  // Raw TTS cache (production/voice_raw) — avoids re-billing when only fx/tempo change.
  const ext = provider === "elevenlabs" ? "mp3" : provider === "say" ? "aiff" : "wav";
  fs.mkdirSync(RAW_DIR, { recursive: true });
  const raw = path.join(RAW_DIR, `${line.id}.${ext}`);
  const rawMeta = path.join(RAW_DIR, `${line.id}.json`);
  const rawValid =
    !force && fs.existsSync(raw) && fs.existsSync(rawMeta) &&
    JSON.parse(fs.readFileSync(rawMeta, "utf8")).rawHash === rawHash;

  process.stdout.write(`… ${line.id} [${line.speaker}/${rawValid ? "cached-raw" : provider}] `);
  if (!rawValid) {
    for (let attempt = 1; ; attempt++) {
      try {
        if (provider === "voicestudio") await ttsVoiceStudio(line, raw);
        else if (provider === "elevenlabs") await ttsElevenLabs(line, voiceCfg, raw);
        else if (provider === "openai") await ttsOpenAI(line, voiceCfg, raw);
        else if (provider === "say") ttsSay(line, voiceCfg, raw);
        else fail(`Unknown TTS_PROVIDER ${provider}`);
        break;
      } catch (e) {
        if (attempt >= 3 || /40[13]/.test(e.message)) fail(`TTS failed for ${line.id}: ${e.message}`);
        await new Promise((r) => setTimeout(r, 1500 * attempt));
      }
    }
    fs.writeFileSync(rawMeta, JSON.stringify({ rawHash, provider, text: line.text }, null, 2));
  }
  postProcess(raw, wav, ch.fx || "none", line.tempo);
  fs.writeFileSync(metaFile, JSON.stringify({ hash, provider, text: line.text }, null, 2));
  generated++;
  console.log("done");
}

ok(`Voices: ${generated} generated, ${kept} cached/imported (${lines.length} lines).`);
