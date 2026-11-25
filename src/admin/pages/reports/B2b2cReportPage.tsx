import { ExternalLink, PanelRightOpen } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Badge, PageHeader, Panel, type Tone } from '../../components/ui'
import {
  B2B2C_SOURCES,
  CHANNELS,
  CHANNEL_NAME,
  CHANNEL_ORDER,
  EFFORT_TEXT,
  EVIDENCE_LABEL_TEXT,
  FEATURES,
  MOVED_DOWN,
  PHASES,
  PRIORITIES,
  WIKI_FEATURES,
  WIKI_ROUND_2,
  b2b2cSummary,
  featuresBy,
  sourceById,
  type ChannelId,
  type EvidenceLabel,
  type Feature,
  type Priority,
} from '../../data/b2b2cReport'
import { plainText } from '../../data/glossary'
import { buildIterationMap, mapFor } from '../../data/iterationMap'
import { B2b2cHowItWorks } from './B2b2cHowItWorks'
import { DetailDrawerProvider, useDetail, type DetailItem } from './DetailDrawer'
import { IterationMapView } from './IterationMapView'
import { Details, SummaryBlock } from './ReportSummary'

/**
 * Admin → Reports → B2B2C report: B2B2C research round 2 for the business
 * owner. Summary first; then How it works (four diagrams); then the channels compared, the feature board
 * (channel × priority, each card opens the drawer) and the phased plan.
 * All data lives in data/b2b2cReport.ts; the wiki's round-2 and features
 * pages say the same in prose.
 */

const LABEL_TONE: Record<EvidenceLabel, Tone> = { measured: 'good', company: 'warning', 'third-party': 'neutral', estimate: 'serious', simulated: 'info', internal: 'neutral' }
const PRIORITY_TONE: Record<Priority, Tone> = { Now: 'critical', Next: 'serious', Later: 'neutral' }

function SourceLinks({ ids }: { ids: string[] }) {
  return (
    <ul className="flex flex-col gap-6 border-t border-adm-line pt-10">
      {ids.map((id) => {
        const s = sourceById(id)!
        const external = s.url.startsWith('http')
        return (
          <li key={id} className="flex min-w-0 flex-col gap-2 text-12">
            <span className="flex flex-wrap items-center gap-6">
              <Badge tone={LABEL_TONE[s.label]}>{EVIDENCE_LABEL_TEXT[s.label]}</Badge>
              <a href={s.url} {...(external ? { target: '_blank', rel: 'noreferrer' } : {})} className="inline-flex min-w-0 items-center gap-4 break-words font-medium text-adm-ink underline decoration-adm-axis underline-offset-2 hover:decoration-adm-ink">
                {s.title}
                {external && <ExternalLink size={11} aria-hidden="true" className="shrink-0" />}
              </a>
            </span>
            <span className="text-adm-muted">
              {s.date} · {s.used}
            </span>
          </li>
        )
      })}
    </ul>
  )
}

function featureItem(f: Feature): DetailItem {
  return {
    kicker: `${CHANNEL_NAME[f.channel]} · ${f.priority}`,
    title: f.title,
    summary: `The problem: ${f.problem}`,
    numbers: [
      { label: 'For', value: f.user },
      { label: 'Priority', value: f.priority },
      { label: 'Effort', value: EFFORT_TEXT[f.effort] },
      { label: 'Success number', value: f.metric },
      ...(f.endpoints.length ? [{ label: 'API v2 endpoints', value: f.endpoints.join(' · ') }] : []),
    ],
    extra: (
      <div className="flex flex-col gap-8">
        <p className="text-13 leading-relaxed text-adm-ink-2">
          <span className="font-semibold text-adm-ink">Evidence: </span>
          {f.evidence}
        </p>
        <SourceLinks ids={f.sources} />
      </div>
    ),
    to: WIKI_FEATURES,
    toLabel: 'The feature list on the wiki',
  }
}

function ChannelChart() {
  const open = useDetail()
  const rows = [
    ...CHANNELS.map((c) => ({ key: c.id, name: c.name, rank: `${c.rank}`, base: c.score18, sim: c.sim, round1: c.round1Rank ? `Round 1: ${c.round1Rank}${['st', 'nd', 'rd'][c.round1Rank - 1] ?? 'th'}, ${c.round1} of 18` : 'Not in round 1', item: { kicker: `Channel · rank ${c.rank}`, title: c.name, summary: c.why, numbers: [{ label: 'Score', value: `${c.score18 + c.sim} of 21` }, { label: 'Round 1', value: c.round1 ? `${c.round1} of 18, rank ${c.round1Rank}` : '—' }], extra: <div className="flex flex-col gap-8"><p className="text-13 text-adm-ink-2"><span className="font-semibold text-adm-ink">What changed: </span>{c.changed}</p><SourceLinks ids={c.sources} /></div>, to: WIKI_ROUND_2, toLabel: 'Round 2 on the wiki' } as DetailItem })),
    { key: 'ticket', name: MOVED_DOWN[0].name, rank: '—', base: 15, sim: 0, round1: `Round 1: ${MOVED_DOWN[0].round1}`, item: { kicker: 'Moved down', title: MOVED_DOWN[0].name, summary: MOVED_DOWN[0].why, numbers: [{ label: 'Now', value: MOVED_DOWN[0].now }], extra: <SourceLinks ids={MOVED_DOWN[0].sources} />, to: WIKI_ROUND_2, toLabel: 'Round 2 on the wiki' } as DetailItem },
    { key: 'aftercare', name: MOVED_DOWN[1].name, rank: '—', base: 14, sim: 0, round1: `Round 1: ${MOVED_DOWN[1].round1}`, item: { kicker: 'Moved down', title: MOVED_DOWN[1].name, summary: MOVED_DOWN[1].why, numbers: [{ label: 'Now', value: MOVED_DOWN[1].now }], extra: <SourceLinks ids={MOVED_DOWN[1].sources} />, to: WIKI_ROUND_2, toLabel: 'Round 2 on the wiki' } as DetailItem },
  ]
  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-wrap items-center gap-12 text-11 text-adm-muted" aria-hidden="true">
        <span className="inline-flex items-center gap-4"><span className="h-8 w-12 rounded-2 bg-adm-s1" /> Six questions from round 1 (of 18)</span>
        <span className="inline-flex items-center gap-4"><span className="h-8 w-12 rounded-2 bg-adm-s2" /> What the simulations say (of 3)</span>
      </div>
      <ul className="flex flex-col gap-8">
        {rows.map((r) => (
          <li key={r.key}>
            <button
              type="button"
              data-channel={r.key}
              onClick={() => open(r.item)}
              aria-label={`${r.name}: ${r.base + r.sim} of 21. Show details`}
              className="group flex w-full min-w-0 flex-col gap-6 rounded-8 border border-adm-line p-10 text-left hover:bg-adm-hover focus-visible:outline-2 focus-visible:outline-adm-accent lg:flex-row lg:items-center lg:gap-16"
            >
              <span className="flex min-w-0 items-baseline gap-8 lg:w-[320px] lg:shrink-0">
                <span className="w-16 shrink-0 text-13 font-semibold tabular-nums text-adm-muted">{r.rank}</span>
                <span className="min-w-0 text-13 font-semibold text-adm-ink">{r.name}</span>
              </span>
              <span className="flex min-w-0 flex-1 items-center gap-8">
                <span className="flex h-16 min-w-0 flex-1 overflow-hidden rounded-4 bg-adm-bg">
                  <span className="h-full bg-adm-s1" style={{ width: `${(r.base / 21) * 100}%` }} />
                  <span className="h-full bg-adm-s2" style={{ width: `${(r.sim / 21) * 100}%` }} />
                </span>
                <span className="w-48 shrink-0 text-right text-13 font-semibold tabular-nums text-adm-ink">{r.base + r.sim}/21</span>
                <PanelRightOpen size={14} aria-hidden="true" className="shrink-0 text-adm-muted group-hover:text-adm-ink" />
              </span>
              <span className="text-11 text-adm-muted lg:w-[180px] lg:shrink-0">{r.round1}</span>
            </button>
          </li>
        ))}
      </ul>
      <p className="text-12 text-adm-muted">The free plan is not ranked: every channel lands people in it. Insurers and clinical routes stay out (6–7 of 18 in round 1).</p>
    </div>
  )
}

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: string }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className={`rounded-full border px-10 py-4 text-12 font-medium ${on ? 'border-adm-ink bg-adm-ink text-adm-surface' : 'border-adm-line text-adm-ink-2 hover:bg-adm-hover'}`}
    >
      {children}
    </button>
  )
}

function FeatureBoard() {
  const open = useDetail()
  const [channel, setChannel] = useState<ChannelId | 'all'>('all')
  const [priority, setPriority] = useState<Priority | 'all'>('all')
  const shown = featuresBy(channel, priority)
  const columns = priority === 'all' ? PRIORITIES : [priority]
  return (
    <div className="flex flex-col gap-12">
      <div className="flex flex-col gap-8" role="group" aria-label="Filter features">
        <div className="flex flex-wrap items-center gap-6">
          <span className="w-64 text-11 font-semibold uppercase tracking-wider text-adm-muted">Channel</span>
          <Chip on={channel === 'all'} onClick={() => setChannel('all')}>All</Chip>
          {CHANNEL_ORDER.map((c) => (
            <Chip key={c} on={channel === c} onClick={() => setChannel(c)}>{CHANNEL_NAME[c]}</Chip>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-6">
          <span className="w-64 text-11 font-semibold uppercase tracking-wider text-adm-muted">Priority</span>
          <Chip on={priority === 'all'} onClick={() => setPriority('all')}>All</Chip>
          {PRIORITIES.map((p) => (
            <Chip key={p} on={priority === p} onClick={() => setPriority(p)}>{p}</Chip>
          ))}
        </div>
        <p className="text-12 text-adm-muted" aria-live="polite">
          {shown.length} of {FEATURES.length} features
        </p>
      </div>
      <div className={`grid min-w-0 gap-12 ${columns.length === 3 ? 'lg:grid-cols-3' : ''}`}>
        {columns.map((p) => {
          const list = shown.filter((f) => f.priority === p)
          return (
            <section key={p} aria-label={`${p}: ${list.length} features`} className="flex min-w-0 flex-col gap-8 rounded-12 bg-adm-bg p-10">
              <h3 className="flex items-center justify-between text-13 font-semibold text-adm-ink">
                <Badge tone={PRIORITY_TONE[p]}>{p}</Badge>
                <span className="text-11 font-normal text-adm-muted">{list.length}</span>
              </h3>
              {list.length === 0 && <p className="text-12 text-adm-muted">Nothing here with this filter.</p>}
              {list.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  data-feature={f.id}
                  onClick={() => open(featureItem(f))}
                  className="group flex min-w-0 flex-col gap-6 rounded-8 border border-adm-line bg-adm-surface p-10 text-left hover:border-adm-ink-2 focus-visible:outline-2 focus-visible:outline-adm-accent"
                >
                  <span className="flex items-start justify-between gap-8">
                    <span className="text-13 font-semibold text-adm-ink">
                      {f.top && <span className="mr-4 tabular-nums text-adm-muted">#{f.top}</span>}
                      {f.title}
                    </span>
                    <PanelRightOpen size={14} aria-hidden="true" className="mt-2 shrink-0 text-adm-muted group-hover:text-adm-ink" />
                  </span>
                  <span className="text-12 text-adm-ink-2">{f.problem}</span>
                  <span className="flex flex-wrap gap-4">
                    <Badge tone="neutral">{CHANNEL_NAME[f.channel]}</Badge>
                    <Badge tone="neutral">{f.user}</Badge>
                    <Badge tone={f.effort === 'frontend' ? 'good' : f.effort === 'backend' ? 'info' : 'serious'}>{EFFORT_TEXT[f.effort]}</Badge>
                    {f.trust && <Badge tone="warning">Trust</Badge>}
                  </span>
                </button>
              ))}
            </section>
          )
        })}
      </div>
    </div>
  )
}

function Plan() {
  const name = (id: string) => FEATURES.find((f) => f.id === id)?.title ?? id
  return (
    <ol className="flex flex-col gap-8">
      {PHASES.map((p) => (
        <li key={p.id} className="flex min-w-0 flex-col gap-6 rounded-8 border border-adm-line p-12">
          <span className="flex flex-wrap items-baseline justify-between gap-8">
            <span className="text-14 font-semibold text-adm-ink">{p.name}</span>
            <span className="text-12 text-adm-muted">{p.when}</span>
          </span>
          <ul className="flex list-disc flex-col gap-2 pl-18 text-12 text-adm-ink-2">
            {p.build.map((id) => (
              <li key={id}>{name(id)}</li>
            ))}
          </ul>
          <p className="text-12 font-medium text-adm-ink">{p.gate}</p>
        </li>
      ))}
    </ol>
  )
}

export function B2b2cReportPage() {
  const summary = useMemo(() => b2b2cSummary(), [])
  const map = useMemo(() => mapFor(buildIterationMap(1), 'b2b2c'), [])
  const web = B2B2C_SOURCES.filter((s) => s.url.startsWith('http'))
  const own = B2B2C_SOURCES.filter((s) => !s.url.startsWith('http'))
  return (
    <DetailDrawerProvider>
      <div className="flex flex-col gap-16">
        <PageHeader title="B2B2C report" description={plainText(summary.intro ?? '')} />

        <SummaryBlock s={summary} />

        <section id="b2b2c-how" className="min-w-0 scroll-mt-16">
          <Panel title="How it works" description="The idea in four pictures: who is involved, each channel step by step, what changed from round 1, and the phases. Click any box for a plain explanation and the features behind it.">
            <B2b2cHowItWorks />
          </Panel>
        </section>

        <section id="b2b2c-channels" className="min-w-0 scroll-mt-16">
          <Panel title="The channels compared" description="Each channel scored on round 1’s six questions plus what the simulations say. Click a row for why it moved.">
            <ChannelChart />
          </Panel>
        </section>

        <section id="b2b2c-features" className="min-w-0 scroll-mt-16">
          <Panel title="What we must build" description="Every feature by channel and priority. Click a card for the problem, the evidence, the effort and how we will know it worked.">
            <FeatureBoard />
          </Panel>
        </section>

        <Details id="b2b2c-plan" title="The phased plan" hint="what is built before each gate">
          <Plan />
        </Details>

        <Details title="Sources used" hint={`${web.length} web sources and ${own.length} of our own documents`}>
          <Panel title="Sources used" description="Left: the kinds of source this report reads. Right: what it has led to so far. Click a box for details.">
            <IterationMapView map={map} label="Sources used by the B2B2C report." />
          </Panel>
          <Panel title={`New web research (${web.length})`} description="Read on 25 Nov 2026. The label says how far each can be trusted.">
            <SourceLinks ids={web.map((s) => s.id)} />
          </Panel>
          <Panel title={`Our own documents (${own.length})`} description="What was already known.">
            <SourceLinks ids={own.map((s) => s.id)} />
          </Panel>
        </Details>
      </div>
    </DetailDrawerProvider>
  )
}
