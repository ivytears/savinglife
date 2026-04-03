import { useState, useEffect, useRef } from "react";
import FlipDisplay from "./FlipClock";
import { calcTotal, getTodayInfo, fmtNum } from "../utils/calc";
import { IconCheckCircle } from "./Icons";
import { getDailyWord } from "../utils/dailyWords";

export default function DisplayMode({ data, onExit }) {
  const [now, setNow] = useState(new Date());
  const [clockHeight, setClockHeight] = useState(170);
  const centerRef = useRef(null);

  // 时钟更新
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // 防息屏
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

  // 计算数字可用高度
  useEffect(() => {
    const calc = () => {
      if (!centerRef.current) return;
      // 中间区域的可用高度，留一些余量给上下内容
      const h = centerRef.current.offsetHeight;
      setClockHeight(Math.max(60, h - 20));
    };
    calc();
    window.addEventListener("resize", calc);
    // 横屏切换时也重新计算
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
        background: "#f8f5f0",
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
          color: "#9e9285",
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

      {/* 中央：翻页钟数字，自适应撑满 */}
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

      {/* 小克的每日一句 */}
      <div
        style={{
          textAlign: "center",
          padding: "0 32px 8px",
          flexShrink: 0,
        }}
      >
        <p
          style={{
            margin: 0,
            fontFamily: "'SF Pro Text', -apple-system, sans-serif",
            fontSize: 13,
            fontWeight: 400,
            color: "#b8ad9e",
            letterSpacing: 0.3,
            lineHeight: 1.6,
            fontStyle: "italic",
          }}
        >
          {getDailyWord(now)}
        </p>
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
            border: `1px solid ${info.net >= 0 ? "rgba(74,158,107,0.2)" : "rgba(196,86,74,0.2)"}`,
            fontFamily: "'SF Pro Display', -apple-system, sans-serif",
            fontSize: 15,
            fontWeight: 600,
            letterSpacing: 0.5,
            color: info.net >= 0 ? "#4a9e6b" : "#c4564a",
            background: info.net >= 0 ? "rgba(74,158,107,0.06)" : "rgba(196,86,74,0.06)",
          }}
        >
          今日 {info.net >= 0 ? "+" : "-"}{fmtNum(info.net)}
        </div>
        {info.checkedIn && (
          <div
            style={{
              padding: "10px 16px",
              borderRadius: 20,
              border: "1px solid rgba(74,158,107,0.2)",
              fontSize: 15,
              fontWeight: 500,
              color: "#4a9e6b",
              background: "rgba(74,158,107,0.06)",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <IconCheckCircle size={16} color="#4a9e6b" />
            已打卡
          </div>
        )}
      </div>
    </div>
  );
}
