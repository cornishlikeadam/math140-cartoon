// Shared helpers for the cartoon-producer pipeline scripts.
import fs from "node:fs";
import path from "node:path";
import { execFileSync, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const p = (...parts) => path.join(ROOT, ...parts);

export const EDITION = process.env.MATH140_EDITION === "v2" ? "v2" : "v1";
export const SCRIPT_PATH = EDITION === "v2" ? p("production", "v2", "script.json") : p("production", "script.json");
export const TIMELINE_PATH = EDITION === "v2" ? p("src", "v2", "timeline.json") : p("src", "data", "timeline.json");
export const VOICE_DIR = EDITION === "v2" ? p("public", "audio", "v2", "voice") : p("public", "audio", "voice");
export const LIPSYNC_DIR = EDITION === "v2" ? p("public", "audio", "v2", "lipsync") : p("public", "audio", "lipsync");

// Minimal .env loader (no dependency).
export function loadEnv() {
  const envPath = p(".env");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

export function readJSON(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

export function writeJSON(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + "\n");
}

export function readScript() {
  if (!fs.existsSync(SCRIPT_PATH)) fail(`Missing ${SCRIPT_PATH} (Stage 1 output).`);
  return readJSON(SCRIPT_PATH);
}

export function allLines(script) {
  return script.scenes.flatMap((s) => s.lines.map((l) => ({ ...l, sceneId: s.id })));
}

export function run(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, { encoding: "utf8", ...opts });
  if (r.status !== 0) {
    throw new Error(`${cmd} ${args.join(" ")} failed:\n${r.stderr || r.stdout}`);
  }
  return r.stdout;
}

export function has(cmd) {
  try {
    execFileSync("which", [cmd], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

export function durationSeconds(file) {
  const out = run("ffprobe", [
    "-v", "error", "-show_entries", "format=duration",
    "-of", "default=nw=1:nk=1", file,
  ]);
  return parseFloat(out.trim());
}

export function fail(msg) {
  console.error(`\n✖ ${msg}\n`);
  process.exit(1);
}

export function ok(msg) {
  console.log(`✔ ${msg}`);
}
