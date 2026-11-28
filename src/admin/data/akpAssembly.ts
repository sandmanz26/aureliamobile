/**
 * Chapters assembled from AKPs (U150, J208): the "lego pieces" the business
 * owner asked for (A41), put together by written rules, no media generated.
 *
 * - chapterKit(flip): one script, voice, music and image AKP that serve a
 *   StateFlip (CHAPTER_FAMILIES). Every one of the 125 StateFlips has a kit;
 *   akps.test.ts checks it. This is the floor, not a good chapter.
 * - personalChapter(flip, prefs): the first chapter for one person, the
 *   pieces matched to their Wellness Identity (voice, tempo, palette,
 *   session length, regulation style, risk flags) and their StateFlip. Used
 *   by buyer agent test 9 as the concrete preview ("your first chapter:
 *   …"). The matching rules are below and drafted by us — to review.
 *
 * Pure data, deterministic; reads the merged catalogue (akps()).
 */

import { CHAPTER_FAMILIES, akps, akpsForFlip, norm, type Akp, type AkpFamily } from './akps'
import type { Dimension } from './personaConditionV4'

export interface ChapterKit {
  flipId: string
  pieces: Partial<Record<AkpFamily, Akp>>
  complete: boolean
}

/** The first AKP of each chapter family that serves the StateFlip. */
export function chapterKit(flipId: string): ChapterKit {
  const pool = akpsForFlip(flipId).filter((a) => a.kind === 'strategy')
  const pieces: Partial<Record<AkpFamily, Akp>> = {}
  for (const f of CHAPTER_FAMILIES) {
    const a = pool.find((x) => x.family === f)
    if (a) pieces[f] = a
  }
  return { flipId, pieces, complete: CHAPTER_FAMILIES.every((f) => pieces[f]) }
}

export type Regulation = 'breath first' | 'voice first' | 'movement first' | 'reflection first' | 'music first'

export interface ChapterPrefs {
  dimension: Dimension
  /** "warm and low" or "clear, mid-range" (personaIdentityV4). */
  voice: string
  /** "50–60 bpm" or "60–72 bpm". */
  tempo: string
  palette: string
  minutes: number
  regulation: Regulation
  noBreathHolds: boolean
  secularOnly: boolean
}

export interface PersonalChapter {
  flipId: string
  minutes: number
  /** In order: technique, focus (the StateFlip's own AKP), voice timbre, voice pace, tempo, music bed, image. */
  pieces: { role: string; akp: Akp; matched: string }[]
  /** "Your first chapter: …", the line the person sees. */
  preview: string
}

let BY_NAME: Map<string, Akp> | undefined
let BY_NAME_SRC: Akp[] | undefined
/** An AKP by its exact name (normalised); throws when the catalogue lacks it, so a renamed piece fails the tests. */
export function byName(name: string): Akp {
  const all = akps()
  if (BY_NAME_SRC !== all) {
    BY_NAME = new Map(all.map((a) => [norm(a.name), a]))
    BY_NAME_SRC = all
  }
  const a = BY_NAME!.get(norm(name))
  if (!a) throw new Error(`No AKP named “${name}”`)
  return a
}

/** The rules, written out, so the page and the report say the same. */
export const ASSEMBLY_RULES: { label: string; rule: string }[] = [
  { label: 'Technique', rule: 'Regulation style picks it: breath first → 4-7-8 breathing (extended exhale 4 in 6 out when worry or panic rules out holds); voice first → body scan feet to head; movement first → tense and release hands; reflection first → what-went-well journaling; music first → sound bath listening.' },
  { label: 'Focus', rule: 'The StateFlip’s own first script AKP (a DOJO concept, skill or mood linked to it).' },
  { label: 'Voice', rule: 'Timbre from the voice preference (warm and low → low warm baritone; clear → clear mid-range); pace 110 words a minute when the tempo preference is slow, 125 otherwise.' },
  { label: 'Music', rule: 'Tempo from the tempo preference (50–60 → 55 BPM, 60–72 → 66 BPM); the bed from the main need: physical tanpura drone, mental pink noise, emotional felt piano, relational solo cello, spiritual Tibetan singing bowl, or fingerpicked acoustic guitar when the person wants secular language only.' },
  { label: 'Image', rule: 'The palette preference: earthy ambers → warm amber, soft blues → pale sky, forest greens → forest moss, dusk violets → dusk lavender.' },
  { label: 'Length', rule: 'Their own session length (personaConditionV4 sessionMinutesOf), never longer than their daily time.' },
]

const TECHNIQUE: Record<Regulation, string> = {
  'breath first': '4-7-8 breathing',
  'voice first': 'Body scan feet to head',
  'movement first': 'Tense and release hands',
  'reflection first': 'What-went-well journaling',
  'music first': 'Sound bath listening',
}
const BED: Record<Dimension, string> = { physical: 'Tanpura drone', mental: 'Pink noise', emotional: 'Felt piano', relational: 'Solo cello', spiritual: 'Tibetan singing bowl' }
const PALETTE: Record<string, string> = { 'earthy ambers': 'Warm amber palette', 'soft blues': 'Pale sky palette', 'forest greens': 'Forest moss palette', 'dusk violets': 'Dusk lavender palette' }

const short = (a: Akp) => a.name.replace(/ \([^)]*\)$/, '')
const lower = (s: string) => s.charAt(0).toLowerCase() + s.slice(1)

export function personalChapter(flipId: string, p: ChapterPrefs): PersonalChapter {
  const tech = p.regulation === 'breath first' && p.noBreathHolds ? 'Extended exhale 4 in 6 out' : TECHNIQUE[p.regulation]
  const focus = akpsForFlip(flipId).find((a) => a.family === 'script' && a.kind === 'strategy') ?? chapterKit(flipId).pieces.script!
  const warm = /warm/.test(p.voice)
  const slow = /^50/.test(p.tempo)
  const bed = p.dimension === 'spiritual' && p.secularOnly ? 'Fingerpicked acoustic guitar' : BED[p.dimension]
  const palette = PALETTE[p.palette] ?? 'Sage green palette'
  const pieces = [
    { role: 'Technique', akp: byName(tech), matched: `regulation: ${p.regulation}${p.noBreathHolds && p.regulation === 'breath first' ? ', no breath holds' : ''}` },
    { role: 'Focus', akp: focus, matched: `StateFlip ${flipId}` },
    { role: 'Voice', akp: byName(warm ? 'Low warm baritone' : 'Clear mid-range'), matched: `voice preference: ${p.voice}` },
    { role: 'Pace', akp: byName(slow ? '110 words a minute' : '125 words a minute'), matched: `tempo preference: ${p.tempo}` },
    { role: 'Tempo', akp: byName(slow ? 'Tempo 55 BPM' : 'Tempo 66 BPM'), matched: `tempo preference: ${p.tempo}` },
    { role: 'Music bed', akp: byName(bed), matched: `main need: ${p.dimension}${bed !== BED[p.dimension] ? ', secular only' : ''}` },
    { role: 'Image', akp: byName(palette), matched: `palette preference: ${p.palette}` },
  ]
  const voiceWords = `${warm ? 'warm low' : 'clear'} voice at ${slow ? 110 : 125} words a minute`
  const preview = `Your first chapter: ${lower(short(pieces[0].akp))}, ${voiceWords}, ${slow ? 55 : 66} BPM ${lower(short(pieces[5].akp))}, ${lower(short(pieces[6].akp)).replace(/ palette$/, '')} colours, ${p.minutes} min.`
  return { flipId, minutes: p.minutes, pieces, preview }
}
