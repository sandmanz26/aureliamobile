import { Info } from 'lucide-react'
import type { ReactNode } from 'react'

/*
 * A small (i) that opens its explanation on hover or focus (U127, J180), so
 * the Business funnel shows numbers and keeps the prose one step away.
 * `align` picks which edge the popover hangs from, so it stays on screen.
 */
export function InfoTip({ label, children, align = 'left' }: { label: string; children: ReactNode; align?: 'left' | 'right' }) {
  return (
    <span className="group relative inline-flex align-middle">
      <button type="button" aria-label={label} className="inline-flex size-18 items-center justify-center rounded-full text-adm-muted hover:text-adm-ink focus-visible:text-adm-ink">
        <Info size={13} aria-hidden="true" />
      </button>
      <span
        role="tooltip"
        className={`absolute top-full z-30 mt-4 hidden w-[260px] max-w-[calc(100vw-48px)] flex-col gap-6 rounded-8 border border-adm-line bg-adm-surface p-10 text-left text-12 leading-[17px] font-normal normal-case tracking-normal text-adm-ink-2 shadow-sm group-focus-within:flex group-hover:flex ${align === 'right' ? 'right-0' : 'left-0'}`}
      >
        {children}
      </span>
    </span>
  )
}
