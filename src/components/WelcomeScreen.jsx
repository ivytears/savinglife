import { useState, useEffect, useMemo } from "react";
import { fmtNum } from "../utils/calc";
import { getContextCopy } from "../utils/context-copy";

const TYPES = {
  checkin: {
    color: "#e63946",
    glowColor: "rgba(230,57,70,0.08)",
    getText: (p) => `+${fmtNum(p.dailyIncome)}`,
    copyType: "checkin",
  },
  guitar: {
    color: "#a78bfa",
    glowColor: "rgba(167,139,250,0.1)",
    getText: (p) => `+${p.points} 积分`,
    copyType: "guitar",
  },
  exercise: {
    color: "#f0a050",
    glowColor: "rgba(240,160,80,0.1)",
    getText: (p) => `+${p.points} 积分`,
    copyType: "exercise",
  },
  sleep: {
    color: "#7c9ef5",
    glowColor: "rgba(124,158,245,0.1)",
    getText: (p) => `+${p.points} 积分`,
    copyType: (p) => p.valid ? "sleepGood" : "sleepLate",
  },
  mood_happy: {
    color: "#4ecdc4",
    glowColor: "rgba(78,205,196,0.12)",
    emoji: "😊",
    getText: () => null,
    copyType: "mood_happy",
  },
  mood_sad: {
    color: "#7c9ef5",
    glowColor: "rgba(124,158,245,0.12)",
    emoji: "🫂",
    getText: () => null,
    copyType: "mood_sad",
  },
  daily_summary: {
    color: null,
    glowColor: "rgba(78,205,196,0.06)",
    getText: (p) => `${p.net >= 0 ? "+" : "-"}${fmtNum(p.net)}`,
    copyType: null,
  },
};

export default function WelcomeScreen({ type = "checkin", dailyIncome, extra, data, onComplete }) {
  const [phase, setPhase] = useState(0);

  const isMood = type === "mood_happy" || type === "mood_sad";

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), isMood ? 800 : 1200);
    const t2 = setTimeout(() => setPhase(2), isMood ? 3500 : 2800);
    const t3 = setTimeout(() => onComplete(), isMood ? 4300 : 3600);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  const config = TYPES[type] || TYPES.checkin;
  const params = { dailyIncome, ...(extra || {}) };
  const mainText = config.getText(params);

  const copyLine = useMemo(() => {
    if (!config.copyType) return params.subText || "";
    const ct = typeof config.copyType === "function" ? config.copyType(params) : config.copyType;
    return getContextCopy(ct, data || {});
  }, []);

  const dynamicColor = config.color || (params.net >= 0 ? "#4ecdc4" : "#e63946");

  return (
    <div
      onClick={() => onComplete()}
      style={{
        position: "fixed",
        inset: 0,
        background: "#0f2027",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        transition: "opacity 0.8s ease",
        opacity: phase === 2 ? 0 : 1,
        cursor: "pointer",
        padding: "env(safe-area-inset-top, 0px) max(32px, env(safe-area-inset-right, 0px)) env(safe-area-inset-bottom, 0px) max(32px, env(safe-area-inset-left, 0px))",
      }}
    >
      {/* 光晕 */}
      <div
        style={{
          position: "absolute",
          width: isMood ? 400 : 300,
          height: isMood ? 400 : 300,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${config.glowColor} 0%, transparent 70%)`,
          animation: "glowPulse 2s ease-in-out infinite",
        }}
      />

      {/* 心情模式：大 emoji */}
      {isMood && (
        <div
          style={{
            fontSize: 120,
            opacity: phase >= 0 ? 1 : 0,
            transform: phase >= 0 ? "scale(1)" : "scale(0.5)",
            transition: "all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
            marginBottom: 24,
            lineHeight: 1,
          }}
        >
          {config.emoji}
        </div>
      )}

      {/* 非心情模式：数字 */}
      {!isMood && mainText && (
        <div
          style={{
            fontSize: 48,
            fontWeight: 700,
            fontFamily: "-apple-system, 'SF Pro Display', 'Helvetica Neue', sans-serif",
            color: dynamicColor,
            opacity: phase >= 0 ? 1 : 0,
            transition: "all 0.6s ease",
            marginBottom: 16,
          }}
        >
          {mainText}
        </div>
      )}

      {/* 文案 */}
      <div
        style={{
          fontSize: isMood ? 18 : 16,
          color: "#8fa8b7",
          opacity: phase >= 1 ? 1 : 0,
          transform: phase >= 1 ? "translateY(0)" : "translateY(12px)",
          transition: "all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
          textAlign: "center",
          lineHeight: 1.8,
          maxWidth: 300,
          fontWeight: isMood ? 500 : 400,
        }}
      >
        {copyLine}
      </div>
    </div>
  );
}
