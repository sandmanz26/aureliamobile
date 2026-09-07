import { CloudOff, CloudUpload, ExternalLink, RotateCcw, Undo2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useFeatureFlags } from '../demo/FeatureFlags'
import type { ModuleKind } from '../demo/modules'
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
  const { flags, isEnabled, setFlag, setAll, reset, publish, revertToPublished, sync, dirty, publishing, lastPublishedAt } =
    useFeatureFlags()

  const activeCount = DEMO_MODULES.filter((mod) => isEnabled(mod.id)).length

  return (
    <div className="min-h-screen bg-background-default px-20 py-32 lg:px-48">
      <div className="mx-auto max-w-[860px]">
        <header className="flex flex-wrap items-end justify-between gap-16 border-b border-border-subtle pb-24">
          <div>
            <p className="text-style-caption uppercase tracking-widest text-text-secondary">Presenter console</p>
            <h1 className="text-style-headline mt-4 text-text-primary">Demo scope</h1>
            <p className="text-style-body-small mt-8 max-w-[560px] text-text-secondary">
              Choose what the client can reach in today’s walkthrough. A module that is off stays visible in the
              navigation but cannot be clicked or opened by URL. {activeCount} of {DEMO_MODULES.length} modules active.
            </p>
            <p className="text-style-caption mt-8 max-w-[560px] text-text-secondary">
              This console is a presentation aid — it is not part of the product and would not ship. The back office
              below <em>is</em> part of the product: it is a feature being demonstrated, not a control over the demo.
            </p>

            <div className="text-style-caption mt-12 flex flex-wrap items-center gap-x-10 gap-y-4">
              {sync === 'loading' && <span className="text-text-secondary">Checking shared config…</span>}
              {sync === 'synced' && (
                <>
                  <span className="inline-flex items-center gap-4 text-success-600">
                    <span className="size-6 rounded-full bg-success-600" />
                    Shared config connected
                  </span>
                  <span className="text-text-secondary">
                    {dirty
                      ? 'You have unpublished changes — only this browser sees them.'
                      : 'Everyone opening the site sees this scope.'}
                  </span>
                  {lastPublishedAt && (
                    <span className="text-text-secondary">
                      Last published {new Date(lastPublishedAt).toLocaleTimeString()}
                    </span>
                  )}
                </>
              )}
              {sync === 'local-only' && (
                <span className="inline-flex items-center gap-4 text-text-secondary">
                  <CloudOff size={13} />
                  This browser only — connect a KV store in Vercel to share the scope across devices.
                </span>
              )}
              {sync === 'error' && <span className="text-danger-600">Publish failed — changes stayed local.</span>}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-8">
            {dirty && (
              <button
                type="button"
                onClick={revertToPublished}
                className="text-style-label flex items-center gap-6 rounded-full border border-border-subtle px-16 py-8 text-text-primary hover:bg-background-elevated"
              >
                <Undo2 size={14} />
                Discard changes
              </button>
            )}
            <button
              type="button"
              onClick={() => void publish()}
              disabled={publishing || sync === 'local-only'}
              title={sync === 'local-only' ? 'No shared store connected — see the note below' : undefined}
              className="text-style-label flex items-center gap-6 rounded-full bg-icon-strong px-16 py-8 text-text-inverse disabled:opacity-40"
            >
              <CloudUpload size={14} />
              {publishing ? 'Publishing…' : dirty ? 'Publish for everyone' : 'Published'}
            </button>
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
              to="/admin"
              className="text-style-label flex items-center gap-6 rounded-full border border-border-subtle px-16 py-8 text-text-primary hover:bg-background-elevated"
            >
              Open back office
              <ExternalLink size={14} />
            </Link>
            <Link
              to="/home"
              className="text-style-label flex items-center gap-6 rounded-full bg-brand-default px-16 py-8 text-text-strong"
            >
              Open app
              <ExternalLink size={14} />
            </Link>
          </div>
        </header>

        {(['consumer', 'admin'] as ModuleKind[]).map((kind) => (
        <section key={kind} className="mt-24 flex flex-col gap-12">
          <div className="flex items-baseline gap-8">
            <h2 className="text-style-body font-semibold text-text-primary">
              {kind === 'consumer' ? 'Consumer app' : 'Back office'}
            </h2>
            <span className="text-style-caption text-text-secondary">
              {kind === 'consumer'
                ? 'What an end user sees.'
                : 'The operator admin at /admin — a product feature, shown like any other screen.'}
            </span>
          </div>
          {DEMO_MODULES.filter((m) => m.kind === kind).map((mod) => {
            const on = flags[mod.id] !== false
            return (
              <div
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
              </div>
            )
          })}
        </section>
        ))}

        <p className="text-style-caption mt-24 text-text-secondary">
          This page is unlisted — reachable only at <code>/__demo</code>. It is a presentation aid, not access control:
          the endpoint behind Publish is unauthenticated, so anyone who knows this URL can change what the demo shows.
          Fine for a walkthrough; put it behind auth before it guards anything that matters.
        </p>
      </div>
    </div>
  )
}
