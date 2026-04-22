#!/usr/bin/env python3
import json
import os
import shutil
from pathlib import Path


GALLERY_DIR = Path(__file__).parent
DATA_FILE = GALLERY_DIR / "data" / "gpt_images_prompt.json"
IMAGES_DIR = GALLERY_DIR / "assets" / "images"


CATEGORIES = [
    "portrait",
    "poster",
    "character",
    "ui",
    "comparison"
]


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


def get_category_choice():
    print("\n请选择分类：")
    for i, cat in enumerate(CATEGORIES, 1):
        print(f"  {i}. {cat}")
    while True:
        try:
            choice = int(input("\n请输入编号 (1-5): ").strip())
            if 1 <= choice <= len(CATEGORIES):
                return CATEGORIES[choice - 1]
            print("无效选择，请重新输入。")
        except ValueError:
            print("请输入有效的数字。")


def add_new_entry():
    data = load_data()
    next_index = get_next_index(data)
    
    print(f"\n=== 添加新条目 ===")
    print(f"下一个编号: {next_index}")
    
    title = input("标题 (不含'案例 X：'部分): ").strip()
    
    author = input("作者 (可选，格式: @xxx): ").strip()
    if author and not author.startswith("@"):
        author = "@" + author
    
    category = get_category_choice()
    
    print("\n请输入提示词内容（多行输入，输入 'END' 或空行结束）:")
    prompt_lines = []
    while True:
        line = input()
        if line.strip() in ("END", ""):
            break
        prompt_lines.append(line)
    prompt = "\n".join(prompt_lines).strip()
    
    image_src = input(f"\n图片文件路径 (可选，将复制为 {next_index}.jpg): ").strip()
    
    full_title = f"案例 {next_index}：{title}"
    if author:
        full_title = f"{full_title} (by {author})"
    
    new_entry = {
        "title": full_title,
        "category": category,
        "prompt": prompt,
        "imageUrl": f"/assets/images/{next_index}.jpg"
    }
    
    if image_src and os.path.exists(image_src):
        dest_path = IMAGES_DIR / f"{next_index}.jpg"
        shutil.copy2(image_src, dest_path)
        print(f"图片已复制到: {dest_path}")
    elif image_src:
        print(f"警告: 图片文件不存在: {image_src}")
        print(f"请手动将图片命名为 {next_index}.jpg 并放到 {IMAGES_DIR}")
    else:
        print(f"请稍后将图片命名为 {next_index}.jpg 并放到 {IMAGES_DIR}")
    
    print("\n=== 新条目预览 ===")
    print(json.dumps(new_entry, ensure_ascii=False, indent=2))
    
    confirm = input("\n确认添加? (y/n): ").strip().lower()
    if confirm == "y":
        data.append(new_entry)
        save_data(data)
        print(f"\n✅ 成功添加！当前共 {len(data)} 个条目")
    else:
        print("\n已取消添加。")


def batch_add_entries():
    data = load_data()
    next_index = get_next_index(data)
    
    print(f"\n=== 批量添加模式 ===")
    print(f"起始编号: {next_index}")
    print("按 Q 退出，按 Ctrl+C 中断\n")
    
    new_entries = []
    current_index = next_index
    
    try:
        while True:
            print(f"\n--- 条目 {current_index} ---")
            
            title = input("标题 (Q=退出): ").strip()
            if title.upper() == "Q":
                break
            if not title:
                print("标题不能为空！")
                continue
            
            author = input("作者 (可选): ").strip()
            if author and not author.startswith("@"):
                author = "@" + author
            
            category = get_category_choice()
            
            print("提示词（多行，输入 END 结束）:")
            prompt_lines = []
            while True:
                line = input()
                if line.strip() == "END":
                    break
                prompt_lines.append(line)
            prompt = "\n".join(prompt_lines).strip()
            
            full_title = f"案例 {current_index}：{title}"
            if author:
                full_title = f"{full_title} (by {author})"
            
            entry = {
                "title": full_title,
                "category": category,
                "prompt": prompt,
                "imageUrl": f"/assets/images/{current_index}.jpg"
            }
            
            new_entries.append(entry)
            print(f"\n✓ 已准备添加: {full_title}")
            
            current_index += 1
            
    except KeyboardInterrupt:
        print("\n\n已中断。")
    
    if new_entries:
        print(f"\n=== 预览 ({len(new_entries)} 个新条目) ===")
        for i, entry in enumerate(new_entries, 1):
            print(f"{i}. {entry['title']}")
        
        confirm = input("\n确认全部添加? (y/n): ").strip().lower()
        if confirm == "y":
            data.extend(new_entries)
            save_data(data)
            print(f"\n✅ 成功添加 {len(new_entries)} 个条目！")
            print(f"   图片编号范围: {next_index} - {current_index - 1}")
            print(f"   请将对应图片放到: {IMAGES_DIR}")
        else:
            print("\n已取消。")
    else:
        print("\n没有添加任何条目。")


def show_stats():
    data = load_data()
    
    categories = {}
    for item in data:
        cat = item.get("category", "unknown")
        categories[cat] = categories.get(cat, 0) + 1
    
    max_index = get_next_index(data) - 1
    
    print(f"\n=== 图库统计 ===")
    print(f"总条目数: {len(data)}")
    print(f"最大图片编号: {max_index}")
    print(f"\n分类统计:")
    for cat, count in sorted(categories.items()):
        print(f"  {cat}: {count}")
    
    image_files = list(IMAGES_DIR.glob("*.jpg"))
    print(f"\n图片目录文件数: {len(image_files)}")


def validate_data():
    data = load_data()
    issues = []
    
    for i, item in enumerate(data):
        idx = i + 1
        if not item.get("title"):
            issues.append(f"条目 {idx}: 缺少 title")
        if not item.get("category"):
            issues.append(f"条目 {idx}: 缺少 category")
        if not item.get("prompt"):
            issues.append(f"条目 {idx}: 缺少 prompt")
        if not item.get("imageUrl"):
            issues.append(f"条目 {idx}: 缺少 imageUrl")
    
    image_set = set()
    for item in data:
        url = item.get("imageUrl", "")
        if url in image_set:
            issues.append(f"重复的 imageUrl: {url}")
        image_set.add(url)
    
    if issues:
        print(f"\n⚠️  发现 {len(issues)} 个问题:")
        for issue in issues:
            print(f"  - {issue}")
    else:
        print("\n✅ 数据验证通过！")


def main():
    while True:
        print("\n" + "=" * 50)
        print("GPT Gallery 更新工具")
        print("=" * 50)
        print("1. 添加单个新条目")
        print("2. 批量添加多个条目")
        print("3. 查看统计信息")
        print("4. 验证数据完整性")
        print("5. 退出")
        print("=" * 50)
        
        choice = input("\n请选择 (1-5): ").strip()
        
        if choice == "1":
            add_new_entry()
        elif choice == "2":
            batch_add_entries()
        elif choice == "3":
            show_stats()
        elif choice == "4":
            validate_data()
        elif choice == "5":
            print("\n再见！")
            break
        else:
            print("无效选择，请重新输入。")


if __name__ == "__main__":
    main()
