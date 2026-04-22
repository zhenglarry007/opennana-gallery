#!/usr/bin/env python3
import json
import os
import re
import shutil
from pathlib import Path


GALLERY_DIR = Path(__file__).parent
NEW_ENTRIES_DIR = GALLERY_DIR / "new_entries"
NEW_ENTRIES_JSON = GALLERY_DIR / "new_entries.json"


CATEGORIES = ["portrait", "poster", "character", "ui", "comparison"]
DEFAULT_CATEGORY = "comparison"


def escape_for_json(text):
    if text is None:
        return ""
    text = text.replace('\\', '\\\\')
    text = text.replace('"', '\\"')
    text = text.replace('\n', '\\n')
    text = text.replace('\r', '\\r')
    text = text.replace('\t', '\\t')
    return text


def unescape_from_json(text):
    if text is None:
        return ""
    text = text.replace('\\n', '\n')
    text = text.replace('\\r', '\r')
    text = text.replace('\\t', '\t')
    text = text.replace('\\"', '"')
    text = text.replace('\\\\', '\\')
    return text


def text_to_json_string(text):
    escaped = escape_for_json(text)
    return f'"{escaped}"'


def print_help():
    print("""
==================================================
📖 提示词转换工具 - 使用说明
==================================================

方式一：使用文件夹结构（推荐）
-----------------------------------
创建文件夹结构：
gpt/new_entries/
├── 001_第一个案例/
│   ├── title.txt      # 标题
│   ├── author.txt     # 作者（可选）
│   ├── category.txt   # 分类（可选）
│   ├── prompt.txt     # 提示词（直接粘贴，不需要转义）
│   └── image.jpg      # 图片（可选）
├── 002_第二个案例/
│   └── ...

然后运行：
python3 prepare_entry.py from-folder

方式二：转换单个文本文件
-----------------------------------
把提示词保存到 prompt.txt，然后运行：
python3 prepare_entry.py convert prompt.txt

方式三：交互式输入
-----------------------------------
python3 prepare_entry.py interactive

方式四：直接转换为 JSON 字符串
-----------------------------------
python3 prepare_entry.py escape "你的提示词内容"

==================================================
""")


def convert_text_file(file_path):
    file_path = Path(file_path)
    if not file_path.exists():
        print(f"❌ 文件不存在: {file_path}")
        return
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    json_string = text_to_json_string(content)
    
    print("\n" + "=" * 60)
    print("📝 转换结果（可直接复制到 JSON 中）")
    print("=" * 60)
    print(f"\n{json_string}\n")
    print("=" * 60)
    
    output_file = file_path.with_suffix('.json.txt')
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(json_string)
    print(f"✅ 已保存到: {output_file}")
    
    return json_string


def escape_text(text):
    json_string = text_to_json_string(text)
    print(f"\n转换结果:\n{json_string}\n")
    return json_string


def parse_entry_folder(folder_path):
    folder_path = Path(folder_path)
    
    entry = {}
    
    title_file = folder_path / "title.txt"
    if title_file.exists():
        with open(title_file, 'r', encoding='utf-8') as f:
            entry['title'] = f.read().strip()
    
    author_file = folder_path / "author.txt"
    if author_file.exists():
        with open(author_file, 'r', encoding='utf-8') as f:
            entry['author'] = f.read().strip()
    
    category_file = folder_path / "category.txt"
    if category_file.exists():
        with open(category_file, 'r', encoding='utf-8') as f:
            cat = f.read().strip().lower()
            if cat in CATEGORIES:
                entry['category'] = cat
            else:
                print(f"⚠️  未知分类: {cat}，使用默认: {DEFAULT_CATEGORY}")
                entry['category'] = DEFAULT_CATEGORY
    
    prompt_file = folder_path / "prompt.txt"
    if prompt_file.exists():
        with open(prompt_file, 'r', encoding='utf-8') as f:
            entry['prompt'] = f.read()
    
    for ext in ['.jpg', '.jpeg', '.png', '.webp']:
        image_file = folder_path / f"image{ext}"
        if image_file.exists():
            entry['image_path'] = str(image_file)
            break
    
    if not entry.get('title'):
        entry['title'] = folder_path.name
    
    return entry


def process_entries_folder():
    if not NEW_ENTRIES_DIR.exists():
        print(f"📁 创建文件夹: {NEW_ENTRIES_DIR}")
        NEW_ENTRIES_DIR.mkdir(parents=True)
        
        example_folder = NEW_ENTRIES_DIR / "001_示例案例"
        example_folder.mkdir()
        
        with open(example_folder / "title.txt", 'w', encoding='utf-8') as f:
            f.write("你的案例标题")
        
        with open(example_folder / "author.txt", 'w', encoding='utf-8') as f:
            f.write("@你的名字")
        
        with open(example_folder / "category.txt", 'w', encoding='utf-8') as f:
            f.write("poster")
        
        with open(example_folder / "prompt.txt", 'w', encoding='utf-8') as f:
            f.write("""在这里直接粘贴你的提示词，不需要转义！

可以包含"双引号"、换行、
以及各种特殊字符。

【特殊区块】
- 列表项 1
- 列表项 2

**加粗内容**
""")
        
        print(f"✅ 已创建示例文件夹: {example_folder}")
        print(f"📝 请按照示例格式添加你的条目，然后重新运行此命令")
        return
    
    folders = sorted([f for f in NEW_ENTRIES_DIR.iterdir() if f.is_dir()])
    
    if not folders:
        print(f"⚠️  文件夹 {NEW_ENTRIES_DIR} 中没有找到任何条目")
        return
    
    print(f"\n📂 发现 {len(folders)} 个条目文件夹")
    
    entries = []
    for folder in folders:
        print(f"\n--- 处理: {folder.name} ---")
        entry = parse_entry_folder(folder)
        
        if entry.get('title'):
            entries.append(entry)
            print(f"  ✅ 标题: {entry['title']}")
            if entry.get('prompt'):
                preview = entry['prompt'][:50].replace('\n', ' ')
                print(f"  📝 提示词预览: {preview}...")
    
    if not entries:
        print("\n⚠️  没有找到有效的条目")
        return
    
    print(f"\n{'='*60}")
    print(f"📊 汇总: 共 {len(entries)} 个条目")
    print('='*60)
    
    for i, entry in enumerate(entries, 1):
        print(f"{i}. {entry.get('title', '无标题')}")
    
    confirm = input("\n❓ 确认生成 new_entries.json? (y/n): ").strip().lower()
    if confirm != 'y':
        print("\n❌ 已取消")
        return
    
    with open(NEW_ENTRIES_JSON, 'w', encoding='utf-8') as f:
        json.dump(entries, f, ensure_ascii=False, indent=2)
    
    print(f"\n✅ 已生成: {NEW_ENTRIES_JSON}")
    print(f"\n下一步: 运行 python3 update_gpt_gallery.py import 导入这些条目")


def interactive_mode():
    print("\n" + "=" * 60)
    print("⚡ 交互式模式（按 Ctrl+C 退出）")
    print("=" * 60)
    
    entries = []
    
    while True:
        print(f"\n--- 条目 {len(entries) + 1} ---")
        
        title = input("标题 (空行结束): ").strip()
        if not title:
            break
        
        author = input("作者 (可选，直接回车跳过): ").strip()
        
        print(f"\n可用分类: {', '.join(CATEGORIES)}")
        category = input(f"分类 (默认: {DEFAULT_CATEGORY}): ").strip().lower()
        if not category or category not in CATEGORIES:
            category = DEFAULT_CATEGORY
        
        print("\n提示词 (多行输入，输入 . 在单独一行结束):")
        prompt_lines = []
        while True:
            line = input()
            if line.strip() == '.':
                break
            prompt_lines.append(line)
        prompt = '\n'.join(prompt_lines)
        
        entry = {
            'title': title,
            'category': category,
            'prompt': prompt
        }
        if author:
            entry['author'] = author
        
        entries.append(entry)
        print(f"\n✅ 已添加: {title}")
    
    if entries:
        print(f"\n{'='*60}")
        print(f"📊 共添加 {len(entries)} 个条目")
        print('='*60)
        
        save = input("\n❓ 保存到 new_entries.json? (y/n): ").strip().lower()
        if save == 'y':
            with open(NEW_ENTRIES_JSON, 'w', encoding='utf-8') as f:
                json.dump(entries, f, ensure_ascii=False, indent=2)
            print(f"\n✅ 已保存到: {NEW_ENTRIES_JSON}")
    else:
        print("\n⚠️  没有添加任何条目")


def main():
    import sys
    args = sys.argv[1:]
    
    if not args:
        print_help()
        return
    
    cmd = args[0].lower()
    
    if cmd in ['help', 'h', '--help', '-h']:
        print_help()
    
    elif cmd in ['convert', 'c']:
        if len(args) < 2:
            print("❌ 请指定要转换的文件路径")
            print("用法: python3 prepare_entry.py convert prompt.txt")
            return
        convert_text_file(args[1])
    
    elif cmd in ['escape', 'e']:
        if len(args) < 2:
            print("❌ 请指定要转换的文本")
            print("用法: python3 prepare_entry.py escape \"你的提示词\"")
            return
        text = ' '.join(args[1:])
        escape_text(text)
    
    elif cmd in ['from-folder', 'folder', 'f']:
        process_entries_folder()
    
    elif cmd in ['interactive', 'i']:
        try:
            interactive_mode()
        except KeyboardInterrupt:
            print("\n\n👋 已退出")
    
    else:
        print(f"❌ 未知命令: {cmd}")
        print_help()


if __name__ == "__main__":
    main()
