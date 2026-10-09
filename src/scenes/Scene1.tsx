import React from "react";
import { AbsoluteFill, Audio, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Classroom } from "../backgrounds/Classroom";
import { BOT, KJ, Professor } from "../characters";
import { ActionText, Camera, Captions, FloatingEquations, TitleCard } from "../components";
import { SFX } from "../sfx";
import { emotionAt, getScene, speakingLine, visemeAt, visemeOpenness } from "../timeline";

export const Scene1: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scene = getScene("s1");

  // Determine active speaker / line for captions and mouth sync
  const kjSpeaking = speakingLine(scene, "KJ", frame);
  const botSpeaking = speakingLine(scene, "BOT", frame);
  const profSpeaking = speakingLine(scene, "PROF", frame);
  const activeLine = kjSpeaking || botSpeaking || profSpeaking;

  // Visemes and openness
  const kjViseme = visemeAt(scene, "KJ", frame, fps);
  const botViseme = visemeAt(scene, "BOT", frame, fps);
  const profViseme = visemeAt(scene, "PROF", frame, fps);

  // Crash timing: line 1 ends around frame 180-200. Robot crash sequence:
  const crashStart = 195;
  const crashImpact = 215;

  const botDrop = spring({
    frame: frame - crashStart,
    fps,
    config: { damping: 10, stiffness: 180 },
  });

  const botY = interpolate(botDrop, [0, 1], [-300, 680]);
  const crackAmt = interpolate(frame, [crashStart, crashImpact], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill>
      {/* Audio sequences for voice lines */}
      {scene.lines.map((l) => (
        <Sequence key={l.id} from={l.localStart} durationInFrames={l.durationFrames}>
          <Audio src={staticFile(l.audio)} />
        </Sequence>
      ))}

      {/* SFX: Crash & Boing */}
      <Sequence from={crashStart} durationInFrames={40}>
        <Audio src={staticFile(SFX.whoosh)} volume={0.8} />
      </Sequence>
      <Sequence from={crashImpact} durationInFrames={50}>
        <Audio src={staticFile(SFX.impact)} volume={1.0} />
        <Audio src={staticFile(SFX.boing)} volume={0.9} />
      </Sequence>

      {/* Camera with impact shake */}
      <Camera
        x={0}
        y={0}
        zoom={frame > 340 ? 1.05 : 1}
        shake={crashImpact <= frame && frame < crashImpact + 30 ? 28 : 0}
        shakeFrame={crashImpact}
      >
        {/* Background with dynamic ceiling crack */}
        <Classroom crack={crackAmt} />

        {/* Floating math equations */}
        <FloatingEquations frame={frame} />

        {/* Characters SVG layer */}
        <svg
          viewBox="0 0 1920 1080"
          style={{ position: "absolute", width: "100%", height: "100%", overflow: "visible" }}
        >
          {/* KJ on Left */}
          <g transform="translate(420, 960)">
            <KJ
              viseme={kjViseme}
              expression={emotionAt(scene, "KJ", frame, "curious")}
              talk={visemeOpenness[kjViseme]}
              frame={frame}
              lookX={frame > crashStart ? 0.8 : 0}
              lookY={frame > crashStart ? -0.4 : 0}
              right={frame > crashStart ? { a: 45, b: 60 } : { a: 30, b: 70 }}
            />
          </g>

          {/* Professor on Right */}
          <g transform="translate(1500, 980)">
            <Professor
              viseme={profViseme}
              expression={emotionAt(scene, "PROF", frame, "skeptical")}
              talk={visemeOpenness[profViseme]}
              frame={frame}
              lookX={frame > crashStart ? -0.7 : -0.3}
              lookY={frame > crashStart ? -0.3 : 0}
            />
          </g>

          {/* B.O.T. crashes through ceiling into center */}
          {frame >= crashStart && (
            <g transform={`translate(960, ${botY})`}>
              <BOT
                viseme={botViseme}
                expression={emotionAt(scene, "BOT", frame, "excited")}
                talk={visemeOpenness[botViseme]}
                frame={frame}
              />
            </g>
          )}

          {/* Crash Action Text */}
          <ActionText
            text="BOOOING!"
            x={1080}
            y={500}
            frame={frame}
            triggerFrame={crashImpact}
            duration={25}
          />
          <ActionText
            text="CRASH!"
            x={860}
            y={420}
            frame={frame}
            triggerFrame={crashImpact + 5}
            duration={25}
            color="#ff3b3b"
          />

          {/* Title Card at end of Scene 1 */}
          <TitleCard frame={frame} triggerFrame={345} duration={105} />
        </svg>

        {/* Subtitle Captions */}
        <Captions line={activeLine} />
      </Camera>
    </AbsoluteFill>
  );
};
