import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";

export type CameraProps = {
  children: React.ReactNode;
  x?: number; // target pan X (px from center)
  y?: number; // target pan Y (px from center)
  zoom?: number; // scale (e.g. 1.0 to 1.35)
  shake?: number; // shake intensity (px)
  shakeFrame?: number; // frame at which shake begins
};

export const Camera: React.FC<CameraProps> = ({
  children,
  x = 0,
  y = 0,
  zoom = 1,
  shake = 0,
  shakeFrame = 0,
}) => {
  const frame = useCurrentFrame();

  // Screen shake decay calculation
  let shakeX = 0;
  let shakeY = 0;
  if (shake > 0 && frame >= shakeFrame) {
    const elapsed = frame - shakeFrame;
    const decay = Math.exp(-elapsed / 8);
    shakeX = Math.sin(elapsed * 2.8) * shake * decay;
    shakeY = Math.cos(elapsed * 3.4) * shake * decay;
  }

  return (
    <AbsoluteFill
      style={{
        transform: `translate(${-x + shakeX}px, ${-y + shakeY}px) scale(${zoom})`,
        transformOrigin: "960px 540px",
      }}
    >
      {children}
    </AbsoluteFill>
  );
};
