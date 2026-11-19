import { Users } from 'lucide-react'
import type { ReactNode } from 'react'
import { GOAL_LABEL, personaPrompt, type Persona } from '../data/personas'
import { INITIAL_JOURNEY } from '../data/userJourney'
import { Badge } from './ui'

/**
 * A persona's full profile (U099, U100), shared by Personas and Buyer agent
 * results (U102) so a buyer's answer can be read next to who they are.
 */

const MOMENT_TITLE = new Map(INITIAL_JOURNEY.stages.flatMap((s) => s.moments.map((m) => [m.id, m.title] as const)))

const LEVEL_WIDTH = { low: '25%', medium: '55%', high: '90%' } as const

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-8 border-t border-adm-line pt-14">
      <h3 className="text-11 font-semibold uppercase tracking-widest text-adm-muted">{title}</h3>
      {children}
    </section>
  )
}

function Chips({ items }: { items: string[] }) {
  return (
    <div className="flex flex-wrap gap-6">
      {items.map((x) => (
        <span key={x} className="rounded-full bg-adm-hover px-8 py-2 text-11 text-adm-ink">
          {x}
        </span>
      ))}
    </div>
  )
}

/** One persona as a person: who they are, a day, how they feel, what wins or loses them. */
export function PersonaProfile({ p }: { p: Persona }) {
  const f = p.profile
  const initials = p.name
    .split(' ')
    .map((x) => x[0])
    .slice(0, 2)
    .join('')
  return (
    <div className="flex flex-col gap-14 text-13 text-adm-ink">
      <div className="flex items-center gap-12">
        <span className="flex size-56 shrink-0 items-center justify-center rounded-full bg-adm-hover text-[17px] font-semibold text-adm-ink-2" aria-hidden="true">
          {initials}
        </span>
        <div className="min-w-0">
          <p className="text-15 font-semibold">
            {p.name}, {p.age} <span className="text-12 font-normal text-adm-muted">({f.pronouns})</span>
          </p>
          <p className="text-12 text-adm-ink-2">
            {p.occupation} · {p.city}, {p.country}
          </p>
          <div className="mt-4 flex flex-wrap gap-4">
            <Badge tone="info">{GOAL_LABEL[p.goal]}</Badge>
            <Badge>{p.experience === 'never' ? 'New to meditation' : `Meditation: ${p.experience}`}</Badge>
            <Badge tone={p.aiAttitude === 'distrustful' || p.aiAttitude === 'skeptical' ? 'warning' : 'good'}>AI: {p.aiAttitude}</Badge>
          </div>
        </div>
      </div>
      <p className="leading-[20px]">{f.bio}</p>
      <p className="rounded-8 bg-adm-bg px-12 py-10 italic text-adm-ink-2">“{f.quotes[0]}”</p>

      <Section title="A weekday">
        <ol className="flex flex-col gap-6">
          {f.day.map((d) => (
            <li key={d.time + d.what} className="grid grid-cols-[72px_1fr] gap-8 text-12">
              <span className="tabular-nums text-adm-muted">{d.time}</span>
              <span>{d.what}</span>
            </li>
          ))}
        </ol>
      </Section>

      <Section title="How they are doing">
        <div className="grid grid-cols-3 gap-8 text-12">
          <div className="rounded-8 bg-adm-bg p-8">
            <p className="text-adm-muted">Sleep</p>
            <p className="font-semibold tabular-nums">
              {f.sleep.hours} h · {f.sleep.bedtime}–{f.sleep.wake}
            </p>
          </div>
          <div className="rounded-8 bg-adm-bg p-8">
            <p className="text-adm-muted">Sleep quality</p>
            <p className="font-semibold tabular-nums">{f.sleep.quality} of 5</p>
          </div>
          <div className="rounded-8 bg-adm-bg p-8">
            <p className="text-adm-muted">Screen time</p>
            <p className="font-semibold tabular-nums">{f.screenTimeHours} h a day</p>
          </div>
        </div>
        <p className="text-12">
          <span className="text-adm-muted">Right now: </span>
          {p.name.split(' ')[0]} {p.struggle}. It hits at: {p.triggers.join('; ')}.
        </p>
        <div className="flex flex-col gap-4 text-12">
          <span className="text-adm-muted">What weighs on them</span>
          <Chips items={f.stressors} />
          <span className="mt-4 text-adm-muted">How they cope now</span>
          <Chips items={f.coping} />
          {p.flags.length > 0 && (
            <>
              <span className="mt-4 text-adm-muted">Circumstances to test for</span>
              <Chips items={p.flags} />
            </>
          )}
        </div>
      </Section>

      <Section title="Personality and values">
        <div className="flex flex-col gap-6">
          {(Object.entries(f.personality) as [string, keyof typeof LEVEL_WIDTH][]).map(([k, v]) => (
            <div key={k} className="grid grid-cols-[130px_1fr_56px] items-center gap-8 text-12">
              <span className="capitalize text-adm-ink-2">{k}</span>
              <span className="h-6 overflow-hidden rounded-full bg-adm-hover">
                <span className="block h-full rounded-full bg-adm-s1" style={{ width: LEVEL_WIDTH[v] }} />
              </span>
              <span className="text-adm-muted">{v}</span>
            </div>
          ))}
        </div>
        <p className="text-12">
          <span className="text-adm-muted">Traits: </span>
          {f.traits.join(', ')} · <span className="text-adm-muted">Values: </span>
          {f.values.join(', ')}
        </p>
      </Section>

      <Section title="Life and tech">
        <dl className="grid grid-cols-[130px_1fr] gap-x-12 gap-y-6 text-12">
          {(
            [
              ['Home', p.household],
              ['Work', `${p.workPattern}; ${p.income} income`],
              ['Language', p.language],
              ['Phone', `${f.phone}; mostly ${f.topApps.join(', ')}`],
              ['Wearable', p.wearable],
              ['Wellness apps', f.appHistory],
            ] as const
          ).map(([k, v]) => (
            <div key={k} className="contents">
              <dt className="text-adm-muted">{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
      </Section>

      <Section title="Winning them, losing them">
        <dl className="grid grid-cols-[130px_1fr] gap-x-12 gap-y-6 text-12">
          {(
            [
              ['Success looks like', f.success],
              ['Would hear about it', f.wouldHearAbout],
              ['How they decide', f.decides],
              ['Would pay', p.willingnessToPay],
              ['Prefers', `${p.length} min, ${p.voice === 'none' ? 'no voice' : `${p.voice} voice`}, ${p.sound}; spiritual language: ${p.spiritual}`],
              ['Privacy', p.privacy],
              ['Barriers', p.barriers.join('; ')],
              ['Deal breakers', f.dealBreakers.join('; ')],
            ] as const
          ).map(([k, v]) => (
            <div key={k} className="contents">
              <dt className="text-adm-muted">{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
      </Section>

      <Section title="Buying">
        <div className="grid grid-cols-[130px_1fr] gap-x-12 gap-y-6 text-12">
          <span className="text-adm-muted">Pain today</span>
          <span className="flex items-center gap-8">
            <span className="h-6 w-120 overflow-hidden rounded-full bg-adm-hover">
              <span className="block h-full rounded-full bg-adm-critical" style={{ width: `${f.testing.pain * 10}%` }} />
            </span>
            <span className="tabular-nums">{f.testing.pain} of 10</span>
          </span>
          <span className="text-adm-muted">Spends now</span>
          <span>{f.testing.spendNow}</span>
          <span className="text-adm-muted">Uses instead</span>
          <span>{f.testing.alternatives.join('; ')}</span>
          <span className="text-adm-muted">Would buy if</span>
          <span>{f.testing.buyTriggers.join('; ')}</span>
          <span className="text-adm-muted">Connection</span>
          <span>{f.testing.connectivity}</span>
          {f.testing.accessibility.length > 0 && (
            <>
              <span className="text-adm-muted">Access needs</span>
              <span>{f.testing.accessibility.join('; ')}</span>
            </>
          )}
        </div>
        <div className="flex flex-col gap-4 text-12">
          <span className="text-adm-muted">Jobs to be done</span>
          <ul className="flex list-disc flex-col gap-2 pl-16">
            {f.testing.jobs.map((j) => (
              <li key={j}>{j}</li>
            ))}
          </ul>
          <span className="mt-4 text-adm-muted">Objections, in their words</span>
          <ul className="flex flex-col gap-2 italic text-adm-ink-2">
            {f.testing.objections.map((o) => (
              <li key={o}>{o}</li>
            ))}
          </ul>
        </div>
      </Section>

      <Section title="Test cases">
        <p className="rounded-8 border border-dashed border-adm-line px-10 py-8 text-12">
          <span className="text-adm-muted">First thing they would type: </span>“{f.testing.firstSentence}”
        </p>
        <ol className="flex flex-col gap-8">
          {f.testing.scenarios.map((sc, i) => (
            <li key={sc.id} className="rounded-8 border border-adm-line p-10 text-12">
              <p className="font-semibold">
                {i + 1}. {sc.title}
              </p>
              <p className="mt-4">
                <span className="text-adm-muted">When: </span>
                {sc.when}
              </p>
              <p>
                <span className="text-adm-muted">Does: </span>
                {sc.does}
              </p>
              <p className="mt-4 rounded-4 bg-adm-good/10 px-6 py-4">
                <span className="font-medium">Expect: </span>
                {sc.expect}
              </p>
            </li>
          ))}
        </ol>
      </Section>

      <Section title="In their words">
        <ul className="flex flex-col gap-6 text-12 italic text-adm-ink-2">
          {f.quotes.map((q) => (
            <li key={q}>“{q}”</li>
          ))}
        </ul>
      </Section>

      <Section title="User journey moments">
        <Chips items={p.moments.map((m) => MOMENT_TITLE.get(m) ?? m)} />
      </Section>

      <Section title="Role-play prompt">
        <span className="inline-flex items-center gap-6 text-12 text-adm-muted">
          <Users size={13} /> For an AI research run. Copy it with the button below.
        </span>
        <pre className="max-h-[220px] overflow-auto whitespace-pre-wrap rounded-8 border border-adm-line bg-adm-bg p-10 text-11 leading-[16px] text-adm-ink-2">{personaPrompt(p)}</pre>
      </Section>
    </div>
  )
}
