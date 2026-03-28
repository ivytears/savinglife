import { useState, useEffect, useRef } from "react";
import FlipDisplay from "./FlipClock";
import { calcTotal, getTodayInfo, fmtNum } from "../utils/calc";
import { IconCheckCircle } from "./Icons";

export default function DisplayMode({ data, onExit }) {
  const [now, setNow] = useState(new Date());
  const [clockHeight, setClockHeight] = useState(170);
  const centerRef = useRef(null);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    let wakeLock = null;
    const requestWake = async () => {
      try {
        if ("wakeLock" in navigator) {
          wakeLock = await navigator.wakeLock.request("screen");
        }
      } catch {}
    };
    requestWake();
    const onVisChange = () => {
      if (document.visibilityState === "visible") requestWake();
    };
    document.addEventListener("visibilitychange", onVisChange);
    return () => {
      document.removeEventListener("visibilitychange", onVisChange);
      if (wakeLock) wakeLock.release();
    };
  }, []);

  useEffect(() => {
    const calc = () => {
      if (!centerRef.current) return;
      const h = centerRef.current.offsetHeight;
      setClockHeight(Math.max(60, h - 20));
    };
    calc();
    window.addEventListener("resize", calc);
    const mq = window.matchMedia("(orientation: portrait)");
    mq.addEventListener("change", calc);
    return () => {
      window.removeEventListener("resize", calc);
      mq.removeEventListener("change", calc);
    };
  }, []);

  const total = calcTotal(data);
  const info = getTodayInfo(data);
  const dateStr = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, "0")}.${String(now.getDate()).padStart(2, "0")}`;
  const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  const weekdays = ["日", "一", "二", "三", "四", "五", "六"];

  return (
    <div
      onClick={onExit}
      style={{
        position: "fixed",
        inset: 0,
        background: "#0f2027",
        display: "flex",
        flexDirection: "column",
        cursor: "pointer",
        userSelect: "none",
        overflow: "hidden",
        paddingLeft: "max(24px, env(safe-area-inset-left, 0px))",
        paddingRight: "max(24px, env(safe-area-inset-right, 0px))",
      }}
    >
      {/* 顶栏：日期 + 时间 */}
      <div
        style={{
          padding: "16px 0",
          paddingTop: "max(16px, env(safe-area-inset-top, 0px))",
          display: "flex",
          justifyContent: "space-between",
          fontFamily: "'SF Pro Display', -apple-system, sans-serif",
          fontSize: 14,
          color: "#8fa8b7",
          letterSpacing: 1.5,
          flexShrink: 0,
          fontWeight: 500,
        }}
      >
        <span>
          {dateStr} 周{weekdays[now.getDay()]}
        </span>
        <span>{timeStr}</span>
      </div>

      {/* 中央：翻页钟数字 */}
      <div
        ref={centerRef}
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 0,
        }}
      >
        <FlipDisplay value={total} maxHeight={clockHeight} />
      </div>

      {/* 底栏：今日净值 + 状态 */}
      <div
        style={{
          padding: "12px 0 20px",
          paddingBottom: "max(20px, env(safe-area-inset-bottom, 0px))",
          display: "flex",
          justifyContent: "center",
          gap: 12,
          flexShrink: 0,
        }}
      >
        <div
          style={{
            padding: "10px 24px",
            borderRadius: 20,
            border: `1px solid ${info.net >= 0 ? "rgba(78,205,196,0.3)" : "rgba(230,57,70,0.3)"}`,
            fontFamily: "'SF Pro Display', -apple-system, sans-serif",
            fontSize: 15,
            fontWeight: 600,
            letterSpacing: 0.5,
            color: info.net >= 0 ? "#4ecdc4" : "#e63946",
            background: info.net >= 0 ? "rgba(78,205,196,0.1)" : "rgba(230,57,70,0.1)",
          }}
        >
          今日 {info.net >= 0 ? "+" : "-"}{fmtNum(info.net)}
        </div>
        {info.checkedIn && (
          <div
            style={{
              padding: "10px 16px",
              borderRadius: 20,
              border: "1px solid rgba(78,205,196,0.3)",
              fontSize: 15,
              fontWeight: 500,
              color: "#4ecdc4",
              background: "rgba(78,205,196,0.1)",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <IconCheckCircle size={16} color="#4ecdc4" />
            已打卡
          </div>
        )}
      </div>
    </div>
  );
}
