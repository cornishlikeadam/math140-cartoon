// Stage 3c — Timing. Measures every voice WAV and places lines frame-accurately
// inside their scene. Writes src/data/timeline.json (consumed by Remotion).
//
// Placement rules per scene:
//   cursor = scene.startFrame + scene.leadIn (s, default 0.6)
//   line.at (optional, seconds from scene start) forces a later start
//   after each line: cursor += duration + line.gapAfter (default scene.gap, 0.35 s)
// If dialogue overflows the scene (minus tailOut, default 0.5 s), gaps are
// compressed proportionally down to 0.12 s; if it still overflows the script fails.
import fs from "node:fs";
import path from "node:path";
import {
  LIPSYNC_DIR, TIMELINE_PATH, VOICE_DIR, durationSeconds, fail, ok, readJSON, readScript, writeJSON,
} from "./lib.mjs";

const script = readScript();
const { fps, width, height, durationInFrames } = script.meta;
const sec = (s) => Math.round(s * fps);

const scenes = script.scenes.map((scene) => {
  const leadIn = scene.leadIn ?? 0.6;
  const tailOut = scene.tailOut ?? 0.5;
  const defaultGap = scene.gap ?? 0.35;
  const measured = scene.lines.map((line) => {
    const wav = path.join(VOICE_DIR, `${line.id}.wav`);
    const lip = path.join(LIPSYNC_DIR, `${line.id}.json`);
    if (!fs.existsSync(wav)) fail(`Missing ${wav}`);
    if (!fs.existsSync(lip)) fail(`Missing ${lip}`);
    return {
      line,
      dur: durationSeconds(wav),
      gap: line.gapAfter ?? defaultGap,
      cues: readJSON(lip).mouthCues,
    };
  });

  const available = (scene.endFrame - scene.startFrame) / fps - leadIn - tailOut;
  const speech = measured.reduce((a, m) => a + m.dur, 0);
  let gaps = measured.slice(0, -1).reduce((a, m) => a + m.gap, 0);
  let gapScale = 1;
  if (speech + gaps > available) {
    const minGaps = 0.12 * Math.max(0, measured.length - 1);
    if (speech + minGaps > available) {
      fail(
        `Scene ${scene.id} "${scene.title}" overflows: ${speech.toFixed(2)} s speech + min gaps ` +
          `> ${available.toFixed(2)} s available. Shorten dialogue or lengthen the scene.`,
      );
    }
    gapScale = (available - speech) / gaps;
    console.warn(`⚠ ${scene.id}: compressing gaps ×${gapScale.toFixed(2)} to fit.`);
  }

  let cursor = leadIn;
  const lines = measured.map((m, i) => {
    if (m.line.at !== undefined) cursor = Math.max(cursor, m.line.at);
    const localStart = sec(cursor);
    const durationFrames = Math.ceil(m.dur * fps);
    // Negative gaps = intentional overlap (interruptions); positive gaps may be compressed.
    const g = m.gap < 0 ? m.gap : Math.max(0.12, m.gap * gapScale);
    cursor += m.dur + (i < measured.length - 1 ? g : 0);
    return {
      ...m.line,
      localStart,
      startFrame: scene.startFrame + localStart,
      durationFrames,
      durationSec: +m.dur.toFixed(3),
      audio: `audio/voice/${m.line.id}.wav`,
      mouthCues: m.cues,
    };
  });

  const last = lines.at(-1);
  const sceneLen = scene.endFrame - scene.startFrame;
  if (last && last.localStart + last.durationFrames > sceneLen) {
    fail(`Scene ${scene.id}: last line ends after scene end (forced 'at' too late?).`);
  }
  const used = last ? (last.localStart + last.durationFrames) / fps : 0;
  console.log(
    `  ${scene.id.padEnd(4)} ${scene.title.padEnd(26)} ${(sceneLen / fps).toFixed(1)} s, ` +
      `speech ends at ${used.toFixed(2)} s (${lines.length} lines)`,
  );
  return { ...scene, lines };
});

const total = scenes.at(-1).endFrame;
if (total !== durationInFrames) fail(`Scenes end at frame ${total}, expected ${durationInFrames}.`);

writeJSON(TIMELINE_PATH, {
  generatedAt: new Date().toISOString(),
  fps, width, height, durationInFrames,
  title: script.meta.title,
  characters: script.characters,
  scenes,
});
ok(`Timeline written: ${path.relative(process.cwd(), TIMELINE_PATH)} (${durationInFrames} frames).`);
