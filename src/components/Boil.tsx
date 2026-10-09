import React from "react";
import { useCurrentFrame } from "remotion";

/**
 * Hand-drawn "line boil": an SVG turbulence displacement whose seed changes every
 * `hold` frames, so outlines wobble like redrawn cels (classic 2D TV look).
 * Render <BoilDefs/> once inside an <svg>, then put filter="url(#boil)" on groups.
 */
export const BoilDefs: React.FC<{ id?: string; scale?: number; hold?: number; freq?: number }> = ({
  id = "boil",
  scale = 3.2,
  hold = 3,
  freq = 0.022,
}) => {
  const frame = useCurrentFrame();
  const seed = Math.floor(frame / hold) % 7;
  return (
    <defs>
      <filter id={id} x="-10%" y="-10%" width="120%" height="120%">
        <feTurbulence type="fractalNoise" baseFrequency={freq} numOctaves={2} seed={seed} result="n" />
        <feDisplacementMap in="SourceGraphic" in2="n" scale={scale} xChannelSelector="R" yChannelSelector="G" />
      </filter>
    </defs>
  );
};

/** Convenience: a full-frame SVG with boil defs available. */
export const BoilSvg: React.FC<{
  children: React.ReactNode;
  width?: number;
  height?: number;
  viewBox?: string;
  style?: React.CSSProperties;
  boilScale?: number;
}> = ({ children, width = 1920, height = 1080, viewBox, style, boilScale }) => (
  <svg width={width} height={height} viewBox={viewBox ?? `0 0 ${width} ${height}`} style={{ overflow: "visible", ...style }}>
    <BoilDefs scale={boilScale} />
    <g filter="url(#boil)">{children}</g>
  </svg>
);
