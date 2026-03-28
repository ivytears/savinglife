import { getToday, getWeekGuitarCount, getWeekExerciseCount, getConsecutiveSleepDays, calcTotal } from "./calc";

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

// 判断最近一次记录距今天数
function daysSinceLast(records) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dates = Object.keys(records || {}).sort().reverse();
  for (const d of dates) {
    if (d === getToday()) continue; // 跳过今天
    const past = new Date(d);
    past.setHours(0, 0, 0, 0);
    return Math.floor((today - past) / 86400000);
  }
  return 999; // 从未记录过
}

// 判断存款是否刚过整万关口
function justCrossedMilestone(data) {
  const total = calcTotal(data);
  const dailyIncome = data.settings?.dailyIncome || 0;
  const prevTotal = total - dailyIncome;
  const milestones = [10000, 20000, 50000, 100000, 200000, 500000, 1000000];
  for (const m of milestones) {
    if (total >= m && prevTotal < m) return m;
  }
  return null;
}

const CONTEXTS = {
  // ═══ 回家打卡 ═══
  checkin: [
    {
      // 处境1：周五回家
      match: () => new Date().getDay() === 5,
      lines: [
        "这一周结束了。你撑下来了",
        "周五了，这周的你很完整",
        "五天，你又靠自己走完了一周",
        "这一周不管怎样，你到家了",
      ],
    },
    {
      // 处境2：心情低落但还是回来了
      match: (data) => data.mood?.[getToday()] === "sad",
      lines: [
        "不开心也回来了，这就够了",
        "今天不容易吧。但你到家了",
        "外面的事先放在门外",
      ],
    },
    {
      // 处境3：存款刚过整万关口
      match: (data) => !!justCrossedMilestone(data),
      lines: [
        "你知道这个数字意味着什么吗——你一个人，走到这里了",
        "这个数字是你自己挣的，一天一天攒出来的",
        "又过了一个坎，安静地，靠自己",
      ],
    },
    {
      // 处境4：普通日回家
      match: () => true,
      lines: [
        "回来了，今天辛苦了",
        "到家了就好",
        "门关上了，外面的事跟你无关了",
      ],
    },
  ],

  // ═══ 练琴 ═══
  guitar: [
    {
      // 处境5：心情不好但还是弹了
      match: (data) => data.mood?.[getToday()] === "sad",
      lines: [
        "不开心还愿意碰琴，说明你知道什么能接住自己",
        "你没有找人诉苦，你去弹琴了。这比大多数方式都体面",
        "难过的时候弹琴的人，不会过得太差",
      ],
    },
    {
      // 处境6：本周第三次练琴（达标）
      match: (data) => getWeekGuitarCount(data) >= (data.settings?.guitarGoal || 3),
      lines: [
        "这周的琴够了。你照顾好自己了",
        "三次，不多不少，刚好是你的节奏",
        "这周不欠自己了",
      ],
    },
    {
      // 处境7：断了三天以上今天回来
      match: (data) => daysSinceLast(data.guitar) >= 3,
      lines: [
        "回来就好，琴一直在等你",
        "断了几天不重要，重要的是你记得回来",
        "它没怪你，你也别怪自己",
      ],
    },
    {
      // 处境8：深夜练琴
      match: () => new Date().getHours() >= 23,
      lines: [
        "这个点了还在弹，你今天一定需要它",
        "深夜的琴声只有你自己听得见，那就是你跟自己说话的方式",
        "夜深了，琴还醒着，你也是",
      ],
    },
    {
      // 处境9：普通
      match: () => true,
      lines: [
        "弹完了，你的手指今天活过了",
        "琴比道理有用，你知道的",
        "今天弹了，这就够了",
      ],
    },
  ],

  // ═══ 锻炼 ═══
  exercise: [
    {
      // 处境10：心情不好但还是锻炼了
      match: (data) => data.mood?.[getToday()] === "sad",
      lines: [
        "不开心的时候还愿意动，你在用身体消化情绪",
        "难过的时候去练，这是一种很安静的倔强",
        "你没有躺着等它过去，你动起来了",
      ],
    },
    {
      // 处境11：本周第二次锻炼（达标）
      match: (data) => getWeekExerciseCount(data) >= (data.settings?.exerciseGoal || 2),
      lines: [
        "这周的身体被你好好对待了",
        "两次，够了。你不需要多",
        "这周你跟自己的身体没有失约",
      ],
    },
    {
      // 处境12：断了三天以上今天回来
      match: (data) => daysSinceLast(data.exercise) >= 3,
      lines: [
        "回来了，身体比你想的更欢迎你",
        "多久没练不重要，你今天来了",
        "身体不记仇，你来它就高兴",
      ],
    },
    {
      // 处境13：普通
      match: () => true,
      lines: [
        "动了就行，你的身体会记住",
        "练了，今天对得起自己",
        "肌肉不会忘记你今天来过",
      ],
    },
  ],

  // ═══ 早睡 ═══
  sleepGood: [
    {
      // 处境14：连续早睡超过七天
      match: (data) => getConsecutiveSleepDays(data) >= 7,
      lines: [
        "连续七天了，这不是自律，这是你真的开始在意自己了",
        "七天，你跟自己的约定没有断",
        "一周了，你每天都选择了善待自己",
      ],
    },
    {
      // 处境15：断了三天以上今天回来早睡
      match: (data) => daysSinceLast(data.sleep) >= 3,
      lines: [
        "好久没在这个点见到你了。欢迎回来",
        "回来了就好，不追究",
        "断了就断了，今晚重新开始",
      ],
    },
    {
      // 处境16：按时早睡（通用）
      match: () => true,
      lines: [
        "今天选择照顾自己，晚安",
        "睡吧，明天的你会感谢现在的你",
        "能在这个点放下手机的人，了不起",
      ],
    },
  ],

  sleepLate: [
    {
      // 处境17：晚了但来打卡了
      match: () => true,
      lines: [
        "晚了，但你来了。不说教，睡吧",
        "今天迟到了，没关系，明天再来",
        "不是每天都能按时的，知道就好",
      ],
    },
  ],

  // ═══ 心情 ═══
  mood_happy: [
    {
      // 处境18：开心
      match: () => true,
      lines: [
        "开心的时候不用分析为什么，享受就好",
        "这一刻是真的，记下来",
        "你值得所有让你笑的事",
      ],
    },
  ],

  mood_sad: [
    {
      // 处境19：不开心，但今天已经做了其他打卡
      match: (data) => {
        const today = getToday();
        return !!(data.checkins?.[today] || data.guitar?.[today] || data.exercise?.[today]);
      },
      lines: [
        "不开心还在坚持的你，比你以为的更强",
        "今天不容易，但你没有停下来。我看见了",
        "难过的时候还在照顾自己的人，不会被辜负的",
      ],
    },
    {
      // 处境20：不开心（通用）
      match: () => true,
      lines: [
        "不开心就不开心吧，不用修复",
        "你不需要跟任何人解释",
        "今天就到这里吧，够了",
      ],
    },
  ],
};

// 主函数：根据类型和数据，匹配处境，返回文案
export function getContextCopy(type, data) {
  const contexts = CONTEXTS[type];
  if (!contexts) return "";
  for (const ctx of contexts) {
    if (ctx.match(data)) {
      return pick(ctx.lines);
    }
  }
  return "";
}
