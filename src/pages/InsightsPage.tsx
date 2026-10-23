import { useMutation, useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { ArrowLeft, Download, Flame, RefreshCw, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PageMeta } from '../components/PageMeta'
import type { ClickEvent } from '../demo/insights/tracker'
import { clickKeys } from '../api/clicks'
import { clearEvents, loadEvents } from '../demo/insights/tracker'
import { ElementsTable, ProblemList } from '../demo/insights/ElementsTable'
import { countBy, elementStats, heatmapUrl } from '../demo/insights/stats'

/**
 * /__demo/insights — reads back what Click insights recorded (U032).
 *
 * Summary first, then the three questions it exists to answer: which screens
 * people open, what they tap on each, and the path they take — plus single
 * sessions replayed as a list of steps, and a heatmap that draws the taps back
 * over the real screen. Outside the site lock, like the rest of /__demo.
 */
type Range = 'today' | '7d' | 'all'
type Device = 'all' | 'mobile' | 'tablet' | 'desktop'
type Ui = 'all' | '1' | '2'

const deviceOf = (vw: number): Exclude<Device, 'all'> => (vw < 640 ? 'mobile' : vw < 1024 ? 'tablet' : 'desktop')

function download(name: string, text: string, type: string) {
  const url = URL.createObjectURL(new Blob([text], { type }))
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.click()
  URL.revokeObjectURL(url)
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`h-32 rounded-full border px-12 text-[13px] ${
        active ? 'border-text-primary bg-text-primary text-text-inverse' : 'border-border-subtle bg-surface-default text-text-primary'
      }`}
    >
      {children}
    </button>
  )
}

function Bar({ value, max }: { value: number; max: number }) {
  return (
    <span className="block h-6 w-full overflow-hidden rounded-full bg-background-elevated">
      <span className="block h-full rounded-full bg-[#ff881b]" style={{ width: `${max ? (value / max) * 100 : 0}%` }} />
    </span>
  )
}

function Card({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="min-w-0 rounded-16 border border-border-subtle bg-surface-default p-16">
      <h2 className="text-style-body font-semibold text-text-primary">{title}</h2>
      {hint && <p className="text-style-caption mt-2 text-text-secondary">{hint}</p>}
      <div className="mt-12">{children}</div>
    </section>
  )
}

export function InsightsPage() {
  // The log, through the query cache: Refresh refetches, leaving the page
  // cancels an in-flight read, and Clear invalidates rather than patching
  // local state by hand.
  const insights = useQuery({
    queryKey: clickKeys.all,
    queryFn: ({ signal }) => loadEvents(signal),
    staleTime: 0,
  })
  const all: ClickEvent[] | null = insights.isFetching && !insights.isRefetching ? null : (insights.data?.events ?? null)
  const source = insights.data?.source ?? 'local'
  const scope = insights.data?.scope
  // "Now" for the date filters is when the data was read, not each render —
  // a render must not depend on the clock.
  const readAt = insights.dataUpdatedAt
  const [range, setRange] = useState<Range>('7d')
  const [device, setDevice] = useState<Device>('all')
  const [ui, setUi] = useState<Ui>('all')
  const [page, setPage] = useState<string>('all')
  const [confirmClear, setConfirmClear] = useState(false)

  const refresh = () => void insights.refetch()
  const clear = useMutation({
    mutationKey: ['clicks', 'clear'],
    mutationFn: () => clearEvents(source),
    onSettled: () => {
      setConfirmClear(false)
      void insights.refetch()
    },
  })

  const events = useMemo(() => {
    const since = range === 'all' ? 0 : range === 'today' ? new Date(readAt).setHours(0, 0, 0, 0) : readAt - 7 * 864e5
    return (all ?? []).filter(
      (e) =>
        Date.parse(e.t) >= since &&
        (device === 'all' || deviceOf(e.vw) === device) &&
        (ui === 'all' || String(e.ui) === ui),
    )
  }, [all, range, device, ui, readAt])

  const views = events.filter((e) => e.type === 'view')
  const taps = events.filter((e) => e.type === 'click')
  const sessions = countBy(events, (e) => e.sid)
  const screens = countBy(views, (e) => e.page)
  const pages = [...new Set(events.map((e) => e.page))].sort()
  const stats = useMemo(() => elementStats(events), [events])
  const statsHere = page === 'all' ? stats : stats.filter((s) => s.page === page)
  const paths = countBy(
    views.filter((e) => e.from),
    (e) => `${e.from} → ${e.page}`,
  ).slice(0, 12)

  // Most recent sessions as step lists: screen, tap, tap, screen…
  const journeys = useMemo(() => {
    const bySid = new Map<string, ClickEvent[]>()
    for (const e of events) bySid.set(e.sid, [...(bySid.get(e.sid) ?? []), e])
    return [...bySid.entries()]
      .map(([sid, list]) => ({ sid, list: list.sort((a, b) => a.t.localeCompare(b.t)) }))
      .sort((a, b) => b.list[b.list.length - 1].t.localeCompare(a.list[a.list.length - 1].t))
      .slice(0, 15)
  }, [events])

  const exportCsv = () => {
    const cols: (keyof ClickEvent)[] = [
      't', 'sid', 'type', 'page', 'from', 'label', 'kind', 'section', 'state', 'fx', 'to', 'rage', 'dead',
      'ms', 'sy', 'ex', 'ey', 'ew', 'eh', 'sel', 'tag', 'href', 'x', 'y', 'vw', 'vh', 'ui',
    ]
    const esc = (v: unknown) => (v === undefined ? '' : `"${String(v).replace(/"/g, '""')}"`)
    download(`aurelia-clicks-${new Date().toISOString().slice(0, 10)}.csv`, [cols.join(','), ...events.map((e) => cols.map((c) => esc(e[c])).join(','))].join('\n'), 'text/csv')
  }

  const maxScreen = screens[0]?.[1] ?? 0
  const maxPath = paths[0]?.[1] ?? 0

  return (
    <div className="min-h-full bg-background-default px-20 py-24 lg:px-40">
      <PageMeta title="Click insights" description="What people tap and how they move through Aurelia." />
      <div className="mx-auto max-w-[1100px]">
        <Link to="/__demo" className="text-style-body-small inline-flex items-center gap-6 text-text-secondary">
          <ArrowLeft size={14} /> Presenter console
        </Link>
        <div className="mt-12 flex flex-wrap items-end justify-between gap-16">
          <div>
            <h1 className="text-[32px] leading-[38px] text-text-primary">Click insights</h1>
            <p className="text-style-body-small mt-4 text-text-secondary">
              {source === 'server'
                ? `Shared log for this deployment (${scope ?? ''}) — every visitor’s taps, newest 20,000 kept.`
                : 'Local only — no shared store configured, so this shows taps made in this browser.'}
            </p>
          </div>
          <div className="flex flex-wrap gap-8">
            <button type="button" onClick={refresh} className="inline-flex h-36 items-center gap-6 rounded-full border border-border-subtle bg-surface-default px-14 text-[13px] text-text-primary">
              <RefreshCw size={14} /> Refresh
            </button>
            <button type="button" onClick={exportCsv} className="inline-flex h-36 items-center gap-6 rounded-full border border-border-subtle bg-surface-default px-14 text-[13px] text-text-primary">
              <Download size={14} /> CSV
            </button>
            <button
              type="button"
              onClick={() => download(`aurelia-clicks-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(events, null, 2), 'application/json')}
              className="inline-flex h-36 items-center gap-6 rounded-full border border-border-subtle bg-surface-default px-14 text-[13px] text-text-primary"
            >
              <Download size={14} /> JSON
            </button>
            {confirmClear ? (
              <span className="inline-flex items-center gap-8 text-[13px]">
                Delete the whole log?
                <button
                  type="button"
                  onClick={() => clear.mutate()}
                  disabled={clear.isPending}
                  className="h-36 rounded-full bg-feedback-error px-14 text-white"
                >
                  Delete
                </button>
                <button type="button" onClick={() => setConfirmClear(false)} className="h-36 rounded-full border border-border-subtle px-14">
                  Cancel
                </button>
              </span>
            ) : (
              <button type="button" onClick={() => setConfirmClear(true)} className="inline-flex h-36 items-center gap-6 rounded-full border border-border-subtle bg-surface-default px-14 text-[13px] text-feedback-error">
                <Trash2 size={14} /> Clear
              </button>
            )}
          </div>
        </div>

        <div className="mt-20 flex flex-wrap items-center gap-8">
          {(['today', '7d', 'all'] as Range[]).map((r) => (
            <Chip key={r} active={range === r} onClick={() => setRange(r)}>
              {r === 'today' ? 'Today' : r === '7d' ? 'Last 7 days' : 'All time'}
            </Chip>
          ))}
          <span className="mx-4 h-20 w-px bg-border-subtle" />
          {(['all', 'mobile', 'tablet', 'desktop'] as Device[]).map((d) => (
            <Chip key={d} active={device === d} onClick={() => setDevice(d)}>
              {d === 'all' ? 'All devices' : d[0].toUpperCase() + d.slice(1)}
            </Chip>
          ))}
          <span className="mx-4 h-20 w-px bg-border-subtle" />
          {(['all', '1', '2'] as Ui[]).map((v) => (
            <Chip key={v} active={ui === v} onClick={() => setUi(v)}>
              {v === 'all' ? 'All versions' : `v${v}`}
            </Chip>
          ))}
        </div>

        {all === null ? (
          <p className="text-style-body-small mt-32 text-text-secondary">Loading…</p>
        ) : (
          <>
            <div className="mt-20 grid grid-cols-2 gap-12 lg:grid-cols-4">
              {[
                ['Sessions', sessions.length],
                ['Screens viewed', views.length],
                ['Taps', taps.length],
                ['Taps per session', sessions.length ? Math.round((taps.length / sessions.length) * 10) / 10 : 0],
              ].map(([label, value]) => (
                <div key={label} className="rounded-16 border border-border-subtle bg-surface-default p-16">
                  <p className="text-[28px] leading-[34px] tabular-nums text-text-primary">{value}</p>
                  <p className="text-style-caption text-text-secondary">{label}</p>
                </div>
              ))}
            </div>

            {events.length === 0 ? (
              <p className="text-style-body-small mt-32 text-text-secondary">
                Nothing recorded for these filters yet. With Click insights on, open the app in another tab and tap around — taps are sent every few seconds and when the tab is hidden.
              </p>
            ) : (
              <div className="mt-16 grid grid-cols-1 gap-16 lg:grid-cols-2">
                <Card title="Screens" hint="How often each screen was opened. Heatmap draws the taps back over it in a new tab — open it at the same kind of window (phone/desktop) you want to see.">
                  <ul className="flex flex-col gap-10">
                    {screens.map(([p, n]) => (
                      <li key={p} className="grid grid-cols-[minmax(0,1fr)_80px_40px_auto] items-center gap-10 text-[13px]">
                        <span className="truncate text-text-primary">{p}</span>
                        <Bar value={n} max={maxScreen} />
                        <span className="text-right tabular-nums text-text-secondary">{n}</span>
                        <a href={heatmapUrl(p)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-4 text-[#ff881b]">
                          <Flame size={13} /> Heatmap
                        </a>
                      </li>
                    ))}
                  </ul>
                </Card>

                <Card title="Problem taps" hint="Taps that did nothing visible within 0.7s, rage taps (3+ in a second on one spot), and taps on things that are not buttons or links — usually something that looks tappable and is not.">
                  <ProblemList stats={statsHere} />
                </Card>

                <div className="lg:col-span-2">
                  <Card
                    title="Elements"
                    hint="Every element tapped, one row each. Reach = share of the visits to that screen that tapped it; After = median time from opening the screen. Click a row for where on the element people tap, devices, versions, state, where it led, and a link that outlines it on the real screen."
                  >
                    <select
                      value={page}
                      onChange={(e) => setPage(e.target.value)}
                      className="mb-12 h-32 w-full rounded-8 border border-border-subtle bg-surface-default px-8 text-[13px] lg:w-[320px]"
                    >
                      <option value="all">All screens</option>
                      {pages.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                    <ElementsTable key={page} stats={statsHere} />
                  </Card>
                </div>

                <Card title="Paths" hint="The most common moves from one screen to the next.">
                  <ul className="flex flex-col gap-10">
                    {paths.length === 0 && <li className="text-[13px] text-text-secondary">No moves between screens yet.</li>}
                    {paths.map(([path, n]) => (
                      <li key={path} className="grid grid-cols-[minmax(0,1fr)_80px_40px] items-center gap-10 text-[13px]">
                        <span className="truncate text-text-primary" title={path}>{path}</span>
                        <Bar value={n} max={maxPath} />
                        <span className="text-right tabular-nums text-text-secondary">{n}</span>
                      </li>
                    ))}
                  </ul>
                </Card>

                <Card title="Recent sessions" hint="One visit each, step by step: ▸ screen opened, • tap (section, → where it led, ✕ no response, !! rage).">
                  <ul className="flex max-h-[520px] flex-col gap-12 overflow-y-auto">
                    {journeys.map(({ sid, list }) => (
                      <li key={sid} className="rounded-12 bg-background-elevated p-12 text-[12px]">
                        <p className="text-text-secondary">
                          {new Date(list[0].t).toLocaleString()} · {deviceOf(list[0].vw)} · v{list[0].ui} · {list.length} steps
                        </p>
                        <ol className="mt-6 flex flex-wrap gap-x-8 gap-y-4 text-text-primary">
                          {list.slice(0, 40).map((e, i) => (
                            <li key={i} className={e.type === 'view' ? 'font-semibold' : ''}>
                              {e.type === 'view' ? (
                                `▸ ${e.page}`
                              ) : (
                                <>
                                  • {e.label ?? e.tag}
                                  {e.section && e.section !== 'Page' && <span className="text-text-secondary"> ({e.section})</span>}
                                  {e.fx === 'navigated' && <span className="text-success-600"> → {e.to}</span>}
                                  {e.fx === 'nothing' && <span className="text-feedback-error"> ✕</span>}
                                  {e.rage && <span className="text-feedback-error"> !!</span>}
                                </>
                              )}
                            </li>
                          ))}
                          {list.length > 40 && <li className="text-text-secondary">…{list.length - 40} more</li>}
                        </ol>
                      </li>
                    ))}
                  </ul>
                </Card>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
