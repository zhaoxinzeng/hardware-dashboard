# 大模型多硬件生态监控看板

这是一个为“大模型多硬件生态监控”打造的单页响应式看板 Demo。项目采用现代化、极简主义的设计语言（参考 Vercel / Apple 开发者后台），并专注于跨硬件和多模型的生态兼容性、状态监控及活动资源聚合的展示。

## 预览

这个看板演示包含了以下 6 个核心模块：
1. **顶部导航**：带有全局搜索和用户状态。
2. **硬件伙伴新闻**：生态新闻展示矩阵。
3. **ERNIE/PaddlePaddle 适配矩阵**：各大模型（如文心一言 4.0）与不同底层生态硬件（NVIDIA, 昇腾, 昆仑芯, 燧原等）的兼容性与适配进度展示。
4. **星河多硬件课程与活动**：课程与活动双页签展示。
5. **多硬件产品介绍**：突出展示顶级生态硬件核心参数（如昇腾 910B, NVIDIA DGX）。
6. **用户反馈与追踪**：反馈提交表单及实时 Issue 瀑布流。
7. **资源计算器区**：看板底部的工具内嵌容器占位。

## 技术栈

- **框架**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **语言**: TypeScript
- **样式**: [Tailwind CSS v4](https://tailwindcss.com/)
- **图标**: [Lucide React](https://lucide.dev/)
- **UI 特性**: 结合 Flex/Grid 以及毛玻璃效果 (Glassmorphism) 的自定义现代组件风格，纯手工响应式打造。

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
