// Small deterministic helpers for "hand-drawn" imperfect shapes used by the backgrounds.
import type React from "react";
import { random } from "remotion";

const j = (seed: string, amp: number) => (random(seed) - 0.5) * 2 * amp;

/** A rectangle whose corners and edges wobble slightly, like an inked cel drawing. */
export const wobblyRect = (
  x: number,
  y: number,
  w: number,
  h: number,
  seed: string,
  amp = 4,
): string => {
  const pts: [number, number][] = [
    [x + j(seed + "a", amp), y + j(seed + "b", amp)],
    [x + w + j(seed + "c", amp), y + j(seed + "d", amp)],
    [x + w + j(seed + "e", amp), y + h + j(seed + "f", amp)],
    [x + j(seed + "g", amp), y + h + j(seed + "h", amp)],
  ];
  return wobblyPoly(pts, seed, amp);
};

/** A closed polygon where each edge bows slightly (quadratic curve through a jittered midpoint). */
export const wobblyPoly = (pts: [number, number][], seed: string, amp = 4): string => {
  let d = `M ${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i];
    const b = pts[(i + 1) % pts.length];
    const mx = (a[0] + b[0]) / 2 + j(seed + "mx" + i, amp * 1.4);
    const my = (a[1] + b[1]) / 2 + j(seed + "my" + i, amp * 1.4);
    d += ` Q ${mx.toFixed(1)} ${my.toFixed(1)} ${b[0].toFixed(1)} ${b[1].toFixed(1)}`;
  }
  return d + " Z";
};

/** An open, slightly wavy line from (x1,y1) to (x2,y2). */
export const wobblyLine = (
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  seed: string,
  amp = 3,
): string => {
  const mx = (x1 + x2) / 2 + j(seed + "x", amp);
  const my = (y1 + y2) / 2 + j(seed + "y", amp);
  return `M ${x1.toFixed(1)} ${y1.toFixed(1)} Q ${mx.toFixed(1)} ${my.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`;
};

/** Deterministic jitter in [-amp, amp]. */
export const jitter = j;

/** Overscan frame used by every background svg. */
export const BG_VIEWBOX = "-160 -100 2240 1280";
export const BG_SVG_STYLE: React.CSSProperties = {
  position: "absolute",
  left: -160,
  top: -100,
  width: 2240,
  height: 1280,
};
