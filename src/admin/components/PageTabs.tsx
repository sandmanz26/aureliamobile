import { ArrowRight } from 'lucide-react'
import { useEffect, useId, useRef } from 'react'
import type { KeyboardEvent, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { RELEASES } from '../../versions/releases'
import { usePageTab, type PageTab } from './pageTab'

/*
 * Summary | Detail (U142, J203): every lab and report page opens on a short
 * Summary (what the page is for, the question, the answer, up to three
 * figures, the next steps) and keeps everything it had before under Detail.
 * The tab lives in the URL (`?tab=detail`), so a link or Back lands on the
 * same tab. Detail stays mounted while hidden, so its state survives a switch
 * and an in-page `#anchor` into it still resolves (and opens the tab).
 * Behind RELEASES.adminNav2: with it off, only the Detail content renders,
 * which is the page exactly as it was.
 */

const TABS: { id: PageTab; label: string }[] = [
  { id: 'summary', label: 'Summary' },
  { id: 'detail', label: 'Detail' },
]

export function PageTabs({ summary, children }: { summary: ReactNode; children: ReactNode }) {
  const [tab, setTab] = usePageTab()
  const id = useId()
  const detailRef = useRef<HTMLDivElement>(null)
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])

  // An #anchor that points into Detail (a "What to do next" link, a shared
  // URL) opens Detail and scrolls there once it is visible.
  useEffect(() => {
    if (!RELEASES.adminNav2) return
    function follow() {
      const hash = decodeURIComponent(window.location.hash.slice(1))
      if (!hash) return
      const el = document.getElementById(hash)
      if (!el || !detailRef.current?.contains(el)) return
      if (detailRef.current.hidden) setTab('detail')
      const det = el.closest('details') ?? (el instanceof HTMLDetailsElement ? el : null)
      if (det) det.open = true
      requestAnimationFrame(() => requestAnimationFrame(() => el.scrollIntoView({ block: 'start' })))
    }
    follow()
    window.addEventListener('hashchange', follow)
    return () => window.removeEventListener('hashchange', follow)
  }, [setTab])

  if (!RELEASES.adminNav2) return <>{children}</>

  function onKey(e: KeyboardEvent<HTMLDivElement>) {
    const i = TABS.findIndex((t) => t.id === tab)
    let next = -1
    if (e.key === 'ArrowRight') next = (i + 1) % TABS.length
    else if (e.key === 'ArrowLeft') next = (i - 1 + TABS.length) % TABS.length
    else if (e.key === 'Home') next = 0
    else if (e.key === 'End') next = TABS.length - 1
    if (next < 0) return
    e.preventDefault()
    setTab(TABS[next].id)
    tabRefs.current[next]?.focus()
  }

  return (
    <div className="flex min-w-0 flex-col gap-16">
      <div role="tablist" aria-label="Page view" onKeyDown={onKey} className="flex gap-4 border-b border-adm-line">
        {TABS.map((t, i) => {
          const selected = tab === t.id
          return (
            <button
              key={t.id}
              ref={(el) => {
                tabRefs.current[i] = el
              }}
              type="button"
              role="tab"
              id={`${id}-tab-${t.id}`}
              aria-selected={selected}
              aria-controls={`${id}-panel-${t.id}`}
              tabIndex={selected ? 0 : -1}
              data-page-tab={t.id}
              onClick={() => setTab(t.id)}
              className={`-mb-px border-b-2 px-12 py-8 text-14 font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-adm-accent ${
                selected ? 'border-adm-ink text-adm-ink' : 'border-transparent text-adm-muted hover:text-adm-ink'
              }`}
            >
              {t.label}
            </button>
          )
        })}
      </div>
      <div role="tabpanel" id={`${id}-panel-summary`} aria-labelledby={`${id}-tab-summary`} hidden={tab !== 'summary'} className="min-w-0">
        {tab === 'summary' && summary}
      </div>
      <div
        ref={detailRef}
        role="tabpanel"
        id={`${id}-panel-detail`}
        aria-labelledby={`${id}-tab-detail`}
        hidden={tab !== 'detail'}
        className="flex min-w-0 flex-col gap-16"
      >
        {children}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------ PageSummary */

export interface SummaryStat {
  label: string
  value: string
  note?: string
}

export interface SummaryStep {
  text: string
  /** A route (opens it) or omitted (plain text). */
  to?: string
  linkLabel?: string
}

/**
 * The Summary tab of a page that has no report summary of its own: what the
 * page is for, the question it answers, the answer, up to three figures and
 * the next steps. About one screen; anything longer belongs in Detail.
 */
export function PageSummary({
  purpose,
  question,
  answer,
  stats = [],
  next = [],
  note,
  onDetail,
}: {
  purpose: string
  question: string
  answer: ReactNode
  stats?: SummaryStat[]
  next?: SummaryStep[]
  /** One line on how far to trust the figures. */
  note?: string
  onDetail?: () => void
}) {
  return (
    <section aria-label="Summary" className="flex min-w-0 flex-col gap-16 rounded-12 border border-adm-line bg-adm-surface p-16 lg:p-20">
      <PurposeLine purpose={purpose} />
      <div className="flex flex-col gap-6">
        <p className="text-13 text-adm-ink-2">
          <span className="font-semibold text-adm-muted">The question: </span>
          {question}
        </p>
        <p className="max-w-[860px] text-18 font-semibold leading-snug text-adm-ink">{answer}</p>
      </div>
      {stats.length > 0 && (
        <dl className="grid gap-8 sm:grid-cols-3">
          {stats.slice(0, 3).map((s) => (
            <div key={s.label} className="flex min-w-0 flex-col gap-4 rounded-8 border border-adm-line bg-adm-bg p-12">
              <dt className="text-12 font-medium text-adm-muted">{s.label}</dt>
              <dd className="text-24 font-semibold leading-tight tabular-nums text-adm-ink">{s.value}</dd>
              {s.note && <dd className="text-12 text-adm-ink-2">{s.note}</dd>}
            </div>
          ))}
        </dl>
      )}
      {next.length > 0 && (
        <div className="flex flex-col gap-6">
          <h2 className="text-13 font-semibold text-adm-ink">Next steps</h2>
          <ol className="flex flex-col gap-6">
            {next.map((n, i) => (
              <li key={n.text} className="flex flex-col gap-4 text-13 text-adm-ink lg:flex-row lg:items-baseline lg:justify-between lg:gap-12">
                <span>
                  <span className="mr-6 font-semibold tabular-nums">{i + 1}.</span>
                  {n.text}
                </span>
                {n.to && (
                  <Link to={n.to} className="inline-flex shrink-0 items-center gap-4 text-12 font-medium text-adm-ink underline decoration-adm-axis underline-offset-2 hover:decoration-adm-ink">
                    {n.linkLabel ?? 'Open'} <ArrowRight size={12} aria-hidden="true" />
                  </Link>
                )}
              </li>
            ))}
          </ol>
        </div>
      )}
      <div className="flex flex-wrap items-center justify-between gap-8 border-t border-adm-line pt-12">
        {note ? <p className="text-12 text-adm-muted">{note}</p> : <span />}
        {onDetail && (
          <button type="button" onClick={onDetail} className="inline-flex items-center gap-4 text-13 font-semibold text-adm-ink underline decoration-adm-axis underline-offset-2 hover:decoration-adm-ink">
            See everything in Detail <ArrowRight size={13} aria-hidden="true" />
          </button>
        )}
      </div>
    </section>
  )
}

/** "This page is for …": one sentence on top of every Summary tab. */
export function PurposeLine({ purpose }: { purpose: string }) {
  return (
    <p className="rounded-8 bg-adm-bg px-12 py-8 text-14 text-adm-ink" data-purpose>
      <span className="font-semibold">This page is for </span>
      {purpose}
    </p>
  )
}

/** A report's Summary tab: the purpose line above the report's own summary block. */
export function ReportSummaryTab({ purpose, children, onDetail }: { purpose: string; children: ReactNode; onDetail?: () => void }) {
  return (
    <div className="flex min-w-0 flex-col gap-12">
      <PurposeLine purpose={purpose} />
      {children}
      {onDetail && (
        <button type="button" onClick={onDetail} className="inline-flex items-center gap-4 self-end text-13 font-semibold text-adm-ink underline decoration-adm-axis underline-offset-2 hover:decoration-adm-ink">
          See everything in Detail <ArrowRight size={13} aria-hidden="true" />
        </button>
      )}
    </div>
  )
}
