import React from "react";
import { interpolate, random, spring, useVideoConfig } from "remotion";
import { FONTS, INK, LINE, PALETTE, stroke } from "../theme";

/** Cartoon impact burst star (for crashes and hits) */
export const ImpactBurst: React.FC<{
  x: number;
  y: number;
  scale?: number;
  color?: string;
  points?: number;
}> = ({ x, y, scale = 1, color = PALETTE.yellow, points = 12 }) => {
  const pts: string[] = [];
  const outerR = 140 * scale;
  const innerR = 60 * scale;

  for (let i = 0; i < points * 2; i++) {
    const angle = (i * Math.PI) / points;
    const r = i % 2 === 0 ? outerR : innerR;
    pts.push(`${Math.cos(angle) * r},${Math.sin(angle) * r}`);
  }

  return (
    <g transform={`translate(${x},${y})`}>
      <polygon points={pts.join(" ")} fill={color} {...stroke(LINE)} />
    </g>
  );
};

/** Floating math equations floating across screen */
export const FloatingEquations: React.FC<{ frame: number; count?: number }> = ({
  frame,
  count = 8,
}) => {
  const equations = ["f'(x) = dx", "∫ 2x dx = x²", "2 + 2 = 4", "π ≈ 3.1415", "e^(iπ) + 1 = 0", "Δy / Δx", "lim x→0", "a² + b² = c²"];

  return (
    <g opacity={0.65}>
      {equations.slice(0, count).map((eq, i) => {
        const baseX = 150 + i * 220;
        const baseY = 160 + (i % 3) * 120;
        const driftX = Math.sin((frame + i * 20) / 25) * 35;
        const driftY = Math.cos((frame + i * 15) / 20) * 30;
        const rot = Math.sin((frame + i * 10) / 30) * 12;

        return (
          <g key={i} transform={`translate(${baseX + driftX}, ${baseY + driftY}) rotate(${rot})`}>
            <text
              fill={i % 2 === 0 ? PALETTE.yellow : PALETTE.cyan}
              fontSize={28}
              fontWeight={900}
              fontFamily={FONTS.title}
              stroke={INK}
              strokeWidth={3}
              paintOrder="stroke"
            >
              {eq}
            </text>
          </g>
        );
      })}
    </g>
  );
};

/** Cartoon giant red "WRONG!" stamp */
export const WrongStamp: React.FC<{
  x: number;
  y: number;
  frame: number;
  triggerFrame: number;
}> = ({ x, y, frame, triggerFrame }) => {
  const { fps } = useVideoConfig();
  if (frame < triggerFrame) return null;

  const spr = spring({
    frame: frame - triggerFrame,
    fps,
    config: { damping: 12, stiffness: 220 },
  });

  const scale = interpolate(spr, [0, 1], [3.2, 1]);
  const opacity = interpolate(spr, [0, 0.2, 1], [0, 1, 1]);

  return (
    <g transform={`translate(${x},${y}) scale(${scale}) rotate(-14)`} opacity={opacity}>
      <rect
        x={-160}
        y={-55}
        width={320}
        height={110}
        rx={18}
        fill="none"
        stroke={PALETTE.red}
        strokeWidth={14}
        strokeDasharray="24 8"
      />
      <text
        x={0}
        y={24}
        textAnchor="middle"
        fill={PALETTE.red}
        fontSize={72}
        fontWeight={900}
        fontFamily={FONTS.impact}
        letterSpacing={4}
      >
        WRONG!
      </text>
    </g>
  );
};

/** Confetti explosion */
export const ConfettiCannon: React.FC<{
  cx: number;
  cy: number;
  frame: number;
  triggerFrame: number;
  count?: number;
}> = ({ cx, cy, frame, triggerFrame, count = 35 }) => {
  if (frame < triggerFrame) return null;
  const elapsed = frame - triggerFrame;
  if (elapsed > 75) return null;

  const colors = [PALETTE.red, PALETTE.yellow, PALETTE.cyan, PALETTE.magenta, PALETTE.green, PALETTE.orange];

  return (
    <g>
      {Array.from({ length: count }).map((_, i) => {
        const angle = random(`cf-a-${i}`) * Math.PI * 2;
        const speed = 6 + random(`cf-s-${i}`) * 16;
        const dist = speed * elapsed - 0.25 * elapsed * elapsed * 0.3;
        const x = cx + Math.cos(angle) * dist;
        const y = cy + Math.sin(angle) * dist + elapsed * elapsed * 0.45; // gravity
        const rot = elapsed * 12 + i * 25;
        const color = colors[i % colors.length];

        return (
          <rect
            key={i}
            x={x}
            y={y}
            width={16}
            height={9}
            rx={2}
            fill={color}
            stroke={INK}
            strokeWidth={2}
            transform={`rotate(${rot} ${x} ${y})`}
          />
        );
      })}
    </g>
  );
};

/** Comic action text popup (e.g. "BOOOING!", "CRASH!") */
export const ActionText: React.FC<{
  text: string;
  x: number;
  y: number;
  frame: number;
  triggerFrame: number;
  duration?: number;
  color?: string;
}> = ({ text, x, y, frame, triggerFrame, duration = 30, color = PALETTE.yellow }) => {
  const { fps } = useVideoConfig();
  if (frame < triggerFrame || frame >= triggerFrame + duration) return null;

  const spr = spring({
    frame: frame - triggerFrame,
    fps,
    config: { damping: 10, stiffness: 200 },
  });

  const scale = interpolate(spr, [0, 1], [0.2, 1.2]);
  const rot = Math.sin((frame - triggerFrame) * 0.3) * 6 - 8;

  return (
    <g transform={`translate(${x},${y}) scale(${scale}) rotate(${rot})`}>
      <text
        x={0}
        y={0}
        textAnchor="middle"
        fill={color}
        fontSize={68}
        fontWeight={900}
        fontFamily={FONTS.impact}
        stroke={INK}
        strokeWidth={14}
        paintOrder="stroke"
        letterSpacing={2}
      >
        {text}
      </text>
    </g>
  );
};
