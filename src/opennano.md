通用提示词（生成标准数据对象）

输入参数
- 提示词内容：`prompt_text`
- 作者名称：`author_name`
- 编号：`number`
- 已有分类集合：`categories_pool`（来自项目既有分类，如 `fashion, photography, portrait, nature, animal, character, landscape, interior, 3d, minimalist, gaming, logo, futuristic, food, paper-craft`）

生成要求
- 生成约 10 个字的中文标题，贴合内容与风格
- 从 `categories_pool` 中挑选 2–5 个最相关分类，按相关度降序、用英文逗号分隔
- 生成图片路径：`/assets/images/{number}.jpeg`，同时写入到 `image` 与 `imageUrl`
- 将作者名与提示词内容拼接为高保真长字符串写入 `prompt1`（JSON 字符串形式，包含作者和原提示词内容）
- 提示词内容改成单行的长字符串，去除所有换行与多余转义，方便直接复制使用

输出格式（严格键名与结构）
```
{
  "title": "案例 {number}：{约10字标题}",
  "image": "/assets/images/{number}.jpeg",
  "category": "{cat1,cat2[,cat3...]}",
  "prompt1": "{JSON字符串}",
  "imageUrl": "/assets/images/{number}.jpeg"
}
```

示例输入
```
author_name = "Nano Banana"
number = 427
prompt_text = "韩国街头时尚镜面自拍，超现实比例"
categories_pool = [
  "fashion","photography","portrait","nature","animal","character",
  "landscape","interior","3d","minimalist","gaming","logo","futuristic",
  "food","paper-craft"
]
```
