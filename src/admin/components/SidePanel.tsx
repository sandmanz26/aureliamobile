import { X } from 'lucide-react'
import { useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

/**
 * A panel that slides in from the right and leaves the page visible beside
 * it, for editing one item of a larger view (U092: the user journey's
 * moments). Portaled for the same reason as Modal. The footer stays in view
 * while the body scrolls.
 */
export function SidePanel({
  title,
  description,
  onClose,
  footer,
  children,
}: {
  title: string
  description?: string
  onClose: () => void
  footer?: ReactNode
  children: ReactNode
}) {
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return createPortal(
    <div className="fixed inset-0 z-50 flex justify-end bg-black/25" onClick={onClose}>
      <aside
        role="dialog"
        aria-label={title}
        onClick={(event) => event.stopPropagation()}
        className="flex h-full w-full max-w-[480px] flex-col bg-adm-surface shadow-2xl"
      >
        <div className="flex items-start justify-between gap-12 border-b border-adm-line px-20 py-16">
          <div className="min-w-0">
            <h2 className="truncate text-15 font-semibold text-adm-ink">{title}</h2>
            {description && <p className="mt-2 text-12 text-adm-muted">{description}</p>}
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="flex size-28 shrink-0 items-center justify-center rounded-8 text-adm-muted hover:bg-adm-hover hover:text-adm-ink"
          >
            <X size={16} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-20 py-16">{children}</div>
        {footer && <div className="flex flex-wrap items-center gap-8 border-t border-adm-line px-20 py-12">{footer}</div>}
      </aside>
    </div>,
    document.body,
  )
}
