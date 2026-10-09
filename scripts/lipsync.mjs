// Stage 3b — Lip sync. Runs Rhubarb on every voice WAV.
// Output: public/audio/lipsync/<lineId>.json  (Rhubarb JSON, shapes A–H + X)
// Usage: node scripts/lipsync.mjs [--force]
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { LIPSYNC_DIR, VOICE_DIR, allLines, fail, has, ok, readScript, run } from "./lib.mjs";

if (!has("rhubarb")) fail("rhubarb not found on PATH (expected ~/.local/bin/rhubarb).");
const force = process.argv.includes("--force");
const script = readScript();
fs.mkdirSync(LIPSYNC_DIR, { recursive: true });

let done = 0;
let cached = 0;
for (const line of allLines(script)) {
  const wav = path.join(VOICE_DIR, `${line.id}.wav`);
  const out = path.join(LIPSYNC_DIR, `${line.id}.json`);
  if (!fs.existsSync(wav)) fail(`Missing voice file ${wav} — run npm run voices first.`);
  if (!force && fs.existsSync(out) && fs.statSync(out).mtimeMs >= fs.statSync(wav).mtimeMs) {
    cached++;
    continue;
  }
  // Dialog text greatly improves Rhubarb's phoneme recognition.
  const dialog = path.join(os.tmpdir(), `${line.id}.dialog.txt`);
  fs.writeFileSync(dialog, (line.ttsText ?? line.text).replace(/…/g, "..."));
  process.stdout.write(`… ${line.id} `);
  run("rhubarb", ["-q", "-f", "json", "--extendedShapes", "GHX", "-d", dialog, "-o", out, wav]);
  console.log("done");
  done++;
}
ok(`Lip sync: ${done} analysed, ${cached} cached.`);
