// My Wellness → Analytics, the v2 design (Figma "My Wellness/Analytics"
// 16883:14834 and "Analysis" 16883:15959, U039).
//
// One record per session the user is working on. Every number a screen shows
// is derived from the record rather than written next to it, so the card, the
// hero ring, the "Great Progress!" heading, the summary sentence, the chart
// and the next-chapter prediction cannot disagree with each other — which the
// Figma frames, being drawings, sometimes do (the 24% card's ring is drawn at
// ~31%; "What helped me?" repeats Less movement; the chart's axis runs to 400
// under percentage metrics). Mock, like the rest of lib/.
import orb432hz from '../assets/orb-432hz.png'
import orbIncreaseYellow from '../assets/orb-increase-yellow.png'
import orbLessMovement from '../assets/orb-less-movement.png'
import { COVER_PHOTOS, unsplash } from './photos'
import type { CoverKey } from './photos'
import { findSession } from './sessions'

export interface Metric {
  id: string
  /** The objective itself ("Gain mental clarity") or a shift ("Anxious → Calm"). */
  label: string
  from?: string
  to?: string
  /** Dot and chart colour (sampled from the frame). */
  color: string
  /** Improvement so far, %. For the objective this *is* the progress. */
  value: number
  /** Projected value at the end of chapters 2 and 3, % (dashed on the chart). */
  projected: [number, number]
}

export interface Helper {
  title: string
  description: string
  improved: number
  orb: string
}

export interface Proposal {
  id: string
  title: string
  description: string
  improveScore: string
  orb: string
  preview: string
}

export interface Analysis {
  id: string
  /** The catalogue session this is about — its art, and where "Go to Session" goes. */
  sessionSlug: string
  /** "Session 1: Ocean Meditation" */
  sessionLabel: string
  /** The objective, "Gain Mental Clarity". */
  objective: string
  /** Change in progress since yesterday, percentage points (negative = down). */
  sinceYesterday: number
  /** Chapters already listened to and analysed. */
  chaptersDone: number
  /** The first metric is the objective; its value is the progress shown in the ring. */
  metrics: Metric[]
  helped: Helper[]
  /** What Aurelia proposes for the next chapter. */
  proposals: Proposal[]
  /** Predicted gain on the objective from the next chapter, percentage points. */
  predictedGain: number
}

export const METRIC_COLORS = {
  objective: '#FFB746',
  calm: '#5FC52C',
  grounded: '#D862FF',
  sleep: '#4DCAFF',
} as const

const fern = unsplash(COVER_PHOTOS.forest, 160, 160)

export const ANALYSES: Analysis[] = [
  {
    id: 'mental-clarity',
    sessionSlug: 'dolphins-frequency',
    sessionLabel: 'Session 1: Ocean Meditation',
    objective: 'Gain Mental Clarity',
    sinceYesterday: 3,
    chaptersDone: 1,
    predictedGain: 12,
    metrics: [
      { id: 'clarity', label: 'Gain mental clarity', color: METRIC_COLORS.objective, value: 60, projected: [72, 80] },
      { id: 'calm', label: 'Anxious → Calm', from: 'Anxious', to: 'Calm', color: METRIC_COLORS.calm, value: 35, projected: [44, 50] },
      { id: 'grounded', label: 'Scattered → Grounded', from: 'Scattered', to: 'Grounded', color: METRIC_COLORS.grounded, value: 12, projected: [20, 27] },
      { id: 'sleep', label: 'Light sleep → Deep sleep', from: 'Light sleep', to: 'Deep sleep', color: METRIC_COLORS.sleep, value: 11, projected: [18, 24] },
    ],
    helped: [
      { title: 'Increased Yellow', description: 'Helped you bring joy, aligned with your goal', improved: 12, orb: orbIncreaseYellow },
      { title: 'Less movement', description: 'Reduced movement helped your nervous system to calm', improved: 8, orb: orbLessMovement },
      { title: '432Hz', description: 'The lower tuning eased your body’s reaction to stress', improved: 5, orb: orb432hz },
    ],
    proposals: [
      { id: '435hz', title: '435 Hz', description: 'A slightly brighter tone to lift focus', improveScore: '6%', orb: fern, preview: 'dolphins-frequency' },
      { id: 'longer-exhale', title: 'Longer exhale', description: 'Guided 4–7 breathing to settle the nervous system', improveScore: '4%', orb: orbLessMovement, preview: 'ocean-breath' },
      { id: 'warmer-light', title: 'Warmer light', description: 'Softer amber visuals as the session closes', improveScore: '2%', orb: orbIncreaseYellow, preview: 'golden-hour' },
    ],
  },
  {
    id: 'nervous-system',
    sessionSlug: 'ocean-breath',
    sessionLabel: 'Session 2: Breath Work',
    objective: 'Regulate Nervous System',
    sinceYesterday: -2,
    chaptersDone: 1,
    predictedGain: 9,
    metrics: [
      { id: 'regulate', label: 'Regulate nervous system', color: METRIC_COLORS.objective, value: 24, projected: [33, 41] },
      { id: 'calm', label: 'Tense → Relaxed', from: 'Tense', to: 'Relaxed', color: METRIC_COLORS.calm, value: 14, projected: [22, 30] },
      { id: 'grounded', label: 'Restless → Still', from: 'Restless', to: 'Still', color: METRIC_COLORS.grounded, value: 9, projected: [15, 21] },
      { id: 'sleep', label: 'Shallow breath → Deep breath', from: 'Shallow breath', to: 'Deep breath', color: METRIC_COLORS.sleep, value: 6, projected: [12, 17] },
    ],
    helped: [
      { title: 'Less movement', description: 'Reduced movement helped your body slow down', improved: 6, orb: orbLessMovement },
    ],
    proposals: [
      { id: 'slower-pace', title: 'Slower pace', description: 'Six breaths a minute instead of eight', improveScore: '5%', orb: orbLessMovement, preview: 'ocean-breath' },
      { id: '432hz', title: '432Hz', description: 'A lower tuning your body tends to respond to', improveScore: '3%', orb: orb432hz, preview: '528-hz-reset' },
      { id: 'warmer-light', title: 'Warmer light', description: 'Softer amber visuals to signal safety', improveScore: '1%', orb: orbIncreaseYellow, preview: 'golden-hour' },
    ],
  },
]

export function findAnalysis(id: string | undefined) {
  return ANALYSES.find((analysis) => analysis.id === id)
}

/**
 * The analysis for a session, if you are working on one with it. The player
 * opens on this instead of the catalogue's description (U041): the analysis
 * is about the listener, so it applies whoever made the session.
 */
export function analysisForSession(slug: string | undefined) {
  return ANALYSES.find((analysis) => analysis.sessionSlug === slug)
}

/** The objective's progress, % — the ring, the card and the first metric are all this. */
export function progressOf(analysis: Analysis) {
  return analysis.metrics[0]?.value ?? 0
}

/**
 * The status line ("Great Progress!" / "Needs Improvement."). One set of
 * thresholds for the card and the analysis page, so they never disagree.
 */
export function statusOf(progress: number) {
  if (progress >= 50) return { heading: 'Great Progress!', short: 'Great Progress!' }
  if (progress >= 35) return { heading: 'Good Progress', short: 'Good Progress.' }
  return { heading: 'Needs Improvement', short: 'Needs Improvement.' }
}

/** The art for an analysis: its session's own cover, so the two always match. */
export function artOf(analysis: Analysis): { photo: CoverKey; gradient: string } {
  const session = findSession(analysis.sessionSlug)
  return { photo: session?.photo ?? 'calm', gradient: session?.gradient ?? 'linear-gradient(160deg,#FFB746,#FF881B)' }
}

const ORDINAL = ['one', 'two', 'three', 'four', 'five']

/**
 * The sentence under the heading, written from the strongest shift — not
 * hand-typed beside the numbers, which is how it ends up quoting one the
 * list does not show.
 */
export function summaryOf(analysis: Analysis) {
  const shifts = analysis.metrics.slice(1).filter((m) => m.from && m.to)
  const best = shifts.reduce<Metric | undefined>((top, m) => (!top || m.value > top.value ? m : top), undefined)
  if (!best) return ''
  if (analysis.sinceYesterday >= 0) {
    return `In a short time you moved from ${best.from!.toLowerCase()} to ${best.to!.toLowerCase()} by ${best.value}%.`
  }
  return `Progress dipped ${Math.abs(analysis.sinceYesterday)}% since yesterday, though you have still moved from ${best.from!.toLowerCase()} to ${best.to!.toLowerCase()} by ${best.value}%.`
}

/** "Based on analysis of chapter one, Aurelia predicts a 12% increase…" */
export function predictionOf(analysis: Analysis) {
  const chapter = ORDINAL[analysis.chaptersDone - 1] ?? String(analysis.chaptersDone)
  return `Based on analysis of chapter ${chapter}, Aurelia predicts a ${analysis.predictedGain}% increase to get you closer to your objective.`
}

/** The next chapter's number, for "Create Chapter 2". */
export function nextChapterOf(analysis: Analysis) {
  return analysis.chaptersDone + 1
}

/** "Create Chapter 2 with 435 Hz, Longer exhale and Warmer light" — the cockpit's brief. */
export function chapterBrief(analysis: Analysis) {
  const names = analysis.proposals.map((p) => p.title)
  const list = names.length > 1 ? `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}` : names[0]
  return `Create Chapter ${nextChapterOf(analysis)} with ${list}`
}
