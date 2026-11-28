import { PanelRightOpen } from 'lucide-react'
import { PageTabs, PurposeLine } from '../../components/PageTabs'
import { usePageTab } from '../../components/pageTab'
import { RELEASES } from '../../../versions/releases'
import { DetailsCue } from '../reports/ReportParts'
import { useState, type ReactNode } from 'react'
import { Badge, PageHeader, Panel, type Tone } from '../../components/ui'
import {
  BAD_NIGHT, BAD_SCORE, CHECK_IN, DOJO_LAYER_SOURCE, DOJO_LINKS, GOOD_NIGHT, GOOD_SCORE, KEY_TERMS, LAYER_TEXT, MARKERS, MILESTONES,
  NUM_LABEL_MEANING, NUM_LABEL_TEXT, SCALE_SOURCES, STATES, sleepScore, whoHasIt,
  type Layer, type NumLabel,
} from '../../data/stateFlipSleep'
import { CHANCE_CAP, driverOf, examplePeople, factors, sleepCohort, specFlat, type ChapterRow, type PersonFlip } from '../../data/stateFlipFormulas'
import { DetailDrawerProvider, useDetail } from '../reports/DetailDrawer'
import { Details, GoalLine } from '../reports/ReportSummary'
import { RichText, Term } from '../reports/Term'
import { AkpCatalogue, AllStateFlips } from './StateFlipsCatalogue'
import { CHAPTER_PHASES, chapterNodeById } from '../../data/akpChapterGraph'

/*
 * Admin → Product lab → StateFlips (U140, J202), for the business owner:
 * summary first, then the shared words, the sleep StateFlip in full, how
 * "chapters to flip" and "chance it works" are worked out, and the cohort of
 * sleep personas followed chapter by chapter. All numbers come from
 * data/stateFlipSleep.ts and data/stateFlipFormulas.ts; costModel is read,
 * never changed.
 */

const LABEL_TONE: Record<NumLabel, Tone> = { spec: 'critical', assumption: 'serious', computed: 'info', research: 'good' }
const pct = (x: number) => `${Math.round(x * 100)}%`
const usd = (x: number) => `$${x.toFixed(2)}`
const r1 = (x: number) => (Math.round(x * 10) / 10).toString()

function L({ l }: { l: NumLabel }) {
  return (
    <span title={NUM_LABEL_MEANING[l]}>
      <Badge tone={LABEL_TONE[l]}>{NUM_LABEL_TEXT[l]}</Badge>
    </span>
  )
}

const LAYER_FILL: Record<Layer, string> = { mood: 'fill-adm-s3', habit: 'fill-adm-s4', skill: 'fill-adm-s1' }
const LAYER_DOT: Record<Layer, string> = { mood: 'bg-adm-s3', habit: 'bg-adm-s4', skill: 'bg-adm-s1' }

export function StateFlipsPage() {
  return (
    <DetailDrawerProvider>
      <StateFlips />
    </DetailDrawerProvider>
  )
}

const NAV2 = RELEASES.adminNav2

const TABS = [
  { id: 'sleep', label: 'Sleep, in full' },
  { id: 'all', label: 'All StateFlips' },
  { id: 'akps', label: 'AKP catalogue' },
] as const

function StateFlips() {
  const [tab, setTab] = useState<(typeof TABS)[number]['id']>('sleep')
  const open = useDetail()
  const who = whoHasIt()
  const c = sleepCohort()
  const spec = specFlat()
  const last = c.rows[c.rows.length - 1]
  const at42 = c.flippedAt(42)
  const ex = examplePeople(c)
  const [, setPageTab] = usePageTab()
  const goal = <GoalLine goal="Explain, in numbers anyone can check, how chapters add up to the sleep StateFlip (25 → 85) and how “chance it works” is calculated." />

  const tiles: { label: string; value: string; vs: string; badge: NumLabel; open: () => void }[] = [
    {
      label: 'Chapters to flip (middle person)', value: `${c.medianChapters}`, vs: `Spec: ${spec.specChapters} for everyone`, badge: 'computed',
      open: () => open({ kicker: 'Computed', title: 'Chapters to flip', summary: `Half of the ${c.people.length} people with a sleep need reach good sleep in ${c.medianChapters} chapters or fewer, if it works for them. It ranges from ${Math.min(...c.people.map((p) => p.chapters))} (a mild start) to ${Math.max(...c.people.map((p) => p.chapters))} (a severe start). The spec gives 42 to everyone because it assumes everyone starts at 25.`, numbers: [{ label: 'Middle person', value: `${c.medianChapters}` }, { label: 'Average', value: r1(c.meanChapters) }, { label: 'Spec, 25 → 85', value: `${spec.specChapters}` }, { label: 'Our curve, 25 → 85', value: '42' }] }),
    },
    {
      label: 'Chance it works (average)', value: pct(c.meanChance), vs: `Spec: ${pct(spec.chance)} for everyone`, badge: 'computed',
      open: () => open({ kicker: 'Computed', title: 'Chance it works', summary: `The average of each person’s own chance: the spec’s 54% × how often they would use it × how ready they are × how bad their sleep is × whether audio suits them, kept between 5% and ${pct(CHANCE_CAP)}. Lower than 54% mostly because half the group is severe and few are ready to act.`, numbers: [{ label: 'Average', value: pct(c.meanChance) }, { label: 'Lowest', value: pct(Math.min(...c.people.map((p) => p.chance.chance))) }, { label: 'Highest', value: pct(Math.max(...c.people.map((p) => p.chance.chance))) }, { label: 'Spec', value: pct(spec.chance) }] }),
    },
    {
      label: 'Sleeping well by chapter 42', value: pct(at42), vs: `${pct(last.flipped)} by the end (chapter ${c.horizon})`, badge: 'computed',
      open: () => open({ kicker: 'Computed', title: 'Share sleeping well, by chapter', summary: `Of everyone in the group who starts. People who start nearer good sleep get there first; the severe starts need up to ${c.horizon} chapters.`, numbers: [10, 20, 30, 42, c.horizon].map((k) => ({ label: `By chapter ${k}`, value: pct(c.flippedAt(k)) })) }),
    },
    {
      label: 'Stopped before the end', value: pct(last.dropped), vs: `${pct(c.rows[Math.min(20, c.horizon)].dropped)} by chapter 20`, badge: 'assumption',
      open: () => open({ kicker: 'Assumption', title: 'People who stop', summary: `We assume 6 in 10 of the people a journey does not help simply stop using it; the rest stay but stall (${pct(last.notHelped)} finish without flipping). So the share who stop follows from each person’s chance it works. No real person has used Aurelia for sleep yet.`, numbers: [10, 20, 30, c.horizon].map((k) => ({ label: `By chapter ${k}`, value: pct(c.rows[Math.min(k, c.horizon)].dropped) })) }),
    },
  ]

  const summarySection = (
      <section aria-label="Summary" className="flex min-w-0 flex-col gap-14 rounded-12 border border-adm-line bg-adm-surface p-16 lg:p-20" data-summary>
        <p className="max-w-[860px] text-18 font-semibold leading-snug text-adm-ink">
          {who.cohort.length} of the 1,000 <Term id="simulated">simulated people</Term> have sleep as their main need. Followed chapter by chapter, half would reach good sleep within {c.medianChapters} <Term id="chapter">chapters</Term> if it works for them, and {pct(last.flipped)} of them get there in the end: less than the plan’s flat 54%, because half the group starts with severe sleep problems.
        </p>
        <dl className="grid grid-cols-2 gap-8 lg:grid-cols-4">
          {tiles.map((t) => (
            <div key={t.label} className="flex min-w-0 flex-col gap-4 rounded-8 border border-adm-line bg-adm-bg p-12">
              <dt className="flex flex-wrap items-center justify-between gap-4 text-11 font-medium text-adm-muted">
                <span>{t.label}</span>
                <L l={t.badge} />
              </dt>
              <dd>
                <button type="button" onClick={t.open} aria-label={`${t.label}: ${t.value}. Show details`} className="group inline-flex items-center gap-6 rounded-4 text-left text-24 font-semibold leading-tight tabular-nums text-adm-ink hover:underline hover:decoration-adm-axis">
                  {t.value}
                  <DetailsCue />
                </button>
              </dd>
              <dd className="text-11 text-adm-ink-2">{t.vs}</dd>
            </div>
          ))}
        </dl>
        <p className="text-12 text-adm-ink-2">
          Nothing here is measured: there are no real users yet. Each number is labelled <L l="spec" /> (the business owner’s plan), <L l="assumption" /> (our stated choice), <L l="computed" /> (worked out here) or <L l="research" /> (a published sleep scale).
        </p>
      </section>
  )

  return (
    <div className="flex flex-col gap-16" data-stateflips>
      <PageHeader title="StateFlips" description="How Aurelia moves a person from a bad state to a good one: sleep built out in full (what bad and good mean, the steps, how we measure them, who has it, how many chapters), all 125 StateFlips, and the draft catalogue of about 3,100 AKPs." />
      {!NAV2 && goal}

      <PageTabs
        summary={
          <div className="flex min-w-0 flex-col gap-12">
            <PurposeLine purpose="seeing how Aurelia turns a bad state into a good one, starting with sleep, and how likely it is to work." />
            {goal}
            {summarySection}
            <button type="button" onClick={() => setPageTab('detail')} className="self-end text-13 font-semibold text-adm-ink underline decoration-adm-axis underline-offset-2">
              See the steps, the cohort, all 125 StateFlips and the AKP catalogue in Detail
            </button>
          </div>
        }
      >
      <div className="flex flex-wrap gap-2 self-start rounded-12 border border-adm-line bg-adm-surface p-4" role="tablist" aria-label="View">
        {TABS.map((t) => (
          <button key={t.id} type="button" role="tab" aria-selected={tab === t.id} onClick={() => setTab(t.id)} className={`rounded-8 px-12 py-6 text-12 font-medium ${tab === t.id ? 'bg-adm-hover text-adm-ink' : 'text-adm-muted hover:text-adm-ink'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'all' && <AllStateFlips />}
      {tab === 'akps' && <AkpCatalogue />}
      {tab === 'sleep' && (
      <>
      {!NAV2 && summarySection}

      <Panel title="Key terms" description="The words this page and the wiki use, in plain English.">
        <dl className="grid gap-10 lg:grid-cols-2" data-key-terms>
          {KEY_TERMS.map((k) => (
            <div key={k.term} className="flex min-w-0 flex-col gap-2 rounded-8 border border-adm-line p-10">
              <dt className="text-13 font-semibold text-adm-ink">{k.term}</dt>
              <dd className="text-12 leading-relaxed text-adm-ink-2">{k.plain}</dd>
            </div>
          ))}
        </dl>
      </Panel>

      <SleepFlip />
      <HowWorkedOut examples={ex} />
      <CohortView />
      <Trajectories examples={ex} />
      </>
      )}
      </PageTabs>
    </div>
  )
}

/* ------------------------------------------------------------ The StateFlip */

function SleepFlip() {
  const who = whoHasIt()
  const bad = sleepScore(BAD_NIGHT)
  const good = sleepScore(GOOD_NIGHT)
  const ans = (n: typeof BAD_NIGHT, id: string) => ({ latency: `${n.latency} min`, wakings: `${n.wakings}`, hours: `${n.hours} h`, energy: `${n.energy} of 5` })[id]
  return (
    <Panel title="The sleep StateFlip, complete" description={`Physical dimension · universal need: restful sleep · from ${BAD_SCORE} to ${GOOD_SCORE} on the 0–100 sleep score.`}>
      <div className="grid gap-10 lg:grid-cols-2">
        {(['bad', 'good'] as const).map((k) => (
          <div key={k} className={`flex min-w-0 flex-col gap-6 rounded-8 border p-12 ${k === 'bad' ? 'border-adm-critical/40 bg-adm-critical/6' : 'border-adm-good/40 bg-adm-good/8'}`}>
            <div className="flex items-center justify-between gap-8">
              <span className="text-14 font-semibold text-adm-ink">{STATES[k].title}</span>
              <span className="text-20 font-semibold tabular-nums text-adm-ink">{k === 'bad' ? bad : good}</span>
            </div>
            <p className="text-13 text-adm-ink-2">{STATES[k].story}</p>
            <p className="text-11 text-adm-muted">{STATES[k].scales}</p>
          </div>
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[620px] text-left text-12">
          <thead className="text-11 text-adm-muted">
            <tr className="border-b border-adm-line">
              <th className="py-6 pr-10 font-medium">Marker (check-in question)</th>
              <th className="py-6 pr-10 font-medium">Bad</th>
              <th className="py-6 pr-10 font-medium">Good</th>
              <th className="py-6 pr-10 font-medium">Points of 25</th>
              <th className="py-6 font-medium">Based on</th>
            </tr>
          </thead>
          <tbody>
            {MARKERS.map((m) => (
              <tr key={m.id} className="border-b border-adm-line align-top last:border-0">
                <td className="py-6 pr-10">
                  <span className="font-semibold text-adm-ink">{m.label}</span>
                  <span className="block text-11 text-adm-muted">{m.question}</span>
                </td>
                <td className="py-6 pr-10 text-adm-ink-2">{m.bad}</td>
                <td className="py-6 pr-10 text-adm-ink-2">{m.good}</td>
                <td className="py-6 pr-10 tabular-nums text-adm-ink-2">
                  {ans(BAD_NIGHT, m.id)} → {r1(m.points(BAD_NIGHT[m.id]))}; {ans(GOOD_NIGHT, m.id)} → {r1(m.points(GOOD_NIGHT[m.id]))}
                </td>
                <td className="py-6 text-adm-ink-2">
                  <span className="mr-4">
                    <L l={m.label2} />
                  </span>
                  {m.basis}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-11 text-adm-muted">
        <L l="assumption" /> The points per answer are ours, chosen so a typical bad night scores {bad} and a typical good night {good}.{' '}
        {SCALE_SOURCES.map((s, i) => (
          <span key={s.id}>
            {i ? ' · ' : ''}
            <a href={s.url} target="_blank" rel="noreferrer" className="underline decoration-adm-axis underline-offset-2">
              {s.name}
            </a>
            : {s.cite}
          </span>
        ))}
      </p>

      <h3 className="text-13 font-semibold text-adm-ink">The path: X → Y → Z</h3>
      <ol className="grid gap-8 lg:grid-cols-3" data-milestones>
        {MILESTONES.map((m) => (
          <li key={m.id} className="flex min-w-0 flex-col gap-4 rounded-8 border border-adm-line p-12">
            <span className="flex items-center justify-between gap-6">
              <span className="text-14 font-semibold text-adm-ink">
                {m.id} · {m.title}
              </span>
              <span className="text-12 tabular-nums text-adm-muted">score ≥ {m.threshold}</span>
            </span>
            <span className="text-12 text-adm-ink-2">{m.what}</span>
            <span className="text-12 text-adm-ink-2">
              <span className="font-medium text-adm-ink">Check-in shows: </span>
              {m.shows}
            </span>
            <span className="inline-flex items-center gap-6 text-11 text-adm-muted">
              <span className={`size-8 rounded-full ${LAYER_DOT[m.layer]}`} aria-hidden="true" />
              {LAYER_TEXT[m.layer].name} layer ({LAYER_TEXT[m.layer].pace}) · DOJO {m.dojo.join(', ')}
            </span>
          </li>
        ))}
      </ol>
      <p className="text-11 text-adm-muted">
        <L l="assumption" /> Thresholds 45, 65 and 85 split the 60 points from bad to good into three equal steps, one per DOJO <Term id="causal-layer">causal layer</Term>.
      </p>

      <div className="grid gap-10 lg:grid-cols-2">
        <div className="flex min-w-0 flex-col gap-6 rounded-8 border border-adm-line p-12">
          <h3 className="text-13 font-semibold text-adm-ink">How it is measured</h3>
          <p className="text-12 text-adm-ink-2">{CHECK_IN.when}</p>
          <p className="text-12 text-adm-ink-2">{CHECK_IN.how}</p>
          <p className="text-12 text-adm-ink-2">{CHECK_IN.weekly}</p>
        </div>
        <div className="flex min-w-0 flex-col gap-6 rounded-8 border border-adm-line p-12" data-who>
          <h3 className="flex items-center justify-between gap-6 text-13 font-semibold text-adm-ink">
            Who has it <L l="computed" />
          </h3>
          <p className="text-12 text-adm-ink-2">
            Of the {who.personas} v4 personas, {who.poorSleepBand} sleep poorly or very poorly ({who.poorSleepBandRisk} of them <Term id="risk-flag">risk-flagged</Term>). For {who.sleepNeed} sleep is the <Term id="main-need">main need</Term>: weakest dimension physical, with poor sleep, a body clock out of sync, or habits costing sleep. {who.sleepNeedRisk} of those are risk-flagged and left out: they are shown Need help now?, never a programme.
          </p>
          <dl className="grid grid-cols-3 gap-6 text-12">
            {(['severe', 'moderate', 'mild'] as const).map((s) => (
              <div key={s} className="rounded-8 bg-adm-bg p-8">
                <dt className="text-11 capitalize text-adm-muted">{s}</dt>
                <dd className="text-16 font-semibold tabular-nums text-adm-ink">{who.bySeverity[s]}</dd>
              </div>
            ))}
          </dl>
          <p className="text-11 text-adm-muted">
            The group: {who.cohort.length} people, average starting score {r1(who.meanScore)}. Severity from the starting score: under 40 severe, 40–64 moderate, 65–84 mild. By issue: poor sleep {who.byIssue['poor-sleep']}, body clock {who.byIssue['body-clock']}, habits {who.byIssue.habits}.
          </p>
        </div>
      </div>

      <Details id="dojo" title={`DOJO links (${DOJO_LINKS.length})`} hint="the workbook rows this StateFlip draws on, by ID">
        <p className="text-12 text-adm-ink-2">{DOJO_LAYER_SOURCE}</p>
        <ul className="grid gap-8 lg:grid-cols-2" data-dojo-links>
          {DOJO_LINKS.map((d) => (
            <li key={d.id} className="flex min-w-0 flex-col gap-2 rounded-8 border border-adm-line p-10">
              <span className="flex flex-wrap items-center justify-between gap-6">
                <code className="text-11 text-adm-muted">{d.id}</code>
                <span className="inline-flex items-center gap-4 text-11 text-adm-muted">
                  <span className={`size-8 rounded-full ${LAYER_DOT[d.layer]}`} aria-hidden="true" />
                  {LAYER_TEXT[d.layer].name} · toward {d.milestone}
                </span>
              </span>
              <span className="text-12 font-semibold text-adm-ink">{d.name}</span>
              <span className="text-12 text-adm-ink-2">{d.says}</span>
            </li>
          ))}
        </ul>
        <p className="text-11 text-adm-muted">Source: docs/briefs/2026-11-26-dojo-objective-learning.xlsx (sheets DOJO_M, DOJO_C_Duals, Causal layering, DB-skills, Objective Learning System KB).</p>
      </Details>
    </Panel>
  )
}

/* ------------------------------------------------------- How it is worked out */

function HowWorkedOut({ examples }: { examples: { severity: string; person: PersonFlip }[] }) {
  const spec = specFlat()
  const rows: { label: string; spec: string; get: (p: PersonFlip) => string }[] = [
    { label: 'Starting sleep score', spec: '25', get: (p) => `${p.start} (${p.severity})` },
    { label: 'Chapters a week', spec: '3', get: (p) => `${p.perWeek}` },
    { label: 'How long it has gone on', spec: '—', get: (p) => p.acuity },
    { label: 'Chapters to X (45)', spec: '—', get: (p) => `${p.reach.X}` },
    { label: 'Chapters to Y (65)', spec: '—', get: (p) => `${p.reach.Y}` },
    { label: 'Chapters to flip (85)', spec: `${spec.chapters}`, get: (p) => `${p.chapters}` },
    { label: 'Weeks to flip', spec: `${r1(spec.chapters / 3)}`, get: (p) => r1(p.weeks) },
    { label: 'Base chance (spec)', spec: pct(spec.chance), get: (p) => pct(p.chance.base) },
    { label: '× adherence', spec: '1', get: (p) => r1(p.chance.adherence) },
    { label: '× readiness', spec: '—', get: (p) => `${p.chance.readiness.toFixed(2)} (from ${p.readiness})` },
    { label: '× severity', spec: '—', get: (p) => `${p.chance.severity}` },
    { label: '× fit', spec: '—', get: (p) => `${p.chance.fit} (${p.topHelper})` },
    { label: '= chance it works', spec: pct(spec.chance), get: (p) => pct(p.chance.chance) },
    { label: 'Still going at the end', spec: '—', get: (p) => pct(p.survival) },
  ]
  return (
    <Panel title="How “chapters to flip” and “chance it works” are worked out" description="The spec gives everyone 42 chapters and 54%. Here both depend on the person, with every factor shown.">
      <div className="grid gap-10 lg:grid-cols-2">
        <div className="flex min-w-0 flex-col gap-6 rounded-8 bg-adm-bg p-12 text-12 leading-relaxed text-adm-ink" data-formulas>
          <p className="font-semibold">Chapters to flip</p>
          <p>Each chapter adds: 1.43 (spec) × layer speed × starting point × how long it has gone on.</p>
          <p>Layer speed: mood ×1.6 below 45, habit ×1.05 from 45 to 65, skill ×0.72 from 65 to 85. Early chapters move the score fastest; the last stretch, a new skill, is slowest.</p>
          <p>Chapters to flip = the chapters it takes for the score to pass 85, adding one chapter at a time.</p>
          <p className="pt-6 font-semibold">Chance it works</p>
          <p>54% (spec) × adherence × readiness × severity × fit, kept between 5% and 90%.</p>
          <p className="text-adm-ink-2">With everything average (start 25, 3 a week) the curve gives exactly the spec’s 42 chapters, so the two agree where the spec’s assumptions hold.</p>
        </div>
        <ul className="flex min-w-0 flex-col gap-6">
          {factors().map((f) => (
            <li key={f.id} className="flex flex-col gap-2 rounded-8 border border-adm-line p-8">
              <span className="flex flex-wrap items-center justify-between gap-6">
                <span className="text-12 font-semibold text-adm-ink">{f.name}</span>
                <L l={f.label} />
              </span>
              <span className="text-12 tabular-nums text-adm-ink">{f.value}</span>
              <span className="text-11 text-adm-muted">{f.why}</span>
            </li>
          ))}
        </ul>
      </div>

      <h3 className="text-13 font-semibold text-adm-ink">Worked example: three people from the group</h3>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-12" data-worked-example>
          <thead className="text-11 text-adm-muted">
            <tr className="border-b border-adm-line">
              <th className="py-6 pr-10 font-medium">
                <L l="computed" />
              </th>
              <th className="py-6 pr-10 font-medium">
                Spec, flat <L l="spec" />
              </th>
              {examples.map((e) => (
                <th key={e.person.id} className="py-6 pr-10 font-medium">
                  <span className="block font-semibold capitalize text-adm-ink">{e.severity}</span>
                  {e.person.name}, {e.person.age}, {e.person.country}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.label} className={`border-b border-adm-line last:border-0 ${r.label.startsWith('=') || r.label.startsWith('Chapters to flip') ? 'font-semibold text-adm-ink' : 'text-adm-ink-2'}`}>
                <td className="py-6 pr-10">{r.label}</td>
                <td className="py-6 pr-10 tabular-nums">{r.spec}</td>
                {examples.map((e) => (
                  <td key={e.person.id} className="py-6 pr-10 tabular-nums">
                    {r.get(e.person)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Details title="Each formula with the numbers in it" hint="for the three people">
        {examples.map((e) => (
          <div key={e.person.id} className="flex flex-col gap-4">
            <p className="text-12 font-semibold capitalize text-adm-ink">
              {e.severity}: {e.person.name} ({e.person.id})
            </p>
            <ul className="flex flex-col gap-2 text-12 text-adm-ink-2">
              {e.person.why.map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
          </div>
        ))}
      </Details>
      <p className="text-12 text-adm-ink-2">
        <span className="font-semibold text-adm-ink">Why it differs from the spec. </span>
        The spec assumes everyone starts at 25, uses Aurelia 3 times a week and is equally likely to succeed. Real starting points range from about 15 to 80: a mild start needs far fewer chapters, a severe one more. People who are not yet ready, or whom audio does not suit, are less likely to get there; people who use it more often are a little more likely. Averaged over the group, the chance comes out at {pct(sleepCohort().meanChance)} rather than 54%.
      </p>
    </Panel>
  )
}

/* -------------------------------------------------------------- The cohort */

const W = 880
const H = 300
const PL = 52
const PR = 40
const PT = 16
const PB = 44

function useChapterDrawer() {
  const open = useDetail()
  const c = sleepCohort()
  return (row: ChapterRow) => {
    const d = driverOf(row.layer)
    const links = DOJO_LINKS.filter((x) => x.layer === row.layer)
    open({
      kicker: `Chapter ${row.chapter} · ${LAYER_TEXT[row.layer].name} layer`,
      title: `After chapter ${row.chapter}`,
      summary: `Of the ${c.people.length} people who started. What drives this stretch: the ${LAYER_TEXT[row.layer].name.toLowerCase()} layer (${LAYER_TEXT[row.layer].pace}). ${LAYER_TEXT[row.layer].plain} Therapeutic metric that moves: ${d.metric.toLowerCase()}.`,
      numbers: [
        { label: 'Still going', value: pct(row.active) },
        { label: 'Stopped', value: pct(row.dropped) },
        { label: 'Sleeping well (flipped)', value: pct(row.flipped) },
        { label: 'Finished, not helped', value: pct(row.notHelped) },
        { label: 'Average score, still going', value: Number.isFinite(row.scoreActive) ? r1(row.scoreActive) : '—' },
        { label: 'Reached X (45)', value: pct(row.reached.X) },
        { label: 'Reached Y (65)', value: pct(row.reached.Y) },
        { label: 'Average score, everyone', value: r1(row.scoreAll) },
        { label: 'Of those going: mood / habit / skill', value: `${pct(row.layerMix.mood)} / ${pct(row.layerMix.habit)} / ${pct(row.layerMix.skill)}` },
      ],
      extra: (
        <div className="flex flex-col gap-6">
          <h3 className="text-12 font-semibold uppercase tracking-wider text-adm-muted">DOJO concepts at work</h3>
          <ul className="flex flex-col gap-4 text-12 text-adm-ink-2">
            {links.map((x) => (
              <li key={x.id}>
                <span className="font-semibold text-adm-ink">{x.name}</span> · {x.says}
              </li>
            ))}
          </ul>
        </div>
      ),
    })
  }
}

function Legend({ items }: { items: { label: string; cls: string; dash?: boolean }[] }) {
  return (
    <div className="flex flex-wrap items-center gap-x-14 gap-y-4 text-12 text-adm-ink-2">
      {items.map((i) => (
        <span key={i.label} className="inline-flex items-center gap-6">
          <svg width="16" height="4" aria-hidden="true">
            <line x1="0" x2="16" y1="2" y2="2" strokeWidth="3" strokeDasharray={i.dash ? '4 3' : undefined} className={i.cls} />
          </svg>
          {i.label}
        </span>
      ))}
    </div>
  )
}

function ChapterChart({ yLabel, yTicks, yFmt, series, bands, aria, children }: {
  yLabel: string
  yTicks: number[]
  yFmt: (v: number) => string
  series: { key: string; cls: string; dash?: boolean; values: (number | null)[] }[]
  bands?: ReactNode
  aria: string
  children?: (x: (i: number) => number, y: (v: number) => number) => ReactNode
}) {
  const c = sleepCohort()
  const openChapter = useChapterDrawer()
  const [hover, setHover] = useState<number | null>(null)
  const n = c.rows.length
  const max = yTicks[yTicks.length - 1]
  const x = (i: number) => PL + (i * (W - PL - PR)) / (n - 1)
  const y = (v: number) => PT + (1 - v / max) * (H - PT - PB)
  const path = (vs: (number | null)[]) => {
    let d = ''
    let pen = false
    vs.forEach((v, i) => {
      if (v === null || !Number.isFinite(v)) {
        pen = false
        return
      }
      d += `${pen ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)} `
      pen = true
    })
    return d
  }
  const step = (W - PL - PR) / (n - 1)
  return (
    <div className="relative overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} className="block w-full min-w-[640px]" role="img" aria-label={aria}>
        {bands}
        <text x={12} y={PT + (H - PT - PB) / 2} transform={`rotate(-90 12 ${PT + (H - PT - PB) / 2})`} textAnchor="middle" className="fill-adm-muted text-11">
          {yLabel}
        </text>
        <text x={PL + (W - PL - PR) / 2} y={H - 4} textAnchor="middle" className="fill-adm-muted text-11">
          Chapter (tap one for the breakdown)
        </text>
        {yTicks.map((v) => (
          <g key={v}>
            <line x1={PL} x2={W - PR} y1={y(v)} y2={y(v)} className="stroke-adm-grid" strokeWidth={1} />
            <text x={PL - 6} y={y(v) + 4} textAnchor="end" className="fill-adm-muted text-11 tabular-nums">
              {yFmt(v)}
            </text>
          </g>
        ))}
        {c.rows.filter((r) => r.chapter % 10 === 0 || r.chapter === c.horizon).map((r) => (
          <text key={r.chapter} x={x(r.chapter)} y={H - PB + 16} textAnchor="middle" className="fill-adm-ink-2 text-11 tabular-nums">
            {r.chapter}
          </text>
        ))}
        {children?.(x, y)}
        {hover !== null && <line x1={x(hover)} x2={x(hover)} y1={PT} y2={H - PB} className="stroke-adm-axis" strokeWidth={1} />}
        {series.map((s) => (
          <path key={s.key} d={path(s.values)} fill="none" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" strokeDasharray={s.dash ? '5 4' : undefined} className={s.cls} />
        ))}
        {c.rows.map((r) => (
          <rect
            key={r.chapter}
            x={x(r.chapter) - step / 2}
            y={0}
            width={step}
            height={H - PB}
            fill="transparent"
            data-chapter={r.chapter}
            className="cursor-pointer"
            onMouseEnter={() => setHover(r.chapter)}
            onMouseLeave={() => setHover(null)}
            onClick={() => openChapter(r)}
          />
        ))}
      </svg>
      {hover !== null && (
        <div className="pointer-events-none absolute top-0 right-0 max-w-[240px] rounded-8 border border-adm-line bg-adm-surface p-8 text-12 shadow-sm">
          <p className="font-semibold text-adm-ink">Chapter {hover}</p>
          {series.map((s) => (
            <p key={s.key} className="tabular-nums text-adm-ink-2">
              {s.key}: {s.values[hover] === null || !Number.isFinite(s.values[hover]!) ? '—' : yFmt(s.values[hover]!)}
            </p>
          ))}
        </div>
      )}
    </div>
  )
}

function CohortView() {
  const c = sleepCohort()
  const openChapter = useChapterDrawer()
  const spec = specFlat()
  const specLine = c.rows.map((r) => (r.chapter <= spec.chapters ? BAD_SCORE + ((GOOD_SCORE - BAD_SCORE) * r.chapter) / spec.chapters : null))
  // Stretches of chapters by the layer the average person still going is in.
  const phases: { layer: Layer; from: number; to: number }[] = []
  for (const r of c.rows) {
    if (!Number.isFinite(r.scoreActive)) break
    const lastP = phases[phases.length - 1]
    if (lastP && lastP.layer === r.layer) lastP.to = r.chapter
    else phases.push({ layer: r.layer, from: r.chapter, to: r.chapter })
  }
  const pick = [1, 5, 10, 20, 30, 42, c.horizon].filter((k, i, a) => k <= c.horizon && a.indexOf(k) === i)
  return (
    <Panel title="The group over time: chapter by chapter" description={`${c.people.length} people whose main need is sleep (risk-flagged left out), followed through ${c.horizon} chapters with the formulas above. Each line is a share or an average of the whole group.`}>
      <h3 className="text-13 font-semibold text-adm-ink">Average sleep score</h3>
      <Legend items={[{ label: 'Still going', cls: 'stroke-adm-s1' }, { label: 'Everyone who started (stopped people at their last score)', cls: 'stroke-adm-s2' }, { label: 'Spec: a straight 1.43 a chapter', cls: 'stroke-adm-muted', dash: true }]} />
      <ChapterChart
        yLabel="Sleep score (0–100)"
        yTicks={[0, 25, 45, 65, 85, 100]}
        yFmt={(v) => r1(v)}
        aria="Line chart: average sleep score by chapter, still going and everyone, against the spec’s straight line"
        series={[
          { key: 'Still going', cls: 'stroke-adm-s1', values: c.rows.map((r) => r.scoreActive) },
          { key: 'Everyone', cls: 'stroke-adm-s2', values: c.rows.map((r) => r.scoreAll) },
          { key: 'Spec', cls: 'stroke-adm-muted', dash: true, values: specLine },
        ]}
      >
        {(x, y) => (
          <g aria-hidden="true">
            {([['mood', 0, 45], ['habit', 45, 65], ['skill', 65, 85]] as [Layer, number, number][]).map(([l, a, b]) => (
              <rect key={l} x={x(0)} width={x(c.horizon) - x(0)} y={y(b)} height={y(a) - y(b)} className={LAYER_FILL[l]} opacity={0.08} />
            ))}
            {MILESTONES.map((m) => (
              <text key={m.id} x={x(c.horizon) + 6} y={y(m.threshold) + 4} className="fill-adm-ink-2 text-11 font-semibold">
                {m.id}
              </text>
            ))}
          </g>
        )}
      </ChapterChart>

      <h3 className="text-13 font-semibold text-adm-ink">Where the group is</h3>
      <Legend items={[{ label: 'Still going', cls: 'stroke-adm-s1' }, { label: 'Reached X', cls: 'stroke-adm-s3' }, { label: 'Reached Y', cls: 'stroke-adm-s4' }, { label: 'Flipped (Z)', cls: 'stroke-adm-good' }, { label: 'Stopped', cls: 'stroke-adm-critical', dash: true }, { label: 'Finished, not helped', cls: 'stroke-adm-muted', dash: true }]} />
      <ChapterChart
        yLabel="Share of the group"
        yTicks={[0, 0.25, 0.5, 0.75, 1]}
        yFmt={pct}
        aria="Line chart: share still going, reached X, reached Y, flipped and stopped, by chapter"
        series={[
          { key: 'Still going', cls: 'stroke-adm-s1', values: c.rows.map((r) => r.active) },
          { key: 'Reached X', cls: 'stroke-adm-s3', values: c.rows.map((r) => r.reached.X) },
          { key: 'Reached Y', cls: 'stroke-adm-s4', values: c.rows.map((r) => r.reached.Y) },
          { key: 'Flipped', cls: 'stroke-adm-good', values: c.rows.map((r) => r.flipped) },
          { key: 'Stopped', cls: 'stroke-adm-critical', dash: true, values: c.rows.map((r) => r.dropped) },
          { key: 'Not helped', cls: 'stroke-adm-muted', dash: true, values: c.rows.map((r) => r.notHelped) },
        ]}
      />
      <p className="text-11 text-adm-muted">
        Reached X and Y include people who started above those scores (chapter 0). Flipped people leave the journey, so “still going” falls both as people stop and as people succeed. “Finished, not helped”: people who played all the chapters a responder would need without reaching good sleep; Aurelia would then offer them something else.
      </p>

      <h3 className="text-13 font-semibold text-adm-ink">What drives each step</h3>
      <ol className="grid gap-8 lg:grid-cols-3" data-phases>
        {phases.map((p) => {
          const d = driverOf(p.layer)
          return (
            <li key={p.layer} className="flex min-w-0 flex-col gap-4 rounded-8 border border-adm-line p-12">
              <span className="inline-flex items-center gap-6 text-12 font-semibold text-adm-ink">
                <span className={`size-8 rounded-full ${LAYER_DOT[p.layer]}`} aria-hidden="true" />
                Chapters {p.from}–{p.to}: {LAYER_TEXT[p.layer].name} layer, toward {d.id}
              </span>
              <span className="text-12 text-adm-ink-2">{LAYER_TEXT[p.layer].plain}</span>
              <span className="text-12 text-adm-ink-2">
                <span className="font-medium text-adm-ink">Metric that moves: </span>
                {d.metric}
              </span>
              <span className="text-11 text-adm-muted">DOJO: {d.dojo.join(', ')}</span>
              {p.layer === 'mood' ? (
                <span className="flex flex-col gap-4 text-12 text-adm-ink-2" data-akp-drivers>
                  <span className="font-medium text-adm-ink">AKP drivers (chapter 1 as the template):</span>
                  {CHAPTER_PHASES.map((ph) => (
                    <span key={ph.id}>
                      <span className="font-medium text-adm-ink">{ph.name}</span> ({pct(ph.share)}): {ph.drivers.map((id) => chapterNodeById(id)!.name).join(', ')}
                    </span>
                  ))}
                  <span className="text-11 text-adm-muted">The 20 AKPs and 30 links are in AKP catalogue → How AKPs relate. Shares per phase: assumption.</span>
                </span>
              ) : (
                <span className="text-11 text-adm-muted">
                  <L l="assumption" /> No AKP drivers defined for this stretch yet: the curve here is the assumed {LAYER_TEXT[p.layer].name.toLowerCase()}-layer pace.
                </span>
              )}
            </li>
          )
        })}
      </ol>
      <p className="text-11 text-adm-muted">
        <L l="assumption" /> The stretch is set by the average score of the people still going. Individuals move through the layers at their own pace.
      </p>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px] text-left text-12" data-cohort-table>
          <thead className="text-11 text-adm-muted">
            <tr className="border-b border-adm-line">
              {['Chapter', 'Average score (still going)', 'Still going', 'Reached X', 'Reached Y', 'Flipped', 'Stopped', 'Not helped', ''].map((h) => (
                <th key={h} className="py-6 pr-10 font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pick.map((k) => {
              const r = c.rows[k]
              return (
                <tr key={k} className="border-b border-adm-line tabular-nums text-adm-ink-2 last:border-0">
                  <td className="py-6 pr-10 font-semibold text-adm-ink">{k}</td>
                  <td className="py-6 pr-10">{Number.isFinite(r.scoreActive) ? r1(r.scoreActive) : '—'}</td>
                  <td className="py-6 pr-10">{pct(r.active)}</td>
                  <td className="py-6 pr-10">{pct(r.reached.X)}</td>
                  <td className="py-6 pr-10">{pct(r.reached.Y)}</td>
                  <td className="py-6 pr-10">{pct(r.flipped)}</td>
                  <td className="py-6 pr-10">{pct(r.dropped)}</td>
                  <td className="py-6 pr-10">{pct(r.notHelped)}</td>
                  <td className="py-6">
                    <button type="button" onClick={() => openChapter(r)} className="inline-flex items-center gap-4 text-12 font-medium text-adm-ink underline decoration-adm-axis underline-offset-2">
                      Breakdown <PanelRightOpen size={12} aria-hidden="true" />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <p className="text-12 text-adm-ink-2">
        <span className="font-semibold text-adm-ink">Cost per flip for this group: {usd(c.costPerFlip)}</span> <L l="computed" /> = {usd(c.costPerChapter)} a chapter (Cost report, middle option, 10 minutes, stage 1) × {r1(c.chaptersPlayed)} chapters played per person on average ÷ {pct(c.meanChance)}. The spec journey costs {usd(spec.costPerFlip)} per flip on the same prices (42 chapters ÷ 54%).
      </p>
    </Panel>
  )
}

/* -------------------------------------------------------- Per-person paths */

const PERSON_CLS = ['stroke-adm-s1', 'stroke-adm-s2', 'stroke-adm-s3']

function Trajectories({ examples }: { examples: { severity: string; person: PersonFlip }[] }) {
  const max = Math.max(...examples.map((e) => e.person.chapters))
  const w = 880
  const h = 260
  const x = (i: number) => PL + (i * (w - PL - PR)) / max
  const y = (v: number) => PT + (1 - v / 100) * (h - PT - PB)
  return (
    <Panel title="Three people, chapter by chapter" description="If it works for them: the score each check-in would show, from their own start to good sleep.">
      <Legend items={examples.map((e, i) => ({ label: `${e.severity}: ${e.person.name} (${e.person.start} → 85 in ${e.person.chapters}, chance ${pct(e.person.chance.chance)})`, cls: PERSON_CLS[i] }))} />
      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${w} ${h}`} className="block w-full min-w-[640px]" role="img" aria-label="Line chart: sleep score by chapter for three example people">
          <text x={12} y={PT + (h - PT - PB) / 2} transform={`rotate(-90 12 ${PT + (h - PT - PB) / 2})`} textAnchor="middle" className="fill-adm-muted text-11">
            Sleep score
          </text>
          <text x={PL + (w - PL - PR) / 2} y={h - 4} textAnchor="middle" className="fill-adm-muted text-11">
            Chapter
          </text>
          {[0, 25, 45, 65, 85, 100].map((v) => (
            <g key={v}>
              <line x1={PL} x2={w - PR} y1={y(v)} y2={y(v)} className="stroke-adm-grid" strokeWidth={1} />
              <text x={PL - 6} y={y(v) + 4} textAnchor="end" className="fill-adm-muted text-11 tabular-nums">
                {v}
              </text>
            </g>
          ))}
          {MILESTONES.map((m) => (
            <text key={m.id} x={w - PR + 6} y={y(m.threshold) + 4} className="fill-adm-ink-2 text-11 font-semibold">
              {m.id}
            </text>
          ))}
          {Array.from({ length: Math.floor(max / 10) + 1 }, (_, i) => i * 10).map((k) => (
            <text key={k} x={x(k)} y={h - PB + 16} textAnchor="middle" className="fill-adm-ink-2 text-11 tabular-nums">
              {k}
            </text>
          ))}
          {examples.map((e, i) => (
            <path key={e.person.id} d={e.person.responderPath.map((s, k) => `${k ? 'L' : 'M'}${x(k).toFixed(1)},${y(s).toFixed(1)}`).join(' ')} fill="none" strokeWidth={2} strokeLinejoin="round" className={PERSON_CLS[i]} />
          ))}
        </svg>
      </div>
      <p className="text-12 text-adm-ink-2">
        <RichText text="Each line bends where the person moves from the mood stretch to the habit stretch (at 45) and to the skill stretch (at 65): the curve flattens because skills take longest. A person this does not help would improve at half the speed and stall below Y; that is part of {{chance-it-works|chance it works}}, not of this line." />
      </p>
    </Panel>
  )
}
