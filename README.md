# OpenNana Gallery - 提示词图库

一个基于纯 HTML/CSS/JavaScript 构建的高质量提示词图库展示平台，包含两个独立的图库：Nano Gallery 和 GPT Gallery。

## 项目结构

```
opennana-gallery/
└── public/
    ├── nano/
    │   ├── assets/
    │   │   └── images/          # Nano 图片资源 (300+ 张)
    │   ├── data/
    │   │   ├── nano_prompts_20251118_183432.json
    │   │   └── nano_prompts_20260228.json
    │   └── opennana-framework.html  # Nano Gallery 主页面
    └── gpt/
        ├── assets/
        │   └── images/          # GPT 图片资源 (47 张)
        ├── data/
        │   └── gpt_images_prompt.json
        └── gpt-framework.html   # GPT Gallery 主页面
```

## 功能特点

### 1. 双图库展示

- **🎨 Nano Gallery**：Nano Banana 提示词图库，包含 300+ 个高质量案例
- **🤖 GPT Gallery**：GPT Image 2 Prompts 精选合集，包含 47 个高质量案例

### 2. 标签页导航

- 两个图库之间可以通过顶部标签页快速切换
- 当前页面标签页会高亮显示（active 状态）

### 3. 搜索功能

- 支持按标题搜索
- 支持按提示词内容搜索
- 支持按分类标签搜索
- 实时搜索，输入即触发

### 4. 分类筛选

- **Nano Gallery 分类**：3d, animal, architecture, branding, cartoon, character, clay, creative, emoji, fantasy, fashion, food, game, illustration, interior, landscape, logo, minimalist, paper-craft, pattern, photography, pixel-art, poster, product, style, t-shirt, tattoo, texture, typography, ui, wallpaper, watercolor, web 等
- **GPT Gallery 分类**：
  - `portrait` → 人物肖像
  - `poster` → 海报插画
  - `character` → 角色设计
  - `ui` → UI设计
  - `comparison` → 社区案例

### 5. 卡片网格展示

- 响应式网格布局
  - 移动端：1 列
  - 平板：2-3 列
  - 桌面端：4-5 列
- 卡片悬停效果
- 懒加载图片

### 6. 详情弹窗

- 点击任意卡片可查看完整详情
- 显示大尺寸图片
- 显示完整提示词（支持多行展示）
- 显示分类标签
- 支持 ESC 键或点击背景关闭

### 7. 复制提示词功能

- 一键复制提示词到剪贴板
- 复制成功后按钮状态变化提示
- 支持旧浏览器 fallback

### 8. 深色主题

- 统一的深色主题设计
- 深蓝渐变背景
- 蓝色主色调
- 高对比度文字

## 快速开始

### 方式一：使用 Python 内置服务器

```bash
cd /Users/larryzheng/Downloads/code/opennana-gallery/public
python3 -m http.server 8080
```

然后在浏览器中访问：

- **Nano Gallery**：http://localhost:8080/nano/opennana-framework.html
- **GPT Gallery**：http://localhost:8080/gpt/gpt-framework.html

### 方式二：使用其他 HTTP 服务器

任何能够提供静态文件服务的 HTTP 服务器都可以，例如：

- Node.js: `http-server`
- VS Code: Live Server 扩展
- Nginx, Apache 等

### 方式三：直接在 GitHub Pages 部署

将 `public` 目录部署到 GitHub Pages 或其他静态网站托管服务即可。

## 数据格式

### Nano Gallery 数据格式 (`nano/data/*.json`)

```json
[
  {
    "title": "案例 461：旗舰级全品类品牌平铺",
    "image": "/assets/images/461.jpg",
    "imageUrl": "/assets/images/461.jpg",
    "category": "logo,minimalist,paper-craft,food",
    "tags": ["logo", "minimalist", "paper-craft", "food"],
    "prompt1": "英文提示词内容...",
    "prompt2": "中文提示词内容（可选）..."
  }
]
```

### GPT Gallery 数据格式 (`gpt/data/gpt_images_prompt.json`)

```json
[
  {
    "title": "案例 1：Convenience Store Neon Portrait (by @BubbleBrain)",
    "imageUrl": "/assets/images/1.jpg",
    "category": "portrait",
    "prompt": "提示词内容..."
  }
]
```

## 技术栈

- **HTML5**：页面结构
- **CSS3**：样式、响应式布局、动画效果
- **JavaScript (ES6+)**：交互逻辑、数据处理
- **CSS Variables**：主题变量管理
- **CSS Grid & Flexbox**：布局系统

## 页面说明

### Nano Gallery (`nano/opennana-framework.html`)

- 标题：Nano Banana 提示词图库
- 描述：浏览、筛选模型提示词案例库，快速复制提示词，探索灵感。
- 数据文件：
  - `data/nano_prompts_20251118_183432.json`（主要数据）
  - `data/nano_prompts_20260228.json`（备用数据）

### GPT Gallery (`gpt/gpt-framework.html`)

- 标题：GPT Image 2 Prompts
- 描述：Awesome Collection of High-Quality Prompts & Examples（高质量提示词与案例精选合集）
- 数据文件：`data/gpt_images_prompt.json`

## 开发指南

### 添加新数据

1. 将图片放入对应的 `assets/images/` 目录
2. 更新对应的数据 JSON 文件
3. 确保图片文件名与 `imageUrl` 字段一致

### 修改样式

两个页面使用相同的 CSS 变量系统：

```css
:root {
    --foreground-rgb: 255, 255, 255;
    --background-start-rgb: 15, 23, 42;
    --background-end-rgb: 30, 41, 59;
    --slate-800: #1e293b;
    --slate-700: #334155;
    --slate-600: #475569;
    --blue-600: #2563eb;
    --blue-500: #3b82f6;
    --blue-300: #93c5fd;
    --gray-300: #d1d5db;
    --gray-400: #9ca3af;
}
```

### 添加新分类

修改 `gpt-framework.html` 中的 `categoryMap`：

```javascript
const categoryMap = {
    'portrait': '人物肖像',
    'poster': '海报插画',
    'character': '角色设计',
    'ui': 'UI设计',
    'comparison': '社区案例',
    // 添加新分类映射
};
```

## 注意事项

1. **图片路径**：确保图片文件名与 JSON 中的 `imageUrl` 一致，包括扩展名（.jpg/.jpeg/.png 等）
2. **相对路径**：所有资源都使用相对路径，便于部署到任意目录
3. **数据备份**：JSON 文件有 `.backup` 后缀的备份文件，防止数据丢失
4. **浏览器兼容**：使用了现代 JavaScript API（如 `navigator.clipboard`），但提供了 fallback 方案

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！

---

**Built with ❤️ using pure HTML, CSS and JavaScript**
