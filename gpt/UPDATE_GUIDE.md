# GPT Gallery 更新指南

本文档介绍如何定期更新 GPT 提示词图库。

---

## 一、数据结构

每个条目包含以下字段：

```json
{
  "title": "案例 X：标题 (by @作者)",
  "category": "分类名称",
  "prompt": "提示词内容（非结构化文本）",
  "imageUrl": "/assets/images/X.jpg"
}
```

### 字段说明

| 字段 | 说明 | 示例 |
|------|------|------|
| `title` | 标题，自动生成编号 | "案例 48：都市穿搭指南 (by @xxx)" |
| `category` | 分类标签 | 见下方分类列表 |
| `prompt` | 原始提示词文本（可以是任何格式） | 完整的提示词内容 |
| `imageUrl` | 图片路径 | "/assets/images/48.jpg" |

### 可用分类

| 分类 | 说明 | 当前数量 |
|------|------|----------|
| `portrait` | 肖像、人物摄影 | 7 |
| `poster` | 海报、插画、宣传图 | 8 |
| `character` | 角色设计、设定资料 | 5 |
| `ui` | 界面设计、截图模拟 | 7 |
| `comparison` | 对比展示、模型评测 | 20 |

---

## 二、自动更新方式（推荐）

我已经创建了一个 Python 脚本来帮助你自动更新图库。

### 脚本位置

```
gpt/update_gpt_gallery.py
```

### 使用方法

1. **运行脚本**：

```bash
cd /Users/larryzheng/Downloads/code/opennana-gallery
python3 gpt/update_gpt_gallery.py
```

2. **选择功能**：

```
==================================================
GPT Gallery 更新工具
==================================================
1. 添加单个新条目
2. 批量添加多个条目
3. 查看统计信息
4. 验证数据完整性
5. 退出
==================================================
```

### 功能说明

#### 1. 添加单个新条目

适合添加 1-2 个新案例时使用：

1. 输入标题（不含"案例 X："部分）
2. 输入作者（可选，格式：@xxx）
3. 选择分类（1-5）
4. 输入提示词（多行，输入 `END` 结束）
5. 输入图片路径（可选，会自动复制到正确位置）
6. 确认添加

#### 2. 批量添加多个条目

适合一次性添加多个案例时使用：

1. 依次输入每个条目的标题、作者、分类、提示词
2. 输入 `Q` 退出输入模式
3. 预览所有待添加的条目
4. 确认全部添加

#### 3. 查看统计信息

查看当前图库的统计数据：

```
=== 图库统计 ===
总条目数: 47
最大图片编号: 47

分类统计:
  character: 5
  comparison: 20
  portrait: 7
  poster: 8
  ui: 7

图片目录文件数: 47
```

#### 4. 验证数据完整性

检查数据是否有问题：

- 检查是否缺少必填字段
- 检查是否有重复的 imageUrl

---

## 三、手动更新方式

如果你不想使用脚本，也可以手动更新。

### 步骤

#### 1. 确定下一个编号

查看当前最大的图片编号：

```bash
ls gpt/assets/images/ | sort -n | tail -5
```

当前最大是 `47.jpg`，下一个就是 `48`。

#### 2. 准备图片

将你的图片重命名为 `{编号}.jpg`，例如：

```
48.jpg
49.jpg
...
```

然后放到 `gpt/assets/images/` 目录。

#### 3. 编辑 JSON 文件

打开 `gpt/data/gpt_images_prompt.json`，在数组末尾添加新条目：

```json
{
  "title": "案例 48：你的标题 (by @作者)",
  "category": "poster",
  "prompt": "你的提示词内容...\n\n可以是多行的\n\n包含任何你想要的内容",
  "imageUrl": "/assets/images/48.jpg"
}
```

**注意事项：**
- 确保 JSON 语法正确（逗号、引号都要正确）
- 最后一个条目后面没有逗号
- 提示词中的换行需要用 `\n` 表示

#### 4. 验证 JSON 格式

可以用 Python 验证 JSON 是否正确：

```bash
python3 -c "import json; json.load(open('gpt/data/gpt_images_prompt.json')); print('JSON 格式正确')"
```

---

## 四、完整更新流程示例

### 场景：添加一个新案例

**新案例信息：**
- 标题：都市牛马一周穿搭指南
- 作者：@yourname
- 分类：poster（海报/信息图）
- 图片：已保存到桌面 `穿搭指南.jpg`
- 提示词：（见下方多行内容）

**方法一：使用脚本**

```bash
python3 gpt/update_gpt_gallery.py
```

选择 `1. 添加单个新条目`

```
=== 添加新条目 ===
下一个编号: 48

标题 (不含'案例 X：'部分): 都市牛马一周穿搭指南

作者 (可选，格式: @xxx): @yourname

请选择分类：
  1. portrait
  2. poster
  3. character
  4. ui
  5. comparison

请输入编号 (1-5): 2

请输入提示词内容（多行输入，输入 'END' 或空行结束）:
一张[瑞士/日式/北欧/法式]简约设计的"都市牛马一周穿搭指南"信息图...
（粘贴完整的提示词...）
END

图片文件路径 (可选，将复制为 48.jpg): /Users/larryzheng/Desktop/穿搭指南.jpg

=== 新条目预览 ===
{
  "title": "案例 48：都市牛马一周穿搭指南 (by @yourname)",
  "category": "poster",
  "prompt": "一张[瑞士/日式/北欧/法式]简约设计的...",
  "imageUrl": "/assets/images/48.jpg"
}

确认添加? (y/n): y

✅ 成功添加！当前共 48 个条目
```

**方法二：手动操作**

1. 复制图片：

```bash
cp /Users/larryzheng/Desktop/穿搭指南.jpg gpt/assets/images/48.jpg
```

2. 编辑 `gpt/data/gpt_images_prompt.json`，在数组末尾添加：

```json
{
  "title": "案例 48：都市牛马一周穿搭指南 (by @yourname)",
  "category": "poster",
  "prompt": "一张[瑞士/日式/北欧/法式]简约设计的\"都市牛马一周穿搭指南\"信息图...",
  "imageUrl": "/assets/images/48.jpg"
}
```

**注意**：提示词中的双引号需要转义为 `\"`

---

## 五、更新后验证

### 1. 本地测试

启动本地服务器测试：

```bash
cd /Users/larryzheng/Downloads/code/opennana-gallery
python3 -m http.server 8080
```

然后访问：
- http://localhost:8080/gpt/gpt-framework.html

检查新图片是否正确显示。

### 2. 部署到 GitHub Pages

```bash
git add -A
git commit -m "feat: 添加新案例 XYZ"
git push origin main
```

等待 2-5 分钟后访问：
- https://zhenglarry007.github.io/opennana-gallery/gpt/gpt-framework.html

---

## 六、常见问题

### Q1: JSON 格式错误怎么办？

使用 Python 检查错误位置：

```bash
python3 -c "import json; json.load(open('gpt/data/gpt_images_prompt.json'))"
```

它会告诉你具体哪一行有问题。

### Q2: 图片不显示？

检查以下几点：
1. 图片文件名是否正确（比如 `48.jpg` 而不是 `48.JPG`）
2. 图片是否在 `gpt/assets/images/` 目录
3. JSON 中的 `imageUrl` 是否正确（应该是 `/assets/images/X.jpg`）

### Q3: 提示词中有特殊字符？

如果提示词中有双引号 `"`，需要转义为 `\"`

例如：
```
错误: 提示词中有 "引用"
正确: 提示词中有 \"引用\"
```

或者使用脚本添加，脚本会自动处理转义。

### Q4: 如何批量添加很多条目？

使用脚本的批量添加功能（选项 2），或者创建一个临时 JSON 文件手动编辑。

---

## 七、文件位置汇总

| 项目 | 路径 |
|------|------|
| 主页面 | `gpt/gpt-framework.html` |
| 数据文件 | `gpt/data/gpt_images_prompt.json` |
| 图片目录 | `gpt/assets/images/` |
| 更新脚本 | `gpt/update_gpt_gallery.py` |
| 本文档 | `gpt/UPDATE_GUIDE.md` |

---

如有问题，随时可以找我帮忙！🎉
