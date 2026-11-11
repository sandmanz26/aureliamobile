// Builds one self-contained, Aurelia-branded HTML file per document, to send
// by WhatsApp or email (opens from disk, no login, no network needed except
// the web font). Run after the generators:
//
//   python3 scripts/guides/admin_guideline.py && python3 scripts/guides/pm_playbook.py
//   node scripts/guides/share.mjs
//
// Writes docs/share/Aurelia-<Document>.html. The playbook's share file is
// written by pm_playbook.py itself; this adds the other three.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { marked } from 'marked'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const read = (p) => readFileSync(join(ROOT, p), 'utf8')
const OUT = join(ROOT, 'docs/share')
mkdirSync(OUT, { recursive: true })

let svgN = 0
/** The app's own artwork, with gradient ids made unique per copy. */
function svg(name, height) {
  const n = ++svgN
  const raw = read(`src/assets/${name}`).trim().replace(/(paint\d+_linear_\d+_\d+)/g, `$1_s${n}`)
  const [head, ...rest] = raw.split('>')
  return head.replace(/\s(width|height)="[^"]*"/g, '').replace('<svg', `<svg role="img" aria-label="Aurelia" height="${height}" style="width:auto;display:block"`) + '>' + rest.join('>')
}
const network = 'data:image/png;base64,' + readFileSync(join(ROOT, 'src/assets/aurelia-network.png')).toString('base64')

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
function slug(text, used) {
  const base = text.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'section'
  const stem = /^\d/.test(base) ? `s-${base}` : base
  let id = stem
  let k = 2
  while (used.has(id)) id = `${stem}-${k++}`
  used.add(id)
  return id
}

const CSS = `
:root {
  --bg: #FFFDF9; --surface: #FFFFFF; --ink: #2A1704; --ink2: #5A4A3C; --muted: #8A7A6B; --line: #EADFD2;
  --chrome: #FBF5EC; --hover: #F6ECDF; --active: #FFF0DC; --accent: #C25E0A; --accent-soft: #FFF1DB;
  --code-bg: #2A1704; --code-ink: #F6EDE3; --glow: 0.5;
}
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) {
  --bg: #17110B; --surface: #211910; --ink: #F6EDE3; --ink2: #CDBCA9; --muted: #A8957F; --line: #3A2E22;
  --chrome: #1C150E; --hover: #2A2017; --active: #3A2712; --accent: #FF9A3D; --accent-soft: #3A2712;
  --code-bg: #0E0904; --code-ink: #F6EDE3; --glow: 0.18; color-scheme: dark; } }
:root[data-theme="dark"] {
  --bg: #17110B; --surface: #211910; --ink: #F6EDE3; --ink2: #CDBCA9; --muted: #A8957F; --line: #3A2E22;
  --chrome: #1C150E; --hover: #2A2017; --active: #3A2712; --accent: #FF9A3D; --accent-soft: #3A2712;
  --code-bg: #0E0904; --code-ink: #F6EDE3; --glow: 0.18; color-scheme: dark; }
* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
@media (prefers-reduced-motion: reduce) { html { scroll-behavior: auto; } }
body { margin: 0; background: var(--bg); color: var(--ink); font: 15.5px/1.6 'Mulish', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif; }
a { color: inherit; }
.top { position: sticky; top: 0; z-index: 5; display: flex; align-items: center; gap: 12px; height: 56px; padding: 0 max(16px, env(safe-area-inset-right, 0px)) 0 max(16px, env(safe-area-inset-left, 0px)); background: color-mix(in srgb, var(--bg) 92%, transparent); backdrop-filter: blur(10px); }
.top::after { content: ""; position: absolute; left: 0; right: 0; bottom: 0; height: 3px; background: linear-gradient(90deg, #FF8514, #FFB347 55%, #FFE270); }
.top .label { font-size: 12px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--muted); padding-left: 12px; border-left: 1px solid var(--line); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.layout { display: grid; grid-template-columns: 272px minmax(0, 1fr); }
nav.toc { position: sticky; top: 56px; align-self: start; height: calc(100vh - 56px); overflow-y: auto; background: var(--chrome); border-right: 1px solid var(--line); padding: 16px 12px 32px; }
nav.toc ol { list-style: none; margin: 0; padding: 0; }
nav.toc a { display: block; text-decoration: none; font-size: 13px; line-height: 1.35; padding: 6px 8px; border-radius: 7px; font-weight: 700; }
nav.toc li.sub a { font-weight: 400; padding-left: 18px; color: var(--ink2); }
nav.toc a:hover { background: var(--hover); }
main { position: relative; overflow: hidden; min-width: 0; padding: 32px max(28px, env(safe-area-inset-right, 0px)) 80px max(28px, env(safe-area-inset-left, 0px)); }
main::before { content: ""; position: absolute; top: -120px; right: -60px; width: 320px; height: 320px; border-radius: 50%; background: #FFE682; opacity: var(--glow); filter: blur(90px); pointer-events: none; }
.doc { position: relative; max-width: 960px; margin: 0 auto; }
.cover { position: relative; padding-bottom: 8px; }
.cover .net { position: absolute; top: 0; right: 0; width: 220px; height: auto; pointer-events: none; }
.cover .mark { margin-bottom: 18px; }
.eyebrow { margin: 0; font-size: 12px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: var(--accent); }
h1 { font-size: clamp(28px, 4.4vw, 42px); line-height: 1.15; margin: 8px 0 12px; font-weight: 800; text-wrap: balance; letter-spacing: -0.01em; max-width: 20ch; }
h2 { font-size: 23px; line-height: 1.25; margin: 48px 0 8px; padding-top: 18px; font-weight: 800; text-wrap: balance; border-top: 3px solid transparent; border-image: linear-gradient(90deg, #FF8514, #FFE270 60%, transparent) 1; }
h3 { font-size: 18px; margin: 28px 0 6px; font-weight: 800; }
h1, h2, h3 { scroll-margin-top: 72px; }
p, li { max-width: 72ch; }
ul, ol { padding-left: 22px; }
li { margin: 4px 0; }
hr { display: none; }
blockquote { margin: 16px 0; padding: 12px 16px; border-radius: 12px; background: var(--accent-soft); }
blockquote p { margin: 4px 0; }
code { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 0.86em; background: var(--accent-soft); padding: 1px 5px; border-radius: 4px; overflow-wrap: anywhere; }
pre { overflow-x: auto; background: var(--code-bg); color: var(--code-ink); padding: 14px 16px; border-radius: 12px; font-size: 13px; line-height: 1.5; }
pre code { background: none; padding: 0; color: inherit; overflow-wrap: normal; }
.table-wrap { overflow-x: auto; margin: 14px 0; background: var(--surface); border: 1px solid var(--line); border-radius: 12px; }
table { border-collapse: collapse; width: 100%; font-size: 13.5px; font-variant-numeric: tabular-nums; }
th, td { padding: 9px 12px; border-bottom: 1px solid var(--line); text-align: left; vertical-align: top; }
tr:last-child th, tr:last-child td { border-bottom: 0; }
thead th { font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em; color: var(--muted); white-space: nowrap; }
.close { display: flex; align-items: center; gap: 12px; margin-top: 48px; padding-top: 20px; border-top: 1px solid var(--line); font-size: 14px; color: var(--muted); }
.close b { color: var(--ink); }
:focus-visible { outline: 2px solid #E8770F; outline-offset: 2px; }
@media (max-width: 960px) {
  .layout { grid-template-columns: 1fr; }
  nav.toc { position: static; height: auto; max-height: none; border-right: 0; border-bottom: 1px solid var(--line); }
  nav.toc details summary { cursor: pointer; font-weight: 700; padding: 4px 0; }
  main { padding: 20px max(16px, env(safe-area-inset-right, 0px)) 60px max(16px, env(safe-area-inset-left, 0px)); }
  .cover .net { position: static; display: block; width: 170px; margin: 0 0 8px auto; }
}
@media print { .top, nav.toc { display: none; } .layout { display: block; } main::before { display: none; } }
`

function page({ title, label, eyebrow, html }) {
  const used = new Set()
  const toc = []
  // Ids on h2/h3, the contents list from them, tables in a scrolling wrapper,
  // repository paths as plain text (they have no page outside the repo).
  html = html
    .replace(/<(h[23])>([\s\S]*?)<\/\1>/g, (_, tag, inner) => {
      const text = inner.replace(/<[^>]+>/g, '').trim()
      const id = slug(text, used)
      toc.push({ id, text, sub: tag === 'h3' })
      return `<${tag} id="${id}">${inner}</${tag}>`
    })
    .replace(/<table>/g, '<div class="table-wrap"><table>')
    .replace(/<\/table>/g, '</table></div>')
    .replace(/<a href="(?!https?:|#)[^"]*">([\s\S]*?)<\/a>/g, '<b>$1</b>')
  // The document's own h1 becomes the cover headline.
  let h1 = title
  html = html.replace(/<h1>([\s\S]*?)<\/h1>/, (_, inner) => {
    h1 = inner
    return ''
  })
  const list = toc.map((e) => `<li${e.sub ? ' class="sub"' : ''}><a href="#${e.id}">${esc(e.text)}</a></li>`).join('')
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Mulish:ital,wght@0,400;0,600;0,700;0,800;1,400&display=swap">
<style>${CSS}</style>
</head>
<body>
<header class="top">${svg('aurelia-sidebar-logo.svg', 26)}<span class="label">${esc(label)}</span></header>
<div class="layout">
  <nav class="toc" aria-label="Contents"><ol>${list}</ol></nav>
  <main>
    <div class="doc">
      <header class="cover">
        <img class="net" src="${network}" alt="" aria-hidden="true">
        <div class="mark">${svg('logo-homepage.svg', 48)}</div>
        <p class="eyebrow">${esc(eyebrow)}</p>
        <h1>${h1}</h1>
      </header>
      ${html}
      <div class="close">${svg('logo-homepage.svg', 32)}<p><b>Aurelia</b> · sessions made for how you feel today</p></div>
    </div>
  </main>
</div>
</body>
</html>
`
}

const docs = [
  { file: 'Aurelia-Product-Requirements.html', title: 'Aurelia Product Requirements', label: 'Product requirements', eyebrow: 'Aurelia · product requirements · overview', md: 'docs/PRD-OVERVIEW.md' },
  { file: 'Aurelia-API-Contract.html', title: 'Aurelia API Contract', label: 'API contract', eyebrow: 'Aurelia · API contract plan', md: 'docs/api/API-CONTRACT.md' },
]
for (const d of docs) {
  writeFileSync(join(OUT, d.file), page({ ...d, html: marked.parse(read(d.md), { async: false }) }))
  console.log('wrote', d.file)
}

// The admin guideline already has its own branded page; embed its screenshots
// and give it a full document so it opens from disk.
// Each screenshot is embedded once: the viewer reads the thumbnail's own src
// instead of a second copy in data-full.
let guide = read('docs/guidelines/admin-guideline.html')
  .replace(/ data-full="admin-guideline\/[^"]+\.jpg"/g, '')
  .replace("vimg.src = b.getAttribute('data-full');", "vimg.src = b.querySelector('img').src;")
  .replace(/ loading="lazy"/g, '')
  .replace(/src="admin-guideline\/([^"]+\.jpg)"/g, (_, f) =>
    `src="data:image/jpeg;base64,${readFileSync(join(ROOT, 'docs/guidelines/admin-guideline', f)).toString('base64')}"`,
  )
guide = `<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n${guide.replace('\n<div class="layout">', '\n</head>\n<body>\n<div class="layout">')}\n</body>\n</html>\n`
writeFileSync(join(OUT, 'Aurelia-Admin-Guideline.html'), guide)
console.log('wrote Aurelia-Admin-Guideline.html')
