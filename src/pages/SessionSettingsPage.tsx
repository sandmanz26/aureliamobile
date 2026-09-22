import {
  ArrowLeft,
  AudioLines,
  ChevronDown,
  Image as ImageIcon,
  Minus,
  Plus,
  Settings2,
  Type,
  WandSparkles,
} from 'lucide-react'
import { useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import orb432hz from '../assets/orb-432hz.png'
import orbIncreaseYellow from '../assets/orb-increase-yellow.png'
import orbLessMovement from '../assets/orb-less-movement.png'
import { CoverImage } from '../components/ui/CoverImage'
import type { AppliedStyle, StyleKind } from '../lib/sessionStyles'
import { SESSION_SCRIPT, appliedOfKind, findAppliedStyle, findStyle, stylesOfKind } from '../lib/sessionStyles'

/**
 * Session settings — the three layers a session is actually made of.
 *
 * Script is the words, Visual the look, Sound the mix. They are tabs rather
 * than one long page because you come here to change one of them, and because
 * the script alone is longer than everything else combined.
 *
 * Styles already on the session sit above the ones you could add, so the answer
 * to "what is this session doing right now" is never below the fold.
 */

const ORBS = { yellow: orbIncreaseYellow, movement: orbLessMovement, hz432: orb432hz } as const

type Tab = 'script' | 'visual' | 'sound' | 'general'

const TABS: { id: Tab; label: string; icon: typeof Type }[] = [
  { id: 'script', label: 'Script', icon: Type },
  { id: 'visual', label: 'Visual', icon: ImageIcon },
  { id: 'sound', label: 'Sound', icon: AudioLines },
]

/** A script line, with the reader's cues held apart from the spoken words. */
function ScriptLine({ line }: { line: string }) {
  const parts = line.split(/(\[[^\]]+\])/g)
  return (
    <p className="text-style-body whitespace-pre-line text-text-primary">
      {parts.map((part, index) =>
        part.startsWith('[') ? (
          // Direction, not dialogue — nobody should ever read this one aloud.
          <em key={index} className="text-text-secondary">
            {' '}
            {part}
          </em>
        ) : (
          <span key={index}>{part}</span>
        ),
      )}
    </p>
  )
}

/** A style already on the session. */
function AppliedChip({ style, onRemove }: { style: AppliedStyle; onRemove: () => void }) {
  return (
    <div className="relative w-[236px] shrink-0 pr-8 pt-8">
      <div className="flex items-center gap-12 rounded-16 bg-surface-default p-12 shadow-sm">
        <img src={ORBS[style.orb]} alt="" className="size-40 shrink-0 rounded-full object-cover" />
        <span className="min-w-0">
          <span className="text-style-body-small block truncate font-semibold text-text-primary">{style.name}</span>
          <span className="text-style-caption line-clamp-2 text-text-secondary">{style.reason}</span>
        </span>
      </div>
      <button
        type="button"
        aria-label={`Remove ${style.name}`}
        onClick={onRemove}
        className="u-press absolute right-0 top-0 flex size-26 items-center justify-center rounded-full bg-feedback-error text-text-inverse shadow-md"
      >
        <Minus size={15} />
      </button>
    </div>
  )
}

function StyleGrid({
  kind,
  added,
  onToggle,
}: {
  kind: StyleKind
  added: Set<string>
  /** Add and Remove are the same action in reverse — one handler, not two. */
  onToggle: (id: string) => void
}) {
  const [expanded, setExpanded] = useState<string | null>(null)

  return (
    <div className="mt-12 grid grid-cols-2 gap-12">
      {stylesOfKind(kind).map((style) => {
        const open = expanded === style.id
        const isAdded = added.has(style.id)
        return (
          <article
            key={style.id}
            // A card that is queued says so on its own edge, not only on its
            // button — the button reads correctly at a glance from a thumb's
            // width away; the border is what tells you before you get there.
            className={`flex flex-col rounded-16 border bg-surface-default p-10 transition-colors ${
              isAdded ? 'border-icon-strong' : 'border-border-subtle'
            }`}
          >
            <span className="relative block aspect-[150/110] w-full overflow-hidden rounded-12">
              <CoverImage photo={style.photo} gradient={style.gradient} width={320} height={240} scrim={false} />
            </span>
            <h3 className="text-style-body-small mt-10 font-semibold text-text-primary">{style.name}</h3>
            <p className={`text-style-caption mt-2 text-text-secondary ${open ? '' : 'line-clamp-2'}`}>
              {open ? style.detail : style.summary}
            </p>
            <button
              type="button"
              aria-expanded={open}
              onClick={() => setExpanded(open ? null : style.id)}
              className="text-style-caption u-tap mt-6 flex w-fit items-center gap-2 text-text-secondary"
            >
              {open ? 'Less' : 'More'}
              <ChevronDown size={12} className={open ? 'rotate-180' : ''} />
            </button>
            {/* Add and Remove, not Add and Added — a queued style is still one
                tap from being unqueued, right up until Apply changes sends
                it. "Added" as a disabled end state gave a wrong tap nowhere
                to go but back out to the top of the grid. */}
            <button
              type="button"
              onClick={() => onToggle(style.id)}
              aria-pressed={isAdded}
              className={`text-style-label u-press mt-10 flex h-34 w-full items-center justify-center gap-6 rounded-full border ${
                isAdded
                  ? 'border-transparent bg-icon-strong text-text-inverse'
                  : 'border-border-default bg-surface-default text-text-primary'
              }`}
            >
              {isAdded ? (
                <>
                  <Minus size={14} /> Remove
                </>
              ) : (
                <>
                  <Plus size={14} /> Add
                </>
              )}
            </button>
          </article>
        )
      })}
    </div>
  )
}

/**
 * What "Add Tibetan singing bowls" and "Remove Increase yellow" become in the
 * transcript — the same sentence a person would type, built from what is
 * queued rather than a generic "changes applied."
 */
function describeChanges(added: Set<string>, removed: Set<string>) {
  const addedNames = [...added].map((id) => findStyle(id)?.name).filter((name): name is string => Boolean(name))
  const removedNames = [...removed]
    .map((id) => findAppliedStyle(id)?.name)
    .filter((name): name is string => Boolean(name))

  const parts: string[] = []
  if (addedNames.length) parts.push(`Add ${addedNames.join(', ')}`)
  if (removedNames.length) parts.push(`Remove ${removedNames.join(', ')}`)
  return parts.join('; ') || 'Apply new changes'
}

export function SessionSettingsPage() {
  const navigate = useNavigate()
  const [tab, setTab] = useState<Tab>('script')
  const [removed, setRemoved] = useState<Set<string>>(new Set())
  const [added, setAdded] = useState<Set<string>>(new Set())

  const kind: StyleKind = tab === 'sound' ? 'sound' : 'visual'
  const applied = appliedOfKind(kind).filter((style) => !removed.has(style.id))

  function toggleAdded(id: string) {
    setAdded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  // A style you took off and a style you queued are both a pending change —
  // one badge for "how many things are waiting to be asked for," not one per
  // kind of edit.
  const pendingCount = added.size + removed.size

  function applyPendingChanges() {
    // The cockpit already knows how to turn a label into a build: post it as
    // the user's own line, run the same "generating" beat a chat-typed
    // request does, and land on a new version. Session settings composes the
    // sentence; the thread is what actually applies it.
    navigate('/chat', { state: { styleChanges: describeChanges(added, removed) } })
  }

  return (
    <div
      className={`min-h-[calc(100vh-54px)] bg-background-default lg:min-h-screen ${
        pendingCount > 0 ? 'pb-96' : 'pb-48'
      }`}
    >
      <header className="u-sticky-top flex items-center gap-12 px-20 py-16 lg:px-24">
        <button
          type="button"
          aria-label="Back"
          onClick={() => navigate(-1)}
          className="u-press flex size-40 shrink-0 items-center justify-center rounded-full text-icon-strong"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-style-title truncate text-text-primary">Session settings</h1>
      </header>

      <div className="mx-auto w-full max-w-[402px] lg:max-w-[900px]">
        {/* Tabs scroll rather than shrink — a squeezed label is worse than one
            you have to nudge into view. */}
        <div className="flex gap-8 overflow-x-auto px-20 pb-4 lg:px-24">
          {TABS.map((item) => {
            const Icon = item.icon
            const active = tab === item.id
            return (
              <button
                key={item.id}
                type="button"
                aria-pressed={active}
                onClick={() => setTab(item.id)}
                className={`u-press text-style-label flex h-38 shrink-0 items-center gap-6 whitespace-nowrap rounded-full border px-16 ${
                  active
                    ? 'border-icon-strong bg-surface-default text-text-primary'
                    : 'border-transparent bg-surface-default text-text-secondary'
                }`}
              >
                <Icon size={15} />
                {item.label}
              </button>
            )
          })}
          <button
            type="button"
            aria-label="General settings"
            aria-pressed={tab === 'general'}
            onClick={() => setTab('general')}
            className={`u-press flex size-38 shrink-0 items-center justify-center rounded-full border ${
              tab === 'general'
                ? 'border-icon-strong bg-surface-default text-text-primary'
                : 'border-transparent bg-surface-default text-text-secondary'
            }`}
          >
            <Settings2 size={16} />
          </button>
        </div>

        <div key={tab} className="u-fade px-20 pt-20 lg:px-24">
          {tab === 'script' && (
            <div className="flex flex-col gap-14">
              {SESSION_SCRIPT.map((line, index) => (
                <ScriptLine key={index} line={line} />
              ))}
            </div>
          )}

          {(tab === 'visual' || tab === 'sound') && (
            <>
              <h2 className="text-style-body-small text-text-primary">Current style</h2>
              {applied.length === 0 ? (
                <p className="text-style-body-small mt-12 text-text-secondary">
                  Nothing applied — the session uses the default {kind === 'sound' ? 'mix' : 'look'}.
                </p>
              ) : (
                <div className="-mx-20 mt-4 flex gap-12 overflow-x-auto px-20 pb-4 lg:-mx-24 lg:px-24">
                  {applied.map((style) => (
                    <AppliedChip
                      key={style.id}
                      style={style}
                      onRemove={() => setRemoved((prev) => new Set(prev).add(style.id))}
                    />
                  ))}
                </div>
              )}

              <h2 className="text-style-body-small mt-20 text-text-primary">Explore new styles</h2>
              <StyleGrid kind={kind} added={added} onToggle={toggleAdded} />
            </>
          )}

          {tab === 'general' && (
            <div className="flex flex-col gap-10">
              {/* Session-wide settings, in the same vocabulary Recreate uses —
                  these are the knobs that are not Script, Visual or Sound. */}
              {[
                { label: 'Length', value: '22 min' },
                { label: 'Pace', value: 'Same as original' },
                { label: 'Ends', value: 'Fade to silence' },
                { label: 'Visibility', value: 'Only me' },
              ].map((row) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between gap-12 rounded-16 bg-surface-default p-16 shadow-sm"
                >
                  <span className="text-style-body text-text-primary">{row.label}</span>
                  <span className="text-style-body-small truncate text-text-secondary">{row.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Floating rather than docked to the tab content, because a change
          queued on Visual has to stay visible after switching to Sound — the
          count is the total across both, not per tab, and a bar that lived
          inside one tab's own scroller would have looked like it forgot the
          other one's queue. Portalled to the body: `.u-page` animates with a
          transform, which makes it the containing block for a `fixed`
          descendant, so an un-portalled bar would pin itself to the bottom
          of the scrollable page box instead of the viewport (the same trap
          documented for sheets and modals). `left-0` alone would centre it
          against the full window, sidebar included — `lg:left-[313px]`
          keeps it centred on the content column beside the 313px desktop
          sidebar instead. */}
      {pendingCount > 0 &&
        createPortal(
          <div className="fixed inset-x-0 bottom-20 z-30 flex justify-center px-20 lg:bottom-24 lg:left-[313px]">
            <button
              type="button"
              onClick={applyPendingChanges}
              className="u-press relative flex h-48 items-center gap-8 rounded-full border border-border-subtle bg-surface-default px-20 text-style-label text-text-strong shadow-[0_10px_30px_rgba(0,0,0,0.18)]"
            >
              <WandSparkles size={14} />
              Apply changes
              <span className="text-style-caption absolute -right-6 -top-6 flex size-22 items-center justify-center rounded-full bg-interactive-primary font-semibold text-text-inverse shadow-sm">
                {pendingCount}
              </span>
            </button>
          </div>,
          document.body,
        )}
    </div>
  )
}
