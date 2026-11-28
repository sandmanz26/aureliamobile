import { ExternalLink } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Badge, type Tone } from '../../components/ui'
import { DATA_SOURCE_TYPE_MEANING, DATA_SOURCE_TYPE_TEXT, dataSourcesFor, type DataSourceType } from '../../data/dataSources'

/*
 * "Data sources" (U146, J206): the full block that closes every report's
 * Detail. Since U151 the Summary shows its short form in ReportHeaderCard's
 * "Where it comes from"; the compact mode here stays for other callers. Each source says what kind it is, what
 * it feeds on this page, its file or document, its date and a link.
 */

const TYPE_TONE: Record<DataSourceType, Tone> = { measured: 'good', simulated: 'info', assumed: 'serious', owner: 'critical', research: 'warning' }

export function DataSourceTypeBadge({ type }: { type: DataSourceType }) {
  return <Badge tone={TYPE_TONE[type]}>{DATA_SOURCE_TYPE_TEXT[type]}</Badge>
}

const linkCls = 'inline-flex min-w-0 items-center gap-4 break-all font-medium text-adm-ink underline decoration-adm-axis underline-offset-2 hover:decoration-adm-ink'

export function DataSources({ route, full = false }: { route: string; full?: boolean }) {
  const items = dataSourcesFor(route)
  if (!items.length) return null
  const types = [...new Set(items.map((i) => i.type))]
  return (
    <section aria-label="Data sources" data-sources={full ? 'full' : 'compact'} className="flex min-w-0 flex-col gap-10 rounded-12 border border-adm-line bg-adm-surface p-14 lg:p-16">
      <div className="flex flex-col gap-2">
        <h2 className="text-14 font-semibold text-adm-ink">Data sources</h2>
        <p className="text-12 text-adm-muted">Where every number on this page comes from, and how far it can be trusted.</p>
      </div>
      <ul className={full ? 'grid gap-12 lg:grid-cols-2' : 'flex flex-col'}>
        {items.map((s) =>
          full ? (
            <li key={s.id} data-source={s.id} className="flex min-w-0 flex-col gap-8 rounded-8 border border-adm-line p-12">
              <div className="flex flex-wrap items-center justify-between gap-8">
                <span className="text-13 font-semibold text-adm-ink">{s.source.name}</span>
                <DataSourceTypeBadge type={s.type} />
              </div>
              <dl className="grid grid-cols-[88px_1fr] gap-x-10 gap-y-4 text-12">
                <dt className="text-adm-muted">Feeds</dt>
                <dd className="min-w-0 text-adm-ink-2">{s.feeds}</dd>
                <dt className="text-adm-muted">What it is</dt>
                <dd className="min-w-0 text-adm-ink-2">{s.source.what}</dd>
                <dt className="text-adm-muted">File</dt>
                <dd className="min-w-0 break-words font-mono text-11 text-adm-ink-2">{s.file}</dd>
                <dt className="text-adm-muted">Date</dt>
                <dd className="min-w-0 text-adm-ink-2">{s.date}</dd>
                <dt className="text-adm-muted">Version</dt>
                <dd className="min-w-0 text-adm-ink-2">{s.source.version}</dd>
                <dt className="text-adm-muted">Link</dt>
                <dd className="min-w-0">
                  <Link to={s.source.link} className={linkCls}>
                    {s.source.link}
                    <ExternalLink size={11} aria-hidden="true" />
                  </Link>
                </dd>
              </dl>
            </li>
          ) : (
            <li key={s.id} data-source={s.id} className="flex min-w-0 flex-col gap-4 border-t border-adm-line py-8 first:border-0 first:pt-0 lg:flex-row lg:items-baseline lg:gap-12">
              <span className="flex min-w-0 flex-wrap items-center gap-6 lg:w-[300px] lg:shrink-0">
                <span className="text-13 font-semibold text-adm-ink">{s.source.name}</span>
                <DataSourceTypeBadge type={s.type} />
              </span>
              <span className="min-w-0 flex-1 text-12 text-adm-ink-2">{s.feeds}</span>
              <span className="flex min-w-0 flex-wrap items-baseline gap-x-8 gap-y-2 text-12 text-adm-muted lg:max-w-[420px] lg:justify-end">
                <span className="min-w-0 break-words">{s.file}</span>
                <span>· {s.date}</span>
                <Link to={s.source.link} className={linkCls} aria-label={`Open ${s.source.name}`}>
                  Open <ExternalLink size={11} aria-hidden="true" />
                </Link>
              </span>
            </li>
          ),
        )}
      </ul>
      {full && (
        <dl className="grid gap-6 border-t border-adm-line pt-10 text-12 lg:grid-cols-2">
          {types.map((t) => (
            <div key={t} className="flex items-start gap-8">
              <dt className="shrink-0">
                <DataSourceTypeBadge type={t} />
              </dt>
              <dd className="text-adm-ink-2">{DATA_SOURCE_TYPE_MEANING[t]}</dd>
            </div>
          ))}
        </dl>
      )}
    </section>
  )
}
