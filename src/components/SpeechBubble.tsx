import React from "react";
import { FONTS, INK, LINE, PALETTE, stroke } from "../theme";

export type SpeechBubbleProps = {
  text: string;
  x: number; // bubble center X
  y: number; // bubble center Y
  tailX: number; // point towards speaker mouth X
  tailY: number; // point towards speaker mouth Y
  width?: number;
  height?: number;
  fontSize?: number;
  shout?: boolean;
};

export const SpeechBubble: React.FC<SpeechBubbleProps> = ({
  text,
  x,
  y,
  tailX,
  tailY,
  width = 380,
  height = 140,
  fontSize = 24,
  shout = false,
}) => {
  const hw = width / 2;
  const hh = height / 2;

  // Tail geometry pointing toward speaker
  const tailBaseX = x + (tailX < x ? -hw * 0.4 : hw * 0.4);

  return (
    <g transform={`translate(${x},${y})`}>
      {/* Speech bubble tail */}
      <path
        d={`M ${tailBaseX - x - 20} ${hh - 4} L ${tailX - x} ${tailY - y} L ${tailBaseX - x + 20} ${hh - 4} Z`}
        fill={PALETTE.white}
        stroke={INK}
        strokeWidth={LINE}
        strokeLinejoin="round"
      />
      {/* Bubble body: puffy cloud/rounded box */}
      <rect
        x={-hw}
        y={-hh}
        width={width}
        height={height}
        rx={shout ? 12 : 36}
        fill={shout ? PALETTE.yellow : PALETTE.white}
        {...stroke(LINE)}
      />
      {/* Inset cover over tail seam */}
      <path
        d={`M ${tailBaseX - x - 18} ${hh - 6} L ${tailBaseX - x + 18} ${hh - 6}`}
        stroke={shout ? PALETTE.yellow : PALETTE.white}
        strokeWidth={LINE + 2}
      />
      {/* Text inside bubble */}
      <foreignObject x={-hw + 16} y={-hh + 14} width={width - 32} height={height - 28}>
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            fontFamily: shout ? FONTS.impact : FONTS.body,
            fontSize: `${fontSize}px`,
            fontWeight: shout ? 900 : 700,
            color: INK,
            lineHeight: 1.25,
            padding: "4px",
          }}
        >
          {text}
        </div>
      </foreignObject>
    </g>
  );
};
