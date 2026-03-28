// 统一 SVG 图标组件 — 温暖圆润风格
// 所有图标: stroke 线条, 圆角端点, 统一 viewBox 24x24

const I = ({ children, size = 24, color = "currentColor", fill = "none", ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={fill}
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    {children}
  </svg>
);

export const IconHome = (p) => (
  <I {...p}>
    <path d="M4 11.5V21h6v-6h4v6h6V11.5L12 3 4 11.5z" />
  </I>
);

export const IconCheckCircle = (p) => (
  <I {...p}>
    <circle cx="12" cy="12" r="9.5" />
    <path d="m9 12 2 2 4-4" />
  </I>
);

export const IconExpense = (p) => (
  <I {...p}>
    <path d="M12 3v14" />
    <path d="m7 12 5 5 5-5" />
    <path d="M5 21h14" />
  </I>
);

export const IconIncome = (p) => (
  <I {...p}>
    <path d="M12 21V7" />
    <path d="m7 12 5-5 5 5" />
    <path d="M5 3h14" />
  </I>
);

export const IconMonitor = (p) => (
  <I {...p}>
    <rect x="3" y="4" width="18" height="12" rx="2" />
    <path d="M8 20h8" />
    <path d="M12 16v4" />
  </I>
);

export const IconSettings = (p) => (
  <I {...p}>
    <circle cx="12" cy="12" r="3" />
    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
  </I>
);

export const IconHistory = (p) => (
  <I {...p}>
    <circle cx="12" cy="12" r="9.5" />
    <path d="M12 7v5l3 3" />
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
    <rect x="4" y="13" width="4" height="8" rx="1" />
    <rect x="10" y="8" width="4" height="13" rx="1" />
    <rect x="16" y="3" width="4" height="18" rx="1" />
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

// 音符 — 代替吉他，更通用的音乐符号
export const IconGuitar = (p) => (
  <I {...p}>
    <circle cx="8" cy="18" r="4" />
    <path d="M12 18V4" />
    <path d="M12 4l7 3v2l-7-3" />
  </I>
);

// 月亮（早睡）
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

// 哑铃（锻炼）— 更直观的哑铃形状
export const IconDumbbell = (p) => (
  <I {...p}>
    <path d="M6 7v10" />
    <path d="M18 7v10" />
    <path d="M6 12h12" />
    <rect x="3" y="8" width="3" height="8" rx="1" />
    <rect x="18" y="8" width="3" height="8" rx="1" />
  </I>
);

// 星星（积分）— 实心填充
export const IconStar = ({ color = "currentColor", ...p }) => (
  <I color={color} fill={color} {...p}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </I>
);

// 奖杯 — 简化更清晰
export const IconTrophy = (p) => (
  <I {...p}>
    <path d="M6 9H4a2 2 0 0 1 0-4h2" />
    <path d="M18 9h2a2 2 0 0 0 0-4h-2" />
    <path d="M18 3H6v7a6 6 0 0 0 12 0V3z" />
    <path d="M9 21h6" />
    <path d="M12 16v5" />
  </I>
);
