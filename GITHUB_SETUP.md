# GitHub 仓库设置说明

## 创建GitHub仓库

1. 登录 GitHub
2. 点击右上角的 "+" 按钮，选择 "New repository"
3. 仓库名称：`opennana-gallery`
4. 选择 "Public"（公开）
5. 不要初始化 README（因为我们已经有文件了）
6. 点击 "Create repository"

## 推送代码

创建仓库后，复制仓库的HTTPS URL，格式如下：
`https://github.com/[您的用户名]/opennana-gallery.git`

然后在终端执行：

```bash
git remote add origin https://github.com/[您的用户名]/opennana-gallery.git
git branch -M main
git push -u origin main
```

## 如果推送仍然失败

### 选项1：使用SSH（推荐）
1. 设置SSH密钥（如果还没有）：
   ```bash
   ssh-keygen -t ed25519 -C "your_email@example.com"
   ```
2. 添加SSH密钥到GitHub账户
3. 使用SSH URL：
   ```bash
   git remote set-url origin git@github.com:[您的用户名]/opennana-gallery.git
   git push -u origin main
   ```

### 选项2：分步推送
```bash
# 分批推送，每次推送一部分历史
git push origin main --depth=1
```

### 选项3：使用GitHub Desktop
下载GitHub Desktop应用程序，通过图形界面推送

## 启用GitHub Pages

推送成功后：
1. 进入仓库的 Settings 页面
2. 找到 "Pages" 部分
3. 在 "Source" 下选择 "GitHub Actions"
4. 工作流将自动运行并部署您的网站

## 访问您的网站

部署完成后，网站地址：
`https://[您的用户名].github.io/opennana-gallery/`