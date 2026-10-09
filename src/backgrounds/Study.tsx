import React from "react";
import { AbsoluteFill } from "remotion";
import { BoilDefs } from "../components/Boil";
import { FONTS, INK, PALETTE, stroke } from "../theme";
import { BG_SVG_STYLE, BG_VIEWBOX } from "./sketch";

const HORIZON = 790;

export const Study: React.FC = () => {
  return (
    <AbsoluteFill>
      <svg viewBox={BG_VIEWBOX} style={BG_SVG_STYLE}>
        <BoilDefs id="boil-study" />

        <defs>
          <linearGradient id="study-wall" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#475569" />
            <stop offset="100%" stopColor="#334155" />
          </linearGradient>
          <linearGradient id="study-floor" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={PALETTE.wood} />
            <stop offset="100%" stopColor={PALETTE.woodDark} />
          </linearGradient>
          <radialGradient id="lamp-glow" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor={PALETTE.yellow} stopOpacity="0.4" />
            <stop offset="100%" stopColor={PALETTE.yellow} stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Base Wall & Floor */}
        <rect x="-160" y="-100" width="2240" height={HORIZON + 100} fill="url(#study-wall)" />
        <rect x="-160" y={HORIZON} width="2240" height={1280 - HORIZON} fill="url(#study-floor)" />

        {/* Baseboard */}
        <rect x="-160" y={HORIZON - 20} width="2240" height="28" fill={PALETTE.woodDark} />
        <line x1="-160" y1={HORIZON - 20} x2="2080" y2={HORIZON - 20} stroke={INK} strokeWidth={6} />
        <line x1="-160" y1={HORIZON + 8} x2="2080" y2={HORIZON + 8} stroke={INK} strokeWidth={6} />

        {/* Floor Planks */}
        {[-100, 200, 500, 800, 1100, 1400, 1700, 2000].map((px, i) => (
          <line
            key={i}
            x1={px}
            y1={HORIZON + 8}
            x2={px + 80}
            y2="1180"
            stroke={PALETTE.woodDark}
            strokeWidth={4}
            opacity={0.6}
          />
        ))}

        {/* Filtered Art */}
        <g filter="url(#boil-study)">
          {/* Bookshelf on the Left */}
          <g transform="translate(60, 80)">
            <rect x="0" y="0" width="460" height="680" rx="12" fill="#1e293b" {...stroke()} />
            {/* Shelves */}
            {[180, 360, 540].map((sy, i) => (
              <g key={i}>
                <rect x="10" y={sy} width="440" height="24" fill={PALETTE.wood} {...stroke(5)} />
                {/* Books */}
                {Array.from({ length: 14 }).map((_, bi) => {
                  const colors = [
                    PALETTE.red,
                    PALETTE.blue,
                    PALETTE.yellow,
                    PALETTE.green,
                    PALETTE.purple,
                    PALETTE.orange,
                  ];
                  const c = colors[(bi * 3 + i * 2) % colors.length];
                  const bh = 100 + ((bi * 17) % 45);
                  const bw = 24 + ((bi * 11) % 12);
                  const bx = 20 + bi * 29;
                  return (
                    <rect
                      key={bi}
                      x={bx}
                      y={sy - bh}
                      width={bw}
                      height={bh}
                      rx="4"
                      fill={c}
                      {...stroke(4)}
                    />
                  );
                })}
              </g>
            ))}
          </g>

          {/* Window in Center Wall */}
          <g transform="translate(740, 120)">
            {/* Window Frame */}
            <rect x="0" y="0" width="440" height="380" rx="16" fill="#0f172a" {...stroke(8)} />
            {/* Night Sky & Moon */}
            <circle cx="340" cy="110" r="45" fill={PALETTE.paper} />
            <circle cx="360" cy="100" r="42" fill="#0f172a" />
            {/* Stars */}
            {[
              [80, 80],
              [160, 140],
              [240, 70],
              [110, 220],
              [280, 260],
            ].map(([sx, sy], si) => (
              <circle key={si} cx={sx} cy={sy} r="3" fill={PALETTE.white} />
            ))}
            {/* Window panes divider */}
            <line x1="220" y1="0" x2="220" y2="380" stroke={INK} strokeWidth={8} />
            <line x1="0" y1="190" x2="440" y2="190" stroke={INK} strokeWidth={8} />
          </g>

          {/* Math Poster on the Wall */}
          <g transform="translate(1320, 140) rotate(2)">
            <rect x="0" y="0" width="240" height="320" rx="6" fill={PALETTE.paper} {...stroke()} />
            <text
              x="120"
              y="60"
              textAnchor="middle"
              fill={PALETTE.purple}
              fontSize="34"
              fontWeight="900"
              fontFamily={FONTS.title}
            >
              MATH 140
            </text>
            <path d="M 40 160 L 200 160 L 200 100 Z" fill={PALETTE.yellow} {...stroke(5)} />
            <text
              x="120"
              y="220"
              textAnchor="middle"
              fill={INK}
              fontSize="24"
              fontWeight="bold"
              fontFamily={FONTS.body}
            >
              a² + b² = c²
            </text>
            <text
              x="120"
              y="270"
              textAnchor="middle"
              fill={PALETTE.red}
              fontSize="22"
              fontWeight="bold"
              fontFamily={FONTS.body}
            >
              THINK FIRST!
            </text>
          </g>

          {/* Desk on Right */}
          <g transform="translate(1420, 620)">
            {/* Desk Top */}
            <rect x="0" y="0" width="540" height="45" rx="8" fill={PALETTE.wood} {...stroke(7)} />
            {/* Desk Legs */}
            <rect x="40" y="45" width="30" height="200" fill={PALETTE.woodDark} {...stroke(5)} />
            <rect x="440" y="45" width="30" height="200" fill={PALETTE.woodDark} {...stroke(5)} />

            {/* Lamp on Desk */}
            <g transform="translate(120, -180)">
              {/* Lamp Glow behind */}
              <circle cx="80" cy="50" r="220" fill="url(#lamp-glow)" />
              {/* Lamp base */}
              <ellipse cx="60" cy="180" rx="40" ry="12" fill={PALETTE.yellow} {...stroke(5)} />
              {/* Lamp neck */}
              <path d="M 60 170 Q 20 80 70 40" fill="none" stroke={INK} strokeWidth={8} strokeLinecap="round" />
              {/* Lamp shade */}
              <path d="M 40 50 L 110 30 L 130 90 L 30 100 Z" fill={PALETTE.orange} {...stroke(6)} />
            </g>

            {/* Stack of Papers */}
            <g transform="translate(290, -40)">
              <rect x="0" y="15" width="140" height="25" rx="4" fill={PALETTE.white} {...stroke(4)} />
              <rect x="10" y="5" width="135" height="25" rx="4" fill={PALETTE.paper} {...stroke(4)} />
              <text x="75" y="24" textAnchor="middle" fontSize="16" fontWeight="bold" fill={PALETTE.red}>
                QUIZ 1
              </text>
            </g>
          </g>
        </g>
      </svg>
    </AbsoluteFill>
  );
};
