import React from "react";
import { Composition } from "remotion";
import { Main } from "./Main";
import { Scene1, Scene2, Scene3, Scene4, Scene5, Scene6 } from "./scenes";
import { getScene } from "./timeline";

export const RemotionRoot: React.FC = () => {
  const s1 = getScene("s1");
  const s2 = getScene("s2");
  const s3 = getScene("s3");
  const s4 = getScene("s4");
  const s5 = getScene("s5");
  const s6 = getScene("s6");

  return (
    <>
      {/* Complete 120-Second Animated Short (3,600 frames @ 30 FPS) */}
      <Composition
        id="Main"
        component={Main}
        durationInFrames={3600}
        fps={30}
        width={1920}
        height={1080}
      />

      {/* Per-Scene Preview Compositions */}
      <Composition
        id="Scene1"
        component={Scene1}
        durationInFrames={s1.endFrame - s1.startFrame}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="Scene2"
        component={Scene2}
        durationInFrames={s2.endFrame - s2.startFrame}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="Scene3"
        component={Scene3}
        durationInFrames={s3.endFrame - s3.startFrame}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="Scene4"
        component={Scene4}
        durationInFrames={s4.endFrame - s4.startFrame}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="Scene5"
        component={Scene5}
        durationInFrames={s5.endFrame - s5.startFrame}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="Scene6"
        component={Scene6}
        durationInFrames={s6.endFrame - s6.startFrame}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
