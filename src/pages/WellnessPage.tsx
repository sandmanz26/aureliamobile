import { createPortal } from 'react-dom'
import { ChartPie, ChevronRight, Link2, Menu, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageMeta } from '../components/PageMeta'
import { WellnessObjectiveCard } from '../components/wellness/WellnessObjectiveCard'
import { AnalyticsSessionCard } from '../components/wellness/AnalyticsSessionCard'
import { ANALYSES } from '../lib/wellnessAnalysis'
import { useUiVersion } from '../versions/useUiVersion'
import { useDrawer } from '../layouts/DrawerContext'
import type { SignalGroup } from '../lib/signals'
import { SIGNAL_GROUPS, defaultConnections, sourcesInGroup } from '../lib/signals'
import { CARD_SHADOW } from '../lib/shadows'
import { WELLNESS_GOALS } from '../lib/wellnessGoals'
import { CoinPill } from '../components/ui/CoinPill'

type WellnessTab = 'Analytics' | 'Connect'

/** The tab pill above the tab content — a standalone button per option
 *  (dark fill when active, outline when not), not the shared
 *  `SegmentedControl` (which puts both options inside one shared-background
 *  track): the frame draws these as two separate pills with visible gaps
 *  and their own icons, a different component, not a themed variant of it. */
function WellnessTabButton({
  active,
  icon,
  label,
  onClick,
}: {
  active: boolean
  icon: React.ReactNode
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`u-press flex h-40 shrink-0 items-center gap-8 rounded-12 border px-16 text-style-label transition-colors ${
        active
          ? 'border-interactive-primary bg-interactive-primary text-text-inverse'
          : 'border-border-subtle bg-surface-default text-text-primary'
      }`}
    >
      {icon}
      {label}
    </button>
  )
}

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


/**
 * The switch on every source row — Figma ".switch" (16523:14071).
 *
 * 40x22 with 2 of padding all round, which leaves an 18px knob. The on state
 * is the ink token rather than black: `bg-icon-strong` is #000 and read as a
 * harder, colder switch than the frame's #3C2405. Off is #E5E5E5, a step
 * darker than `background-elevated`, so a disconnected source still reads as a
 * control rather than as empty space.
 */
function Switch({ on, onChange, label }: { on: boolean; onChange: (next: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => onChange(!on)}
      className={`u-press relative h-22 w-40 shrink-0 rounded-full transition-colors ${
        on ? 'bg-text-primary' : 'bg-[#e5e5e5]'
      }`}
    >
      <span
        className={`absolute top-2 size-18 rounded-full bg-surface-default transition-all ${
          on ? 'left-20' : 'left-2'
        }`}
      />
    </button>
  )
}

/** Share of a group's sources that are connected. */
function Meter({ label, connected, total }: { label: string; connected: number; total: number }) {
  const share = total === 0 ? 0 : connected / total
  return (
    <div
      className="flex items-center gap-10"
      role="img"
      aria-label={`${label}: ${connected} of ${total} connected`}
    >
      {/* 96, not 84: "Atmospheric" at 14 is wider than 84 in Mulish, and the
          two clients failed at it differently — CSS will not break a single
          word, so this column overflowed silently here while Flutter wrapped
          it mid-word. The width is shared across the three labels so the bars
          line up, which is why it cannot simply hug its content. */}
      <span className="text-style-body-small w-[96px] shrink-0 text-text-secondary">{label}</span>
      <span className="h-6 min-w-0 flex-1 overflow-hidden rounded-full" style={{ background: '#FBE7D2' }}>
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
    </div>
  )
}

export function WellnessPage() {
  const { openDrawer } = useDrawer()
  const navigate = useNavigate()
  // v4 (U050): nothing is connected until the person connects it. J039 found
  // Apple Watch, Google Calendar and Conversation History switched on for a
  // brand-new account — read as a privacy breach by the people it mattered
  // most to (a therapist-referred user, a skeptic).
  const v4 = useUiVersion() >= 4
  const [connections, setConnections] = useState(() => defaultConnections(v4))
  const [requestOpen, setRequestOpen] = useState(false)
  const [tab, setTab] = useState<WellnessTab>('Analytics')
  const [requestSent, setRequestSent] = useState(false)
  // v2+ (U039): Analytics is the Figma "My Wellness/Analytics" list — one
  // card per session with its progress, opening the full analysis. v1 keeps
  // the expandable objective cards it had.
  const v2 = useUiVersion() >= 2
  // The first goal opens by default, same reasoning as My Wellness always
  // showing signal state rather than a blank list — the tab should not
  // read as empty on first visit.
  const [openGoalId, setOpenGoalId] = useState<string | null>(WELLNESS_GOALS[0]?.id ?? null)

  const active = Object.values(connections).filter(Boolean).length
  const total = Object.keys(connections).length

  const countIn = (group: SignalGroup) => sourcesInGroup(group).filter((source) => connections[source.id]).length

  return (
    <div className="bg-background-default pb-48">
      <PageMeta
        title="My Wellness"
        description="Track what's helping your goals progress, and the signal sources Aurelia may read to figure that out."
      />
      <header className="u-sticky-top flex items-center justify-between gap-12 px-20 py-16 lg:px-24">
        <div className="flex min-w-0 items-center gap-8">
          <button
            type="button"
            aria-label="Open menu"
            onClick={openDrawer}
            className="u-press flex size-44 shrink-0 items-center justify-center rounded-12 bg-surface-default text-icon-default shadow-sm lg:hidden"
          >
            <Menu size={20} />
          </button>
          <h1 className="text-style-title-large truncate text-text-primary">My Wellness</h1>
        </div>
        <CoinPill points="1,323" className="shadow-sm" />
      </header>

      <div className="mx-auto w-full max-w-[402px] px-20 lg:max-w-[960px] lg:px-24">
        <div className="flex gap-8">
          <WellnessTabButton
            active={tab === 'Analytics'}
            icon={<ChartPie size={16} />}
            label="Analytics"
            onClick={() => setTab('Analytics')}
          />
          <WellnessTabButton
            active={tab === 'Connect'}
            icon={<Link2 size={16} />}
            label="Connect"
            onClick={() => setTab('Connect')}
          />
        </div>

        {tab === 'Analytics' && v2 && (
          <div className="mt-24 flex flex-col gap-12 lg:grid lg:grid-cols-2 lg:gap-16">
            {ANALYSES.map((analysis) => (
              <AnalyticsSessionCard key={analysis.id} analysis={analysis} />
            ))}
          </div>
        )}

        {tab === 'Analytics' && !v2 && (
          <div className="mt-24 flex flex-col gap-16">
            {WELLNESS_GOALS.map((goal) => (
              <WellnessObjectiveCard
                key={goal.id}
                goal={goal}
                expanded={openGoalId === goal.id}
                onToggle={() => setOpenGoalId((current) => (current === goal.id ? null : goal.id))}
                // Same hand-off Home's own ask box uses: land in the cockpit
                // with the question already asked, rather than a blank
                // thread the user has to explain themselves into again.
                onAnalyze={() =>
                  navigate('/chat', { state: { ask: `Can you analyze my current state for "${goal.title}"?` } })
                }
                onSecondaryAction={() => navigate('/chat', { state: { ask: goal.secondaryAction } })}
              />
            ))}
          </div>
        )}

        {tab === 'Connect' && (
          <>
        {/* Summary. Everything here is derived from the switches below. */}
        <section className="mt-24 rounded-24 bg-surface-default p-16 shadow-sm">
          <div className="flex flex-col gap-16 min-[380px]:flex-row min-[380px]:items-center min-[380px]:gap-16">
            <div className="shrink-0">
              <h2 className="text-style-body font-semibold text-text-primary">Active Signals</h2>
              <p className="mt-4">
                <span className="text-style-headline text-text-primary">{active}</span>
                <span className="text-style-body-small ml-6 text-text-secondary">/ {total} Sources</span>
              </p>
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-6">
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
            {/* 14/14 Light in #9A9A9A — a quieter grey than the secondary ink
                token, and no side inset: the frame lines the label up with the
                cards under it. */}
            <h2 className="text-[14px] font-light! leading-[14px] text-[#9a9a9a]">{group}</h2>
            <div className="mt-12 flex flex-col gap-12">
              {sourcesInGroup(group).map((source) => {
                const Icon = source.icon
                const on = connections[source.id]
                return (
                  <div
                    key={source.id}
                    /* 362x56 in the frame: radius 20, 16 either side, 12 top
                       and bottom. The height is held so a long source name
                       cannot grow the row past its neighbours. */
                    className={`flex h-56 items-center gap-12 overflow-hidden rounded-[20px] bg-surface-default px-16 ${CARD_SHADOW}`}
                  >
                    <span
                      className="flex size-32 shrink-0 items-center justify-center rounded-full text-icon-strong"
                      style={{ background: '#FFF1DB' }}
                    >
                      <Icon size={16} />
                    </span>
                    <span className="text-style-body min-w-0 flex-1 truncate text-text-primary">
                      {source.name}
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
          className={`u-press mt-24 flex w-full items-center gap-12 rounded-[20px] bg-surface-default px-16 py-18 text-left ${CARD_SHADOW}`}
        >
          <span
            aria-hidden="true"
            className="text-style-label flex size-32 shrink-0 items-center justify-center rounded-full font-bold text-text-inverse"
            style={{ background: '#FF881B' }}
          >
            !
          </span>
          <span className="min-w-0 flex-1">
            <span className="text-style-body-small block font-medium text-text-primary">
              Don’t see your favorite device or app?
            </span>
            <span className="text-style-caption block text-text-secondary">Tell us what you’d like to see next!</span>
          </span>
          <ChevronRight size={18} className="shrink-0 text-icon-secondary" />
        </button>
          </>
        )}
      </div>

      {requestOpen && (
        <RequestSheet
          onClose={() => setRequestOpen(false)}
          onSent={() => {
            setRequestOpen(false)
            setRequestSent(true)
          }}
        />
      )}
      {requestSent && <RequestSentToast onClose={() => setRequestSent(false)} />}
    </div>
  )
}

/** Figma "send-2" (16883:10061), 64px, the success glyph on the toast. */
function SentMark() {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <path
        opacity="0.4"
        d="M18.9597 15.8928L43.0131 7.8661C53.8131 4.2661 59.6797 10.1594 56.1064 20.9594L48.0797 45.0128C42.6931 61.1994 33.8397 61.1994 28.4531 45.0128L26.0797 37.8661L18.9331 35.4928C2.77308 30.1328 2.77308 21.3061 18.9597 15.8928Z"
        fill="#5FC52C"
      />
      <path
        d="M32.3195 33.014C31.8128 33.014 31.3062 32.8273 30.9062 32.4273C30.1328 31.654 30.1328 30.374 30.9062 29.6007L41.0395 19.414C41.8128 18.6407 43.0928 18.6407 43.8662 19.414C44.6395 20.1873 44.6395 21.4673 43.8662 22.2407L33.7328 32.4273C33.3328 32.8007 32.8262 33.014 32.3195 33.014Z"
        fill="#5FC52C"
      />
    </svg>
  )
}

/**
 * Figma "My Wellness/Connect" toast (16883:10056): after Send the sheet closes
 * and a centred card confirms over the dimmed screen — 362 wide, radius 24,
 * 24/20/20 padding, 32 between the copy and Done (an outlined 16-radius
 * button on #D6D6D6). U038: this replaced a "Thanks — that's logged." line
 * inside the sheet, which the frame does not have.
 */
function RequestSentToast({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return createPortal(
    <div className="u-fade fixed inset-0 z-50 flex items-center justify-center bg-icon-strong/40 px-20" onClick={onClose}>
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="request-sent-title"
        className="flex w-full max-w-[362px] flex-col gap-32 rounded-24 bg-surface-default px-20 pb-20 pt-24"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex flex-col items-center gap-24">
          <SentMark />
          <div className="flex flex-col items-center gap-8 text-center">
            <h2 id="request-sent-title" className="text-[20px] font-medium leading-[24px] text-text-primary">
              Your recommendation
              <br />
              has been sent!
            </h2>
            <p className="max-w-[280px] text-[14px] font-light! leading-[18.9px] text-[#525252]">
              Thank you for sharing. Our team will review it and work on making it happen soon.
            </p>
          </div>
        </div>
        <button
          type="button"
          autoFocus
          onClick={onClose}
          className="u-press flex h-51 w-full items-center justify-center rounded-16 border border-[#D6D6D6] text-[16px] leading-[19px] text-text-primary"
        >
          Done
        </button>
      </div>
    </div>,
    document.body,
  )
}

/** Ask for a source Aurelia does not support yet — Figma "drawer" (16883:9883). */
function RequestSheet({ onClose, onSent }: { onClose: () => void; onSent: (name: string) => void }) {
  const [value, setValue] = useState('')

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
    onSent(name)
  }

  return createPortal(
    <div className="u-fade fixed inset-0 z-50 flex items-end justify-center bg-icon-strong/40" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Request a device or app"
        className="u-sheet relative flex w-full sm:max-w-[480px] flex-col gap-32 rounded-t-24 bg-surface-default px-20 pb-32 pt-40 lg:max-w-[480px]"
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

        <div className="flex flex-col items-center gap-24">
          <SpiralMark />
          <div className="flex flex-col gap-8 text-center">
            <h2 className="mx-auto max-w-[250px] text-balance text-[20px] font-medium leading-[24px] text-text-primary">
              Don’t see your favorite device or app?
            </h2>
            <p className="text-[14px] font-light! leading-[21px] text-[#525252]">Tell us what you’d like to see next!</p>
          </div>
        </div>

        <form onSubmit={submit} className="flex w-full flex-col gap-32">
          <input
            autoFocus
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder="E.g. Garmin"
            aria-label="Device or app name"
            className="h-44 w-full rounded-16 border border-[#D6D6D6] bg-surface-default pl-16 pr-12 text-[16px] font-light text-text-primary outline-none placeholder:text-[#626262] focus:border-brand-emphasis"
          />
          <button
            type="submit"
            disabled={!value.trim()}
            className="u-press flex h-51 w-full items-center justify-center rounded-16 bg-[#331B04] text-[16px] leading-[19px] text-text-inverse disabled:opacity-40"
          >
            Send
          </button>
        </form>
      </div>
    </div>,
    document.body,
  )
}
