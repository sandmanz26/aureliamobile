import { ChevronRight, Coins, Menu, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useDrawer } from '../layouts/DrawerContext'
import type { SignalGroup } from '../lib/signals'
import { SIGNAL_GROUPS, defaultConnections, sourcesInGroup } from '../lib/signals'

/**
 * My Wellness — what Aurelia is allowed to read about you.
 *
 * Every other screen spends signals; this is the only one that shows what they
 * are and lets you take them back. So the counts are not decoration: the "4 of
 * 6" and the three meters are computed from the switches below them, and moving
 * any switch moves them. A summary that could disagree with the controls under
 * it would be worse than no summary.
 */

/** Aurelia's mark, as it appears on the request sheet. */
function SpiralMark({ size = 64 }: { size?: number }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} role="presentation" aria-hidden="true" focusable="false">
      <g fill="none" stroke="#FF9A1F" strokeLinecap="round">
        <path d="M32 8a24 24 0 1 1-17 41" strokeWidth="5" />
        <path d="M32 18a14 14 0 1 1-10 24" strokeWidth="4.5" opacity="0.85" />
        <path d="M32 27a5.5 5.5 0 1 1-4 9.4" strokeWidth="4" opacity="0.7" />
      </g>
    </svg>
  )
}

/** The switch on every source row. */
function Switch({ on, onChange, label }: { on: boolean; onChange: (next: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => onChange(!on)}
      className={`u-press relative h-30 w-52 shrink-0 rounded-full transition-colors ${
        on ? 'bg-icon-strong' : 'bg-background-elevated'
      }`}
    >
      <span
        className={`absolute top-3 size-24 rounded-full bg-surface-default shadow-sm transition-all ${
          on ? 'left-25' : 'left-3'
        }`}
      />
    </button>
  )
}

/** Share of a group's sources that are connected. */
function Meter({ label, connected, total }: { label: string; connected: number; total: number }) {
  const share = total === 0 ? 0 : connected / total
  return (
    <div className="flex items-center gap-10">
      <span className="text-style-body-small w-[84px] shrink-0 text-text-secondary">{label}</span>
      <span className="h-8 min-w-0 flex-1 overflow-hidden rounded-full" style={{ background: '#FBE7D2' }}>
        <span
          className="block h-full rounded-full transition-[width] duration-300"
          style={{
            // No minimum width: a group with nothing connected must read as
            // empty, not as a sliver that suggests something is on.
            width: `${share * 100}%`,
            background: 'linear-gradient(90deg, #FFB25E, #FF881B)',
          }}
        />
      </span>
      <span className="text-style-caption w-[30px] shrink-0 text-right tabular-nums text-text-secondary">
        {connected}/{total}
      </span>
    </div>
  )
}

export function WellnessPage() {
  const { openDrawer } = useDrawer()
  const [connections, setConnections] = useState(defaultConnections)
  const [requestOpen, setRequestOpen] = useState(false)

  const active = Object.values(connections).filter(Boolean).length
  const total = Object.keys(connections).length

  const countIn = (group: SignalGroup) => sourcesInGroup(group).filter((source) => connections[source.id]).length

  return (
    <div className="bg-background-default pb-48">
      <div className="flex items-center justify-between gap-12 px-20 py-16 lg:px-24">
        <div className="flex min-w-0 items-center gap-8">
          <button
            type="button"
            aria-label="Open menu"
            onClick={openDrawer}
            className="u-press flex size-40 shrink-0 items-center justify-center rounded-full bg-surface-default text-icon-strong shadow-sm lg:hidden"
          >
            <Menu size={20} />
          </button>
          <h1 className="text-style-title-large truncate text-text-primary">My Wellness</h1>
        </div>
        <div className="flex h-40 shrink-0 items-center gap-8 rounded-full bg-surface-default px-14 shadow-sm">
          <span
            className="flex size-16 items-center justify-center rounded-full"
            style={{ background: 'linear-gradient(160deg, #ffe682, #ff881b)' }}
          >
            <Coins size={10} className="text-text-inverse" />
          </span>
          <span className="text-style-label">1,323</span>
        </div>
      </div>

      <div className="mx-auto w-full max-w-[402px] px-20 lg:max-w-[720px] lg:px-24">
        {/* Summary. Everything here is derived from the switches below. */}
        <section className="rounded-20 bg-surface-default p-20 shadow-sm">
          <div className="flex flex-col gap-16 min-[380px]:flex-row min-[380px]:items-center min-[380px]:gap-16">
            <div className="shrink-0">
              <h2 className="text-style-body font-semibold text-text-primary">Active Signals</h2>
              <p className="mt-4">
                <span className="text-style-headline text-text-primary">{active}</span>
                <span className="text-style-body-small ml-6 text-text-secondary">/ {total} Sources</span>
              </p>
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-8">
              {SIGNAL_GROUPS.map((group) => (
                <Meter
                  key={group}
                  label={group}
                  connected={countIn(group)}
                  total={sourcesInGroup(group).length}
                />
              ))}
            </div>
          </div>
        </section>

        {SIGNAL_GROUPS.map((group) => (
          <section key={group} className="mt-24">
            <h2 className="text-style-body-small px-4 text-text-secondary">{group}</h2>
            <div className="mt-8 flex flex-col gap-10">
              {sourcesInGroup(group).map((source) => {
                const Icon = source.icon
                const on = connections[source.id]
                return (
                  <div
                    key={source.id}
                    className="flex items-center gap-12 rounded-16 bg-surface-default p-12 shadow-sm"
                  >
                    <span
                      className="flex size-36 shrink-0 items-center justify-center rounded-full text-icon-strong"
                      style={{ background: '#FDF0E2' }}
                    >
                      <Icon size={17} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="text-style-body block truncate text-text-primary">{source.name}</span>
                      {/* What it reads, on the row: consent means nothing if the
                          thing being consented to is a page away. */}
                      <span className="text-style-caption block truncate text-text-secondary">{source.reads}</span>
                    </span>
                    <Switch
                      on={on}
                      onChange={(next) => setConnections((prev) => ({ ...prev, [source.id]: next }))}
                      label={`${on ? 'Disconnect' : 'Connect'} ${source.name}`}
                    />
                  </div>
                )
              })}
            </div>
          </section>
        ))}

        <button
          type="button"
          onClick={() => setRequestOpen(true)}
          className="u-press mt-24 flex w-full items-center gap-12 rounded-16 bg-surface-default p-12 text-left shadow-sm"
        >
          <span
            aria-hidden="true"
            className="text-style-label flex size-36 shrink-0 items-center justify-center rounded-full font-bold text-text-inverse"
            style={{ background: '#FF881B' }}
          >
            !
          </span>
          <span className="min-w-0 flex-1">
            <span className="text-style-body block text-text-primary">Don’t see your favorite device or app?</span>
            <span className="text-style-caption block text-text-secondary">Tell us what you’d like to see next!</span>
          </span>
          <ChevronRight size={18} className="shrink-0 text-icon-secondary" />
        </button>
      </div>

      {requestOpen && <RequestSheet onClose={() => setRequestOpen(false)} />}
    </div>
  )
}

/** Ask for a source Aurelia does not support yet. */
function RequestSheet({ onClose }: { onClose: () => void }) {
  const [value, setValue] = useState('')
  const [sent, setSent] = useState<string | null>(null)

  // Escape closes it. A sheet that can only be dismissed by hitting a 32px X
  // or the strip of backdrop above it is a trap on a keyboard.
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  function submit(event: React.FormEvent) {
    event.preventDefault()
    const name = value.trim()
    if (!name) return
    setSent(name)
  }

  return (
    <div className="u-fade fixed inset-0 z-50 flex items-end justify-center bg-icon-strong/40" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Request a device or app"
        className="u-sheet relative flex w-full max-w-[402px] flex-col items-center gap-20 rounded-t-24 bg-surface-default px-24 pb-32 pt-40"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="u-press absolute right-20 top-20 flex size-32 items-center justify-center rounded-full text-icon-strong"
        >
          <X size={20} />
        </button>

        <SpiralMark />

        {sent ? (
          <>
            <div className="flex flex-col gap-8 text-center">
              <h2 className="text-style-title text-text-primary">Thanks — that’s logged.</h2>
              <p className="text-style-body-small text-text-secondary">
                We’ll let you know if {sent} becomes a source you can connect.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-style-body u-press w-full rounded-full bg-icon-strong py-16 text-center font-semibold text-text-inverse"
            >
              Done
            </button>
          </>
        ) : (
          <>
            <div className="flex flex-col gap-8 text-center">
              <h2 className="text-style-title text-balance text-text-primary">
                Don’t see your favorite device or app?
              </h2>
              <p className="text-style-body-small text-text-secondary">Tell us what you’d like to see next!</p>
            </div>

            <form onSubmit={submit} className="flex w-full flex-col gap-16">
              <input
                autoFocus
                value={value}
                onChange={(event) => setValue(event.target.value)}
                placeholder="E.g. Garmin"
                aria-label="Device or app name"
                className="text-style-body h-52 w-full rounded-full border border-border-default bg-surface-default px-20 text-text-primary outline-none placeholder:text-text-secondary focus:border-brand-emphasis"
              />
              <button
                type="submit"
                disabled={!value.trim()}
                className="text-style-body u-press w-full rounded-full bg-icon-strong py-16 text-center font-semibold text-text-inverse disabled:opacity-40"
              >
                Send
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
