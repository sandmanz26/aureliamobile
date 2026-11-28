/**
 * Sleep, chapter 1, as AKPs (U145, J206): our version of the "AKP Graph
 * Explorer" in the business owner's screenshot (2026-11-27 brief: about 20
 * AKPs and 30 connections make one chapter, across script, music, voice and
 * image). Every node is a strategy AKP that drives the chapter toward the
 * sleep StateFlip's first step (WG-PHY-01-X). Script, music and image nodes
 * are catalogue AKPs (akps.ts, from the workbooks); the catalogue has no voice
 * family yet, so the four voice nodes are drafted by us and labelled draft.
 * The links, their types and the phase timings are drafted by us — to review.
 *
 * Chapter 1 sits in the mood stretch (score under 45) for everyone in the
 * sleep group, so these are the AKPs that drive the mood-layer uplift. The
 * habit and skill stretches have no AKP drivers defined yet; the page keeps
 * them labelled assumption.
 */

import { baseAkpById } from './akps'
import { DRAFTED } from './stateFlips'

export type ChapterModality = 'Script' | 'Music' | 'Voice' | 'Image'
export const CHAPTER_MODALITIES: ChapterModality[] = ['Script', 'Music', 'Voice', 'Image']
export type ChapterLinkType = 'drives' | 'part-of' | 'syncs' | 'reinforces' | 'cues'
export const CHAPTER_LINK_TYPES: ChapterLinkType[] = ['drives', 'part-of', 'syncs', 'reinforces', 'cues']
export const CHAPTER_LINK_TEXT: Record<ChapterLinkType, { verb: string; plain: string }> = {
  drives: { verb: 'drives', plain: 'Moves the person toward the goal directly' },
  'part-of': { verb: 'is part of', plain: 'A smaller piece of a larger AKP' },
  syncs: { verb: 'keeps time with', plain: 'Two AKPs paced together (breath, tempo, motion)' },
  reinforces: { verb: 'reinforces', plain: 'Makes another AKP land more strongly' },
  cues: { verb: 'cues', plain: 'Signals that the next AKP starts' },
}

export interface ChapterNode {
  id: string
  name: string
  modality: ChapterModality
  layer: string
  /** What it does in this chapter, in plain words. */
  role: string
  /** True when the AKP is in the catalogue (akps.ts); false for the drafted voice AKPs. */
  inCatalogue: boolean
  source: string
}

export interface ChapterLink {
  from: string
  to: string
  type: ChapterLinkType
}

export const CHAPTER_GOAL = { id: 'WG-PHY-01-X', name: 'X: first relief from bad sleep', flip: 'SF-PHY-01' }

/** id, modality, role; name, layer and source come from the catalogue where the AKP is there. */
const PICK: [string, ChapterModality, string][] = [
  ['WS-SK9', 'Script', 'The skill the chapter teaches: coming down from the day’s stress.'],
  ['WS-LU-02', 'Script', 'Breath slowed to the voice and music: the core of the chapter.'],
  ['WS-BL-02', 'Script', 'A short relaxation routine the person can repeat in bed.'],
  ['WS-HT-03', 'Script', 'One sleep-hygiene line, said once, at the end.'],
  ['WS-H5', 'Script', 'Muscle groups tensed and let go, feet to face.'],
  ['WS-F11', 'Script', 'The breathing pattern: in for 4, out for 6.'],
  ['WS-M2', 'Script', 'The mood the whole chapter aims for: calm.'],
  ['WM-MM4', 'Music', 'Tempo eases from about 70 to 55 beats a minute.'],
  ['WM-MM2', 'Music', 'Rhythm the breath can lock onto.'],
  ['WM-CM1', 'Music', 'A low binaural bed under the voice.'],
  ['WM-MT1', 'Music', 'A steady drone the body can rest against.'],
  ['WM-SE3', 'Music', 'Night rain, so silence never feels empty.'],
  ['WI-LFT1', 'Image', 'The picture darkens as the chapter goes.'],
  ['WI-VT3', 'Image', 'Warm colour grading: no blue light.'],
  ['WI-VMS2', 'Image', 'Still water: a picture with nothing to follow.'],
  ['WI-LFT3', 'Image', 'Slow drift, paced to the out-breath.'],
]

const VOICE: ChapterNode[] = [
  { id: 'VO-01', name: 'Slow pace', modality: 'Voice', layer: 'Delivery', role: 'About 110 words a minute, slowing toward the end.', inCatalogue: false, source: DRAFTED },
  { id: 'VO-02', name: 'Low, warm register', modality: 'Voice', layer: 'Timbre', role: 'A low, close voice; no bright or sharp tones.', inCatalogue: false, source: DRAFTED },
  { id: 'VO-03', name: 'Lengthening pauses', modality: 'Voice', layer: 'Delivery', role: 'Gaps between lines grow from 2 to 8 seconds.', inCatalogue: false, source: DRAFTED },
  { id: 'VO-04', name: 'Voice fades out', modality: 'Voice', layer: 'Structure', role: 'The voice stops for the last two minutes.', inCatalogue: false, source: DRAFTED },
]

let NODES: ChapterNode[] | undefined

/** The 20 strategy AKPs of sleep chapter 1. */
export function chapterNodes(): ChapterNode[] {
  if (NODES) return NODES
  const fromCatalogue = PICK.map(([id, modality, role]) => {
    const a = baseAkpById(id)!
    return { id, name: a.name, modality, layer: a.layer, role, inCatalogue: true, source: a.source }
  })
  return (NODES = [...fromCatalogue, ...VOICE])
}

/** The 30 typed links, drafted by us — to review. */
export const CHAPTER_LINKS: ChapterLink[] = [
  // Direct drivers of the step.
  { from: 'WS-SK9', to: CHAPTER_GOAL.id, type: 'drives' },
  { from: 'WS-LU-02', to: CHAPTER_GOAL.id, type: 'drives' },
  { from: 'WS-BL-02', to: CHAPTER_GOAL.id, type: 'drives' },
  { from: 'WM-MM2', to: CHAPTER_GOAL.id, type: 'drives' },
  { from: 'VO-03', to: CHAPTER_GOAL.id, type: 'drives' },
  // Parts.
  { from: 'WS-H5', to: 'WS-BL-02', type: 'part-of' },
  { from: 'WS-F11', to: 'WS-LU-02', type: 'part-of' },
  { from: 'WS-M2', to: 'WS-SK9', type: 'part-of' },
  { from: 'WS-HT-03', to: 'WS-SK9', type: 'part-of' },
  // Paced together.
  { from: 'WM-MM4', to: 'WS-LU-02', type: 'syncs' },
  { from: 'VO-01', to: 'WM-MM4', type: 'syncs' },
  { from: 'WM-MM2', to: 'WS-F11', type: 'syncs' },
  { from: 'WI-LFT3', to: 'WM-MM4', type: 'syncs' },
  { from: 'VO-03', to: 'WS-F11', type: 'syncs' },
  { from: 'WM-CM1', to: 'WM-MM2', type: 'syncs' },
  // Reinforcing.
  { from: 'WM-MT1', to: 'WS-M2', type: 'reinforces' },
  { from: 'WM-SE3', to: 'WS-M2', type: 'reinforces' },
  { from: 'WI-VMS2', to: 'WS-M2', type: 'reinforces' },
  { from: 'WI-VT3', to: 'WI-LFT1', type: 'reinforces' },
  { from: 'VO-02', to: 'WS-M2', type: 'reinforces' },
  { from: 'WI-LFT1', to: 'WS-HT-03', type: 'reinforces' },
  { from: 'WM-SE3', to: 'WI-VMS2', type: 'reinforces' },
  { from: 'VO-04', to: 'WS-HT-03', type: 'reinforces' },
  // Cues.
  { from: 'WS-H5', to: 'VO-01', type: 'cues' },
  { from: 'WS-HT-03', to: 'VO-04', type: 'cues' },
  { from: 'WI-LFT1', to: 'VO-04', type: 'cues' },
  { from: 'WM-MT1', to: 'WS-H5', type: 'cues' },
  { from: 'VO-02', to: 'WS-H5', type: 'cues' },
  { from: 'WS-F11', to: 'WI-LFT3', type: 'cues' },
  { from: 'WI-VMS2', to: 'WS-LU-02', type: 'cues' },
]

export interface ChapterPhase {
  id: string
  name: string
  minutes: [number, number]
  what: string
  /** Assumption: the share of the chapter's uplift this phase carries. */
  share: number
  drivers: string[]
}

/** The four phases of the 10-minute chapter and the AKPs that drive each (drafted, shares are an assumption). */
export const CHAPTER_PHASES: ChapterPhase[] = [
  { id: 'arrive', name: 'Arrive', minutes: [0, 2], what: 'Voice and picture slow the person down and set a calm tone.', share: 0.2, drivers: ['VO-01', 'VO-02', 'WI-VT3', 'WM-SE3', 'WS-M2'] },
  { id: 'breathe', name: 'Breathe', minutes: [2, 5], what: 'Breath locks to the music and the drift of the picture.', share: 0.35, drivers: ['WS-F11', 'WS-LU-02', 'WM-MM4', 'WM-MM2', 'WI-LFT3'] },
  { id: 'release', name: 'Release', minutes: [5, 8], what: 'Muscles let go, one group at a time, over a drone.', share: 0.3, drivers: ['WS-H5', 'WS-BL-02', 'WM-MT1', 'WM-CM1', 'WI-VMS2'] },
  { id: 'drift', name: 'Drift', minutes: [8, 10], what: 'The voice thins out and stops; light goes down.', share: 0.15, drivers: ['VO-03', 'VO-04', 'WI-LFT1', 'WS-HT-03', 'WS-SK9'] },
]

export const chapterNodeById = (id: string) => chapterNodes().find((n) => n.id === id)
