# 多硬件生态监控看板 Demo

基于 React + Vite 的多硬件生态可视化看板，聚合新闻、课程、活动、产品、反馈和外部资源计算器，并提供主页面预览 + 子页面完整 CRUD 的管理体验。

## 技术栈

- React 19 + TypeScript
- Vite 7 + Tailwind CSS 4
- React Router DOM 7
- Radix UI（Dialog）
- Sonner（Toast）
- Node.js 脚本（新闻抓取与 AI 清洗）

## 当前功能总览

### 1) 硬件伙伴新闻

- 首页展示最新 3 条新闻。
- 支持新增、编辑、删除（自动新闻 + 手动新闻）。
- 支持新闻封面图片粘贴（`Ctrl/Cmd + V`）到输入框并转为 base64。
- 自动新闻来源于 `public/auto-news.json`，可由脚本定时刷新。
- 子页面：`/news` 提供完整列表与管理操作。

### 2) 星河多硬件课程与活动

- 首页课程/活动 Tab 分离展示，管理操作仅在子页面进行。
- 课程首页算法：严格显示 3 条，优先置顶，其次补齐“入门/进阶/高阶”，不足再按最新补齐。
- 活动首页展示置顶优先后的前 3 条。
- 子页面：
  - `/courses`：课程 CRUD、置顶、编辑复用新增表单。
  - `/activities`：活动 CRUD、置顶、编辑复用新增表单。
- 链接字段为空时，保存阶段自动注入 `invalid.local` 占位链接，避免输入框默认脏值。

### 3) 多硬件产品介绍

- 首页展示高亮优先的产品卡片（预览 2 条）。
- 卡片包含：
  - 右上厂商 Tag
  - 特性绿勾列表
  - 高亮态视觉（浅蓝背景 + 蓝边）
- 子页面：`/products` 提供完整 CRUD、设为高亮、删除。
- 支持“粘贴图片作为 Logo（base64）”。

### 4) 用户反馈与追踪

- 首页双栏布局：
  - 左侧反馈表单（模型/硬件为文本输入）
  - 右侧时间轴（仅最新 3 条）
- 子页面：`/feedback` 展示完整反馈流，并支持新增/编辑/删除。

### 5) 外部资源计算器（ai-calculator 集成）

- 看板中通过 iframe 嵌入外部计算器。
- 启动时自动探测可用地址（含 `3001/3000`），并持续重试。
- 未连接时显示“正在连接/手动重试”占位，不直接展示浏览器拒绝页。
- 支持 `dev:all` 一键启动看板 + 计算器。

## 路由结构

- `/`：看板首页
- `/news`：全部新闻
- `/courses`：全部课程
- `/activities`：全部活动
- `/products`：全部产品
- `/feedback`：全部反馈

## 本地开发

### 前置要求

- Node.js 18+（建议 20）
- npm

### 1) 安装主项目依赖

```bash
npm install
```

### 2) 启动看板（不含计算器）

```bash
npm run dev
```

### 3) 启动计算器子项目（首次需要初始化）

```bash
cd ai-calculator
cp .env.example .env
npm install --legacy-peer-deps
npx prisma generate
npx prisma db push
cd ..
```

### 4) 一键联调（推荐）

```bash
npm run dev:all
```

说明：

- `dev:calculator` 会先释放 `3001` 端口再启动，避免端口占用导致联动退出。
- `dev:all` 仅在进程失败时联动停止，不会因为正常退出码误杀其它进程。

## 环境变量

### 根目录 `.env`

```bash
GEMINI_API_KEY=...
ZHIPU_API_KEY=...
VITE_AI_CALCULATOR_URL=http://localhost:3001
```

- `GEMINI_API_KEY` / `ZHIPU_API_KEY`：用于新闻抓取脚本的双引擎 AI 清洗。
- `VITE_AI_CALCULATOR_URL`：外部计算器默认地址（可不填，组件会自动探测）。

### `ai-calculator/.env`

至少保证以下字段可用：

```bash
DATABASE_URL="file:./dev.db"
JWT_SECRET="..."
QIANFAN_API_KEY="..."
```

## 常用脚本

- `npm run dev`：启动看板
- `npm run dev:dashboard`：仅看板
- `npm run dev:calculator`：仅计算器（自动释放 3001）
- `npm run dev:all`：看板 + 计算器并行启动
- `npm run build`：构建看板
- `npm run preview`：预览构建产物
- `npm run lint`：ESLint
- `npm run fetch-news`：执行新闻抓取与 AI 清洗

## 新闻自动化抓取

- 工作流文件：`.github/workflows/schedule-news-fetch.yml`
- 定时执行 `npm run fetch-news`，输出到 `public/auto-news.json`
- 抓取流程：
  1. RSS / HTML 多源采集
  2. 关键词预过滤
  3. Gemini 主引擎摘要与相关性判断
  4. 智谱 GLM 备用引擎降级兜底
  5. 写入静态新闻数据供前端展示

## LocalStorage 数据键

- `manual_ecosystem_news`：手动新闻
- `deleted_news_ids`：删除的自动新闻 ID
- `edited_news_overrides`：自动新闻编辑覆盖
- `xinghe_courses_data`：课程数据
- `xinghe_activities_data`：活动数据
- `xinghe_hardware_products_data`：硬件产品数据
- `xinghe_feedback_data`：反馈数据

## 项目目录（主干）

```text
src/
  components/
    Header.tsx
    PartnerNews.tsx
    AddNewsDialog.tsx
    AdaptationMatrix.tsx
    CoursesAndEvents.tsx
    FeaturedProducts.tsx
    HardwareProductCard.tsx
    UserFeedback.tsx
    ToolEmbedContainer.tsx
  pages/
    Dashboard.tsx
    AllNews.tsx
    AllCourses.tsx
    AllActivities.tsx
    AllHardwareProducts.tsx
    AllFeedback.tsx
  hooks/
    useNewsData.ts
    useCoursesData.ts
    useActivitiesData.ts
    useHardwareProductsData.ts
    useFeedbackData.ts
  types/
  utils/
scripts/
  fetch-news.js
  dev-calculator.sh
ai-calculator/
```

## 备注

- `ai-calculator` 为独立子项目（Next.js + Prisma），本仓库通过 iframe 集成。
- 课程/活动链接若未填写，系统会在保存时注入占位链接，后续可在编辑模式替换为真实 URL。
