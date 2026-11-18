import { z } from 'zod'
import { JourneyTagsSchema, type JourneyTags } from './journeyTags'
import { JourneyMapSchema, parseImport, type JourneyMap } from './userJourney'

// One file for the whole user journey (U092): the map and its tags travel
// together, so a review done in one browser can be opened in another.

export const JourneyBundleSchema = z.object({
  kind: z.literal('aurelia-user-journey'),
  version: z.literal(1),
  journey: JourneyMapSchema,
  tags: JourneyTagsSchema.optional(),
})

export function toBundle(journey: JourneyMap, tags?: JourneyTags) {
  return { kind: 'aurelia-user-journey' as const, version: 1 as const, journey, ...(tags ? { tags } : {}) }
}

/**
 * Reads any file the user journey has ever exported: this bundle, the map on
 * its own (U088), the tags on their own (U089), or the original blueprint
 * page's export. Returns what it found, or null.
 */
export function parseAnyImport(text: string): { journey?: JourneyMap; tags?: JourneyTags } | null {
  let raw: unknown
  try {
    raw = JSON.parse(text)
  } catch {
    return null
  }
  const bundle = JourneyBundleSchema.safeParse(raw)
  if (bundle.success) return { journey: bundle.data.journey, tags: bundle.data.tags }
  const tags = JourneyTagsSchema.safeParse(raw)
  if (tags.success) return { tags: tags.data }
  const journey = parseImport(text)
  return journey ? { journey } : null
}
