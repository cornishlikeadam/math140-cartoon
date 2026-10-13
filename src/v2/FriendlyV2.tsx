import React from "react";
import { AbsoluteFill, Audio, Img, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import timeline from "./timeline.json";
import { FONTS } from "../theme";

type Scene = (typeof timeline.scenes)[number];
const names = { KJ: "KJ", PROF: "Professor", BOT: "B.O.T." };
const sprites = { KJ: "kj", PROF: "professor", BOT: "bot" };
const rules = ["Build your own shapes", "Write your own proofs", "Ask for hints", "Explain your reasoning", "Quizzes are your solo mission"];

function TeachingCard({ scene, frame }: { scene: Scene; frame: number }) {
  const completed = scene.lines.filter(line => line.localStart <= frame);
  const ruleLines = completed.filter(line => "rule" in line);
  const rule = ruleLines[ruleLines.length - 1] as { rule: number } | undefined;
  const headings: Record<string, string> = {
    s1: "Your thinking. Your AI sidekick.", s2: "Five ways to keep learning yours",
    s3: "Make the meaning yours", s4: "Let’s check it together",
    s5: "Try • reflect • improve", s6: "Think first. Learn together.",
  };
  return <div style={{ position: "absolute", left: 545, top: 145, width: 830, minHeight: 210, boxSizing: "border-box", padding: "28px 36px", borderRadius: 24, background: "#173d38f2", color: "#fff8e9", textAlign: "center", border: "3px solid #d7bc88", fontFamily: FONTS.body }}>
    <div style={{ fontSize: 22, letterSpacing: 4, color: "#ffd2a0", marginBottom: 12 }}>MATH 140 · LEARN WITH CURIOSITY</div>
    <div style={{ fontSize: 42, fontWeight: 700 }}>{headings[scene.id]}</div>
    {scene.id === "s2" && rule && <div style={{ marginTop: 18, fontSize: 34, color: "#bceadd" }}>{rule.rule}. {rules[rule.rule - 1]}</div>}
    {scene.id === "s3" && <svg width="700" height="125" viewBox="0 0 700 125" role="img" aria-label="Triangle area: one half times base times perpendicular height">
      <path d="M 25 105 L 185 105 L 25 15 Z" fill="#edd09a44" stroke="#fff2ce" strokeWidth="4" />
      <path d="M25 85 L45 85 L45 105" fill="none" stroke="#bceadd" strokeWidth="3" />
      <text x="88" y="124" fill="#fff2ce" fontSize="20">base</text><text x="6" y="60" fill="#fff2ce" fontSize="20">h</text>
      <text x="225" y="70" fill="#fff2ce" fontSize="28">Area = ½ × base × height</text>
    </svg>}
    {scene.id === "s4" && <div style={{ marginTop: 18, fontSize: 42, color: "#bceadd" }}>{frame < scene.lines[1].localStart ? "2 + 2 = 5?" : "● ●  +  ● ●  = 4"}</div>}
    {scene.id === "s5" && <div style={{ marginTop: 18, fontSize: 30, color: "#bceadd" }}>Optional practice · approved pilot · student feedback</div>}
    {scene.id === "s6" && <div style={{ marginTop: 18, fontSize: 30, color: "#bceadd" }}>Ask for a hint. Explain the idea. Check the work.</div>}
  </div>;
}

export const FriendlyScene: React.FC<{ scene: Scene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const active = scene.lines.find(line => frame >= line.localStart && frame < line.localStart + line.durationFrames);
  const length = scene.endFrame - scene.startFrame;
  const zoom = interpolate(frame, [0, length], [1, 1.025], { extrapolateRight: "clamp" });
  const positions = { KJ: { left: 120, top: 385, width: 480, height: 575 }, PROF: { left: 1280, top: 365, width: 490, height: 595 }, BOT: { left: 775, top: 570, width: 370, height: 360 } };
  return <AbsoluteFill style={{ backgroundColor: "#eaddc4" }}>
    <AbsoluteFill style={{ transform: `scale(${zoom})` }}><Img src={staticFile(`art/v2/${scene.background}.png`)} style={{ width: "100%", height: "100%", objectFit: "cover" }} /></AbsoluteFill>
    <TeachingCard scene={scene} frame={frame} />
    {(["KJ", "PROF", "BOT"] as const).map((speaker, i) => {
      const playing = active?.speaker === speaker;
      const bob = speaker === "BOT" ? Math.sin(frame / 24) * 8 : Math.sin((frame + i * 19) / 34) * 2;
      const entry = interpolate(frame, [i * 5, i * 5 + 18], [18, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      return <div key={speaker} style={{ position: "absolute", ...positions[speaker], transform: `translateY(${bob + entry}px) scale(${playing ? 1.015 : 1})`, transformOrigin: "center bottom" }}>
        <Img src={staticFile(`art/v2/${sprites[speaker]}.png`)} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
      </div>;
    })}
    {active && <div style={{ position: "absolute", left: 135, right: 135, bottom: 30, minHeight: 84, boxSizing: "border-box", padding: "15px 26px", display: "flex", gap: 22, alignItems: "center", borderRadius: 22, background: "#162b2cf5", color: "#fff8e9", border: "2px solid #c4ddd2", fontFamily: FONTS.body }}>
      <span style={{ color: "#ffd2a0", fontSize: 25, fontWeight: 700, flexShrink: 0 }}>{names[active.speaker as keyof typeof names]}</span>
      <span style={{ fontSize: 33, lineHeight: 1.18 }}>{active.text}</span>
    </div>}
    {timeline.timingStatus === "measured" && scene.lines.map(line => <Sequence key={line.id} from={line.localStart} durationInFrames={line.durationFrames}><Audio src={staticFile(line.audio)} /></Sequence>)}
  </AbsoluteFill>;
};

export const FriendlyV2: React.FC = () => <AbsoluteFill>{timeline.scenes.map(scene => <Sequence key={scene.id} name={`V2 · ${scene.title}`} from={scene.startFrame} durationInFrames={scene.endFrame - scene.startFrame}><FriendlyScene scene={scene} /></Sequence>)}</AbsoluteFill>;
