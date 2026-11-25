import { ExternalLink } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { BUILD } from '../../../lib/build'
import { Badge, Panel } from '../../components/ui'
import { LABEL_FILL, LABEL_STROKE, LABEL_TONE } from './reportColors'
import { LABEL_MEANING, LABEL_TEXT, SOURCES, sourcesOf, type Finding, type SourceId, type SourceLabel } from '../../data/reportSources'

/*
 * Shared parts of Admin → Reports (U116, J167): the "How this report was
 * made" graph, the label badge and the Sources section. Everything reads
 * the one registry in data/reportSources.ts.
 */

export function LabelBadge({ label }: { label: SourceLabel }) {
  return <Badge tone={LABEL_TONE[label]}>{LABEL_TEXT[label]}</Badge>
}

/** A source named inline, linking to it. */
export function SourceChip({ id, cite }: { id: SourceId; cite?: string }) {
  const s = SOURCES[id]
  return (
    <Link to={s.link} className="inline-flex items-center gap-4 whitespace-nowrap rounded-full border border-adm-line px-8 py-2 text-11 font-medium text-adm-ink-2 hover:bg-adm-hover hover:text-adm-ink">
      <svg width="6" height="6" aria-hidden="true">
        <circle cx="3" cy="3" r="3" className={LABEL_FILL[s.label]} />
      </svg>
      {s.name}
      {cite && <span className="font-normal text-adm-muted">· {cite}</span>}
    </Link>
  )
}

const W = 880
const NODE_W_LEFT = 230
const NODE_W_RIGHT = 250
const NODE_H = 30
const ROW = 40
const PAD = 26

/**
 * Sources on the left, the report's findings on the right, an edge for every
 * citation. Hovering or focusing a node keeps its edges and dims the rest.
 * Source nodes open the source; finding nodes jump to that section.
 */
export function SourceGraph({ findings, label }: { findings: Finding[]; label: string }) {
  const [active, setActive] = useState<string | null>(null)
  const sources = sourcesOf(findings)
  const rows = Math.max(sources.length, findings.length)
  const H = rows * ROW + PAD * 2
  const leftY = (i: number) => PAD + (rows - sources.length) * (ROW / 2) + i * ROW
  const rightStep = (rows * ROW) / findings.length
  const rightY = (i: number) => PAD + i * rightStep + (rightStep - ROW) / 2
  const x1 = 8 + NODE_W_LEFT
  const x2 = W - 8 - NODE_W_RIGHT
  const edges = findings.flatMap((f, fi) =>
    f.sources.map((sid) => ({ sid, fid: f.id, from: leftY(sources.findIndex((s) => s.id === sid)) + NODE_H / 2, to: rightY(fi) + NODE_H / 2 })),
  )
  const lit = (sid: string, fid: string) => !active || active === sid || active === fid
  const nodeLit = (id: string) => !active || active === id || edges.some((e) => (e.sid === id && e.fid === active) || (e.fid === id && e.sid === active))

  return (
    <div className="flex flex-col gap-10">
      <div className="overflow-x-auto rounded-8 border border-adm-line bg-adm-bg">
        <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} role="img" aria-label={label} className="block min-w-[760px] max-w-none">
          <text x={8} y={16} className="fill-adm-muted text-11 font-semibold uppercase tracking-wider">
            Sources ({sources.length})
          </text>
          <text x={x2} y={16} className="fill-adm-muted text-11 font-semibold uppercase tracking-wider">
            What this report says ({findings.length})
          </text>
          {edges.map((e) => {
            const s = SOURCES[e.sid]
            const mid = (x1 + x2) / 2
            return (
              <path
                key={`${e.sid}-${e.fid}`}
                d={`M ${x1} ${e.from} C ${mid} ${e.from}, ${mid} ${e.to}, ${x2} ${e.to}`}
                fill="none"
                strokeWidth={lit(e.sid, e.fid) && active ? 2 : 1.25}
                className={`${LABEL_STROKE[s.label]} transition-opacity`}
                opacity={lit(e.sid, e.fid) ? (active ? 0.9 : 0.45) : 0.06}
              />
            )
          })}
          {sources.map((s, i) => (
            <Link
              key={s.id}
              to={s.link}
              aria-label={`${s.name} (${LABEL_TEXT[s.label]}): open the source`}
              onMouseEnter={() => setActive(s.id)}
              onMouseLeave={() => setActive(null)}
              onFocus={() => setActive(s.id)}
              onBlur={() => setActive(null)}
            >
              <g opacity={nodeLit(s.id) ? 1 : 0.35} className="cursor-pointer">
                <rect x={8} y={leftY(i)} width={NODE_W_LEFT} height={NODE_H} rx={8} className="fill-adm-surface stroke-adm-line" />
                <circle cx={22} cy={leftY(i) + NODE_H / 2} r={4} className={LABEL_FILL[s.label]} />
                <text x={34} y={leftY(i) + NODE_H / 2 + 4} className="fill-adm-ink text-12 font-medium">
                  {s.name}
                </text>
                <text x={8 + NODE_W_LEFT - 10} y={leftY(i) + NODE_H / 2 + 4} textAnchor="end" className="fill-adm-muted text-10">
                  {LABEL_TEXT[s.label].toLowerCase()}
                </text>
              </g>
            </Link>
          ))}
          {findings.map((f, i) => (
            <a
              key={f.id}
              href={`#${f.id}`}
              aria-label={`${f.title}: go to the section`}
              onMouseEnter={() => setActive(f.id)}
              onMouseLeave={() => setActive(null)}
              onFocus={() => setActive(f.id)}
              onBlur={() => setActive(null)}
            >
              <g opacity={nodeLit(f.id) ? 1 : 0.35} className="cursor-pointer">
                <rect x={x2} y={rightY(i)} width={NODE_W_RIGHT} height={NODE_H} rx={8} className="fill-adm-surface stroke-adm-ink-2" />
                <text x={x2 + 12} y={rightY(i) + NODE_H / 2 + 4} className="fill-adm-ink text-12 font-semibold">
                  {f.title}
                </text>
                <text x={x2 + NODE_W_RIGHT - 10} y={rightY(i) + NODE_H / 2 + 4} textAnchor="end" className="fill-adm-muted text-10">
                  {f.sources.length} sources
                </text>
              </g>
            </a>
          ))}
        </svg>
      </div>
      <div className="flex flex-wrap items-center gap-x-14 gap-y-6 text-11 text-adm-ink-2">
        {(Object.keys(LABEL_TEXT) as SourceLabel[])
          .filter((l) => sources.some((s) => s.label === l))
          .map((l) => (
            <span key={l} className="inline-flex items-center gap-6" title={LABEL_MEANING[l]}>
              <svg width="8" height="8" aria-hidden="true">
                <circle cx="4" cy="4" r="4" className={LABEL_FILL[l]} />
              </svg>
              {LABEL_TEXT[l]}
            </span>
          ))}
        <span className="text-adm-muted">Hover a box to follow its lines. A source opens it; a finding jumps to its section.</span>
      </div>
    </div>
  )
}

/** The fixed-format Sources section, the build it was made on, and its limits. */
export function SourcesSection({ findings, limits, labels = ['measured', 'prediction', 'sample', 'estimate', 'document'] }: { findings: Finding[]; limits: ReactNode[]; labels?: SourceLabel[] }) {
  const sources = sourcesOf(findings)
  return (
    <>
      <Panel title="Sources" description="Every source this report uses, in one format. The label says how far its numbers can be trusted.">
        <ul className="grid gap-12 lg:grid-cols-2">
          {sources.map((s) => (
            <li key={s.id} className="flex min-w-0 flex-col gap-8 rounded-8 border border-adm-line p-12">
              <div className="flex flex-wrap items-center justify-between gap-8">
                <span className="text-13 font-semibold text-adm-ink">{s.name}</span>
                <LabelBadge label={s.label} />
              </div>
              <dl className="grid grid-cols-[96px_1fr] gap-x-10 gap-y-4 text-12">
                <dt className="text-adm-muted">What it is</dt>
                <dd className="text-adm-ink-2">{s.what}</dd>
                <dt className="text-adm-muted">Version</dt>
                <dd className="text-adm-ink-2">{s.version}</dd>
                <dt className="text-adm-muted">Taken from it</dt>
                <dd className="text-adm-ink-2">{s.taken}</dd>
                <dt className="text-adm-muted">Link</dt>
                <dd>
                  <Link to={s.link} className="inline-flex items-center gap-4 break-all font-medium text-adm-ink underline decoration-adm-axis underline-offset-2 hover:decoration-adm-ink">
                    {s.link}
                    <ExternalLink size={11} aria-hidden="true" />
                  </Link>
                </dd>
              </dl>
            </li>
          ))}
        </ul>
        <dl className="grid gap-6 border-t border-adm-line pt-12 text-12 sm:grid-cols-2 lg:grid-cols-3">
          {(Object.keys(LABEL_TEXT) as SourceLabel[]).filter((l) => labels.includes(l)).map((l) => (
            <div key={l} className="flex items-start gap-8">
              <dt className="shrink-0">
                <LabelBadge label={l} />
              </dt>
              <dd className="text-adm-ink-2">{LABEL_MEANING[l]}</dd>
            </div>
          ))}
        </dl>
      </Panel>
      <div className="grid gap-16 lg:grid-cols-[1fr_2fr]">
        <Panel title="Built on" description="The build this page was computed in. The figures follow the data in this commit.">
          <dl className="grid grid-cols-[96px_1fr] gap-x-10 gap-y-4 text-12">
            <dt className="text-adm-muted">Commit</dt>
            <dd className="font-mono text-adm-ink">{BUILD.commit}</dd>
            <dt className="text-adm-muted">Built</dt>
            <dd className="text-adm-ink-2">{BUILD.builtAt}</dd>
            <dt className="text-adm-muted">Environment</dt>
            <dd className="text-adm-ink-2">
              {BUILD.label} · {BUILD.version}
            </dd>
          </dl>
        </Panel>
        <Panel title="Limits" description="What this report cannot say.">
          <ul className="flex list-disc flex-col gap-6 pl-18 text-13 text-adm-ink-2">
            {limits.map((l, i) => (
              <li key={i}>{l}</li>
            ))}
          </ul>
        </Panel>
      </div>
    </>
  )
}
