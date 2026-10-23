import {
  ArrowLeft,
  BatteryCharging,
  Check,
  Cloud,
  Feather,
  HeartPulse,
  MessageCircle,
  Moon,
  Pencil,
  Sparkles,
  Target,
  TrendingUp,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useState } from 'react'
import type { ReactNode } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { PageMeta } from '../components/PageMeta'
import { AureliaLogo } from '../components/ui/AureliaLogo'
import { FEELINGS, MAX_FEELINGS } from '../lib/feelings'
import type { Length, Onboarding, Sound, Voice } from '../lib/onboarding'
import {
  DEFAULTS,
  GOALS,
  LENGTHS,
  SOUNDS,
  VOICES,
  feelingLabels,
  findGoal,
  firstSessionBrief,
  onboardingAnswers,
  saveOnboarding,
} from '../lib/onboarding'
import { CURRENT_USER } from '../lib/people'
import { writeObjective } from '../lib/progress'
import { DEFAULT_DRAFT } from '../chat/thread'
import { useUiVersion } from '../versions/useUiVersion'

/**
 * First-run onboarding — design v4 (U047).
 *
 * Opens after a first sign-in (or sign-up) on this browser, before the
 * screen the person was heading to. Five short screens, one question each:
 *
 *   Welcome (what Aurelia does, in three steps) → Goal → Feeling today
 *   (optional) → Session style (pre-filled) → Ready (a summary you can edit,
 *   and the first session's brief, word for word).
 *
 * Why this shape, for the product as it is now:
 * - It asks only what the app can use. The goal becomes Progress's
 *   objective; everything else becomes the brief the cockpit builds the first
 *   session from, through the same `ask` path Home's field uses — so the
 *   first thing a new user sees after onboarding is Aurelia answering *them*.
 * - It does not ask for what the app cannot do yet: no wearable pairing
 *   (Connect is a mock in My Wellness), no notifications permission, no
 *   profile photo. Each of those would be a promise the demo breaks.
 * - Every step can be skipped, and Skip keeps what was answered. A person
 *   who signed in to do one specific thing is never kept from it: the last
 *   step offers "Continue where I was" whenever they arrived with a
 *   destination.
 * - Sessions are pre-filled with the demo's own defaults (10 minutes, female
 *   voice, nature), so "Continue" on the style step is always a valid answer.
 */

const GOAL_ICON: Record<string, LucideIcon> = {
  sleep: Moon,
  calm: Feather,
  clarity: Cloud,
  focus: Target,
  regulate: HeartPulse,
  energy: BatteryCharging,
}

type Step = 'welcome' | 'goal' | 'feeling' | 'style' | 'ready'
const STEPS: Step[] = ['welcome', 'goal', 'feeling', 'style', 'ready']

interface From {
  pathname: string
  state?: unknown
}

export function OnboardingPage() {
  const v4 = useUiVersion() >= 4
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: From } | null)?.from
  // A destination worth returning to: anything but Home itself.
  const heading = from && from.pathname !== '/home' ? from : null
  const [answers, setAnswers] = useState<Onboarding>(() => onboardingAnswers() ?? DEFAULTS)
  const [step, setStep] = useState<Step>('welcome')
  const index = STEPS.indexOf(step)
  const firstName = CURRENT_USER.split(' ')[0]

  if (!v4) return <Navigate to="/home" replace />

  const set = <K extends keyof Onboarding>(key: K, value: Onboarding[K]) => setAnswers((a) => ({ ...a, [key]: value }))
  const next = () => setStep(STEPS[Math.min(STEPS.length - 1, index + 1)])
  const back = () => setStep(STEPS[Math.max(0, index - 1)])

  function leave(to: From) {
    navigate(to.pathname, { replace: true, state: to.state })
  }

  function skip() {
    saveOnboarding(answers, true)
    leave(heading ?? { pathname: '/home' })
  }

  function createFirstSession() {
    saveOnboarding(answers)
    // The goal is the first session's objective, so its Progress and
    // Insights measure against what the person said they wanted. A new
    // thread opens on the demo draft, so that is the session it belongs to.
    if (goal) writeObjective(DEFAULT_DRAFT.slug, goal.objective)
    // A fresh thread: a first-time user has no history, and the demo
    // conversation would put words in their mouth ("it was too short").
    navigate('/chat', {
      replace: true,
      state: { fresh: true, ask: firstSessionBrief(answers), firstTitle: `${goal?.label ?? 'My first session'} v1.0` },
    })
  }

  function finishElsewhere() {
    saveOnboarding(answers)
    leave(heading ?? { pathname: '/home' })
  }

  const goal = findGoal(answers.goal)

  return (
    <div className="flex min-h-dvh flex-col bg-[radial-gradient(120%_60%_at_50%_0%,#FFF1DB_0%,var(--color-background-default)_60%)] lg:items-center lg:justify-center lg:py-40">
      <PageMeta title="Welcome to Aurelia" />
      <div className="flex w-full flex-1 flex-col lg:max-w-[520px] lg:flex-none lg:rounded-24 lg:bg-surface-default lg:shadow-[0_5px_24px_4px_rgba(0,0,0,0.05)]">
        {/* Top bar: back, progress, skip. Welcome has no back and no bar —
            nothing has been asked yet. */}
        <header className="flex h-64 shrink-0 items-center gap-12 px-20">
          {index > 0 ? (
            <button
              type="button"
              aria-label="Back"
              onClick={back}
              className="u-press flex size-40 shrink-0 items-center justify-center rounded-12 bg-surface-default text-text-primary shadow-sm"
            >
              <ArrowLeft size={18} />
            </button>
          ) : (
            <span className="size-40 shrink-0" />
          )}
          <div className="flex flex-1 items-center gap-4" aria-hidden={index === 0}>
            {index > 0 &&
              STEPS.slice(1).map((s, i) => (
                <span
                  key={s}
                  className={`h-4 flex-1 rounded-full transition-colors duration-300 ${i < index ? 'bg-[#331B04]' : 'bg-[#331B04]/12'}`}
                />
              ))}
          </div>
          {index > 0 && <span className="sr-only">Step {index} of {STEPS.length - 1}</span>}
          {step !== 'ready' ? (
            <button type="button" onClick={skip} className="u-tap shrink-0 text-[14px] leading-[21px] text-text-secondary">
              Skip
            </button>
          ) : (
            <span className="w-32 shrink-0" />
          )}
        </header>

        <main key={step} className="u-fade flex flex-1 flex-col px-20 pb-24">
          {step === 'welcome' && (
            <>
              <div className="flex flex-1 flex-col justify-center gap-32 py-24">
                <AureliaLogo iconSize={56} markOnly />
                <div className="flex flex-col gap-8">
                  <h1 className="text-[28px] font-normal leading-[36px] text-text-primary">Welcome, {firstName}.</h1>
                  <p className="text-[16px] font-light leading-[24px] text-text-secondary">
                    Let’s shape Aurelia around you. Three quick questions — about a minute.
                  </p>
                </div>
                <ol className="flex flex-col gap-16" aria-label="How Aurelia works">
                  {[
                    { icon: MessageCircle, title: 'Tell Aurelia how you feel', body: 'In your own words, or with a tap.' },
                    { icon: Sparkles, title: 'It composes a session for you', body: 'Sound, visuals and voice, built for that moment.' },
                    { icon: TrendingUp, title: 'Every chapter adapts', body: 'Listen, say how it felt, and the next one changes with you.' },
                  ].map(({ icon: Icon, title, body }, i) => (
                    <li key={title} className="flex items-start gap-14">
                      <span className="relative flex size-44 shrink-0 items-center justify-center rounded-full bg-[#FFF1DB] text-[#331B04]">
                        <Icon size={20} strokeWidth={1.75} />
                        <span className="absolute -right-2 -top-2 flex size-18 items-center justify-center rounded-full bg-[#331B04] text-[10px] font-semibold text-white">
                          {i + 1}
                        </span>
                      </span>
                      <span className="flex flex-col gap-2 pt-2">
                        <span className="text-[16px] font-medium leading-[22px] text-text-primary">{title}</span>
                        <span className="text-[14px] font-light leading-[20px] text-text-secondary">{body}</span>
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
              <Primary onClick={next}>Let’s begin</Primary>
            </>
          )}

          {step === 'goal' && (
            <>
              <Title title="What would you like help with?" sub="This becomes your objective — Aurelia measures your progress against it." />
              <div className="mt-24 grid grid-cols-2 gap-12" role="radiogroup" aria-label="Your goal">
                {GOALS.map((g) => {
                  const Icon = GOAL_ICON[g.id] ?? Target
                  const on = answers.goal === g.id
                  return (
                    <button
                      key={g.id}
                      type="button"
                      role="radio"
                      aria-checked={on}
                      onClick={() => set('goal', g.id)}
                      className={`u-press relative flex flex-col items-start gap-10 rounded-16 border p-14 text-left transition-colors ${
                        on ? 'border-[#331B04] bg-[#FFF8EC]' : 'border-border-subtle bg-surface-default'
                      }`}
                    >
                      <span className={`flex size-36 items-center justify-center rounded-full ${on ? 'bg-[#331B04] text-white' : 'bg-[#FFF1DB] text-[#331B04]'}`}>
                        <Icon size={18} strokeWidth={1.75} />
                      </span>
                      <span className="flex flex-col gap-2">
                        <span className="text-[15px] font-medium leading-[20px] text-text-primary">{g.label}</span>
                        <span className="text-[12px] font-light leading-[16px] text-text-secondary">{g.hint}</span>
                      </span>
                      {on && (
                        <span className="absolute right-10 top-10 flex size-20 items-center justify-center rounded-full bg-[#331B04] text-white">
                          <Check size={12} strokeWidth={2.5} />
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
              <div className="flex-1" />
              <Primary onClick={next} disabled={!answers.goal}>
                Continue
              </Primary>
            </>
          )}

          {step === 'feeling' && (
            <>
              <Title title="How are you feeling today?" sub={`Optional — pick up to ${MAX_FEELINGS}. Your first session starts from here.`} />
              <div className="mt-24 flex flex-wrap gap-8">
                {FEELINGS.filter((f) => f.id !== 'unsure').map(({ id, label, icon: Icon }) => {
                  const on = answers.feelings.includes(id)
                  return (
                    <button
                      key={id}
                      type="button"
                      aria-pressed={on}
                      onClick={() =>
                        set(
                          'feelings',
                          on ? answers.feelings.filter((f) => f !== id) : [...answers.feelings, id].slice(-MAX_FEELINGS),
                        )
                      }
                      className={`u-press flex h-40 items-center gap-8 rounded-full border px-14 text-[14px] leading-[20px] transition-colors ${
                        on ? 'border-[#331B04] bg-[#331B04] text-white' : 'border-border-subtle bg-surface-default text-text-primary'
                      }`}
                    >
                      <Icon size={16} strokeWidth={1.75} />
                      {label}
                    </button>
                  )
                })}
              </div>
              <div className="flex-1" />
              <Primary onClick={next}>{answers.feelings.length ? 'Continue' : 'Skip this one'}</Primary>
            </>
          )}

          {step === 'style' && (
            <>
              <Title title="How should your sessions sound?" sub="We’ve picked a starting point. Change anything — you can adjust it later in Session settings." />
              <div className="mt-24 flex flex-col gap-24">
                <Field label="Length">
                  <Segmented
                    options={LENGTHS.map((l) => ({ id: l, label: `${l} min` }))}
                    value={answers.length}
                    onChange={(l: Length) => set('length', l)}
                  />
                </Field>
                <Field label="Voice">
                  <Segmented options={VOICES.map((v) => ({ id: v.id, label: v.label.replace(' voice', '') }))} value={answers.voice} onChange={(v: Voice) => set('voice', v)} />
                </Field>
                <Field label="Sound" hint="Pick any">
                  <div className="flex flex-wrap gap-8">
                    {SOUNDS.map((s) => {
                      const on = answers.sounds.includes(s.id)
                      return (
                        <button
                          key={s.id}
                          type="button"
                          aria-pressed={on}
                          onClick={() =>
                            set(
                              'sounds',
                              s.id === 'silence'
                                ? on ? [] : ['silence']
                                : on
                                  ? answers.sounds.filter((x) => x !== s.id)
                                  : [...answers.sounds.filter((x) => x !== 'silence'), s.id as Sound],
                            )
                          }
                          className={`u-press flex h-40 items-center gap-6 rounded-full border px-14 text-[14px] leading-[20px] transition-colors ${
                            on ? 'border-[#331B04] bg-[#331B04] text-white' : 'border-border-subtle bg-surface-default text-text-primary'
                          }`}
                        >
                          {on && <Check size={14} strokeWidth={2.25} />}
                          {s.label}
                        </button>
                      )
                    })}
                  </div>
                </Field>
              </div>
              <div className="flex-1" />
              <Primary onClick={next}>Continue</Primary>
            </>
          )}

          {step === 'ready' && (
            <>
              <Title title="You’re all set." sub="Here’s what Aurelia will start from. Tap anything to change it." />
              <div className="mt-24 flex flex-col overflow-hidden rounded-[20px] border border-border-subtle bg-surface-default">
                <SummaryRow label="Goal" value={goal?.label ?? 'Not set'} onEdit={() => setStep('goal')} />
                <SummaryRow
                  label="Today"
                  value={answers.feelings.length ? feelingLabels(answers.feelings).join(', ') : 'Not shared'}
                  onEdit={() => setStep('feeling')}
                />
                <SummaryRow
                  label="Sessions"
                  value={[
                    `${answers.length} min`,
                    VOICES.find((v) => v.id === answers.voice)?.label,
                    SOUNDS.filter((s) => answers.sounds.includes(s.id)).map((s) => s.label).join(', ') || null,
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                  onEdit={() => setStep('style')}
                />
              </div>
              <div className="mt-16 rounded-16 bg-[#FFF8EC] p-14">
                <p className="flex items-center gap-6 text-[12px] font-medium leading-[16px] text-[#8A5A1E]">
                  <Sparkles size={13} /> Your first message to Aurelia
                </p>
                <p className="mt-6 text-[14px] font-light leading-[21px] text-text-primary">“{firstSessionBrief(answers)}”</p>
              </div>
              <p className="mt-12 text-[12px] font-light leading-[18px] text-text-secondary">
                Kept on this device for now. Connect a wearable later in My Wellness for a sharper analysis.
              </p>
              <div className="flex-1" />
              <div className="flex flex-col gap-10 pt-24">
                <Primary onClick={createFirstSession}>Create my first session</Primary>
                <button
                  type="button"
                  onClick={finishElsewhere}
                  className="u-press flex h-48 w-full items-center justify-center rounded-16 border border-[#331B04] text-[16px] leading-[19px] text-text-primary"
                >
                  {heading ? 'Continue where I was' : 'Explore Aurelia first'}
                </button>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  )
}

function Title({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="flex flex-col gap-8 pt-8">
      <h1 className="text-[24px] font-normal leading-[32px] text-text-primary [text-wrap:balance]">{title}</h1>
      <p className="text-[14px] font-light leading-[21px] text-text-secondary">{sub}</p>
    </div>
  )
}

function Primary({ children, onClick, disabled = false }: { children: ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="u-press mt-24 flex h-52 w-full shrink-0 items-center justify-center rounded-16 bg-[#331B04] text-[16px] leading-[19px] text-white disabled:opacity-40"
    >
      {children}
    </button>
  )
}

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-10">
      <p className="flex items-baseline gap-8 text-[14px] font-medium leading-[20px] text-text-primary">
        {label}
        {hint && <span className="text-[12px] font-light text-text-secondary">{hint}</span>}
      </p>
      {children}
    </div>
  )
}

function Segmented<T extends string | number>({
  options,
  value,
  onChange,
}: {
  options: { id: T; label: string }[]
  value: T
  onChange: (id: T) => void
}) {
  return (
    <div className="grid rounded-16 bg-[#F5EEE8] p-4" style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }} role="radiogroup">
      {options.map((o) => {
        const on = o.id === value
        return (
          <button
            key={String(o.id)}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(o.id)}
            className={`u-press h-40 rounded-12 text-[14px] leading-[20px] transition-colors ${
              on ? 'bg-surface-default font-medium text-text-primary shadow-sm' : 'text-text-secondary'
            }`}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}

function SummaryRow({ label, value, onEdit }: { label: string; value: string; onEdit: () => void }) {
  return (
    <button
      type="button"
      onClick={onEdit}
      aria-label={`${label}: ${value}. Change`}
      className="u-press flex items-center gap-12 border-b border-border-subtle px-16 py-14 text-left last:border-b-0"
    >
      <span className="w-72 shrink-0 text-[12px] font-light leading-[18px] text-text-secondary">{label}</span>
      <span className="min-w-0 flex-1 text-[14px] leading-[20px] text-text-primary">{value}</span>
      <Pencil size={14} className="shrink-0 text-text-secondary" aria-hidden="true" />
    </button>
  )
}
