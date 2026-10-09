import React from "react";
import { INK, LINE_THIN, PALETTE, stroke } from "../theme";
import type { Viseme } from "../timeline";
import { Limb, LimbPose } from "./parts";

export type BotProps = {
  viseme?: Viseme;
  expression?: string; // "happy" | "excited" | "smug" | "shocked" | "sad" | "glitch"
  left?: LimbPose;
  right?: LimbPose;
  talk?: number;
  hoverOffset?: number;
  screenContent?: React.ReactNode;
  censor?: boolean | number; // 0..1 or boolean: "HUMAN OVERSIGHT" bar over screen
  glitch?: boolean;
  frame?: number;
};

const CHASSIS = PALETTE.teal;
const CHASSIS_LIGHT = "#5eead4";
const SCREEN_BG = "#0f172a";
const LED_GLOW = "#38bdf8";

export const BOT: React.FC<BotProps> = ({
  viseme = "X",
  expression = "excited",
  left = { a: -35, b: 30 },
  right = { a: 35, b: -30 },
  talk = 0,
  hoverOffset = 0,
  screenContent,
  censor = false,
  glitch = false,
  frame = 0,
}) => {
  const hover = Math.sin((frame + hoverOffset) / 10) * 14;
  const antennaTwitch = Math.sin(frame / 6) * 5;
  const thrusterScale = 0.85 + Math.sin(frame * 1.5) * 0.25;

  // Digital face elements based on viseme and expression
  const isSad = expression === "sad";
  const isSmug = expression === "smug";
  const isShocked = expression === "shocked";
  const isGlitch = expression === "glitch" || glitch;

  const censorActive = typeof censor === "number" ? censor > 0.05 : censor;
  const censorAmount = typeof censor === "number" ? censor : censor ? 1 : 0;

  return (
    <g transform={`translate(0, ${hover})`}>
      {/* Floating shadow beneath bot */}
      <ellipse
        cx={0}
        cy={180 - hover * 0.5}
        rx={75 - hover * 0.4}
        ry={14 - hover * 0.1}
        fill={INK}
        opacity={0.2}
      />

      {/* Thruster flame / exhaust glow */}
      <g transform="translate(0, 110)">
        <ellipse
          cx={0}
          cy={25 * thrusterScale}
          rx={26 * thrusterScale}
          ry={40 * thrusterScale}
          fill={PALETTE.orange}
          opacity={0.8}
        />
        <ellipse
          cx={0}
          cy={18 * thrusterScale}
          rx={15 * thrusterScale}
          ry={26 * thrusterScale}
          fill={PALETTE.yellow}
        />
        <ellipse
          cx={0}
          cy={10 * thrusterScale}
          rx={7 * thrusterScale}
          ry={14 * thrusterScale}
          fill={PALETTE.white}
        />
      </g>

      {/* Thruster nozzle */}
      <path
        d="M -30 95 L -20 120 L 20 120 L 30 95 Z"
        fill="#334155"
        {...stroke(LINE_THIN)}
      />

      {/* Robot Arms */}
      <Limb
        sx={-90}
        sy={10}
        len1={65}
        len2={60}
        pose={left}
        width={24}
        color="#cbd5e1"
      >
        {(h) => (
          <g transform={`translate(${h.x},${h.y}) rotate(${-h.angle})`}>
            {/* Mechanical Claw */}
            <circle cx={0} cy={0} r={14} fill="#475569" stroke={INK} strokeWidth={LINE_THIN} />
            <path
              d="M -10 -4 Q -22 -18 -8 -28 Q -2 -14 -4 -4 Z"
              fill={PALETTE.yellow}
              stroke={INK}
              strokeWidth={4}
            />
            <path
              d="M 10 -4 Q 22 -18 8 -28 Q 2 -14 4 -4 Z"
              fill={PALETTE.yellow}
              stroke={INK}
              strokeWidth={4}
            />
          </g>
        )}
      </Limb>

      <Limb
        sx={90}
        sy={10}
        len1={65}
        len2={60}
        pose={right}
        width={24}
        color="#cbd5e1"
      >
        {(h) => (
          <g transform={`translate(${h.x},${h.y}) rotate(${-h.angle})`}>
            <circle cx={0} cy={0} r={14} fill="#475569" stroke={INK} strokeWidth={LINE_THIN} />
            <path
              d="M -10 -4 Q -22 -18 -8 -28 Q -2 -14 -4 -4 Z"
              fill={PALETTE.yellow}
              stroke={INK}
              strokeWidth={4}
            />
            <path
              d="M 10 -4 Q 22 -18 8 -28 Q 2 -14 4 -4 Z"
              fill={PALETTE.yellow}
              stroke={INK}
              strokeWidth={4}
            />
          </g>
        )}
      </Limb>

      {/* Antenna */}
      <g transform={`translate(0, -115) rotate(${antennaTwitch})`}>
        <line x1={0} y1={0} x2={0} y2={-50} stroke={INK} strokeWidth={8} strokeLinecap="round" />
        <line x1={0} y1={0} x2={0} y2={-50} stroke="#94a3b8" strokeWidth={5} strokeLinecap="round" />
        <circle
          cx={0}
          cy={-54}
          r={16}
          fill={frame % 16 < 8 ? PALETTE.red : PALETTE.yellow}
          stroke={INK}
          strokeWidth={LINE_THIN}
        />
        {/* Antenna glow */}
        <circle
          cx={0}
          cy={-54}
          r={24}
          fill={PALETTE.yellow}
          opacity={frame % 16 < 8 ? 0.4 : 0.1}
        />
      </g>

      {/* Main Body Chassis (Pill / Capsule) */}
      <rect
        x={-95}
        y={-115}
        width={190}
        height={220}
        rx={95}
        fill={CHASSIS}
        {...stroke()}
      />
      {/* Specular highlight stripe */}
      <path
        d="M -75 -80 Q -70 0 -75 70"
        stroke={CHASSIS_LIGHT}
        strokeWidth={14}
        strokeLinecap="round"
        fill="none"
      />
      {/* Ear bolts */}
      <circle cx={-98} cy={-5} r={14} fill="#64748b" stroke={INK} strokeWidth={LINE_THIN} />
      <circle cx={98} cy={-5} r={14} fill="#64748b" stroke={INK} strokeWidth={LINE_THIN} />

      {/* Face Screen Frame */}
      <rect
        x={-72}
        y={-70}
        width={144}
        height={115}
        rx={24}
        fill={SCREEN_BG}
        stroke={INK}
        strokeWidth={LINE_THIN}
      />
      {/* Screen inner glow / scanlines */}
      <g opacity={0.15}>
        {[-40, -20, 0, 20, 40].map((ly) => (
          <line key={ly} x1={-66} y1={ly} x2={66} y2={ly} stroke="#38bdf8" strokeWidth={2} />
        ))}
      </g>

      {/* Screen Face Content or Custom Screen Component */}
      {screenContent ? (
        <g transform="translate(0, -15)">{screenContent}</g>
      ) : isGlitch ? (
        /* Glitch display */
        <g transform="translate(0, -15)">
          <text
            x={0}
            y={0}
            textAnchor="middle"
            fill={PALETTE.red}
            fontSize={22}
            fontWeight="bold"
            fontFamily="monospace"
          >
            !ERR_404!
          </text>
          <line x1={-50} y1={12} x2={50} y2={12} stroke={PALETTE.yellow} strokeWidth={4} />
        </g>
      ) : (
        /* Digital LED Face */
        <g transform="translate(0, -15)">
          {/* Eyes */}
          {isSad ? (
            // Sad droopy LED eyes
            <>
              <path d="M -42 -22 Q -30 -30 -18 -22" stroke={LED_GLOW} strokeWidth={6} strokeLinecap="round" fill="none" />
              <path d="M 18 -22 Q 30 -30 42 -22" stroke={LED_GLOW} strokeWidth={6} strokeLinecap="round" fill="none" />
            </>
          ) : isSmug ? (
            // Smug half-closed eyes
            <>
              <line x1={-42} y1={-25} x2={-18} y2={-20} stroke={LED_GLOW} strokeWidth={6} strokeLinecap="round" />
              <line x1={18} y1={-20} x2={42} y2={-25} stroke={LED_GLOW} strokeWidth={6} strokeLinecap="round" />
            </>
          ) : isShocked ? (
            // Big wide open circular LED eyes
            <>
              <circle cx={-30} cy={-24} r={15} fill="none" stroke={LED_GLOW} strokeWidth={5} />
              <circle cx={30} cy={-24} r={15} fill="none" stroke={LED_GLOW} strokeWidth={5} />
            </>
          ) : (
            // Happy cheerful expressive eyes (curved or bright pill)
            <>
              <rect x={-42} y={-32} width={22} height={18} rx={8} fill={LED_GLOW} />
              <rect x={20} y={-32} width={22} height={18} rx={8} fill={LED_GLOW} />
            </>
          )}

          {/* Digital Viseme Mouth */}
          <g transform="translate(0, 16)">
            {viseme === "X" || viseme === "A" ? (
              // Closed smile or neutral line
              <path
                d={isSad ? "M -25 8 Q 0 -4 25 8" : "M -25 -2 Q 0 8 25 -2"}
                stroke={LED_GLOW}
                strokeWidth={5}
                strokeLinecap="round"
                fill="none"
              />
            ) : viseme === "D" || viseme === "C" ? (
              // Wide open shouting / excited mouth
              <rect
                x={-28}
                y={-8}
                width={56}
                height={22}
                rx={10}
                fill={LED_GLOW}
              />
            ) : viseme === "F" || viseme === "E" ? (
              // Small round mouth 'O'
              <ellipse cx={0} cy={0} rx={14} ry={12} fill={LED_GLOW} />
            ) : (
              // Talking bar with waveform teeth
              <rect x={-24} y={-4} width={48} height={12} rx={6} fill={LED_GLOW} />
            )}
          </g>
        </g>
      )}

      {/* CENSOR BAR GAG: "HUMAN OVERSIGHT" stamped over screen */}
      {censorActive && (
        <g
          transform={`translate(0, -15) scale(${censorAmount}) rotate(${
            -10 + (1 - censorAmount) * 45
          })`}
          style={{ transformOrigin: "0px -15px" }}
        >
          {/* Black & Yellow Hazard bar */}
          <rect
            x={-90}
            y={-24}
            width={180}
            height={48}
            rx={6}
            fill="#000000"
            stroke={PALETTE.red}
            strokeWidth={4}
          />
          <text
            x={0}
            y={8}
            textAnchor="middle"
            fill={PALETTE.yellow}
            fontSize={15}
            fontWeight={900}
            fontFamily="Arial Black, Impact, sans-serif"
            letterSpacing={1.2}
          >
            HUMAN OVERSIGHT
          </text>
        </g>
      )}
    </g>
  );
};
