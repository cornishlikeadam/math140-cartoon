import React from "react";
import { Composition } from "remotion";
import { Main } from "./Main";
import { Scene1, Scene2, Scene3, Scene4, Scene5, Scene6 } from "./scenes";

export const RemotionRoot: React.FC = () => {
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
        durationInFrames={450}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="Scene2"
        component={Scene2}
        durationInFrames={900}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="Scene3"
        component={Scene3}
        durationInFrames={600}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="Scene4"
        component={Scene4}
        durationInFrames={600}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="Scene5"
        component={Scene5}
        durationInFrames={600}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="Scene6"
        component={Scene6}
        durationInFrames={450}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
