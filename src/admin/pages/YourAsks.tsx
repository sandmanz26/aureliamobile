import { ArrowRight } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Badge, Panel, type Tone } from '../components/ui'
import { ASK_STATUS_LABEL, OWNER_ASKS, type AskStatus } from '../data/ownerAsks'

/*
 * Start here → "Your asks" (U147, J206): every ask of the business owner,
 * read at build time from §0 of docs/briefs/EUGENE-CONTEXT.md, with its
 * status and the page that answers it where one exists.
 */

const TONE: Record<AskStatus, Tone> = { done: 'good', live: 'good', planned: 'info', waiting: 'serious', received: 'neutral', open: 'warning', parked: 'neutral' }
const ORDER: AskStatus[] = ['open', 'received', 'planned', 'waiting', 'live', 'done', 'parked']

export function YourAsks() {
  const [filter, setFilter] = useState<AskStatus | 'all'>('all')
  const counts = useMemo(() => Object.fromEntries(ORDER.map((s) => [s, OWNER_ASKS.filter((a) => a.status === s).length])) as Record<AskStatus, number>, [])
  const rows = filter === 'all' ? OWNER_ASKS : OWNER_ASKS.filter((a) => a.status === filter)
  const chip = (active: boolean) => `rounded-full border px-10 py-4 text-12 ${active ? 'border-adm-ink bg-adm-ink text-adm-surface' : 'border-adm-line text-adm-ink hover:bg-adm-hover'}`

  return (
    <section id="your-asks" aria-label="Your asks" className="scroll-mt-16">
      <Panel title={`Your asks: ${OWNER_ASKS.length} from the business owner, ${counts.open + counts.received} not started`} description="Read from the business owner’s ask list (§0 of the context brief) when the admin is built, so it always matches the document. A link opens the page that answers the ask.">
        <div className="flex flex-wrap gap-6" role="group" aria-label="Filter by status">
          <button type="button" aria-pressed={filter === 'all'} onClick={() => setFilter('all')} className={chip(filter === 'all')}>
            All {OWNER_ASKS.length}
          </button>
          {ORDER.filter((s) => counts[s]).map((s) => (
            <button key={s} type="button" aria-pressed={filter === s} onClick={() => setFilter(s)} className={chip(filter === s)}>
              {ASK_STATUS_LABEL[s]} {counts[s]}
            </button>
          ))}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-12">
            <thead className="text-11 uppercase tracking-wider text-adm-muted">
              <tr className="border-b border-adm-line">
                <th className="py-6 pr-12 font-semibold">Id</th>
                <th className="py-6 pr-12 font-semibold">Ask</th>
                <th className="py-6 pr-12 font-semibold">Status</th>
                <th className="py-6 pr-12 font-semibold">Page</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((a) => (
                <tr key={a.id} className="border-b border-adm-line align-top last:border-0">
                  <td className="py-8 pr-12 font-semibold tabular-nums text-adm-ink">{a.id}</td>
                  <td className="py-8 pr-12 text-adm-ink">{a.ask}</td>
                  <td className="py-8 pr-12">
                    <span className="flex flex-col items-start gap-4">
                      <Badge tone={TONE[a.status]}>{ASK_STATUS_LABEL[a.status]}</Badge>
                      <span className="text-11 text-adm-muted">{a.statusText}</span>
                    </span>
                  </td>
                  <td className="py-8 pr-12">
                    {a.link ? (
                      <Link to={a.link.to} className="inline-flex items-center gap-4 font-medium text-adm-ink underline decoration-adm-axis underline-offset-2 hover:decoration-adm-ink">
                        {a.link.label} <ArrowRight size={12} aria-hidden="true" />
                      </Link>
                    ) : (
                      <span className="text-adm-muted">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </section>
  )
}
