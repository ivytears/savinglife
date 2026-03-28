import { useState, useEffect, useCallback, useRef, useMemo } from "react";

// ═══════════════════════════════════════
//  储蓄翻页钟 — NFC Check-in Edition
//  扫NFC → 欢迎回家 → 记入收入 → 查看支出
// ═══════════════════════════════════════

const STORE_KEY = "savings-flip-v3";

const getToday = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const fmtNum = (n) => Math.round(Math.abs(n)).toLocaleString("en-US");

const defaultData = {
  settings: { dailyIncome: 0, initialSavings: 0 },
  checkins: {},       // { "2026-03-24": true }
  expenses: {},       // { "2026-03-24": { items: [{amount, note}] } }
  extraIncomes: {},   // { "2026-03-24": { items: [{amount, note}] } }
};

function calcTotal(data) {
  const s = data.settings;
  const checkinCount = Object.keys(data.checkins || {}).length;
  const totalIncome = checkinCount * (s.dailyIncome || 0);

  // Extra incomes
  let totalExtra = 0;
  Object.values(data.extraIncomes || {}).forEach(d => {
    (d.items || []).forEach(i => { totalExtra += i.amount || 0; });
  });

  let totalExp = 0;
  Object.values(data.expenses).forEach(d => {
    (d.items || []).forEach(i => { totalExp += i.amount || 0; });
  });

  return (s.initialSavings || 0) + totalIncome + totalExtra - totalExp;
}

function getTodayInfo(data) {
  const today = getToday();
  const checkedIn = !!data.checkins?.[today];
  const income = checkedIn ? (data.settings.dailyIncome || 0) : 0;
  const extraItems = data.extraIncomes?.[today]?.items || [];
  const extraTotal = extraItems.reduce((s, i) => s + (i.amount || 0), 0);
  const items = data.expenses[today]?.items || [];
  const expense = items.reduce((s, i) => s + (i.amount || 0), 0);
  return { today, checkedIn, income, extraItems, extraTotal, expense, items, net: income + extraTotal - expense };
}

// Compress image before OCR
function compressImage(file, maxWidth = 1200, quality = 0.8) {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement("canvas");
      let w = img.width, h = img.height;
      if (w > maxWidth) { h = Math.round(h * maxWidth / w); w = maxWidth; }
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, w, h);
      const dataUrl = canvas.toDataURL("image/jpeg", quality);
      URL.revokeObjectURL(url);
      resolve({ base64: dataUrl.split(",")[1], mediaType: "image/jpeg" });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      // Fallback: read as-is
      const reader = new FileReader();
      reader.onload = () => resolve({ base64: reader.result.split(",")[1], mediaType: file.type || "image/jpeg" });
      reader.readAsDataURL(file);
    };
    img.src = url;
  });
}

async function ocrImage(base64, mediaType) {
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        messages: [{
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: mediaType, data: base64 } },
            { type: "text", text: `这是微信或支付宝的消费记录截图。请识别出所有支出/消费金额和对应描述。
注意：只统计支出/消费/转账/付款的金额，不要统计收入。
只返回纯JSON，不要任何其他文字或markdown：
{"items":[{"amount":数字,"note":"简短描述"}],"total":总金额数字}
如果图片不是消费截图或无法识别，返回：
{"items":[],"total":0,"error":"这不是消费截图，请上传微信或支付宝的账单截图"}` }
          ]
        }]
      })
    });
    if (!res.ok) {
      const errText = await res.text();
      console.error("API error:", res.status, errText);
      return { items: [], total: 0, error: `接口错误 (${res.status})，请稍后重试` };
    }
    const d = await res.json();
    if (d.error) {
      console.error("API response error:", d.error);
      return { items: [], total: 0, error: `识别服务异常：${d.error.message || "请稍后重试"}` };
    }
    const txt = (d.content || []).map(c => c.text || "").join("");
    if (!txt) return { items: [], total: 0, error: "未获取到识别结果，请重试" };
    const clean = txt.replace(/```json|```/g, "").trim();
    return JSON.parse(clean);
  } catch (e) {
    console.error("OCR error:", e);
    return { items: [], total: 0, error: `识别失败：${e.message || "网络错误，请检查网络后重试"}` };
  }
}

// ═══════════════════════════════════════
//  Welcome Screen (欢迎主人回家)
// ═══════════════════════════════════════
function WelcomeScreen({ dailyIncome, onComplete }) {
  const [phase, setPhase] = useState(0);
  // 0: greeting  1: income added  2: fade out

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 1200);
    const t2 = setTimeout(() => setPhase(2), 2800);
    const t3 = setTimeout(() => onComplete(), 3600);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  return (
    <div style={{
      position: "fixed", inset: 0, background: "#faf9f6",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      zIndex: 1000, transition: "opacity 0.8s ease",
      opacity: phase === 2 ? 0 : 1,
    }}>
      {/* Warm glow */}
      <div style={{
        position: "absolute", width: 300, height: 300, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(201,169,110,0.12) 0%, transparent 70%)",
        animation: "glowPulse 2s ease-in-out infinite",
      }} />

      <div style={{
        fontSize: 18, letterSpacing: 8, color: "#b0aca4",
        marginBottom: 24, opacity: phase >= 0 ? 1 : 0,
        transition: "opacity 0.6s ease",
        fontWeight: 500,
      }}>
        欢迎主人回家
      </div>

      <div style={{
        fontSize: 48, fontWeight: 800,
        fontFamily: "'DM Mono', monospace",
        color: "#2a2a28",
        opacity: phase >= 1 ? 1 : 0,
        transform: phase >= 1 ? "translateY(0)" : "translateY(20px)",
        transition: "all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
      }}>
        +¥{fmtNum(dailyIncome)}
      </div>

      <div style={{
        marginTop: 12, fontSize: 13, color: "#b0aca4",
        opacity: phase >= 1 ? 1 : 0,
        transition: "opacity 0.4s ease 0.3s",
      }}>
        今日收入已记录
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
//  MoneyInput — Input with thousand separators
// ═══════════════════════════════════════
function MoneyInput({ value, onChange, placeholder, style: extraStyle }) {
  const [displayVal, setDisplayVal] = useState(() => {
    const n = parseFloat(value);
    return n ? n.toLocaleString("en-US") : "";
  });

  useEffect(() => {
    const n = parseFloat(value);
    const formatted = n ? n.toLocaleString("en-US") : "";
    if (formatted !== displayVal && document.activeElement?.dataset?.moneyinput !== "true") {
      setDisplayVal(formatted);
    }
  }, [value]);

  const handleChange = (e) => {
    const raw = e.target.value.replace(/,/g, "");
    // Allow empty, digits, one decimal point
    if (raw === "" || /^\d*\.?\d*$/.test(raw)) {
      const n = parseFloat(raw);
      if (raw === "" || raw === "." || raw.endsWith(".")) {
        setDisplayVal(raw);
        onChange(raw.replace(/\.$/, "") || "");
      } else if (!isNaN(n)) {
        // Format with commas while typing
        const parts = raw.split(".");
        parts[0] = parseInt(parts[0]).toLocaleString("en-US");
        setDisplayVal(parts.join("."));
        onChange(String(n));
      }
    }
  };

  const handleBlur = () => {
    const n = parseFloat(value);
    setDisplayVal(n ? n.toLocaleString("en-US") : "");
  };

  return (
    <input
      data-moneyinput="true"
      type="text"
      inputMode="decimal"
      placeholder={placeholder}
      value={displayVal}
      onChange={handleChange}
      onBlur={handleBlur}
      style={extraStyle}
    />
  );
}

// ═══════════════════════════════════════
// ═══════════════════════════════════════
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

  const isSymbol = "¥,- ".includes(char);
  const baseW = isSymbol ? (char === "," ? 32 : char === " " ? 20 : char === "-" ? 48 : 56) : 80;
  const baseH = 110;
  const baseFs = char === "¥" ? 52 : isSymbol ? 64 : 78;
  const w = Math.round(baseW * scale);
  const h = Math.round(baseH * scale);
  const fs = Math.round(baseFs * scale);
  const r = Math.round(8 * scale);
  const m = Math.round(2 * scale);

  const half = {
    position: "absolute", left: 0, right: 0, height: "50%",
    overflow: "hidden", display: "flex", alignItems: "center",
    justifyContent: "center", fontSize: fs, fontWeight: 800,
    fontFamily: "'DM Mono', 'SF Mono', monospace",
    backfaceVisibility: "hidden", color: "#1a1a1a",
  };

  return (
    <div style={{ width: w, height: h, position: "relative", perspective: 500, margin: `0 ${m}px` }}>
      <div style={{
        ...half, top: 0, background: "#f8f8f7", borderRadius: `${r}px ${r}px 0 0`,
        borderBottom: "1px solid #e8e8e6", alignItems: "flex-end",
        boxShadow: "inset 0 1px 0 #fff",
      }}>
        <span style={{ transform: "translateY(50%)" }}>{display}</span>
      </div>
      <div style={{
        ...half, bottom: 0, background: "#f4f4f2", borderRadius: `0 0 ${r}px ${r}px`,
        alignItems: "flex-start", boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
      }}>
        <span style={{ transform: "translateY(-50%)" }}>{display}</span>
      </div>
      {flipping && (
        <div style={{
          ...half, top: 0, background: "#f8f8f7", borderRadius: `${r}px ${r}px 0 0`,
          alignItems: "flex-end", zIndex: 3, transformOrigin: "bottom center",
          animation: "flipTop 0.5s ease-in forwards",
        }}>
          <span style={{ transform: "translateY(50%)" }}>{prev}</span>
        </div>
      )}
      {flipping && (
        <div style={{
          ...half, bottom: 0, background: "#f4f4f2", borderRadius: `0 0 ${r}px ${r}px`,
          alignItems: "flex-start", zIndex: 2, transformOrigin: "top center",
          animation: "flipBot 0.5s ease-out 0.25s forwards", transform: "rotateX(90deg)",
          boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
        }}>
          <span style={{ transform: "translateY(-50%)" }}>{display}</span>
        </div>
      )}
      <div style={{
        position: "absolute", left: 0, right: 0, top: "50%",
        height: Math.max(1, Math.round(1.5 * scale)), background: "#ddd", zIndex: 10, transform: "translateY(-0.75px)",
      }} />
      {!isSymbol && <>
        <div style={{ position: "absolute", left: -1, top: "50%", transform: "translateY(-50%)", width: Math.round(3 * scale), height: Math.round(8 * scale), background: "#ccc", borderRadius: 1, zIndex: 11 }} />
        <div style={{ position: "absolute", right: -1, top: "50%", transform: "translateY(-50%)", width: Math.round(3 * scale), height: Math.round(8 * scale), background: "#ccc", borderRadius: 1, zIndex: 11 }} />
      </>}
    </div>
  );
}

function FlipDisplay({ value, label }) {
  const containerRef = useRef(null);
  const [scale, setScale] = useState(1);

  const formatted = useMemo(() => {
    const abs = Math.abs(Math.round(value));
    const str = abs.toLocaleString("en-US");
    return (value < 0 ? "-¥" : "¥") + str;
  }, [value]);

  // Calculate scale to fit all digits in one row
  useEffect(() => {
    const calcScale = () => {
      if (!containerRef.current) return;
      const containerW = containerRef.current.offsetWidth - 48; // padding
      const chars = formatted.split("");
      // Estimate total width at scale=1
      let totalW = 0;
      chars.forEach(c => {
        const isSymbol = "¥,- ".includes(c);
        const w = isSymbol ? (c === "," ? 32 : c === " " ? 20 : c === "-" ? 48 : 56) : 80;
        totalW += w + 4; // margin
      });
      const s = Math.min(1, containerW / totalW);
      setScale(s);
    };
    calcScale();
    window.addEventListener("resize", calcScale);
    return () => window.removeEventListener("resize", calcScale);
  }, [formatted]);

  return (
    <div style={{ textAlign: "center" }} ref={containerRef}>
      {label && (
        <div style={{ fontSize: 11, letterSpacing: 6, color: "#b0aca4", marginBottom: 14, fontWeight: 500 }}>
          {label}
        </div>
      )}
      <div style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        flexWrap: "nowrap", background: "#eeede9", padding: "20px 24px",
        borderRadius: 16, boxShadow: "inset 0 2px 6px rgba(0,0,0,0.04), 0 1px 0 #fff",
        width: "100%",
      }}>
        {formatted.split("").map((c, i) => <FlipDigit key={i} char={c} scale={scale} />)}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
//  Display Mode
// ═══════════════════════════════════════
function DisplayMode({ data, onExit }) {
  const [now, setNow] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t); }, []);

  const total = calcTotal(data);
  const info = getTodayInfo(data);
  const dateStr = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, "0")}.${String(now.getDate()).padStart(2, "0")}`;
  const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  const weekdays = ["日", "一", "二", "三", "四", "五", "六"];

  return (
    <div onClick={onExit} style={{
      position: "fixed", inset: 0, background: "#faf9f6",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      cursor: "pointer", userSelect: "none",
    }}>
      <div style={{
        position: "absolute", top: 28, left: 36, right: 36,
        display: "flex", justifyContent: "space-between",
        fontFamily: "'DM Mono', monospace", fontSize: 12, color: "#c5c0b8", letterSpacing: 2,
      }}>
        <span>{dateStr} 周{weekdays[now.getDay()]}</span>
        <span>{timeStr}</span>
      </div>

      <FlipDisplay value={total} label="累 计 储 蓄" />

      <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
        <div style={{
          padding: "8px 20px", borderRadius: 24, border: "1px solid #e8e6e2",
          fontFamily: "'DM Mono', monospace", fontSize: 13, letterSpacing: 1,
          color: info.net >= 0 ? "#5a8a5e" : "#c46060",
          background: info.net >= 0 ? "#f0f7f0" : "#fdf0f0",
        }}>
          今日 {info.net >= 0 ? "+" : "-"}¥{fmtNum(info.net)}
        </div>
        {info.checkedIn && (
          <div style={{
            padding: "8px 14px", borderRadius: 24, border: "1px solid #e8e6e2",
            fontSize: 13, color: "#5a8a5e", background: "#f0f7f0",
          }}>✓ 已打卡</div>
        )}
      </div>

      <div style={{ position: "absolute", bottom: 24, fontSize: 11, color: "#ddd", letterSpacing: 3 }}>
        点击返回
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
//  Main App
// ═══════════════════════════════════════
export default function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("home");
  const [showWelcome, setShowWelcome] = useState(false);
  const [toast, setToast] = useState("");
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrResult, setOcrResult] = useState(null);
  const [manualAmt, setManualAmt] = useState("");
  const [manualNote, setManualNote] = useState("");
  const [settingsForm, setSettingsForm] = useState({ income: "", savings: "" });
  const fileRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const r = await window.storage.get(STORE_KEY);
        if (r) {
          const parsed = JSON.parse(r.value);
          // Ensure all required fields exist
          if (!parsed.checkins) parsed.checkins = {};
          if (!parsed.expenses) parsed.expenses = {};
          if (!parsed.extraIncomes) parsed.extraIncomes = {};
          if (!parsed.settings) parsed.settings = { ...defaultData.settings };
          setData(parsed);
        } else {
          setData({ ...defaultData });
        }
      } catch { setData({ ...defaultData }); }
      setLoading(false);
    })();
  }, []);

  const save = useCallback(async (d) => {
    setData(d);
    try { await window.storage.set(STORE_KEY, JSON.stringify(d)); } catch {}
  }, []);

  const flash = (m) => { setToast(m); setTimeout(() => setToast(""), 2200); };

  // ─── Check In (打卡) ───
  const doCheckin = () => {
    const today = getToday();
    if (data.checkins?.[today]) {
      flash("今天已经打过卡了");
      return;
    }
    const nd = { ...data, checkins: { ...data.checkins, [today]: true } };
    save(nd);
    setShowWelcome(true);
  };

  // ─── Undo Check In ───
  const undoCheckin = () => {
    const today = getToday();
    if (!data.checkins?.[today]) return;
    const nd = { ...data, checkins: { ...data.checkins } };
    delete nd.checkins[today];
    save(nd);
    flash("已撤销今日打卡");
  };

  const handleFile = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setOcrLoading(true); setOcrResult(null);
    try {
      const { base64, mediaType } = await compressImage(f);
      const res = await ocrImage(base64, mediaType);
      setOcrResult(res);
    } catch (err) {
      setOcrResult({ items: [], total: 0, error: "图片读取失败，请重试" });
    }
    setOcrLoading(false);
    e.target.value = "";
  };

  const addItems = (items) => {
    if (!items?.length) return;
    const today = getToday();
    const nd = { ...data, expenses: { ...data.expenses } };
    if (!nd.expenses[today]) nd.expenses[today] = { items: [] };
    else nd.expenses[today] = { ...nd.expenses[today], items: [...nd.expenses[today].items] };
    items.forEach(i => nd.expenses[today].items.push({ amount: i.amount, note: i.note || "" }));
    save(nd); flash(`已记录 ${items.length} 笔支出`);
    setOcrResult(null); setManualAmt(""); setManualNote(""); setView("home");
  };

  const addExtraIncome = (amount, note) => {
    if (!amount || amount <= 0) return;
    const today = getToday();
    const nd = { ...data, extraIncomes: { ...(data.extraIncomes || {}) } };
    if (!nd.extraIncomes[today]) nd.extraIncomes[today] = { items: [] };
    else nd.extraIncomes[today] = { ...nd.extraIncomes[today], items: [...nd.extraIncomes[today].items] };
    nd.extraIncomes[today].items.push({ amount, note: note || "额外收入" });
    save(nd); flash("已记录收入");
    setManualAmt(""); setManualNote(""); setView("home");
  };

  const deleteItem = (date, idx) => {
    const nd = { ...data, expenses: { ...data.expenses } };
    nd.expenses[date] = { ...nd.expenses[date], items: [...nd.expenses[date].items] };
    nd.expenses[date].items.splice(idx, 1);
    if (!nd.expenses[date].items.length) delete nd.expenses[date];
    save(nd); flash("已删除");
  };

  const deleteExtraIncome = (date, idx) => {
    const nd = { ...data, extraIncomes: { ...(data.extraIncomes || {}) } };
    nd.extraIncomes[date] = { ...nd.extraIncomes[date], items: [...nd.extraIncomes[date].items] };
    nd.extraIncomes[date].items.splice(idx, 1);
    if (!nd.extraIncomes[date].items.length) delete nd.extraIncomes[date];
    save(nd); flash("已删除");
  };

  const saveSettings = () => {
    const nd = {
      ...data,
      settings: {
        ...data.settings,
        dailyIncome: parseFloat(settingsForm.income) || 0,
        initialSavings: parseFloat(settingsForm.savings) || 0,
      }
    };
    save(nd); flash("已保存"); setView("home");
  };

  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", background: "#faf9f6", color: "#ccc" }}>
      加载中...
    </div>
  );

  // Welcome animation
  if (showWelcome) return (
    <WelcomeScreen
      dailyIncome={data.settings.dailyIncome}
      onComplete={() => { setShowWelcome(false); setView("home"); }}
    />
  );

  if (view === "display") return <DisplayMode data={data} onExit={() => setView("home")} />;

  const total = calcTotal(data);
  const info = getTodayInfo(data);
  const needsSetup = !data.settings.dailyIncome;
  const weekdays = ["日", "一", "二", "三", "四", "五", "六"];
  const nowDate = new Date();
  const checkinCount = Object.keys(data.checkins || {}).length;

  const C = {
    bg: "#faf9f6", card: "#ffffff", border: "#eeede9",
    text: "#2a2a28", dim: "#a09c94", red: "#c46060", green: "#5a8a5e",
  };
  const cardS = {
    background: C.card, borderRadius: 16, padding: 20,
    border: `1px solid ${C.border}`, marginBottom: 14,
    boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
  };
  const btnS = (bg = C.text, c = "#fff") => ({
    background: bg, color: c, border: "none", borderRadius: 12,
    padding: "14px 24px", fontSize: 15, fontWeight: 600, cursor: "pointer",
    width: "100%", fontFamily: "inherit",
  });
  const inputS = {
    width: "100%", background: "#faf9f6", border: `1.5px solid ${C.border}`,
    borderRadius: 12, padding: "12px 16px", fontSize: 16, color: C.text,
    fontFamily: "inherit", outline: "none", boxSizing: "border-box",
  };
  const labelS = { fontSize: 12, color: C.dim, marginBottom: 6, display: "block", fontWeight: 500 };

  return (
    <div style={{
      minHeight: "100vh", background: C.bg, color: C.text,
      fontFamily: "'Noto Sans SC', 'PingFang SC', sans-serif",
      maxWidth: 420, margin: "0 auto", padding: "0 18px 30px",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Noto+Sans+SC:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <style>{`
        @keyframes flipTop { 0%{transform:rotateX(0)} 100%{transform:rotateX(-90deg)} }
        @keyframes flipBot { 0%{transform:rotateX(90deg)} 100%{transform:rotateX(0)} }
        @keyframes fadeToast { 0%{opacity:0;transform:translateX(-50%) translateY(-12px)} 15%{opacity:1;transform:translateX(-50%) translateY(0)} 85%{opacity:1} 100%{opacity:0} }
        @keyframes pulse { 0%,100%{opacity:.4} 50%{opacity:1} }
        @keyframes glowPulse { 0%,100%{transform:scale(1);opacity:0.5} 50%{transform:scale(1.1);opacity:1} }
        @keyframes bounceIn { 0%{transform:scale(0.8);opacity:0} 50%{transform:scale(1.05)} 100%{transform:scale(1);opacity:1} }
        input:focus { border-color:#2a2a28 !important; }
        * { box-sizing:border-box; }
      `}</style>

      {toast && (
        <div style={{
          position: "fixed", top: 24, left: "50%", transform: "translateX(-50%)",
          background: C.text, color: "#fff", padding: "10px 28px",
          borderRadius: 24, fontSize: 14, fontWeight: 600, zIndex: 999,
          animation: "fadeToast 2.2s ease forwards",
        }}>{toast}</div>
      )}

      {/* ═══ HOME ═══ */}
      {view === "home" && <>
        <div style={{
          padding: "28px 0 16px", fontSize: 12, color: C.dim, letterSpacing: 2,
          fontFamily: "'DM Mono', monospace",
          display: "flex", justifyContent: "space-between",
        }}>
          <span>{nowDate.toLocaleDateString("zh-CN", { month: "2-digit", day: "2-digit" })} 周{weekdays[nowDate.getDay()]}</span>
          <span>累计打卡 {checkinCount} 天</span>
        </div>

        {/* Main savings card */}
        <div style={{ ...cardS, padding: "32px 20px 28px", textAlign: "center" }}>
          <FlipDisplay value={needsSetup ? 0 : total} label="累 计 储 蓄" />
          <div style={{
            marginTop: 18, fontSize: 14,
            fontFamily: "'DM Mono', monospace",
            color: info.net >= 0 ? C.green : C.red,
          }}>
            今日 {needsSetup ? "—" : `${info.net >= 0 ? "+" : "-"}¥${fmtNum(info.net)}`}
            {!info.checkedIn && !needsSetup && (
              <span style={{ color: C.dim, fontSize: 12, marginLeft: 6 }}>（未打卡）</span>
            )}
          </div>
        </div>

        {/* Setup prompt */}
        {needsSetup && (
          <div style={{ ...cardS, textAlign: "center" }}>
            <div style={{ color: C.dim, fontSize: 14, marginBottom: 14 }}>先设置每日收入开始记录</div>
            <button style={btnS()} onClick={() => {
              setSettingsForm({
                income: String(data.settings.dailyIncome || ""),
                savings: String(data.settings.initialSavings || ""),
                
              });
              setView("settings");
            }}>前往设置</button>
          </div>
        )}

        {/* Actions - 2x2 grid */}
        {!needsSetup && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
            {/* Check-in button */}
            <button onClick={doCheckin} style={{
              ...cardS, margin: 0, cursor: "pointer", textAlign: "center",
              padding: "18px 8px", display: "flex", flexDirection: "column",
              alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600,
              color: info.checkedIn ? C.green : C.text, fontFamily: "inherit",
              background: info.checkedIn ? "#f5faf5" : "#fff",
              border: info.checkedIn ? `1px solid #d4e8d4` : `1px solid ${C.border}`,
            }}>
              <span style={{ fontSize: 24 }}>{info.checkedIn ? "✅" : "🏠"}</span>
              {info.checkedIn ? "已打卡" : "回家打卡"}
            </button>

            {/* Expense button */}
            <button onClick={() => { setOcrResult(null); setManualAmt(""); setManualNote(""); setView("add"); }} style={{
              ...cardS, margin: 0, cursor: "pointer", textAlign: "center",
              padding: "18px 8px", display: "flex", flexDirection: "column",
              alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600,
              color: C.text, fontFamily: "inherit",
            }}>
              <span style={{ fontSize: 24 }}>💸</span>
              记支出
            </button>

            {/* Extra income button */}
            <button onClick={() => { setManualAmt(""); setManualNote(""); setView("addIncome"); }} style={{
              ...cardS, margin: 0, cursor: "pointer", textAlign: "center",
              padding: "18px 8px", display: "flex", flexDirection: "column",
              alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600,
              color: C.text, fontFamily: "inherit",
            }}>
              <span style={{ fontSize: 24 }}>💰</span>
              记收入
            </button>

            {/* Display mode */}
            <button onClick={() => setView("display")} style={{
              ...cardS, margin: 0, cursor: "pointer", textAlign: "center",
              padding: "18px 8px", display: "flex", flexDirection: "column",
              alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600,
              color: C.text, fontFamily: "inherit",
            }}>
              <span style={{ fontSize: 24 }}>🖥</span>
              展示模式
            </button>
          </div>
        )}

        {/* Today summary */}
        {!needsSetup && (info.checkedIn || info.items.length > 0 || info.extraItems.length > 0) && (
          <div style={cardS}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, color: C.dim }}>
              今日明细
            </div>

            {/* Income row */}
            {info.checkedIn && (
              <div style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "10px 0",
                borderBottom: (info.extraItems.length > 0 || info.items.length > 0) ? `1px solid ${C.border}` : "none",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 13 }}>🏠</span>
                  <span style={{ fontSize: 14 }}>工作收入</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 15, fontWeight: 600, fontFamily: "'DM Mono', monospace", color: C.green }}>
                    +¥{fmtNum(data.settings.dailyIncome)}
                  </span>
                  <button onClick={undoCheckin} style={{
                    background: "none", border: "none", color: "#ccc", cursor: "pointer", fontSize: 14, padding: "2px 6px",
                  }}>↩</button>
                </div>
              </div>
            )}

            {/* Extra income rows */}
            {info.extraItems.map((it, i) => (
              <div key={`ei-${i}`} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "10px 0",
                borderBottom: (i < info.extraItems.length - 1 || info.items.length > 0) ? `1px solid ${C.border}` : "none",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 13 }}>💰</span>
                  <span style={{ fontSize: 14 }}>{it.note || "额外收入"}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 15, fontWeight: 600, fontFamily: "'DM Mono', monospace", color: C.green }}>
                    +¥{it.amount.toLocaleString()}
                  </span>
                  <button onClick={() => deleteExtraIncome(getToday(), i)} style={{
                    background: "none", border: "none", color: "#ccc", cursor: "pointer", fontSize: 16, padding: "2px 6px",
                  }}>×</button>
                </div>
              </div>
            ))}

            {/* Expense rows */}
            {info.items.map((it, i) => (
              <div key={`ex-${i}`} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "10px 0",
                borderBottom: i < info.items.length - 1 ? `1px solid ${C.border}` : "none",
              }}>
                <span style={{ fontSize: 14 }}>{it.note || "支出"}</span>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 15, fontWeight: 600, fontFamily: "'DM Mono', monospace", color: C.red }}>
                    -¥{it.amount.toLocaleString()}
                  </span>
                  <button onClick={() => deleteItem(getToday(), i)} style={{
                    background: "none", border: "none", color: "#ccc", cursor: "pointer", fontSize: 16, padding: "2px 6px",
                  }}>×</button>
                </div>
              </div>
            ))}

            {/* Net */}
            <div style={{
              display: "flex", justifyContent: "space-between",
              padding: "12px 0 0", marginTop: 8,
              borderTop: `1.5px solid ${C.border}`,
              fontWeight: 600, fontSize: 14,
            }}>
              <span>今日净值</span>
              <span style={{
                fontFamily: "'DM Mono', monospace",
                color: info.net >= 0 ? C.green : C.red,
              }}>{info.net >= 0 ? "+" : "-"}¥{fmtNum(info.net)}</span>
            </div>
          </div>
        )}

        {/* Bottom nav */}
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => {
            setSettingsForm({
              income: String(data.settings.dailyIncome || ""),
              savings: String(data.settings.initialSavings || ""),
              
            });
            setView("settings");
          }} style={{
            ...cardS, margin: 0, flex: 1, cursor: "pointer", textAlign: "center",
            fontSize: 13, color: C.dim, fontFamily: "inherit", fontWeight: 500,
          }}>⚙️ 设置</button>
          <button onClick={() => setView("history")} style={{
            ...cardS, margin: 0, flex: 1, cursor: "pointer", textAlign: "center",
            fontSize: 13, color: C.dim, fontFamily: "inherit", fontWeight: 500,
          }}>📋 历史</button>
        </div>

        {/* NFC setup hint */}
        {!needsSetup && !info.checkedIn && (
          <div style={{
            marginTop: 10, padding: "14px 16px", borderRadius: 12,
            background: "#f5f5f3", fontSize: 12, color: C.dim, lineHeight: 1.6,
          }}>
            💡 <strong>NFC快捷指令设置：</strong>iPhone快捷指令 → 自动化 → NFC → 选择你的NFC标签 → 添加操作「打开URL」→ 填入此页面地址。扫标签即可自动打卡。
          </div>
        )}
      </>}

      {/* ═══ ADD ═══ */}
      {view === "add" && <>
        <div style={{ display: "flex", alignItems: "center", padding: "22px 0 16px", gap: 12 }}>
          <button onClick={() => { setOcrResult(null); setView("home"); }} style={{
            background: "none", border: "none", color: C.text, fontSize: 22, cursor: "pointer", padding: "4px 8px",
          }}>←</button>
          <span style={{ fontSize: 17, fontWeight: 700 }}>记录支出</span>
        </div>

        <div style={cardS}>
          <div style={{ ...labelS, marginBottom: 12, fontSize: 13 }}>📸 截图识别</div>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{ display: "none" }} />
          <button onClick={() => fileRef.current?.click()} style={{
            ...btnS("#faf9f6", C.text), border: `1.5px dashed ${C.border}`, padding: 22,
          }}>
            {ocrLoading ? <span style={{ animation: "pulse 1.5s infinite" }}>正在识别中...</span> : "点击上传消费截图"}
          </button>

          {ocrResult?.error && (
            <div style={{ marginTop: 12, color: C.red, fontSize: 13, textAlign: "center" }}>{ocrResult.error}</div>
          )}
          {ocrResult?.items?.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: 13, color: C.dim, marginBottom: 8 }}>
                识别到 {ocrResult.items.length} 笔，共 ¥{ocrResult.total?.toLocaleString()}
              </div>
              {ocrResult.items.map((it, i) => (
                <div key={i} style={{
                  display: "flex", justifyContent: "space-between",
                  padding: "8px 0", borderBottom: `1px solid ${C.border}`, fontSize: 14,
                }}>
                  <span style={{ color: C.dim }}>{it.note}</span>
                  <span style={{ fontFamily: "'DM Mono', monospace" }}>¥{it.amount.toLocaleString()}</span>
                </div>
              ))}
              <button onClick={() => addItems(ocrResult.items)} style={{ ...btnS(), marginTop: 14 }}>确认记录</button>
            </div>
          )}
        </div>

        <div style={cardS}>
          <div style={{ ...labelS, marginBottom: 12, fontSize: 13 }}>✏️ 手动输入</div>
          <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
            <div style={{ flex: 1 }}>
              <label style={labelS}>金额</label>
              <MoneyInput placeholder="0" value={manualAmt}
                onChange={v => setManualAmt(v)} style={inputS} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelS}>备注</label>
              <input placeholder="午饭、咖啡..." value={manualNote}
                onChange={e => setManualNote(e.target.value)} style={inputS} />
            </div>
          </div>
          <button onClick={() => {
            const a = parseFloat(manualAmt);
            if (!a || a <= 0) { flash("请输入金额"); return; }
            addItems([{ amount: a, note: manualNote || "支出" }]);
          }} style={btnS()}>记录</button>
        </div>
      </>}

      {/* ═══ ADD INCOME ═══ */}
      {view === "addIncome" && <>
        <div style={{ display: "flex", alignItems: "center", padding: "22px 0 16px", gap: 12 }}>
          <button onClick={() => setView("home")} style={{
            background: "none", border: "none", color: C.text, fontSize: 22, cursor: "pointer", padding: "4px 8px",
          }}>←</button>
          <span style={{ fontSize: 17, fontWeight: 700 }}>记录额外收入</span>
        </div>

        <div style={cardS}>
          <div style={{ ...labelS, marginBottom: 12, fontSize: 13 }}>💰 手动输入</div>
          <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
            <div style={{ flex: 1 }}>
              <label style={labelS}>金额</label>
              <MoneyInput placeholder="0" value={manualAmt}
                onChange={v => setManualAmt(v)} style={inputS} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelS}>备注</label>
              <input placeholder="奖金、补贴、兼职..." value={manualNote}
                onChange={e => setManualNote(e.target.value)} style={inputS} />
            </div>
          </div>
          <button onClick={() => {
            const a = parseFloat(manualAmt);
            if (!a || a <= 0) { flash("请输入金额"); return; }
            addExtraIncome(a, manualNote);
          }} style={btnS(C.green, "#fff")}>记录收入</button>
        </div>

        {/* Today's extra incomes */}
        {(info.extraItems?.length > 0) && (
          <div style={cardS}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10, color: C.dim }}>今日已记录的额外收入</div>
            {info.extraItems.map((it, i) => (
              <div key={i} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "8px 0",
                borderBottom: i < info.extraItems.length - 1 ? `1px solid ${C.border}` : "none", fontSize: 14,
              }}>
                <span>{it.note || "额外收入"}</span>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontFamily: "'DM Mono', monospace", color: C.green }}>+¥{it.amount.toLocaleString()}</span>
                  <button onClick={() => deleteExtraIncome(getToday(), i)} style={{
                    background: "none", border: "none", color: "#ccc", cursor: "pointer", fontSize: 16, padding: "2px 6px",
                  }}>×</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </>}

      {/* ═══ SETTINGS ═══ */}
      {view === "settings" && <>
        <div style={{ display: "flex", alignItems: "center", padding: "22px 0 16px", gap: 12 }}>
          <button onClick={() => setView("home")} style={{
            background: "none", border: "none", color: C.text, fontSize: 22, cursor: "pointer", padding: "4px 8px",
          }}>←</button>
          <span style={{ fontSize: 17, fontWeight: 700 }}>设置</span>
        </div>

        <div style={cardS}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>💰 收入设置</div>
          <div style={{ marginBottom: 14 }}>
            <label style={labelS}>每次打卡收入（元）</label>
            <MoneyInput placeholder="每天回家打卡记入的金额" value={settingsForm.income}
              onChange={v => setSettingsForm(s => ({ ...s, income: v }))} style={inputS} />
            <div style={{ fontSize: 11, color: C.dim, marginTop: 4 }}>
              回家扫NFC或手动打卡时，自动记入此金额
            </div>
          </div>
          <div style={{ marginBottom: 18 }}>
            <label style={labelS}>初始储蓄金额（元）</label>
            <MoneyInput placeholder="当前已有的积蓄" value={settingsForm.savings}
              onChange={v => setSettingsForm(s => ({ ...s, savings: v }))} style={inputS} />
          </div>
          <button onClick={saveSettings} style={btnS()}>保存设置</button>
        </div>

        {/* Stats */}
        <div style={cardS}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>📊 统计</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
            <div style={{ background: "#faf9f6", borderRadius: 10, padding: 12, textAlign: "center" }}>
              <div style={{ fontSize: 22, fontWeight: 700, fontFamily: "'DM Mono', monospace" }}>{checkinCount}</div>
              <div style={{ fontSize: 11, color: C.dim, marginTop: 4 }}>打卡天数</div>
            </div>
            <div style={{ background: "#faf9f6", borderRadius: 10, padding: 12, textAlign: "center" }}>
              <div style={{ fontSize: 22, fontWeight: 700, fontFamily: "'DM Mono', monospace", color: C.green }}>
                ¥{fmtNum(checkinCount * (data.settings.dailyIncome || 0))}
              </div>
              <div style={{ fontSize: 11, color: C.dim, marginTop: 4 }}>工作收入</div>
            </div>
            <div style={{ background: "#faf9f6", borderRadius: 10, padding: 12, textAlign: "center" }}>
              <div style={{ fontSize: 22, fontWeight: 700, fontFamily: "'DM Mono', monospace", color: C.green }}>
                ¥{fmtNum(Object.values(data.extraIncomes || {}).reduce((s, d) => s + (d.items || []).reduce((ss, i) => ss + i.amount, 0), 0))}
              </div>
              <div style={{ fontSize: 11, color: C.dim, marginTop: 4 }}>额外收入</div>
            </div>
          </div>
        </div>

        <div style={{ ...cardS, marginTop: 10 }}>
          <div style={{ ...labelS, color: C.red, marginBottom: 12 }}>危险操作</div>
          <button onClick={async () => {
            if (confirm("确定要清除所有数据吗？")) {
              await save({ ...defaultData });
              setSettingsForm({ income: "", savings: "" });
              flash("已重置");
            }
          }} style={{
            ...btnS("#fef5f5", C.red), border: `1px solid #f0d5d5`,
          }}>清除所有数据</button>
        </div>
      </>}

      {/* ═══ HISTORY ═══ */}
      {view === "history" && <>
        <div style={{ display: "flex", alignItems: "center", padding: "22px 0 16px", gap: 12 }}>
          <button onClick={() => setView("home")} style={{
            background: "none", border: "none", color: C.text, fontSize: 22, cursor: "pointer", padding: "4px 8px",
          }}>←</button>
          <span style={{ fontSize: 17, fontWeight: 700 }}>历史记录</span>
        </div>
        {(() => {
          // Merge checkins, expenses, and extra incomes into daily view
          const allDates = new Set([
            ...Object.keys(data.checkins || {}),
            ...Object.keys(data.expenses || {}),
            ...Object.keys(data.extraIncomes || {}),
          ]);
          const sorted = [...allDates].sort().reverse();
          if (!sorted.length) return (
            <div style={{ textAlign: "center", color: C.dim, padding: 40, fontSize: 14 }}>暂无记录</div>
          );
          return sorted.map(date => {
            const checked = !!data.checkins?.[date];
            const extras = data.extraIncomes?.[date]?.items || [];
            const items = data.expenses[date]?.items || [];
            const inc = checked ? (data.settings.dailyIncome || 0) : 0;
            const extraTotal = extras.reduce((s, i) => s + i.amount, 0);
            const exp = items.reduce((s, i) => s + i.amount, 0);
            const net = inc + extraTotal - exp;
            return (
              <div key={date} style={cardS}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 600, marginBottom: 10, color: C.dim }}>
                  <span>{date}{checked ? " ✓" : ""}</span>
                  <span style={{ color: net >= 0 ? C.green : C.red }}>
                    {net >= 0 ? "+" : "-"}¥{fmtNum(net)}
                  </span>
                </div>
                {checked && (
                  <div style={{
                    display: "flex", justifyContent: "space-between",
                    padding: "6px 0", fontSize: 14, color: C.green,
                    borderBottom: (extras.length || items.length) ? `1px solid ${C.border}` : "none",
                  }}>
                    <span>🏠 工作收入</span>
                    <span style={{ fontFamily: "'DM Mono', monospace" }}>+¥{fmtNum(inc)}</span>
                  </div>
                )}
                {extras.map((it, i) => (
                  <div key={`ei-${i}`} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "6px 0", fontSize: 14, color: C.green,
                    borderBottom: (i < extras.length - 1 || items.length) ? `1px solid ${C.border}` : "none",
                  }}>
                    <span>💰 {it.note || "额外收入"}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontFamily: "'DM Mono', monospace" }}>+¥{it.amount.toLocaleString()}</span>
                      <button onClick={() => deleteExtraIncome(date, i)} style={{
                        background: "none", border: "none", color: "#ccc", cursor: "pointer", fontSize: 16, padding: "2px 6px",
                      }}>×</button>
                    </div>
                  </div>
                ))}
                {items.map((it, i) => (
                  <div key={`ex-${i}`} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "6px 0",
                    borderBottom: i < items.length - 1 ? `1px solid ${C.border}` : "none", fontSize: 14,
                  }}>
                    <span>{it.note || "支出"}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontFamily: "'DM Mono', monospace", color: C.red }}>-¥{it.amount.toLocaleString()}</span>
                      <button onClick={() => deleteItem(date, i)} style={{
                        background: "none", border: "none", color: "#ccc", cursor: "pointer", fontSize: 16, padding: "2px 6px",
                      }}>×</button>
                    </div>
                  </div>
                ))}
              </div>
            );
          });
        })()}
      </>}
    </div>
  );
}