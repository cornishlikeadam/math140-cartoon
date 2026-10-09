import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { BoilDefs } from "../components/Boil";
import { FONTS, PALETTE, stroke } from "../theme";
import { BG_SVG_STYLE, BG_VIEWBOX } from "./sketch";

const HORIZON = 790;

export const Lab: React.FC<{ reveal?: number }> = ({ reveal = 1 }) => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill>
      <svg viewBox={BG_VIEWBOX} style={BG_SVG_STYLE}>
        <BoilDefs id="boil-lab" />

        <defs>
          <linearGradient id="lab-wall" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0f766e" />
            <stop offset="100%" stopColor="#115e59" />
          </linearGradient>
          <linearGradient id="lab-floor" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>
          <linearGradient id="flask-liquid" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={PALETTE.green} />
            <stop offset="100%" stopColor={PALETTE.lime} />
          </linearGradient>
          <linearGradient id="flask-liquid-purple" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={PALETTE.magenta} />
            <stop offset="100%" stopColor={PALETTE.purple} />
          </linearGradient>
        </defs>

        {/* Wall & Floor */}
        <rect x="-160" y="-100" width="2240" height={HORIZON + 100} fill="url(#lab-wall)" />
        <rect x="-160" y={HORIZON} width="2240" height={1280 - HORIZON} fill="url(#lab-floor)" />

        {/* Lab Tile Grid on Wall */}
        <g stroke="#14b8a6" strokeWidth={2} opacity={0.25}>
          {Array.from({ length: 14 }).map((_, i) => (
            <line key={`h-${i}`} x1="-160" y1={i * 65} x2="2080" y2={i * 65} />
          ))}
          {Array.from({ length: 24 }).map((_, i) => (
            <line key={`v-${i}`} x1={i * 95 - 160} y1="-100" x2={i * 95 - 160} y2={HORIZON} />
          ))}
        </g>

        {/* Floor Grid Lines */}
        <g stroke="#334155" strokeWidth={3} opacity={0.6}>
          {[-160, 140, 440, 740, 1040, 1340, 1640, 1940].map((fx, i) => (
            <line key={i} x1={fx} y1={HORIZON} x2={fx + (fx - 960) * 0.7} y2="1280" />
          ))}
          <line x1="-160" y1={HORIZON + 120} x2="2080" y2={HORIZON + 120} />
          <line x1="-160" y1={HORIZON + 260} x2="2080" y2={HORIZON + 260} />
        </g>

        {/* Lab Overhead Cable / Pipes */}
        <path
          d="M -160 40 Q 400 120 960 40 Q 1520 120 2080 40"
          fill="none"
          stroke="#0d9488"
          strokeWidth={22}
          strokeLinecap="round"
        />
        <path
          d="M -160 60 Q 500 160 1100 70 Q 1600 150 2080 60"
          fill="none"
          stroke={PALETTE.yellow}
          strokeWidth={10}
          strokeLinecap="round"
        />

        <g filter="url(#boil-lab)">
          {/* Left Lab Station: Bubbling Flasks & Equipment */}
          <g transform="translate(60, 420)">
            {/* Table */}
            <rect x="0" y="240" width="380" height="30" rx="6" fill="#475569" {...stroke(6)} />
            <rect x="30" y="270" width="25" height="110" fill="#334155" {...stroke(5)} />
            <rect x="325" y="270" width="25" height="110" fill="#334155" {...stroke(5)} />

            {/* Erlenmeyer Flask 1 (Green) */}
            <g transform="translate(70, 70)">
              <path
                d="M 28 0 L 28 40 L 0 160 Q 38 180 76 160 L 48 40 L 48 0 Z"
                fill="url(#flask-liquid)"
                {...stroke(6)}
              />
              {/* Animated Bubbles */}
              {[15, 35, 55].map((bx, bi) => {
                const bubbleY = 140 - ((frame * 2.5 + bi * 40) % 90);
                return (
                  <circle
                    key={bi}
                    cx={bx}
                    cy={bubbleY}
                    r={5 + (bi % 3) * 2}
                    fill={PALETTE.white}
                    opacity={0.8}
                  />
                );
              })}
            </g>

            {/* Round Flask 2 (Purple) */}
            <g transform="translate(220, 90)">
              <path d="M 28 0 L 28 35 L 48 35 L 48 0 Z" fill="#64748b" {...stroke(4)} />
              <circle cx="38" cy="100" r="50" fill="url(#flask-liquid-purple)" {...stroke(6)} />
              {/* Bubbles */}
              {[25, 45].map((bx, bi) => {
                const bubbleY = 120 - ((frame * 3 + bi * 50) % 65);
                return <circle key={bi} cx={bx} cy={bubbleY} r={6} fill={PALETTE.white} opacity={0.8} />;
              })}
            </g>
          </g>

          {/* Wall Computer Displays / Scopes (Top Center & Right) */}
          <g transform="translate(560, 160)">
            {/* Large Main Monitor */}
            <rect x="0" y="0" width="480" height="280" rx="16" fill="#0f172a" {...stroke(8)} />
            {/* Screen Header */}
            <rect x="10" y="10" width="460" height="34" fill="#1e293b" />
            <text x="24" y="34" fill={PALETTE.cyan} fontSize="18" fontWeight="bold" fontFamily={FONTS.body}>
              AI SYSTEM DIAGNOSTIC :: MATH_140
            </text>
            {/* Waveform / Sine Wave */}
            <path
              d={`M 20 160 Q 80 ${120 + Math.sin(frame / 4) * 40} 140 160 T 260 160 T 380 160 T 460 160`}
              fill="none"
              stroke={PALETTE.green}
              strokeWidth={6}
            />
            {/* Data bars */}
            {[0, 1, 2, 3, 4, 5, 6].map((di) => {
              const bh = 30 + Math.sin(frame / 5 + di) * 20 + di * 8;
              return (
                <rect
                  key={di}
                  x={40 + di * 55}
                  y={250 - bh}
                  width="35"
                  height={bh}
                  rx="4"
                  fill={di % 2 === 0 ? PALETTE.cyan : PALETTE.yellow}
                />
              );
            })}
          </g>

          {/* Right Lab Station: Tesla Coil & AI Terminal */}
          <g transform="translate(1480, 280)">
            {/* Tesla Coil Column */}
            <rect x="160" y="240" width="60" height="260" rx="8" fill="#475569" {...stroke(6)} />
            {/* Coil Rings */}
            {[260, 300, 340, 380, 420, 460].map((ry, i) => (
              <ellipse key={i} cx="190" cy={ry} rx="42" ry="12" fill={PALETTE.yellow} {...stroke(4)} />
            ))}
            {/* Tesla Sphere */}
            <circle cx="190" cy="200" r="50" fill={PALETTE.cyan} {...stroke(6)} />
            {/* Electric Sparks (flicker) */}
            {frame % 6 < 4 && (
              <g stroke={PALETTE.yellow} strokeWidth={5} fill="none">
                <path d="M 160 160 L 130 130 L 145 110 L 110 80" />
                <path d="M 220 160 L 250 120 L 235 100 L 270 70" />
              </g>
            )}

            {/* Secondary Terminal */}
            <rect x="-40" y="320" width="160" height="180" rx="12" fill="#1e293b" {...stroke(6)} />
            <circle cx="40" cy="370" r="28" fill="#0f172a" {...stroke(4)} />
            <text x="40" y="377" textAnchor="middle" fill={PALETTE.red} fontSize="22" fontWeight="bold">
              99%
            </text>
            <rect x="-15" y="420" width="110" height="14" rx="4" fill={PALETTE.green} />
          </g>
        </g>
      </svg>
    </AbsoluteFill>
  );
};
