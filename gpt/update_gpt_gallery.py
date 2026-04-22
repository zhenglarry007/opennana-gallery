#!/usr/bin/env python3
import json
import os
import re
import shutil
import sys
from pathlib import Path
from datetime import datetime


GALLERY_DIR = Path(__file__).parent
DATA_FILE = GALLERY_DIR / "data" / "gpt_images_prompt.json"
IMAGES_DIR = GALLERY_DIR / "assets" / "images"
NEW_ENTRIES_JSON = GALLERY_DIR / "new_entries.json"
NEW_ENTRIES_MD = GALLERY_DIR / "new_entries.md"


CATEGORIES = ["portrait", "poster", "character", "ui", "comparison"]
DEFAULT_CATEGORY = "comparison"


def load_data():
    with open(DATA_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


def save_data(data):
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def get_next_index(data):
    max_index = 0
    for item in data:
        image_url = item.get("imageUrl", "")
        filename = os.path.basename(image_url)
        name_without_ext = os.path.splitext(filename)[0]
        try:
            idx = int(name_without_ext)
            if idx > max_index:
                max_index = idx
        except ValueError:
            continue
    return max_index + 1


def show_stats():
    data = load_data()
    categories = {}
    for item in data:
        cat = item.get("category", "unknown")
        categories[cat] = categories.get(cat, 0) + 1
    max_index = get_next_index(data) - 1
    image_files = list(IMAGES_DIR.glob("*.jpg"))
    
    print("\n" + "=" * 50)
    print("📊 图库统计")
    print("=" * 50)
    print(f"总条目数: {len(data)}")
    print(f"最大图片编号: {max_index}")
    print(f"图片文件数: {len(image_files)}")
    print("\n分类统计:")
    for cat, count in sorted(categories.items()):
        bar = "█" * (count // 2)
        print(f"  {cat:12} {count:3} {bar}")
    print("=" * 50)


def validate_category(cat):
    if cat and cat in CATEGORIES:
        return cat
    return DEFAULT_CATEGORY


def parse_markdown_entries(md_content):
    entries = []
    
    lines = md_content.split('\n')
    current_entry = None
    current_field = None
    current_value = []
    
    for line in lines:
        if line.startswith('## 条目'):
            if current_entry:
                if current_field and current_value:
                    current_entry[current_field] = '\n'.join(current_value).strip()
                if current_entry.get('title'):
                    entries.append(current_entry)
            
            current_entry = {}
            current_field = None
            current_value = []
            continue
        
        if not current_entry:
            continue
        
        if line.startswith('### 标题'):
            if current_field and current_value:
                current_entry[current_field] = '\n'.join(current_value).strip()
            current_field = 'title'
            current_value = []
            continue
        elif line.startswith('### 作者'):
            if current_field and current_value:
                current_entry[current_field] = '\n'.join(current_value).strip()
            current_field = 'author'
            current_value = []
            continue
        elif line.startswith('### 分类'):
            if current_field and current_value:
                current_entry[current_field] = '\n'.join(current_value).strip()
            current_field = 'category'
            current_value = []
            continue
        elif line.startswith('### 图片'):
            if current_field and current_value:
                current_entry[current_field] = '\n'.join(current_value).strip()
            current_field = 'image'
            current_value = []
            continue
        elif line.startswith('### 提示词'):
            if current_field and current_value:
                current_entry[current_field] = '\n'.join(current_value).strip()
            current_field = 'prompt'
            current_value = []
            continue
        
        if current_field:
            if line.strip() == '---' and current_field == 'prompt':
                continue
            current_value.append(line)
    
    if current_entry:
        if current_field and current_value:
            current_entry[current_field] = '\n'.join(current_value).strip()
        if current_entry.get('title'):
            entries.append(current_entry)
    
    return entries


def process_entry(raw_entry, next_index):
    title = raw_entry.get('title', '').strip()
    if not title:
        return None
    
    author = raw_entry.get('author', '').strip()
    category = validate_category(raw_entry.get('category', '').strip())
    prompt = raw_entry.get('prompt', '').strip()
    
    if not prompt:
        print(f"⚠️  警告: 条目 \"{title}\" 没有提示词")
    
    full_title = f"案例 {next_index}：{title}"
    if author:
        if not author.startswith('@'):
            author = '@' + author
        full_title = f"{full_title} (by {author})"
    
    image_source = raw_entry.get('image', '') or raw_entry.get('image_path', '') or raw_entry.get('image_filename', '')
    image_source = image_source.strip()
    
    entry = {
        "title": full_title,
        "category": category,
        "prompt": prompt,
        "imageUrl": f"/assets/images/{next_index}.jpg"
    }
    
    return entry, image_source, next_index


def copy_image(image_source, dest_index):
    if not image_source:
        return None
    
    dest_filename = f"{dest_index}.jpg"
    dest_path = IMAGES_DIR / dest_filename
    
    if os.path.isfile(image_source):
        shutil.copy2(image_source, dest_path)
        return f"已复制: {os.path.basename(image_source)} → {dest_filename}"
    
    if os.path.basename(image_source) == image_source:
        src_path = IMAGES_DIR / image_source
        if src_path.exists() and str(src_path) != str(dest_path):
            shutil.copy2(src_path, dest_path)
            return f"已复制: {image_source} → {dest_filename}"
    
    return f"跳过: {image_source} (文件不存在)"


def import_from_json(json_path):
    if not json_path.exists():
        print(f"❌ 文件不存在: {json_path}")
        return
    
    with open(json_path, 'r', encoding='utf-8') as f:
        raw_entries = json.load(f)
    
    if not isinstance(raw_entries, list):
        raw_entries = [raw_entries]
    
    data = load_data()
    next_index = get_next_index(data)
    processed_entries = []
    image_results = []
    
    print(f"\n📋 发现 {len(raw_entries)} 个新条目")
    print(f"📍 起始编号: {next_index}")
    
    for i, raw in enumerate(raw_entries):
        if raw.get('_note') and not raw.get('title'):
            continue
        
        result = process_entry(raw, next_index)
        if result:
            entry, image_source, idx = result
            processed_entries.append(entry)
            
            if image_source:
                img_result = copy_image(image_source, idx)
                if img_result:
                    image_results.append(img_result)
            
            next_index += 1
    
    if not processed_entries:
        print("⚠️  没有有效的条目可导入")
        return
    
    print(f"\n📝 预览 ({len(processed_entries)} 个条目):")
    print("-" * 50)
    for i, entry in enumerate(processed_entries, 1):
        print(f"{i}. {entry['title']}")
        print(f"   分类: {entry['category']}")
        print(f"   图片: {entry['imageUrl']}")
        preview = entry['prompt'][:100].replace('\n', ' ')
        if len(entry['prompt']) > 100:
            preview += '...'
        print(f"   提示词预览: {preview}")
        print()
    
    if image_results:
        print("🖼️ 图片操作:")
        for r in image_results:
            print(f"   {r}")
    
    confirm = input("\n❓ 确认导入这些条目? (y/n): ").strip().lower()
    if confirm == 'y':
        data.extend(processed_entries)
        save_data(data)
        print(f"\n✅ 成功导入 {len(processed_entries)} 个条目!")
        print(f"📊 现在总共有 {len(data)} 个条目")
    else:
        print("\n❌ 已取消导入")


def import_from_md(md_path):
    if not md_path.exists():
        print(f"❌ 文件不存在: {md_path}")
        return
    
    with open(md_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    raw_entries = parse_markdown_entries(content)
    
    if not raw_entries:
        print("⚠️  没有解析到有效条目")
        return
    
    data = load_data()
    next_index = get_next_index(data)
    processed_entries = []
    image_results = []
    
    print(f"\n📋 解析到 {len(raw_entries)} 个新条目")
    print(f"📍 起始编号: {next_index}")
    
    for raw in raw_entries:
        result = process_entry(raw, next_index)
        if result:
            entry, image_source, idx = result
            processed_entries.append(entry)
            
            if image_source:
                img_result = copy_image(image_source, idx)
                if img_result:
                    image_results.append(img_result)
            
            next_index += 1
    
    print(f"\n📝 预览 ({len(processed_entries)} 个条目):")
    print("-" * 50)
    for i, entry in enumerate(processed_entries, 1):
        print(f"{i}. {entry['title']}")
        print(f"   分类: {entry['category']}")
    
    confirm = input("\n❓ 确认导入这些条目? (y/n): ").strip().lower()
    if confirm == 'y':
        data.extend(processed_entries)
        save_data(data)
        print(f"\n✅ 成功导入 {len(processed_entries)} 个条目!")
    else:
        print("\n❌ 已取消导入")


def create_templates():
    json_template = GALLERY_DIR / "new_entries_template.json"
    md_template = GALLERY_DIR / "new_entries_template.md"
    
    if not NEW_ENTRIES_JSON.exists() and json_template.exists():
        shutil.copy2(json_template, NEW_ENTRIES_JSON)
        print(f"✅ 已创建: {NEW_ENTRIES_JSON.name}")
    
    if not NEW_ENTRIES_MD.exists() and md_template.exists():
        shutil.copy2(md_template, NEW_ENTRIES_MD)
        print(f"✅ 已创建: {NEW_ENTRIES_MD.name}")


def quick_add():
    print("\n⚡ 快速添加模式 (输入空行退出)")
    print("=" * 50)
    
    data = load_data()
    next_index = get_next_index(data)
    
    entries = []
    
    while True:
        print(f"\n--- 条目 {next_index} ---")
        
        title = input("标题: ").strip()
        if not title:
            break
        
        category = input(f"分类 [{DEFAULT_CATEGORY}]: ").strip() or DEFAULT_CATEGORY
        category = validate_category(category)
        
        author = input("作者 (可选): ").strip()
        
        print("提示词 (多行，输入 . 结束):")
        prompt_lines = []
        while True:
            line = input()
            if line.strip() == '.':
                break
            prompt_lines.append(line)
        prompt = '\n'.join(prompt_lines).strip()
        
        full_title = f"案例 {next_index}：{title}"
        if author:
            if not author.startswith('@'):
                author = '@' + author
            full_title = f"{full_title} (by {author})"
        
        entry = {
            "title": full_title,
            "category": category,
            "prompt": prompt,
            "imageUrl": f"/assets/images/{next_index}.jpg"
        }
        
        entries.append(entry)
        print(f"✓ 已添加: {full_title}")
        next_index += 1
    
    if entries:
        print(f"\n📝 准备添加 {len(entries)} 个条目")
        confirm = input("确认? (y/n): ").strip().lower()
        if confirm == 'y':
            data.extend(entries)
            save_data(data)
            print(f"\n✅ 成功添加 {len(entries)} 个条目!")
        else:
            print("\n❌ 已取消")


def print_help():
    print("\n" + "=" * 50)
    print("📖 GPT Gallery 更新工具 - 使用说明")
    print("=" * 50)
    print("""
推荐方式 (最快捷):
-------------------
1. 编辑 new_entries.json 或 new_entries.md
2. 运行: python3 update_gpt_gallery.py import

可用命令:
----------
python3 update_gpt_gallery.py
    交互式菜单

python3 update_gpt_gallery.py stats
    查看统计信息

python3 update_gpt_gallery.py import
    自动检测并导入 new_entries.json 或 new_entries.md

python3 update_gpt_gallery.py import new_entries.json
    从指定 JSON 文件导入

python3 update_gpt_gallery.py import new_entries.md
    从指定 Markdown 文件导入

python3 update_gpt_gallery.py quick
    快速添加模式 (简化版交互式)

python3 update_gpt_gallery.py template
    创建模板文件 (new_entries.json 和 new_entries.md)

文件格式说明:
-------------
JSON 格式 (new_entries.json):
[
  {
    "title": "标题",
    "author": "@作者 (可选)",
    "category": "poster",
    "prompt": "提示词内容",
    "image_path": "/path/to/image.jpg (可选)"
  }
]

Markdown 格式 (new_entries.md):
## 条目 1
### 标题
你的标题
### 分类
poster
### 提示词
你的提示词内容...

## 条目 2
...
""")
    print("=" * 50)


def main():
    args = sys.argv[1:]
    
    if not args:
        print("\n" + "=" * 50)
        print("🚀 GPT Gallery 更新工具")
        print("=" * 50)
        print("""
选择操作:
  1. 查看统计信息
  2. 自动导入 new_entries.json/new_entries.md
  3. 快速添加模式
  4. 创建模板文件
  5. 查看帮助
  0. 退出
""")
        
        choice = input("请选择 (0-5): ").strip()
        
        if choice == '1':
            show_stats()
        elif choice == '2':
            if NEW_ENTRIES_JSON.exists():
                import_from_json(NEW_ENTRIES_JSON)
            elif NEW_ENTRIES_MD.exists():
                import_from_md(NEW_ENTRIES_MD)
            else:
                print("⚠️  未找到 new_entries.json 或 new_entries.md")
                print("   运行选项 4 创建模板文件")
        elif choice == '3':
            quick_add()
        elif choice == '4':
            create_templates()
        elif choice == '5':
            print_help()
        else:
            print("👋 再见!")
        return
    
    cmd = args[0].lower()
    
    if cmd in ['stats', 's']:
        show_stats()
    elif cmd in ['import', 'i']:
        if len(args) > 1:
            file_path = Path(args[1])
            if file_path.suffix == '.json':
                import_from_json(file_path)
            elif file_path.suffix == '.md':
                import_from_md(file_path)
            else:
                print(f"❌ 不支持的文件格式: {file_path}")
        else:
            if NEW_ENTRIES_JSON.exists():
                import_from_json(NEW_ENTRIES_JSON)
            elif NEW_ENTRIES_MD.exists():
                import_from_md(NEW_ENTRIES_MD)
            else:
                print("⚠️  未找到 new_entries.json 或 new_entries.md")
    elif cmd in ['quick', 'q']:
        quick_add()
    elif cmd in ['template', 't']:
        create_templates()
    elif cmd in ['help', 'h', '--help', '-h']:
        print_help()
    else:
        print(f"❌ 未知命令: {cmd}")
        print_help()


if __name__ == "__main__":
    main()
