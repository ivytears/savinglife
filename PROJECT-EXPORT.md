# Saving Life — 项目完整导出

> 储蓄翻页钟 + 习惯打卡 + 奖励系统

---

## `package.json`

```json
{
  "name": "savinglife-app",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint .",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^19.2.4",
    "react-dom": "^19.2.4"
  },
  "devDependencies": {
    "@eslint/js": "^9.39.4",
    "@types/react": "^19.2.14",
    "@types/react-dom": "^19.2.3",
    "@vitejs/plugin-react": "^6.0.1",
    "eslint": "^9.39.4",
    "eslint-plugin-react-hooks": "^7.0.1",
    "eslint-plugin-react-refresh": "^0.5.2",
    "globals": "^17.4.0",
    "vite": "^8.0.1"
  }
}

```

---

## `vite.config.js`

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
})

```

---

## `index.html`

```html
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <meta name="apple-mobile-web-app-title" content="储蓄钟" />
    <meta name="theme-color" content="#0a0e1a" />
    <link rel="manifest" href="/manifest.json" />
    <link rel="apple-touch-icon" href="/icon-192.png" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <!-- 使用系统字体，无需加载外部字体 -->
    <title>储蓄翻页钟</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>

```

---

## `PROJECT-HANDOFF.md`

```md
# 储蓄翻页钟 — 项目交接文档

## 项目概述
一个储蓄金额实时展示应用，翻页钟风格显示累计储蓄数字。用户通过NFC打卡记录工作收入，手动记录支出和额外收入，最终部署在iPad上长期全屏展示。

## 当前状态
- 功能原型已在 Claude.ai 中完成（单文件 React 组件）
- UI风格：简约白色背景 + 大黑字翻页钟
- 所有功能逻辑已实现，需要转为可独立部署的 PWA

## 核心功能

### 1. 回家打卡（NFC触发）
- 扫NFC标签 → 打开应用 → 播放「欢迎主人回家」动画 → 自动记入当日工作收入
- 每天只能打卡一次，可撤销
- iPhone快捷指令 → 自动化 → NFC → 打开URL

### 2. 记录支出
- 截图识别：上传微信/支付宝消费截图，AI（Claude API）自动OCR识别金额
- 手动输入：金额 + 备注
- 图片上传前自动压缩至1200px宽

### 3. 记录额外收入
- 手动输入任意金额的额外收入（奖金、补贴、兼职等）
- 与工作收入分开统计

### 4. 展示模式
- 全屏翻页钟显示累计储蓄总额
- 显示日期、时间、今日净值
- 适合iPad长期全屏展示

### 5. 数据结构
```json
{
  "settings": {
    "dailyIncome": 1400,
    "initialSavings": 5000
  },
  "checkins": {
    "2026-03-24": true
  },
  "expenses": {
    "2026-03-24": {
      "items": [{"amount": 50, "note": "午饭"}]
    }
  },
  "extraIncomes": {
    "2026-03-24": {
      "items": [{"amount": 200, "note": "兼职"}]
    }
  }
}
```

### 6. 计算逻辑
```
累计储蓄 = 初始储蓄 + (打卡天数 × 每日收入) + 全部额外收入 - 全部支出
今日净值 = 今日工作收入(打卡才有) + 今日额外收入 - 今日支出
```

## 部署需求

### 目标
部署为 PWA（渐进式网页应用），iPad Safari 添加到主屏幕后全屏运行。

### 需要改造的部分

1. **数据存储**
   - 当前：`window.storage`（Claude.ai 专属API）
   - 改为：Supabase / Firebase / 或本地 IndexedDB + 云同步
   - 需要支持多设备同步（iPhone录入，iPad展示）

2. **截图OCR**
   - 当前：通过 Claude.ai 内置通道调用 Anthropic API
   - 改为：需要用户自己的 Anthropic API Key，或替换为其他OCR方案
   - 注意：用户在中国大陆，需考虑API可达性（通过VPN/代理）

3. **NFC打卡集成**
   - iPhone快捷指令打开特定URL，URL带参数触发自动打卡
   - 例如：`https://your-domain.com/?action=checkin`
   - 应用检测URL参数后自动执行打卡流程

4. **PWA配置**
   - manifest.json（全屏、横屏/竖屏、图标）
   - Service Worker（离线缓存）
   - iOS status bar 适配（meta viewport、apple-mobile-web-app-capable）

5. **iPad展示优化**
   - 展示模式防息屏（Wake Lock API 或视频hack）
   - 横屏/竖屏自适应
   - 9:30 PM 自动刷新数据（或实时同步）

## 技术建议

### 推荐技术栈
- **前端**：React（当前已是React）+ Vite 构建
- **部署**：Vercel / Netlify / Cloudflare Pages
- **数据库**：Supabase（免费额度足够个人使用）
- **OCR**：Anthropic API（用户已有VPN环境）

### 文件结构建议
```
savings-clock/
├── index.html
├── manifest.json
├── sw.js
├── src/
│   ├── App.jsx          # 主应用（基于现有代码）
│   ├── components/
│   │   ├── FlipClock.jsx
│   │   ├── WelcomeScreen.jsx
│   │   ├── DisplayMode.jsx
│   │   └── MoneyInput.jsx
│   ├── utils/
│   │   ├── storage.js   # 数据存储层（替换window.storage）
│   │   ├── ocr.js       # OCR服务
│   │   └── calc.js      # 计算逻辑
│   └── styles/
│       └── index.css
├── vite.config.js
└── package.json
```

## 用户信息
- 用户在中国大陆，通过 FlClash VPN 使用 Claude
- 技术背景不深，需要step-by-step指引
- 已有 Claude Code 环境（含多个agent和skill）
- 开发设备：Mac，已安装 Node.js（via nvm）、Git
- 显示设备：iPad 3
- 操作设备：iPhone 17 Air
- 偏好中文界面和说明

```

---

## `src/main.jsx`

```jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles/index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Register service worker for PWA
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  });
}

```

---

## `src/App.jsx`

```jsx
import { useState, useEffect, useCallback, useRef } from "react";
import FlipDisplay from "./components/FlipClock";
import WelcomeScreen from "./components/WelcomeScreen";
import DisplayMode from "./components/DisplayMode";
import MoneyInput from "./components/MoneyInput";
import { loadData, saveData, defaultData } from "./utils/storage";
import { getToday, fmtNum, calcTotal, getTodayInfo, getWeekGuitarCount, getWeekGuitarDays, getWeekExerciseCount, getConsecutiveSleepDays, isBeforeDeadline, getRewardLevel } from "./utils/calc";
import { compressImage, ocrImage } from "./utils/ocr";
import { COPY } from "./utils/copy";
import {
  IconHome,
  IconCheckCircle,
  IconExpense,
  IconIncome,
  IconMonitor,
  IconSettings,
  IconHistory,
  IconCamera,
  IconPhoto,
  IconPen,
  IconBarChart,
  IconLightbulb,
  IconKey,
  IconUndo,
  IconX,
  IconChevronLeft,
  IconWallet,
  IconGuitar,
  IconMoon,
  IconDumbbell,
  IconSmile,
  IconFrown,
  IconStar,
  IconTrophy,
} from "./components/Icons";

export default function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("home");
  const [showWelcome, setShowWelcome] = useState(false);
  const [welcomeType, setWelcomeType] = useState("checkin");
  const [welcomeExtra, setWelcomeExtra] = useState({});
  const [toast, setToast] = useState("");
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrResult, setOcrResult] = useState(null);
  const [manualAmt, setManualAmt] = useState("");
  const [manualNote, setManualNote] = useState("");
  const [settingsForm, setSettingsForm] = useState({
    income: "",
    savings: "",
  });
  const cameraRef = useRef(null);
  const albumRef = useRef(null);

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

  // 加载数据
  useEffect(() => {
    const d = loadData();
    setData(d);
    setLoading(false);

    // NFC 打卡 URL 参数检测
    const params = new URLSearchParams(window.location.search);
    const action = params.get("action");
    if (action) {
      window.history.replaceState({}, "", window.location.pathname);
      setTimeout(() => {
        const today = getToday();
        if (action === "checkin") {
          if (!d.checkins?.[today] && d.settings.dailyIncome > 0) {
            const nd = { ...d, checkins: { ...d.checkins, [today]: true } };
            saveData(nd);
            setData(nd);
            setWelcomeType("checkin");
            setWelcomeExtra({});
            setShowWelcome(true);
          }
        } else if (action === "guitar") {
          if (!d.guitar?.[today]) {
            const nd = { ...d, guitar: { ...d.guitar, [today]: { time: new Date().toTimeString().slice(0, 5) } } };
            let points = 5;
            let note = "弹琴打卡 +5";
            nd.rewards = { ...nd.rewards, totalPoints: (nd.rewards?.totalPoints || 0) + points, history: [...(nd.rewards?.history || []), { date: today, type: "guitar", points, note }] };
            const weekCount = getWeekGuitarCount(nd);
            const goal = nd.settings.guitarGoal || 3;
            if (weekCount >= goal) {
              const thisWeekBonus = nd.rewards.history.some(h => h.type === "guitar_weekly" && isThisWeek(h.date));
              if (!thisWeekBonus) {
                nd.rewards.totalPoints += 50;
                nd.rewards.history.push({ date: today, type: "guitar_weekly", points: 50, note: `本周弹琴达标 ${weekCount}/${goal}` });
                points += 50;
              }
            }
            saveData(nd);
            setData(nd);
            setWelcomeType("guitar");
            setWelcomeExtra({ points, weekInfo: `本周 ${weekCount}/${goal}` });
            setShowWelcome(true);
          }
        } else if (action === "mood_happy") {
          const nd = { ...d, mood: { ...d.mood, [today]: "happy" } };
          saveData(nd);
          setData(nd);
          setWelcomeType("mood_happy");
          setWelcomeExtra({});
          setShowWelcome(true);
        } else if (action === "mood_sad") {
          const nd = { ...d, mood: { ...d.mood, [today]: "sad" } };
          saveData(nd);
          setData(nd);
          setWelcomeType("mood_sad");
          setWelcomeExtra({});
          setShowWelcome(true);
        } else if (action === "sleep") {
          if (!d.sleep?.[today]) {
            const timeStr = new Date().toTimeString().slice(0, 5);
            const valid = isBeforeDeadline(d.settings?.sleepDeadline || "23:30");
            const points = valid ? 10 : 2;
            const nd = { ...d, sleep: { ...d.sleep, [today]: { time: timeStr, valid } } };
            nd.rewards = { ...nd.rewards, totalPoints: (nd.rewards?.totalPoints || 0) + points, history: [...(nd.rewards?.history || []), { date: today, type: "sleep", points, note: valid ? "早睡打卡" : "晚睡安慰分" }] };
            if (valid) {
              const streak = getConsecutiveSleepDays(nd);
              if (streak > 0 && streak % 7 === 0) {
                nd.rewards.totalPoints += 30;
                nd.rewards.history.push({ date: today, type: "sleep_streak", points: 30, note: `连续早睡 ${streak} 天` });
              }
            }
            saveData(nd);
            setData(nd);
            setWelcomeType("sleep");
            setWelcomeExtra({ points, valid });
            setShowWelcome(true);
          }
        } else if (action === "exercise") {
          if (!d.exercise?.[today]) {
            const nd = { ...d, exercise: { ...d.exercise, [today]: { time: new Date().toTimeString().slice(0, 5) } } };
            let points = 5;
            nd.rewards = { ...nd.rewards, totalPoints: (nd.rewards?.totalPoints || 0) + points, history: [...(nd.rewards?.history || []), { date: today, type: "exercise", points, note: "锻炼打卡 +5" }] };
            const weekCount = getWeekExerciseCount(nd);
            const goal = nd.settings.exerciseGoal || 2;
            if (weekCount >= goal) {
              const bonus = weekCount >= 3 ? 200 : 80;
              const bonusNote = weekCount >= 3 ? `本周锻炼${weekCount}次，超额完成！` : `本周锻炼达标 ${weekCount}/${goal}`;
              nd.rewards.totalPoints += bonus;
              nd.rewards.history.push({ date: today, type: "exercise_weekly", points: bonus, note: bonusNote });
              points += bonus;
            }
            saveData(nd);
            setData(nd);
            setWelcomeType("exercise");
            setWelcomeExtra({ points, weekInfo: `本周 ${weekCount}/${goal}` });
            setShowWelcome(true);
          }
        }
      }, 100);
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
    const nd = { ...data, checkins: { ...data.checkins, [today]: true } };
    save(nd);
    setWelcomeType("checkin");
    setWelcomeExtra({});
    setShowWelcome(true);
  };

  const undoCheckin = () => {
    const today = getToday();
    if (!data.checkins?.[today]) return;
    const nd = { ...data, checkins: { ...data.checkins } };
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
    const valid = isBeforeDeadline(data.settings.sleepDeadline || "23:30");
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

  // ─── OCR ───
  const handleFile = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setOcrLoading(true);
    setOcrResult(null);
    try {
      const { base64, mediaType } = await compressImage(f);
      const res = await ocrImage(base64, mediaType);
      setOcrResult(res);
    } catch {
      setOcrResult({ items: [], total: 0, error: "图片读取失败，请重试" });
    }
    setOcrLoading(false);
    e.target.value = "";
  };

  // ─── 添加支出 ───
  const addItems = (items) => {
    if (!items?.length) return;
    const today = getToday();
    const nd = { ...data, expenses: { ...data.expenses } };
    if (!nd.expenses[today]) nd.expenses[today] = { items: [] };
    else
      nd.expenses[today] = {
        ...nd.expenses[today],
        items: [...nd.expenses[today].items],
      };
    items.forEach((i) =>
      nd.expenses[today].items.push({ amount: i.amount, note: i.note || "" })
    );
    save(nd);
    flash(pick(COPY.expense));
    setOcrResult(null);
    setManualAmt("");
    setManualNote("");
    setView("home");
  };

  // ─── 添加额外收入 ───
  const addExtraIncome = (amount, note) => {
    if (!amount || amount <= 0) return;
    const today = getToday();
    const nd = { ...data, extraIncomes: { ...(data.extraIncomes || {}) } };
    if (!nd.extraIncomes[today]) nd.extraIncomes[today] = { items: [] };
    else
      nd.extraIncomes[today] = {
        ...nd.extraIncomes[today],
        items: [...nd.extraIncomes[today].items],
      };
    nd.extraIncomes[today].items.push({ amount, note: note || "额外收入" });
    save(nd);
    flash(pick(COPY.income));
    setManualAmt("");
    setManualNote("");
    setView("home");
  };

  const deleteItem = (date, idx) => {
    const nd = { ...data, expenses: { ...data.expenses } };
    nd.expenses[date] = {
      ...nd.expenses[date],
      items: [...nd.expenses[date].items],
    };
    nd.expenses[date].items.splice(idx, 1);
    if (!nd.expenses[date].items.length) delete nd.expenses[date];
    save(nd);
    flash("已删除");
  };

  const deleteExtraIncome = (date, idx) => {
    const nd = { ...data, extraIncomes: { ...(data.extraIncomes || {}) } };
    nd.extraIncomes[date] = {
      ...nd.extraIncomes[date],
      items: [...nd.extraIncomes[date].items],
    };
    nd.extraIncomes[date].items.splice(idx, 1);
    if (!nd.extraIncomes[date].items.length) delete nd.extraIncomes[date];
    save(nd);
    flash("已删除");
  };

  // ─── 保存设置 ───
  const saveSettings = () => {
    const nd = {
      ...data,
      settings: {
        ...data.settings,
        dailyIncome: parseFloat(settingsForm.income) || 0,
        initialSavings: parseFloat(settingsForm.savings) || 0,
        configured: true, // 标记已完成设置
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
          background: "#ffffff",
          color: "#888",
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
        onComplete={() => {
          setShowWelcome(false);
          setView("home");
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
    dim: "#888",
    red: "#ff3b30",
    green: "#34c759",
    cyan: "#1a1a1a",
    text: "#1a1a1a",
    purple: "#af52de",
    indigo: "#5856d6",
    orange: "#ff9500",
    blue: "#007aff",
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
        <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", padding: "0 0 12px" }}>

          {/* 顶栏：日期 + 心情 + 积分 */}
          <div style={{
            padding: "20px 0 10px",
            fontSize: 13, color: C.dim, letterSpacing: 0.5,
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
                    width: 40, height: 40, borderRadius: "50%", border: "none", cursor: "pointer",
                    background: data.mood?.[getToday()] === "happy" ? "rgba(52,199,89,0.15)" : "#f5f5f5",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 22, transition: "all 0.2s",
                    transform: data.mood?.[getToday()] === "happy" ? "scale(1.1)" : "scale(1)",
                  }}>
                    😊
                  </button>
                  <button onClick={() => doMood("sad")} style={{
                    width: 40, height: 40, borderRadius: "50%", border: "none", cursor: "pointer",
                    background: data.mood?.[getToday()] === "sad" ? "rgba(88,86,214,0.15)" : "#f5f5f5",
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
              <div style={{
                marginTop: 12, fontSize: 14,
                fontFamily: "'SF Pro Display', -apple-system, sans-serif",
                fontWeight: 600,
                color: info.net >= 0 ? C.green : C.red,
              }}>
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
                  savings: String(data.settings.initialSavings || ""),
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
                ...(info.checkedIn ? { background: "rgba(52,199,89,0.08)", border: "1px solid rgba(52,199,89,0.25)", color: C.green } : {}),
              }}>
                {info.checkedIn ? <IconCheckCircle size={22} color={C.green} /> : <IconHome size={22} color="#1a1a1a" />}
                <span style={{ fontSize: 13, fontWeight: 600 }}>{info.checkedIn ? "已打卡" : "回家"}</span>
              </button>

              {/* 弹琴打卡 */}
              <button className="action-btn" onClick={doGuitar} style={{
                flex: 1, flexDirection: "row", padding: "14px 12px", gap: 8,
                ...(data.guitar?.[getToday()] ? { background: "rgba(175,82,222,0.08)", border: "1px solid rgba(175,82,222,0.25)", color: C.purple } : {}),
              }}>
                {data.guitar?.[getToday()] ? <IconCheckCircle size={22} color={C.purple} /> : <IconGuitar size={22} color={C.purple} />}
                <span style={{ fontSize: 13, fontWeight: 600 }}>
                  {data.guitar?.[getToday()] ? "已练琴" : "弹琴"}
                  <span style={{ fontSize: 11, color: C.dim, marginLeft: 4 }}>{weekGuitarCount}/{guitarGoal}</span>
                </span>
              </button>

              {/* 锻炼打卡 */}
              <button className="action-btn" onClick={doExercise} style={{
                flex: 1, flexDirection: "row", padding: "14px 12px", gap: 8,
                ...(data.exercise?.[getToday()] ? { background: "rgba(255,149,0,0.08)", border: "1px solid rgba(255,149,0,0.25)", color: "#ff9500" } : {}),
              }}>
                {data.exercise?.[getToday()] ? <IconCheckCircle size={22} color="#ff9500" /> : <IconDumbbell size={22} color="#ff9500" />}
                <span style={{ fontSize: 13, fontWeight: 600 }}>
                  {data.exercise?.[getToday()] ? "已锻炼" : "锻炼"}
                  <span style={{ fontSize: 10, color: C.dim, marginLeft: 3 }}>{weekExerciseCount}/{exerciseGoal}</span>
                </span>
              </button>

              {/* 早睡打卡 */}
              <button className="action-btn" onClick={doSleep} style={{
                flex: 1, flexDirection: "row", padding: "14px 12px", gap: 8,
                ...(data.sleep?.[getToday()] ? { background: "rgba(88,86,214,0.08)", border: "1px solid rgba(88,86,214,0.25)", color: C.indigo } : {}),
              }}>
                {data.sleep?.[getToday()] ? <IconCheckCircle size={22} color={C.indigo} /> : <IconMoon size={22} color={C.indigo} />}
                <span style={{ fontSize: 13, fontWeight: 600 }}>{data.sleep?.[getToday()] ? (data.sleep[getToday()].valid ? "已早睡" : "晚了") : "早睡"}</span>
              </button>
            </div>
          )}

          {/* 底部功能栏：支出 / 收入 / 展示 / 设置 / 历史 / 奖励 */}
          <div style={{ display: "flex", gap: 6 }}>
            {!needsSetup && (
              <>
                <button className="nav-btn" style={{ padding: "12px 8px", fontSize: 12 }}
                  onClick={() => { setOcrResult(null); setManualAmt(""); setManualNote(""); setView("add"); }}>
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
              onClick={() => { setSettingsForm({ income: String(data.settings.dailyIncome || ""), savings: String(data.settings.initialSavings || ""), apiKey: localStorage.getItem("anthropic-api-key") || "" }); setView("settings"); }}>
              <IconSettings size={18} color="#888" /> 设置
            </button>
            <button className="nav-btn" style={{ padding: "12px 8px", fontSize: 12 }}
              onClick={() => setView("history")}>
              <IconHistory size={18} color="#888" /> 历史
            </button>
            <button className="nav-btn" style={{ padding: "12px 8px", fontSize: 12 }}
              onClick={() => setView("rewards")}>
              <IconTrophy size={18} color={C.orange} /> 奖励
            </button>
          </div>

        </div>
      )}

      {/* ═══ 记录支出（弹窗） ═══ */}
      {view === "add" && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 100, animation: "fadeIn 0.2s ease",
        }} onClick={(e) => { if (e.target === e.currentTarget) { setOcrResult(null); setView("home"); } }}>
          <div style={{
            background: "#fff", borderRadius: 20, padding: "28px 24px", width: "90%", maxWidth: 360,
            boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
          }}>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, textAlign: "center" }}>记录支出</div>
            <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
              <div style={{ flex: 1 }}>
                <label
                  style={{
                    fontSize: 12,
                    color: C.dim,
                    marginBottom: 6,
                    display: "block",
                    fontWeight: 500,
                  }}
                >
                  金额
                </label>
                <MoneyInput
                  placeholder="0"
                  value={manualAmt}
                  onChange={(v) => setManualAmt(v)}
                  style={{}}
                  className="input"
                />
              </div>
              <div style={{ flex: 1 }}>
                <label
                  style={{
                    fontSize: 12,
                    color: C.dim,
                    marginBottom: 6,
                    display: "block",
                    fontWeight: 500,
                  }}
                >
                  备注
                </label>
                <input
                  className="input"
                  placeholder="午饭、咖啡..."
                  value={manualNote}
                  onChange={(e) => setManualNote(e.target.value)}
                />
              </div>
            </div>
            <button
              className="btn-primary"
              onClick={() => {
                const a = parseFloat(manualAmt);
                if (!a || a <= 0) {
                  flash("请输入金额");
                  return;
                }
                addItems([{ amount: a, note: manualNote || "支出" }]);
              }}
            >
              记录
            </button>
          </div>
        </div>
      )}

      {/* ═══ 记录额外收入（弹窗） ═══ */}
      {view === "addIncome" && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 100, animation: "fadeIn 0.2s ease",
        }} onClick={(e) => { if (e.target === e.currentTarget) setView("home"); }}>
          <div style={{
            background: "#fff", borderRadius: 20, padding: "28px 24px", width: "90%", maxWidth: 360,
            boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
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
                初始储蓄金额（元）
              </label>
              <MoneyInput
                placeholder="当前已有的积蓄"
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
                  background: "#f7f7f8",
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
                  background: "#f7f7f8",
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
                  background: "#f7f7f8",
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
            return sorted.map((date) => {
              const checked = !!data.checkins?.[date];
              const extras = data.extraIncomes?.[date]?.items || [];
              const items = data.expenses?.[date]?.items || [];
              const inc = checked ? (data.settings.dailyIncome || 0) : 0;
              const extraTotal = extras.reduce((s, i) => s + i.amount, 0);
              const exp = items.reduce((s, i) => s + i.amount, 0);
              const net = inc + extraTotal - exp;
              return (
                <div key={date} className="card">
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
                            ? "1px solid rgba(0,0,0,0.06)"
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
                            ? "1px solid rgba(0,0,0,0.06)"
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
                            ? "1px solid rgba(0,0,0,0.06)"
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
        <div style={{ animation: "slideIn 0.25s ease" }}>
          <div className="page-header">
            <button className="back-btn" onClick={() => setView("home")}><IconChevronLeft size={24} /></button>
            <span className="page-title">奖励</span>
          </div>

          {/* 积分总览 */}
          <div className="card" style={{ textAlign: "center", padding: "32px 20px" }}>
            <div style={{ fontSize: 48, fontWeight: 700, fontFamily: "'SF Pro Display', -apple-system, sans-serif", color: "#1a1a1a" }}>
              {data.rewards?.totalPoints || 0}
            </div>
            <div style={{ fontSize: 13, color: C.dim, marginTop: 4 }}>总积分</div>
            <div style={{ marginTop: 16, display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 16px", borderRadius: 20, background: `${level.color}15`, color: level.color, fontSize: 13, fontWeight: 600 }}>
              <IconTrophy size={14} color={level.color} />
              {level.name}
            </div>
            {level.next && (
              <div style={{ marginTop: 12 }}>
                <div style={{ height: 4, borderRadius: 2, background: "#f0f0f0", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${level.progress * 100}%`, background: level.color, borderRadius: 2, transition: "width 0.3s" }} />
                </div>
                <div style={{ fontSize: 11, color: "#bbb", marginTop: 4 }}>距离下一等级还需 {level.next - (data.rewards?.totalPoints || 0)} 分</div>
              </div>
            )}
          </div>

          {/* 统计 */}
          <div className="card">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, textAlign: "center" }}>
              <div>
                <div style={{ fontSize: 24, fontWeight: 700, fontFamily: "'SF Pro Display', -apple-system, sans-serif" }}>{Object.keys(data.guitar || {}).length}</div>
                <div style={{ fontSize: 11, color: C.dim, marginTop: 4 }}>弹琴总次数</div>
              </div>
              <div>
                <div style={{ fontSize: 24, fontWeight: 700, fontFamily: "'SF Pro Display', -apple-system, sans-serif" }}>{Object.keys(data.exercise || {}).length}</div>
                <div style={{ fontSize: 11, color: C.dim, marginTop: 4 }}>锻炼总次数</div>
              </div>
              <div>
                <div style={{ fontSize: 24, fontWeight: 700, fontFamily: "'SF Pro Display', -apple-system, sans-serif" }}>{Object.values(data.sleep || {}).filter(s => s.valid).length}</div>
                <div style={{ fontSize: 11, color: C.dim, marginTop: 4 }}>早睡总天数</div>
              </div>
              <div>
                <div style={{ fontSize: 24, fontWeight: 700, fontFamily: "'SF Pro Display', -apple-system, sans-serif" }}>{getConsecutiveSleepDays(data)}</div>
                <div style={{ fontSize: 11, color: C.dim, marginTop: 4 }}>连续早睡</div>
              </div>
            </div>
          </div>

          {/* 积分历史 */}
          <div className="card">
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, color: C.dim }}>积分记录</div>
            {(data.rewards?.history || []).slice(-20).reverse().map((h, i) => (
              <div key={i} style={{
                display: "flex", justifyContent: "space-between", padding: "8px 0",
                borderBottom: i < Math.min(19, (data.rewards?.history || []).length - 1) ? "1px solid rgba(0,0,0,0.06)" : "none",
                fontSize: 13,
              }}>
                <div>
                  <div>{h.note}</div>
                  <div style={{ fontSize: 11, color: "#bbb" }}>{h.date}</div>
                </div>
                <span style={{ color: C.green, fontFamily: "'SF Pro Display', -apple-system, sans-serif", fontWeight: 600 }}>+{h.points}</span>
              </div>
            ))}
            {(!data.rewards?.history || data.rewards.history.length === 0) && (
              <div style={{ textAlign: "center", color: "#bbb", padding: 20, fontSize: 13 }}>暂无记录</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

```

---

## `src/styles/index.css`

```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  -webkit-tap-highlight-color: transparent;
}

html, body {
  font-family: 'SF Pro Display', 'SF Pro Text', -apple-system, 'PingFang SC', 'Helvetica Neue', sans-serif;
  background: #ffffff;
  color: #1a1a1a;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  overflow-x: hidden;
}

/* 动画 */
@keyframes flipTop {
  0% { transform: rotateX(0); }
  100% { transform: rotateX(-90deg); }
}
@keyframes flipBot {
  0% { transform: rotateX(90deg); }
  100% { transform: rotateX(0); }
}
@keyframes fadeToast {
  0% { opacity: 0; transform: translateX(-50%) translateY(-12px); }
  15% { opacity: 1; transform: translateX(-50%) translateY(0); }
  85% { opacity: 1; }
  100% { opacity: 0; }
}
@keyframes pulse {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 1; }
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes slideIn {
  from { opacity: 0; transform: translateX(12px); }
  to { opacity: 1; transform: translateX(0); }
}

/* 通用 */
input:focus {
  border-color: #007aff !important;
  box-shadow: 0 0 0 3px rgba(0,122,255,0.1);
}

/* 应用容器 */
.app-container {
  min-height: 100vh;
  background: #ffffff;
  color: #1a1a1a;
  font-family: 'SF Pro Display', 'SF Pro Text', -apple-system, 'PingFang SC', 'Helvetica Neue', sans-serif;
  max-width: 420px;
  margin: 0 auto;
  padding: 0 18px 30px;
  animation: fadeIn 0.3s ease;
  position: relative;
}

/* 卡片 */
.card {
  background: #f7f7f8;
  border-radius: 16px;
  padding: 20px;
  border: 1px solid #e8e8e8;
  margin-bottom: 14px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
  transition: box-shadow 0.2s ease, transform 0.2s ease;
}

/* 操作按钮 */
.action-btn {
  background: #f7f7f8;
  border-radius: 14px;
  padding: 14px 10px;
  border: 1px solid #e8e8e8;
  box-shadow: none;
  cursor: pointer;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 600;
  color: #1a1a1a;
  font-family: inherit;
  transition: all 0.2s ease;
}
.action-btn:active {
  transform: scale(0.97);
  background: #efefef;
}

/* 主按钮 */
.btn-primary {
  background: #1a1a1a;
  color: #fff;
  border: none;
  border-radius: 14px;
  padding: 15px 24px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  width: 100%;
  font-family: inherit;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}
.btn-primary:active {
  transform: scale(0.98);
  background: #000;
}

.btn-green {
  background: #34c759;
  box-shadow: 0 2px 8px rgba(52,199,89,0.25);
}
.btn-green:active {
  background: #2db84e;
}

/* 输入框 */
.input {
  width: 100%;
  background: #fff;
  border: 1.5px solid #e8e8e8;
  border-radius: 12px;
  padding: 13px 16px;
  font-size: 16px;
  color: #1a1a1a;
  font-family: inherit;
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.input::placeholder {
  color: #bbb;
}

/* 导航按钮 */
.nav-btn {
  background: #f7f7f8;
  border-radius: 14px;
  padding: 14px 16px;
  border: 1px solid #e8e8e8;
  cursor: pointer;
  text-align: center;
  font-size: 13px;
  color: #888;
  font-family: inherit;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  flex: 1;
  transition: all 0.2s ease;
}
.nav-btn:active {
  transform: scale(0.97);
  background: #efefef;
  color: #1a1a1a;
}

/* 返回按钮 */
.back-btn {
  background: none;
  border: none;
  color: #1a1a1a;
  cursor: pointer;
  padding: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  transition: background 0.15s;
}
.back-btn:active {
  background: rgba(0,0,0,0.04);
}

/* 小图标按钮 */
.icon-btn {
  background: none;
  border: none;
  color: #bbb;
  cursor: pointer;
  padding: 4px 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.15s;
}
.icon-btn:active {
  color: #1a1a1a;
  background: rgba(0,0,0,0.04);
}

/* Toast */
.toast {
  position: fixed;
  top: 24px;
  left: 50%;
  transform: translateX(-50%);
  background: #1a1a1a;
  color: #fff;
  padding: 10px 28px;
  border-radius: 24px;
  font-size: 14px;
  font-weight: 600;
  z-index: 999;
  animation: fadeToast 2.2s ease forwards;
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
}

/* 上传按钮 */
.upload-btn {
  background: #f7f7f8;
  color: #888;
  border: 1.5px dashed #d0d0d0;
  border-radius: 14px;
  padding: 24px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  width: 100%;
  font-family: inherit;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: all 0.2s;
}
.upload-btn:active {
  background: #efefef;
  border-color: #bbb;
  color: #1a1a1a;
}

/* 页面标题栏 */
.page-header {
  display: flex;
  align-items: center;
  padding: 22px 0 18px;
  gap: 12px;
}
.page-title {
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 0.5px;
  color: #1a1a1a;
}

/* 分段标题 */
.section-title {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #888;
}

/* NFC 提示框 */
.hint-box {
  margin-top: 10px;
  padding: 16px;
  border-radius: 14px;
  background: #f7f7f8;
  border: 1px solid #e8e8e8;
  font-size: 12px;
  color: #888;
  line-height: 1.7;
  display: flex;
  gap: 10px;
  align-items: flex-start;
}

/* 危险按钮 */
.btn-danger {
  background: rgba(255,59,48,0.06);
  color: #ff3b30;
  border: 1px solid rgba(255,59,48,0.2);
  border-radius: 14px;
  padding: 15px 24px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  width: 100%;
  font-family: inherit;
  transition: all 0.15s;
}
.btn-danger:active {
  background: rgba(255,59,48,0.12);
}

/* iPad / 平板适配 (>=768px) */
@media (min-width: 768px) {
  .app-container {
    max-width: 680px;
    padding: 0 32px 40px;
  }
  .card {
    padding: 24px;
    border-radius: 18px;
    margin-bottom: 18px;
  }
  .action-btn {
    padding: 18px 12px;
    border-radius: 18px;
    font-size: 14px;
    gap: 10px;
  }
  .btn-primary, .btn-green, .btn-danger, .upload-btn {
    padding: 17px 28px;
    font-size: 16px;
    border-radius: 16px;
  }
  .input {
    padding: 15px 18px;
    font-size: 17px;
    border-radius: 14px;
  }
  .nav-btn {
    padding: 16px 20px;
    font-size: 14px;
    border-radius: 18px;
  }
  .page-title {
    font-size: 20px;
  }
  .section-title {
    font-size: 15px;
  }
  .hint-box {
    padding: 18px;
    font-size: 13px;
    border-radius: 16px;
  }
  .actions-grid {
    grid-template-columns: repeat(4, 1fr) !important;
  }
}

```

---

## `src/components/FlipClock.jsx`

```jsx
import { useState, useEffect, useRef, useMemo } from "react";

// 简洁白底黑字主题
const THEME = {
  panelTop: "#ffffff",
  panelBot: "#f7f7f8",
  digit: "#1a1a1a",
  divider: "#e0e0e0",
  rivet: "#b0b0b0",
};

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
  const baseW = isSymbol
    ? char === ","
      ? 48
      : char === " "
        ? 30
        : 72
    : 120;
  const baseH = 170;
  const baseFs = isSymbol ? 96 : 120;
  const w = Math.round(baseW * scale);
  const h = Math.round(baseH * scale);
  const fs = Math.round(baseFs * scale);
  const r = Math.round(6 * scale);
  const m = Math.round(3 * scale);

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
    fontFamily: "'SF Pro Display', -apple-system, 'Helvetica Neue', sans-serif",
    backfaceVisibility: "hidden",
    color: THEME.digit,
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
      <div
        style={{
          ...half,
          top: 0,
          background: THEME.panelTop,
          borderRadius: `${r}px ${r}px 0 0`,
          borderBottom: `1px solid ${THEME.divider}`,
          alignItems: "flex-end",
        }}
      >
        <span style={{ transform: "translateY(50%)" }}>{display}</span>
      </div>
      {/* 下半 */}
      <div
        style={{
          ...half,
          bottom: 0,
          background: THEME.panelBot,
          borderRadius: `0 0 ${r}px ${r}px`,
          alignItems: "flex-start",
          boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
        }}
      >
        <span style={{ transform: "translateY(-50%)" }}>{display}</span>
      </div>
      {/* 翻转动画 - 上瓣 */}
      {flipping && (
        <div
          style={{
            ...half,
            top: 0,
            background: THEME.panelTop,
            borderRadius: `${r}px ${r}px 0 0`,
            alignItems: "flex-end",
            zIndex: 3,
            transformOrigin: "bottom center",
            animation: "flipTop 0.5s ease-in forwards",
          }}
        >
          <span style={{ transform: "translateY(50%)" }}>{prev}</span>
        </div>
      )}
      {/* 翻转动画 - 下瓣 */}
      {flipping && (
        <div
          style={{
            ...half,
            bottom: 0,
            background: THEME.panelBot,
            borderRadius: `0 0 ${r}px ${r}px`,
            alignItems: "flex-start",
            zIndex: 2,
            transformOrigin: "top center",
            animation: "flipBot 0.5s ease-out 0.25s forwards",
            transform: "rotateX(90deg)",
            boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
          }}
        >
          <span style={{ transform: "translateY(-50%)" }}>{display}</span>
        </div>
      )}
      {/* 中线 */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: "50%",
          height: Math.max(1, Math.round(1.5 * scale)),
          background: THEME.divider,
          zIndex: 10,
          transform: "translateY(-0.75px)",
        }}
      />
      {/* 铆钉 */}
      {!isSymbol && (
        <>
          <div
            style={{
              position: "absolute",
              left: -1,
              top: "50%",
              transform: "translateY(-50%)",
              width: Math.round(3 * scale),
              height: Math.round(8 * scale),
              background: THEME.rivet,
              borderRadius: 1,
              zIndex: 11,
            }}
          />
          <div
            style={{
              position: "absolute",
              right: -1,
              top: "50%",
              transform: "translateY(-50%)",
              width: Math.round(3 * scale),
              height: Math.round(8 * scale),
              background: THEME.rivet,
              borderRadius: 1,
              zIndex: 11,
            }}
          />
        </>
      )}
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
      const containerW = containerRef.current.offsetWidth - 48;
      const chars = formatted.split("");
      let totalW = 0;
      chars.forEach((c) => {
        const isSymbol = ",- ".includes(c);
        const w = isSymbol
          ? c === ","
            ? 48
            : c === " "
              ? 30
              : 72
          : 120;
        totalW += w + 6; // 间距从 4 增加到 6，配合 m: 3px
      });
      // 宽度缩放
      const scaleW = containerW / totalW;
      // 高度缩放：如果有 maxHeight 限制，确保不超出
      const scaleH = maxHeight ? (maxHeight / 170) : Infinity;
      const s = Math.min(scaleW, scaleH);
      setScale(s);
    };
    calcScale();
    window.addEventListener("resize", calcScale);
    return () => window.removeEventListener("resize", calcScale);
  }, [formatted, maxHeight]);

  return (
    <div style={{ textAlign: "center", width: "100%", padding: "0 20px" }} ref={containerRef}>
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          flexWrap: "nowrap",
        }}
      >
        {formatted.split("").map((c, i) => (
          <FlipDigit key={i} char={c} scale={scale} />
        ))}
      </div>
    </div>
  );
}

```

---

## `src/components/DisplayMode.jsx`

```jsx
import { useState, useEffect, useRef } from "react";
import FlipDisplay from "./FlipClock";
import { calcTotal, getTodayInfo, fmtNum } from "../utils/calc";
import { IconCheckCircle } from "./Icons";

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
        background: "#ffffff",
        display: "flex",
        flexDirection: "column",
        cursor: "pointer",
        userSelect: "none",
        overflow: "hidden",
      }}
    >
      {/* 顶栏：日期 + 时间 */}
      <div
        style={{
          padding: "16px 24px",
          display: "flex",
          justifyContent: "space-between",
          fontFamily: "'SF Pro Display', -apple-system, sans-serif",
          fontSize: 14,
          color: "#888",
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

      {/* 底栏：今日净值 + 状态 */}
      <div
        style={{
          padding: "12px 24px 20px",
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
            border: `1px solid ${info.net >= 0 ? "rgba(52,199,89,0.2)" : "rgba(255,59,48,0.2)"}`,
            fontFamily: "'SF Pro Display', -apple-system, sans-serif",
            fontSize: 15,
            fontWeight: 600,
            letterSpacing: 0.5,
            color: info.net >= 0 ? "#34c759" : "#ff3b30",
            background: info.net >= 0 ? "rgba(52,199,89,0.06)" : "rgba(255,59,48,0.06)",
          }}
        >
          今日 {info.net >= 0 ? "+" : "-"}{fmtNum(info.net)}
        </div>
        {info.checkedIn && (
          <div
            style={{
              padding: "10px 16px",
              borderRadius: 20,
              border: "1px solid rgba(52,199,89,0.2)",
              fontSize: 15,
              fontWeight: 500,
              color: "#34c759",
              background: "rgba(52,199,89,0.06)",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <IconCheckCircle size={16} color="#34c759" />
            已打卡
          </div>
        )}
      </div>
    </div>
  );
}

```

---

## `src/components/WelcomeScreen.jsx`

```jsx
import { useState, useEffect, useMemo } from "react";
import { fmtNum } from "../utils/calc";
import { COPY } from "../utils/copy";

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

const TYPES = {
  checkin: {
    color: "#1a1a1a",
    glowColor: "rgba(0,0,0,0.04)",
    getText: (p) => `+${fmtNum(p.dailyIncome)}`,
    getCopy: () => pick(COPY.checkin),
  },
  guitar: {
    color: "#af52de",
    glowColor: "rgba(175,82,222,0.08)",
    getText: (p) => `+${p.points} 积分`,
    getCopy: () => pick(COPY.guitar),
  },
  exercise: {
    color: "#ff9500",
    glowColor: "rgba(255,149,0,0.08)",
    getText: (p) => `+${p.points} 积分`,
    getCopy: () => pick(COPY.exercise),
  },
  sleep: {
    color: "#5856d6",
    glowColor: "rgba(88,86,214,0.08)",
    getText: (p) => `+${p.points} 积分`,
    getCopy: (p) => p.valid ? pick(COPY.sleepGood) : pick(COPY.sleepLate),
  },
  mood_happy: {
    color: "#34c759",
    glowColor: "rgba(52,199,89,0.1)",
    emoji: "😊",
    getText: () => null,
    getCopy: () => pick(COPY.moodHappy),
  },
  mood_sad: {
    color: "#5856d6",
    glowColor: "rgba(88,86,214,0.1)",
    emoji: "🫂",
    getText: () => null,
    getCopy: () => pick(COPY.moodSad),
  },
};

export default function WelcomeScreen({ type = "checkin", dailyIncome, extra, onComplete }) {
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
  const copyLine = useMemo(() => config.getCopy(params), []);
  const mainText = config.getText(params);

  return (
    <div
      onClick={() => onComplete()}
      style={{
        position: "fixed",
        inset: 0,
        background: "#ffffff",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        transition: "opacity 0.8s ease",
        opacity: phase === 2 ? 0 : 1,
        cursor: "pointer",
        padding: "0 32px",
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
            fontFamily: "'SF Pro Display', -apple-system, 'Helvetica Neue', sans-serif",
            color: config.color,
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
          color: "#888",
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

```

---

## `src/components/MoneyInput.jsx`

```jsx
import { useState, useEffect } from "react";

export default function MoneyInput({
  value,
  onChange,
  placeholder,
  style: extraStyle,
  className,
}) {
  const [displayVal, setDisplayVal] = useState(() => {
    const n = parseFloat(value);
    return n ? n.toLocaleString("en-US") : "";
  });

  useEffect(() => {
    const n = parseFloat(value);
    const formatted = n ? n.toLocaleString("en-US") : "";
    if (
      formatted !== displayVal &&
      document.activeElement?.dataset?.moneyinput !== "true"
    ) {
      setDisplayVal(formatted);
    }
  }, [value]);

  const handleChange = (e) => {
    const raw = e.target.value.replace(/,/g, "");
    if (raw === "" || /^\d*\.?\d*$/.test(raw)) {
      const n = parseFloat(raw);
      if (raw === "" || raw === "." || raw.endsWith(".")) {
        setDisplayVal(raw);
        onChange(raw.replace(/\.$/, "") || "");
      } else if (!isNaN(n)) {
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
      className={className}
    />
  );
}

```

---

## `src/components/Icons.jsx`

```jsx
// 统一 SVG 图标组件 — Lucide 风格线条图标
// 所有图标: stroke 线条, 圆角端点, 统一 viewBox 24x24

const I = ({ children, size = 24, color = "currentColor", ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    {children}
  </svg>
);

export const IconHome = (p) => (
  <I {...p}>
    <path d="M3 10.182V22h7v-7h4v7h7V10.182L12 2 3 10.182z" />
  </I>
);

export const IconCheckCircle = (p) => (
  <I {...p}>
    <circle cx="12" cy="12" r="10" />
    <path d="m9 12 2 2 4-4" />
  </I>
);

export const IconExpense = (p) => (
  <I {...p}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 8v8" />
    <path d="m8 12 4 4 4-4" />
  </I>
);

export const IconIncome = (p) => (
  <I {...p}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 16V8" />
    <path d="m8 12 4-4 4 4" />
  </I>
);

export const IconMonitor = (p) => (
  <I {...p}>
    <rect x="2" y="3" width="20" height="14" rx="2" />
    <path d="M8 21h8" />
    <path d="M12 17v4" />
  </I>
);

export const IconSettings = (p) => (
  <I {...p}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </I>
);

export const IconHistory = (p) => (
  <I {...p}>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M7 8h10" />
    <path d="M7 12h10" />
    <path d="M7 16h6" />
  </I>
);

export const IconCamera = (p) => (
  <I {...p}>
    <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
    <circle cx="12" cy="13" r="3" />
  </I>
);

export const IconPhoto = (p) => (
  <I {...p}>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <path d="m21 15-5-5L5 21" />
  </I>
);

export const IconPen = (p) => (
  <I {...p}>
    <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
  </I>
);

export const IconBarChart = (p) => (
  <I {...p}>
    <rect x="3" y="12" width="4" height="9" rx="1" />
    <rect x="10" y="7" width="4" height="14" rx="1" />
    <rect x="17" y="3" width="4" height="18" rx="1" />
  </I>
);

export const IconLightbulb = (p) => (
  <I {...p}>
    <path d="M9 18h6" />
    <path d="M10 22h4" />
    <path d="M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z" />
  </I>
);

export const IconKey = (p) => (
  <I {...p}>
    <circle cx="7.5" cy="15.5" r="5.5" />
    <path d="m11.5 11.5 5-5" />
    <path d="M16.5 6.5 19 9l-2.5 2.5" />
    <path d="m14 9 2 2" />
  </I>
);

export const IconUndo = (p) => (
  <I {...p}>
    <path d="M3 7v6h6" />
    <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6.69 3L3 13" />
  </I>
);

export const IconX = (p) => (
  <I {...p}>
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </I>
);

export const IconChevronLeft = (p) => (
  <I {...p}>
    <path d="m15 18-6-6 6-6" />
  </I>
);

export const IconWallet = (p) => (
  <I {...p}>
    <rect x="2" y="5" width="20" height="14" rx="2" />
    <path d="M16 12h.01" />
    <path d="M2 10h20" />
  </I>
);

export const IconCoin = (p) => (
  <I {...p}>
    <circle cx="12" cy="12" r="8" />
    <path d="M9.5 9.5c.5-1 1.5-1.5 2.5-1.5 1.5 0 2.5 1 2.5 2.2 0 1.3-1 1.8-2.5 2.3-1 .3-2.5 1-2.5 2.3 0 1.2 1 2.2 2.5 2.2 1 0 2-.5 2.5-1.5" />
  </I>
);

export const IconPlus = (p) => (
  <I {...p}>
    <path d="M12 5v14" />
    <path d="M5 12h14" />
  </I>
);

// 吉他图标
export const IconGuitar = (p) => (
  <I {...p}>
    <path d="M20 4l-3.5 3.5" />
    <path d="M18 2l2 2" />
    <path d="M14.5 9.5a3.5 3.5 0 0 0-5 0L7 12a7 7 0 1 0 5 5l2.5-2.5a3.5 3.5 0 0 0 0-5z" />
    <circle cx="9.5" cy="14.5" r="1.5" />
  </I>
);

// 月亮图标（早睡）
export const IconMoon = (p) => (
  <I {...p}>
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </I>
);

// 开心表情
export const IconSmile = (p) => (
  <I {...p}>
    <circle cx="12" cy="12" r="10" />
    <path d="M8 14s1.5 2 4 2 4-2 4-2" />
    <line x1="9" y1="9" x2="9.01" y2="9" />
    <line x1="15" y1="9" x2="15.01" y2="9" />
  </I>
);

// 不开心表情
export const IconFrown = (p) => (
  <I {...p}>
    <circle cx="12" cy="12" r="10" />
    <path d="M16 16s-1.5-2-4-2-4 2-4 2" />
    <line x1="9" y1="9" x2="9.01" y2="9" />
    <line x1="15" y1="9" x2="15.01" y2="9" />
  </I>
);

// 哑铃图标（锻炼）
export const IconDumbbell = (p) => (
  <I {...p}>
    <path d="M6.5 6.5h11" />
    <path d="M6.5 17.5h11" />
    <path d="M12 6.5v11" />
    <rect x="2" y="5" width="4" height="14" rx="1" />
    <rect x="18" y="5" width="4" height="14" rx="1" />
  </I>
);

// 星星图标（积分）
export const IconStar = (p) => (
  <I {...p}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </I>
);

// 奖杯图标
export const IconTrophy = (p) => (
  <I {...p}>
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" />
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20 7 22" />
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20 17 22" />
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2z" />
  </I>
);

```

---

## `src/utils/storage.js`

```js
// 数据存储层
// 使用 localStorage，后续可换 Supabase 实现多设备同步

const STORE_KEY = "savings-flip-v4";
const OLD_STORE_KEY = "savings-flip-v3";

export const defaultData = {
  settings: {
    dailyIncome: 1400,
    initialSavings: 0,
    configured: true,
    guitarGoal: 3,        // 每周弹琴目标次数
    exerciseGoal: 2,      // 每周锻炼目标次数
    sleepDeadline: "23:30", // 早睡截止时间
  },
  checkins: {},
  expenses: {},
  extraIncomes: {},
  guitar: {},       // { "2026-03-25": { time: "21:30" } }
  exercise: {},     // { "2026-03-25": { time: "19:00" } }
  mood: {},         // { "2026-03-25": "happy" | "sad" }
  sleep: {},        // { "2026-03-25": { time: "23:10", valid: true } }
  rewards: {
    totalPoints: 0,
    history: [],    // [{ date, type, points, note }]
  },
};

export function loadData() {
  try {
    let raw = localStorage.getItem(STORE_KEY);

    // 从 v3 迁移
    if (!raw) {
      const oldRaw = localStorage.getItem(OLD_STORE_KEY);
      if (oldRaw) {
        raw = oldRaw;
        // 迁移后保存到新 key
        localStorage.setItem(STORE_KEY, raw);
      }
    }

    if (raw) {
      const parsed = JSON.parse(raw);
      if (!parsed.checkins) parsed.checkins = {};
      if (!parsed.expenses) parsed.expenses = {};
      if (!parsed.extraIncomes) parsed.extraIncomes = {};
      if (!parsed.settings) parsed.settings = { ...defaultData.settings };
      if (!parsed.guitar) parsed.guitar = {};
      if (!parsed.exercise) parsed.exercise = {};
      if (!parsed.mood) parsed.mood = {};
      if (!parsed.sleep) parsed.sleep = {};
      if (!parsed.rewards) parsed.rewards = { totalPoints: 0, history: [] };
      if (!parsed.settings.guitarGoal) parsed.settings.guitarGoal = 3;
      if (!parsed.settings.exerciseGoal) parsed.settings.exerciseGoal = 2;
      if (!parsed.settings.sleepDeadline) parsed.settings.sleepDeadline = "23:30";
      if (!parsed.settings.configured) { parsed.settings.configured = true; parsed.settings.dailyIncome = parsed.settings.dailyIncome || 1400; }
      return parsed;
    }
  } catch (e) {
    console.error("加载数据失败:", e);
  }
  return { ...defaultData, rewards: { totalPoints: 0, history: [] } };
}

export function saveData(data) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error("保存数据失败:", e);
  }
}

```

---

## `src/utils/calc.js`

```js
export const getToday = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

export const fmtNum = (n) => Math.round(Math.abs(n)).toLocaleString("en-US");

export function calcTotal(data) {
  const s = data.settings;
  const checkinCount = Object.keys(data.checkins || {}).length;
  const totalIncome = checkinCount * (s.dailyIncome || 0);

  let totalExtra = 0;
  Object.values(data.extraIncomes || {}).forEach((d) => {
    (d.items || []).forEach((i) => {
      totalExtra += i.amount || 0;
    });
  });

  let totalExp = 0;
  Object.values(data.expenses || {}).forEach((d) => {
    (d.items || []).forEach((i) => {
      totalExp += i.amount || 0;
    });
  });

  return (s.initialSavings || 0) + totalIncome + totalExtra - totalExp;
}

export function getTodayInfo(data) {
  const today = getToday();
  const checkedIn = !!data.checkins?.[today];
  const income = checkedIn ? (data.settings.dailyIncome || 0) : 0;
  const extraItems = data.extraIncomes?.[today]?.items || [];
  const extraTotal = extraItems.reduce((s, i) => s + (i.amount || 0), 0);
  const items = data.expenses?.[today]?.items || [];
  const expense = items.reduce((s, i) => s + (i.amount || 0), 0);
  return {
    today,
    checkedIn,
    income,
    extraItems,
    extraTotal,
    expense,
    items,
    net: income + extraTotal - expense,
  };
}

// 获取本周弹琴次数（周一到周日）
export function getWeekGuitarCount(data) {
  const now = new Date();
  const day = now.getDay();
  // 算出本周一的日期
  const monday = new Date(now);
  monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
  monday.setHours(0, 0, 0, 0);

  let count = 0;
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    if (data.guitar?.[key]) count++;
  }
  return count;
}

// 获取本周弹琴日期列表（用于显示周历）
export function getWeekGuitarDays(data) {
  const now = new Date();
  const day = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
  monday.setHours(0, 0, 0, 0);

  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    days.push({
      label: ["一", "二", "三", "四", "五", "六", "日"][i],
      date: key,
      done: !!data.guitar?.[key],
      isToday: key === getToday(),
    });
  }
  return days;
}

// 获取本周锻炼次数
export function getWeekExerciseCount(data) {
  const now = new Date();
  const day = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
  monday.setHours(0, 0, 0, 0);

  let count = 0;
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    if (data.exercise?.[key]) count++;
  }
  return count;
}

// 获取连续早睡天数
export function getConsecutiveSleepDays(data) {
  let count = 0;
  const d = new Date();
  // 从昨天开始往回数（今天可能还没打卡）
  // 但如果今天已打卡且有效，也算上
  const today = getToday();
  if (data.sleep?.[today]?.valid) {
    count++;
  }
  for (let i = 1; i < 365; i++) {
    const prev = new Date(d);
    prev.setDate(d.getDate() - i);
    const key = `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, "0")}-${String(prev.getDate()).padStart(2, "0")}`;
    if (data.sleep?.[key]?.valid) {
      count++;
    } else {
      break;
    }
  }
  return count;
}

// 判断当前时间是否在截止时间之前
export function isBeforeDeadline(deadlineStr) {
  const [h, m] = (deadlineStr || "23:30").split(":").map(Number);
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const deadlineMinutes = h * 60 + m;
  return nowMinutes <= deadlineMinutes;
}

// 爵士乐成就等级体系
// 隐喻：一个爵士乐手从初次听见爵士乐到登上传奇殿堂的成长之路
const JAZZ_LEVELS = [
  {
    name: "Listener",          // 听众——还在台下，被音乐击中的那个夜晚
    description: "你走进了那间烟雾缭绕的酒吧，第一次听见了真正的爵士。",
    threshold: 0,
    color: "#8B8685",          // 暖灰——老唱片封套的质感
  },
  {
    name: "Woodshedder",       // 练功房苦练者——关起门来与乐器较劲的日子
    description: "关上门，点一盏灯，和你的乐器单独相处。每一个音阶都是对话。",
    threshold: 100,            // ~1 周稳定打卡
    color: "#6B5B4E",          // 深棕——练功房的木质地板
  },
  {
    name: "Sideman",           // 乐队配角——第一次被邀请上台合奏
    description: "有人递来一份谱子说：今晚你跟我们一起。",
    threshold: 300,            // ~3 周
    color: "#4A6670",          // 靛蓝灰——深夜爵士吧的灯光
  },
  {
    name: "Session Cat",       // 录音室乐手——被信赖的职业选手
    description: "制作人点名要你。你的律动，别人学不来。",
    threshold: 800,            // ~2 个月
    color: "#2E5A6B",          // 深青——录音室里监听音箱的冷光
  },
  {
    name: "Bandleader",        // 乐队领袖——开始写自己的曲子，带自己的乐队
    description: "不再演别人的Standards。你写的旋律，值得被记住。",
    threshold: 2000,           // ~5 个月
    color: "#8C6B3E",          // 琥珀金——舞台追光灯的暖色
  },
  {
    name: "Headliner",         // 头牌——你的名字就是票房保证
    description: "海报上只印你的名字。今晚，所有人为你而来。",
    threshold: 5000,           // ~1 年
    color: "#B8860B",          // 暗金——老式爵士俱乐部的铜质铭牌
  },
  {
    name: "Standard",          // 标准曲——你本身已成为经典，后人演奏你的作品
    description: "你的名字不再只属于你。它属于每一个深夜、每一间酒吧、每一次即兴。",
    threshold: 10000,          // ~2 年
    color: "#1A1A2E",          // 午夜蓝——传奇只存在于最深的夜色里
  },
];

// 获取成就等级
export function getRewardLevel(points) {
  let current = JAZZ_LEVELS[0];
  let nextLevel = JAZZ_LEVELS[1];

  for (let i = JAZZ_LEVELS.length - 1; i >= 0; i--) {
    if (points >= JAZZ_LEVELS[i].threshold) {
      current = JAZZ_LEVELS[i];
      nextLevel = JAZZ_LEVELS[i + 1] || null;
      break;
    }
  }

  const progress = nextLevel
    ? (points - current.threshold) / (nextLevel.threshold - current.threshold)
    : 1;

  return {
    name: current.name,
    description: current.description,
    color: current.color,
    next: nextLevel ? nextLevel.threshold : null,
    progress: Math.min(progress, 1),
  };
}

```

---

## `src/utils/copy.js`

```js
export const COPY = {
  checkin: [
    "女王驾到，国库又充实了",
    "回来了？钱到账了吗，这才是重点",
    "女王辛苦了，但辛苦不值钱，值钱的是到账",
    "打工是不可能打工的——开玩笑，继续",
    "女王今日份的搬砖已签收",
    "又活过了一天，还赚到了钱，你赢了",
    "回家了？资本家今天没让你加班？奇迹",
    "女王归巢，今日营业额已入库",
    "你回来了，房租又有着落了",
    "辛苦了，今天的你值得被包养——被自己",
    "女王收工，社畜模式暂时关闭",
    "到家了，今天离财务自由又近了0.001%",
    "欢迎回家，冰箱里什么都没有，但账上有钱",
    "打卡成功，今日份的自己很靠谱",
    "女王凯旋，请检阅今日战报",
    "又是为人民币服务的一天",
    "回来啦，外面的世界配不上你",
    "到家了？好，钱已入账，你可以瘫了",
    "女王驾到，请开始你的躺平表演",
    "今天也是有收入的一天，比昨天的自己强",
  ],
  guitar: [
    "弹完了？邻居还活着吗",
    "女王的琴声又响彻了整栋楼，恭喜",
    "练琴打卡，离吉他之神又近了一个音",
    "坚持练琴的你，比99%的买了琴吃灰的人强",
    "女王拨弦，草木皆惊——是好的那种惊",
    "又练了，你对得起那把琴了",
    "今日练琴已记录，吉他表示被翻牌了",
    "弹琴一分钟，装杯一整年，值了",
    "女王今日已抚琴，文武双全指日可待",
    "练完了？你的琴比你的存款靠谱",
    "邻居敲墙了吗？没有就是进步",
    "又练了一天，你比那些只发朋友圈的人真实",
    "女王操琴，六弦臣服",
    "今天的练习已入账，手指还在吗",
    "吉他被你翻牌的频率比男人靠谱",
    "弹琴这件事，你居然还在坚持，服了",
    "女王的手指今日份运动已完成",
    "练了就行，好不好听是邻居的事",
    "坚持练琴第N天，老师可以少叹一口气了",
    "又弹了，隔壁的狗还没叫，算成功",
  ],
  exercise: [
    "女王今日撸铁完毕，肌肉又多了一丝",
    "练完了，你的肌纤维正在默默变粗",
    "又练了？蛋白质已经在排队等着修复你了",
    "女王举铁，铁都服了",
    "今日训练已记录，你的肌肉含量在偷偷涨",
    "练完了？你比昨天的自己壮了一点点",
    "女王的肱二头肌又被翻牌了",
    "撸铁打卡成功，维度又近了0.1厘米",
    "增肌路上，今天没有偷懒，给你记上",
    "女王今日份的力量训练已归档",
    "又练了，你跟健身房的关系越来越稳定了",
    "肌肉不会骗人，每一组都算数",
    "女王的背影越来越有型了，相信我",
    "今天的汗水就是明天的线条",
    "练了就行，罗马不是一天建成的，肌肉也是",
  ],
  sleepGood: [
    "女王早睡，明天的黑眼圈瑟瑟发抖",
    "居然在点之前睡？你是谁，把熬夜怪还回来",
    "早睡打卡成功，你的皮肤会感谢你的",
    "女王自律起来，连闹钟都害怕",
    "好孩子才早睡，你今天是好孩子",
    "早睡了，明天的你会感激现在的你",
    "你看看你，说睡就睡，多有执行力",
    "女王熄灯，全世界晚安",
    "十一点半之前躺平，这就是自律的味道",
    "早睡一次不难，难的是你居然做到了",
  ],
  sleepLate: [
    "这个点了才睡？你的黑眼圈在鼓掌",
    "女王，您迟到了，给您打个安慰分吧",
    "说好的早睡呢？手机比我的话好听是吧",
    "熬夜一时爽，早起火葬场，记住了吗",
    "晚了，但至少你还记得打卡，给你一分",
    "女王夜不归寝，皮肤已提交辞呈",
    "你管这叫早睡？你的标准真的很灵活",
    "安慰分收好，别拿去买熬夜的借口",
    "迟到了，但好歹来了，半个好孩子吧",
    "又晚了，你跟早睡之间隔着一个手机",
  ],
  expense: [
    "花出去了，钱：再见，下辈子见",
    "女王消费已记录，国库微微一颤",
    "记账了，至少你花得明明白白",
    "又花钱了？你的钱包想和你谈谈",
    "女王的支出已入册，户部尚书表示压力很大",
    "花了就花了，人活着不是为了攒钱的——等等",
    "消费记录已保存，你的钱正在向你告别",
    "记上了，月底复盘的时候别怪我没提醒你",
    "女王挥金，臣已记下",
    "花钱一时爽，记账哭半天",
    "支出已记录，你离月光又近了一步",
    "记账是好习惯，花钱这个习惯可以改改",
    "已记录，钱虽然走了，但账还在",
    "女王今日消费已归档，请节哀",
    "花了就不要后悔，后悔就不要花——你选哪个",
  ],
  income: [
    "女王进账，恭喜恭喜",
    "额外收入？你背着我去搞钱了？",
    "钱来了，好事，继续",
    "女王的金库又扩充了，可喜可贺",
    "进账了，你的存款终于可以微笑了",
    "搞钱女王名不虚传",
    "这笔入账很好，下次多来点",
    "收入已记录，继续保持这个赚钱的劲头",
    "钱来找你了，说明你值得",
    "又有进账，你比你以为的能干",
  ],
  moodHappy: [
    "女王心情好，普天同庆",
    "开心就对了，这是你今天最正确的决定",
    "快乐不需要理由，但值得被记住",
    "你笑起来的样子，值得存档",
    "开心已记录，宇宙收到了",
    "女王龙颜大悦，万物可爱",
    "这一刻的快乐是真的，记下来",
    "开心是一种才能，你天赋异禀",
    "此刻你是快乐的，这就够了",
    "记住今天，以后不开心的时候翻翻看",
    "女王今日份的快乐已归档，永久保存",
    "开心的理由可以没有，但开心本身是真的",
    "你快乐，所以今天这一天没有白过",
    "好心情比好天气稀有，记下来",
    "女王笑了，花都不好意思不开了",
    "能让自己开心的人，了不起",
    "快乐是你给自己发的奖金，签收了",
    "这个瞬间值得被铆钉在时间线上",
    "女王今天的心情是满分，不接受反驳",
    "你开心我就放心了——真的",
    "快乐这种事，多多益善，贪心点没关系",
    "今天你是自己的太阳，不用谁来照亮",
    "存在主义认为快乐本身就是意义，你赢了",
    "这份好心情比你的存款值钱",
    "女王心情晴，全城宜出行",
    "笑就完了，分析什么原因",
    "快乐一秒也是快乐，你今天赚到了",
    "你看，活着有时候就是这么好",
    "开心是一种超能力，你今天变身了",
    "女王的快乐已加密保存，谁也夺不走",
    "此刻的你，值得被这个世界温柔以待",
    "开心就好好开心，别想着它会溜走",
    "今天这一笔，是你人生的高光时刻",
    "女王今天自带光芒，不接受调暗",
    "你快乐的样子比努力的样子好看",
    "记下来，这是你活着的证据之一",
    "好心情是最好的护肤品，省钱了",
    "这一刻没有烦恼，请尽情享用",
    "女王高兴，天下太平",
    "你今天做了一件大事——开心了",
    "人生苦短，你居然在笑，了不起",
    "这份快乐归你，不用还",
    "今日限定款好心情，仅此一份",
    "女王的笑容已收录，编号第N次幸福",
    "你值得所有好事发生，从今天开始",
    "快乐是存在的意义，你刚刚证明了",
    "别分析为什么开心，享受就好",
    "女王今天的样子，很适合被记住",
    "你开心，就是这世界还不错的证据",
    "已记录，这是你送给未来自己的礼物",
  ],
  moodSad: [
    "不开心就不开心吧，这很正常",
    "女王也有下雨天，允许的",
    "你不需要假装没事，在这里不用",
    "难过是真的，不用解释为什么",
    "今天可以不坚强，我不告诉别人",
    "女王暂时退朝，世界等一等",
    "情绪低谷也是地形的一部分",
    "不开心的你也是完整的你",
    "没关系，不是每天都要是好的一天",
    "你已经在承受了，这本身就很厉害",
    "女王今天不营业，改日再说",
    "坏情绪不是敌人，是信号而已",
    "难过的时候不用找出路，坐一会儿就好",
    "今天就到这里吧，够了",
    "女王偶尔脆弱，依然是女王",
    "你不欠这个世界一个笑脸",
    "不开心也值得被记录，它也是你",
    "什么都不想做的话，就什么都不做",
    "这种时候不用讲道理，讲了也没用",
    "女王今天需要一点安静，已安排",
    "情绪不好不是你的错，真的不是",
    "你可以在这里待一会儿，没人赶你",
    "不开心就不开心，又不犯法",
    "今天的你辛苦了，我知道的",
    "女王的心事已加密，只有自己能看",
    "哭也行，不哭也行，你说了算",
    "低落是暂时的，但你不用现在就相信这句话",
    "今天不行就不行，明天再说明天的",
    "你不需要振作，只需要待着就好",
    "女王休息中，勿扰",
    "难过不丢人，装不难过才累",
    "你已经很努力地活着了，这就够了",
    "这个世界欠你一个拥抱，先记账上",
    "情绪不好的时候，呼吸就是成就",
    "女王今天关闭了笑容权限，合情合理",
    "不想说话就不说，沉默也是一种表达",
    "你不需要被治愈，只需要被看见",
    "今天就放过自己吧",
    "不开心的理由不重要，你的感受才重要",
    "女王今天心里下雨了，伞已备好",
    "你可以脆弱，这不影响你很厉害",
    "有些日子就是这样的，过去就过去了",
    "不用急着好起来，慢慢的就好",
    "今天的难过已记录，它会过去的",
    "女王也是人，人就会不开心",
    "你此刻的感受是真实的，不必否认",
    "世界可以等你，不着急",
    "不开心的时候来这里记一笔，也算陪伴",
    "女王暂时关机，充电中",
    "你还在这里，这就够好了",
  ],
};

```

---

## `src/utils/ocr.js`

```js
// Image compression before OCR
export function compressImage(file, maxWidth = 1200, quality = 0.8) {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement("canvas");
      let w = img.width,
        h = img.height;
      if (w > maxWidth) {
        h = Math.round((h * maxWidth) / w);
        w = maxWidth;
      }
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
      const reader = new FileReader();
      reader.onload = () =>
        resolve({
          base64: reader.result.split(",")[1],
          mediaType: file.type || "image/jpeg",
        });
      reader.readAsDataURL(file);
    };
    img.src = url;
  });
}

// OCR via Anthropic API — requires API key stored in localStorage
export async function ocrImage(base64, mediaType) {
  const apiKey = localStorage.getItem("anthropic-api-key");
  if (!apiKey) {
    return {
      items: [],
      total: 0,
      error: "请先在设置中填入 Anthropic API Key",
    };
  }

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: {
                  type: "base64",
                  media_type: mediaType,
                  data: base64,
                },
              },
              {
                type: "text",
                text: `这是微信或支付宝的消费记录截图。请识别出所有支出/消费金额和对应描述。
注意：只统计支出/消费/转账/付款的金额，不要统计收入。
只返回纯JSON，不要任何其他文字或markdown：
{"items":[{"amount":数字,"note":"简短描述"}],"total":总金额数字}
如果图片不是消费截图或无法识别，返回：
{"items":[],"total":0,"error":"这不是消费截图，请上传微信或支付宝的账单截图"}`,
              },
            ],
          },
        ],
      }),
    });
    if (!res.ok) {
      const errText = await res.text();
      console.error("API error:", res.status, errText);
      return {
        items: [],
        total: 0,
        error: `接口错误 (${res.status})，请稍后重试`,
      };
    }
    const d = await res.json();
    if (d.error) {
      console.error("API response error:", d.error);
      return {
        items: [],
        total: 0,
        error: `识别服务异常：${d.error.message || "请稍后重试"}`,
      };
    }
    const txt = (d.content || []).map((c) => c.text || "").join("");
    if (!txt)
      return { items: [], total: 0, error: "未获取到识别结果，请重试" };
    const clean = txt.replace(/```json|```/g, "").trim();
    return JSON.parse(clean);
  } catch (e) {
    console.error("OCR error:", e);
    return {
      items: [],
      total: 0,
      error: `识别失败：${e.message || "网络错误，请检查网络后重试"}`,
    };
  }
}

```

---

