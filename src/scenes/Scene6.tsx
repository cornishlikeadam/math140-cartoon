import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Stage } from "../backgrounds/Stage";
import { BOT, KJ, Professor } from "../characters";
import { Camera, Captions, EndCard, Scoreboard } from "../components";
import { SFX } from "../sfx";
import { emotionAt, getLine, getScene, speakingLine, visemeAt, visemeOpenness } from "../timeline";

export const Scene6: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scene = getScene("s6");

  const kjSpeaking = speakingLine(scene, "KJ", frame);
  const botSpeaking = speakingLine(scene, "BOT", frame);
  const profSpeaking = speakingLine(scene, "PROF", frame);
  const activeLine = kjSpeaking || botSpeaking || profSpeaking;

  const kjViseme = visemeAt(scene, "KJ", frame, fps);
  const botViseme = visemeAt(scene, "BOT", frame, fps);
  const profViseme = visemeAt(scene, "PROF", frame, fps);

  const l02 = getLine("s6_l02").localStart;
  const l06 = getLine("s6_l06");
  const endCardTrigger = l06.localStart + l06.durationFrames + 10;

  return (
    <AbsoluteFill>
      {/* Voice lines */}
      {scene.lines.map((l) => (
        <Sequence key={l.id} from={l.localStart} durationInFrames={l.durationFrames}>
          <Audio src={staticFile(l.audio)} />
        </Sequence>
      ))}

      {/* SFX: Scoreboard fanfare */}
      <Sequence from={l02} durationInFrames={45}>
        <Audio src={staticFile(SFX.tada)} volume={0.8} />
      </Sequence>
      {/* SFX: Pop and splat at end card */}
      <Sequence from={endCardTrigger} durationInFrames={30}>
        <Audio src={staticFile(SFX.pop)} volume={1.0} />
      </Sequence>

      <Camera x={0} y={0} zoom={frame >= endCardTrigger ? 1.0 : 1.02}>
        <Stage hue="blue" />

        <svg
          viewBox="0 0 1920 1080"
          style={{ position: "absolute", width: "100%", height: "100%", overflow: "visible" }}
        >
          {/* Scoreboard in upper arena */}
          <Scoreboard frame={frame} triggerFrame={l02} />

          {/* Professor on Left */}
          <g transform="translate(460, 980)">
            <Professor
              viseme={profViseme}
              expression={emotionAt(scene, "PROF", frame, "happy")}
              talk={visemeOpenness[profViseme]}
              frame={frame}
              lookX={0.6}
            />
          </g>

          {/* KJ in Center facing camera */}
          <g transform="translate(960, 960)">
            <KJ
              viseme={kjViseme}
              expression={emotionAt(scene, "KJ", frame, "happy")}
              talk={visemeOpenness[kjViseme]}
              frame={frame}
              lookX={0}
              right={{ a: 20, b: 50 }}
            />
          </g>

          {/* B.O.T. on Right */}
          <g transform="translate(1460, 720)">
            <BOT
              viseme={botViseme}
              expression={emotionAt(scene, "BOT", frame, "excited")}
              talk={visemeOpenness[botViseme]}
              frame={frame}
            />
          </g>
        </svg>

        {/* Captions */}
        <Captions line={activeLine} />

        {/* Final End Card Overlay */}
        <EndCard frame={frame} triggerFrame={endCardTrigger} />
      </Camera>
    </AbsoluteFill>
  );
};
