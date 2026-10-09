// Stage 6 — Quality assurance.
//   node scripts/qa.mjs pre   → assets & timeline checks before rendering
//   node scripts/qa.mjs post [out/final.mp4] → validates the rendered file
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import {
  LIPSYNC_DIR, TIMELINE_PATH, VOICE_DIR, allLines, fail, ok, p, readJSON, readScript, run,
} from "./lib.mjs";

const mode = process.argv[2] || "pre";
const problems = [];
const check = (cond, msg) => { if (!cond) problems.push(msg); else ok(msg); };

if (mode === "pre") {
  const script = readScript();
  for (const l of allLines(script)) {
    const meta = path.join(VOICE_DIR, `${l.id}.meta.json`);
    if (!fs.existsSync(path.join(VOICE_DIR, `${l.id}.wav`))) problems.push(`missing voice ${l.id}.wav`);
    if (!fs.existsSync(path.join(LIPSYNC_DIR, `${l.id}.json`))) problems.push(`missing lipsync ${l.id}.json`);
    if (fs.existsSync(meta) && readJSON(meta).provider === "say" && process.env.ALLOW_SCRATCH_VOICES !== "1") {
      problems.push(`${l.id} uses scratch macOS 'say' voice (set ALLOW_SCRATCH_VOICES=1 to permit)`);
    }
  }
  check(fs.existsSync(TIMELINE_PATH), "timeline.json exists");
  if (fs.existsSync(TIMELINE_PATH)) {
    const tl = readJSON(TIMELINE_PATH);
    check(tl.durationInFrames === script.meta.durationInFrames, `timeline = ${tl.durationInFrames} frames`);
    const scriptIds = allLines(script).map((l) => l.id).join();
    const tlIds = tl.scenes.flatMap((s) => s.lines.map((l) => l.id)).join();
    check(scriptIds === tlIds, "timeline matches script.json (run npm run timing if not)");
    for (const s of tl.scenes) {
      for (const l of s.lines) {
        if (l.startFrame + l.durationFrames > s.endFrame) problems.push(`${l.id} overruns scene ${s.id}`);
      }
    }
  }
  for (const f of ["audio/music/theme.wav"]) check(fs.existsSync(p("public", f)), `asset ${f}`);
  const sfxUsed = new Set(fs.readFileSync(p("src", "sfx.ts"), "utf8").match(/"[a-z_]+"/g)?.map((x) => x.slice(1, -1)) ?? []);
  for (const name of sfxUsed) {
    if (!fs.existsSync(p("public", "audio", "sfx", `${name}.wav`))) problems.push(`missing sfx ${name}.wav`);
  }
  const manimDir = p("public", "manim");
  if (fs.existsSync(manimDir)) ok(`manim clips: ${fs.readdirSync(manimDir).filter((f) => f.endsWith(".mov") || f.endsWith(".mp4")).join(", ")}`);
}

if (mode === "post") {
  const file = process.argv[3] || p("out", "final.mp4");
  if (!fs.existsSync(file)) fail(`${file} not found`);
  const script = readScript();
  const { fps, width, height, durationInFrames } = script.meta;
  const probe = JSON.parse(run("ffprobe", [
    "-v", "error", "-count_frames", "-show_streams", "-show_format", "-of", "json", file,
  ]));
  const v = probe.streams.find((s) => s.codec_type === "video");
  const a = probe.streams.find((s) => s.codec_type === "audio");
  check(v?.codec_name === "h264", `video codec h264 (${v?.codec_name})`);
  check(v?.width === width && v?.height === height, `resolution ${v?.width}×${v?.height}`);
  check(v?.r_frame_rate === `${fps}/1`, `frame rate ${v?.r_frame_rate}`);
  check(v?.pix_fmt === "yuv420p", `pixel format ${v?.pix_fmt}`);
  check(Number(v?.nb_read_frames) === durationInFrames, `frame count ${v?.nb_read_frames} (target ${durationInFrames})`);
  const vdur = Number(v?.duration);
  check(Math.abs(vdur - durationInFrames / fps) < 0.5 / fps, `video duration ${vdur.toFixed(3)} s (target ${(durationInFrames / fps).toFixed(3)} s)`);
  check(a?.codec_name === "aac", `audio codec aac (${a?.codec_name})`);
  check(Math.abs(Number(a?.duration) - durationInFrames / fps) < 0.1, `audio duration ${Number(a?.duration).toFixed(3)} s`);

  // Loudness / peak analysis.
  const r = loudness(file);
  console.log(`  loudness: integrated ${r.input_i} LUFS, true peak ${r.input_tp} dBTP, LRA ${r.input_lra}`);
  check(Number(r.input_tp) < 1.0, `true peak below 1.0 dBTP (${r.input_tp})`);
  check(Number(r.input_i) > -20 && Number(r.input_i) < -12, `integrated loudness in -20..-12 LUFS (${r.input_i})`);

  // Black-frame / frozen detection summary.
  const bd = spawnStderr(["-hide_banner", "-i", file, "-vf", "blackdetect=d=0.5:pix_th=0.05", "-an", "-f", "null", "-"]);
  const blacks = (bd.match(/black_start/g) || []).length;
  check(blacks === 0, `no black segments ≥0.5 s (${blacks} found)`);

  // Contact sheet: 1 frame every 5 s → 24 tiles.
  fs.mkdirSync(p("out"), { recursive: true });
  run("ffmpeg", ["-y", "-loglevel", "error", "-i", file, "-vf", "fps=1/5,scale=480:-1,tile=6x4", "-frames:v", "1", p("out", "contact-sheet.png")]);
  ok("contact sheet → out/contact-sheet.png");
}

function spawnStderr(args) {
  return spawnSync("ffmpeg", args, { encoding: "utf8", maxBuffer: 1 << 26 }).stderr;
}
function loudness(file) {
  const err = spawnStderr(["-hide_banner", "-nostats", "-i", file, "-af", "loudnorm=print_format=json", "-f", "null", "-"]);
  const json = err.slice(err.lastIndexOf("{"), err.lastIndexOf("}") + 1);
  return JSON.parse(json);
}

if (problems.length) fail(`QA ${mode} failed:\n  - ${problems.join("\n  - ")}`);
ok(`QA ${mode} passed.`);
