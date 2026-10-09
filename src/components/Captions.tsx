import React from "react";
import { AbsoluteFill } from "remotion";
import { FONTS, INK, LINE_THIN, PALETTE } from "../theme";
import type { Line, Speaker } from "../timeline";

export const Captions: React.FC<{ line?: Line }> = ({ line }) => {
  if (!line) return null;

  const speakerColors: Record<Speaker, { bg: string; text: string; label: string }> = {
    KJ: { bg: PALETTE.orange, text: INK, label: "KJ" },
    PROF: { bg: PALETTE.purple, text: PALETTE.white, label: "PROFESSOR" },
    BOT: { bg: PALETTE.teal, text: INK, label: "B.O.T." },
  };

  const info = speakerColors[line.speaker] ?? { bg: PALETTE.paper, text: INK, label: line.speaker };

  return (
    <AbsoluteFill
      style={{
        pointerEvents: "none",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        alignItems: "center",
        paddingBottom: "36px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "18px",
          backgroundColor: "rgba(27, 21, 48, 0.88)",
          border: `${LINE_THIN}px solid ${INK}`,
          borderRadius: "24px",
          padding: "14px 28px",
          maxWidth: "1400px",
          boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
        }}
      >
        {/* Speaker Badge */}
        <div
          style={{
            backgroundColor: info.bg,
            color: info.text,
            fontFamily: FONTS.title,
            fontSize: "20px",
            padding: "6px 14px",
            borderRadius: "12px",
            fontWeight: 900,
            letterSpacing: "1px",
            border: `2px solid ${INK}`,
            flexShrink: 0,
          }}
        >
          {info.label}
        </div>

        {/* Caption Text */}
        <div
          style={{
            fontFamily: FONTS.body,
            fontSize: "26px",
            fontWeight: 700,
            color: PALETTE.white,
            lineHeight: 1.25,
            textShadow: "1px 1px 3px rgba(0,0,0,0.8)",
          }}
        >
          {line.text}
        </div>
      </div>
    </AbsoluteFill>
  );
};
