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
