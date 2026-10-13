import React from "react";
import { INK, PALETTE, stroke } from "../theme";
import { Blush, Brow, Eye, Hand, Limb, Mouth, Sweat, exprFor } from "./parts";
import type { HumanProps } from "./KJ";

const VEST = PALETTE.purple;
const VEST_DARK = "#5a1fc0";
const SHIRT = PALETTE.white;
const PANTS = "#4b4f6e";
const HAIR = "#d9dce6";
const SKIN = PALETTE.skinProf;

export type ProfProp = "none" | "chalk" | "pointer" | "stamp" | "papers";

/** The Professor — tall, lanky, round glasses, sweater vest + bow tie. Origin = feet. ~700 px tall. */
export const Professor: React.FC<HumanProps & { prop?: ProfProp; stampText?: string }> = ({
  viseme = "X",
  expression = "neutral",
  blink = 0,
  lookX = 0,
  lookY = 0,
  left = { a: -8, b: -6 },
  right = { a: 8, b: 6 },
  talk = 0,
  headTilt = 0,
  frame = 0,
  prop = "none",
  stampText = "WRONG",
}) => {
  const e = exprFor(expression);
  const breathe = Math.sin(frame / 16) * 3;
  const bob = -talk * 5;
  // Natural cartoon periodic blink
  const autoBlink = (frame % 95 >= 92) || (frame % 150 >= 147) ? 0.9 : 0;
  const effectiveBlink = Math.max(blink, autoBlink);
  const lid = (i: 0 | 1) => Math.min(1, e.lid[i] + effectiveBlink);

  const propEl = (h: { x: number; y: number; angle: number }) => {
    const t = `translate(${h.x},${h.y}) rotate(${-h.angle + 180})`;
    if (prop === "chalk")
      return <rect transform={t} x={-6} y={10} width={12} height={40} rx={4} fill={PALETTE.white} {...stroke(4)} />;
    if (prop === "pointer")
      return (
        <g transform={t}>
          <line x1={0} y1={0} x2={0} y2={210} stroke={INK} strokeWidth={14} strokeLinecap="round" />
          <line x1={0} y1={0} x2={0} y2={210} stroke={PALETTE.wood} strokeWidth={7} strokeLinecap="round" />
          <circle cx={0} cy={212} r={9} fill={PALETTE.red} {...stroke(4)} />
        </g>
      );
    if (prop === "stamp")
      return (
        <g transform={t}>
          <rect x={-12} y={0} width={24} height={50} rx={10} fill={PALETTE.woodDark} {...stroke(5)} />
          <rect x={-55} y={50} width={110} height={34} rx={6} fill={PALETTE.wood} {...stroke(5)} />
          <rect x={-60} y={84} width={120} height={16} rx={3} fill={PALETTE.red} {...stroke(5)} />
          <text x={0} y={74} textAnchor="middle" fontSize={20} fontWeight={900} fill={INK} fontFamily="Arial Black, Arial">{stampText}</text>
        </g>
      );
    if (prop === "papers")
      return (
        <g transform={`translate(${h.x},${h.y}) rotate(-6)`}>
          {[0, 1, 2].map((i) => (
            <rect key={i} x={-55 + i * 5} y={-70 - i * 6} width={110} height={140} rx={4} fill={PALETTE.paper} {...stroke(5)} />
          ))}
          {[0, 1, 2, 3].map((i) => (
            <line key={i} x1={-35} x2={45} y1={-62 + i * 26} y2={-62 + i * 26} stroke="#9aa" strokeWidth={4} />
          ))}
          <path d="M 10 -20 l 30 30 m 0 -30 l -30 30" stroke={PALETTE.red} strokeWidth={8} strokeLinecap="round" />
        </g>
      );
    return null;
  };

  return (
    <g>
      <ellipse cx={0} cy={4} rx={100} ry={16} fill={INK} opacity={0.18} />
      {/* long legs */}
      <Limb sx={-26} sy={-250} len1={130} len2={115} pose={{ a: 3, b: -3 }} width={40} color={PANTS} />
      <Limb sx={26} sy={-250} len1={130} len2={115} pose={{ a: -3, b: 3 }} width={40} color={PANTS} />
      {/* shoes */}
      {[-1, 1].map((s) => (
        <path
          key={s}
          transform={`translate(${s * 34},-6) scale(${s},1)`}
          d="M -24 6 Q -26 -22 6 -20 Q 50 -18 54 6 Z"
          fill="#6b3a1f"
          {...stroke(6)}
        />
      ))}
      <g transform={`translate(0, ${breathe * 0.4})`}>
        {/* shirt sleeves visible at shoulders */}
        <path d="M -70 -440 Q -84 -350 -64 -250 Q 0 -232 64 -250 Q 84 -350 70 -440 Q 0 -462 -70 -440 Z" fill={SHIRT} {...stroke()} />
        {/* sweater vest */}
        <path d="M -62 -430 L -20 -430 L 0 -380 L 20 -430 L 62 -430 Q 74 -340 60 -252 Q 0 -236 -60 -252 Q -74 -340 -62 -430 Z" fill={VEST} {...stroke()} />
        {/* argyle diamonds */}
        {[
          [-30, -330],
          [30, -330],
          [0, -290],
        ].map(([x, y], i) => (
          <path key={i} d={`M ${x} ${y - 22} L ${x + 16} ${y} L ${x} ${y + 22} L ${x - 16} ${y} Z`} fill={VEST_DARK} />
        ))}
        {/* bow tie */}
        <g transform="translate(0,-428)">
          <path d="M 0 0 L -32 -16 L -32 16 Z M 0 0 L 32 -16 L 32 16 Z" fill={PALETTE.yellow} {...stroke(5)} />
          <circle r={9} fill={PALETTE.red} {...stroke(4)} />
          <circle cx={-20} cy={-2} r={3.5} fill={PALETTE.red} />
          <circle cx={20} cy={3} r={3.5} fill={PALETTE.red} />
        </g>
        {/* arms (white shirt sleeves) */}
        <Limb sx={-64} sy={-420} len1={120} len2={110} pose={left} width={34} color={SHIRT}>
          {(h) => (
            <g>
              <Hand x={h.x} y={h.y} angle={h.angle} size={30} color={SKIN} open={0.7} />
            </g>
          )}
        </Limb>
        <Limb sx={64} sy={-420} len1={120} len2={110} pose={right} width={34} color={SHIRT}>
          {(h) => (
            <g>
              {prop !== "papers" && propEl(h)}
              <Hand x={h.x} y={h.y} angle={h.angle} size={30} color={SKIN} open={prop === "none" ? 0.7 : 0} />
              {prop === "papers" && propEl(h)}
            </g>
          )}
        </Limb>
        {/* head */}
        <g transform={`translate(0, ${-460 + bob}) rotate(${headTilt + Math.sin(frame / 27) * 1.2}) translate(0, 460)`}>
          <rect x={-18} y={-470} width={36} height={40} fill={SKIN} {...stroke(6)} />
          {/* ears */}
          <ellipse cx={-76} cy={-545} rx={16} ry={22} fill={SKIN} {...stroke(6)} />
          <ellipse cx={76} cy={-545} rx={16} ry={22} fill={SKIN} {...stroke(6)} />
          {/* long oval head */}
          <path
            d="M -76 -560 Q -82 -660 0 -666 Q 82 -660 76 -560 Q 72 -486 36 -462 Q 0 -450 -36 -462 Q -72 -486 -76 -560 Z"
            fill={SKIN}
            {...stroke()}
          />
          {/* bald shine */}
          <path d="M -30 -646 Q 0 -656 26 -648" fill="none" stroke={PALETTE.white} strokeWidth={7} strokeLinecap="round" opacity={0.7} />
          {/* side hair tufts */}
          {[-1, 1].map((s) => (
            <path
              key={s}
              transform={`scale(${s},1)`}
              d="M -70 -600 Q -112 -612 -100 -580 Q -122 -566 -98 -548 Q -112 -526 -84 -520 Q -78 -560 -70 -600 Z"
              fill={HAIR}
              {...stroke(6)}
            />
          ))}
          {/* bushy brows */}
          <Brow x={-32} y={-606 + e.browY[0]} w={46} thick={15} tilt={e.browTilt[0]} side={-1} color={HAIR} />
          <Brow x={32} y={-606 + e.browY[1]} w={46} thick={15} tilt={e.browTilt[1]} side={1} color={HAIR} />
          {/* eyes behind glasses */}
          <Eye x={-31} y={-570} rx={16} ry={19} lid={lid(0)} lookX={lookX} lookY={lookY} pupil={e.pupil} skin={SKIN} lidTilt={-e.browTilt[0] * 0.5} />
          <Eye x={31} y={-570} rx={16} ry={19} lid={lid(1)} lookX={lookX} lookY={lookY} pupil={e.pupil} skin={SKIN} lidTilt={e.browTilt[1] * 0.5} />
          {/* round glasses */}
          <circle cx={-31} cy={-570} r={29} fill="#bfe9ff" fillOpacity={0.18} stroke={INK} strokeWidth={7} />
          <circle cx={31} cy={-570} r={29} fill="#bfe9ff" fillOpacity={0.18} stroke={INK} strokeWidth={7} />
          <path d="M -3 -572 Q 0 -578 3 -572" stroke={INK} strokeWidth={6} fill="none" />
          <path d="M -46 -584 L -36 -580" stroke={PALETTE.white} strokeWidth={4} strokeLinecap="round" />
          {/* big friendly nose */}
          <path d="M -4 -548 Q -22 -510 2 -506 Q 20 -506 12 -522" fill={PALETTE.skinProfShade} {...stroke(5)} />
          {e.blush && (
            <>
              <Blush x={-52} y={-516} r={13} />
              <Blush x={52} y={-516} r={13} />
            </>
          )}
          <Mouth x={0} y={-486} width={54} viseme={viseme} smile={e.smile} open={0.9} />
          {e.sweat && <Sweat x={70} y={-626} />}
        </g>
      </g>
    </g>
  );
};
