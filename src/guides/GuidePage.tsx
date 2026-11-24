import { Archive, ArrowLeft, BookOpen, FileText, Handshake, Lightbulb, Map as MapIcon, Palette, Search, Server, Telescope, X } from 'lucide-react'
import { marked } from 'marked'
import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState, type MouseEvent } from 'react'
import { Link, Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import markSvg from '../assets/logo-homepage.svg'
import networkArt from '../assets/aurelia-network.png'
import { AureliaLogo } from '../components/ui/AureliaLogo'
import { BUILD } from '../lib/build'
import adminGuideline from './content/admin-guideline.html?raw'
import adminGuidelineV2 from './content/admin-guideline-v2.html?raw'
import adminGuidelineV3 from './content/admin-guideline-v3.html?raw'
import pmPlaybook from './content/pm-playbook.html?raw'
import pmPlaybookV2 from './content/pm-playbook-v2.html?raw'
import pmPlaybookV3 from './content/pm-playbook-v3.html?raw'
import researchInsightTimer from './content/research-insight-timer.html?raw'
import researchRound2 from '../../docs/research/reports/Insight Timer behaviour and journeys.md?raw'
import prdOverview from '../../docs/PRD-OVERVIEW.md?raw'
import apiContract from '../../docs/api/API-CONTRACT.md?raw'
import backendOld from '../../docs/backend-old/BACKEND-OLD.md?raw'
import artefact from '../../docs/backend-old/ARTEFACT.md?raw'
import { DS_TOC } from '../designsystem/toc'
import { B2B2C_PAGES, pageMarkdown, type DocPage } from './docPages'
import { filterToc, prepareDoc } from './prepareDoc'
import './guides.css'
import './content/pm-playbook.css'
import './content/pm-playbook-versions.css'
import './content/admin-guideline-versions.css'
import './content/research.css'

// The design system renders live components, so it loads only when opened.
const DesignSystemContent = lazy(() =>
  import('../designsystem/DesignSystemPage').then((m) => ({ default: m.DesignSystemContent })),
)

/**
 * /wiki (was /guide until U083; old links redirect) — the team's documents,
 * readable on any site (production included) behind the same site password as
 * the app. One shell, nine documents: generated HTML guides, Markdown files
 * rendered as they stand in docs/, and the design system, which is a React
 * view read live from the Figma export and the components, so no page can
 * drift from its source.
 */
const DOCS = [
  {
    id: 'playbook',
    title: 'Feedback group playbook',
    blurb: 'How we will find out, over eight weeks, whether Aurelia helps 30 people solve a real wellness problem, such as going from bad sleep to good sleep.',
    audience: 'The project manager running the study, and the team behind them',
    inside: ['The six milestones, and how to know each one is passed', 'What the project manager does every day and every week', 'How the product team tests and improves Aurelia during the study', 'Where each step shows in the admin, and the full study protocol', 'Three versions: original, mission guide, one-page quick start'],
    icon: MapIcon,
    source: 'scripts/guides/pm_playbook.py',
    html: () => pmPlaybook,
  },
  {
    id: 'admin',
    title: 'Admin guideline',
    blurb: 'A tour of every screen in the Aurelia admin: what it is for, what you can see and change there, and who is allowed to.',
    audience: 'Anyone who runs Aurelia day to day',
    inside: ['All 21 modules, each with a screenshot', 'Roles and permissions', 'How staging and production differ', 'What the real backend will replace', 'Three versions: original, task guide, one-page quick start'],
    icon: BookOpen,
    source: 'scripts/guides/admin_guideline.py',
    html: () => adminGuideline,
  },
  {
    id: 'prd',
    title: 'Product requirements',
    blurb: 'Aurelia on one page: what it is, who it is for, what works today and what is still sample data.',
    audience: 'Anyone new to the product, partners and investors',
    inside: ['The problem and the people it is for', 'Every feature, and whether it is built yet', 'How success is measured, and the roadmap', 'Risks and the decisions still open'],
    icon: FileText,
    source: 'docs/PRD-OVERVIEW.md',
    html: () => marked.parse(prdOverview, { async: false }),
  },
  {
    id: 'api',
    title: 'API contract',
    blurb: 'The plan for the backend that will replace today\'s sample data, including how the AI features work and are kept safe.',
    audience: 'Engineers',
    inside: ['Every endpoint the apps need', 'The data model', 'The AI system: routes, models, safety and cost', 'The order to build it in'],
    icon: Server,
    source: 'docs/api/API-CONTRACT.md',
    html: () => marked.parse(apiContract, { async: false }),
  },
  {
    id: 'research',
    title: 'Research',
    blurb: 'What we learn from other products. First: Insight Timer, the biggest free meditation app, and what it means for Aurelia.',
    audience: 'The product owner, the project manager and anyone shaping what Aurelia builds next',
    inside: ['How people really use Insight Timer, from Reddit and reviews', 'Its whole journey as 11 flow charts', 'What Aurelia should adopt now, next and later, after a roast', 'Round 1: features, business, backlash and competitors'],
    icon: Telescope,
    source: 'scripts/guides/research_insight_timer.py',
    html: () => researchInsightTimer,
  },
  {
    id: 'b2b2c',
    title: 'B2B2C',
    blurb: 'Selling Aurelia through people who already have the customer: creators, employers, insurers and partners. Ideas, evidence and a plan.',
    audience: 'The business owner, the product owner and anyone deciding how Aurelia goes to market',
    inside: ['Every B2B2C model for Aurelia, scored', 'Creators and cohorts, employers, insurers and partners, with sources', 'Unit economics of the €19.99 retreat, and what may be claimed', 'The plan, its gates, and a roast'],
    icon: Handshake,
    source: 'docs/research/b2b2c/',
    html: () => marked.parse(pageMarkdown(B2B2C_PAGES[0]), { async: false }),
  },
  {
    id: 'backend-old',
    title: 'Backend (old)',
    blurb: 'The 2025 backend, from its three documents: how it worked, and the prompts, data shapes and rubric we can reuse.',
    audience: 'Engineers and whoever builds the new backend',
    inside: ['The three sources, and what they are good for', 'How the 2025 system worked, and its 16-entity taxonomy', 'Data shapes as Zod, and the prompts worth reusing', 'Where each piece goes today, and what not to reuse'],
    icon: Archive,
    source: 'docs/backend-old/BACKEND-OLD.md',
    html: () => marked.parse(backendOld, { async: false }),
  },
  {
    id: 'artefact',
    title: 'Artefact',
    blurb: 'What the 2025 backend teaches us: eleven lessons from reading its three documents side by side.',
    audience: 'The product owner, engineers and anyone describing Aurelia to others',
    inside: ['Claims that ran ahead of the build', 'The pace table, safety, and scores the model made up', 'Tagging, one vocabulary, prompts as code', 'What we do differently, and a checklist for the new backend'],
    icon: Lightbulb,
    source: 'docs/backend-old/ARTEFACT.md',
    html: () => marked.parse(artefact, { async: false }),
  },
  {
    id: 'design-system',
    title: 'Design system',
    blurb: 'The pieces every Aurelia screen is made of, read live from the Figma variables and the app\'s own components.',
    audience: 'Designers and engineers, and anyone checking a screen against the design',
    inside: ['Colour, type, spacing, radius and effects, from Figma', 'Brand artwork and icons', 'Every component in src/components, in 10 patterns, with props and states', 'The colours that still have no variable'],
    icon: Palette,
    source: 'design-tokens/figma-export.json + src/components',
    html: () => '',
  },
] as const

type DocId = (typeof DOCS)[number]['id']

/** Documents made of a summary and detail pages at /wiki/:doc/:page (U110). */
const DOC_PAGES: Partial<Record<DocId, DocPage[]>> = { b2b2c: B2B2C_PAGES }

function DocPages({ id, pages, current }: { id: DocId; pages: DocPage[]; current: string }) {
  // On a phone the strip scrolls sideways: bring the open page into view.
  const nav = useRef<HTMLElement>(null)
  useEffect(() => {
    const el = nav.current
    const card = el?.querySelector<HTMLElement>('[aria-current="page"]')
    if (el && card && el.scrollWidth > el.clientWidth) el.scrollLeft = card.offsetLeft - el.offsetLeft - 10
  }, [current])
  return (
    <nav ref={nav} className="gd-versions gd-pages" aria-label="Pages in this research">
      <span className="gd-versions-label">Pages in this research</span>
      {pages.map((p, i) => (
        <Link key={p.slug} to={i === 0 ? `/wiki/${id}` : `/wiki/${id}/${p.slug}`} aria-current={p.slug === current ? 'page' : undefined}>
          <b>{p.title}</b>
          <span>{p.note}</span>
        </Link>
      ))}
    </nav>
  )
}

/**
 * Documents that come in more than one version. The same goal told different
 * ways, so readers can compare them; `?v=N` picks one, the first is the
 * default. v2/v3 are generated by scripts/guides/pm_playbook_versions.py and
 * scripts/guides/admin_guideline_versions.py.
 */
interface DocVersion {
  v: number
  label: string
  note: string
  html: () => string
  /** Rendered from Markdown: styled as a Markdown document, not a generated guide. */
  markdown?: boolean
}
const DOC_VERSIONS: Partial<Record<DocId, DocVersion[]>> = {
  playbook: [
    { v: 1, label: 'Original', note: 'The full playbook with the study protocol.', html: () => pmPlaybook },
    { v: 2, label: 'Mission guide', note: 'Same content in plain, upbeat words, written as a mission.', html: () => pmPlaybookV2 },
    { v: 3, label: 'Quick start', note: 'Everything that matters, on one page.', html: () => pmPlaybookV3 },
  ],
  admin: [
    { v: 1, label: 'Original', note: 'Every module in full, with screenshots.', html: () => adminGuideline },
    { v: 2, label: 'Task guide', note: 'Organised by what you want to do, in plain words.', html: () => adminGuidelineV2 },
    { v: 3, label: 'Quick start', note: 'The morning check, the map and the rules, on one page.', html: () => adminGuidelineV3 },
  ],
  // Round 2 first, so it is the default (U098).
  research: [
    {
      v: 2,
      label: 'Behaviour & journeys',
      note: 'Round 2: how people really use it, 11 flow charts, what to adopt, the roast.',
      html: () => marked.parse(researchRound2, { async: false }),
      markdown: true,
    },
    { v: 1, label: 'Features & business', note: 'Round 1: features, strategy, backlash, competitors.', html: () => researchInsightTimer },
  ],
}

function DocVersions({ id, current }: { id: DocId; current: number }) {
  const versions = DOC_VERSIONS[id]
  if (!versions) return null
  return (
    <nav className="gd-versions" aria-label="Document versions">
      <span className="gd-versions-label">Version</span>
      {versions.map((x) => (
        <Link key={x.v} to={`/wiki/${id}?v=${x.v}`} aria-current={x.v === current ? 'page' : undefined}>
          <b>
            v{x.v} · {x.label}
          </b>
          <span>{x.note}</span>
        </Link>
      ))}
    </nav>
  )
}

function DocTabs({ current }: { current?: DocId }) {
  // Nine tabs overflow a phone's width: bring the open one into view.
  const nav = useRef<HTMLElement>(null)
  useEffect(() => {
    const el = nav.current
    const tab = el?.querySelector<HTMLElement>('[aria-current="page"]')
    if (!el || !tab) return
    const t = tab.getBoundingClientRect()
    const n = el.getBoundingClientRect()
    el.scrollLeft += t.left - n.left - (n.width - t.width) / 2
  }, [current])
  return (
    <nav ref={nav} className="gd-tabs" aria-label="Documents">
      {DOCS.map((d) => (
        <Link key={d.id} to={`/wiki/${d.id}`} aria-current={d.id === current ? 'page' : undefined}>
          {d.title}
        </Link>
      ))}
    </nav>
  )
}

function TopBar({ current }: { current?: DocId }) {
  return (
    <header className="gd-top">
      <Link to="/wiki" className="gd-brand" aria-label="Aurelia wiki">
        <AureliaLogo iconSize={26} />
        <span className="gd-brand-label">Wiki</span>
      </Link>
      <DocTabs current={current} />
      <Link to="/admin" className="gd-back">
        <ArrowLeft size={14} aria-hidden="true" /> Admin
      </Link>
    </header>
  )
}

export function GuideIndexPage() {
  return (
    <div className="gd">
      <TopBar />
      <main className="gd-index">
        <section className="gd-hero">
          <div className="gd-glow" aria-hidden="true" />
          <img src={networkArt} alt="" aria-hidden="true" className="gd-net" />
          <img src={markSvg} alt="" aria-hidden="true" width={52} height={52} className="gd-hero-mark" />
          <p className="gd-eyebrow">Aurelia · wiki</p>
          <h1>
            Everything about Aurelia, <span className="gd-grad">in nine documents</span>
          </h1>
          <p className="gd-lede">
            Aurelia builds personal wellness sessions from one sentence: someone says how they feel, and Aurelia makes a
            session for it. These documents explain the product, the admin the team runs it from, the backend still to
            be built, the eight-week study that will show whether Aurelia really helps people, what we learn
            from other products, how Aurelia could sell through partners, what the 2025 backend left us, and the design system every screen is built from.
          </p>
          <p className="gd-note">
            The app runs on realistic sample data until the backend exists, so no figure in it is a real result yet.
          </p>
        </section>
        <div className="gd-cards">
          {DOCS.map((d) => (
            <Link key={d.id} to={`/wiki/${d.id}`} className="gd-card">
              <span className="gd-card-icon" aria-hidden="true">
                <d.icon size={18} />
              </span>
              <b>{d.title}</b>
              <span className="gd-card-blurb">{d.blurb}</span>
              <ul>
                {d.inside.map((i) => (
                  <li key={i}>{i}</li>
                ))}
              </ul>
              <span className="gd-card-for">
                <b>For</b> {d.audience}
              </span>
              <span className="gd-card-open">Open →</span>
            </Link>
          ))}
        </div>
        <p className="gd-foot">
          {BUILD.label} · {BUILD.version} · {BUILD.commit}
        </p>
      </main>
    </div>
  )
}

export function GuidePage() {
  const { doc: docParam, page: pageParam } = useParams()
  const [params] = useSearchParams()
  const meta = DOCS.find((d) => d.id === docParam)
  if (!meta) return <Navigate to="/wiki" replace />
  const pages = DOC_PAGES[meta.id]
  if (pageParam && !pages?.some((p) => p.slug === pageParam)) return <Navigate to={`/wiki/${meta.id}`} replace />
  if (pages) {
    const page = pages.find((p) => p.slug === pageParam) ?? pages[0]
    const pv: DocVersion = { v: 0, label: page.title, note: page.note, html: () => marked.parse(pageMarkdown(page), { async: false }), markdown: true }
    return <GuideDoc key={`${meta.id}-${page.slug}`} meta={meta} version={pv} pages={{ list: pages, current: page.slug }} />
  }
  const versions = DOC_VERSIONS[meta.id]
  const version = versions?.find((x) => String(x.v) === params.get('v')) ?? versions?.[0]
  return <GuideDoc key={`${meta.id}-${version?.v ?? 0}`} meta={meta} version={version} />
}

function GuideDoc({ meta, version, pages }: { meta: (typeof DOCS)[number]; version?: DocVersion; pages?: { list: DocPage[]; current: string } }) {
  const navigate = useNavigate()
  const isDs = meta.id === 'design-system'
  const prepared = useMemo(() => (isDs ? { html: '', toc: DS_TOC } : prepareDoc((version ?? meta).html())), [isDs, meta, version])
  // The design system mounts after its chunk loads; the scroll and contents
  // effects below wait for it.
  const [dsReady, setDsReady] = useState(false)
  const onDsReady = useCallback(() => setDsReady(true), [])
  const [query, setQuery] = useState('')
  // Below lg the contents list folds away above the document.
  const [tocOpen, setTocOpen] = useState(false)
  const [active, setActive] = useState<string | null>(null)
  const [shot, setShot] = useState<{ src: string; caption: string } | null>(null)
  const content = useRef<HTMLDivElement>(null)
  const viewer = useRef<HTMLDialogElement>(null)
  const toc = useMemo(() => filterToc(prepared.toc, query), [prepared, query])

  useEffect(() => {
    document.title = `${pages && pages.current !== pages.list[0].slug ? `${version?.label} · ` : ''}${meta.title} · Aurelia`
  }, [meta, pages, version])

  // Open on the section in the address, as a shared link expects.
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1))
    if (id) document.getElementById(id)?.scrollIntoView()
    else window.scrollTo(0, 0)
  }, [prepared, dsReady])

  // The admin guideline's module cards hide when a search does not match
  // them; the Markdown documents keep their text and filter the contents only.
  useEffect(() => {
    const root = content.current
    if (!root) return
    const q = query.trim().toLowerCase()
    root.querySelectorAll<HTMLElement>('section.mod').forEach((s) => {
      s.hidden = q !== '' && !(s.textContent ?? '').toLowerCase().includes(q)
    })
  }, [query, prepared])

  // Flow charts written as ```mermaid blocks become diagrams (U098). The
  // library is large, so it loads only for a document that has one.
  useEffect(() => {
    const root = content.current
    const blocks = root ? [...root.querySelectorAll<HTMLElement>('pre > code.language-mermaid')] : []
    if (!blocks.length) return
    let cancelled = false
    void import('mermaid').then(async ({ default: mermaid }) => {
      mermaid.initialize({
        startOnLoad: false,
        securityLevel: 'strict',
        theme: 'base',
        fontFamily: 'Mulish, system-ui, sans-serif',
        themeVariables: { primaryColor: '#fff7ec', primaryBorderColor: '#e0a35a', primaryTextColor: '#3c2405', lineColor: '#b4530a', fontSize: '14px' },
        flowchart: { htmlLabels: false, curve: 'basis' },
      })
      for (const [i, code] of blocks.entries()) {
        if (cancelled) return
        const pre = code.parentElement
        if (!pre) continue
        try {
          const { svg } = await mermaid.render(`gd-mermaid-${i}`, code.textContent ?? '')
          const figure = document.createElement('div')
          figure.className = 'gd-mermaid'
          figure.innerHTML = svg
          pre.replaceWith(figure)
        } catch {
          pre.classList.add('gd-mermaid-error')
        }
      }
    })
    return () => {
      cancelled = true
    }
  }, [prepared])

  useEffect(() => {
    const root = content.current
    if (!root || !('IntersectionObserver' in window)) return
    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries.find((e) => e.isIntersecting)
        if (hit) setActive(hit.target.id)
      },
      { rootMargin: '-15% 0px -75% 0px' },
    )
    prepared.toc.forEach((e) => {
      const el = document.getElementById(e.id)
      if (el) io.observe(el)
    })
    return () => io.disconnect()
  }, [prepared, dsReady])

  useEffect(() => {
    const d = viewer.current
    if (!d) return
    if (shot && !d.open) d.showModal()
    if (!shot && d.open) d.close()
  }, [shot])

  function jump(id: string) {
    const el = document.getElementById(id)
    if (!el) return
    el.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
    window.history.replaceState(window.history.state, '', `#${id}`)
  }

  function onContentClick(e: MouseEvent<HTMLDivElement>) {
    const target = e.target as HTMLElement
    const button = target.closest<HTMLElement>('.shot')
    if (button) {
      setShot({ src: button.dataset.full ?? '', caption: button.dataset.cap ?? '' })
      return
    }
    const a = target.closest('a')
    const href = a?.getAttribute('href')
    if (!a || !href) return
    if (href.startsWith('#')) {
      e.preventDefault()
      jump(href.slice(1))
    } else if (href.startsWith('/')) {
      e.preventDefault()
      navigate(href)
    }
  }

  return (
    <div className="gd">
      <TopBar current={meta.id} />
      <div className="gd-layout">
        <aside className={`gd-side${tocOpen ? ' open' : ''}`} aria-label="Contents">
          <button type="button" className="gd-toggle" aria-expanded={tocOpen} onClick={() => setTocOpen((o) => !o)}>
            Contents and search
          </button>
          <label className="gd-search">
            <Search size={14} aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setTocOpen(true)
              }}
              placeholder={meta.id === 'admin' ? 'Search modules, e.g. coins' : 'Search this document'}
              aria-label="Search this document"
            />
          </label>
          <ol className="gd-toc">
            {toc.map((e) => (
              <li key={e.id} className={e.level === 3 ? 'sub' : undefined}>
                <a
                  href={`#${e.id}`}
                  aria-current={active === e.id ? 'location' : undefined}
                  onClick={(ev) => {
                    ev.preventDefault()
                    setTocOpen(false)
                    jump(e.id)
                  }}
                >
                  {e.text}
                </a>
              </li>
            ))}
            {toc.length === 0 && <li className="gd-empty">Nothing matches “{query}”.</li>}
          </ol>
          <p className="gd-source">
            Source: <code>{meta.source}</code>
            <br />
            {BUILD.label} · {BUILD.commit}
          </p>
        </aside>
        <main className="gd-main">
          {pages ? <DocPages id={meta.id} pages={pages.list} current={pages.current} /> : version && <DocVersions id={meta.id} current={version.v} />}
          {isDs ? (
            // Not under .gd-doc: the documents' typography must not restyle live components.
            <div ref={content}>
              <Suspense fallback={<p className="gd-empty">Loading the design system…</p>}>
                <DesignSystemContent onReady={onDsReady} />
              </Suspense>
            </div>
          ) : (
            <div
              ref={content}
              className={`gd-doc ${!version?.markdown && (meta.id === 'admin' || meta.id === 'playbook' || meta.id === 'research') ? 'is-guideline' : 'is-markdown'}`}
              onClick={onContentClick}
              // Our own documents from the repository, not user input.
              dangerouslySetInnerHTML={{ __html: prepared.html }}
            />
          )}
        </main>
      </div>
      <dialog ref={viewer} className="gd-viewer" onClose={() => setShot(null)} aria-label={shot?.caption ?? 'Screenshot'}>
        <div className="gd-viewer-head">
          <span>{shot?.caption}</span>
          <button type="button" onClick={() => setShot(null)} aria-label="Close">
            <X size={16} aria-hidden="true" />
          </button>
        </div>
        {shot && <img src={shot.src} alt={shot.caption} />}
      </dialog>
    </div>
  )
}
