import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Lab } from "../backgrounds/Lab";
import { BOT, KJ, Professor } from "../characters";
import { Camera, Captions } from "../components";
import { SFX } from "../sfx";
import { FONTS, INK, PALETTE, stroke } from "../theme";
import { emotionAt, getLine, getScene, speakingLine, visemeAt, visemeOpenness } from "../timeline";

export const Scene5: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scene = getScene("s5");

  const kjSpeaking = speakingLine(scene, "KJ", frame);
  const botSpeaking = speakingLine(scene, "BOT", frame);
  const profSpeaking = speakingLine(scene, "PROF", frame);
  const activeLine = kjSpeaking || botSpeaking || profSpeaking;

  const kjViseme = visemeAt(scene, "KJ", frame, fps);
  const botViseme = visemeAt(scene, "BOT", frame, fps);
  const profViseme = visemeAt(scene, "PROF", frame, fps);

  const l05 = getLine("s5_l05").localStart;

  return (
    <AbsoluteFill>
      {/* Voice lines */}
      {scene.lines.map((l) => (
        <Sequence key={l.id} from={l.localStart} durationInFrames={l.durationFrames}>
          <Audio src={staticFile(l.audio)} />
        </Sequence>
      ))}

      {/* SFX: Lab compute sound */}
      <Sequence from={0} durationInFrames={60}>
        <Audio src={staticFile(SFX.compute)} volume={0.4} />
      </Sequence>
      {/* SFX: Tada / cheer on optional robot homework */}
      <Sequence from={l05} durationInFrames={40}>
        <Audio src={staticFile(SFX.tada)} volume={0.8} />
      </Sequence>

      <Camera x={0} y={0} zoom={1.0}>
        <Lab />

        <svg
          viewBox="0 0 1920 1080"
          style={{ position: "absolute", width: "100%", height: "100%", overflow: "visible" }}
        >
          {/* Giant "START AI TRIAL" Button on Pedestal in Center */}
          <g transform="translate(960, 840)">
            {/* Pedestal base */}
            <path d="M -90 120 L -60 0 L 60 0 L 90 120 Z" fill="#334155" {...stroke(7)} />
            <ellipse cx={0} cy={0} rx={90} ry={24} fill="#475569" {...stroke(7)} />

            {/* Giant Big Red Dome Button */}
            <g transform={`translate(0, ${Math.sin(frame / 6) * 3 - 10})`}>
              <path
                d="M -70 0 C -70 -65 70 -65 70 0 Z"
                fill={PALETTE.red}
                {...stroke(8)}
              />
              <ellipse cx={-25} cy={-28} rx={22} ry={12} fill="#ff8585" opacity={0.6} />
              <text
                x={0}
                y={-8}
                textAnchor="middle"
                fill={PALETTE.yellow}
                fontSize={18}
                fontWeight={900}
                fontFamily={FONTS.title}
                stroke={INK}
                strokeWidth={3}
                paintOrder="stroke"
              >
                START AI TRIAL
              </text>
            </g>
          </g>

          {/* KJ on Left */}
          <g transform="translate(420, 960)">
            <KJ
              viseme={kjViseme}
              expression={emotionAt(scene, "KJ", frame, "curious")}
              talk={visemeOpenness[kjViseme]}
              frame={frame}
              lookX={0.6}
            />
          </g>

          {/* Professor on Right */}
          <g transform="translate(1500, 980)">
            <Professor
              viseme={profViseme}
              expression={emotionAt(scene, "PROF", frame, "explaining")}
              talk={visemeOpenness[profViseme]}
              frame={frame}
              lookX={-0.6}
            />
          </g>

          {/* B.O.T. hovering above the button */}
          <g transform="translate(960, 560)">
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
