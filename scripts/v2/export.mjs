// Build a portable multi-engine packet from the same v2 script and timing.
import fs from "node:fs";
import { p, readJSON, writeJSON } from "../lib.mjs";
const root = p("videos", "friendly-v2");
const timeline = readJSON(p("src", "v2", "timeline.json"));
const script = readJSON(p("production", "v2", "script.json"));
const escape = text => text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll('"', "&quot;");
fs.mkdirSync(`${root}/assets`, { recursive: true });
fs.mkdirSync(`${root}/compositions`, { recursive: true });
for (const name of ["classroom", "stage", "study", "lab", "kj", "professor", "bot"]) {
  fs.copyFileSync(p("public", "art", "v2", `${name}.png`), `${root}/assets/${name}.png`);
}
const headings = { s1: "Your thinking. Your AI sidekick.", s2: "Five ways to keep learning yours", s3: "Make the meaning yours", s4: "Let’s check it together", s5: "Try • reflect • improve", s6: "Think first. Learn together." };
const details = { s1: "Ask a question. Start an adventure.", s2: "Build shapes · Write proofs · Ask for hints · Explain · Quiz solo", s3: "Triangle area = ½ × base × perpendicular height", s4: "Two dots + two dots = four dots", s5: "Optional practice · approved pilot · student feedback", s6: "Ask for a hint. Explain the idea. Check the work." };
const slots = { KJ: [120, 385, 480, 575, "kj"], PROF: [1280, 365, 490, 595, "professor"], BOT: [775, 570, 370, 360, "bot"] };
const names = { KJ: "KJ", PROF: "Professor", BOT: "B.O.T." };
for (const scene of timeline.scenes) {
  const id = `v2-${scene.id}`, duration = (scene.endFrame - scene.startFrame) / 30;
  const characters = Object.entries(slots).map(([speaker, [x, y, w, h, sprite]]) => `<img id="${id}-${speaker}" src="assets/${sprite}.png" alt="${names[speaker]}" style="position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;object-fit:contain"/>`).join("\n");
  const captions = scene.lines.map(line => `<div id="${id}-${line.id}" class="clip caption" data-start="${line.localStart / 30}" data-duration="${line.durationFrames / 30}" data-track-index="3"><strong>${names[line.speaker]}</strong><span>${escape(line.text)}</span></div>`).join("\n");
  fs.writeFileSync(`${root}/compositions/${scene.id}.html`, `<template>
<style>
#${id}-root { position:absolute;inset:0;overflow:hidden;color:#fff8e9;font-family:system-ui,sans-serif; }
#${id}-root .backdrop { position:absolute;inset:0;width:100%;height:100%;object-fit:cover; }
#${id}-root .board { position:absolute;left:545px;top:145px;width:830px;min-height:210px;box-sizing:border-box;padding:28px 36px;border-radius:24px;background:#173d38;border:3px solid #d7bc88;text-align:center; }
#${id}-root .board small { display:block;font-size:22px;letter-spacing:4px;color:#ffd2a0;margin-bottom:12px; }
#${id}-root h1 { font-size:42px;line-height:1.15;margin:0 0 18px;font-family:serif; }
#${id}-root .detail { font-size:29px;color:#bceadd; }
#${id}-root .caption { position:absolute;left:135px;right:135px;bottom:30px;min-height:84px;box-sizing:border-box;padding:15px 26px;display:flex;gap:22px;align-items:center;border-radius:22px;background:#162b2c;border:2px solid #c4ddd2; }
#${id}-root .caption strong { color:#ffd2a0;font-size:25px;flex-shrink:0; }
#${id}-root .caption span { font-size:33px;line-height:1.18; }
</style>
<div id="${id}-root" data-composition-id="${id}" data-width="1920" data-height="1080" data-duration="${duration}">
<img id="${id}-background" class="backdrop" data-layout-allow-overflow src="assets/${scene.background}.png" alt="${scene.background}"/>
<div class="board"><small>MATH 140 · LEARN WITH CURIOSITY</small><h1>${headings[scene.id]}</h1><div class="detail">${details[scene.id]}</div></div>
${characters}
${captions}
</div>
<script>
{
const tl = gsap.timeline({paused:true});
tl.fromTo('#${id}-background',{scale:1},{scale:1.025,duration:${duration},ease:'none'},0);
tl.fromTo('#${id}-KJ',{x:-18,opacity:0},{x:0,opacity:1,duration:0.45,ease:'power2.out'},0);
tl.fromTo('#${id}-PROF',{x:18,opacity:0},{x:0,opacity:1,duration:0.45,ease:'power2.out'},0.12);
tl.fromTo('#${id}-BOT',{y:16,opacity:0},{y:0,opacity:1,duration:0.5,ease:'power2.out'},0.25);
tl.to('#${id}-BOT',{y:-3,duration:2,ease:'sine.inOut',yoyo:true,repeat:${Math.max(0, Math.floor((duration - .75) / 2) - 1)}},0.75);
window.__timelines['${id}']=tl;
}
</script>
</template>\n`);
}
const hosts = timeline.scenes.map(scene => `<div id="host-${scene.id}" class="clip" data-composition-id="v2-${scene.id}" data-composition-src="compositions/${scene.id}.html" data-start="${scene.startFrame / 30}" data-duration="${(scene.endFrame - scene.startFrame) / 30}" data-track-index="1" data-width="1920" data-height="1080"></div>`).join("\n");
let audio = "";
if (timeline.timingStatus === "measured") {
  fs.mkdirSync(`${root}/assets/voice`, { recursive: true });
  audio = timeline.scenes.flatMap(scene => scene.lines).map(line => {
    fs.copyFileSync(p("public", line.audio), `${root}/assets/voice/${line.id}.wav`);
    return `<audio id="voice-${line.id}" class="clip" src="assets/voice/${line.id}.wav" data-start="${line.startFrame / 30}" data-duration="${line.durationFrames / 30}" data-track-index="2" data-volume="1"></audio>`;
  }).join("\n");
}
fs.writeFileSync(`${root}/index.html`, `<!doctype html><html lang="en"><head><meta charset="UTF-8"/><title>Math 140 Friendly V2</title><script src="assets/gsap.min.js"></script><style>body{margin:0;background:#eaddc4}#root{position:relative;width:100%;height:100%;overflow:hidden}#root>.clip{position:absolute;inset:0}</style></head><body><div id="root" data-composition-id="friendly-v2" data-start="0" data-width="1920" data-height="1080" data-duration="120">${hosts}\n${audio}</div><script>const tl=gsap.timeline({paused:true});tl.to({}, {duration:120},0);window.__timelines['friendly-v2']=tl;</script></body></html>\n`);
writeJSON(p("production", "v2", "engine-handoff.json"), {
  edition: "v2", status: timeline.timingStatus === "measured" ? "voice-ready" : "visual-review-voice-pending",
  script: "production/v2/script.json", timeline: "src/v2/timeline.json", artwork: "public/art/v2",
  runtime: { remotion: "FriendlyV2", hyperframes: "videos/friendly-v2/index.html" },
  voice: { repository: "https://github.com/debpalash/VoiceStudio", endpoint: "http://127.0.0.1:3900/v1", profileRecipes: script.characters },
  openMontage: { repository: "https://github.com/calesthio/OpenMontage", localPathHint: "/Users/kjcornish/OpenMontage", pipeline: "character-animation", packetKind: "input-reference-not-native-checkpoint", requiredNext: ["Run pipeline preflight", "Create rig plan and pose library", "Finish VoiceStudio voices", "Replace static sprite mouths with viseme layers", "Generate gentle soundtrack", "Measure and verify final timing"] },
});
console.log(`Exported six HyperFrames scenes and OpenMontage reference packet. Timing: ${timeline.timingStatus}.`);
