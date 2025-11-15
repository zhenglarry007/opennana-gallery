# OpenNana Gallery - Next.js + Tailwind CSS

一个基于 Next.js 和 Tailwind CSS 开发的提示词图库网站，视觉风格与 https://opennana.com/awesome-prompt-gallery/ 保持一致。

## 🎨 功能特点

- **视觉还原**: 精确复刻原网站的布局结构和配色方案
- **响应式设计**: 完美适配移动端和桌面端
- **搜索筛选**: 支持关键词搜索和分类筛选
- **性能优化**: 使用 Next.js 静态生成 (SSG) 优化性能
- **现代UI**: 采用 Tailwind CSS 实现现代化界面

## 🚀 技术栈

- **框架**: Next.js 14+ (React 19)
- **样式**: Tailwind CSS
- **语言**: TypeScript
- **图标**: Lucide React
- **部署**: Vercel

## 📦 快速开始

### 本地开发

1. 克隆项目:
```bash
git clone <repository-url>
cd opennana-gallery
```

2. 安装依赖:
```bash
npm install
```

3. 启动开发服务器:
```bash
npm run dev
```

4. 打开浏览器访问: http://localhost:3000

### 构建生产版本

```bash
npm run build
npm start
```

## 🌐 一键部署到 Vercel

点击下面的按钮一键部署到 Vercel:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=<your-repo-url>)

## 📁 项目结构

```
opennana-gallery/
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── layout.tsx    # 根布局
│   │   ├── page.tsx      # 首页
│   │   └── globals.css   # 全局样式
│   ├── components/       # 组件目录
│   └── lib/             # 工具函数和数据
│       └── data.ts      # 模拟数据
├── public/              # 静态资源
├── package.json         # 项目依赖
├── tsconfig.json       # TypeScript 配置
├── tailwind.config.js  # Tailwind CSS 配置
├── next.config.js      # Next.js 配置
└── vercel.json         # Vercel 部署配置
```

## 🎯 设计细节

### 配色方案
- **背景**: 深蓝/靛蓝渐变 (顶部较深)
- **文字**: 主标题白色，副标题浅灰色
- **标签**: 浅蓝色文字，深蓝色背景
- **卡片**: 深灰色背景，悬停效果

### 布局结构
- **导航栏**: 左侧对齐的标题和描述
- **搜索区域**: 搜索框 + 清除筛选按钮 + 计数
- **分类标签**: 水平滚动标签组
- **卡片网格**: 响应式网格布局 (1-5列)

## 📱 响应式断点

- 移动端: 1列
- 平板: 2列
- 小屏桌面: 3列
- 中屏桌面: 4列
- 大屏桌面: 5列

## 🔍 SEO 优化

- 使用 Next.js 元数据 API
- 语义化 HTML 结构
- 图片 alt 属性
- 响应式设计

## ⚡ 性能优化

- 静态生成 (SSG)
- 图片优化
- CSS 优化
- 代码分割

## 🧪 测试

使用 Lighthouse 进行性能测试，目标评分 ≥ 90。

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

Built with ❤️ using Next.js and Tailwind CSS