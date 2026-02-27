# 大模型多硬件生态监控看板

这是一个为“大模型多硬件生态监控”打造的单页响应式看板 Demo。项目采用现代化、极简主义的设计语言（参考 Vercel / Apple 开发者后台），并专注于跨硬件和多模型的生态兼容性、状态监控及活动资源聚合的展示。

## 预览

## 产品架构与核心特性

这个看板不仅仅是一个静态页面，它集成了**持续稳定的数据生命周期管道**，囊括了以下 7 个核心业务流与功能：

1. **混合来源动态新闻 (Hybrid Data Stream)**：
   - 支持跨平台的自动化采集，底层 Node.js 爬虫通过 RSS 与 API 接口多端抓取硬件资讯。
   - `localStorage` 前端记忆化支持用户手工 PUSH 高优先级/置顶热点新闻（带“🔥 重大发新”标签）。
2. **双引擎智能AI网关 (Dual-LLM Failover Pipeline)**：
   - 抓取的数据进入 **Google Gemini 2.5 Flash** 进行数据鉴别与脱水，将无用的 PR 稿全部 `REJECT`，为纯技术干货提炼金句。
   - 具备**零感知降级重试切流机制**：当 Gemini 频繁报 429 限流时，底层瞬间交棒给备用的 **智谱 GLM-4-Flash** 模型完成全自动接续数据清洗，永不挂机。
   - 自动通过 GitHub Actions (Cron Jobs) 触发，实现免运维的全自动定时大屏更新。
3. **顶部导航**：带有全局搜索和用户状态。
4. **ERNIE/PaddlePaddle 适配矩阵**：各大模型（如文心一言 4.0）与不同底层生态硬件（NVIDIA, 昇腾, 昆仑芯, 燧原等）的兼容性与适配进度展示。
5. **星河多硬件课程与活动**：课程与活动双页签展示。
6. **多硬件产品介绍**：突出展示顶级生态硬件核心参数（如昇腾 910B, NVIDIA DGX）。
7. **用户反馈与追踪**：反馈提交表单及实时 Issue 瀑布流。

## 完整技术栈

- **框架**: [React 19](https://react.dev/) + [Vite 6](https://vitejs.dev/) + TypeScript
- **状态与存储**: React Hooks + LocalStorage
- **样式与UI**: [Tailwind CSS v4](https://tailwindcss.com/) + [Lucide React](https://lucide.dev/) (结合毛玻璃 Glassmorphism 设计理念)
- **数据管道流 (Data Pipeline)**: 
  - Node.js (ES Modules), `fs/promises`
  - 并发网络抓取: `axios`, `rss-parser` 
  - 大模型SDK: `@google/genai` (主), `openai` (智谱备)
  - 自动化基础设施: **GitHub Actions Workflow**

## 本地运行

在本地运行此项目前，请确保您已经安装了 [Node.js](https://nodejs.org/)(建议使用 LTS 版本)。

```bash
# 1. 下载或克隆仓库到本地
# git clone <your-repo-url>
# cd 多硬件生态看板Demo

# 2. 安装依赖
npm install

# 3. 启动本地开发服务器
npm run dev
```

启动后，在浏览器中访问命令提示的 URL（通常是 `http://localhost:5173`）即可查看项目页面。

## 构建生产版本

```bash
# 生成打包后的静态文件，存放在 dist/ 目录中
npm run build

# 预览生成的结果
npm run preview
```

## 目录结构

```text
├── src/
│   ├── components/                 # 核心看板组件目录
│   │   ├── Header.tsx              # 顶部导航栏
│   │   ├── PartnerNews.tsx         # 硬件伙伴新闻模块
│   │   ├── AdaptationMatrix.tsx    # 框架/硬件适配状态矩阵
│   │   ├── CoursesAndEvents.tsx    # 相关课程与生态活动 Tab 界
│   │   ├── FeaturedProducts.tsx    # 多硬件产品介绍展示卡片
│   │   ├── UserFeedback.tsx        # 用户反馈表单和实时瀑布流
│   │   └── ToolEmbedContainer.tsx  # 外部资源计算器内嵌占位区
│   ├── App.tsx                     # 根组件，控制页面布局和模块聚合
│   ├── index.css                   # 全局样式（包含 Tailwind 变量）
│   ├── main.tsx                    # React 程序入口文件
│   └── vite-env.d.ts               # Vite 环境变量声明
├── index.html                      # 挂载的 HTML 基础模板
├── package.json                    # NPM 依赖管理
├── tailwind.config.ts              # （如果是 v3 则有此文件，v4 中在 css 内配置）
├── vite.config.ts                  # Vite 打包配置
└── tsconfig.json                   # TypeScript 配置
```

## 设计与交互原则

*   **色彩规范**：主背景为浅白/灰（`#F8FAFC`），品牌主色调使用 **Tech Blue** (`#0066FF`)。
*   **设计美学**：极简大气，严格控制边距（Margin/Padding），避免视觉过渡拥挤。
*   **多端兼容**：页面实现了从桌面宽屏到移动端窄屏的自适应布局（Grid、Flexbox）。
*   **动效细节**：所有的 Hover 交互（按钮、卡片浮动、Tab 切换）均配备 `transition-all duration-300` 类型的平滑补间动画。

## 贡献指南

我们欢迎通过完善 Issue 及 Pull Request 来协助优化这个看板演示。在添加新组件或大幅更改样式之前，建议先提交 Issue 交流。

---
