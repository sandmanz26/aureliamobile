import { BUILD } from '../lib/build'

/**
 * Changes that are on staging but not yet on production (U066).
 *
 * The owner keeps the documents at /guide identical on both sites, which means
 * `web_prod` is fast-forwarded whenever they change, and those pushes carry
 * every app change on staging with them. So new app work lands switched on for
 * staging and off for production. Shipping one to production is a request
 * like any other: set it to `true` here (and say so in the logs).
 *
 * Every design version gets these: they are not a version of their own.
 */
const onStagingOnly = BUILD.environment !== 'production'

export const RELEASES = {
  /** Figma "Changes" (16906:4947) item 1: one Chapter card + a Review sheet instead of the fanned deck. */
  chapterCard: onStagingOnly,
  /** Figma item 2: Personal journeys on Explore, and the story page (16906:8333). */
  personalJourneys: onStagingOnly,
} as const
