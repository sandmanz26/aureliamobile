import { ChevronDown, ChevronRight, ChevronUp, Play } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import sessionThumb from '../../assets/session-thumb.png'

/** Placeholder until there's a brief/changes history to compose a real one
 *  from — close enough in length and tone to stand in for it meanwhile. */
const PLACEHOLDER_REASON =
  "This track uses decelerating musical tempos and chaotic word patterns to mimic the brain's natural pre-sleep state."

interface SessionReasoningCardProps {
  title: string
  status: string
  /** Where the artwork plays to. Left out while there's nothing to play yet. */
  to?: string
  by?: string
}

/**
 * The "ready" result, under its own collapsible "Reasoning" — Aurelia's
 * account of what it built, rather than the session just landing with
 * nothing said about it. Closed by default; the session itself is what most
 * people want to see first, the reasoning is for whoever asks why.
 */
export function SessionReasoningCard({ title, status, to, by }: SessionReasoningCardProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="flex w-full flex-col gap-12">
      <div className="flex items-center gap-8">
        <span className="text-style-body-small text-text-primary">Here it is:</span>
        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          aria-expanded={open}
          className="u-press flex items-center gap-4 rounded-full border border-border-default px-12 py-6 text-style-label text-text-primary"
        >
          Reasoning
          {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      {open && (
        <p className="text-style-body-small border-l-2 border-border-default py-2 pl-12 text-text-secondary">
          {PLACEHOLDER_REASON}
        </p>
      )}

      <div className="flex items-center gap-12 rounded-16 bg-surface-default p-12 shadow-[0_5px_24px_4px_rgba(0,0,0,0.05)]">
        {to ? (
          <Link
            to={to}
            state={{ origin: 'own', ...(by ? { as: { title, author: by } } : {}) }}
            aria-label={`Play ${title}`}
            className="u-press relative shrink-0"
          >
            <img src={sessionThumb} alt="" className="size-54 rounded-full object-cover" />
            <span className="absolute inset-0 flex items-center justify-center text-text-inverse">
              <Play size={20} fill="currentColor" />
            </span>
          </Link>
        ) : (
          <div className="relative shrink-0">
            <img src={sessionThumb} alt="" className="size-54 rounded-full object-cover" />
            <span className="absolute inset-0 flex items-center justify-center text-text-inverse">
              <Play size={20} fill="currentColor" />
            </span>
          </div>
        )}

        <div className="min-w-0 flex-1">
          <p className="text-style-body-small truncate text-text-primary">{title}</p>
          <p className="text-style-caption truncate text-text-secondary">{status}</p>
        </div>

        <ChevronRight size={19} className="shrink-0 text-icon-default" />
      </div>
    </div>
  )
}
