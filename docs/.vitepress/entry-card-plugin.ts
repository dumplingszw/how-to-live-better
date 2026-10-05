// entry-card-plugin.ts
// markdown-it 插件：把「### N. 标题 + 字段列表」的条目重组为结构化卡片。
// 正文文字不做任何改动，只改变渲染结构。
//
// 关键兼容点（vitepress 1.6.4）：
// 1. local search 的 splitPageIntoSections 用 /<h(\d*).*?>(.*?<a.*? href="#.*?".*?>.*?<\/a>)<\/h\1>/gi
//    对渲染 HTML 做 split 切分索引。卡片 h3 必须内嵌 header-anchor（href="#..."），
//    否则正则引擎会对每个 h3 回溯到文档末尾，O(n²) 卡死构建。
// 2. html_block 里的标题不进入 env.headers（token 流层面），页面大纲仅保留 h1/h2。
import type MarkdownIt from 'markdown-it'

const FIELD_PREFIX = /^(-{0,2})\s*(成本|说人话|收益|证据等级|来源|备注)：(.*)$/
const COST_TAG_RE = /<!--\s*成本标签:\s*(.*?)\s*-->/

// 与原单页 build.py 一致的性价比档位规则
const COST_W: Record<string, Record<string, number>> = {
  钱: { '0': 0, 少: 1, 多: 2 },
  时间: { 少: 0, 中: 1, 多: 2 },
  毅力: { 否: 0, 些: 1, 是: 2 },
}
const RATIO_ORDER: Record<string, number> = { 极高: 0, 高: 1, 一般: 2 }

function ratioOf(tags: Record<string, string>): string | null {
  let cs = 0
  for (const k of ['钱', '时间', '毅力']) {
    const v = COST_W[k]?.[tags[k]]
    if (v === undefined) return null
    cs += v
  }
  const lv = tags['收益']
  if (lv === '大') return cs === 0 ? '极高' : cs <= 2 ? '高' : '一般'
  if (lv === '中' && cs === 0) return '高'
  return '一般'
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

// 轻量 markdown 行内转换（照搬原单页 build.py 的 inline 逻辑）：
// 先转义，再还原链接与加粗，避免在 core 阶段反复调用 renderInline 的性能开销。
function inlineHtml(s: string): string {
  const stash: string[] = []
  const mk = (url: string, text?: string) => {
    const shown = text || url
    const clipped = shown.length > 62 ? shown.slice(0, 59) + '…' : shown
    stash.push(`<a href="${esc(url)}" target="_blank" rel="noopener">${esc(clipped)}</a>`)
    return `\u0001${stash.length - 1}\u0001`
  }
  let out = esc(s)
  out = out.replace(/&lt;(https?:\/\/[^\s]+?)&gt;/g, (_, u) => mk(u))
  out = out.replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, (_, t, u) => mk(u, t))
  out = out.replace(/(?<![\w"=])(https?:\/\/[^\s，。；）)]+)/g, (u) => mk(u))
  out = out.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  out = out.replace(/\\\*/g, '*').replace(/\\_/g, '_')
  out = out.replace(/\u0001(\d+)\u0001/g, (_, n) => stash[Number(n)])
  return out
}

interface Entry {
  no: string
  title: string
  tags: Record<string, string>
  fields: Record<string, string>
  order: string[]
}

function parseEntryTokens(tokens: any[], titleText: string): Entry | null {
  const m = titleText.match(/^(\d+)\.\s+(.*)$/)
  if (!m) return null
  const entry: Entry = { no: m[1], title: m[2], tags: {}, fields: {}, order: [] }
  let curField: string | null = null
  for (const t of tokens) {
    if (t.type === 'html_block') {
      const cm = COST_TAG_RE.exec(t.content)
      if (cm) {
        for (const pair of cm[1].split(/\s+/)) {
          const kv = pair.split('=')
          if (kv.length === 2) entry.tags[kv[0]] = kv[1]
        }
      }
      continue
    }
    if (t.type === 'inline') {
      const content = t.content
      const fm = FIELD_PREFIX.exec(content)
      if (fm) {
        const name = fm[2]
        curField = name
        if (!entry.fields[name]) entry.order.push(name)
        entry.fields[name] = (entry.fields[name] || '') + fm[3].trim()
      } else if (curField) {
        entry.fields[curField] += (entry.fields[curField] ? ' ' : '') + content.trim()
      }
    }
  }
  return entry
}

function renderEntry(e: Entry, idPrefix: string): string {
  const grade = (e.fields['证据等级'] || '?').trim().slice(0, 1)
  const ratio = ratioOf(e.tags)

  let chips = ''
  const gcls: Record<string, string> = { A: 'gA', B: 'gB', C: 'gC' }
  chips += `<span class="hltb-badge ${gcls[grade] || 'gC'}">${esc(grade)} 级</span>`
  if (ratio) chips += `<span class="hltb-badge r${RATIO_ORDER[ratio]}">性价比 ${esc(ratio)}</span>`
  for (const k of ['口径', '钱', '时间', '毅力', '收益']) {
    if (e.tags[k]) chips += `<span class="hltb-tag">${esc(k)} ${esc(e.tags[k])}</span>`
  }

  let fields = ''
  for (const k of ['成本', '收益', '备注']) {
    if (e.fields[k]) {
      const note = k === '备注' ? ' note' : ''
      fields += `<div class="hltb-f${note}"><b>${esc(k)}</b><div>${inlineHtml(e.fields[k])}</div></div>`
    }
  }

  let src = ''
  if (e.fields['来源']) {
    const n = (e.fields['来源'].match(/https?:\/\//g) || []).length
    src = `<details class="hltb-src"><summary>来源${n ? `（${n} 条文献）` : ''}</summary><div class="hltb-sbody">${inlineHtml(e.fields['来源'])}</div></details>`
  }

  const plain = e.fields['说人话'] ? `<p class="hltb-plain">${inlineHtml(e.fields['说人话'])}</p>` : ''

  const anchorId = `${idPrefix}-${e.no}`
  // vitepress 风格的 header-anchor：满足 local search 的 headingRegex 快速匹配，
  // 并让每个条目可被锚点直达。
  const anchor = `<a class="header-anchor" href="#${anchorId}" aria-hidden="true">#</a>`
  const headHtml = inlineHtml(e.title)

  return (
    `<article class="hltb-card" id="${anchorId}" data-grade="${esc(grade)}" data-ratio="${esc(ratio || '-')}">` +
    `<div class="hltb-head"><span class="hltb-num">${esc(e.no)}</span><h3 id="${anchorId}" tabindex="-1">${headHtml} ${anchor}</h3></div>` +
    `<div class="hltb-chips">${chips}</div>` +
    plain +
    `<div class="hltb-fields">${fields}</div>${src}` +
    `</article>`
  )
}

export function entryCardPlugin(md: MarkdownIt) {
  md.core.ruler.after('block', 'entry-card', (state) => {
    const tokens = state.tokens
    const out: any[] = []
    let i = 0
    while (i < tokens.length) {
      const t = tokens[i]
      if (t.type === 'heading_open' && t.tag === 'h3') {
        const inlineTok = tokens[i + 1]
        const text: string = inlineTok?.content || ''
        if (/^\d+\.\s/.test(text)) {
          // 收集到下一个 h3 / h2 / h1 之前
          const block: any[] = []
          let j = i + 3 // 跳过 h3_open, inline, h3_close
          while (j < tokens.length) {
            const tj = tokens[j]
            if (tj.type === 'heading_open' && (tj.tag === 'h3' || tj.tag === 'h2' || tj.tag === 'h1')) break
            block.push(tj)
            j++
          }
          const entry = parseEntryTokens(block, text)
          if (entry) {
            out.push({ type: 'html_block', content: renderEntry(entry, 's'), block: true, map: t.map, level: t.level })
            i = j
            continue
          }
        }
      }
      out.push(t)
      i++
    }
    state.tokens = out
  })
}
