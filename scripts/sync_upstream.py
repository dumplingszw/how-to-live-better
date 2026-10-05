# -*- coding: utf-8 -*-
"""同步上游 eternity4719/HowToLiveBetter 的内容到本仓库 docs/，并修正失效链接路径。

用法：
    python scripts/sync_upstream.py --upstream <上游仓库路径> [--target docs]

行为：
- 只同步正文内容：上游 book/NN-*.md（34 章）与 docs/*.md（补充文档，排除核实记录/）
- 不覆盖本站文件：index.md、about.md、docs/.vitepress/ 等
- 同步后统一修正链接（正文文字零改动）：
    * ../README.md        -> /index.md（回总目录指向站点首页）
    * ../docs/xxx.md      -> xxx.md（同目录相对引用）
- 输出本次新增/更新/删除的文件；无变化时输出 "NO_CHANGES" 并正常退出
"""
import argparse
import re
import shutil
import sys
from pathlib import Path

BOOK_RE = re.compile(r"^\d{2}-.+\.md$")  # 34 章：NN-标题.md

def fix_links(text: str) -> str:
    """修正链接路径，正文文字不改。

    VitePress 下 docs/ 是站点根，上游仓库里的相对引用需改写：
    - ../README.md          -> /index.md（回总目录指向站点首页）
    - ../docs/xxx.md        -> xxx.md（同目录相对引用）
    - ../LICENSE、../LICENSE-CODE（26 章授权段）-> 上游 GitHub 绝对地址
    - 核实记录/xxx.md（做平台要办哪些证）-> 上游 GitHub 绝对地址
    """
    out = text
    out = out.replace("](../README.md)", "](/index.md)")
    out = re.sub(r"\]\(\.\./docs/([^)\s]+)\)", lambda m: "](" + m.group(1) + ")", out)
    out = out.replace(
        "](../LICENSE)",
        "](https://github.com/eternity4719/HowToLiveBetter/blob/main/LICENSE)",
    )
    out = out.replace(
        "](../LICENSE-CODE)",
        "](https://github.com/eternity4719/HowToLiveBetter/blob/main/LICENSE-CODE)",
    )
    out = re.sub(
        r"\]\((核实记录/[^)\s]+\.md)\)",
        r"](https://github.com/eternity4719/HowToLiveBetter/blob/main/docs/\1)",
        out,
    )
    return out


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--upstream", required=True, help="上游仓库本地路径")
    ap.add_argument("--target", default="docs", help="目标 docs 目录")
    args = ap.parse_args()

    up = Path(args.upstream)
    target = Path(args.target)
    if not up.exists():
        print(f"ERROR: upstream not found: {up}")
        return 1

    # 本站自有文件，绝不覆盖
    protected = {"index.md", "about.md"}

    sources: list[tuple[Path, str]] = []  # (源文件, 目标文件名)
    book_dir = up / "book"
    if book_dir.exists():
        for f in sorted(book_dir.glob("*.md")):
            if BOOK_RE.match(f.name):
                sources.append((f, f.name))
    up_docs = up / "docs"
    if up_docs.exists():
        for f in sorted(up_docs.glob("*.md")):
            sources.append((f, f.name))  # 补充文档（核实记录/ 是子目录，glob 不包含）

    if not sources:
        print("ERROR: no content found in upstream (book/ or docs/)")
        return 1

    changed: list[str] = []
    for src, name in sources:
        if name in protected:
            continue
        dst = target / name
        content = src.read_text(encoding="utf-8")
        content = fix_links(content)
        if not dst.exists() or dst.read_text(encoding="utf-8") != content:
            dst.write_text(content, encoding="utf-8")
            changed.append(name)

    # 删除上游已不存在的章节文件（避免残留旧内容）
    existing = {f.name for f in target.glob("*.md") if BOOK_RE.match(f.name)}
    keep = {name for _, name in sources}
    for name in sorted(existing - keep):
        (target / name).unlink()
        changed.append(f"(deleted) {name}")

    if changed:
        print("CHANGED:")
        for c in changed:
            print("  " + c)
    else:
        print("NO_CHANGES")
    return 0


if __name__ == "__main__":
    sys.exit(main())
