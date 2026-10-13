import React from "react";
import { AbsoluteFill, Audio, OffthreadVideo, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Stage } from "../backgrounds/Stage";
import { BOT, KJ, Professor } from "../characters";
import { Camera, Captions, FiveRulesHUD } from "../components";
import { SFX } from "../sfx";
import { stroke } from "../theme";
import { emotionAt, getLine, getScene, speakingLine, visemeAt, visemeOpenness } from "../timeline";

export const Scene2: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scene = getScene("s2");

  const kjSpeaking = speakingLine(scene, "KJ", frame);
  const botSpeaking = speakingLine(scene, "BOT", frame);
  const profSpeaking = speakingLine(scene, "PROF", frame);
  const activeLine = kjSpeaking || botSpeaking || profSpeaking;

  const kjViseme = visemeAt(scene, "KJ", frame, fps);
  const botViseme = visemeAt(scene, "BOT", frame, fps);
  const profViseme = visemeAt(scene, "PROF", frame, fps);

  // Active rule tracking based on lines
  const l03 = getLine("s2_l03").localStart;
  const l04 = getLine("s2_l04").localStart;
  const l07 = getLine("s2_l07").localStart;
  const l09 = getLine("s2_l09").localStart;
  const l10 = getLine("s2_l10").localStart;

  let activeRule = 0;
  if (frame >= l10) activeRule = 5;
  else if (frame >= l09) activeRule = 4;
  else if (frame >= l07) activeRule = 3;
  else if (frame >= l04) activeRule = 2;
  else if (frame >= l03) activeRule = 1;

  // Censor bar gag triggers on B.O.T. lines:
  const censorLine = getLine("s2_l05");
  const isCensored =
    frame >= censorLine.localStart + 15 && frame <= censorLine.localStart + censorLine.durationFrames + 20;

  // Manim screen display (between KJ and Professor during rules 1 & 2)
  const showManim1 = frame >= l03 && frame < l04 + 30;
  const showManim2 = frame >= l04 && frame < l07;

  return (
    <AbsoluteFill>
      {/* Audio sequences */}
      {scene.lines.map((l) => (
        <Sequence key={l.id} from={l.localStart} durationInFrames={l.durationFrames}>
          <Audio src={staticFile(l.audio)} />
        </Sequence>
      ))}

      {/* SFX on rule announcements */}
      {[l03, l04, l07, l09, l10].map((rf, i) => (
        <Sequence key={i} from={rf} durationInFrames={30}>
          <Audio src={staticFile(SFX.ding)} volume={0.6} />
        </Sequence>
      ))}

      {/* SFX on Censor slap */}
      <Sequence from={censorLine.localStart + 15} durationInFrames={25}>
        <Audio src={staticFile(SFX.bonk)} volume={0.9} />
      </Sequence>

      {/* Camera with bonk shake on censor bar slap */}
      <Camera
        x={frame < l03 ? -30 : frame > getLine("s2_l11").localStart ? 20 : 0}
        y={0}
        zoom={1.0}
        shake={censorLine.localStart + 15 <= frame && frame < censorLine.localStart + 35 ? 20 : 0}
        shakeFrame={censorLine.localStart + 15}
      >
        <Stage hue="magenta" />

        {/* Five Rules HUD at Top */}
        <svg
          viewBox="0 0 1920 1080"
          style={{ position: "absolute", width: "100%", height: "100%", overflow: "visible" }}
        >
          <FiveRulesHUD activeRule={activeRule} frame={frame} />

          {/* Manim TV Monitor Screen in Upper Center */}
          {(showManim1 || showManim2) && (
            <g transform="translate(960, 420)">
              {/* Monitor frame */}
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
                {showManim1 && (
                  <OffthreadVideo
                    src={staticFile("manim/construction.mp4")}
                    style={{ width: "100%", height: "100%", objectFit: "contain" }}
                  />
                )}
                {showManim2 && (
                  <OffthreadVideo
                    src={staticFile("manim/angle_proof.mp4")}
                    style={{ width: "100%", height: "100%", objectFit: "contain" }}
                  />
                )}
              </foreignObject>
            </g>
          )}

          {/* KJ on Left */}
          <g transform="translate(380, 960)">
            <KJ
              viseme={kjViseme}
              expression={emotionAt(scene, "KJ", frame, "excited")}
              talk={visemeOpenness[kjViseme]}
              frame={frame}
              lookX={0.6}
            />
          </g>

          {/* Professor on Right */}
          <g transform="translate(1540, 980)">
            <Professor
              viseme={profViseme}
              expression={emotionAt(scene, "PROF", frame, "explaining")}
              talk={visemeOpenness[profViseme]}
              frame={frame}
              lookX={-0.6}
              prop={activeRule > 0 ? "pointer" : "none"}
            />
          </g>

          {/* B.O.T. Center */}
          <g transform="translate(960, 740)">
            <BOT
              viseme={botViseme}
              expression={isCensored ? "shocked" : emotionAt(scene, "BOT", frame, "happy")}
              talk={visemeOpenness[botViseme]}
              censor={isCensored}
              frame={frame}
            />
          </g>
        </svg>

        <Captions line={activeLine} />
      </Camera>
    </AbsoluteFill>
  );
};
