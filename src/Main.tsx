import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { Scene1, Scene2, Scene3, Scene4, Scene5, Scene6 } from "./scenes";
import { allLines, getScene } from "./timeline";

export const Main: React.FC = () => {
  const lines = allLines();
  const s1 = getScene("s1");
  const s2 = getScene("s2");
  const s3 = getScene("s3");
  const s4 = getScene("s4");
  const s5 = getScene("s5");
  const s6 = getScene("s6");

  // Audio volume ducking callback for background music
  const musicVolume = (frame: number) => {
    // Check if any dialogue line is playing at this frame (with 6 frame padding)
    const isSpeech = lines.some(
      (l) => frame >= l.startFrame - 6 && frame <= l.startFrame + l.durationFrames + 6,
    );
    return isSpeech ? 0.12 : 0.28;
  };

  return (
    <AbsoluteFill style={{ backgroundColor: "#0f172a" }}>
      {/* Background Theme Music Bed (120 seconds, ducks under speech) */}
      <Audio src={staticFile("audio/music/theme.wav")} volume={musicVolume} />

      {/* Six Gated Consecutive Scenes */}
      <Sequence from={s1.startFrame} durationInFrames={s1.endFrame - s1.startFrame} name="Scene 1 - The Big Question">
        <Scene1 />
      </Sequence>

      <Sequence from={s2.startFrame} durationInFrames={s2.endFrame - s2.startFrame} name="Scene 2 - The Five Rules">
        <Scene2 />
      </Sequence>

      <Sequence from={s3.startFrame} durationInFrames={s3.endFrame - s3.startFrame} name="Scene 3 - Where Students Struggle">
        <Scene3 />
      </Sequence>

      <Sequence from={s4.startFrame} durationInFrames={s4.endFrame - s4.startFrame} name="Scene 4 - When AI Gets It Wrong">
        <Scene4 />
      </Sequence>

      <Sequence from={s5.startFrame} durationInFrames={s5.endFrame - s5.startFrame} name="Scene 5 - The Experiment">
        <Scene5 />
      </Sequence>

      <Sequence from={s6.startFrame} durationInFrames={s6.endFrame - s6.startFrame} name="Scene 6 - The Final Verdict">
        <Scene6 />
      </Sequence>
    </AbsoluteFill>
  );
};
