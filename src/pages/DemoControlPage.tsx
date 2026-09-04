import { ExternalLink, RotateCcw } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useFeatureFlags } from '../demo/FeatureFlags'
import { DEMO_MODULES } from '../demo/modules'

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: (value: boolean) => void
  label: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative h-24 w-44 shrink-0 rounded-full transition-colors ${
        checked ? 'bg-brand-default' : 'bg-border-subtle'
      }`}
    >
      <span
        className={`absolute top-2 size-20 rounded-full bg-surface-default shadow-sm transition-all ${
          checked ? 'left-22' : 'left-2'
        }`}
      />
    </button>
  )
}

// Hidden presenter console (/__demo — not linked from anywhere in the app).
// Controls which modules a client can reach during a walkthrough. State lives
// in localStorage and syncs across tabs, so this can stay open on a second
// screen while the demo runs.
export function DemoControlPage() {
  const { flags, isEnabled, setFlag, setAll, reset } = useFeatureFlags()

  const activeCount = DEMO_MODULES.filter((mod) => isEnabled(mod.id)).length

  return (
    <div className="min-h-screen bg-background-default px-20 py-32 lg:px-48">
      <div className="mx-auto max-w-[860px]">
        <header className="flex flex-wrap items-end justify-between gap-16 border-b border-border-subtle pb-24">
          <div>
            <p className="text-style-caption uppercase tracking-widest text-text-secondary">Presenter console</p>
            <h1 className="text-style-headline mt-4 text-text-primary">Demo scope</h1>
            <p className="text-style-body-small mt-8 max-w-[520px] text-text-secondary">
              Choose what the client can reach. A module that is off stays visible in the navigation but cannot be
              clicked or opened by URL. {activeCount} of {DEMO_MODULES.length} modules active.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-8">
            <button
              type="button"
              onClick={() => setAll(true)}
              className="text-style-label rounded-full border border-border-subtle px-16 py-8 text-text-primary hover:bg-background-elevated"
            >
              Enable all
            </button>
            <button
              type="button"
              onClick={() => setAll(false)}
              className="text-style-label rounded-full border border-border-subtle px-16 py-8 text-text-primary hover:bg-background-elevated"
            >
              Disable all
            </button>
            <button
              type="button"
              onClick={reset}
              className="text-style-label flex items-center gap-6 rounded-full border border-border-subtle px-16 py-8 text-text-primary hover:bg-background-elevated"
            >
              <RotateCcw size={14} />
              Reset
            </button>
            <Link
              to="/home"
              className="text-style-label flex items-center gap-6 rounded-full bg-brand-default px-16 py-8 text-text-strong"
            >
              Open demo
              <ExternalLink size={14} />
            </Link>
          </div>
        </header>

        <div className="mt-24 flex flex-col gap-12">
          {DEMO_MODULES.map((mod) => {
            const on = flags[mod.id] !== false
            return (
              <section
                key={mod.id}
                className={`rounded-16 border border-border-subtle bg-surface-default p-20 transition-opacity ${
                  on ? '' : 'opacity-60'
                }`}
              >
                <div className="flex items-start justify-between gap-16">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-8">
                      <h2 className="text-style-body font-semibold text-text-primary">{mod.label}</h2>
                      {mod.route && (
                        <code className="text-style-caption rounded-full bg-background-elevated px-8 py-2 text-text-secondary">
                          {mod.route}
                        </code>
                      )}
                      {!mod.built && (
                        <span className="text-style-caption rounded-full bg-background-elevated px-8 py-2 text-text-secondary">
                          not built
                        </span>
                      )}
                    </div>
                    <p className="text-style-body-small mt-4 text-text-secondary">{mod.description}</p>
                  </div>
                  <Toggle checked={on} onChange={(value) => setFlag(mod.id, value)} label={`Enable ${mod.label}`} />
                </div>

                {mod.features && (
                  <div className="mt-16 flex flex-col gap-2 border-t border-border-subtle pt-16">
                    {mod.features.map((feature) => {
                      const key = `${mod.id}.${feature.id}`
                      return (
                        <div
                          key={key}
                          className={`flex items-center justify-between gap-16 rounded-12 px-12 py-10 ${
                            on ? '' : 'pointer-events-none opacity-50'
                          }`}
                        >
                          <div className="min-w-0">
                            <p className="text-style-body-small text-text-primary">{feature.label}</p>
                            <p className="text-style-caption text-text-secondary">{feature.description}</p>
                          </div>
                          <Toggle
                            checked={flags[key] !== false}
                            onChange={(value) => setFlag(key, value)}
                            label={`Enable ${feature.label}`}
                          />
                        </div>
                      )
                    })}
                  </div>
                )}
              </section>
            )
          })}
        </div>

        <p className="text-style-caption mt-24 text-text-secondary">
          This page is unlisted — reachable only at <code>/__demo</code>. It is a presentation aid, not access control:
          anyone who knows the URL can change the scope.
        </p>
      </div>
    </div>
  )
}
