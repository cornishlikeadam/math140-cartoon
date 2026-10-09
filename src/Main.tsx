import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { Scene1, Scene2, Scene3, Scene4, Scene5, Scene6 } from "./scenes";
import { allLines } from "./timeline";

export const Main: React.FC = () => {
  const lines = allLines();

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
      <Sequence from={0} durationInFrames={450} name="Scene 1 - The Big Question">
        <Scene1 />
      </Sequence>

      <Sequence from={450} durationInFrames={900} name="Scene 2 - The Five Rules">
        <Scene2 />
      </Sequence>

      <Sequence from={1350} durationInFrames={600} name="Scene 3 - Where Students Struggle">
        <Scene3 />
      </Sequence>

      <Sequence from={1950} durationInFrames={600} name="Scene 4 - When AI Gets It Wrong">
        <Scene4 />
      </Sequence>

      <Sequence from={2550} durationInFrames={600} name="Scene 5 - The Experiment">
        <Scene5 />
      </Sequence>

      <Sequence from={3150} durationInFrames={450} name="Scene 6 - The Final Verdict">
        <Scene6 />
      </Sequence>
    </AbsoluteFill>
  );
};
