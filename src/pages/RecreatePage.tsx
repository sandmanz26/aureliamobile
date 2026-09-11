import { ArrowLeft, Check, Coins, Menu, Repeat2, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { CoverImage } from '../components/ui/CoverImage'
import { useDrawer } from '../layouts/DrawerContext'
import { findSession } from '../lib/sessions'

/**
 * Recreate — forking someone else's session.
 *
 * The whole point of the community loop in the PRD: you do not start from a
 * blank prompt, you start from something that already worked for someone and
 * say what should be different. So this screen is a diff, not a form — the
 * original is fixed at the top, every control below states a change against
 * it, and the summary at the bottom is literally the brief handed to chat.
 *
 * Attribution is not optional here and is not a toggle: a fork keeps its
 * lineage, and the original creator is credited and paid coins on every play.
 */
const VOICES = ['Same as original', 'Female · warm', 'Male · low', 'No voice'] as const
const PACES = ['Slower', 'Same', 'Faster'] as const

interface Change {
  label: string
  value: string
}

export function RecreatePage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { openDrawer } = useDrawer()
  const session = findSession(slug)

  const [minutes, setMinutes] = useState(session?.minutes ?? 20)
  const [voice, setVoice] = useState<string>(VOICES[0])
  const [pace, setPace] = useState<string>(PACES[1])
  const [layers, setLayers] = useState<string[]>(session?.layers.map((layer) => layer.id) ?? [])
  const [note, setNote] = useState('')

  if (!session) return <Navigate to="/home" replace />

  const droppedLayers = session.layers.filter((layer) => !layers.includes(layer.id))

  // Only differences make the list — a fork that changes nothing is a replay.
  const changes: Change[] = [
    ...(minutes !== session.minutes
      ? [{ label: 'Length', value: `${session.minutes} → ${minutes} min` }]
      : []),
    ...(voice !== VOICES[0] ? [{ label: 'Voice', value: voice }] : []),
    ...(pace !== PACES[1] ? [{ label: 'Pace', value: pace }] : []),
    ...(droppedLayers.length
      ? [{ label: 'Removed', value: droppedLayers.map((layer) => layer.name).join(', ') }]
      : []),
    ...(note.trim() ? [{ label: 'Note', value: note.trim() }] : []),
  ]

  function toggleLayer(id: string) {
    setLayers((current) => (current.includes(id) ? current.filter((x) => x !== id) : [...current, id]))
  }

  function applyPreset(change: string) {
    if (!session) return
    if (change.includes('longer')) setMinutes(Math.round(session.minutes * 1.5))
    else if (change.includes('shorter')) setMinutes(Math.max(3, Math.round(session.minutes * 0.6)))
    else if (change.includes('Slowed') || change.includes('slower')) setPace('Slower')
    else if (change.includes('male voice')) setVoice('Male · low')
    else if (change.includes('guiding voice') || change.includes('Added a guiding')) setVoice('Female · warm')
    else if (change.includes('Removed the guidance') || change.includes('Dropped')) {
      const target = session.layers.find(
        (layer) => layer.id === 'voice' || layer.id === 'pulse' || layer.id === 'affirm',
      )
      if (target) setLayers((current) => current.filter((id) => id !== target.id))
    } else setNote(change)
  }

  function handOffToChat() {
    if (!session) return
    navigate('/chat', {
      state: {
        recreate: {
          slug: session.slug,
          title: session.title,
          author: session.author,
          minutes,
          changes: changes.map((change) => `${change.label}: ${change.value}`),
        },
      },
    })
  }

  return (
    <div className="flex min-h-[calc(100vh-54px)] flex-col bg-background-default lg:min-h-screen">
      <header className="flex h-54 shrink-0 items-center justify-between px-20">
        <button
          type="button"
          aria-label="Back"
          onClick={() => navigate(-1)}
          className="flex size-32 items-center justify-center rounded-full text-icon-default"
        >
          <ArrowLeft size={20} />
        </button>
        <p className="text-style-body-small font-medium text-text-primary">Recreate</p>
        <button
          type="button"
          aria-label="Menu"
          onClick={openDrawer}
          className="flex size-32 items-center justify-center text-icon-default lg:hidden"
        >
          <Menu size={20} />
        </button>
      </header>

      <div className="flex-1 px-20 pb-140">
        <div className="mx-auto w-full max-w-[402px] lg:max-w-[720px]">
          {/* The original, fixed — everything below is stated against it. */}
          <div className="flex items-center gap-14 rounded-16 border border-border-subtle bg-surface-default p-12">
            <span className="relative size-64 shrink-0 overflow-hidden rounded-12">
              <CoverImage photo={session.photo} gradient={session.gradient} width={160} height={160} scrim={false} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-style-caption uppercase tracking-[0.12em] text-text-secondary">Based on</p>
              <p className="text-style-body-small mt-2 font-medium text-text-primary">{session.title}</p>
              <p className="text-style-caption mt-2 truncate text-text-secondary">
                {session.author} · {session.minutes} min · {session.recreated} recreations
              </p>
            </div>
          </div>

          <p className="text-style-body-small mt-20 text-text-primary">
            Tell Aurelia what should be different. Anything you leave alone stays as {session.author} made it.
          </p>

          {/* Presets: the edits other people actually made, one tap each. */}
          <section className="mt-20">
            <h2 className="text-style-label uppercase tracking-[0.12em] text-text-secondary">Start from a common edit</h2>
            <div className="-mx-20 mt-10 flex gap-8 overflow-x-auto px-20 pb-4">
              {session.commonChanges.map((item) => (
                <button
                  key={item.change}
                  type="button"
                  onClick={() => applyPreset(item.change)}
                  className="text-style-label flex h-40 shrink-0 items-center gap-6 whitespace-nowrap rounded-full border border-border-subtle bg-surface-default px-14 text-text-primary"
                >
                  <Sparkles size={13} />
                  {item.change}
                  <span className="text-text-secondary">{item.share}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="mt-24">
            <div className="flex items-baseline justify-between">
              <h2 className="text-style-label uppercase tracking-[0.12em] text-text-secondary">Length</h2>
              <span className="text-style-body-small tabular-nums text-text-primary">{minutes} min</span>
            </div>
            <input
              type="range"
              min={3}
              max={60}
              step={1}
              value={minutes}
              onChange={(event) => setMinutes(Number(event.target.value))}
              aria-label="Session length in minutes"
              className="u-slider mt-12"
            />
            <div className="text-style-caption mt-6 flex justify-between text-text-secondary">
              <span>3 min</span>
              <span>original {session.minutes} min</span>
              <span>60 min</span>
            </div>
          </section>

          <section className="mt-24">
            <h2 className="text-style-label uppercase tracking-[0.12em] text-text-secondary">Voice</h2>
            <div className="mt-10 flex flex-wrap gap-8">
              {VOICES.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setVoice(option)}
                  className={`text-style-label h-40 rounded-full border px-14 ${
                    voice === option
                      ? 'border-transparent bg-brand-default text-text-strong'
                      : 'border-border-subtle bg-surface-default text-text-primary'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </section>

          <section className="mt-24">
            <h2 className="text-style-label uppercase tracking-[0.12em] text-text-secondary">Pace</h2>
            <div className="mt-10 flex gap-8">
              {PACES.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setPace(option)}
                  className={`text-style-label h-40 flex-1 rounded-full border px-14 ${
                    pace === option
                      ? 'border-transparent bg-brand-default text-text-strong'
                      : 'border-border-subtle bg-surface-default text-text-primary'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </section>

          <section className="mt-24">
            <h2 className="text-style-label uppercase tracking-[0.12em] text-text-secondary">Keep these layers</h2>
            <div className="mt-10 flex flex-col divide-y divide-border-subtle rounded-16 border border-border-subtle bg-surface-default px-14">
              {session.layers.map((layer) => {
                const kept = layers.includes(layer.id)
                return (
                  <button
                    key={layer.id}
                    type="button"
                    onClick={() => toggleLayer(layer.id)}
                    aria-pressed={kept}
                    className="flex items-center gap-12 py-14 text-left"
                  >
                    <span
                      className={`flex size-22 shrink-0 items-center justify-center rounded-full border ${
                        kept ? 'border-transparent bg-brand-emphasis text-text-inverse' : 'border-border-default'
                      }`}
                    >
                      {kept && <Check size={13} />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="text-style-body-small block text-text-primary">{layer.name}</span>
                      <span className="text-style-caption block text-text-secondary">{layer.detail}</span>
                    </span>
                  </button>
                )
              })}
            </div>
          </section>

          <section className="mt-24">
            <h2 className="text-style-label uppercase tracking-[0.12em] text-text-secondary">Anything else</h2>
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              rows={3}
              placeholder="e.g. keep the ocean under the whole thing, and end without a chime"
              className="text-style-body-small mt-10 w-full resize-none rounded-16 border border-border-subtle bg-surface-default p-14 text-text-primary outline-none placeholder:text-text-secondary"
            />
          </section>

          <section className="mt-24 rounded-16 bg-background-elevated p-16">
            <h2 className="text-style-label uppercase tracking-[0.12em] text-text-secondary">Your version</h2>
            {changes.length === 0 ? (
              <p className="text-style-body-small mt-10 text-text-secondary">
                No changes yet — pick an edit above, or send it as-is to start tuning in chat.
              </p>
            ) : (
              <ul className="mt-10 flex flex-col gap-8">
                {changes.map((change) => (
                  <li key={change.label} className="flex gap-10">
                    <Repeat2 size={14} className="mt-3 shrink-0 text-icon-secondary" />
                    <span className="text-style-body-small text-text-primary">
                      <span className="text-text-secondary">{change.label}: </span>
                      {change.value}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <p className="text-style-caption mt-14 flex items-start gap-6 text-text-secondary">
              <Coins size={12} className="mt-2 shrink-0" />
              Published as a fork of “{session.title}”. {session.author} stays credited in the lineage and earns 10
              coins each time your version is played.
            </p>
          </section>
        </div>
      </div>

      {/* The commit action stays reachable however far down the form you are. */}
      <div className="sticky bottom-0 border-t border-border-subtle bg-background-default/95 px-20 py-12 backdrop-blur">
        <div className="mx-auto w-full max-w-[402px] lg:max-w-[720px]">
          <button
            type="button"
            onClick={handOffToChat}
            className="text-style-body u-press flex h-52 w-full items-center justify-center gap-8 rounded-full bg-button-primary-background font-semibold text-button-primary-foreground"
          >
            <Sparkles size={18} />
            Create my version
          </button>
          <p className="text-style-caption mt-8 text-center text-text-secondary">
            Opens in chat so you can keep tuning it out loud.
          </p>
        </div>
      </div>
    </div>
  )
}
