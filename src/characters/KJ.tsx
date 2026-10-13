import React from "react";
import { INK, LINE, PALETTE, stroke } from "../theme";
import type { Viseme } from "../timeline";
import { Blush, Brow, Eye, Hand, Limb, LimbPose, Mouth, Sweat, exprFor } from "./parts";

export type HumanProps = {
  viseme?: Viseme;
  expression?: string;
  blink?: number; // 0..1 extra lid closure
  lookX?: number;
  lookY?: number;
  left?: LimbPose; // screen-left arm
  right?: LimbPose; // screen-right arm
  talk?: number; // 0..1 openness (drives head bob)
  headTilt?: number; // degrees
  frame?: number; // for idle motion
};

const HOODIE = PALETTE.orange;
const HOODIE_DARK = "#d96a00";
const HAIR = "#2a1838";
const JEANS = "#2f5fd0";
const SKIN = PALETTE.skinKJ;

/** KJ — energetic college student & interviewer. Origin = between the feet. ~600 px tall. */
export const KJ: React.FC<HumanProps & { mic?: "hand" | "none"; micToMouth?: boolean }> = ({
  viseme = "X",
  expression = "neutral",
  blink = 0,
  lookX = 0,
  lookY = 0,
  left = { a: -12, b: -10 },
  right = { a: 30, b: 70 },
  talk = 0,
  headTilt = 0,
  frame = 0,
  mic = "hand",
}) => {
  const e = exprFor(expression);
  const breathe = Math.sin(frame / 14) * 3;
  const bob = -talk * 6;
  // Natural cartoon periodic blink (spontaneous blinks every ~85-140 frames)
  const autoBlink = (frame % 85 >= 82) || (frame % 140 >= 137) ? 0.9 : 0;
  const effectiveBlink = Math.max(blink, autoBlink);
  const lid = (i: 0 | 1) => Math.min(1, e.lid[i] + effectiveBlink);
  return (
    <g>
      {/* shadow */}
      <ellipse cx={0} cy={4} rx={95} ry={16} fill={INK} opacity={0.18} />
      {/* legs */}
      <Limb sx={-30} sy={-180} len1={90} len2={85} pose={{ a: 4, b: -4 }} width={44} color={JEANS} />
      <Limb sx={30} sy={-180} len1={90} len2={85} pose={{ a: -4, b: 4 }} width={44} color={JEANS} />
      {/* sneakers */}
      {[-1, 1].map((s) => (
        <g key={s} transform={`translate(${s * 40},-12)`}>
          <path d={`M ${-40 * (s > 0 ? 0.6 : 1)} 10 Q ${-38 * (s > 0 ? 0.6 : 1)} -24 0 -22 Q 44 -20 ${44 * (s > 0 ? 1 : 0.6)} 10 Z`} transform={`scale(${s},1)`} fill={PALETTE.white} {...stroke(6)} />
          <path d="M -30 8 L 40 8" transform={`scale(${s},1)`} stroke={PALETTE.red} strokeWidth={8} strokeLinecap="round" />
        </g>
      ))}
      <g transform={`translate(0, ${breathe * 0.4})`}>
        {/* torso / hoodie */}
        <path
          d="M -82 -175 Q -96 -260 -78 -336 Q 0 -362 78 -336 Q 96 -260 82 -175 Q 0 -160 -82 -175 Z"
          fill={HOODIE}
          {...stroke()}
        />
        <path d="M -70 -200 Q 0 -186 70 -200" fill="none" stroke={HOODIE_DARK} strokeWidth={10} strokeLinecap="round" />
        {/* hood drawstrings */}
        <path d="M -22 -330 L -26 -280 M 22 -330 L 26 -280" stroke={PALETTE.white} strokeWidth={6} strokeLinecap="round" />
        {/* 140 patch */}
        <g transform="translate(36,-262) rotate(-8)">
          <circle r={26} fill={PALETTE.cyan} {...stroke(5)} />
          <text y={9} textAnchor="middle" fontSize={24} fontWeight={900} fill={INK} fontFamily="Arial Rounded MT Bold, Arial">140</text>
        </g>
        {/* arms */}
        <Limb sx={-70} sy={-320} len1={95} len2={90} pose={left} width={38} color={HOODIE}>
          {(h) => <Hand x={h.x} y={h.y} angle={h.angle} size={30} color={SKIN} open={0.6} />}
        </Limb>
        <Limb sx={70} sy={-320} len1={95} len2={90} pose={right} width={38} color={HOODIE}>
          {(h) => (
            <g>
              {mic === "hand" && (
                <g transform={`translate(${h.x},${h.y}) rotate(${-h.angle + 180})`}>
                  <rect x={-9} y={-10} width={18} height={70} rx={8} fill="#333" {...stroke(5)} />
                  <rect x={-17} y={18} width={34} height={22} rx={4} fill={PALETTE.red} {...stroke(4)} />
                  <text x={0} y={35} textAnchor="middle" fontSize={14} fontWeight={900} fill={PALETTE.white} fontFamily="Arial">140</text>
                  <circle cx={0} cy={-26} r={22} fill="#b9bfd0" {...stroke(5)} />
                  <path d="M -14 -36 L 14 -16 M -14 -16 L 14 -36 M -18 -26 L 18 -26" stroke="#7a8094" strokeWidth={3} />
                </g>
              )}
              <Hand x={h.x} y={h.y} angle={h.angle} size={30} color={SKIN} open={mic === "hand" ? 0 : 0.6} />
            </g>
          )}
        </Limb>
        {/* head */}
        <g transform={`translate(0, ${-372 + bob}) rotate(${headTilt + Math.sin(frame / 23) * 1.5}) translate(0, ${372})`}>
          <rect x={-22} y={-372} width={44} height={36} fill={SKIN} {...stroke(6)} />
          {/* hood behind neck */}
          <path d="M -60 -345 Q 0 -310 60 -345" fill="none" stroke={HOODIE_DARK} strokeWidth={16} strokeLinecap="round" />
          {/* ears */}
          <circle cx={-90} cy={-452} r={20} fill={SKIN} {...stroke(6)} />
          <circle cx={90} cy={-452} r={20} fill={SKIN} {...stroke(6)} />
          {/* face */}
          <path
            d="M -88 -470 Q -92 -540 0 -548 Q 92 -540 88 -470 Q 86 -396 40 -372 Q 0 -360 -40 -372 Q -86 -396 -88 -470 Z"
            fill={SKIN}
            {...stroke()}
          />
          {/* hair: spiky top */}
          <path
            d="M -96 -470 Q -110 -540 -70 -572 L -60 -610 L -30 -585 L -8 -630 L 18 -588 L 52 -620 L 58 -576 Q 108 -548 96 -470 Q 84 -520 40 -526 Q -10 -505 -60 -528 Q -88 -515 -96 -470 Z"
            fill={HAIR}
            {...stroke()}
          />
          <path d="M -20 -600 Q -6 -570 10 -560" fill="none" stroke="#5b3a7a" strokeWidth={7} strokeLinecap="round" />
          {/* brows */}
          <Brow x={-36} y={-506 + e.browY[0]} w={42} thick={11} tilt={e.browTilt[0]} side={-1} color={HAIR} />
          <Brow x={36} y={-506 + e.browY[1]} w={42} thick={11} tilt={e.browTilt[1]} side={1} color={HAIR} />
          {/* eyes */}
          <Eye x={-35} y={-466} rx={23} ry={29} lid={lid(0)} lookX={lookX} lookY={lookY} pupil={e.pupil} skin={SKIN} lidTilt={-e.browTilt[0] * 0.5} />
          <Eye x={35} y={-466} rx={23} ry={29} lid={lid(1)} lookX={lookX} lookY={lookY} pupil={e.pupil} skin={SKIN} lidTilt={e.browTilt[1] * 0.5} />
          {/* nose */}
          <path d="M 2 -446 Q 14 -428 -2 -422" fill="none" stroke={INK} strokeWidth={5} strokeLinecap="round" />
          {e.blush && (
            <>
              <Blush x={-58} y={-420} />
              <Blush x={58} y={-420} />
            </>
          )}
          <Mouth x={0} y={-402} width={60} viseme={viseme} smile={e.smile} open={1 + (e.mouthBias ?? 0)} />
          {e.sweat && <Sweat x={84} y={-520} />}
        </g>
      </g>
    </g>
  );
};

export const KJ_LINE = LINE;
