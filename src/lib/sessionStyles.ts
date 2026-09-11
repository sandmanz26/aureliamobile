// What a session is made of, as the Session settings screen edits it.
//
// A session has three editable layers — the words, the look, and the sound —
// and each of the last two is a set of named styles you add or drop. Styles are
// data, not UI: the same catalogue feeds the "explore" grid here and, in a real
// build, whatever the model is asked to generate from.

import type { CoverKey } from './photos'

export type StyleKind = 'visual' | 'sound'

export interface SessionStyle {
  id: string
  kind: StyleKind
  name: string
  /** One line, as it reads on the card. */
  summary: string
  /** The longer version behind "More". */
  detail: string
  photo: CoverKey
  gradient: string
}

/** A style already on the session, shown as a chip you can take off again. */
export interface AppliedStyle {
  id: string
  kind: StyleKind
  name: string
  /** Why it is on the session — stated in terms of the goal, not the setting. */
  reason: string
  /** One of the three orb renders. */
  orb: 'yellow' | 'movement' | 'hz432'
}

export const APPLIED_STYLES: AppliedStyle[] = [
  {
    id: 'increase-yellow',
    kind: 'visual',
    name: 'Increase yellow',
    reason: 'Helps bring joy, aligned with your goal',
    orb: 'yellow',
  },
  {
    id: 'less-movement',
    kind: 'visual',
    name: 'Less movement',
    reason: 'Reduced movement calms the nervous system before sleep',
    orb: 'movement',
  },
  {
    id: '432hz',
    kind: 'sound',
    name: '432 Hz',
    reason: 'Helps bring joy, aligned with your goal',
    orb: 'hz432',
  },
  {
    id: 'male-voice',
    kind: 'sound',
    name: 'Male voice over',
    reason: 'Lower register, steadier at low volume',
    orb: 'movement',
  },
]

export const SESSION_STYLES: SessionStyle[] = [
  {
    id: 'organic-futurism',
    kind: 'visual',
    name: 'Organic futurism',
    summary: 'Soft gradients, fluid shapes, subtle 3D, nature-led',
    detail:
      'Shapes that grow rather than assemble. Warm light through depth, nothing hard-edged, and a palette taken from dusk rather than from a screen.',
    photo: 'forest',
    gradient: 'linear-gradient(160deg, var(--color-warning-700), var(--color-gold-200))',
  },
  {
    id: 'increase-yellow-style',
    kind: 'visual',
    name: 'Increase yellow',
    summary: 'Visually rich, depth from warm light rather than contrast',
    detail:
      'Pushes the whole frame toward the warm end. Reads as late afternoon, and holds up on a dim screen where cooler palettes go flat.',
    photo: 'glow',
    gradient: 'linear-gradient(160deg, var(--color-warning-600), var(--color-gold-300))',
  },
  {
    id: 'minimal-modern',
    kind: 'visual',
    name: 'Minimal modern',
    summary: 'Clean layouts, generous whitespace, restrained colour',
    detail:
      'One subject, a lot of room around it, and at most two colours doing any work. The quietest of the visual directions.',
    photo: 'mountains',
    gradient: 'linear-gradient(160deg, var(--color-info-800), var(--color-neutral-300))',
  },
  {
    id: 'digital-craftsmanship',
    kind: 'visual',
    name: 'Digital craftsmanship',
    summary: 'Meticulous detail, layered light, a made object',
    detail:
      'Everything looks worked on. Layered translucency and light that has been placed rather than found — the busiest option here.',
    photo: 'cosmic',
    gradient: 'linear-gradient(160deg, var(--color-info-900), var(--color-danger-500))',
  },
  {
    id: 'tibetan-bowls',
    kind: 'sound',
    name: 'Tibetan singing bowls',
    summary: 'Struck bowls, long decay, generous silence between',
    detail:
      'Seven bowls, each left to run out entirely before the next. The silence between strikes is most of the sound.',
    photo: 'stones',
    gradient: 'linear-gradient(160deg, var(--color-espresso-900), var(--color-warning-400))',
  },
  {
    id: 'aulos-flute',
    kind: 'sound',
    name: 'Aulos (Greek flute)',
    summary: 'Reeded double flute, breathy, no vibrato',
    detail:
      'An ancient double-reed with audible breath in every note. Human and slightly unsteady, which is the point.',
    photo: 'meadow',
    gradient: 'linear-gradient(160deg, var(--color-gold-300), var(--color-warning-600))',
  },
  {
    id: 'female-voice',
    kind: 'sound',
    name: 'Female voice over',
    summary: 'Warm, unhurried, long gaps between cues',
    detail:
      'Guidance that leaves room. Fewer cues than most guided sessions, and none of them asks you to try harder.',
    photo: 'affirmations',
    gradient: 'linear-gradient(160deg, var(--color-danger-400), var(--color-warning-300))',
  },
  {
    id: 'underwater',
    kind: 'sound',
    name: 'Underwater effect',
    summary: 'Everything filtered as if heard from below the surface',
    detail:
      'A low-pass over the whole mix with slow movement on the cutoff — the sense of the room being somewhere above you.',
    photo: 'underwater',
    gradient: 'linear-gradient(160deg, var(--color-info-950), var(--color-info-600))',
  },
]

export function stylesOfKind(kind: StyleKind) {
  return SESSION_STYLES.filter((style) => style.kind === kind)
}

export function appliedOfKind(kind: StyleKind) {
  return APPLIED_STYLES.filter((style) => style.kind === kind)
}

/**
 * The session script.
 *
 * Cues in square brackets are direction for the reader, not lines to be spoken
 * — the screen renders them differently so the two can never be confused.
 */
export const SESSION_SCRIPT: string[] = [
  'Welcome.',
  'Take a moment to settle into a comfortable position.',
  'Allow your shoulders to soften.',
  'Relax your jaw.',
  'Let your hands rest naturally. [pause]',
  'Take a deep breath in. [inhale]',
  'There is nowhere to go.\nNothing to achieve.\nFor the next few minutes, simply be here.',
  'Bring your awareness to your breath.',
  'Notice the gentle rise and fall of your chest.',
  'The movement of your belly.',
  'The natural rhythm that has been supporting you all along.',
  'Today, we will practice Box Breathing.',
  'A simple and powerful technique that calms the nervous system and brings the mind back into balance.',
  'We will breathe in for four counts.',
  'Hold for four counts.',
  'Exhale for four counts.',
  'And hold again for four counts. [pause]',
  'Let’s begin together.',
]
