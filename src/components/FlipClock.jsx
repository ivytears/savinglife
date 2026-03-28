import { useState, useEffect, useRef, useMemo } from "react";

function FlipDigit({ char, scale = 1 }) {
  const [display, setDisplay] = useState(char);
  const [prev, setPrev] = useState(char);
  const [flipping, setFlipping] = useState(false);

  useEffect(() => {
    if (char !== display) {
      setPrev(display);
      setFlipping(true);
      const t = setTimeout(() => {
        setDisplay(char);
        setTimeout(() => setFlipping(false), 350);
      }, 250);
      return () => clearTimeout(t);
    }
  }, [char]);

  const isSymbol = ",- ".includes(char);
  // 更紧凑的尺寸，让数字能更大
  const baseW = isSymbol ? (char === "," ? 24 : char === " " ? 16 : 40) : 64;
  const baseH = 96;
  const baseFs = isSymbol ? 56 : 72;
  const w = Math.round(baseW * scale);
  const h = Math.round(baseH * scale);
  const fs = Math.round(baseFs * scale);
  const r = Math.round(5 * scale);
  const m = Math.round(1.5 * scale);

  const half = {
    position: "absolute",
    left: 0,
    right: 0,
    height: "50%",
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: fs,
    fontWeight: 700,
    fontFamily: "-apple-system, 'SF Pro Display', 'Helvetica Neue', sans-serif",
    backfaceVisibility: "hidden",
    color: "#1a1a1a",
  };

  return (
    <div
      style={{
        width: w,
        height: h,
        position: "relative",
        perspective: 500,
        margin: `0 ${m}px`,
      }}
    >
      {/* 上半 */}
      <div style={{ ...half, top: 0, background: "#fff", borderRadius: `${r}px ${r}px 0 0`, borderBottom: "1px solid #e5e5e5", alignItems: "flex-end" }}>
        <span style={{ transform: "translateY(50%)" }}>{display}</span>
      </div>
      {/* 下半 */}
      <div style={{ ...half, bottom: 0, background: "#f8f8f8", borderRadius: `0 0 ${r}px ${r}px`, alignItems: "flex-start", boxShadow: "0 1px 2px rgba(0,0,0,0.06)" }}>
        <span style={{ transform: "translateY(-50%)" }}>{display}</span>
      </div>
      {/* 翻转上瓣 */}
      {flipping && (
        <div style={{ ...half, top: 0, background: "#fff", borderRadius: `${r}px ${r}px 0 0`, alignItems: "flex-end", zIndex: 3, transformOrigin: "bottom center", animation: "flipTop 0.5s ease-in forwards" }}>
          <span style={{ transform: "translateY(50%)" }}>{prev}</span>
        </div>
      )}
      {/* 翻转下瓣 */}
      {flipping && (
        <div style={{ ...half, bottom: 0, background: "#f8f8f8", borderRadius: `0 0 ${r}px ${r}px`, alignItems: "flex-start", zIndex: 2, transformOrigin: "top center", animation: "flipBot 0.5s ease-out 0.25s forwards", transform: "rotateX(90deg)", boxShadow: "0 1px 2px rgba(0,0,0,0.06)" }}>
          <span style={{ transform: "translateY(-50%)" }}>{display}</span>
        </div>
      )}
      {/* 中线 */}
      <div style={{ position: "absolute", left: 0, right: 0, top: "50%", height: 1, background: "#ddd", zIndex: 10 }} />
    </div>
  );
}

export default function FlipDisplay({ value, maxHeight }) {
  const containerRef = useRef(null);
  const [scale, setScale] = useState(1);

  const formatted = useMemo(() => {
    const abs = Math.abs(Math.round(value));
    const str = abs.toLocaleString("en-US");
    return (value < 0 ? "-" : "") + str;
  }, [value]);

  useEffect(() => {
    const calcScale = () => {
      if (!containerRef.current) return;
      const containerW = containerRef.current.offsetWidth - 32;
      const chars = formatted.split("");
      let totalW = 0;
      chars.forEach((c) => {
        const isSymbol = ",- ".includes(c);
        const w = isSymbol ? (c === "," ? 24 : c === " " ? 16 : 40) : 64;
        totalW += w + 3;
      });
      const scaleW = containerW / totalW;
      const scaleH = maxHeight ? maxHeight / 96 : Infinity;
      setScale(Math.min(scaleW, scaleH));
    };
    calcScale();
    window.addEventListener("resize", calcScale);
    return () => window.removeEventListener("resize", calcScale);
  }, [formatted, maxHeight]);

  return (
    <div style={{ textAlign: "center", width: "100%", padding: "0 12px" }} ref={containerRef}>
      <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", flexWrap: "nowrap" }}>
        {formatted.split("").map((c, i) => (
          <FlipDigit key={i} char={c} scale={scale} />
        ))}
      </div>
    </div>
  );
}
