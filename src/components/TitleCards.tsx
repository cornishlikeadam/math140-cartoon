import React from "react";
import { AbsoluteFill, interpolate, spring, useVideoConfig } from "remotion";
import { FONTS, INK, LINE, LINE_THIN, PALETTE, stroke } from "../theme";

/** Scene 1 Title Card: "AI IN MATH: HELPER OR CHEATER?" */
export const TitleCard: React.FC<{ frame: number; triggerFrame: number; duration?: number }> = ({
  frame,
  triggerFrame,
  duration = 90,
}) => {
  const { fps } = useVideoConfig();
  if (frame < triggerFrame || frame >= triggerFrame + duration) return null;

  const spr = spring({
    frame: frame - triggerFrame,
    fps,
    config: { damping: 11, stiffness: 180 },
  });

  const scale = interpolate(spr, [0, 1], [0.3, 1]);
  const rot = interpolate(spr, [0, 1], [-15, -2]);

  return (
    <g transform={`translate(960, 500) scale(${scale}) rotate(${rot})`}>
      {/* Backing Card */}
      <rect
        x={-560}
        y={-140}
        width={1120}
        height={280}
        rx={32}
        fill={PALETTE.paper}
        {...stroke(14)}
      />
      <rect
        x={-540}
        y={-120}
        width={1080}
        height={240}
        rx={24}
        fill={PALETTE.yellow}
      />
      <text
        x={0}
        y={-20}
        textAnchor="middle"
        fill={INK}
        fontSize={64}
        fontWeight={900}
        fontFamily={FONTS.title}
        letterSpacing={2}
      >
        AI IN MATH:
      </text>
      <text
        x={0}
        y={70}
        textAnchor="middle"
        fill={PALETTE.red}
        fontSize={80}
        fontWeight={900}
        fontFamily={FONTS.impact}
        stroke={INK}
        strokeWidth={10}
        paintOrder="stroke"
        letterSpacing={3}
      >
        HELPER OR CHEATER?
      </text>
    </g>
  );
};

/** Scene 2: Five Giant Colorful Buttons HUD (CONSTRUCTION, PROOF, HINT, EXPLANATION, QUIZ) */
export const FiveRulesHUD: React.FC<{ activeRule: number; frame: number }> = ({
  activeRule,
  frame,
}) => {
  const rules = [
    { num: "1", title: "CONSTRUCTION", color: PALETTE.orange, desc: "Construct Own Shapes" },
    { num: "2", title: "PROOF", color: PALETTE.yellow, desc: "Write Own Proofs" },
    { num: "3", title: "HINT", color: PALETTE.green, desc: "Hints, Never Answers" },
    { num: "4", title: "EXPLANATION", color: PALETTE.cyan, desc: "Explain Own Work" },
    { num: "5", title: "QUIZ", color: PALETTE.red, desc: "No AI on Quizzes" },
  ];

  return (
    <g transform="translate(960, 120)">
      {rules.map((r, i) => {
        const ruleNum = i + 1;
        const isActive = activeRule === ruleNum;
        const isPast = activeRule > ruleNum;
        const bx = (i - 2) * 310;
        const bounce = isActive ? Math.sin(frame / 4) * 6 : 0;
        const scale = isActive ? 1.08 : 0.94;

        return (
          <g
            key={i}
            transform={`translate(${bx}, ${bounce}) scale(${scale})`}
            opacity={isActive ? 1 : isPast ? 0.8 : 0.45}
          >
            {/* Button Shadow */}
            <rect
              x={-140}
              y={-30}
              width={280}
              height={75}
              rx={18}
              fill={INK}
              opacity={0.3}
              transform="translate(4, 6)"
            />
            {/* Button Body */}
            <rect
              x={-140}
              y={-30}
              width={280}
              height={75}
              rx={18}
              fill={r.color}
              {...stroke(isActive ? LINE + 2 : LINE_THIN)}
            />
            {/* Button Title */}
            <text
              x={0}
              y={16}
              textAnchor="middle"
              fill={INK}
              fontSize={24}
              fontWeight={900}
              fontFamily={FONTS.title}
              letterSpacing={1}
            >
              {r.num}. {r.title}
            </text>
          </g>
        );
      })}
    </g>
  );
};

/** Scene 6 Scoreboard: "HUMAN THINKING + AI SUPPORT = BETTER LEARNING" */
export const Scoreboard: React.FC<{ frame: number; triggerFrame: number }> = ({
  frame,
  triggerFrame,
}) => {
  const { fps } = useVideoConfig();
  if (frame < triggerFrame) return null;

  const spr = spring({
    frame: frame - triggerFrame,
    fps,
    config: { damping: 12, stiffness: 190 },
  });

  const scale = interpolate(spr, [0, 1], [0.4, 1]);

  return (
    <g transform={`translate(960, 220) scale(${scale})`}>
      <rect
        x={-620}
        y={-90}
        width={1240}
        height={180}
        rx={24}
        fill="#0f172a"
        {...stroke(10)}
      />
      <rect
        x={-605}
        y={-75}
        width={1210}
        height={150}
        rx={18}
        fill="#1e293b"
      />
      <text
        x={0}
        y={15}
        textAnchor="middle"
        fill={PALETTE.yellow}
        fontSize={42}
        fontWeight={900}
        fontFamily={FONTS.impact}
        letterSpacing={2}
      >
        HUMAN THINKING + AI SUPPORT = BETTER LEARNING
      </text>
    </g>
  );
};

/** Final End Card: "THINK FIRST. USE AI SECOND." */
export const EndCard: React.FC<{ frame: number; triggerFrame: number }> = ({
  frame,
  triggerFrame,
}) => {
  const { fps } = useVideoConfig();
  if (frame < triggerFrame) return null;

  const spr = spring({
    frame: frame - triggerFrame,
    fps,
    config: { damping: 10, stiffness: 180 },
  });

  const scale = interpolate(spr, [0, 1], [0.2, 1]);

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(15, 23, 42, 0.95)",
        opacity: interpolate(spr, [0, 0.2, 1], [0, 1, 1]),
      }}
    >
      <div
        style={{
          transform: `scale(${scale})`,
          textAlign: "center",
          backgroundColor: PALETTE.paper,
          border: `${LINE + 4}px solid ${INK}`,
          borderRadius: "36px",
          padding: "50px 80px",
          maxWidth: "1200px",
          boxShadow: `14px 14px 0px ${PALETTE.purple}`,
        }}
      >
        <div
          style={{
            fontFamily: FONTS.impact,
            fontSize: "82px",
            color: PALETTE.red,
            letterSpacing: "3px",
            lineHeight: 1.1,
            marginBottom: "20px",
          }}
        >
          THINK FIRST. USE AI SECOND.
        </div>
        <div
          style={{
            fontFamily: FONTS.title,
            fontSize: "44px",
            color: PALETTE.purple,
            marginBottom: "12px",
          }}
        >
          MATH 140 | AI LEARNING RESEARCH
        </div>
        <div
          style={{
            fontFamily: FONTS.body,
            fontSize: "26px",
            color: INK,
            fontWeight: 700,
          }}
        >
          Education Short Shortfilm • Remotion + Manim + Rhubarb
        </div>
      </div>
    </AbsoluteFill>
  );
};
