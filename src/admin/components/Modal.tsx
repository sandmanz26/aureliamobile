import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

/**
 * The one dialog chrome for the admin CMS — create/edit forms (Challenges,
 * Sessions, Users) all open through this rather than each page building its
 * own overlay. Portaled to `document.body` for the same reason
 * `DeleteAccountDialog` is in `AccountSettingsPage.tsx`: `.u-page`'s
 * transform would otherwise become the containing block for a `fixed`
 * overlay and pin it to the page box instead of the viewport. The admin
 * shell doesn't use `.u-page`, but the pattern costs nothing to keep and
 * saves re-deriving it the day it does.
 */
export function Modal({
  title,
  description,
  onClose,
  children,
  width = 480,
}: {
  title: string
  description?: string
  onClose: () => void
  children: ReactNode
  width?: number
}) {
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-16" onClick={onClose}>
      <div
        onClick={(event) => event.stopPropagation()}
        style={{ maxWidth: width }}
        className="flex max-h-[85vh] w-full flex-col rounded-16 bg-adm-surface shadow-xl"
      >
        <div className="flex items-start justify-between gap-12 border-b border-adm-line px-20 py-16">
          <div>
            <h2 className="text-15 font-semibold text-adm-ink">{title}</h2>
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
      </div>
    </div>,
    document.body,
  )
}
