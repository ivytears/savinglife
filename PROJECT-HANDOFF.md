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
