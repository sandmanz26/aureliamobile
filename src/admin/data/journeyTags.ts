import { z } from 'zod'
import type { JourneyMap } from './userJourney'

// Journey tags (U089): a shared classification for the moments in the user
// journey map, so the team can filter, compare and prioritise them, and so the
// same words later label analytics and recommendations. The groups and the
// first tagging are a product proposal for review, not a decision.

export const TagSchema = z.object({ id: z.string(), label: z.string() })

export const TagGroupSchema = z.object({
  id: z.string(),
  name: z.string(),
  /** What the group answers, shown beside it. */
  description: z.string(),
  /** false: a moment takes at most one tag from this group. */
  multi: z.boolean(),
  tags: z.array(TagSchema),
})

export const ReviewStatusSchema = z.enum(['proposed', 'agreed', 'discuss'])

export const AssignmentSchema = z.object({
  /** Tag ids, written as "group:tag". */
  tags: z.array(z.string()),
  status: ReviewStatusSchema,
  note: z.string(),
})

export const JourneyTagsSchema = z.object({
  version: z.literal(1),
  groups: z.array(TagGroupSchema),
  assignments: z.record(z.string(), AssignmentSchema),
})

export type Tag = z.infer<typeof TagSchema>
export type TagGroup = z.infer<typeof TagGroupSchema>
export type ReviewStatus = z.infer<typeof ReviewStatusSchema>
export type Assignment = z.infer<typeof AssignmentSchema>
export type JourneyTags = z.infer<typeof JourneyTagsSchema>

export const TAGS_STORAGE_KEY = 'aurelia.admin.journeyTags'

/** Badge tones for the admin's Badge component. */
export const STATUS_TONE: Record<ReviewStatus, 'neutral' | 'good' | 'warning'> = { proposed: 'neutral', agreed: 'good', discuss: 'warning' }

export const STATUS_LABEL: Record<ReviewStatus, string> = {
  proposed: 'Proposed',
  agreed: 'Agreed',
  discuss: 'Needs discussion',
}

const g = (id: string, name: string, description: string, multi: boolean, tags: [string, string][]): TagGroup => ({
  id,
  name,
  description,
  multi,
  tags: tags.map(([tid, label]) => ({ id: tid, label })),
})

export const DEFAULT_GROUPS: TagGroup[] = [
  g('time', 'Time of day', 'When the moment happens.', false, [['morning', 'Morning'], ['daytime', 'Daytime'], ['evening', 'Evening'], ['night', 'Night'], ['any', 'Any time']]),
  g('context', 'Context', 'Where the person is.', true, [['home', 'Home'], ['bed', 'In bed'], ['commute', 'Commuting'], ['work', 'At work'], ['anywhere', 'Anywhere']]),
  g('trigger', 'Trigger', 'What brings them to the app.', false, [['routine', 'Routine'], ['transition', 'Transition between things'], ['spike', 'A feeling spikes'], ['before', 'Something coming up'], ['after', 'Something just happened'], ['progress', 'Progress noticed']]),
  g('need', 'Need', 'The job they want done.', true, [['checkin', 'Check in'], ['express', 'Express or capture'], ['regulate', 'Calm or regulate'], ['prepare', 'Prepare or focus'], ['process', 'Process or recover'], ['winddown', 'Wind down for sleep'], ['celebrate', 'Celebrate or share']]),
  g('state', 'State going in', 'How they likely feel when they open the app.', true, [['neutral', 'Calm or neutral'], ['activated', 'Stressed or activated'], ['low', 'Low or tired'], ['positive', 'Positive']]),
  g('length', 'Time available', 'How long they can give it.', false, [['micro', 'Under 2 minutes'], ['short', '2 to 10 minutes'], ['full', 'Over 10 minutes']]),
  g('surface', 'Product surface', 'The part of Aurelia that serves the moment.', true, [['checkin', 'Daily check-in'], ['chat', 'Conversation'], ['journal', 'Journal'], ['player', 'Session player'], ['progress', 'Progress'], ['share', 'Sharing']]),
  g('readiness', 'Readiness', 'How much of the suggested feature exists in the app today.', false, [['live', 'Live'], ['partial', 'Partly built'], ['concept', 'Concept']]),
]

const a = (tags: string[]): Assignment => ({ tags, status: 'proposed', note: '' })

/** The first tagging of the ten original moments, proposed by product for review. */
export const DEFAULT_ASSIGNMENTS: Record<string, Assignment> = {
  r1: a(['time:morning', 'context:home', 'context:bed', 'trigger:routine', 'need:checkin', 'state:neutral', 'length:micro', 'surface:checkin', 'readiness:live']),
  r2: a(['time:daytime', 'context:work', 'context:anywhere', 'trigger:spike', 'need:express', 'need:regulate', 'state:activated', 'length:short', 'surface:chat', 'readiness:live']),
  c1: a(['time:daytime', 'context:commute', 'trigger:transition', 'need:express', 'state:neutral', 'length:short', 'surface:journal', 'surface:chat', 'readiness:partial']),
  c2: a(['time:daytime', 'context:work', 'trigger:transition', 'need:express', 'need:regulate', 'state:activated', 'length:micro', 'surface:journal', 'readiness:concept']),
  e1: a(['time:morning', 'context:home', 'trigger:routine', 'need:regulate', 'state:neutral', 'length:short', 'surface:player', 'readiness:live']),
  e2: a(['time:daytime', 'context:work', 'trigger:before', 'need:prepare', 'need:regulate', 'state:activated', 'length:short', 'surface:player', 'readiness:partial']),
  e3: a(['time:daytime', 'context:work', 'context:home', 'trigger:after', 'need:process', 'state:activated', 'state:low', 'length:short', 'surface:chat', 'surface:journal', 'readiness:concept']),
  e4: a(['time:daytime', 'context:commute', 'trigger:transition', 'need:regulate', 'state:low', 'length:short', 'surface:player', 'readiness:partial']),
  e5: a(['time:night', 'context:bed', 'trigger:routine', 'need:winddown', 'state:low', 'length:full', 'surface:player', 'readiness:partial']),
  h1: a(['time:any', 'context:anywhere', 'trigger:progress', 'need:celebrate', 'state:positive', 'length:micro', 'surface:progress', 'surface:share', 'readiness:partial']),
}

export const INITIAL_TAGS: JourneyTags = { version: 1, groups: DEFAULT_GROUPS, assignments: DEFAULT_ASSIGNMENTS }

export interface TaggedMoment {
  id: string
  title: string
  image: string
  stageId: string
  stageTitle: string
  stageColor: string
  assignment: Assignment
}

/** Every moment in the journey map, with its tags (empty when none yet). */
export function taggedMoments(journey: JourneyMap, tags: JourneyTags): TaggedMoment[] {
  return journey.stages.flatMap((s) =>
    s.moments.map((m) => ({
      id: m.id,
      title: m.title,
      image: m.image,
      stageId: s.id,
      stageTitle: s.title,
      stageColor: s.color,
      assignment: tags.assignments[m.id] ?? { tags: [], status: 'proposed' as const, note: '' },
    })),
  )
}

/** Turns a tag on or off; in a single-choice group, turning one on clears the others. */
export function toggleTag(current: string[], group: TagGroup, tagId: string): string[] {
  const key = `${group.id}:${tagId}`
  if (current.includes(key)) return current.filter((t) => t !== key)
  const kept = group.multi ? current : current.filter((t) => !t.startsWith(`${group.id}:`))
  return [...kept, key]
}

export function labelOf(groups: TagGroup[], key: string): string {
  const [gid, tid] = key.split(':')
  return groups.find((x) => x.id === gid)?.tags.find((t) => t.id === tid)?.label ?? tid
}

/** Groups a moment has no tag in yet. */
export function missingGroups(groups: TagGroup[], tags: string[]): TagGroup[] {
  return groups.filter((grp) => !tags.some((t) => t.startsWith(`${grp.id}:`)))
}

export interface CoverageRow {
  tag: Tag
  moments: TaggedMoment[]
}

/** For each tag in a group, the moments that carry it. A tag with none is a gap. */
export function coverage(group: TagGroup, moments: TaggedMoment[]): CoverageRow[] {
  return group.tags.map((tag) => ({
    tag,
    moments: moments.filter((m) => m.assignment.tags.includes(`${group.id}:${tag.id}`)),
  }))
}

export function setAssignment(tags: JourneyTags, momentId: string, assignment: Assignment): JourneyTags {
  return { ...tags, assignments: { ...tags.assignments, [momentId]: assignment } }
}

/**
 * Replaces one group. Tags that were removed from it are also removed from
 * every moment, so no moment points at a tag that no longer exists.
 */
export function saveGroup(tags: JourneyTags, group: TagGroup): JourneyTags {
  const exists = tags.groups.some((x) => x.id === group.id)
  const groups = exists ? tags.groups.map((x) => (x.id === group.id ? group : x)) : [...tags.groups, group]
  const valid = new Set(group.tags.map((t) => `${group.id}:${t.id}`))
  const assignments = Object.fromEntries(
    Object.entries(tags.assignments).map(([id, asg]) => [
      id,
      { ...asg, tags: asg.tags.filter((t) => !t.startsWith(`${group.id}:`) || valid.has(t)) },
    ]),
  )
  return { ...tags, groups, assignments }
}

export function removeGroup(tags: JourneyTags, groupId: string): JourneyTags {
  return {
    ...tags,
    groups: tags.groups.filter((x) => x.id !== groupId),
    assignments: Object.fromEntries(
      Object.entries(tags.assignments).map(([id, asg]) => [id, { ...asg, tags: asg.tags.filter((t) => !t.startsWith(`${groupId}:`)) }]),
    ),
  }
}

/** A stable id from a label: "Before a meeting" → "before-a-meeting". */
export function slug(label: string, taken: string[]): string {
  const base = label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'tag'
  let id = base
  for (let i = 2; taken.includes(id); i++) id = `${base}-${i}`
  return id
}
