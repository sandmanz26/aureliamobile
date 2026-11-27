// Persona set v4, current condition (U138, J190). Each of the 1,000 v4
// people gets a "current condition" profile across the five dimensions the
// business owner named (mental, emotional, relational, spiritual, physical),
// in wellness language, never a diagnosis. It is the one shared input for
// the buyer agent (test 8, through `conditionForBuyer`) and the cost model
// (through `conditionForCost`).
//
// Nothing in personasV4.ts changes: every condition is derived from the
// facts a persona already has (screening bands, sleep, stress, life
// situation, pain, caregiving, household, risk flag, age, habits). The small
// amount of chance it needs comes from its own seeded stream, one per person
// (CONDITION_SEED + the persona's number), so the published v4 set, its
// distributions and generators 1 and 2 stay byte-identical.
//
// Scales: every dimension score is 0–100 with 0 the worst, the Cost report's
// bad-to-good scale, banded by its quick conditions (Severe 15, Moderate 40,
// Mild 60, Good 85): the cut points sit halfway between them.

import { LENGTHS, PRESETS, clamp, goal, presetInputs, type CostInputs, type Stage } from './costModel'
import { DIMENSION_IDS, FIVE_DIMENSIONS, type Dimension } from './dimensions'
import { SCENARIOS, generatePersonasV4, type PersonaV4, type ScenarioId } from './personasV4'

export const CONDITION_SEED = 20265

/* ----------------------------------------------------------------- Types */

export type { Dimension }
/** The shared five (dimensions.ts, U145): one list for StateFlips, personas, the Healing Map and the Therapeutic map. */
export const DIMENSIONS: Dimension[] = DIMENSION_IDS
export const DIMENSION_LABEL = Object.fromEntries(FIVE_DIMENSIONS.map((d) => [d.id, d.label])) as Record<Dimension, string>
export const DIMENSION_PLAIN = Object.fromEntries(FIVE_DIMENSIONS.map((d) => [d.id, d.plain])) as Record<Dimension, string>

export type CondBand = 'severe' | 'moderate' | 'mild' | 'good'
export const COND_BANDS: CondBand[] = ['severe', 'moderate', 'mild', 'good']
/** The Cost report's quick conditions; a band's cut points sit halfway between them. */
export const QUICK_CONDITION: Record<CondBand, number> = { severe: 15, moderate: 40, mild: 60, good: 85 }
export const condBandOf = (score: number): CondBand => (score < 28 ? 'severe' : score < 50 ? 'moderate' : score < 73 ? 'mild' : 'good')

/** How much each dimension counts in the overall condition (assumption: physical and emotional lead because Aurelia starts from sleep and mood). */
export const DIMENSION_WEIGHT: Record<Dimension, number> = { mental: 0.2, emotional: 0.25, relational: 0.15, spiritual: 0.15, physical: 0.25 }

export type Acuity = 'acute' | 'ongoing' | 'long-standing'
export type Course = 'getting better' | 'stable' | 'getting worse'
export type Impact = 'none' | 'some' | 'marked'
export type Readiness = 'not yet' | 'thinking' | 'preparing' | 'acting' | 'maintaining'
export const READINESS: Readiness[] = ['not yet', 'thinking', 'preparing', 'acting', 'maintaining']
export type Support = 'alone' | 'some' | 'strong'
export type Help = 'GP' | 'therapist' | 'medication'
export type Coping = 'avoid' | 'distract' | 'talk' | 'move' | 'substances'
export type Helper = 'breath' | 'sleep audio' | 'voice guidance' | 'movement' | 'journaling' | 'music'
export type BestTime = 'morning' | 'midday' | 'evening' | 'night, in bed' | 'after a night shift' | 'changes with shifts'

export interface DimensionState {
  score: number
  band: CondBand
  /** Id into ISSUES[dimension]. */
  issue: string
  target: number
}

export interface ConditionV4 {
  id: string
  dims: Record<Dimension, DimensionState>
  overall: number
  overallBand: CondBand
  /** The weakest dimension: what Aurelia works on first. */
  mainNeed: Dimension
  acuity: Acuity
  /** How long it has been going on, in words (the persona's own duration). */
  howLong: string
  weeks: number
  course: Course
  impact: Impact
  readiness: Readiness
  /** Self-efficacy, 1–10: how sure they are that they can change it. */
  confidence: number
  support: Support
  /** Current help, as flags only. Empty means none. */
  help: Help[]
  /** Has asked anyone for help before (now or in the past). */
  soughtHelp: boolean
  coping: Coping
  /** What tends to help them, best first. */
  helpers: Helper[]
  minutesPerDay: number
  bestTime: BestTime
  /** The goal in their own words. */
  goal: string
  riskFlag: boolean
  routing: 'Need help now?' | 'normal'
  /** Risk-flagged people are never offered anything and are left out of cost. */
  excluded: boolean
}

/* ---------------------------------------------------- The 5 × 10 issues */

export interface Issue {
  id: string
  label: string
  /** The DOJO dual (issue → wellness) it comes from, with how often the issue appears in the workbook's duals sheet. */
  dojo: string
  /** What is known about how common it is. */
  prevalence: string
  source: string
  kind: 'measured' | 'assumption'
  /** One sentence, in the person's own words. */
  goal: string
  /** How likely this is their main issue in the dimension; 0 means it cannot be (incoherence checks that). */
  weight: (p: PersonaV4) => number
}

const sc = (p: PersonaV4, m: Partial<Record<ScenarioId, number>>, rest: number) => m[p.scenario] ?? rest
const notNone = (b: string) => b !== 'none'
const modPlus = (b: string) => b === 'moderate' || b === 'severe'
const working = (p: PersonaV4) => p.work === 'employed' || p.work === 'self-employed'

export const ISSUES: Record<Dimension, Issue[]> = {
  mental: [
    { id: 'racing-mind', label: 'Racing thoughts at night', dojo: 'Restlessness → Mental stillness', prevalence: 'Thinking too much in bed is the most common reason people give for insomnia', source: 'harvey', kind: 'measured', goal: 'I want to switch my mind off when I go to bed.', weight: (p) => (p.wellness.sleep.band !== 'good' ? 4 : 1) },
    { id: 'worry', label: 'Worry and overthinking', dojo: 'Mental doubt (10 duals) → Confidence', prevalence: '15.6% of adults have anxiety symptoms', source: 'nhis-anx', kind: 'measured', goal: 'I want to stop going over the same worries all day.', weight: (p) => (notNone(p.wellness.anxiety) ? 6 : 0.5) },
    { id: 'exhaustion', label: 'Mental exhaustion (burnout)', dojo: 'Cognitive overload, mental fatigue → Cognitive resilience', prevalence: 'Burnout is a recognised work phenomenon (ICD-11); about 4 in 10 workers report high stress', source: 'who-burnout', kind: 'measured', goal: 'I want to have something left in the tank at the end of the day.', weight: (p) => sc(p, { burnout: 8, caring: 3, 'shift-rota': 2 }, 0.5) },
    { id: 'brain-fog', label: 'Poor focus, foggy head', dojo: 'Mental cloudiness, confusion (9 duals) → Mental clarity', prevalence: 'Common after poor sleep and illness; no single population figure', source: 'assumption', kind: 'assumption', goal: 'I want to think clearly again.', weight: (p) => sc(p, { 'post-illness': 5, 'new-parent': 3 }, p.wellness.sleep.band === 'very poor' ? 3 : 0.5) },
    { id: 'exam-pressure', label: 'Exam and performance pressure', dojo: 'Mental vulnerability (14 duals) → Mental strength', prevalence: 'Most students report exam stress; only for people in exam season here', source: 'assumption', kind: 'assumption', goal: 'I want to get through my exams without falling apart.', weight: (p) => (p.scenario === 'exams' ? 10 : 0) },
    { id: 'self-talk', label: 'Harsh self-talk, low self-worth', dojo: 'Doubt → Confidence', prevalence: 'Goes with low mood (18.5% have symptoms) and job loss', source: 'nhis-dep', kind: 'measured', goal: 'I want to be kinder to myself.', weight: (p) => sc(p, { 'job-loss': 4 }, notNone(p.wellness.mood) ? 2 : 0.5) },
    { id: 'stuck-thinking', label: 'Stuck in the same thoughts', dojo: 'Mental rigidity (16 duals, the most frequent mental issue) → Mental flexibility', prevalence: 'The DOJO duals’ most frequent mental issue; no population figure', source: 'dojo', kind: 'assumption', goal: 'I want to see my situation from a new angle.', weight: () => 1 },
    { id: 'uncertainty', label: 'Can’t decide, living with uncertainty', dojo: 'Mental ambiguity (7 duals) → Clarity', prevalence: 'Rises with money and job worries', source: 'assumption', kind: 'assumption', goal: 'I want to feel steady even when things are uncertain.', weight: (p) => sc(p, { money: 3, 'job-loss': 3, moved: 2 }, 0.5) },
    { id: 'screen-overload', label: 'Screen overload, scrolling late', dojo: 'Distraction → Inner peace', prevalence: 'Phone use in bed is common, more under 35', source: 'situations', kind: 'assumption', goal: 'I want to put my phone down and rest.', weight: (p) => (p.wellness.screenInBedMin >= 45 ? 3 : 0) },
    { id: 'no-drive', label: 'No drive, feeling flat', dojo: 'Mental apathy, stagnation (12 + 6 duals) → Motivation', prevalence: 'Goes with low mood and losing a daily structure', source: 'nhis-dep', kind: 'measured', goal: 'I want to look forward to my days again.', weight: (p) => sc(p, { 'retirement-lonely': 4 }, notNone(p.wellness.mood) ? 2 : 0.5) },
  ],
  emotional: [
    { id: 'low-mood', label: 'Low mood', dojo: 'Emotional apathy (8 duals) → Emotional vitality', prevalence: '18.5% of adults had low-mood symptoms in two weeks', source: 'nhis-dep', kind: 'measured', goal: 'I want to feel like myself again.', weight: (p) => (p.wellness.mood === 'severe' ? 8 : notNone(p.wellness.mood) ? 6 : 0.5) },
    { id: 'anxious', label: 'Feeling anxious or on edge', dojo: 'Emotional insecurity (7 duals) → Security', prevalence: '15.6% of adults have anxiety symptoms', source: 'nhis-anx', kind: 'measured', goal: 'I want to feel calm in my own body.', weight: (p) => (notNone(p.wellness.anxiety) ? 6 : 0.5) },
    { id: 'irritable', label: 'Short temper, irritable', dojo: 'Emotional volatility (6 duals) → Emotional balance', prevalence: 'Follows poor sleep closely', source: 'ohayon', kind: 'measured', goal: 'I want to stop snapping at the people I love.', weight: (p) => sc(p, { 'new-parent': 3 }, p.wellness.sleep.band !== 'good' ? 2 : 0.5) },
    { id: 'grief', label: 'Grief', dojo: 'Emotional fragility (13 duals) → Emotional resilience', prevalence: 'Most adults lose someone close every few years; only for people grieving here', source: 'assumption', kind: 'assumption', goal: 'I want to carry this loss without it flattening me.', weight: (p) => (p.scenario === 'grief' ? 12 : 0) },
    { id: 'overwhelm', label: 'Overwhelmed', dojo: 'Emotional fragility → Emotional resilience; Overwhelming stress (obstacle)', prevalence: '37% felt stress a lot of the previous day', source: 'gallup', kind: 'measured', goal: 'I want to feel I can cope with what is on my plate.', weight: (p) => (p.wellness.stress.band === 'high' ? 5 : p.wellness.stress.band === 'moderate' ? 2 : 0.5) },
    { id: 'mood-swings', label: 'Mood swings', dojo: 'Emotional instability (18 duals, the most frequent emotional issue) → Emotional stability', prevalence: 'Common in menopause; the DOJO duals’ most frequent emotional issue', source: 'who-meno', kind: 'measured', goal: 'I want my moods to feel steadier.', weight: (p) => sc(p, { menopause: 6 }, 0.5) },
    { id: 'numb', label: 'Numb, running on empty', dojo: 'Emotional disconnection (8 duals) → Emotional connection', prevalence: 'Part of burnout and long caring', source: 'who-burnout', kind: 'measured', goal: 'I want to feel things again, not just get through them.', weight: (p) => sc(p, { burnout: 3, caring: 2 }, 0.3) },
    { id: 'guilt', label: 'Guilt and self-blame', dojo: 'Emotional weakness (10 duals) → Emotional strength', prevalence: 'Common for carers and new parents', source: 'aarp', kind: 'measured', goal: 'I want to stop feeling I am never doing enough.', weight: (p) => sc(p, { caring: 3, 'new-parent': 3 }, 0.3) },
    { id: 'future-fear', label: 'Fear about the future', dojo: 'Emotional uncertainty (5 duals); Fear of the unknown (obstacle) → Trust', prevalence: 'Rises with money and job worries', source: 'assumption', kind: 'assumption', goal: 'I want to stop dreading what comes next.', weight: (p) => sc(p, { money: 5, 'job-loss': 5, 'post-illness': 3 }, 0.3) },
    { id: 'bottled-up', label: 'Feelings bottled up', dojo: 'Emotional rigidity (12 duals) → Emotional flexibility', prevalence: 'The DOJO duals’ third most frequent emotional issue; no population figure', source: 'dojo', kind: 'assumption', goal: 'I want to let my feelings out without it being a big deal.', weight: () => 1 },
  ],
  relational: [
    { id: 'lonely', label: 'Loneliness', dojo: 'Emotional isolation, mental isolation (6 + 10 duals) → Connection', prevalence: 'About 1 in 4 adults worldwide feel very or fairly lonely', source: 'gallup-meta', kind: 'measured', goal: 'I want to feel less alone.', weight: (p) => sc(p, { 'retirement-lonely': 8, moved: 6 }, p.household === 'lives alone' ? 4 : 1) },
    { id: 'conflict', label: 'Conflict with a partner', dojo: 'Emotional volatility → Harmony', prevalence: 'Only common for people in a hard stretch with a partner here', source: 'situations', kind: 'assumption', goal: 'I want us to stop fighting and talk again.', weight: (p) => sc(p, { relationship: 8 }, 0.5) },
    { id: 'break-up', label: 'After a break-up', dojo: 'Emotional insecurity → Security', prevalence: 'Only for people in a relationship situation who do not live with a partner', source: 'situations', kind: 'assumption', goal: 'I want to move on from the break-up.', weight: (p) => (p.scenario === 'relationship' && !/partner/.test(p.household) ? 6 : 0) },
    { id: 'carer-strain', label: 'Caring is straining relationships', dojo: 'Lack of support (obstacle) → Supportive environment', prevalence: '21% of adults give unpaid care', source: 'aarp', kind: 'measured', goal: 'I want time for the people I love, not only the one I care for.', weight: (p) => (p.caregiving ? 5 : 0) },
    { id: 'baby-strain', label: 'Strain with a partner after the baby', dojo: 'Emotional disconnection → Connection', prevalence: 'Only for new parents here', source: 'situations', kind: 'assumption', goal: 'I want to feel like a team with my partner again.', weight: (p) => (p.scenario === 'new-parent' ? 8 : 0) },
    { id: 'no-one', label: 'No one to talk to', dojo: 'Lack of support (obstacle) → Supportive environment', prevalence: 'The fallback relational issue; tied to loneliness figures', source: 'gallup-meta', kind: 'measured', goal: 'I want someone I can be honest with.', weight: () => 1 },
    { id: 'work-conflict', label: 'Tension at work', dojo: 'Mental agitation (8 duals) → Calm', prevalence: 'Only for people in work', source: 'situations', kind: 'assumption', goal: 'I want to handle work people without carrying it home.', weight: (p) => (working(p) ? sc(p, { burnout: 4 }, 1) : 0) },
    { id: 'family-tension', label: 'Family tension at home', dojo: 'Emotional dishonesty (6 duals) → Openness', prevalence: 'More in shared and multi-generation homes', source: 'situations', kind: 'assumption', goal: 'I want home to feel calmer.', weight: (p) => (/parents|extended|teenagers|adult children/.test(p.household) ? 2 : 0.3) },
    { id: 'out-of-sync', label: 'Out of step with family and friends', dojo: 'Mental disconnection (8 duals) → Connection', prevalence: '21% of workers do shift work', source: 'eurofound', kind: 'measured', goal: 'I want to see my people even with my shifts.', weight: (p) => (p.shiftWork ? 5 : 0) },
    { id: 'trust', label: 'Hard to trust people', dojo: 'Emotional insecurity → Cultivating trust and security', prevalence: 'No population figure', source: 'dojo', kind: 'assumption', goal: 'I want to let people in a little more.', weight: () => 0.5 },
  ],
  spiritual: [
    { id: 'no-purpose', label: 'Lost sense of purpose', dojo: 'Mental apathy → Motivation; Indifference (obstacle)', prevalence: 'Rises after retiring or losing a job', source: 'assumption', kind: 'assumption', goal: 'I want a reason to get up in the morning.', weight: (p) => sc(p, { 'retirement-lonely': 8, 'job-loss': 6 }, 0.5) },
    { id: 'autopilot', label: 'Living on autopilot, no time for self', dojo: 'Distraction → Cultivating inner peace', prevalence: 'The fallback for ordinary busy lives', source: 'situations', kind: 'assumption', goal: 'I want a few minutes a day that are just mine.', weight: (p) => sc(p, { 'busy-life': 6, burnout: 3 }, 1) },
    { id: 'meaning-shaken', label: 'Meaning shaken by a loss', dojo: 'Emotional fragility → Resilience', prevalence: 'Only for people grieving here', source: 'assumption', kind: 'assumption', goal: 'I want to find meaning again after losing them.', weight: (p) => (p.scenario === 'grief' ? 8 : 0) },
    { id: 'values-gap', label: 'Life out of line with their values', dojo: 'Mental disconnection → Integrity', prevalence: 'Goes with burnout', source: 'who-burnout', kind: 'measured', goal: 'I want my days to match what matters to me.', weight: (p) => sc(p, { burnout: 5 }, 0.5) },
    { id: 'low-hope', label: 'Little hope for the future', dojo: 'Emotional apathy → Optimism', prevalence: 'Goes with moderate or severe low mood', source: 'nhis-dep', kind: 'measured', goal: 'I want to believe things can get better.', weight: (p) => (modPlus(p.wellness.mood) ? 4 : 0.3) },
    { id: 'identity', label: 'Who am I now? (a big change)', dojo: 'Resistance to change (obstacle) → Embracing change', prevalence: 'Only after a life change: a baby, menopause, retiring, moving, illness', source: 'situations', kind: 'assumption', goal: 'I want to feel at home in this new chapter of my life.', weight: (p) => sc(p, { 'new-parent': 4, menopause: 4, 'retirement-lonely': 3, moved: 2, 'post-illness': 3 }, 0) },
    { id: 'no-calm', label: 'No inner calm', dojo: 'Emotional turbulence → Emotional tranquility (Cultivating inner peace)', prevalence: 'Tracks high stress', source: 'gallup', kind: 'measured', goal: 'I want to find a quiet place inside.', weight: (p) => (p.wellness.stress.band === 'high' ? 3 : 1) },
    { id: 'little-joy', label: 'Little joy or gratitude', dojo: 'Hormonal regulation of stress and joy (6 duals) → Joy', prevalence: 'Goes with any low mood', source: 'nhis-dep', kind: 'measured', goal: 'I want to notice the good things again.', weight: (p) => (notNone(p.wellness.mood) ? 3 : 0.5) },
    { id: 'disconnected', label: 'Cut off from community or faith', dojo: 'Mental isolation → Belonging', prevalence: 'More after moving city', source: 'situations', kind: 'assumption', goal: 'I want to belong somewhere again.', weight: (p) => sc(p, { moved: 4 }, 0.5) },
    { id: 'stuck', label: 'Feeling stuck', dojo: 'Resistance to change, habitual patterns (obstacles) → Adaptability', prevalence: 'The DOJO duals’ most frequent obstacle; no population figure', source: 'dojo', kind: 'assumption', goal: 'I want to feel I am moving forward.', weight: () => 1 },
  ],
  physical: [
    { id: 'poor-sleep', label: 'Poor sleep', dojo: 'Sleep disturbances, insomnia → Restful sleep (Improving sleep quality)', prevalence: 'About 30% have insomnia symptoms, 10% at disorder level', source: 'ohayon', kind: 'measured', goal: 'I want to sleep through the night.', weight: (p) => ({ good: 0.5, poor: 6, 'very poor': 10 })[p.wellness.sleep.band] },
    { id: 'fatigue', label: 'Tired all the time', dojo: 'Physical fatigue (18 duals) → Physical endurance', prevalence: 'Very common; tracks sleep and mood', source: 'assumption', kind: 'assumption', goal: 'I want more energy in the day.', weight: (p) => (p.wellness.energy <= 2 ? 5 : 1) },
    { id: 'tension', label: 'Tension in the body', dojo: 'Physiological / physical tension (48 + 40 duals) → Relaxation', prevalence: 'The DOJO duals’ second most frequent physical issue', source: 'dojo', kind: 'assumption', goal: 'I want my shoulders to come down from my ears.', weight: (p) => (p.wellness.stress.band !== 'low' ? 3 : 1) },
    { id: 'pain', label: 'Long-term pain', dojo: 'Physical discomfort (20 duals) → Comfort', prevalence: '20.9% of adults have chronic pain', source: 'cdc-pain', kind: 'measured', goal: 'I want pain to stop running my nights.', weight: (p) => (p.chronicPain ? (p.scenario === 'pain-flare' ? 12 : 6) : 0) },
    { id: 'inactive', label: 'Too little movement', dojo: 'Physical lethargy (6 duals) → Vitality', prevalence: '31% of adults move less than 150 minutes a week', source: 'who-pa', kind: 'measured', goal: 'I want to move my body more.', weight: (p) => (p.wellness.activeMinutesWeek < 150 ? 3 : 0) },
    { id: 'body-clock', label: 'Body clock out of sync', dojo: 'Physiological imbalance (13 duals) → Physiological harmony', prevalence: '21% of workers do shift work', source: 'eurofound', kind: 'measured', goal: 'I want to sleep well whatever shift I am on.', weight: (p) => (p.shiftWork ? 8 : 0) },
    { id: 'stress-body', label: 'Stress in the body (racing heart, shallow breath)', dojo: 'Physiological stress (52 duals, the most frequent physical issue) → Calm', prevalence: 'The DOJO duals’ most frequent physical issue; goes with anxiety', source: 'dojo', kind: 'assumption', goal: 'I want my body to feel calm, not on alert.', weight: (p) => (notNone(p.wellness.anxiety) ? 3 : 0.5) },
    { id: 'hot-flushes', label: 'Night sweats and hot flushes', dojo: 'Physiological imbalance → Hormonal balance', prevalence: 'Most women in menopause, usually 45–55', source: 'who-meno', kind: 'measured', goal: 'I want to get through the night without waking up drenched.', weight: (p) => (p.scenario === 'menopause' ? 10 : 0) },
    { id: 'recovery', label: 'Slow recovery after illness', dojo: 'Physical weakness (12 duals) → Strength', prevalence: 'Only for people recovering from an illness here', source: 'situations', kind: 'assumption', goal: 'I want my strength back.', weight: (p) => (p.scenario === 'post-illness' ? 10 : 0) },
    { id: 'habits', label: 'Caffeine, alcohol or screens costing sleep', dojo: 'Poor sleep hygiene (obstacle) → Sleep hygiene', prevalence: 'Habits drawn in the v4 set', source: 'situations', kind: 'assumption', goal: 'I want habits that help me rest.', weight: (p) => (p.wellness.caffeineCups >= 3 || p.wellness.alcoholDrinksWeek >= 7 || p.wellness.screenInBedMin >= 60 ? 3 : 0) },
  ],
}

export const issueOf = (d: Dimension, id: string) => ISSUES[d].find((i) => i.id === id)!

/** Sources the condition adds; the v4 ids it reuses (ohayon, gallup, nhis-dep, …) are in personasV4.ts SOURCES. */
export const CONDITION_SOURCES = [
  { id: 'dojo', what: 'Issue → wellness duals', figure: 'About 620 emotional, mental and physiological duals; issue counts in this file are how often each appears in DOJO_C_Duals', kind: 'assumption' as const, cite: 'DOJO objective-learning workbook (business owner, 26 Nov 2026), docs/briefs', url: 'docs/briefs/2026-11-26-dojo-objective-learning.xlsx', year: 2026 },
  { id: 'harvey', what: 'Racing mind at night', figure: 'Worry and unwanted thoughts in bed keep insomnia going (cognitive model of insomnia)', kind: 'measured' as const, cite: 'Harvey, A cognitive model of insomnia, Behaviour Research and Therapy 40(8)', url: 'https://doi.org/10.1016/S0005-7967(01)00061-4', year: 2002 },
  { id: 'who-burnout', what: 'Burnout', figure: 'An occupational phenomenon in ICD-11: exhaustion, distance from the job, reduced efficacy', kind: 'measured' as const, cite: 'WHO, Burn-out an occupational phenomenon', url: 'https://www.who.int/news/item/28-05-2019-burn-out-an-occupational-phenomenon-international-classification-of-diseases', year: 2019 },
  { id: 'gallup-meta', what: 'Loneliness', figure: '24% of people in 142 countries felt very or fairly lonely', kind: 'measured' as const, cite: 'Meta-Gallup, Global State of Social Connections', url: 'https://www.gallup.com/analytics/509675/state-of-social-connections.aspx', year: 2023 },
  { id: 'nhis-tx', what: 'Getting help', figure: '19.2% of US adults had mental health treatment in a year: 15.8% medication, 9.5% counselling or therapy', kind: 'measured' as const, cite: 'Terlizzi & Zablotsky, NCHS Data Brief 380', url: 'https://www.cdc.gov/nchs/products/databriefs/db380.htm', year: 2020 },
  { id: 'ttm', what: 'Readiness to change', figure: 'Stages of change: not yet (precontemplation), thinking, preparing, acting, maintaining; in health surveys most people sit in the first two', kind: 'measured' as const, cite: 'Prochaska & Velicer, The transtheoretical model of health behavior change, Am J Health Promot 12(1)', url: 'https://doi.org/10.4278/0890-1171-12.1.38', year: 1997 },
  { id: 'bandura', what: 'Confidence to change', figure: 'Self-efficacy (belief one can do it) predicts whether people start and keep a new behaviour', kind: 'measured' as const, cite: 'Bandura, Self-efficacy: toward a unifying theory of behavioral change, Psychological Review 84(2)', url: 'https://doi.org/10.1037/0033-295X.84.2.191', year: 1977 },
  { id: 'cond-model', what: 'Condition scores and mixes', figure: 'Dimension penalties, weights, readiness, support, coping, time and targets are our own rules on the persona’s facts', kind: 'assumption' as const, cite: 'Our assumption (src/admin/data/personaConditionV4.ts), to be replaced by real check-ins', url: 'https://www.who.int/news-room/fact-sheets/detail/mental-health-strengthening-our-response', year: 2026 },
]

/* ------------------------------------------------------------------ PRNG */

/** mulberry32 (the same as personasV4.ts), seeded per person so each condition has its own stream. */
function rng(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
type Rand = () => number
function weighted<T>(r: Rand, xs: readonly (readonly [T, number])[]): T {
  const total = xs.reduce((n, [, w]) => n + w, 0)
  let x = r() * total
  for (const [v, w] of xs) {
    x -= w
    if (x < 0) return v
  }
  return xs[xs.length - 1][0]
}

/* --------------------------------------------------------------- Scoring */

const MOOD_PEN = { none: 0, mild: 14, moderate: 28, severe: 40 } as const
const ANX_PEN = { none: 0, mild: 10, moderate: 20, severe: 30 } as const
const score = (x: number) => clamp(Math.round(x), 4, 96)

/** Safety and sense caps (also checked by conditionIncoherence). */
export const CAPS = { riskEmotional: 45, severeMoodEmotional: 49, veryPoorSleepPhysical: 72 }

export function acuityOf(weeks: number, scenario: ScenarioId): Acuity {
  return scenario === 'exams' || weeks < 8 ? 'acute' : weeks < 52 ? 'ongoing' : 'long-standing'
}
export function impactOf(p: PersonaV4): Impact {
  return p.wellness.band === 'severe' ? 'marked' : p.wellness.band === 'moderate' ? 'some' : 'none'
}

function supportOf(r: Rand, p: PersonaV4): Support {
  const w: [number, number, number] =
    p.scenario === 'retirement-lonely' || p.scenario === 'moved' ? [5, 4, 1] : p.household === 'lives alone' ? [5, 4, 1] : p.scenario === 'relationship' ? [3, 5, 1] : [1, 5, 4]
  return weighted(r, [['alone', w[0]], ['some', w[1]], ['strong', w[2]]] as const)
}

function dimScores(r: Rand, p: PersonaV4, support: Support): Record<Dimension, number> {
  const w = p.wellness
  // Everyone carries their life situation's strain (0.25–0.7 in personasV4.ts) into every dimension, plus 16–20 points of person-to-person spread.
  const strain = SCENARIOS[p.scenario].strain * 18
  const noise = (hi: number) => strain + r() * (hi + 6)
  const mood = MOOD_PEN[w.mood]
  const anx = ANX_PEN[w.anxiety]
  let physical = 100 - { good: 0, poor: 20, 'very poor': 34 }[w.sleep.band] - (5 - w.energy) * 6 - (p.chronicPain ? 14 : 0) - (p.scenario === 'pain-flare' ? 6 : 0) - (w.activeMinutesWeek < 150 ? 8 : 0) - (p.nightShift ? 6 : p.shiftWork ? 3 : 0) - sc(p, { 'post-illness': 10, menopause: 6 }, 0) - noise(10)
  const mental = 100 - anx - { low: 0, moderate: 10, high: 20 }[w.stress.band] - (w.stress.stressedYesterday ? 6 : 0) - sc(p, { exams: 12, burnout: 14, 'job-loss': 8, money: 10, caring: 6 }, 0) - (w.screenInBedMin >= 60 ? 4 : 0) - { good: 0, poor: 3, 'very poor': 6 }[w.sleep.band] - noise(10)
  let emotional = 100 - mood - anx * 0.5 - sc(p, { grief: 16, relationship: 10, menopause: 6, 'new-parent': 6, 'job-loss': 6, caring: 6 }, 0) - noise(10)
  const relational = 100 - { alone: 22, some: 8, strong: 0 }[support] - sc(p, { relationship: 20, 'retirement-lonely': 16, moved: 16, caring: 8, 'new-parent': 6, grief: 6, 'shift-rota': 6 }, 0) - mood * 0.3 - noise(12)
  const spiritual = 100 - sc(p, { 'retirement-lonely': 18, 'job-loss': 18, grief: 16, burnout: 16, caring: 8, 'busy-life': 8, 'post-illness': 8, moved: 6, money: 6 }, 0) - mood * 0.5 - (p.riskFlag ? 10 : 0) - noise(14)
  if (p.riskFlag) emotional = Math.min(emotional, CAPS.riskEmotional)
  if (w.mood === 'severe') emotional = Math.min(emotional, CAPS.severeMoodEmotional)
  if (w.sleep.band === 'very poor') physical = Math.min(physical, CAPS.veryPoorSleepPhysical)
  return { mental: score(mental), emotional: score(emotional), relational: score(relational), spiritual: score(spiritual), physical: score(physical) }
}

/** Overall = Σ weight × dimension score, rounded. */
export const overallOf = (s: Record<Dimension, number>) => Math.round(DIMENSIONS.reduce((t, d) => t + DIMENSION_WEIGHT[d] * s[d], 0))
/** The weakest dimension; ties go to the earlier one in DIMENSIONS. */
export const mainNeedOf = (s: Record<Dimension, number>) => DIMENSIONS.reduce((a, b) => (s[b] < s[a] ? b : a))

/** Target: the main need aims for Good (85); every other dimension for 15 points better, capped at 85, never below where it starts. */
export const targetOf = (start: number, isMain: boolean) => (start >= 85 ? start : isMain ? 85 : Math.min(85, start + 15))

function readinessOf(r: Rand, p: PersonaV4, acuity: Acuity): Readiness {
  if (p.priorAppOutcome === 'still uses it') return 'maintaining'
  const z = { enthusiastic: 1.5, curious: 0.7, skeptical: -0.6, distrustful: -1.4 }[p.aiAttitude] + (p.priorAppOutcome === 'stopped' ? 0.5 : 0) + (p.wellness.band === 'severe' ? 0.4 : p.wellness.band === 'mild' ? -0.4 : 0) + (acuity === 'acute' ? 0.4 : acuity === 'long-standing' ? -0.5 : 0) + (r() - 0.5) * 3
  return z < -1 ? 'not yet' : z < 0.6 ? 'thinking' : z < 1.6 ? 'preparing' : 'acting'
}

function helpOf(r: Rand, p: PersonaV4): Help[] {
  const top = [p.wellness.mood, p.wellness.anxiety].includes('severe') ? 'severe' : [p.wellness.mood, p.wellness.anxiety].includes('moderate') ? 'moderate' : [p.wellness.mood, p.wellness.anxiety].includes('mild') ? 'mild' : 'none'
  const base = { none: [0.04, 0.01, 0.01], mild: [0.1, 0.05, 0.03], moderate: [0.25, 0.15, 0.15], severe: [0.4, 0.3, 0.35] }[top]
  const out: Help[] = []
  if (r() < base[0] + (p.chronicPain ? 0.3 : 0)) out.push('GP')
  if (r() < base[1]) out.push('therapist')
  const medOk = top === 'moderate' || top === 'severe' || p.chronicPain
  if (r() < base[2] + (p.chronicPain ? 0.2 : 0) && medOk) out.push('medication')
  return out
}

function copingOf(r: Rand, p: PersonaV4, support: Support): Coping {
  const w = p.wellness
  return weighted(r, [
    ['avoid', notNone(w.mood) ? 4 : 2],
    ['distract', w.screenInBedMin >= 45 ? 5 : 3],
    ['talk', support === 'alone' ? 0 : support === 'strong' ? 4 : 2],
    ['move', w.activeMinutesWeek >= 150 ? 4 : 0],
    ['substances', w.alcoholDrinksWeek >= 7 || w.caffeineCups >= 4 ? 3 : 0],
  ] as const)
}

function helpersOf(r: Rand, p: PersonaV4, confidence: number, mainNeed: Dimension): Helper[] {
  const w = p.wellness
  const pool: [Helper, number][] = [
    ['sleep audio', w.sleep.band !== 'good' ? 6 : 1],
    ['breath', notNone(w.anxiety) || w.stress.band === 'high' ? 5 : 2],
    ['voice guidance', confidence <= 4 ? 4 : 2],
    ['movement', p.scenario === 'pain-flare' ? 0 : w.activeMinutesWeek >= 150 ? 4 : 1],
    ['journaling', mainNeed === 'mental' || mainNeed === 'spiritual' ? 4 : 1],
    ['music', 2],
  ]
  const out: Helper[] = []
  for (let k = 0; k < 3; k++) {
    const left = pool.filter(([h, wt]) => wt > 0 && !out.includes(h))
    out.push(weighted(r, left))
  }
  return out
}

function minutesOf(r: Rand, p: PersonaV4): number {
  const [lo, hi] = p.scenario === 'new-parent' ? [5, 10] : p.caregiving ? [5, 15] : p.work === 'student' ? [10, 25] : p.work === 'retired' ? [15, 40] : [8, 25]
  return Math.max(5, Math.round((lo + r() * (hi - lo)) / 5) * 5)
}

function bestTimeOf(r: Rand, p: PersonaV4): BestTime {
  if (p.nightShift) return 'after a night shift'
  if (p.shiftWork) return 'changes with shifts'
  if (p.wellness.sleep.band !== 'good' && r() < 0.6) return 'night, in bed'
  return weighted(r, [['morning', 3], ['midday', 1], ['evening', 4]] as const)
}

function courseOf(r: Rand, p: PersonaV4, acuity: Acuity): Course {
  const [better, stable, worse] = p.scenario === 'exams' ? [1, 2, 6] : acuity === 'acute' ? [3, 3, 4] : acuity === 'ongoing' ? [3, 4, 3] : [2, 6, 2]
  return weighted(r, [['getting better', p.riskFlag ? 0 : better], ['stable', stable], ['getting worse', worse]] as const)
}

/** The condition of one v4 persona. Pure: the same persona gives the same condition on every machine. */
export function conditionOf(p: PersonaV4): ConditionV4 {
  const r = rng(CONDITION_SEED + Number(p.id.slice(3)))
  let support = supportOf(r, p)
  const s = dimScores(r, p, support)
  // Strong support and a severe relational score do not go together: support drops to some.
  if (support === 'strong' && s.relational < 28) support = 'some'
  const mainNeed = mainNeedOf(s)
  const dims = {} as Record<Dimension, DimensionState>
  for (const d of DIMENSIONS) {
    const issue = weighted(r, ISSUES[d].map((i) => [i.id, i.weight(p)] as const).filter(([, wt]) => wt > 0))
    dims[d] = { score: s[d], band: condBandOf(s[d]), issue, target: targetOf(s[d], d === mainNeed) }
  }
  const overall = overallOf(s)
  const acuity = acuityOf(p.onsetWeeksAgo, p.scenario)
  const course = courseOf(r, p, acuity)
  const readiness = readinessOf(r, p, acuity)
  const conf = 6 + { enthusiastic: 1.5, curious: 0.5, skeptical: -1, distrustful: -2 }[p.aiAttitude] + (p.priorAppOutcome === 'stopped' ? -1 : 0) + (p.wellness.band === 'severe' ? -1 : 0) + { alone: -1, some: 0, strong: 1 }[support] + (r() - 0.5) * 3
  const confidence = clamp(Math.round(conf), 1, 10)
  const help = helpOf(r, p)
  const soughtHelp = help.length > 0 || r() < 0.15
  const coping = copingOf(r, p, support)
  const helpers = helpersOf(r, p, confidence, mainNeed)
  const minutesPerDay = minutesOf(r, p)
  const bestTime = bestTimeOf(r, p)
  return {
    id: p.id,
    dims,
    overall,
    overallBand: condBandOf(overall),
    mainNeed,
    acuity,
    howLong: p.duration,
    weeks: p.onsetWeeksAgo,
    course,
    impact: impactOf(p),
    readiness,
    confidence,
    support,
    help,
    soughtHelp,
    coping,
    helpers,
    minutesPerDay,
    bestTime,
    goal: issueOf(mainNeed, dims[mainNeed].issue).goal,
    riskFlag: p.riskFlag,
    routing: p.riskFlag ? 'Need help now?' : 'normal',
    excluded: p.riskFlag,
  }
}

let CACHE: Map<string, ConditionV4> | undefined

/** Conditions for all 1,000 v4 people, by persona id. */
export function conditionsV4(): Map<string, ConditionV4> {
  return (CACHE ??= new Map(generatePersonasV4().map((p) => [p.id, conditionOf(p)])))
}

/* ------------------------------------------------------------ Coherence */

/** What makes a condition not hold together with its persona. Must be empty for all 1,000. */
export function conditionIncoherence(p: PersonaV4, c: ConditionV4): string[] {
  const out: string[] = []
  for (const d of DIMENSIONS) {
    const x = c.dims[d]
    if (x.score < 0 || x.score > 100) out.push(`${d} score ${x.score} outside 0–100`)
    if (condBandOf(x.score) !== x.band) out.push(`${d} score ${x.score} in band ${x.band}`)
    const issue = ISSUES[d].find((i) => i.id === x.issue)
    if (!issue) out.push(`${d} issue ${x.issue} not in the top 10`)
    else if (issue.weight(p) <= 0) out.push(`${d} issue “${issue.label}” does not fit ${p.id} (${p.scenario})`)
    if (x.target < x.score || x.target > 96) out.push(`${d} target ${x.target} for a start of ${x.score}`)
  }
  const s = Object.fromEntries(DIMENSIONS.map((d) => [d, c.dims[d].score])) as Record<Dimension, number>
  if (overallOf(s) !== c.overall) out.push(`overall ${c.overall} is not the weighted ${overallOf(s)}`)
  if (mainNeedOf(s) !== c.mainNeed) out.push(`main need ${c.mainNeed} is not the weakest dimension`)
  if (c.goal !== issueOf(c.mainNeed, c.dims[c.mainNeed].issue).goal) out.push('goal is not the main need’s')
  // Safety
  if (p.riskFlag !== c.riskFlag || c.excluded !== p.riskFlag) out.push('risk flag not carried, or not excluded')
  if (p.riskFlag && c.routing !== 'Need help now?') out.push('risk-flagged person not routed to help')
  if (!p.riskFlag && c.routing !== 'normal') out.push('routed to help without a risk flag')
  if (p.riskFlag && c.dims.emotional.score > CAPS.riskEmotional) out.push(`risk flag with emotional ${c.dims.emotional.score}`)
  if (p.riskFlag && c.course === 'getting better') out.push('risk flag but getting better')
  // Sense against the persona's facts
  if (p.wellness.mood === 'severe' && c.dims.emotional.score > CAPS.severeMoodEmotional) out.push(`severe low mood with emotional ${c.dims.emotional.score}`)
  if (p.wellness.sleep.band === 'very poor' && c.dims.physical.band === 'good') out.push('very poor sleep with good physical')
  if (c.acuity !== acuityOf(p.onsetWeeksAgo, p.scenario)) out.push(`${c.acuity} after ${p.onsetWeeksAgo} weeks`)
  if (c.impact !== impactOf(p)) out.push(`impact ${c.impact} for a ${p.wellness.band} wellness band`)
  if (c.readiness === 'maintaining' && p.priorAppOutcome !== 'still uses it') out.push('maintaining without a habit to maintain')
  if (c.confidence < 1 || c.confidence > 10) out.push(`confidence ${c.confidence}`)
  if (c.support === 'strong' && c.dims.relational.band === 'severe') out.push('strong support with a severe relational score')
  if (c.coping === 'talk' && c.support === 'alone') out.push('copes by talking with no one around')
  if (c.coping === 'move' && p.wellness.activeMinutesWeek < 150) out.push('copes by moving but moves little')
  if (c.coping === 'substances' && p.wellness.alcoholDrinksWeek < 7 && p.wellness.caffeineCups < 4) out.push('copes with substances without the habit')
  if (c.help.includes('medication') && !(modPlus(p.wellness.mood) || modPlus(p.wellness.anxiety) || p.chronicPain)) out.push('medication flag without a reason')
  if (c.help.length && !c.soughtHelp) out.push('has help but never sought it')
  if (p.scenario === 'pain-flare' && c.helpers.includes('movement')) out.push('movement suggested during a pain flare')
  if (p.nightShift && c.bestTime !== 'after a night shift') out.push(`night shift with best time ${c.bestTime}`)
  if (c.minutesPerDay < 5 || c.minutesPerDay > 40) out.push(`${c.minutesPerDay} minutes a day`)
  if (p.scenario === 'new-parent' && c.minutesPerDay > 10) out.push(`new parent with ${c.minutesPerDay} minutes a day`)
  return out
}

/* ------------------------------------------------------- For the buyer agent */

export const STAGE_VALUE: Record<Readiness, number> = { 'not yet': 0.1, thinking: 0.3, preparing: 0.55, acting: 0.8, maintaining: 0.9 }
export const COURSE_FACTOR: Record<Course, number> = { 'getting worse': 1.2, stable: 1, 'getting better': 0.8 }
export const ACUITY_FACTOR: Record<Acuity, number> = { acute: 1.15, ongoing: 1, 'long-standing': 0.9 }
export const IMPACT_FACTOR: Record<Impact, number> = { none: 0.8, some: 1, marked: 1.2 }
export const AI_DOUBT: Record<PersonaV4['aiAttitude'], number> = { enthusiastic: 10, curious: 25, skeptical: 55, distrustful: 75 }

export interface BuyerCondition {
  excluded: boolean
  routing: 'Need help now?' | 'normal'
  /** 0–100: how much they need it. */
  needIntensity: number
  /** 0–100: how soon. */
  urgency: number
  /** 0–1: how ready to act. */
  readiness: number
  /** 0–100: “does it work for me?” doubt. */
  scepticism: number
  timeBudget: number
  modality: Helper
  mainNeed: Dimension
  /** Each formula with this person's numbers in it, so a run can show why an answer moved. */
  why: string[]
}

/**
 * The buyer agent's reading of a condition. Formulas (all rounded at the end):
 *   need intensity = 0.6 × (100 − overall) + 0.4 × (100 − main-need score)
 *   urgency        = need × course (worse 1.2, stable 1, better 0.8) × acuity (acute 1.15, ongoing 1, long-standing 0.9) × impact (none 0.8, some 1, marked 1.2), capped 0–100
 *   readiness      = stage (not yet 0.1, thinking 0.3, preparing 0.55, acting 0.8, maintaining 0.9) × (0.6 + 0.04 × confidence)
 *   scepticism     = AI doubt (enthusiastic 10, curious 25, skeptical 55, distrustful 75) + 15 if they quit an app before + 10 if long-standing + 10 if confidence ≤ 3 − 10 if already acting or maintaining, capped 0–100
 *   time budget    = minutes per day; modality = what helps them most
 * Risk-flagged people come back excluded with routing “Need help now?” and every number 0: never an offer.
 */
export function conditionForBuyer(p: PersonaV4, c: ConditionV4 = conditionOf(p)): BuyerCondition {
  if (c.excluded) return { excluded: true, routing: 'Need help now?', needIntensity: 0, urgency: 0, readiness: 0, scepticism: 0, timeBudget: 0, modality: c.helpers[0], mainNeed: c.mainNeed, why: ['Risk flag: excluded from every offer; Aurelia shows Need help now? first.'] }
  const main = c.dims[c.mainNeed].score
  const need = 0.6 * (100 - c.overall) + 0.4 * (100 - main)
  const urgency = clamp(need * COURSE_FACTOR[c.course] * ACUITY_FACTOR[c.acuity] * IMPACT_FACTOR[c.impact], 0, 100)
  const readiness = STAGE_VALUE[c.readiness] * (0.6 + 0.04 * c.confidence)
  const quit = p.priorAppOutcome === 'stopped' ? 15 : 0
  const long = c.acuity === 'long-standing' ? 10 : 0
  const low = c.confidence <= 3 ? 10 : 0
  const doing = c.readiness === 'acting' || c.readiness === 'maintaining' ? 10 : 0
  const scepticism = clamp(AI_DOUBT[p.aiAttitude] + quit + long + low - doing, 0, 100)
  const r2 = (x: number) => Math.round(x * 100) / 100
  return {
    excluded: false,
    routing: 'normal',
    needIntensity: Math.round(need),
    urgency: Math.round(urgency),
    readiness: r2(readiness),
    scepticism,
    timeBudget: c.minutesPerDay,
    modality: c.helpers[0],
    mainNeed: c.mainNeed,
    why: [
      `Need = 0.6 × (100 − ${c.overall}) + 0.4 × (100 − ${main}) = ${Math.round(need)}`,
      `Urgency = ${Math.round(need)} × ${COURSE_FACTOR[c.course]} (${c.course}) × ${ACUITY_FACTOR[c.acuity]} (${c.acuity}) × ${IMPACT_FACTOR[c.impact]} (${c.impact} impact) = ${Math.round(urgency)}`,
      `Readiness = ${STAGE_VALUE[c.readiness]} (${c.readiness}) × (0.6 + 0.04 × ${c.confidence}) = ${r2(readiness)}`,
      `Scepticism = ${AI_DOUBT[p.aiAttitude]} (${p.aiAttitude} about AI) + ${quit} (quit an app) + ${long} (long-standing) + ${low} (low confidence) − ${doing} (already acting) = ${scepticism}`,
      `Time = ${c.minutesPerDay} min a day, best ${c.bestTime}; modality = ${c.helpers[0]}`,
    ],
  }
}

/* ------------------------------------------------------- For the cost model */

/** Other dimensions count at this share of their own chapters: a session aimed at the main need lifts them too (assumption). */
export const SPILLOVER = 0.5
export const DEFAULT_COST_STAGE: Stage = 1
export const DEFAULT_COST_PRESET = 'balanced'

/** Session length: the longest of 3, 5 or 10 minutes that fits the daily time. */
export const sessionMinutesOf = (minutesPerDay: number) => [...LENGTHS].reverse().find((m) => m <= minutesPerDay) ?? LENGTHS[0]
/** Sessions a week: three days in seven, as many as the daily time allows on each, 1–7. */
export const perWeekOf = (minutesPerDay: number) => clamp(Math.round((minutesPerDay / sessionMinutesOf(minutesPerDay)) * 3), 1, 7)

export interface CostDim {
  start: number
  target: number
  gap: number
  /** costModel.goal() chapters from start to target. */
  chapters: number
}

export interface CostCondition {
  excluded: boolean
  dims: Record<Dimension, CostDim>
  mainNeed: Dimension
  sessionMinutes: number
  perWeek: number
  /** Main need's chapters + SPILLOVER × every other dimension's. */
  chapters: number
  weeks: number
  costPerChapter: number
  costPerPerson: number
  flipProbability: number
}

/**
 * The cost model's reading of a condition. For each dimension:
 *   gap = target − start; chapters = costModel.goal({ baseline: start, target, chaptersPerWeek, stage }, inputs).chapters
 *   (goal: ⌈gap ÷ (stage uplift × condition factor × length factor × personalisation)⌉; costModel itself is unchanged)
 * Then: chapters = main need's + 0.5 × the sum of the others' (rounded up); weeks = chapters ÷ sessions a week;
 * cost per person = chapters × cost per chapter (the preset's chapter cost × stage cost factor).
 * Risk-flagged people come back excluded with zero chapters and zero cost.
 */
export function conditionForCost(p: PersonaV4, c: ConditionV4 = conditionOf(p), stage: Stage = DEFAULT_COST_STAGE, inputs?: CostInputs): CostCondition {
  const sessionMinutes = sessionMinutesOf(c.minutesPerDay)
  const perWeek = perWeekOf(c.minutesPerDay)
  const ci = inputs ?? presetInputs(PRESETS.find((x) => x.id === DEFAULT_COST_PRESET)!, sessionMinutes)
  const dims = {} as Record<Dimension, CostDim>
  let main = 0
  let others = 0
  let costPerChapter = 0
  let flip = 0
  for (const d of DIMENSIONS) {
    const x = c.dims[d]
    const g = goal({ baseline: x.score, target: x.target, chaptersPerWeek: perWeek, stage, anchor: 'flip' }, ci)
    dims[d] = { start: x.score, target: x.target, gap: g.gap, chapters: c.excluded ? 0 : g.chapters }
    costPerChapter = g.costPerChapter
    if (d === c.mainNeed) {
      main = g.chapters
      flip = g.flipProbability
    } else others += g.chapters
  }
  if (c.excluded) return { excluded: true, dims, mainNeed: c.mainNeed, sessionMinutes, perWeek, chapters: 0, weeks: 0, costPerChapter, costPerPerson: 0, flipProbability: 0 }
  const chapters = main + Math.ceil(SPILLOVER * others)
  return { excluded: false, dims, mainNeed: c.mainNeed, sessionMinutes, perWeek, chapters, weeks: chapters / perWeek, costPerChapter, costPerPerson: chapters * costPerChapter, flipProbability: flip }
}

export interface PopulationCost {
  people: number
  excluded: number
  averageCost: number
  averageChapters: number
  averageWeeks: number
  byNeed: Record<Dimension, { people: number; averageCost: number }>
}

/**
 * Average cost per person across the 1,000, risk-flagged people excluded.
 * Each persona already stands for its share of the population (the set is drawn from population weights), so the
 * population-weighted average is the plain mean over the people included: Σ cost per person ÷ people included.
 */
export function populationCost(stage: Stage = DEFAULT_COST_STAGE): PopulationCost {
  const ps = generatePersonasV4()
  const cs = conditionsV4()
  const rows = ps.map((p) => conditionForCost(p, cs.get(p.id)!, stage)).filter((x) => !x.excluded)
  const mean = (f: (x: CostCondition) => number, xs = rows) => (xs.length ? xs.reduce((t, x) => t + f(x), 0) / xs.length : 0)
  const byNeed = Object.fromEntries(DIMENSIONS.map((d) => {
    const xs = rows.filter((x) => x.mainNeed === d)
    return [d, { people: xs.length, averageCost: mean((x) => x.costPerPerson, xs) }]
  })) as PopulationCost['byNeed']
  return { people: rows.length, excluded: ps.length - rows.length, averageCost: mean((x) => x.costPerPerson), averageChapters: mean((x) => x.chapters), averageWeeks: mean((x) => x.weeks), byNeed }
}

/* ------------------------------------------------------------ Summaries */

export interface ConditionSummary {
  meanByDim: Record<Dimension, number>
  bandsByDim: Record<Dimension, Record<CondBand, number>>
  mainNeed: Record<Dimension, number>
  readiness: Record<Readiness, number>
  acuity: Record<Acuity, number>
  support: Record<Support, number>
  meanOverall: number
  readyShare: number
  incoherent: number
}

let SUMMARY: ConditionSummary | undefined

/** The headline numbers the page and Report metrics show (worked out once). */
export function conditionSummary(): ConditionSummary {
  if (SUMMARY) return SUMMARY
  const ps = generatePersonasV4()
  const cs = ps.map((p) => conditionsV4().get(p.id)!)
  const tally = <K extends string>(keys: readonly K[], f: (c: ConditionV4) => K) => Object.fromEntries(keys.map((k) => [k, cs.filter((c) => f(c) === k).length])) as Record<K, number>
  return (SUMMARY = {
    meanByDim: Object.fromEntries(DIMENSIONS.map((d) => [d, Math.round((cs.reduce((t, c) => t + c.dims[d].score, 0) / cs.length) * 10) / 10])) as Record<Dimension, number>,
    bandsByDim: Object.fromEntries(DIMENSIONS.map((d) => [d, tally(COND_BANDS, (c) => c.dims[d].band)])) as Record<Dimension, Record<CondBand, number>>,
    mainNeed: tally(DIMENSIONS, (c) => c.mainNeed),
    readiness: tally(READINESS, (c) => c.readiness),
    acuity: tally(['acute', 'ongoing', 'long-standing'] as const, (c) => c.acuity),
    support: tally(['alone', 'some', 'strong'] as const, (c) => c.support),
    meanOverall: Math.round((cs.reduce((t, c) => t + c.overall, 0) / cs.length) * 10) / 10,
    readyShare: cs.filter((c) => c.readiness === 'preparing' || c.readiness === 'acting' || c.readiness === 'maintaining').length / cs.length,
    incoherent: ps.filter((p) => conditionIncoherence(p, conditionsV4().get(p.id)!).length).length,
  })
}
