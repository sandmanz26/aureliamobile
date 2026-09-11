import { ArrowLeft, AudioLines, Image as ImageIcon, Minus, Plus, Settings2, Type } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import orb432hz from '../assets/orb-432hz.png'
import orbIncreaseYellow from '../assets/orb-increase-yellow.png'
import orbLessMovement from '../assets/orb-less-movement.png'
import { CoverImage } from '../components/ui/CoverImage'
import type { AppliedStyle, StyleKind } from '../lib/sessionStyles'
import { SESSION_SCRIPT, appliedOfKind, stylesOfKind } from '../lib/sessionStyles'

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
  onAdd,
}: {
  kind: StyleKind
  added: Set<string>
  onAdd: (id: string) => void
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
            className="flex flex-col rounded-16 border border-border-subtle bg-surface-default p-10"
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
              className="text-style-caption u-tap mt-6 w-fit text-text-secondary underline-offset-2 hover:underline"
            >
              {open ? 'Less' : 'More'}
            </button>
            <button
              type="button"
              onClick={() => onAdd(style.id)}
              disabled={isAdded}
              className={`text-style-label u-press mt-10 flex h-34 w-full items-center justify-center gap-6 rounded-full border ${
                isAdded
                  ? 'border-transparent bg-background-elevated text-text-secondary'
                  : 'border-border-default bg-surface-default text-text-primary'
              }`}
            >
              {isAdded ? 'Added' : <><Plus size={14} /> Add</>}
            </button>
          </article>
        )
      })}
    </div>
  )
}

export function SessionSettingsPage() {
  const navigate = useNavigate()
  const [tab, setTab] = useState<Tab>('script')
  const [removed, setRemoved] = useState<Set<string>>(new Set())
  const [added, setAdded] = useState<Set<string>>(new Set())

  const kind: StyleKind = tab === 'sound' ? 'sound' : 'visual'
  const applied = appliedOfKind(kind).filter((style) => !removed.has(style.id))

  return (
    <div className="min-h-[calc(100vh-54px)] bg-background-default pb-48 lg:min-h-screen">
      <header className="flex items-center gap-12 px-20 py-16 lg:px-24">
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
              <h2 className="text-style-body-small text-text-secondary">Current style</h2>
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

              <h2 className="text-style-body-small mt-20 text-text-secondary">Explore new styles</h2>
              <StyleGrid
                kind={kind}
                added={added}
                onAdd={(id) => setAdded((prev) => new Set(prev).add(id))}
              />
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
    </div>
  )
}
