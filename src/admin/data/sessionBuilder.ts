/**
 * Admin → AI brain → How a session is built (U148, J206). The business
 * owner's "Cascading logic - Meta, Path, Script" tab of the BAR / ELEMENTS
 * workbook (docs/briefs/2026-11-27-bar-elements-operating-model.xlsx): 16
 * steps in three domains, META (1–3) → PATH (4–10) → SCRIPT (11–16), joined by
 * a context loop. For each step: what it is for, its inputs and databases (the
 * workbook's words), which of our data and AKPs would feed it, its output, what
 * exists in our app and API contract v2 today, and what is missing.
 *
 * Then one worked example: chapter 1 (wind-down) of the sleep StateFlip for
 * one person of the sleep cohort, with a value at every step. Values from the
 * workbook say so (BARS, ELEMENTS, CFAM, Wellness Script Assessment
 * Framework); the rest is our draft. Nothing here has been run by a model.
 *
 * Pure: no React, deterministic.
 */

import { akpsForFlip } from './akps'
import { examplePeople, sleepCohort, type PersonFlip } from './stateFlipFormulas'
import { MARKERS, MILESTONES, layerAt } from './stateFlipSleep'

export type Domain = 'META' | 'PATH' | 'SCRIPT'
export type BuildState = 'exists' | 'partial' | 'missing'
export type ValueSource = 'workbook' | 'computed' | 'draft'

export const DOMAIN_TEXT: Record<Domain, { title: string; plain: string }> = {
  META: { title: 'Meta', plain: 'Who this is for and what it must achieve, in how much time.' },
  PATH: { title: 'Path', plain: 'How to get there: the objective, the methods, techniques and frameworks, the plan of bars and elements, and a score for how well it all fits.' },
  SCRIPT: { title: 'Script', plain: 'The words: skeleton, synopsis, tone, outline, voices and setting. Music, voice and image are made after this.' },
}

export const STATE_TEXT: Record<BuildState, string> = { exists: 'Exists', partial: 'Partly', missing: 'Missing' }
export const VALUE_TEXT: Record<ValueSource, string> = { workbook: 'From the workbook', computed: 'Computed', draft: 'Our draft' }

export interface CascadeStep {
  n: number
  domain: Domain
  /** The workbook's tab name. */
  name: string
  purpose: string
  /** The workbook's inputs. */
  inputs: string
  /** The workbook's connected databases. */
  databases: string
  /** Our data and AKPs that would feed it. */
  feeds: string
  /** The workbook's output. */
  output: string
  today: string
  missing: string
  state: BuildState
}

export const CASCADE: CascadeStep[] = [
  {
    n: 1, domain: 'META', name: 'Script duration logic',
    purpose: 'Fix the length first, because it caps how many words, bars and elements fit and how deep the chapter can go.',
    inputs: 'Desired duration (short, medium, long); time constraints', databases: 'Script foundations, Duration mapping, Complexity configuration',
    feeds: 'The person’s minutes a day (persona condition), the chapter length choice', output: 'A time budget split into sub-modules',
    today: 'POST /builds takes chapterMinutes 3, 5 or 10; the cost model prices a 10-minute chapter.',
    missing: 'The duration table: minutes → word range, maximum bars and elements, pacing.', state: 'partial',
  },
  {
    n: 2, domain: 'META', name: 'Foundations of wellness goals',
    purpose: 'Name the primary goal and the secondary outcomes, ranked, so every later step serves the same thing.',
    inputs: 'Primary goals (relaxation, mindfulness); secondary outcomes (clarity)', databases: 'Goals mapping, Skills and states library',
    feeds: 'The 125 StateFlips, their milestones X → Y → Z and goal AKPs (WG-…)', output: 'Foundational prompts aligned to the goal',
    today: 'StateFlips and goal AKPs in the admin; API v2 §4.9 StateFlip and POST /journeys (fromState → toState).',
    missing: 'Ranking of secondary outcomes; the app’s journey domains are five words (sleep, stress, focus, mood, other), not the 125 StateFlips.', state: 'partial',
  },
  {
    n: 3, domain: 'META', name: 'Personalisation profiles',
    purpose: 'Bring in who the person is and how they are today, so the same goal gives a different chapter for a different person.',
    inputs: 'Demographics, psychographics; emotional and situational context', databases: 'Personalisation, Context attributes',
    feeds: 'Persona v4 condition (severity, acuity, helpers, minutes a day, readiness), Wellness Identity (12 dimensions), the first sentence, check-ins', output: 'User-centred, adaptable prompts',
    today: 'Synthetic profiles only (persona set v4, GET /admin/personas/{id}/identity). The app keeps the first sentence and onboarding answers in the browser.',
    missing: 'A real profile store with consent, and a rule for which fields reach the prompt.', state: 'partial',
  },
  {
    n: 4, domain: 'PATH', name: 'Objectives and themes',
    purpose: 'Turn the goal into this chapter’s objective and a theme that carries it.',
    inputs: 'High-level objective (e.g. mindfulness meditation); themes (e.g. nature)', databases: 'Objectives library, Theme mapping',
    feeds: 'The milestone the chapter aims at (X, Y or Z) and its layer (mood, habit, skill)', output: 'Prompts with a clear objective and theme',
    today: 'API v2 Chapter.milestone says which step a chapter aims at.',
    missing: 'A theme library.', state: 'partial',
  },
  {
    n: 5, domain: 'PATH', name: 'Methods library',
    purpose: 'Choose the practice: breathing, body scan, journaling, visualisation.',
    inputs: 'Preferred methods (journaling, guided breathing)', databases: 'Methods, Techniques library',
    feeds: 'Strategy AKPs (script concepts) linked to the StateFlip; the person’s top helper', output: 'Modular prompts with the method embedded',
    today: 'Draft strategy AKPs per StateFlip in the AKP catalogue (concepts, skills).',
    missing: 'A methods table with instructions and compatibility, as in the workbook’s PathAtlas.', state: 'partial',
  },
  {
    n: 6, domain: 'PATH', name: 'Techniques library',
    purpose: 'Pick the exact technique and its steps, for example a longer out-breath or a body scan from the feet up.',
    inputs: 'Specific techniques (4-7-8 breathing, body scanning)', databases: 'Techniques library, Script flow',
    feeds: 'Technique AKPs (to import), the DOJO concepts on the StateFlip', output: 'Step-by-step guidance prompts',
    today: '“Change this session” offers Lego bites of kind pace, voice, music, script, image, length.',
    missing: 'A techniques table with steps, timing and contraindications.', state: 'missing',
  },
  {
    n: 7, domain: 'PATH', name: 'Frameworks library',
    purpose: 'Give the chapter a structure that holds: a goal frame, emotional scaffolding.',
    inputs: 'Chosen frameworks (SMART goals, emotional scaffolding)', databases: 'Frameworks library, Alignment',
    feeds: 'Workbook tab “Frameworks KB (improve ElementID)”', output: 'Framework-guided prompts',
    today: 'Nothing.', missing: 'The frameworks table, imported from the workbook.', state: 'missing',
  },
  {
    n: 8, domain: 'PATH', name: 'Wellness script planner',
    purpose: 'Lay out the chapter: which bars (Start, Middle, End) and which elements in each, and how many seconds each gets.',
    inputs: 'Desired sections (introduction, activity, conclusion)', databases: 'Script planner, Alignment',
    feeds: 'BARS (OB, SB, TB, QB) and ELEMENTS (E01…) from the workbook, the time budget of step 1', output: 'A blueprint with a clear hierarchy',
    today: 'A build runs five steps (script, voice, music, image, mix). API v2 §4.9 Chapter.akps is an ordered list of AKPs.',
    missing: 'Bars and elements as data, and the rule that distributes time across them.', state: 'missing',
  },
  {
    n: 9, domain: 'PATH', name: 'Alignment scoring',
    purpose: 'Score the plan against the goal before writing, and say what to change.',
    inputs: 'Draft plans; criteria (coherence, resonance)', databases: 'Alignment scoring algorithms, Objectives library',
    feeds: 'CFAM metrics (Entropy Clarity Index, Engagement Continuity Rate, Reflection Depth, Element Satisfaction, Utility Score), past check-ins', output: 'Refined prompts with suggested improvements',
    today: 'The contract defines AKP tournaments with a Causal AI judge (GET /admin/tournaments); nothing scores yet.',
    missing: 'The scoring itself, and a way to measure entropy clarity. Until then the next morning’s check-in is the only outcome.', state: 'missing',
  },
  {
    n: 10, domain: 'PATH', name: 'Creative insights',
    purpose: 'Add the metaphor, image or story that makes it feel alive.',
    inputs: 'Request for metaphors, storytelling', databases: 'Creative insights, Theme library',
    feeds: 'Music and image AKPs (WM-, WI-), the theme of step 4', output: 'Prompts enriched with creative elements',
    today: 'The cockpit chat and cover images; music and image AKP families exist in the catalogue.',
    missing: 'A creative insights library tied to themes.', state: 'partial',
  },
  {
    n: 11, domain: 'SCRIPT', name: 'Foundations',
    purpose: 'Build the skeleton: main topic and audience, with placeholders.',
    inputs: 'Main topic, audience', databases: 'Script foundations, Goals mapping',
    feeds: 'Steps 1–3', output: 'A script skeleton',
    today: 'The first message of a conversation becomes the session’s title.', missing: 'A skeleton template.', state: 'partial',
  },
  {
    n: 12, domain: 'SCRIPT', name: 'Synopsis',
    purpose: 'Say in two sentences what this chapter does.',
    inputs: 'Key ideas or an overview', databases: 'Synopsis, Duration logic',
    feeds: 'Steps 4–8', output: 'A concise synopsis',
    today: 'Session.summary in the contract.', missing: 'Synopsis rules tied to objective and duration.', state: 'partial',
  },
  {
    n: 13, domain: 'SCRIPT', name: 'Style',
    purpose: 'Set tone, pace and language for this person.',
    inputs: 'Writing style (formal, conversational, poetic)', databases: 'Style attributes, Personalisation',
    feeds: 'Personalisation (step 3), voice and pace bites', output: 'Style-specific prompts',
    today: 'Lego bites of kind voice and pace change a built session.', missing: 'Style attributes chosen before writing, from the profile.', state: 'partial',
  },
  {
    n: 14, domain: 'SCRIPT', name: 'Outline',
    purpose: 'Write the ordered outline, one line per element, ready to expand into words.',
    inputs: 'Script outline (3-act, problem-solution)', databases: 'Outline mapping, Objectives library',
    feeds: 'The planner (step 8)', output: 'A detailed, expandable outline',
    today: 'GET /sessions/{id}/chapters lists chapters, not their inside.', missing: 'The element-level outline.', state: 'missing',
  },
  {
    n: 15, domain: 'SCRIPT', name: 'Characters',
    purpose: 'Decide who speaks: the guide, the inner self, a creator’s persona.',
    inputs: 'Character details (personas, archetypes)', databases: 'Character profiles, Theme library',
    feeds: 'Creator persona (retreat), voice choice', output: 'Character-driven prompts',
    today: 'A voice is picked at build time.', missing: 'Character profiles.', state: 'missing',
  },
  {
    n: 16, domain: 'SCRIPT', name: 'Worldbuilding',
    purpose: 'Describe the setting the listener imagines.',
    inputs: 'Setting (fantasy, realistic, abstract)', databases: 'Worldbuilding, Themes library',
    feeds: 'Theme (step 4), image AKPs', output: 'Setting prompts',
    today: 'The image step makes a cover.', missing: 'A worldbuilding library.', state: 'missing',
  },
]

/** The workbook's context loop ("Dependencies and Feedback Loops"), and ours. */
export const CONTEXT_LOOP: { path: string; workbook: string; ours: string }[] = [
  { path: 'Meta → Path → Script', workbook: 'Baseline metrics (states, skills) guide method selection and script objectives.', ours: 'StateFlip, milestone and persona choose the AKPs and the chapter.' },
  { path: 'Path → Meta → Script', workbook: 'Feedback on method effectiveness refines skill tracking and state clarity.', ours: 'Tournaments: AKPs that move people further are chosen more (not built).' },
  { path: 'Script → Path → Meta', workbook: 'Script metrics (CFAM) refine personalisation and entropy targets.', ours: 'The morning check-in updates the score, the milestone and chance it works; the next chapter follows.' },
]

/* ---------------------------------------------------------- Worked example */

export interface PlannerRow {
  phase: 'Start' | 'Middle' | 'End'
  bar: string
  barName: string
  element: string
  elementName: string
  /** The workbook's example seconds and words. */
  wbSeconds: number
  wbWords: number
  /** Our draft for a 10-minute bedtime chapter. */
  seconds: number
  words: number
  note: string
}

/**
 * Bars and elements from the workbook's BARS and ELEMENTS tabs (ids, names,
 * example times and words as given). The 10-minute seconds and words are our
 * draft: slower speech and longer pauses at bedtime (about 0.7 words a
 * second against the workbook's 1.25), and no closing summary, because a
 * bedtime chapter should end in quiet rather than wake the listener up.
 */
export const PLANNER: PlannerRow[] = [
  { phase: 'Start', bar: 'OB001', barName: 'Introduction', element: 'E12', elementName: 'Warm Welcome', wbSeconds: 5, wbWords: 10, seconds: 20, words: 15, note: 'Soft, by name if known.' },
  { phase: 'Start', bar: 'OB001', barName: 'Introduction', element: 'E02', elementName: 'Settling In', wbSeconds: 10, wbWords: 25, seconds: 40, words: 30, note: 'Lights low, lie down.' },
  { phase: 'Start', bar: 'OB001', barName: 'Introduction', element: 'E09', elementName: 'Setting Intentions', wbSeconds: 5, wbWords: 15, seconds: 20, words: 15, note: '“Let the day stay outside the room.”' },
  { phase: 'Start', bar: 'OB001', barName: 'Introduction', element: 'E06', elementName: 'Deep Breathing Exercise Intro', wbSeconds: 5, wbWords: 15, seconds: 20, words: 15, note: 'Bridges to the breath.' },
  { phase: 'Middle', bar: 'OB004', barName: 'Awareness', element: 'E01', elementName: 'Introduction to Mindful Breathing', wbSeconds: 10, wbWords: 25, seconds: 30, words: 25, note: 'Out-breath longer than in-breath.' },
  { phase: 'Middle', bar: 'OB004', barName: 'Awareness', element: 'E02', elementName: 'Guided Mindful Breathing', wbSeconds: 60, wbWords: 150, seconds: 150, words: 110, note: 'Counted, slowing; long pauses.' },
  { phase: 'Middle', bar: 'OB003', barName: 'Focused Attention', element: 'E01', elementName: 'Introduction to Body Scan', wbSeconds: 10, wbWords: 25, seconds: 20, words: 15, note: '' },
  { phase: 'Middle', bar: 'OB003', barName: 'Focused Attention', element: 'E02', elementName: 'Guided Body Scan', wbSeconds: 40, wbWords: 100, seconds: 180, words: 130, note: 'Feet to face, releasing.' },
  { phase: 'Middle', bar: 'TB002', barName: 'Focused Practice', element: 'E01', elementName: 'Brief Visualization', wbSeconds: 20, wbWords: 50, seconds: 60, words: 40, note: 'The setting of step 16.' },
  { phase: 'Middle', bar: 'TB002', barName: 'Focused Practice', element: 'E05', elementName: 'Brief Silence for Reflection', wbSeconds: 10, wbWords: 10, seconds: 30, words: 0, note: 'Music only.' },
  { phase: 'End', bar: 'OB005', barName: 'Reflection', element: 'E01', elementName: 'Reflection Text', wbSeconds: 20, wbWords: 50, seconds: 15, words: 10, note: 'One line, no question to answer.' },
  { phase: 'End', bar: 'OB005', barName: 'Reflection', element: 'E02', elementName: 'Reflective Pause', wbSeconds: 10, wbWords: 10, seconds: 15, words: 0, note: 'Fades out. OB006 Conclusion left out on purpose.' },
]

export interface CfamTarget {
  metric: string
  before: string
  target: string
  source: ValueSource
  how: string
}

/** CFAM metrics for this chapter. The Entropy Clarity example (0.7 → 0.3) is the workbook’s own, for a grounding session. */
export const CFAM_TARGETS: CfamTarget[] = [
  { metric: 'Entropy Clarity Index (SE)', before: '0.7', target: '0.3', source: 'workbook', how: 'Workbook CFAM tab: “Baseline entropy for a grounding session: 0.7, target reduction to 0.3.” No way to measure it yet; proxy: minutes to fall asleep in tomorrow’s check-in.' },
  { metric: 'Engagement Continuity Rate', before: '—', target: '≥ 0.8 of the chapter played', source: 'draft', how: 'PATCH /plays completionRatio. At bedtime a play that stops because the person fell asleep is a success, so it is read with the check-in.' },
  { metric: 'Reflection Depth Tag', before: '—', target: 'Light', source: 'draft', how: 'Bedtime: no questions to answer. The workbook ties depth to tone and pacing.' },
  { metric: 'Element Satisfaction Score', before: '—', target: '≥ 0.85', source: 'workbook', how: 'Workbook: “Affirmations score 0.85, making them central.” Ours would come from Lego-bite changes and quality reports per element.' },
  { metric: 'Utility Score (UI)', before: '—', target: 'Every element serves milestone X', source: 'draft', how: 'The plan is checked element by element against the objective of step 4.' },
]

export interface ExampleValue {
  n: number
  value: string
  source: ValueSource
}

export interface WorkedExample {
  person: PersonFlip
  goalAkp: string
  stepAkp: string
  concepts: { id: string; name: string }[]
  values: ExampleValue[]
  plannedSeconds: number
  plannedWords: number
  /** The alignment score of the draft plan, 0–1, and how it is made. */
  alignment: { score: number; parts: { label: string; value: number }[] }
}

let cache: WorkedExample | null = null

export function workedExample(): WorkedExample {
  if (cache) return cache
  const c = sleepCohort()
  const person = examplePeople(c).find((e) => e.severity === 'severe')?.person ?? c.people[0]
  const X = MILESTONES.find((m) => m.id === 'X')!
  const akps = akpsForFlip('SF-PHY-01')
  const concepts = akps.filter((a) => a.kind === 'strategy').map((a) => ({ id: a.id, name: a.name }))
  const name = (id: string) => concepts.find((x) => x.id === id)?.name ?? id
  const plannedSeconds = PLANNER.reduce((t, r) => t + r.seconds, 0)
  const plannedWords = PLANNER.reduce((t, r) => t + r.words, 0)
  const bars = new Set(PLANNER.map((r) => r.bar)).size
  // Draft alignment score: the share of planned time on elements that serve the objective (breath, body scan,
  // settling, silence), the fit of the pace to the 10-minute budget, and the method's fit to the top helper.
  const serving = PLANNER.filter((r) => /Breath|Body Scan|Settling|Silence|Visualization|Pause/.test(r.elementName)).reduce((t, r) => t + r.seconds, 0) / plannedSeconds
  const pace = Math.min(1, 1 - Math.abs(plannedWords / plannedSeconds - 0.75))
  const fit = person.topHelper === 'sleep audio' || person.topHelper === 'breath' || person.topHelper === 'voice guidance' ? 1 : 0.8
  const parts = [
    { label: 'Time on elements that serve X', value: serving },
    { label: 'Pace fits a bedtime chapter', value: pace },
    { label: 'Method fits their top helper', value: fit },
  ]
  const score = parts.reduce((t, p) => t + p.value, 0) / parts.length
  const r = Math.round
  const values: ExampleValue[] = [
    { n: 1, value: `10 minutes = ${plannedSeconds} seconds, about ${plannedWords} words (about ${(plannedWords / plannedSeconds).toFixed(2)} a second with pauses), ${bars} bars and ${PLANNER.length} elements. The workbook flags 700 words in 10 minutes as a drop-off risk.`, source: 'draft' },
    { n: 2, value: `Primary: bad sleep → good sleep (SF-PHY-01, 25 → 85). This chapter: step X, “${X.title}” (score ${X.threshold}). Secondary: calmer evening, fewer minutes to fall asleep.`, source: 'computed' },
    { n: 3, value: `${person.name}, ${person.age}, ${person.country}, scenario ${person.scenario}. Sleep score ${person.start} (${person.severity}), ${person.acuity}; ${person.perWeek} chapters a week; readiness ${person.readiness.toFixed(2)}; top helper: ${person.topHelper}. Chance it works ${r(person.chance.chance * 100)}%; X in about ${person.reach.X} chapters, the flip in ${person.chapters}.`, source: 'computed' },
    { n: 4, value: `Objective: relax in the hour before bed instead of carrying the day into it (${layerAt(person.start)} layer). Theme: “closing the day”, a room going quiet.`, source: 'draft' },
    { n: 5, value: `Guided breathing, then a body scan. From the AKPs: ${name('WS-LU-01')} (WS-LU-01) and ${name('WS-BL-02')} (WS-BL-02).`, source: 'draft' },
    { n: 6, value: 'Breathing with the out-breath longer than the in-breath (about 4 in, 6 out), slowing over 2½ minutes; body scan feet to face with a release on each out-breath.', source: 'draft' },
    { n: 7, value: 'Emotional scaffolding: arrive → settle → let go → rest. No goal-setting at bedtime (SMART left out).', source: 'draft' },
    { n: 8, value: `${PLANNER.length} elements in ${bars} bars, ${plannedSeconds} seconds: OB001 Introduction (E12, E02, E09, E06) → OB004 Awareness (E01, E02) → OB003 Focused Attention (E01, E02) → TB002 Focused Practice (E01, E05) → OB005 Reflection (E01, E02). Table below.`, source: 'workbook' },
    { n: 9, value: `Draft alignment score ${score.toFixed(2)}. Entropy clarity 0.7 → 0.3 (workbook example). Outcome checked tomorrow morning on ${MARKERS[0].label.toLowerCase()} and morning energy.`, source: 'draft' },
    { n: 10, value: 'Metaphor: “setting the day down like a bag by the door”. Music: slow ambient, no beat, fading in the last minute.', source: 'draft' },
    { n: 11, value: `Topic: winding down for sleep. Audience: one adult, ${person.severity} sleep trouble, listening in bed with the lights off.`, source: 'draft' },
    { n: 12, value: 'Ten quiet minutes to close the day: you settle, slow your breath until the out-breath is longer, let your body go heavy from the feet up, and drift into a still room.', source: 'draft' },
    { n: 13, value: 'Second person, warm and plain; short sentences; slower in each bar; no questions, no instructions to remember.', source: 'draft' },
    { n: 14, value: 'Welcome → settle in → intention → into the breath → longer out-breath → body scan → the quiet room → silence → one closing line → fade.', source: 'draft' },
    { n: 15, value: 'One voice: the Guide. No inner-self dialogue at bedtime.', source: 'draft' },
    { n: 16, value: 'A dim room at the end of the day, rain on the window, a warm blanket. The cover uses the same scene.', source: 'draft' },
  ]
  cache = {
    person,
    goalAkp: 'WG-PHY-01',
    stepAkp: 'WG-PHY-01-X',
    concepts,
    values,
    plannedSeconds,
    plannedWords,
    alignment: { score, parts },
  }
  return cache
}

export function cascadeSummary() {
  const count = (s: BuildState) => CASCADE.filter((c) => c.state === s).length
  return { steps: CASCADE.length, exists: count('exists'), partial: count('partial'), missing: count('missing') }
}
