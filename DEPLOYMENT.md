# GitHub Pages 部署配置

## 需要的设置步骤：

### 1. 启用GitHub Pages
1. 进入GitHub仓库设置 (Settings)
2. 找到 "Pages" 部分
3. 在 "Source" 下选择 "GitHub Actions"

### 2. 配置权限（如果需要）
如果工作流运行失败，可能需要手动配置权限：
1. 进入 Settings > Actions > General
2. 在 "Workflow permissions" 下选择 "Read and write permissions"
3. 勾选 "Allow GitHub Actions to create and approve pull requests"

### 3. 触发部署
推送代码到main分支将自动触发部署：
```bash
git add .
git commit -m "Configure GitHub Pages deployment"
git push origin main
```

## 部署状态
- 工作流运行状态可以在 Actions 标签页查看
- 部署完成后，网站将可通过以下地址访问：
  `https://[your-username].github.io/opennana-gallery/`

## 本地测试
在推送之前，可以本地测试构建：
```bash
npm run build
python3 -m http.server 8081 --directory out
```
然后访问 http://localhost:8081 查看效果