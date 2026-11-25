import { X } from 'lucide-react'
import { useEffect, useId, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

/**
 * The one right-side drawer of Admin → Reports (U129, J182): a click shows
 * the detail beside the page instead of leaving it. Portaled (a transformed
 * page would pin a fixed box to itself), modal, with focus kept inside while
 * it is open and given back on close. Escape, the overlay and the close
 * button all close it. Below `lg` it is a full-width sheet.
 */
export function Drawer({ open, title, kicker, onClose, footer, children }: { open: boolean; title: string; kicker?: string; onClose: () => void; footer?: ReactNode; children: ReactNode }) {
  const panel = useRef<HTMLDivElement>(null)
  const closeRef = useRef(onClose)
  const titleId = useId()

  useEffect(() => {
    closeRef.current = onClose
  }, [onClose])

  useEffect(() => {
    if (!open) return
    const before = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    panel.current?.querySelector<HTMLElement>('[data-drawer-close]')?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        closeRef.current()
        return
      }
      if (e.key !== 'Tab' || !panel.current) return
      const items = [...panel.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])')]
      if (!items.length) return
      const first = items[0]
      const last = items[items.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      } else if (!panel.current.contains(document.activeElement)) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = overflow
      before?.focus()
    }
  }, [open])

  if (!open) return null
  return createPortal(
    <div className="adm-root fixed inset-0 z-50 flex justify-end">
      <div aria-hidden="true" data-drawer-overlay className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative flex h-full w-full flex-col bg-adm-surface shadow-2xl lg:max-w-[460px]"
      >
        <div className="flex items-start justify-between gap-12 border-b border-adm-line px-16 py-14 lg:px-20">
          <div className="flex min-w-0 flex-col gap-2">
            {kicker && <span className="text-11 font-semibold uppercase tracking-wider text-adm-muted">{kicker}</span>}
            <h2 id={titleId} className="text-15 font-semibold text-adm-ink">
              {title}
            </h2>
          </div>
          <button
            type="button"
            aria-label="Close"
            data-drawer-close
            onClick={onClose}
            className="flex size-32 shrink-0 items-center justify-center rounded-8 text-adm-muted hover:bg-adm-hover hover:text-adm-ink focus-visible:outline-2 focus-visible:outline-adm-accent"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-14 overflow-y-auto px-16 py-14 lg:px-20">{children}</div>
        {footer && <div className="flex flex-wrap items-center gap-8 border-t border-adm-line px-16 py-12 lg:px-20">{footer}</div>}
      </div>
    </div>,
    document.body,
  )
}
