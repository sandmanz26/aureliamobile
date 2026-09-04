import { ArrowDownRight, ArrowUpRight } from 'lucide-react'
import type { ReactNode } from 'react'

/* ------------------------------------------------------------------ Badge */

const TONES = {
  neutral: 'bg-adm-hover text-adm-ink-2',
  good: 'bg-adm-good/12 text-adm-good',
  warning: 'bg-adm-warning/18 text-adm-ink',
  serious: 'bg-adm-serious/18 text-adm-ink',
  critical: 'bg-adm-critical/12 text-adm-critical',
  info: 'bg-adm-s1/12 text-adm-s1',
} as const

export type Tone = keyof typeof TONES

export function Badge({ tone = 'neutral', children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span
      className={`inline-flex items-center gap-4 whitespace-nowrap rounded-full px-8 py-2 text-11 font-medium ${TONES[tone]}`}
    >
      {children}
    </span>
  )
}

/** Status colors never carry meaning alone — every badge ships with its label. */
export function StatusBadge({ status }: { status: string }) {
  const tone: Tone =
    status === 'active' || status === 'published' || status === 'resolved' || status === 'ok' || status === 'success'
      ? 'good'
      : status === 'suspended' || status === 'removed' || status === 'error' || status === 'denied' || status === 'critical'
        ? 'critical'
        : status === 'under_review' || status === 'in_review' || status === 'pending' || status === 'serious'
          ? 'serious'
          : status === 'open' || status === 'timeout' || status === 'refusal' || status === 'warning'
            ? 'warning'
            : 'neutral'
  return <Badge tone={tone}>{status.replace(/_/g, ' ')}</Badge>
}

/* --------------------------------------------------------------- StatCard */

interface StatCardProps {
  label: string
  value: string
  /** Percent change vs the prior period. */
  delta?: number
  /** true when a rise is bad (cost, errors, latency). */
  inverse?: boolean
  hint?: string
}

export function StatCard({ label, value, delta, inverse, hint }: StatCardProps) {
  const rising = (delta ?? 0) >= 0
  const good = inverse ? !rising : rising
  return (
    <div className="flex flex-col gap-6 rounded-10 border border-adm-line bg-adm-surface p-14">
      <span className="text-11 font-medium uppercase tracking-wider text-adm-muted">{label}</span>
      <span className="text-26 font-semibold tabular-nums leading-none text-adm-ink">{value}</span>
      <div className="flex items-center gap-6 text-12">
        {delta !== undefined && (
          <span className={`inline-flex items-center gap-2 tabular-nums ${good ? 'text-adm-good' : 'text-adm-critical'}`}>
            {rising ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {Math.abs(delta).toFixed(1)}%
          </span>
        )}
        {hint && <span className="text-adm-muted">{hint}</span>}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ Panel */

export function Panel({
  title,
  description,
  actions,
  children,
}: {
  title: string
  description?: string
  actions?: ReactNode
  children: ReactNode
}) {
  return (
    <section className="flex flex-col gap-14 rounded-10 border border-adm-line bg-adm-surface p-16">
      <div className="flex flex-wrap items-start justify-between gap-8">
        <div>
          <h2 className="text-15 font-semibold text-adm-ink">{title}</h2>
          {description && <p className="mt-2 text-12 text-adm-muted">{description}</p>}
        </div>
        {actions}
      </div>
      {children}
    </section>
  )
}

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string
  description: string
  actions?: ReactNode
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-12 border-b border-adm-line pb-16">
      <div>
        <h1 className="text-19 font-semibold text-adm-ink">{title}</h1>
        <p className="mt-4 max-w-[640px] text-13 text-adm-ink-2">{description}</p>
      </div>
      {actions}
    </div>
  )
}

/** Legend for a multi-series chart. Identity is never color-alone. */
export function Legend({ items }: { items: { label: string; color: string }[] }) {
  return (
    <div className="flex flex-wrap items-center gap-x-14 gap-y-4">
      {items.map((item) => (
        <span key={item.label} className="inline-flex items-center gap-6 text-12 text-adm-ink-2">
          <span className="size-8 rounded-2" style={{ background: item.color }} />
          {item.label}
        </span>
      ))}
    </div>
  )
}
