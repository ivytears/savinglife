export const getToday = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

export const fmtNum = (n) => Math.round(Math.abs(n)).toLocaleString("en-US");

// 总储蓄就是 data.totalSavings
export function calcTotal(data) {
  return data.totalSavings || 0;
}

// 今日信息：直接从 data 读取
export function getTodayInfo(data) {
  const today = getToday();
  const checkedIn = !!data.checkins?.[today];
  return {
    today,
    checkedIn,
    income: data.todayIncome || 0,
    expense: data.todayExpense || 0,
    net: (data.todayIncome || 0) - (data.todayExpense || 0),
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

// 判断当前时间是否在早睡有效窗口内（21:00 ~ 22:00）
export function isBeforeDeadline() {
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  // 21:00 = 1260分钟, 22:00 = 1320分钟
  return nowMinutes >= 1260 && nowMinutes < 1320;
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
