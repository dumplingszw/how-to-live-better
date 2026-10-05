# 高性价比人生指南 · 在线阅读站

把开源书《高性价比人生指南》的全文渲染成适合阅读的文档站点（VitePress）。

**在线阅读：** 部署到 GitHub Pages 后访问（见下方「部署」）

## 这是什么

原书由 [eternity4719/HowToLiveBetter](https://github.com/eternity4719/HowToLiveBetter)
维护（[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授权），按「性价比」排序，
每条写清花掉什么、换回什么、证据多硬，只引期刊论文和官方文件。

本仓库不改动原书任何正文，只做两件事：

1. 把原书 `book/` 目录的 Markdown 内容原样收录到 `docs/`（含专题补充文档）
2. 用 [VitePress](https://vitepress.dev) 渲染成文档站点：左侧目录、大纲、全文搜索、明暗主题

## 本地使用

```bash
npm install        # 安装依赖
npm run dev        # 本地开发预览（默认 http://localhost:5173）
npm run build      # 构建静态站点（输出到 docs/.vitepress/dist）
npm run preview    # 预览构建产物（默认 http://localhost:4173）
```

## 部署（GitHub Pages）

1. 在仓库 Settings → Pages 里把 Source 设为 **GitHub Actions**
2. push 到 `main` 分支，`.github/workflows/deploy-vitepress.yml` 会自动构建并部署
3. 也可以在 Actions 页面手动触发 `Deploy VitePress site to Pages`

## 内容更新

`docs/` 下的正文来自上游 `book/` 目录与 `docs/` 补充文档，按需手动同步即可：

```bash
cp /path/to/HowToLiveBetter/book/*.md docs/
```

原仓库的 `.github/workflows/rebuild.yml` 仍会每日拉取上游重建单文件版 `index.html`（原「单文件阅读页」保留，双击即可打开、可离线读）。

## 页面结构

- **全书 34 节**：01 不要早死 … 34 家里的常备药别吃出事
- **专题与补充**：家庭应急装备清单、生物钟和夜班、结婚划不划算、做平台要办哪些证 等 8 篇
- **附录**：引用对照、关于本书

## 授权

原书正文由 [eternity4719/HowToLiveBetter](https://github.com/eternity4719/HowToLiveBetter)
以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授权。本站按许可证要求署名并
附上许可证链接，**未改动任何正文内容**。转载、改编、商用均可，只需同样署名并标明改动。

本仓库的构建脚本（`build.py`、VitePress 配置与工作流）不作任何权利保留。
