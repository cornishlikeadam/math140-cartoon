// Shared character rig parts: viseme mouths, eyes with lids & blinks, brows,
// rubber-hose limbs. All drawn in SVG with thick ink outlines.
import React, { useId } from "react";
import { INK, LINE, LINE_THIN, PALETTE } from "../theme";
import type { Viseme } from "../timeline";

export const useUid = (prefix: string) => `${prefix}${useId().replace(/[^a-zA-Z0-9]/g, "")}`;

// ---------------------------------------------------------------------------
// Expressions
// ---------------------------------------------------------------------------
export type Expr = {
  browY: [number, number]; // negative = raised (px)
  browTilt: [number, number]; // degrees; + = angry (inner end down), - = worried
  lid: [number, number]; // 0 = open, 1 = closed (top lid)
  smile: number; // -1 frown … 1 big grin
  pupil: number; // pupil scale
  sweat?: boolean;
  blush?: boolean;
  mouthBias?: number; // extra openness added while talking (excited characters)
};

export const EXPRESSIONS: Record<string, Expr> = {
  neutral: { browY: [0, 0], browTilt: [0, 0], lid: [0.1, 0.1], smile: 0.25, pupil: 1 },
  happy: { browY: [-6, -6], browTilt: [-4, -4], lid: [0.15, 0.15], smile: 0.9, pupil: 1.05, blush: true },
  excited: { browY: [-16, -16], browTilt: [-8, -8], lid: [0, 0], smile: 1, pupil: 1.2, mouthBias: 0.15 },
  curious: { browY: [-14, 0], browTilt: [-6, 4], lid: [0, 0.12], smile: 0.35, pupil: 1.1 },
  surprised: { browY: [-22, -22], browTilt: [-6, -6], lid: [0, 0], smile: 0, pupil: 0.75 },
  thinking: { browY: [-4, 6], browTilt: [6, -8], lid: [0.3, 0.2], smile: 0.1, pupil: 0.95 },
  skeptical: { browY: [-18, 6], browTilt: [-4, 12], lid: [0.15, 0.45], smile: -0.15, pupil: 0.9 },
  amused: { browY: [-10, 2], browTilt: [-6, 4], lid: [0.35, 0.35], smile: 0.65, pupil: 1 },
  stern: { browY: [6, 6], browTilt: [16, 16], lid: [0.3, 0.3], smile: -0.45, pupil: 0.85 },
  explaining: { browY: [-8, -8], browTilt: [-2, -2], lid: [0.1, 0.1], smile: 0.35, pupil: 1 },
  worried: { browY: [-8, -8], browTilt: [-16, -16], lid: [0.1, 0.1], smile: -0.5, pupil: 0.8, sweat: true },
};

export const exprFor = (name?: string): Expr => EXPRESSIONS[name ?? "neutral"] ?? EXPRESSIONS.neutral;

// ---------------------------------------------------------------------------
// Mouth (Rhubarb Preston-Blair set A–H + X)
// ---------------------------------------------------------------------------
type MouthShape = { w: number; h: number; teethTop: boolean; teethBot: boolean; tongue: number; round: number };
const MOUTHS: Record<Viseme, MouthShape> = {
  X: { w: 0.8, h: 0, teethTop: false, teethBot: false, tongue: 0, round: 0 }, // rest
  A: { w: 0.7, h: 0, teethTop: false, teethBot: false, tongue: 0, round: 0 }, // M B P (pressed)
  B: { w: 0.85, h: 0.28, teethTop: true, teethBot: true, tongue: 0, round: 0 }, // K S T (clenched)
  C: { w: 0.95, h: 0.6, teethTop: true, teethBot: false, tongue: 0.4, round: 0.1 }, // EH AE
  D: { w: 1.05, h: 1.0, teethTop: true, teethBot: false, tongue: 0.5, round: 0.15 }, // AA
  E: { w: 0.7, h: 0.6, teethTop: false, teethBot: false, tongue: 0.3, round: 0.6 }, // AO ER
  F: { w: 0.42, h: 0.42, teethTop: false, teethBot: false, tongue: 0.2, round: 1 }, // UW OW W
  G: { w: 0.8, h: 0.3, teethTop: true, teethBot: false, tongue: 0, round: 0 }, // F V
  H: { w: 0.85, h: 0.6, teethTop: true, teethBot: false, tongue: 0.9, round: 0.1 }, // L
};

export const Mouth: React.FC<{
  x: number;
  y: number;
  width: number;
  viseme: Viseme;
  smile: number;
  open?: number; // extra openness multiplier
  lipColor?: string;
}> = ({ x, y, width, viseme, smile, open = 1, lipColor = INK }) => {
  const id = useUid("m");
  const m = MOUTHS[viseme] ?? MOUTHS.X;
  const hw = (width * m.w) / 2;
  const maxH = width * 0.62;
  const h = Math.min(maxH * 1.15, maxH * m.h * open);
  const corner = -smile * width * 0.16; // corners lift when smiling
  if (h < 2) {
    // Closed mouth: a single curved line, with dimples for big smiles.
    const sag = smile * width * 0.22;
    const press = viseme === "A" ? 0.6 : 1;
    return (
      <g transform={`translate(${x},${y})`}>
        <path
          d={`M ${-hw} ${corner} Q 0 ${sag * press + (viseme === "A" ? 3 : 0)} ${hw} ${corner}`}
          fill="none"
          stroke={lipColor}
          strokeWidth={LINE_THIN + 1}
          strokeLinecap="round"
        />
        {smile > 0.6 && (
          <>
            <path d={`M ${-hw - 6} ${corner - 6} q 4 6 0 12`} fill="none" stroke={INK} strokeWidth={3.5} strokeLinecap="round" />
            <path d={`M ${hw + 6} ${corner - 6} q -4 6 0 12`} fill="none" stroke={INK} strokeWidth={3.5} strokeLinecap="round" />
          </>
        )}
      </g>
    );
  }
  // Open mouth: upper lip curve + lower jaw curve; rounder shapes pinch the corners.
  const r = m.round;
  const topY = -h * 0.18 + corner * 0.3 - smile * 4;
  const botY = h * (1 - 0.1 * r) + Math.max(0, smile) * h * 0.25;
  const cx = hw * (1 - 0.25 * r);
  const d =
    `M ${-hw} ${corner} ` +
    `C ${-cx} ${topY - 4 * r}, ${cx} ${topY - 4 * r}, ${hw} ${corner} ` +
    `C ${hw * (0.95 - 0.1 * r)} ${botY * 0.9}, ${-hw * (0.95 - 0.1 * r)} ${botY * 0.9}, ${-hw} ${corner} Z`;
  return (
    <g transform={`translate(${x},${y})`}>
      <defs>
        <clipPath id={id}>
          <path d={d} />
        </clipPath>
      </defs>
      <path d={d} fill="#5b1530" />
      <g clipPath={`url(#${id})`}>
        {m.teethTop && <rect x={-hw} y={topY - 10} width={hw * 2} height={Math.min(14, h * 0.45) + 10} rx={4} fill={PALETTE.white} />}
        {m.teethBot && <rect x={-hw} y={botY * 0.75 - 4} width={hw * 2} height={20} fill={PALETTE.white} />}
        {m.tongue > 0 && (
          <ellipse cx={0} cy={botY * (1.05 - 0.45 * (m.tongue > 0.8 ? 1 : 0))} rx={hw * 0.65} ry={h * 0.45} fill="#ff6b8a" />
        )}
      </g>
      <path d={d} fill="none" stroke={lipColor} strokeWidth={LINE_THIN} strokeLinejoin="round" />
    </g>
  );
};

// ---------------------------------------------------------------------------
// Eye with pupil look-at, top lid, blink
// ---------------------------------------------------------------------------
export const Eye: React.FC<{
  x: number;
  y: number;
  rx: number;
  ry: number;
  lid: number; // 0..1
  lookX: number; // -1..1
  lookY: number; // -1..1
  pupil: number;
  skin: string;
  pupilColor?: string;
  lidTilt?: number; // degrees, for angry/sad lids
}> = ({ x, y, rx, ry, lid, lookX, lookY, pupil, skin, pupilColor = INK, lidTilt = 0 }) => {
  const id = useUid("e");
  const pr = Math.min(rx, ry) * 0.48 * pupil;
  const px = lookX * (rx - pr) * 0.75;
  const py = lookY * (ry - pr) * 0.6;
  const lidH = Math.max(0, Math.min(1, lid)) * ry * 2.1;
  return (
    <g transform={`translate(${x},${y})`}>
      <defs>
        <clipPath id={id}>
          <ellipse cx={0} cy={0} rx={rx} ry={ry} />
        </clipPath>
      </defs>
      <ellipse cx={0} cy={0} rx={rx} ry={ry} fill={PALETTE.white} />
      <g clipPath={`url(#${id})`}>
        <circle cx={px} cy={py} r={pr} fill={pupilColor} />
        <circle cx={px + pr * 0.35} cy={py - pr * 0.4} r={pr * 0.32} fill={PALETTE.white} />
        {lidH > 0.5 && (
          <g transform={`rotate(${lidTilt})`}>
            <rect x={-rx * 1.6} y={-ry * 1.3} width={rx * 3.2} height={lidH + ry * 0.3} fill={skin} />
            <line x1={-rx * 1.6} x2={rx * 1.6} y1={-ry * 1.0 + lidH} y2={-ry * 1.0 + lidH} stroke={INK} strokeWidth={LINE_THIN} />
          </g>
        )}
      </g>
      <ellipse cx={0} cy={0} rx={rx} ry={ry} fill="none" stroke={INK} strokeWidth={LINE_THIN} />
    </g>
  );
};

// ---------------------------------------------------------------------------
// Brow
// ---------------------------------------------------------------------------
export const Brow: React.FC<{
  x: number;
  y: number;
  w: number;
  thick: number;
  tilt: number; // degrees (+ angry)
  side: -1 | 1; // -1 = character's right (screen left)
  color: string;
}> = ({ x, y, w, thick, tilt, side, color }) => (
  <g transform={`translate(${x},${y}) rotate(${tilt * -side})`}>
    <path
      d={`M ${-w / 2} ${thick * 0.3} Q 0 ${-thick * 0.9} ${w / 2} ${thick * 0.3}`}
      fill="none"
      stroke={INK}
      strokeWidth={thick + LINE_THIN}
      strokeLinecap="round"
    />
    <path
      d={`M ${-w / 2} ${thick * 0.3} Q 0 ${-thick * 0.9} ${w / 2} ${thick * 0.3}`}
      fill="none"
      stroke={color}
      strokeWidth={thick}
      strokeLinecap="round"
    />
  </g>
);

// ---------------------------------------------------------------------------
// Rubber-hose limb: shoulder → (bent) → hand, outlined by double stroke.
// ---------------------------------------------------------------------------
export type LimbPose = { a: number; b: number }; // a: upper angle (deg, 0 = straight down, + = toward screen-right), b: elbow bend (deg)

export const limbEnd = (sx: number, sy: number, len1: number, len2: number, pose: LimbPose) => {
  const r1 = (pose.a * Math.PI) / 180;
  const ex = sx + Math.sin(r1) * len1;
  const ey = sy + Math.cos(r1) * len1;
  const r2 = ((pose.a + pose.b) * Math.PI) / 180;
  return { ex, ey, hx: ex + Math.sin(r2) * len2, hy: ey + Math.cos(r2) * len2, angle: pose.a + pose.b };
};

export const Limb: React.FC<{
  sx: number;
  sy: number;
  len1: number;
  len2: number;
  pose: LimbPose;
  width: number;
  color: string;
  children?: (hand: { x: number; y: number; angle: number }) => React.ReactNode;
}> = ({ sx, sy, len1, len2, pose, width, color, children }) => {
  const { ex, ey, hx, hy, angle } = limbEnd(sx, sy, len1, len2, pose);
  // Quadratic through the elbow gives the bendy rubber-hose look.
  const cx = 2 * ex - (sx + hx) / 2;
  const cy = 2 * ey - (sy + hy) / 2;
  const d = `M ${sx} ${sy} Q ${cx} ${cy} ${hx} ${hy}`;
  return (
    <g>
      <path d={d} fill="none" stroke={INK} strokeWidth={width + LINE * 2} strokeLinecap="round" />
      <path d={d} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" />
      {children?.({ x: hx, y: hy, angle })}
    </g>
  );
};

/** Cartoon 4-finger glove / mitten hand. `open` 0 = fist, 1 = open palm. */
export const Hand: React.FC<{
  x: number;
  y: number;
  angle: number;
  size?: number;
  color?: string;
  open?: number;
  point?: boolean;
  flip?: boolean;
}> = ({ x, y, angle, size = 30, color = PALETTE.white, open = 0.5, point = false, flip = false }) => {
  const s = size;
  return (
    <g transform={`translate(${x},${y}) rotate(${-angle}) scale(${flip ? -1 : 1},1)`}>
      {point ? (
        <>
          <rect x={-s * 0.18} y={s * 0.2} width={s * 0.36} height={s * 1.15} rx={s * 0.18} fill={color} stroke={INK} strokeWidth={LINE_THIN} />
          <circle cx={0} cy={0} r={s * 0.62} fill={color} stroke={INK} strokeWidth={LINE_THIN} />
          <ellipse cx={s * 0.5} cy={-s * 0.05} rx={s * 0.2} ry={s * 0.32} fill={color} stroke={INK} strokeWidth={LINE_THIN} />
        </>
      ) : (
        <>
          {[-0.45, -0.15, 0.15, 0.45].map((fx, i) => (
            <rect
              key={i}
              x={fx * s - s * 0.15}
              y={s * 0.1}
              width={s * 0.3}
              height={s * (0.45 + 0.6 * open)}
              rx={s * 0.15}
              fill={color}
              stroke={INK}
              strokeWidth={LINE_THIN}
            />
          ))}
          <circle cx={0} cy={0} r={s * 0.62} fill={color} stroke={INK} strokeWidth={LINE_THIN} />
          <ellipse cx={s * 0.62} cy={-s * 0.05} rx={s * 0.2} ry={s * 0.34} transform={`rotate(-25 ${s * 0.62} 0)`} fill={color} stroke={INK} strokeWidth={LINE_THIN} />
        </>
      )}
    </g>
  );
};

/** Sweat drop + blush overlays. */
export const Sweat: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <path
    d={`M ${x} ${y} q 12 18 0 28 q -12 -10 0 -28 Z`}
    fill={PALETTE.cyan}
    stroke={INK}
    strokeWidth={4}
    strokeLinejoin="round"
  />
);
export const Blush: React.FC<{ x: number; y: number; r?: number }> = ({ x, y, r = 16 }) => (
  <ellipse cx={x} cy={y} rx={r} ry={r * 0.55} fill={PALETTE.pink} opacity={0.45} />
);
