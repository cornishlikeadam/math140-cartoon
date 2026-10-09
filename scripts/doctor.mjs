// Verifies the production toolchain and credentials.
import { has, loadEnv, run } from "./lib.mjs";

loadEnv();
const rows = [];
const ver = (cmd, args, re) => {
  if (!has(cmd)) return null;
  try { return (run(cmd, args).match(re) || [])[1] || "ok"; } catch { return "error"; }
};
rows.push(["ffmpeg", ver("ffmpeg", ["-version"], /ffmpeg version (\S+)/)]);
rows.push(["ffprobe", ver("ffprobe", ["-version"], /ffprobe version (\S+)/)]);
rows.push(["rhubarb", ver("rhubarb", ["--version"], /version (\S+)/)]);
rows.push(["manim", ver("manim", ["--version"], /v(\S+)/)]);
rows.push(["latex (optional for manim MathTex)", ver("latex", ["--version"], /(pdfTeX \S+)/)]);
rows.push(["ELEVENLABS_API_KEY", process.env.ELEVENLABS_API_KEY ? "set" : null]);
rows.push(["OPENAI_API_KEY", process.env.OPENAI_API_KEY ? "set" : null]);

let blocker = false;
for (const [name, v] of rows) {
  const optional = /optional|OPENAI|ELEVENLABS/.test(name);
  console.log(`${v ? "✔" : optional ? "–" : "✖"} ${name.padEnd(36)} ${v ?? "missing"}`);
  if (!v && !optional) blocker = true;
}
if (!process.env.ELEVENLABS_API_KEY && !process.env.OPENAI_API_KEY && process.env.TTS_PROVIDER !== "say") {
  console.log("\n✖ BLOCKER: no TTS API key — add ELEVENLABS_API_KEY to .env (see .env.example).");
  blocker = true;
}
process.exit(blocker ? 1 : 0);
