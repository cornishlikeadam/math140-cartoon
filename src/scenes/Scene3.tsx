import React from "react";
import { AbsoluteFill, Audio, OffthreadVideo, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Study } from "../backgrounds/Study";
import { BOT, KJ, Professor } from "../characters";
import { Camera, Captions } from "../components";
import { SFX } from "../sfx";
import { INK, PALETTE, stroke } from "../theme";
import { emotionAt, getLine, getScene, speakingLine, visemeAt, visemeOpenness } from "../timeline";

export const Scene3: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scene = getScene("s3");

  const kjSpeaking = speakingLine(scene, "KJ", frame);
  const botSpeaking = speakingLine(scene, "BOT", frame);
  const profSpeaking = speakingLine(scene, "PROF", frame);
  const activeLine = kjSpeaking || botSpeaking || profSpeaking;

  const kjViseme = visemeAt(scene, "KJ", frame, fps);
  const botViseme = visemeAt(scene, "BOT", frame, fps);
  const profViseme = visemeAt(scene, "PROF", frame, fps);

  // Line triggers
  const l02 = getLine("s3_l02").localStart;
  const l03 = getLine("s3_l03").localStart;

  // Alien math symbols appear during l02 and morph away on l03
  const showAlienSymbols = frame >= l02 && frame < l03 + 20;
  const showManimExplainer = frame >= l03;

  return (
    <AbsoluteFill>
      {/* Audio sequences */}
      {scene.lines.map((l) => (
        <Sequence key={l.id} from={l.localStart} durationInFrames={l.durationFrames}>
          <Audio src={staticFile(l.audio)} />
        </Sequence>
      ))}

      {/* SFX: Sparkle / Magic translate */}
      <Sequence from={l03} durationInFrames={35}>
        <Audio src={staticFile(SFX.sparkle)} volume={0.8} />
      </Sequence>

      <Camera x={0} y={0} zoom={showManimExplainer ? 1.05 : 1.0}>
        <Study />

        <svg
          viewBox="0 0 1920 1080"
          style={{ position: "absolute", width: "100%", height: "100%", overflow: "visible" }}
        >
          {/* Confusing Alien Math Floating Cloud */}
          {showAlienSymbols && (
            <g transform="translate(960, 360)">
              <rect
                x={-280}
                y={-90}
                width={560}
                height={180}
                rx={24}
                fill={PALETTE.paper}
                {...stroke(6)}
              />
              <text x={0} y={-20} textAnchor="middle" fill={PALETTE.red} fontSize={32} fontWeight={900}>
                CONFUSING SYMBOLS:
              </text>
              <text
                x={0}
                y={40}
                textAnchor="middle"
                fill={INK}
                fontSize={42}
                fontWeight="bold"
                fontFamily="Courier, monospace"
              >
                ∰ ∇ × Ψ(x,t) = ⨂ ∞ ?
              </text>
            </g>
          )}

          {/* Manim Video Explainer: Triangle Area - "Translate Math into Human" */}
          {showManimExplainer && (
            <g transform="translate(960, 380)">
              <rect
                x={-340}
                y={-200}
                width={680}
                height={400}
                rx={24}
                fill="#1e293b"
                {...stroke(8)}
              />
              <foreignObject x={-320} y={-180} width={640} height={360}>
                <OffthreadVideo
                  src={staticFile("manim/triangle_area.mp4")}
                  style={{ width: "100%", height: "100%", objectFit: "contain" }}
                />
              </foreignObject>
            </g>
          )}

          {/* KJ Left */}
          <g transform="translate(420, 960)">
            <KJ
              viseme={kjViseme}
              expression={emotionAt(scene, "KJ", frame, "thinking")}
              talk={visemeOpenness[kjViseme]}
              frame={frame}
              lookX={0.6}
            />
          </g>

          {/* Professor Right */}
          <g transform="translate(1500, 980)">
            <Professor
              viseme={profViseme}
              expression={emotionAt(scene, "PROF", frame, "explaining")}
              talk={visemeOpenness[profViseme]}
              frame={frame}
              lookX={-0.6}
              prop={frame > l03 ? "papers" : "none"}
            />
          </g>

          {/* B.O.T. Center */}
          <g transform="translate(960, 720)">
            <BOT
              viseme={botViseme}
              expression={emotionAt(scene, "BOT", frame, "excited")}
              talk={visemeOpenness[botViseme]}
              frame={frame}
            />
          </g>
        </svg>

        <Captions line={activeLine} />
      </Camera>
    </AbsoluteFill>
  );
};
