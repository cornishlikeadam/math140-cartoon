import React from "react";
import { AbsoluteFill, Audio, OffthreadVideo, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Classroom } from "../backgrounds/Classroom";
import { BOT, KJ, Professor } from "../characters";
import { Camera, Captions, ConfettiCannon, WrongStamp } from "../components";
import { SFX } from "../sfx";
import { PALETTE, stroke } from "../theme";
import { emotionAt, getLine, getScene, speakingLine, visemeAt, visemeOpenness } from "../timeline";

export const Scene4: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scene = getScene("s4");

  const kjSpeaking = speakingLine(scene, "KJ", frame);
  const botSpeaking = speakingLine(scene, "BOT", frame);
  const profSpeaking = speakingLine(scene, "PROF", frame);
  const activeLine = kjSpeaking || botSpeaking || profSpeaking;

  const kjViseme = visemeAt(scene, "KJ", frame, fps);
  const botViseme = visemeAt(scene, "BOT", frame, fps);
  const profViseme = visemeAt(scene, "PROF", frame, fps);

  // Line event points
  const l01 = getLine("s4_l01").localStart;
  const l02 = getLine("s4_l02").localStart;
  const l04 = getLine("s4_l04").localStart;
  const l05 = getLine("s4_l05").localStart;

  // Stamp trigger at end of line 4
  const stampFrame = l04 + getLine("s4_l04").durationFrames - 10;
  const showStamp = frame >= stampFrame;

  // Show number line correction check Manim video during l05
  const showNumberLine = frame >= l05;

  return (
    <AbsoluteFill>
      {/* Voice lines */}
      {scene.lines.map((l) => (
        <Sequence key={l.id} from={l.localStart} durationInFrames={l.durationFrames}>
          <Audio src={staticFile(l.audio)} />
        </Sequence>
      ))}

      {/* SFX: Record scratch at line 2 */}
      <Sequence from={l02} durationInFrames={25}>
        <Audio src={staticFile(SFX.scratch)} volume={0.9} />
      </Sequence>

      {/* SFX: Bonk / Stamp at stampFrame */}
      <Sequence from={stampFrame} durationInFrames={30}>
        <Audio src={staticFile(SFX.bonk)} volume={1.0} />
      </Sequence>

      <Camera
        x={0}
        y={0}
        zoom={frame < l02 ? 1.04 : 1.0}
        shake={stampFrame <= frame && frame < stampFrame + 25 ? 24 : 0}
        shakeFrame={stampFrame}
      >
        <Classroom crack={1} />

        {/* Confetti explosion at start on 2+2=5 */}
        <ConfettiCannon cx={960} cy={550} frame={frame} triggerFrame={l01} count={40} />

        <svg
          viewBox="0 0 1920 1080"
          style={{ position: "absolute", width: "100%", height: "100%", overflow: "visible" }}
        >
          {/* Manim video: Number Line Check 2+2=4 */}
          {showNumberLine && (
            <g transform="translate(960, 320)">
              <rect
                x={-340}
                y={-180}
                width={680}
                height={360}
                rx={20}
                fill="#1e293b"
                {...stroke(8)}
              />
              <foreignObject x={-320} y={-160} width={640} height={320}>
                <OffthreadVideo
                  src={staticFile("manim/number_line_check.mp4")}
                  style={{ width: "100%", height: "100%", objectFit: "contain" }}
                />
              </foreignObject>
            </g>
          )}

          {/* KJ on Left */}
          <g transform="translate(420, 960)">
            <KJ
              viseme={kjViseme}
              expression={emotionAt(scene, "KJ", frame, "surprised")}
              talk={visemeOpenness[kjViseme]}
              frame={frame}
              lookX={0.6}
            />
          </g>

          {/* Professor on Right */}
          <g transform="translate(1500, 980)">
            <Professor
              viseme={profViseme}
              expression={emotionAt(scene, "PROF", frame, "stern")}
              talk={visemeOpenness[profViseme]}
              frame={frame}
              lookX={-0.6}
              prop={frame < stampFrame + 25 ? "stamp" : "none"}
            />
          </g>

          {/* B.O.T. Center */}
          <g transform="translate(960, 680)">
            <BOT
              viseme={botViseme}
              expression={
                showStamp ? "sad" : frame >= l02 ? "shocked" : emotionAt(scene, "BOT", frame, "smug")
              }
              talk={visemeOpenness[botViseme]}
              frame={frame}
              screenContent={
                !showStamp && frame < l04 ? (
                  // Display 2 + 2 = 5 proudly on B.O.T.'s screen!
                  <g>
                    <text
                      x={0}
                      y={-6}
                      textAnchor="middle"
                      fill={PALETTE.yellow}
                      fontSize={26}
                      fontWeight={900}
                      fontFamily="Arial Black, Impact"
                    >
                      2 + 2 = 5
                    </text>
                    <text x={0} y={18} textAnchor="middle" fill={PALETTE.cyan} fontSize={14} fontWeight="bold">
                      SOLVED!
                    </text>
                  </g>
                ) : undefined
              }
            />
          </g>

          {/* Giant Red WRONG Stamp across BOT's screen */}
          <WrongStamp x={960} y={670} frame={frame} triggerFrame={stampFrame} />
        </svg>

        <Captions line={activeLine} />
      </Camera>
    </AbsoluteFill>
  );
};
