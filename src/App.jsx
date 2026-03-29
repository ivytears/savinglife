import { useState, useEffect, useCallback } from "react";
import FlipDisplay from "./components/FlipClock";
import WelcomeScreen from "./components/WelcomeScreen";
import DisplayMode from "./components/DisplayMode";
import MoneyInput from "./components/MoneyInput";
import { loadData, saveData, defaultData } from "./utils/storage";
import { getToday, fmtNum, calcTotal, getTodayInfo, getWeekGuitarCount, getWeekGuitarDays, getWeekExerciseCount, getConsecutiveSleepDays, isBeforeDeadline, getRewardLevel } from "./utils/calc";
import { COPY } from "./utils/copy";
import {
  IconHome,
  IconCheckCircle,
  IconExpense,
  IconIncome,
  IconMonitor,
  IconSettings,
  IconHistory,
  IconBarChart,
  IconX,
  IconChevronLeft,
  IconGuitar,
  IconMoon,
  IconDumbbell,
  IconStar,
  IconTrophy,
} from "./components/Icons";

const SAFE_AREA_PADDING = "env(safe-area-inset-top, 0px) env(safe-area-inset-right, 0px) env(safe-area-inset-bottom, 0px) env(safe-area-inset-left, 0px)";

export default function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("home");
  const [showWelcome, setShowWelcome] = useState(false);
  const [welcomeType, setWelcomeType] = useState("checkin");
  const [welcomeExtra, setWelcomeExtra] = useState({});
  const [toast, setToast] = useState("");
  const [manualAmt, setManualAmt] = useState("");
  const [manualNote, setManualNote] = useState("");
  const [settingsForm, setSettingsForm] = useState({
    income: "",
    savings: "",
  });

  // 判断日期是否在本周
  const isThisWeek = (dateStr) => {
    const now = new Date();
    const day = now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
    monday.setHours(0, 0, 0, 0);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);
    const d = new Date(dateStr);
    return d >= monday && d <= sunday;
  };

  // 加载数据 + NFC 打卡检测
  useEffect(() => {
    let d = loadData();
    const today = getToday();

    // NFC 打卡 URL 参数检测
    const params = new URLSearchParams(window.location.search);
    const action = params.get("action");
    if (action) {
      window.history.replaceState({}, "", window.location.pathname);
    }

    // 先处理 NFC 动作（修改 d），再 setData，确保状态一致
    let wType = null;
    let wExtra = {};

    if (action === "checkin") {
      if (!d.checkins?.[today] && d.settings.dailyIncome > 0) {
        const income = d.settings.dailyIncome;
        d = { ...d, checkins: { ...d.checkins, [today]: true }, totalSavings: (d.totalSavings || 0) + income, todayIncome: (d.todayIncome || 0) + income, todayDate: today };
        saveData(d);
        wType = "checkin";
      }
    } else if (action === "guitar") {
      if (!d.guitar?.[today]) {
        d = { ...d, guitar: { ...d.guitar, [today]: { time: new Date().toTimeString().slice(0, 5) } } };
        let points = 5;
        d.rewards = { ...d.rewards, totalPoints: (d.rewards?.totalPoints || 0) + points, history: [...(d.rewards?.history || []), { date: today, type: "guitar", points, note: "弹琴打卡 +5" }] };
        const weekCount = getWeekGuitarCount(d);
        const goal = d.settings.guitarGoal || 3;
        if (weekCount >= goal) {
          const thisWeekBonus = d.rewards.history.some(h => h.type === "guitar_weekly" && isThisWeek(h.date));
          if (!thisWeekBonus) {
            d.rewards.totalPoints += 50;
            d.rewards.history.push({ date: today, type: "guitar_weekly", points: 50, note: `本周弹琴达标 ${weekCount}/${goal}` });
            points += 50;
          }
        }
        saveData(d);
        wType = "guitar";
        wExtra = { points, weekInfo: `本周 ${weekCount}/${goal}` };
      }
    } else if (action === "mood_happy") {
      d = { ...d, mood: { ...d.mood, [today]: "happy" } };
      saveData(d);
      wType = "mood_happy";
    } else if (action === "mood_sad") {
      d = { ...d, mood: { ...d.mood, [today]: "sad" } };
      saveData(d);
      wType = "mood_sad";
    } else if (action === "sleep") {
      if (!d.sleep?.[today]) {
        const timeStr = new Date().toTimeString().slice(0, 5);
        const valid = isBeforeDeadline();
        const points = valid ? 10 : 2;
        d = { ...d, sleep: { ...d.sleep, [today]: { time: timeStr, valid } } };
        d.rewards = { ...d.rewards, totalPoints: (d.rewards?.totalPoints || 0) + points, history: [...(d.rewards?.history || []), { date: today, type: "sleep", points, note: valid ? "早睡打卡" : "晚睡安慰分" }] };
        if (valid) {
          const streak = getConsecutiveSleepDays(d);
          if (streak > 0 && streak % 7 === 0) {
            d.rewards.totalPoints += 30;
            d.rewards.history.push({ date: today, type: "sleep_streak", points: 30, note: `连续早睡 ${streak} 天` });
          }
        }
        saveData(d);
        wType = "sleep";
        wExtra = { points, valid };
      }
    } else if (action === "exercise") {
      if (!d.exercise?.[today]) {
        d = { ...d, exercise: { ...d.exercise, [today]: { time: new Date().toTimeString().slice(0, 5) } } };
        let points = 5;
        d.rewards = { ...d.rewards, totalPoints: (d.rewards?.totalPoints || 0) + points, history: [...(d.rewards?.history || []), { date: today, type: "exercise", points, note: "锻炼打卡 +5" }] };
        const weekCount = getWeekExerciseCount(d);
        const goal = d.settings.exerciseGoal || 2;
        if (weekCount >= goal) {
          const bonus = weekCount >= 3 ? 200 : 80;
          const bonusNote = weekCount >= 3 ? `本周锻炼${weekCount}次，超额完成！` : `本周锻炼达标 ${weekCount}/${goal}`;
          d.rewards.totalPoints += bonus;
          d.rewards.history.push({ date: today, type: "exercise_weekly", points: bonus, note: bonusNote });
          points += bonus;
        }
        saveData(d);
        wType = "exercise";
        wExtra = { points, weekInfo: `本周 ${weekCount}/${goal}` };
      }
    }

    // 一次性设置所有状态
    setData(d);
    setLoading(false);
    if (wType) {
      setWelcomeType(wType);
      setWelcomeExtra(wExtra);
      setShowWelcome(true);
    }
  }, []);

  const save = useCallback((d) => {
    setData(d);
    saveData(d);
  }, []);

  const flash = (m) => {
    setToast(m);
    setTimeout(() => setToast(""), 2200);
  };
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  // ─── 打卡 ───
  const doCheckin = () => {
    const today = getToday();
    if (data.checkins?.[today]) {
      flash("今天已经打过卡了");
      return;
    }
    const income = data.settings.dailyIncome;
    const nd = { ...data, checkins: { ...data.checkins, [today]: true }, totalSavings: (data.totalSavings || 0) + income, todayIncome: (data.todayIncome || 0) + income, todayDate: today };
    save(nd);
    setWelcomeType("checkin");
    setWelcomeExtra({});
    setShowWelcome(true);
  };

  const undoCheckin = () => {
    const today = getToday();
    if (!data.checkins?.[today]) return;
    const income = data.settings.dailyIncome;
    const nd = { ...data, checkins: { ...data.checkins }, totalSavings: (data.totalSavings || 0) - income, todayIncome: Math.max(0, (data.todayIncome || 0) - income) };
    delete nd.checkins[today];
    save(nd);
    flash("已撤销今日打卡");
  };

  // ─── 弹琴打卡 ───
  const doGuitar = () => {
    const today = getToday();
    if (data.guitar?.[today]) { flash("今天已经弹过琴了"); return; }
    const nd = { ...data, guitar: { ...data.guitar, [today]: { time: new Date().toTimeString().slice(0, 5) } } };
    let points = 5;
    let note = "弹琴打卡 +5";
    nd.rewards = { ...nd.rewards, totalPoints: (nd.rewards?.totalPoints || 0) + points, history: [...(nd.rewards?.history || []), { date: today, type: "guitar", points, note }] };
    // 检查周目标
    const weekCount = getWeekGuitarCount(nd);
    const goal = nd.settings.guitarGoal || 3;
    if (weekCount >= goal) {
      // 检查本周是否已经发过周奖励
      const thisWeekBonus = nd.rewards.history.some(h => h.type === "guitar_weekly" && isThisWeek(h.date));
      if (!thisWeekBonus) {
        nd.rewards.totalPoints += 50;
        nd.rewards.history.push({ date: today, type: "guitar_weekly", points: 50, note: `本周弹琴达标 ${weekCount}/${goal}` });
        points += 50;
      }
    }
    save(nd);
    setWelcomeType("guitar");
    setWelcomeExtra({ points, weekInfo: `本周 ${weekCount}/${goal}` });
    setShowWelcome(true);
  };

  // ─── 早睡打卡 ───
  const doSleep = () => {
    const today = getToday();
    if (data.sleep?.[today]) { flash("今天已经打过早睡卡了"); return; }
    const timeStr = new Date().toTimeString().slice(0, 5);
    const valid = isBeforeDeadline();
    const points = valid ? 10 : 2;
    const nd = { ...data, sleep: { ...data.sleep, [today]: { time: timeStr, valid } } };
    nd.rewards = { ...nd.rewards, totalPoints: (nd.rewards?.totalPoints || 0) + points, history: [...(nd.rewards?.history || []), { date: today, type: "sleep", points, note: valid ? "早睡打卡" : "晚睡安慰分" }] };
    // 连续早睡奖励
    if (valid) {
      const streak = getConsecutiveSleepDays(nd);
      if (streak > 0 && streak % 7 === 0) {
        nd.rewards.totalPoints += 30;
        nd.rewards.history.push({ date: today, type: "sleep_streak", points: 30, note: `连续早睡 ${streak} 天` });
      }
    }
    save(nd);
    setWelcomeType("sleep");
    setWelcomeExtra({ points, valid });
    setShowWelcome(true);
  };

  // ─── 锻炼打卡 ───
  const doExercise = () => {
    const today = getToday();
    if (data.exercise?.[today]) { flash("今天已经锻炼过了"); return; }
    const nd = { ...data, exercise: { ...data.exercise, [today]: { time: new Date().toTimeString().slice(0, 5) } } };
    let points = 5;
    nd.rewards = { ...nd.rewards, totalPoints: (nd.rewards?.totalPoints || 0) + points, history: [...(nd.rewards?.history || []), { date: today, type: "exercise", points, note: "锻炼打卡 +5" }] };
    // 检查周目标
    const weekCount = getWeekExerciseCount(nd);
    const goal = nd.settings.exerciseGoal || 2;
    if (weekCount >= goal) {
      const thisWeekBonus = nd.rewards.history.some(h => h.type === "exercise_weekly" && isThisWeek(h.date));
      if (!thisWeekBonus) {
        // 达标2次：+80分；达标3次：+200分巨大奖励
        const bonus = weekCount >= 3 ? 200 : 80;
        const bonusNote = weekCount >= 3 ? `本周锻炼${weekCount}次，超额完成！` : `本周锻炼达标 ${weekCount}/${goal}`;
        nd.rewards.totalPoints += bonus;
        nd.rewards.history.push({ date: today, type: "exercise_weekly", points: bonus, note: bonusNote });
        points += bonus;
      } else if (weekCount >= 3) {
        // 已经发过达标奖励，但现在到了3次，补发差额
        const prevBonus = nd.rewards.history.find(h => h.type === "exercise_weekly" && isThisWeek(h.date));
        if (prevBonus && prevBonus.points < 200) {
          const extra = 200 - prevBonus.points;
          nd.rewards.totalPoints += extra;
          nd.rewards.history.push({ date: today, type: "exercise_super", points: extra, note: `第三次锻炼！超额奖励 +${extra}` });
          points += extra;
        }
      }
    }
    save(nd);
    setWelcomeType("exercise");
    setWelcomeExtra({ points, weekInfo: `本周 ${weekCount}/${goal}` });
    setShowWelcome(true);
  };

  // ─── 心情记录 ───
  const doMood = (moodType) => {
    const today = getToday();
    const nd = { ...data, mood: { ...data.mood, [today]: moodType } };
    save(nd);
    setWelcomeType(moodType === "happy" ? "mood_happy" : "mood_sad");
    setWelcomeExtra({});
    setShowWelcome(true);
  };

  // ─── 添加支出 ───
  const addItems = (items) => {
    if (!items?.length) return;
    const today = getToday();
    const isNewDay = data.todayDate !== today;
    const expenseTotal = items.reduce((s, i) => s + (i.amount || 0), 0);
    const prevItems = data.expenses?.[today]?.items || [];
    const todayIncome = isNewDay ? 0 : (data.todayIncome || 0);
    const todayExpense = (isNewDay ? 0 : (data.todayExpense || 0)) + expenseTotal;
    const nd = {
      ...data,
      totalSavings: (data.totalSavings || 0) - expenseTotal,
      todayIncome,
      todayExpense,
      todayDate: today,
      expenses: { ...data.expenses, [today]: { items: [...prevItems, ...items] } },
    };
    save(nd);
    setManualAmt("");
    setManualNote("");
    const net = todayIncome - todayExpense;
    setWelcomeType("daily_summary");
    setWelcomeExtra({ net, subText: `今日收入 ${fmtNum(todayIncome)} - 支出 ${fmtNum(todayExpense)}｜总储蓄 ${fmtNum(nd.totalSavings)}` });
    setShowWelcome(true);
  };

  // ─── 添加额外收入 ───
  const addExtraIncome = (amount, note) => {
    if (!amount || amount <= 0) return;
    const today = getToday();
    const isNewDay = data.todayDate !== today;
    const prevItems = data.extraIncomes?.[today]?.items || [];
    const nd = {
      ...data,
      totalSavings: (data.totalSavings || 0) + amount,
      todayIncome: (isNewDay ? 0 : (data.todayIncome || 0)) + amount,
      todayExpense: isNewDay ? 0 : (data.todayExpense || 0),
      todayDate: today,
      extraIncomes: { ...data.extraIncomes, [today]: { items: [...prevItems, { amount, note: note || "额外收入" }] } },
    };
    save(nd);
    flash(pick(COPY.income));
    setManualAmt("");
    setManualNote("");
    setView("home");
  };

  const deleteItem = (date, idx) => {
    const today = getToday();
    const nd = { ...data, expenses: { ...data.expenses } };
    nd.expenses[date] = {
      ...nd.expenses[date],
      items: [...nd.expenses[date].items],
    };
    const removed = nd.expenses[date].items[idx];
    const amt = removed?.amount || 0;
    nd.expenses[date].items.splice(idx, 1);
    if (!nd.expenses[date].items.length) delete nd.expenses[date];
    // 回调 totalSavings，如果是今天的支出也要减少 todayExpense
    nd.totalSavings = (nd.totalSavings || 0) + amt;
    if (date === today) {
      nd.todayExpense = Math.max(0, (nd.todayExpense || 0) - amt);
    }
    save(nd);
    flash("已删除");
  };

  const deleteExtraIncome = (date, idx) => {
    const today = getToday();
    const nd = { ...data, extraIncomes: { ...(data.extraIncomes || {}) } };
    nd.extraIncomes[date] = {
      ...nd.extraIncomes[date],
      items: [...nd.extraIncomes[date].items],
    };
    const removed = nd.extraIncomes[date].items[idx];
    const amt = removed?.amount || 0;
    nd.extraIncomes[date].items.splice(idx, 1);
    if (!nd.extraIncomes[date].items.length) delete nd.extraIncomes[date];
    // 回调 totalSavings，如果是今天的收入也要减少 todayIncome
    nd.totalSavings = (nd.totalSavings || 0) - amt;
    if (date === today) {
      nd.todayIncome = Math.max(0, (nd.todayIncome || 0) - amt);
    }
    save(nd);
    flash("已删除");
  };

  // ─── 保存设置 ───
  const saveSettings = () => {
    const nd = {
      ...data,
      totalSavings: parseFloat(settingsForm.savings) || data.totalSavings || 0,
      settings: {
        ...data.settings,
        dailyIncome: parseFloat(settingsForm.income) || 0,
        configured: true,
      },
    };
    save(nd);
    flash("已保存");
    setView("home");
  };

  // ─── 加载中 ───
  if (loading)
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          background: "#f8f5f0",
          color: "#9e9285",
          fontSize: 15,
        }}
      >
        加载中...
      </div>
    );

  if (!data) return null;

  // ─── 欢迎动画 ───
  if (showWelcome)
    return (
      <WelcomeScreen
        type={welcomeType}
        dailyIncome={data.settings.dailyIncome}
        extra={welcomeExtra}
        data={data}
        onComplete={() => {
          setShowWelcome(false);
          // 回家打卡后自动弹出支出输入
          if (welcomeType === "checkin") {
            setManualAmt("");
            setManualNote("");
            setView("add");
          } else {
            setView("home");
          }
        }}
      />
    );

  // ─── 展示模式 ───
  if (view === "display")
    return <DisplayMode data={data} onExit={() => setView("home")} />;

  const total = calcTotal(data);
  const info = getTodayInfo(data);
  const needsSetup = !data.settings.configured;
  const weekdays = ["日", "一", "二", "三", "四", "五", "六"];
  const nowDate = new Date();
  const checkinCount = Object.keys(data.checkins || {}).length;

  const C = {
    dim: "#9e9285",
    red: "#d45a4a",
    green: "#5a9e78",
    cyan: "#3d3225",
    text: "#3d3225",
    purple: "#9475c2",
    indigo: "#6878b8",
    orange: "#c47d5a",
    blue: "#3d3225",
  };

  // 奖励等级
  const level = getRewardLevel(data.rewards?.totalPoints || 0);

  // 本周打卡数据
  const weekGuitarCount = getWeekGuitarCount(data);
  const guitarGoal = data.settings?.guitarGoal || 3;
  const weekExerciseCount = getWeekExerciseCount(data);
  const exerciseGoal = data.settings?.exerciseGoal || 2;

  return (
    <div className="app-container">
      {/* Toast */}
      {toast && <div className="toast">{toast}</div>}

      {/* ═══ 首页 ═══ */}
      {view === "home" && (
        <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", padding: "0 0 8px" }}>

          {/* 顶栏：日期 + 心情 + 积分 */}
          <div style={{
            padding: "16px 0 8px",
            paddingTop: "max(16px, env(safe-area-inset-top, 0px))",
            fontSize: 13, color: C.dim, letterSpacing: "0.02em",
            fontFamily: "'SF Pro Display', -apple-system, sans-serif",
            display: "flex", justifyContent: "space-between", alignItems: "center",
            fontWeight: 500,
          }}>
            <span>
              {nowDate.toLocaleDateString("zh-CN", { month: "2-digit", day: "2-digit" })}{" "}
              周{weekdays[nowDate.getDay()]}
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {!needsSetup && (
                <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={() => doMood("happy")} style={{
                    width: 38, height: 38, borderRadius: "50%", border: "none", cursor: "pointer",
                    background: data.mood?.[getToday()] === "happy" ? "rgba(90,158,120,0.15)" : "#f0ebe3",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 22, transition: "all 0.2s",
                    transform: data.mood?.[getToday()] === "happy" ? "scale(1.1)" : "scale(1)",
                  }}>
                    😊
                  </button>
                  <button onClick={() => doMood("sad")} style={{
                    width: 38, height: 38, borderRadius: "50%", border: "none", cursor: "pointer",
                    background: data.mood?.[getToday()] === "sad" ? "rgba(104,120,184,0.15)" : "#f0ebe3",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 22, transition: "all 0.2s",
                    transform: data.mood?.[getToday()] === "sad" ? "scale(1.1)" : "scale(1)",
                  }}>
                    🫂
                  </button>
                </div>
              )}
              <span style={{ display: "flex", alignItems: "center", gap: 4, cursor: "pointer", fontSize: 13, fontWeight: 600 }} onClick={() => setView("rewards")}>
                <IconStar size={14} color={C.orange} style={{ fill: C.orange }} />
                {data.rewards?.totalPoints || 0}
              </span>
            </div>
          </div>

          {/* 储蓄数字 */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 0 }}>
            <FlipDisplay value={needsSetup ? 0 : total} />
            {!needsSetup && (
              <div
                key={info.net}
                style={{
                  marginTop: 12, fontSize: 14,
                  fontFamily: "'SF Pro Display', -apple-system, sans-serif",
                  fontWeight: 600,
                  color: info.net >= 0 ? C.green : C.red,
                  animation: "bounceIn 0.4s cubic-bezier(0.34,1.56,0.64,1)",
                }}
              >
                今日 {info.net >= 0 ? "+" : "-"}{fmtNum(info.net)}
              </div>
            )}
          </div>

          {/* 首次设置引导 */}
          {needsSetup && (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div style={{ color: C.dim, fontSize: 14, marginBottom: 16 }}>
                先设置每日收入开始记录
              </div>
              <button className="btn-primary" onClick={() => {
                setSettingsForm({
                  income: String(data.settings.dailyIncome || ""),
                  savings: String(data.totalSavings || ""),
                });
                setView("settings");
              }}>
                前往设置
              </button>
            </div>
          )}

          {/* 打卡按钮 */}
          {!needsSetup && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
              {/* 回家打卡 */}
              <button className="action-btn" onClick={doCheckin} style={{
                flex: 1, flexDirection: "row", padding: "14px 12px", gap: 8,
                ...(info.checkedIn ? { background: "rgba(90,158,120,0.12)", color: C.green, animation: "popIn 0.4s ease" } : {}),
              }}>
                <span style={info.checkedIn ? { animation: "bounceIn 0.45s cubic-bezier(0.34,1.56,0.64,1)" } : {}}>
                  {info.checkedIn ? <IconCheckCircle size={22} color={C.green} /> : <IconHome size={22} color="#3d3225" />}
                </span>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{info.checkedIn ? "已打卡" : "回家"}</span>
              </button>

              {/* 弹琴打卡 */}
              <button className="action-btn" onClick={doGuitar} style={{
                flex: 1, flexDirection: "row", padding: "14px 12px", gap: 8,
                ...(data.guitar?.[getToday()] ? { background: "rgba(148,117,194,0.12)", color: C.purple, animation: "popIn 0.4s ease" } : {}),
              }}>
                <span style={data.guitar?.[getToday()] ? { animation: "bounceIn 0.45s cubic-bezier(0.34,1.56,0.64,1)" } : {}}>
                  {data.guitar?.[getToday()] ? <IconCheckCircle size={22} color={C.purple} /> : <IconGuitar size={22} color={C.purple} />}
                </span>
                <span style={{ fontSize: 13, fontWeight: 600 }}>
                  {data.guitar?.[getToday()] ? "已练琴" : "弹琴"}
                  <span style={{ fontSize: 11, color: C.dim, marginLeft: 4 }}>{weekGuitarCount}/{guitarGoal}</span>
                </span>
              </button>

              {/* 锻炼打卡 */}
              <button className="action-btn" onClick={doExercise} style={{
                flex: 1, flexDirection: "row", padding: "14px 12px", gap: 8,
                ...(data.exercise?.[getToday()] ? { background: "rgba(196,125,90,0.12)", color: C.orange, animation: "popIn 0.4s ease" } : {}),
              }}>
                <span style={data.exercise?.[getToday()] ? { animation: "bounceIn 0.45s cubic-bezier(0.34,1.56,0.64,1)" } : {}}>
                  {data.exercise?.[getToday()] ? <IconCheckCircle size={22} color={C.orange} /> : <IconDumbbell size={22} color={C.orange} />}
                </span>
                <span style={{ fontSize: 13, fontWeight: 600 }}>
                  {data.exercise?.[getToday()] ? "已锻炼" : "锻炼"}
                  <span style={{ fontSize: 10, color: C.dim, marginLeft: 3 }}>{weekExerciseCount}/{exerciseGoal}</span>
                </span>
              </button>

              {/* 早睡打卡 */}
              <button className="action-btn" onClick={doSleep} style={{
                flex: 1, flexDirection: "row", padding: "14px 12px", gap: 8,
                ...(data.sleep?.[getToday()] ? { background: "rgba(104,120,184,0.12)", color: C.indigo, animation: "popIn 0.4s ease" } : {}),
              }}>
                <span style={data.sleep?.[getToday()] ? { animation: "bounceIn 0.45s cubic-bezier(0.34,1.56,0.64,1)" } : {}}>
                  {data.sleep?.[getToday()] ? <IconCheckCircle size={22} color={C.indigo} /> : <IconMoon size={22} color={C.indigo} />}
                </span>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{data.sleep?.[getToday()] ? (data.sleep[getToday()].valid ? "已早睡" : "晚了") : "早睡"}</span>
              </button>
            </div>
          )}

          {/* 底部功能栏：支出 / 收入 / 展示 / 设置 / 历史 / 奖励 */}
          <div style={{ display: "flex", gap: 6, paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
            {!needsSetup && (
              <>
                <button className="nav-btn" style={{ padding: "12px 8px", fontSize: 12 }}
                  onClick={() => { setManualAmt(""); setManualNote(""); setView("add"); }}>
                  <IconExpense size={18} color={C.red} /> 支出
                </button>
                <button className="nav-btn" style={{ padding: "12px 8px", fontSize: 12 }}
                  onClick={() => { setManualAmt(""); setManualNote(""); setView("addIncome"); }}>
                  <IconIncome size={18} color={C.green} /> 收入
                </button>
                <button className="nav-btn" style={{ padding: "12px 8px", fontSize: 12 }}
                  onClick={() => setView("display")}>
                  <IconMonitor size={18} color={C.indigo} /> 展示
                </button>
              </>
            )}
            <button className="nav-btn" style={{ padding: "12px 8px", fontSize: 12 }}
              onClick={() => { setSettingsForm({ income: String(data.settings.dailyIncome || ""), savings: String(data.totalSavings || "") }); setView("settings"); }}>
              <IconSettings size={16} color="#9e9285" /> 设置
            </button>
            <button className="nav-btn" style={{ padding: "12px 8px", fontSize: 12 }}
              onClick={() => setView("history")}>
              <IconHistory size={16} color="#9e9285" /> 历史
            </button>
            <button className="nav-btn" style={{ padding: "12px 8px", fontSize: 12 }}
              onClick={() => setView("rewards")}>
              <IconTrophy size={18} color={C.orange} /> 奖励
            </button>
          </div>

        </div>
      )}

      {/* ═══ 记录支出（弹窗） ═══ */}
      {view === "add" && (() => {
        const todayInfo = getTodayInfo(data);
        const pendingAmt = parseFloat(manualAmt) || 0;
        const netAfter = todayInfo.income - todayInfo.expense - pendingAmt;
        return (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(61,50,37,0.4)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 100, animation: "fadeIn 0.2s ease",
          padding: SAFE_AREA_PADDING,
        }} onClick={(e) => { if (e.target === e.currentTarget) setView("home"); }}>
          <div style={{
            background: "#f8f5f0", borderRadius: 20, padding: "28px 24px", width: "90%", maxWidth: 360,
            boxShadow: "0 20px 60px rgba(61,50,37,0.15)",
            animation: "slideUp 0.32s cubic-bezier(0.34, 1.4, 0.64, 1)",
          }}>
            {/* 今日净收入 */}
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <div style={{ fontSize: 12, color: C.dim, marginBottom: 8 }}>今日实际收入</div>
              <div style={{
                fontSize: 42, fontWeight: 700, letterSpacing: "-0.02em",
                fontFamily: "'SF Pro Display', -apple-system, sans-serif",
                color: netAfter >= 0 ? C.green : C.red,
                lineHeight: 1,
              }}>
                {netAfter >= 0 ? "+" : "-"}{fmtNum(netAfter)}
              </div>
              {todayInfo.expense > 0 && (
                <div style={{ fontSize: 12, color: C.dim, marginTop: 8 }}>
                  收入 {fmtNum(todayInfo.income)} - 已支出 {fmtNum(todayInfo.expense)}{pendingAmt > 0 ? ` - 待记 ${fmtNum(pendingAmt)}` : ""}
                </div>
              )}
            </div>

            <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 14, textAlign: "center" }}>记录支出</div>
            <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 12, color: C.dim, marginBottom: 6, display: "block", fontWeight: 500 }}>金额</label>
                <MoneyInput placeholder="0" value={manualAmt} onChange={(v) => setManualAmt(v)} className="input" />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 12, color: C.dim, marginBottom: 6, display: "block", fontWeight: 500 }}>备注</label>
                <input className="input" placeholder="午饭、咖啡..." value={manualNote} onChange={(e) => setManualNote(e.target.value)} />
              </div>
            </div>
            <button className="btn-primary" onClick={() => {
              const a = parseFloat(manualAmt);
              if (!a || a <= 0) { flash("请输入金额"); return; }
              addItems([{ amount: a, note: manualNote || "支出" }]);
            }}>
              记录
            </button>
          </div>
        </div>
        );
      })()}

      {/* ═══ 记录额外收入（弹窗） ═══ */}
      {view === "addIncome" && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(61,50,37,0.4)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 100, animation: "fadeIn 0.2s ease",
          padding: SAFE_AREA_PADDING,
        }} onClick={(e) => { if (e.target === e.currentTarget) setView("home"); }}>
          <div style={{
            background: "#f8f5f0", borderRadius: 20, padding: "28px 24px", width: "90%", maxWidth: 360,
            boxShadow: "0 20px 60px rgba(61,50,37,0.15)",
            animation: "slideUp 0.32s cubic-bezier(0.34, 1.4, 0.64, 1)",
          }}>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, textAlign: "center" }}>记录收入</div>
            <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 12, color: C.dim, marginBottom: 6, display: "block", fontWeight: 500 }}>金额</label>
                <MoneyInput placeholder="0" value={manualAmt} onChange={(v) => setManualAmt(v)} className="input" />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 12, color: C.dim, marginBottom: 6, display: "block", fontWeight: 500 }}>备注</label>
                <input className="input" placeholder="奖金、补贴、兼职..." value={manualNote} onChange={(e) => setManualNote(e.target.value)} />
              </div>
            </div>
            <button className="btn-primary btn-green" onClick={() => {
              const a = parseFloat(manualAmt);
              if (!a || a <= 0) { flash("请输入金额"); return; }
              addExtraIncome(a, manualNote);
            }}>
              记录收入
            </button>
          </div>
        </div>
      )}

      {/* ═══ 设置 ═══ */}
      {view === "settings" && (
        <div style={{ animation: "slideIn 0.25s ease" }}>
          <div className="page-header">
            <button className="back-btn" onClick={() => setView("home")}>
              <IconChevronLeft size={24} />
            </button>
            <span className="page-title">设置</span>
          </div>

          <div className="card">
            <div className="section-title">
              <IconIncome size={18} color={C.green} />
              收入设置
            </div>
            <div style={{ marginBottom: 16 }}>
              <label
                style={{
                  fontSize: 12,
                  color: C.dim,
                  marginBottom: 6,
                  display: "block",
                  fontWeight: 500,
                }}
              >
                每次打卡收入（元）
              </label>
              <MoneyInput
                placeholder="每天回家打卡记入的金额"
                value={settingsForm.income}
                onChange={(v) =>
                  setSettingsForm((s) => ({ ...s, income: v }))
                }
                style={{}}
                className="input"
              />
              <div style={{ fontSize: 11, color: C.dim, marginTop: 5 }}>
                回家扫 NFC 或手动打卡时，自动记入此金额
              </div>
            </div>
            <div>
              <label
                style={{
                  fontSize: 12,
                  color: C.dim,
                  marginBottom: 6,
                  display: "block",
                  fontWeight: 500,
                }}
              >
                总储蓄金额
              </label>
              <MoneyInput
                placeholder="直接修改总储蓄"
                value={settingsForm.savings}
                onChange={(v) =>
                  setSettingsForm((s) => ({ ...s, savings: v }))
                }
                style={{}}
                className="input"
              />
            </div>
          </div>

          <button
            className="btn-primary"
            onClick={saveSettings}
            style={{ marginBottom: 18 }}
          >
            保存设置
          </button>

          {/* 统计 */}
          <div className="card">
            <div className="section-title">
              <IconBarChart size={18} color="#888" />
              统计
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: 10,
              }}
            >
              <div
                style={{
                  background: "#e8e2d8",
                  borderRadius: 12,
                  padding: 14,
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontSize: 24,
                    fontWeight: 700,
                    fontFamily: "'SF Pro Display', -apple-system, sans-serif",
                  }}
                >
                  {checkinCount}
                </div>
                <div style={{ fontSize: 11, color: C.dim, marginTop: 5 }}>
                  打卡天数
                </div>
              </div>
              <div
                style={{
                  background: "#e8e2d8",
                  borderRadius: 12,
                  padding: 14,
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontSize: 24,
                    fontWeight: 700,
                    fontFamily: "'SF Pro Display', -apple-system, sans-serif",
                    color: C.green,
                  }}
                >
                  {fmtNum(checkinCount * (data.settings.dailyIncome || 0))}
                </div>
                <div style={{ fontSize: 11, color: C.dim, marginTop: 5 }}>
                  工作收入
                </div>
              </div>
              <div
                style={{
                  background: "#e8e2d8",
                  borderRadius: 12,
                  padding: 14,
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontSize: 24,
                    fontWeight: 700,
                    fontFamily: "'SF Pro Display', -apple-system, sans-serif",
                    color: C.green,
                  }}
                >
                                    {fmtNum(
                    Object.values(data.extraIncomes || {}).reduce(
                      (s, d) =>
                        s +
                        (d.items || []).reduce(
                          (ss, i) => ss + i.amount,
                          0
                        ),
                      0
                    )
                  )}
                </div>
                <div style={{ fontSize: 11, color: C.dim, marginTop: 5 }}>
                  额外收入
                </div>
              </div>
            </div>
          </div>

          <div className="card" style={{ marginTop: 4 }}>
            <div
              style={{
                fontSize: 12,
                color: C.red,
                marginBottom: 12,
                fontWeight: 500,
              }}
            >
              危险操作
            </div>
            <button
              className="btn-danger"
              onClick={() => {
                if (confirm("确定要清除所有数据吗？")) {
                  save({ ...defaultData });
                  setSettingsForm({ income: "", savings: "" });
                  flash("已重置");
                }
              }}
            >
              清除所有数据
            </button>
          </div>
        </div>
      )}

      {/* ═══ 历史 ═══ */}
      {view === "history" && (
        <div style={{ animation: "slideIn 0.25s ease" }}>
          <div className="page-header">
            <button className="back-btn" onClick={() => setView("home")}>
              <IconChevronLeft size={24} />
            </button>
            <span className="page-title">历史记录</span>
          </div>
          {(() => {
            const allDates = new Set([
              ...Object.keys(data.checkins || {}),
              ...Object.keys(data.expenses || {}),
              ...Object.keys(data.extraIncomes || {}),
            ]);
            const sorted = [...allDates].sort().reverse();
            if (!sorted.length)
              return (
                <div
                  style={{
                    textAlign: "center",
                    color: C.dim,
                    padding: 50,
                    fontSize: 14,
                  }}
                >
                  暂无记录
                </div>
              );
            return sorted.map((date, idx) => {
              const checked = !!data.checkins?.[date];
              const extras = data.extraIncomes?.[date]?.items || [];
              const items = data.expenses?.[date]?.items || [];
              const inc = checked ? (data.settings.dailyIncome || 0) : 0;
              const extraTotal = extras.reduce((s, i) => s + i.amount, 0);
              const exp = items.reduce((s, i) => s + i.amount, 0);
              const net = inc + extraTotal - exp;
              return (
                <div key={date} className="card" style={{ animation: `cardIn 0.3s ease ${Math.min(idx * 0.05, 0.3)}s both` }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: 13,
                      fontWeight: 600,
                      marginBottom: 10,
                      color: C.dim,
                    }}
                  >
                    <span>
                      {date}
                      {checked && (
                        <IconCheckCircle
                          size={13}
                          color={C.green}
                          style={{
                            marginLeft: 6,
                            verticalAlign: "middle",
                          }}
                        />
                      )}
                    </span>
                    <span style={{ color: net >= 0 ? C.green : C.red }}>
                      {net >= 0 ? "+" : "-"}{fmtNum(net)}
                    </span>
                  </div>
                  {checked && (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "8px 0",
                        fontSize: 14,
                        color: C.green,
                        borderBottom:
                          extras.length || items.length
                            ? "1px solid rgba(61,50,37,0.06)"
                            : "none",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <IconHome size={14} color={C.green} />
                        工作收入
                      </div>
                      <span style={{ fontFamily: "'SF Pro Display', -apple-system, sans-serif" }}>
                        +{fmtNum(inc)}
                      </span>
                    </div>
                  )}
                  {extras.map((it, i) => (
                    <div
                      key={`ei-${i}`}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "8px 0",
                        fontSize: 14,
                        color: C.green,
                        borderBottom:
                          i < extras.length - 1 || items.length
                            ? "1px solid rgba(61,50,37,0.06)"
                            : "none",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <IconIncome size={14} color={C.green} />
                        {it.note || "额外收入"}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                        }}
                      >
                        <span style={{ fontFamily: "'SF Pro Display', -apple-system, sans-serif" }}>
                          +{it.amount.toLocaleString()}
                        </span>
                        <button
                          className="icon-btn"
                          onClick={() => deleteExtraIncome(date, i)}
                        >
                          <IconX size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                  {items.map((it, i) => (
                    <div
                      key={`ex-${i}`}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "8px 0",
                        borderBottom:
                          i < items.length - 1
                            ? "1px solid rgba(61,50,37,0.06)"
                            : "none",
                        fontSize: 14,
                      }}
                    >
                      <span>{it.note || "支出"}</span>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                        }}
                      >
                        <span
                          style={{
                            fontFamily: "'SF Pro Display', -apple-system, sans-serif",
                            color: C.red,
                          }}
                        >
                          -{it.amount.toLocaleString()}
                        </span>
                        <button
                          className="icon-btn"
                          onClick={() => deleteItem(date, i)}
                        >
                          <IconX size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              );
            });
          })()}
        </div>
      )}

      {/* ═══ 奖励 ═══ */}
      {view === "rewards" && (
        <div style={{ animation: "fadeIn 0.25s ease" }}>
          <div className="page-header">
            <button className="back-btn" onClick={() => setView("home")}><IconChevronLeft size={24} /></button>
            <span className="page-title">奖励</span>
          </div>

          {/* 积分总览 */}
          <div className="card" style={{ textAlign: "center", padding: "32px 20px" }}>
            <div style={{ fontSize: 52, fontWeight: 700, letterSpacing: "-0.02em", fontFamily: "'SF Pro Display', -apple-system, sans-serif", color: "#3d3225", lineHeight: 1 }}>
              {data.rewards?.totalPoints || 0}
            </div>
            <div style={{ fontSize: 12, color: C.dim, marginTop: 6, letterSpacing: 0.5 }}>总积分</div>
            <div style={{ marginTop: 14, display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 18px", borderRadius: 20, background: `${level.color}1a`, color: level.color, fontSize: 13, fontWeight: 700 }}>
              <IconTrophy size={13} color={level.color} />
              {level.name}
            </div>
            {level.description && (
              <div style={{ fontSize: 12, color: "#b5a899", marginTop: 10, fontStyle: "italic", lineHeight: 1.6, maxWidth: 260, margin: "10px auto 0" }}>
                {level.description}
              </div>
            )}
            {level.next && (
              <div style={{ marginTop: 16 }}>
                <div style={{ height: 6, borderRadius: 3, background: "#e2dbd0", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${level.progress * 100}%`, background: level.color, borderRadius: 3, transition: "width 0.6s ease" }} />
                </div>
                <div style={{ fontSize: 11, color: "#b5a899", marginTop: 5 }}>距 {level.next} 分还差 {level.next - (data.rewards?.totalPoints || 0)} 分</div>
              </div>
            )}
          </div>

          {/* 统计 */}
          <div className="card">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, textAlign: "center" }}>
              <div style={{ padding: "8px 0" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginBottom: 6 }}>
                  <IconGuitar size={15} color={C.purple} />
                  <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.01em", fontFamily: "'SF Pro Display', -apple-system, sans-serif", color: C.purple }}>{Object.keys(data.guitar || {}).length}</div>
                </div>
                <div style={{ fontSize: 11, color: C.dim }}>弹琴总次数</div>
              </div>
              <div style={{ padding: "8px 0" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginBottom: 6 }}>
                  <IconDumbbell size={15} color={C.orange} />
                  <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.01em", fontFamily: "'SF Pro Display', -apple-system, sans-serif", color: C.orange }}>{Object.keys(data.exercise || {}).length}</div>
                </div>
                <div style={{ fontSize: 11, color: C.dim }}>锻炼总次数</div>
              </div>
              <div style={{ padding: "8px 0" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginBottom: 6 }}>
                  <IconMoon size={15} color={C.indigo} />
                  <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.01em", fontFamily: "'SF Pro Display', -apple-system, sans-serif", color: C.indigo }}>{Object.values(data.sleep || {}).filter(s => s.valid).length}</div>
                </div>
                <div style={{ fontSize: 11, color: C.dim }}>早睡总天数</div>
              </div>
              <div style={{ padding: "8px 0" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginBottom: 6 }}>
                  <IconCheckCircle size={15} color={C.green} />
                  <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.01em", fontFamily: "'SF Pro Display', -apple-system, sans-serif", color: C.green }}>{getConsecutiveSleepDays(data)}</div>
                </div>
                <div style={{ fontSize: 11, color: C.dim }}>连续早睡</div>
              </div>
            </div>
          </div>

          {/* 积分历史 */}
          <div className="card">
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, color: C.dim }}>积分记录</div>
            {(data.rewards?.history || []).slice(-20).reverse().map((h, i) => (
              <div key={i} style={{
                display: "flex", justifyContent: "space-between", padding: "8px 0",
                borderBottom: i < Math.min(19, (data.rewards?.history || []).length - 1) ? "1px solid rgba(61,50,37,0.06)" : "none",
                fontSize: 13,
                animation: `cardIn 0.25s ease ${Math.min(i * 0.04, 0.3)}s both`,
              }}>
                <div>
                  <div>{h.note}</div>
                  <div style={{ fontSize: 11, color: "#b5a899" }}>{h.date}</div>
                </div>
                <span style={{ color: C.green, fontFamily: "'SF Pro Display', -apple-system, sans-serif", fontWeight: 600 }}>+{h.points}</span>
              </div>
            ))}
            {(!data.rewards?.history || data.rewards.history.length === 0) && (
              <div style={{ textAlign: "center", color: "#b5a899", padding: 20, fontSize: 13 }}>暂无记录</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
