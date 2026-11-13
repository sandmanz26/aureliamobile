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
  /** Figma Daily (16906:5362) + Journal (16906:5450). On both sites: the owner asked for staging and production (J079). */
  dailyCheckIn: true,
  /** Figma Player (16906:5328): back, share, play, the cue and the scrubber, nothing else. On both sites (J080). */
  simplePlayer: true,
  /** Figma Analysis (16906:5168): mood-face chart, "What helped me?" as a list, no Next chapter. On both sites (J082). */
  analysisV2: true,
} as const
