import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { p, readJSON, durationSeconds } from "../lib.mjs";

const script = readJSON(p("production", "v2", "script.json"));
const timeline = readJSON(p("src", "v2", "timeline.json"));
const requireAudio = process.argv.includes("--require-audio");
const errors = [];
for (const name of ["classroom", "stage", "study", "lab", "kj", "professor", "bot"]) {
  if (!fs.existsSync(p("public", "art", "v2", `${name}.png`))) errors.push(`Missing artwork: ${name}`);
}
let cursor = 0;
const ids = new Set();
for (const scene of timeline.scenes) {
  if (scene.startFrame !== cursor) errors.push(`${scene.id}: non-contiguous scene`);
  cursor = scene.endFrame;
  const source = script.scenes.find(s => s.id === scene.id);
  for (const line of scene.lines) {
    if (ids.has(line.id)) errors.push(`Duplicate line: ${line.id}`);
    ids.add(line.id);
    const original = source?.lines.find(l => l.id === line.id);
    if (!original || original.text !== line.text || original.speaker !== line.speaker) errors.push(`Stale dialogue: ${line.id}`);
    if (line.localStart < 0 || line.localStart + line.durationFrames > scene.endFrame - scene.startFrame) errors.push(`Overflow: ${line.id}`);
    if (!line.audio.startsWith("audio/v2/voice/")) errors.push(`Legacy audio in v2: ${line.id}`);
    if (requireAudio) {
      const wav = p("public", line.audio);
      const lip = p("public", "audio", "v2", "lipsync", `${line.id}.json`);
      if (!fs.existsSync(wav) || !fs.existsSync(lip)) errors.push(`Missing voice or mouth cues: ${line.id}`);
      else {
        if (Math.abs(durationSeconds(wav) - line.durationSec) > 1 / timeline.fps) errors.push(`Stale measured timing: ${line.id}`);
        if (fs.statSync(lip).mtimeMs < fs.statSync(wav).mtimeMs) errors.push(`Stale lip sync: ${line.id}`);
        const cues = readJSON(lip).mouthCues;
        if (JSON.stringify(cues) !== JSON.stringify(line.mouthCues)) errors.push(`Timeline mouth cues differ: ${line.id}`);
      }
    }
  }
}
if (cursor !== 3600 || timeline.durationInFrames !== 3600) errors.push("V2 must span exactly 120 seconds at 30 fps");
if (timeline.fps !== 30) errors.push("V2 frame rate must be 30 fps");
if (requireAudio && timeline.timingStatus !== "measured") errors.push("VoiceStudio speech has not been measured. Run npm run v2:audio.");
if (errors.length) { console.error(errors.join("\n")); process.exit(1); }
console.log(`V2 assets and ${ids.size} lines valid. Timing: ${timeline.timingStatus}. ${requireAudio ? "Audio ready." : "Visual review only; final export requires measured VoiceStudio audio."}`);

if (process.argv.includes("--manifest")) {
  const manifest = Object.fromEntries(fs.readdirSync(p("public", "art", "v2")).filter(n => n.endsWith(".png")).map(name => {
    const file = p("public", "art", "v2", name);
    return [name, { path: path.relative(p(), file), sha256: crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex") }];
  }));
  fs.writeFileSync(p("production", "v2", "asset-manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
}
