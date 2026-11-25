/**
 * Changes that are on staging but not yet on production (U066).
 *
 * The owner keeps the documents at /wiki identical on both sites, which means
 * `web_prod` is fast-forwarded whenever they change, and those pushes carry
 * every app change on staging with them. So new app work lands switched on for
 * staging and off for production. Shipping one to production is a request
 * like any other: set it to `true` here (and say so in the logs).
 *
 * Every design version gets these: they are not a version of their own.
 */
// Every release is on for production since J083 ("nyalakan semua ke production").
// A new one that should wait imports BUILD from '../lib/build' and uses
// BUILD.environment !== 'production'. Since J153 nothing is waiting.


import { BUILD } from '../lib/build'

export const RELEASES = {
  /** Figma "Changes" (16906:4947) item 1: one Chapter card + a Review sheet instead of the fanned deck. */
  chapterCard: true,
  /** Figma item 2: Personal journeys on Explore, and the story page (16906:8333). */
  personalJourneys: true,
  /** Figma Daily (16906:5362) + Journal (16906:5450). On both sites: the owner asked for staging and production (J079). */
  dailyCheckIn: true,
  /** Figma Player (16906:5328): back, share, play, the cue and the scrubber, nothing else. On both sites (J080). */
  simplePlayer: true,
  /** Figma Analysis (16906:5168): mood-face chart, "What helped me?" as a list, no Next chapter. On both sites (J082). */
  analysisV2: true,
  /** The session's About page (Chapters, Social Impact, Journal, Insights) in every version, v4+ included (J083). */
  aboutPage: true,
  /** Tags, review and coverage in Admin → User journey (U089, merged into that page in U092). On both sites since J153 (owner: staging and production). */
  journeyTags: true,
  /** Desktop sidebar that folds to an icon rail and expands again (U091, Eugene). On both sites since J153. */
  sidebarRail: true,
  /** Admin → Product lab → Personas (U096): 300 synthetic research personas. On both sites since J153. */
  personas: true,
  /** Admin → Product lab → Buyer agent results (U101): the first demo run on ten personas. On both sites since J153. */
  buyerAgent: true,
  /** Admin → Product lab → Business funnel (U108): Eugene's stages as the market-fit scoreboard. On both sites (J153). */
  businessFunnel: true,
  /** Admin → Reports (U116, J167): the Buyer agent report and the Combination report, each with a source graph. On both sites since J173. */
  reports: true,
  /** Admin → Product lab → Therapeutic map and Healing Map (U131, J183). Staging only. */
  therapeuticMaps: BUILD.environment !== 'production',
  /** Admin → Reports → Report metrics (U135, J186): every report number traced to its data and formula. Staging only. */
  reportMetrics: BUILD.environment !== 'production',
} as const
