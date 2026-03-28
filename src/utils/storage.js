// 数据存储层

const STORE_KEY = "savings-flip-v4";
const OLD_STORE_KEY = "savings-flip-v3";

export const defaultData = {
  totalSavings: 125325,   // 总储蓄，直接加减
  todayIncome: 0,         // 今日收入（打卡+额外）
  todayExpense: 0,        // 今日支出
  todayDate: "",          // 今日日期，用于每天重置
  settings: {
    dailyIncome: 1400,
    configured: true,
    guitarGoal: 3,
    exerciseGoal: 2,
    sleepDeadline: "23:30",
  },
  checkins: {},
  expenses: {},
  extraIncomes: {},
  guitar: {},
  exercise: {},
  mood: {},
  sleep: {},
  rewards: {
    totalPoints: 0,
    history: [],
  },
};

// 旧版计算总储蓄（用于迁移）
function calcTotalLegacy(data) {
  const s = data.settings || {};
  const checkinCount = Object.keys(data.checkins || {}).length;
  const totalIncome = checkinCount * (s.dailyIncome || 0);
  let totalExtra = 0;
  Object.values(data.extraIncomes || {}).forEach((d) => {
    (d.items || []).forEach((i) => { totalExtra += i.amount || 0; });
  });
  let totalExp = 0;
  Object.values(data.expenses || {}).forEach((d) => {
    (d.items || []).forEach((i) => { totalExp += i.amount || 0; });
  });
  return (s.initialSavings || 0) + totalIncome + totalExtra - totalExp;
}

export function loadData() {
  try {
    let raw = localStorage.getItem(STORE_KEY);

    if (!raw) {
      const oldRaw = localStorage.getItem(OLD_STORE_KEY);
      if (oldRaw) {
        raw = oldRaw;
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

      if (parsed.totalSavings === undefined) {
        parsed.totalSavings = 125325;
      }
      if (!parsed.todayDate) parsed.todayDate = "";
      if (parsed.todayIncome === undefined) parsed.todayIncome = 0;
      if (parsed.todayExpense === undefined) parsed.todayExpense = 0;

      // 每日重置今日收支
      const today = new Date();
      const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
      if (parsed.todayDate !== todayStr) {
        parsed.todayIncome = 0;
        parsed.todayExpense = 0;
        parsed.todayDate = todayStr;
      }

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
