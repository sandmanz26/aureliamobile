import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { ChevronDown, Sparkles, X } from 'lucide-react'
import { UI_VERSIONS, VERSIONS_ENABLED, readVersion, storeVersion } from './versions'

/**
 * Staging-only picker for the design versions in `versions.ts`.
 *
 * Choosing a version never applies straight away: a dialog first lists what
 * changes, so whoever is reviewing knows what to look for before the screen
 * moves under them. Renders nothing on production.
 */
export function VersionSwitcher({ dark = false }: { dark?: boolean }) {
  const [current, setCurrent] = useState(readVersion)
  const [pending, setPending] = useState<number | null>(null)

  useEffect(() => {
    const sync = () => setCurrent(readVersion())
    window.addEventListener('aurelia:ui-version', sync)
    return () => window.removeEventListener('aurelia:ui-version', sync)
  }, [])

  if (!VERSIONS_ENABLED) return null
  const target = UI_VERSIONS.find((v) => v.id === pending)

  return (
    <>
      <label
        className={`text-style-caption relative flex items-center gap-4 rounded-full border px-8 py-2 leading-none ${
          dark ? 'border-white/20 text-white/80' : 'border-black/15 text-text-primary'
        }`}
      >
        <span className="sr-only">Design version</span>
        <select
          value={current}
          onChange={(e) => setPending(Number(e.target.value))}
          className="cursor-pointer appearance-none bg-transparent pr-12 outline-none"
        >
          {UI_VERSIONS.map((v) => (
            <option key={v.id} value={v.id} className="text-black">
              v{v.id}
            </option>
          ))}
        </select>
        <ChevronDown size={10} className="pointer-events-none absolute right-6" />
      </label>

      {target &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-20 u-fade"
            onClick={() => setPending(null)}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="version-title"
              onClick={(e) => e.stopPropagation()}
              className="u-pop w-full max-w-[440px] rounded-24 bg-surface-default p-24 text-left shadow-[0_24px_64px_-16px_rgba(27,16,6,0.35)]"
            >
              <div className="flex items-start justify-between gap-16">
                <div>
                  <p className="text-style-caption flex items-center gap-6 text-text-brand">
                    <Sparkles size={12} /> Switch from v{current} to v{target.id}
                  </p>
                  <h2 id="version-title" className="text-style-title-large mt-6 text-text-primary">
                    What changes in {target.name}
                  </h2>
                  <p className="text-style-body-small mt-4 text-text-secondary">{target.summary}</p>
                </div>
                <button
                  type="button"
                  aria-label="Close"
                  onClick={() => setPending(null)}
                  className="u-press u-tap text-icon-secondary"
                >
                  <X size={18} />
                </button>
              </div>

              <ul className="mt-16 flex flex-col gap-8">
                {target.changes.map((c) => (
                  <li key={c} className="text-style-body-small flex gap-8 text-text-primary">
                    <span aria-hidden="true" className="mt-7 size-6 shrink-0 rounded-full bg-brand-default" />
                    {c}
                  </li>
                ))}
              </ul>

              <p className="text-style-caption mt-16 text-text-secondary">
                Staging only, saved in this browser. Production is not affected.
              </p>

              <div className="mt-20 flex justify-end gap-8">
                <button
                  type="button"
                  onClick={() => setPending(null)}
                  className="text-style-body-small u-press h-40 rounded-full border border-button-secondary-border px-16 text-text-primary"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    storeVersion(target.id)
                    setCurrent(target.id)
                    setPending(null)
                  }}
                  className="text-style-body-small u-press h-40 rounded-full bg-interactive-primary px-16 text-text-inverse"
                >
                  Switch to v{target.id}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  )
}
