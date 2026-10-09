// Stage 1 check — validates production/script.json structure and timing budget.
import { fail, ok, readScript } from "./lib.mjs";

const s = readScript();
const { fps, durationInFrames } = s.meta;
const errors = [];
const ids = new Set();
let cursor = 0;

for (const scene of s.scenes) {
  if (scene.startFrame !== cursor) errors.push(`${scene.id} starts at ${scene.startFrame}, expected ${cursor}`);
  if (scene.endFrame <= scene.startFrame) errors.push(`${scene.id} has non-positive length`);
  cursor = scene.endFrame;
  let words = 0;
  for (const l of scene.lines) {
    if (ids.has(l.id)) errors.push(`duplicate line id ${l.id}`);
    ids.add(l.id);
    const ch = s.characters[l.speaker];
    if (!ch) errors.push(`${l.id}: unknown speaker ${l.speaker}`);
    else if (l.emotion && !ch.emotions.includes(l.emotion)) errors.push(`${l.id}: emotion "${l.emotion}" not in ${l.speaker} set`);
    words += (l.ttsText ?? l.text).split(/\s+/).filter(Boolean).length;
  }
  const secs = (scene.endFrame - scene.startFrame) / fps;
  const est = words / 2.9; // brisk cartoon pace
  const flag = est > secs * 0.92 ? "⚠ tight" : "ok";
  console.log(`  ${scene.id} ${scene.title.padEnd(26)} ${secs.toFixed(0).padStart(3)} s  ${String(words).padStart(3)} words ≈ ${est.toFixed(1)} s  ${flag}`);
}
if (cursor !== durationInFrames) errors.push(`scenes end at ${cursor}, expected ${durationInFrames}`);
if (errors.length) fail(errors.join("\n"));
ok(`script.json valid: ${s.scenes.length} scenes, ${ids.size} lines, ${durationInFrames} frames (${durationInFrames / fps} s).`);
