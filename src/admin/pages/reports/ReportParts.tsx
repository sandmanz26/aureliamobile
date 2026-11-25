import { ExternalLink } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { BUILD } from '../../../lib/build'
import { Badge, Panel } from '../../components/ui'
import { LABEL_FILL, LABEL_TONE } from './reportColors'
import { LABEL_MEANING, LABEL_TEXT, SOURCES, sourcesOf, type Finding, type SourceId, type SourceLabel } from '../../data/reportSources'
import { useDetail } from './DetailDrawer'
import { sourceItem } from './detailItems'

/*
 * Shared parts of Admin → Reports (U116, J167): the label badge, the source
 * chip and the Sources section. The old source graph ("What this report
 * says") gave way to the iteration map in U129. Everything reads
 * the one registry in data/reportSources.ts.
 */

export function LabelBadge({ label }: { label: SourceLabel }) {
  return <Badge tone={LABEL_TONE[label]}>{LABEL_TEXT[label]}</Badge>
}

/** A source named inline; a click shows it in the drawer (U129), with a link to open it. */
export function SourceChip({ id, cite }: { id: SourceId; cite?: string }) {
  const s = SOURCES[id]
  const open = useDetail()
  return (
    <button
      type="button"
      onClick={() => open(sourceItem(id, cite))}
      className="inline-flex max-w-full items-center gap-4 rounded-full border border-adm-line px-8 py-2 text-left text-11 font-medium text-adm-ink-2 hover:bg-adm-hover hover:text-adm-ink"
    >
      <svg width="6" height="6" aria-hidden="true">
        <circle cx="3" cy="3" r="3" className={LABEL_FILL[s.label]} />
      </svg>
      {s.name}
      {cite && <span className="font-normal text-adm-muted">· {cite}</span>}
    </button>
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
