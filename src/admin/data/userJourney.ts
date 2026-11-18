import { z } from 'zod'

// The user journey map (U088): the product team's blueprint of when people
// reach for Aurelia, in four stages, each with illustrated moments and the
// product screens that serve them. Ported from the "Aurelia journey
// blueprint" HTML the owner supplied; edits stay in this browser, like every
// other admin edit, until a backend exists.

const IMG = '/admin/user-journey'

export const JourneyItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  /** The feature opportunity the moment or screen suggests. */
  feature: z.string(),
  /** A path under public/ or a data: URL for an uploaded image. Empty = none. */
  image: z.string(),
})

/**
 * A product screen is an item plus what it serves (U-next): the moments it
 * answers and where it lives. Both are optional so a map saved or exported
 * before they existed still parses, instead of `readJson` falling back to the
 * initial data and wiping a user's edits.
 */
export const JourneyScreenSchema = JourneyItemSchema.extend({
  /** Ids of the moments this screen serves, in any stage. */
  momentIds: z.array(z.string()).optional(),
  /** Where it lives: an app route (`/play/...`) or a Figma URL. */
  link: z.string().optional(),
})

export const JourneyStageSchema = z.object({
  id: z.string(),
  title: z.string(),
  /** The question the stage answers, e.g. "When do users pause and check in?" */
  question: z.string(),
  color: z.string(),
  moments: z.array(JourneyItemSchema),
  screens: z.array(JourneyScreenSchema),
})

export const JourneyMapSchema = z.object({
  version: z.literal(1),
  stages: z.array(JourneyStageSchema).min(1),
})

export type JourneyItem = z.infer<typeof JourneyItemSchema>
export type JourneyScreen = z.infer<typeof JourneyScreenSchema>
export type JourneyStage = z.infer<typeof JourneyStageSchema>
export type JourneyMap = z.infer<typeof JourneyMapSchema>
export type ItemKind = 'moments' | 'screens'

export const STORAGE_KEY = 'aurelia.admin.userJourney'
export const NEW_MOMENT_IMAGE = `${IMG}/scene-12.webp`

export const INITIAL_JOURNEY: JourneyMap = {
  version: 1,
  stages: [
    {
      id: 'reflect',
      title: 'Reflect',
      question: 'When do users pause and check in?',
      color: '#8eaa9b',
      moments: [
        { id: 'r1', title: 'Morning check-in', description: 'Start the day with a lightweight emotional pulse check and a simple recommendation based on mood, energy, or intent.', feature: 'Mood check-in + personalized daily recommendation', image: `${IMG}/scene-01.webp` },
        { id: 'r2', title: 'In-the-moment conversation', description: 'Reach for support during the day through a conversational flow that helps users name what they feel and respond in context.', feature: 'AI chat support + emotional labeling', image: `${IMG}/scene-02.webp` },
      ],
      screens: [{ id: 's1', title: 'Reflection / check-in', description: 'The daily check-in: how you feel today, whether the last session helped, an optional note.', feature: 'Check-in, journaling, and adaptive guidance', image: `${IMG}/screen-3.webp`, momentIds: ['r1', 'r2'] }],
    },
    {
      id: 'create',
      title: 'Create',
      question: 'When do users express, capture, or make meaning?',
      color: '#e4b77a',
      moments: [
        { id: 'c1', title: 'Create while commuting', description: 'Use transit time to capture thoughts, respond to prompts, and turn emotional momentum into something tangible inside the app.', feature: 'Prompt-based journaling + quick capture', image: `${IMG}/scene-03.webp` },
        { id: 'c2', title: 'Create during work breaks', description: 'Dip into a short creative ritual between tasks to reset focus and transform mental load into reflection or expression.', feature: 'Micro-journaling + guided creation', image: `${IMG}/scene-04.webp` },
      ],
      screens: [{ id: 's2', title: 'Create / conversation', description: 'The cockpit: the next chapter and the changes Aurelia proposes for it.', feature: 'Creative prompts + conversational flow', image: `${IMG}/screen-1.webp`, momentIds: ['c1', 'c2'] }],
    },
    {
      id: 'experience',
      title: 'Experience',
      question: 'When do users need guided support in the moment?',
      color: '#b2a1bc',
      moments: [
        { id: 'e1', title: 'Start the morning grounded', description: 'Open the app for a short session that helps regulate energy and set the tone for the day.', feature: 'Morning routine + breathwork or audio session', image: `${IMG}/scene-06.webp` },
        { id: 'e2', title: 'Before an event', description: 'Prepare for a presentation, meeting, or difficult conversation with a calming practice that reduces activation and builds clarity.', feature: 'Pre-event grounding + guided audio', image: `${IMG}/scene-07.webp` },
        { id: 'e3', title: 'After an event', description: 'Process what happened after a tense or meaningful moment and receive support for integration, reframing, or repair.', feature: 'Post-event reflection + recovery guidance', image: `${IMG}/scene-08.webp` },
        { id: 'e4', title: 'Support while commuting', description: 'Use transition moments to decompress, reflect, or continue a guided session while on the move.', feature: 'On-the-go listening + session continuation', image: `${IMG}/scene-09.webp` },
        { id: 'e5', title: 'Before sleep', description: 'Wind down with a gentle end-of-day ritual that helps release the day and prepare the nervous system for sleep.', feature: 'Sleep wind-down + evening reflection', image: `${IMG}/scene-10.webp` },
      ],
      screens: [{ id: 's3', title: 'Experience / session', description: 'The player: a guided session playing, with its cue and progress.', feature: 'Guided experience + progress state', image: `${IMG}/screen-2.webp`, momentIds: ['e1', 'e2', 'e4', 'e5'] }],
    },
    {
      id: 'share',
      title: 'Share',
      question: 'When does personal progress become worth sharing?',
      color: '#d9a1a0',
      moments: [
        { id: 'h1', title: 'Celebrate progress', description: 'When users feel better or notice change, invite them to reflect on progress and share outcomes in a safe, intentional way.', feature: 'Progress recap + optional sharing', image: `${IMG}/scene-11.webp` },
      ],
      screens: [],
    },
  ],
}

export function counts(map: JourneyMap) {
  return {
    stages: map.stages.length,
    moments: map.stages.reduce((n, s) => n + s.moments.length, 0),
    screens: map.stages.reduce((n, s) => n + s.screens.length, 0),
  }
}

function mapStage(map: JourneyMap, stageId: string, fn: (s: JourneyStage) => JourneyStage): JourneyMap {
  return { ...map, stages: map.stages.map((s) => (s.id === stageId ? fn(s) : s)) }
}

export function addItem(map: JourneyMap, stageId: string, kind: ItemKind, id: string): JourneyMap {
  const item: JourneyItem = {
    id,
    title: kind === 'moments' ? 'New moment' : 'New screen',
    description: '',
    feature: '',
    image: kind === 'moments' ? NEW_MOMENT_IMAGE : '',
  }
  return mapStage(map, stageId, (s) => ({ ...s, [kind]: [...s[kind], item] }))
}

/** `item` may be a screen with its links; a moment simply has none. */
export function updateItem(map: JourneyMap, stageId: string, kind: ItemKind, item: JourneyScreen): JourneyMap {
  return mapStage(map, stageId, (s) => ({ ...s, [kind]: s[kind].map((x) => (x.id === item.id ? item : x)) }))
}

export function removeItem(map: JourneyMap, stageId: string, kind: ItemKind, id: string): JourneyMap {
  return mapStage(map, stageId, (s) => ({ ...s, [kind]: s[kind].filter((x) => x.id !== id) }))
}

/** Every moment with the stage it sits in, in map order. */
export function allMoments(map: JourneyMap): { stageId: string; moment: JourneyItem }[] {
  return map.stages.flatMap((s) => s.moments.map((moment) => ({ stageId: s.id, moment })))
}

/** The moment ids a screen serves that still exist in the map. */
export function servedMoments(map: JourneyMap, screen: JourneyScreen): string[] {
  const ids = new Set(allMoments(map).map((m) => m.moment.id))
  return (screen.momentIds ?? []).filter((id) => ids.has(id))
}

/** The screens that serve a moment, with the stage each sits in. */
export function screensFor(map: JourneyMap, momentId: string): { stageId: string; screen: JourneyScreen }[] {
  return map.stages.flatMap((s) => s.screens.filter((sc) => sc.momentIds?.includes(momentId)).map((screen) => ({ stageId: s.id, screen })))
}

/** Adds or removes one moment from a screen's list, keeping the order it was given. */
export function toggleMoment(screen: JourneyScreen, momentId: string, on: boolean): JourneyScreen {
  const ids = (screen.momentIds ?? []).filter((id) => id !== momentId)
  return { ...screen, momentIds: on ? [...ids, momentId] : ids }
}

/**
 * Drops a moment from every screen that served it. Run it when a moment is
 * deleted, not when it moves stage (`removeItem` is part of a move too).
 */
export function unlinkMoment(map: JourneyMap, momentId: string): JourneyMap {
  if (!map.stages.some((s) => s.screens.some((sc) => sc.momentIds?.includes(momentId)))) return map
  return {
    ...map,
    stages: map.stages.map((s) =>
      s.screens.some((sc) => sc.momentIds?.includes(momentId))
        ? { ...s, screens: s.screens.map((sc) => (sc.momentIds?.includes(momentId) ? { ...sc, momentIds: sc.momentIds.filter((id) => id !== momentId) } : sc)) }
        : s,
    ),
  }
}

/** A screen's link as something safe to open: an app route or an http(s) URL, else null. */
export function linkHref(link: string | undefined): string | null {
  const v = link?.trim() ?? ''
  if (/^\/(?!\/)/.test(v)) return v
  return /^https?:\/\/\S+$/i.test(v) ? v : null
}

export function updateStage(map: JourneyMap, stageId: string, patch: Pick<JourneyStage, 'title' | 'question'>): JourneyMap {
  return mapStage(map, stageId, (s) => ({
    ...s,
    title: patch.title.trim() || s.title,
    question: patch.question.trim(),
  }))
}

/**
 * Reads an exported file. Accepts this module's own format and the original
 * blueprint HTML's export (`scenes` instead of `moments`), so a JSON saved
 * from that page can be brought in. Returns null when it is neither.
 */
export function parseImport(text: string): JourneyMap | null {
  let raw: unknown
  try {
    raw = JSON.parse(text)
  } catch {
    return null
  }
  const own = JourneyMapSchema.safeParse(raw)
  if (own.success) return own.data
  const legacy = z
    .object({
      stages: z.array(
        z.object({
          id: z.string(),
          title: z.string(),
          question: z.string().default(''),
          color: z.string().default('#8eaa9b'),
          scenes: z.array(z.record(z.string(), z.unknown())),
          screens: z.array(z.record(z.string(), z.unknown())),
        }),
      ).min(1),
    })
    .safeParse(raw)
  if (!legacy.success) return null
  const item = (x: Record<string, unknown>, i: number): JourneyItem => ({
    id: typeof x.id === 'string' ? x.id : `item-${i}`,
    title: typeof x.title === 'string' ? x.title : 'Untitled',
    description: typeof x.description === 'string' ? x.description : '',
    feature: typeof x.feature === 'string' ? x.feature : '',
    image: typeof x.image === 'string' ? x.image.replace(/^assets\//, `${IMG}/`) : '',
  })
  return {
    version: 1,
    stages: legacy.data.stages.map((s) => ({
      id: s.id,
      title: s.title,
      question: s.question,
      color: s.color,
      moments: s.scenes.map(item),
      screens: s.screens.map(item),
    })),
  }
}
