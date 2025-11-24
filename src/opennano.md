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

生成条目 433
```
{
  "title": "案例 433：水族馆偶像光影写真集",
  "image": "/assets/images/433.jpeg",
  "category": "fashion,portrait,photography,interior",
  "prompt1": "{\"author\":\"@IamEmily2050\",\"content\":\"style_mode: raw_photoreal_high_fidelity; look: K-Pop idol aesthetic, flawless complexion, high-resolution digital photography, trendy; camera: vantage eye-level three-quarter view; framing: medium shot waist-up; lens_behavior: 85mm prime f/1.8 razor-sharp on eyes creamy bokeh; sensor_quality: full-frame zero noise; scene: environment setting indoor aquarium with large glass tanks; lighting: soft diffused blue-tinted light from tanks subtle fill clear eye catchlights; subject: young East Asian female K-Pop idol styling oval face high cheekbones subtle serene expression; hair: long wavy dark brown glossy strands frame face tucked behind left ear; expression: playful adorable confident; action: slight head tilt intense direct gaze large captivating almond-shaped eyes cute playful smile with dimples; makeup: K-beauty; complexion: glass skin dewy micro-pore detail; cheeks: subtle rosy blush; lips: matte pink; eyes: large almond-shaped dark brown dramatic winged liner voluminous long lashes sparkling reflective highlights; attire: top yellow one-shoulder long-sleeve crop top draped cotton; bottom high-waisted black slim pants silver button and zipper; accessories: small silver stud left ear; background: aquarium glass with colorful tropical fish corals blue water glow soft bokeh; aesthetic_controls: render_intent magazine editorial 8K clarity; material_fidelity: skin pores and gloss hair strand separation cotton fabric weave aquarium water ripples; color_grade: overall neutral warm skin vibrant aquarium colors; contrast: medium; negative_prompt: forbidden_elements blemishes harsh shadows matte skin dry lips extra fingers text watermark blur distortion dull eyes; forbidden_style anime painting low-res plastic skin over-airbrushed\"}",
  "imageUrl": "/assets/images/433.jpeg"
}
```
