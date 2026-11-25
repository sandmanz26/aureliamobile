import { ArrowRight } from 'lucide-react'
import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Drawer } from '../../components/Drawer'
import { LABEL_MEANING, LABEL_TEXT, type SourceLabel } from '../../data/reportSources'
import { LabelBadge } from './ReportParts'
import { RichText } from './Term'

/*
 * One drawer for every click in Admin → Reports (U129, J182). A node, a
 * source, a decision, a report card or a tile opens a short summary here,
 * with its key numbers and labels, and "Open full page →" for whoever wants
 * the whole thing. The page underneath does not change.
 */

export interface DetailItem {
  kicker?: string
  title: string
  /** May carry `{{term|shown}}` glossary marks. */
  summary?: string
  numbers?: { label: string; value: string }[]
  labels?: SourceLabel[]
  /** A route, or `#id` for a section on this page. */
  to?: string
  toLabel?: string
  extra?: ReactNode
}

const Ctx = createContext<(item: DetailItem) => void>(() => {})

/** Opens the reports drawer with an item. */
export const useDetail = () => useContext(Ctx)

/** Scrolls to a section on this page, opening its closed <details> first. */
function goToSection(hash: string) {
  const el = document.getElementById(hash.slice(1))
  const det = el?.closest('details') ?? (el instanceof HTMLDetailsElement ? el : null)
  if (det) det.open = true
  el?.scrollIntoView({ block: 'start' })
}

function FullPageLink({ to, label, onClose }: { to: string; label: string; onClose: () => void }) {
  const aria = `Open full page: ${label}`
  const cls = 'inline-flex items-center gap-6 rounded-8 bg-adm-ink px-12 py-8 text-13 font-medium text-adm-surface hover:opacity-90'
  const text = (
    <>
      Open full page <ArrowRight size={14} aria-hidden="true" />
    </>
  )
  if (to.startsWith('#'))
    return (
      <a
        href={to}
        data-open-full
        aria-label={aria}
        className={cls}
        onClick={(e) => {
          e.preventDefault()
          onClose()
          window.setTimeout(() => goToSection(to), 0)
        }}
      >
        {text}
      </a>
    )
  return (
    <Link to={to} data-open-full aria-label={aria} className={cls}>
      {text}
    </Link>
  )
}

export function DetailDrawerProvider({ children }: { children: ReactNode }) {
  const [item, setItem] = useState<DetailItem | null>(null)
  const close = useCallback(() => setItem(null), [])
  return (
    <Ctx.Provider value={setItem}>
      {children}
      <Drawer
        open={!!item}
        title={item?.title ?? ''}
        kicker={item?.kicker}
        onClose={close}
        footer={
          item?.to ? (
            <>
              <FullPageLink to={item.to} label={item.toLabel ?? 'Open full page'} onClose={close} />
              {item.toLabel && <span className="text-12 text-adm-muted">{item.toLabel}</span>}
            </>
          ) : undefined
        }
      >
        {item && (
          <>
            {item.labels && item.labels.length > 0 && (
              <div className="flex flex-wrap gap-6">
                {item.labels.map((l) => (
                  <span key={l} title={LABEL_MEANING[l]}>
                    <LabelBadge label={l} />
                  </span>
                ))}
              </div>
            )}
            {item.summary && (
              <p className="text-13 leading-relaxed text-adm-ink-2">
                <RichText text={item.summary} />
              </p>
            )}
            {item.numbers && item.numbers.length > 0 && (
              <dl className="grid grid-cols-2 gap-8">
                {item.numbers.map((n) => (
                  <div key={n.label} className="flex min-w-0 flex-col gap-2 rounded-8 border border-adm-line bg-adm-bg p-10">
                    <dt className="text-11 text-adm-muted">
                      <RichText text={n.label} />
                    </dt>
                    <dd className="text-14 font-semibold break-words text-adm-ink">
                      <RichText text={n.value} />
                    </dd>
                  </div>
                ))}
              </dl>
            )}
            {item.extra}
            {item.labels && item.labels.length > 0 && (
              <ul className="flex flex-col gap-4 border-t border-adm-line pt-10 text-11 text-adm-muted">
                {item.labels.map((l) => (
                  <li key={l}>
                    <span className="font-semibold text-adm-ink-2">{LABEL_TEXT[l]}:</span> {LABEL_MEANING[l]}
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </Drawer>
    </Ctx.Provider>
  )
}
