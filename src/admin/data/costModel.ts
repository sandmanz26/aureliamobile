/**
 * Admin → Reports → Cost report (U117, J172). Pure model: the supplier
 * catalogue, the cost of one chapter by media, the report's presets, the
 * 2025 measured baseline, and the bad-to-good journey (uplift, chapters to a
 * flip, flip probability, cost and profit per flip) across the Causal AI
 * stages. No React here, so `costModel.test.ts` can pin every formula.
 *
 * Every number carries a label: measured (the 2025 old admin), company price
 * (the supplier's own page), third-party, estimate (our calculation on
 * assumed inputs) or scenario (the business owner's assumptions in the spec
 * PDF, not measured). Nothing therapeutic is measured: there are no real users.
 */

export type NumberLabel = 'measured' | 'company-price' | 'third-party' | 'estimate' | 'scenario'

export const NUMBER_LABEL_TEXT: Record<NumberLabel, string> = {
  measured: 'Measured',
  'company-price': 'Company price',
  'third-party': 'Third-party',
  estimate: 'Estimate',
  scenario: 'Scenario',
}

export type Media = 'script' | 'voice' | 'music' | 'image' | 'video'
export const MEDIA: Media[] = ['script', 'voice', 'music', 'image', 'video']
export const MEDIA_LABEL: Record<Media, string> = { script: 'Script (LLM)', voice: 'Voice (TTS)', music: 'Music', image: 'Image', video: 'Video' }

/** How a supplier bills. Every price is in US dollars. */
export type Billing =
  | { kind: 'tokens'; inPerM: number; outPerM: number }
  | { kind: 'chars'; perM: number }
  | { kind: 'minute'; perMin: number }
  | { kind: 'generation'; perGen: number; minutesPerGen: number }
  | { kind: 'image'; perImage: number }
  | { kind: 'second'; perSec: number }
  | { kind: 'free' }

export interface Supplier {
  id: string
  media: Media
  name: string
  vendor: string
  /** The price as the supplier states it. */
  price: string
  billing: Billing
  label: NumberLabel
  /** When the price was read. */
  date: string
  source: string
  sourceUrl: string
  pros: string[]
  cons: string[]
}

const ANTHROPIC = 'https://platform.claude.com/docs/en/about-claude/pricing'
const ELEVEN = 'https://elevenlabs.io/pricing/api'

export const SUPPLIERS: Supplier[] = [
  // Script
  {
    id: 'haiku-5.5', media: 'script', name: 'Claude Haiku 5.5', vendor: 'Anthropic',
    price: '$0.10 in / $0.50 out per million tokens', billing: { kind: 'tokens', inPerM: 0.1, outPerM: 0.5 },
    label: 'company-price', date: 'Nov 2026 (wiki research notes)', source: 'Anthropic pricing', sourceUrl: ANTHROPIC,
    pros: ['Cheapest by far: about a tenth of a cent per chapter', 'Fast: a script in seconds', 'Commercial use under the API terms; no training on API data by default'],
    cons: ['Weaker at long, paced, gentle writing; needs the script judge’s rules more', 'Prompts up to 100k tokens only', 'Single vendor; same as the other Claude tiers'],
  },
  {
    id: 'sonnet-5', media: 'script', name: 'Claude Sonnet 5', vendor: 'Anthropic',
    price: '$2 in / $10 out per million tokens', billing: { kind: 'tokens', inPerM: 2, outPerM: 10 },
    label: 'company-price', date: 'Nov 2026 (wiki research notes)', source: 'Anthropic pricing', sourceUrl: ANTHROPIC,
    pros: ['Good pacing and tone for guided sessions', 'Follows safety notes (breathing, pregnancy, grief) reliably', 'Still about 3 cents for a 10-minute chapter'],
    cons: ['20× Haiku’s price, for a part of the cost that is small anyway', 'Slower than Haiku'],
  },
  {
    id: 'opus-5.5', media: 'script', name: 'Claude Opus 5.5', vendor: 'Anthropic',
    price: '$4 in / $20 out per million tokens', billing: { kind: 'tokens', inPerM: 4, outPerM: 20 },
    label: 'company-price', date: 'Nov 2026 (wiki research notes)', source: 'Anthropic pricing', sourceUrl: ANTHROPIC,
    pros: ['The best tier the business owner asked to test “to see the uplift”', 'Best at personal, coherent chapters across a journey'],
    cons: ['Twice Sonnet; the script is still under 10% of a chapter’s cost', 'Slowest; a live chapter waits longer', 'Whether it lifts outcomes is unmeasured'],
  },
  // Voice
  {
    id: 'tts-1', media: 'voice', name: 'OpenAI tts-1', vendor: 'OpenAI',
    price: '$15 per million characters', billing: { kind: 'chars', perM: 15 },
    label: 'company-price', date: 'Nov 2026 (wiki research notes; not in today’s pricing page summary)', source: 'OpenAI pricing', sourceUrl: 'https://developers.openai.com/api/docs/pricing',
    pros: ['Cheapest usable voice: about 10 cents per 10 minutes', 'Fast; billed per character, so pauses are free', 'Many languages'],
    cons: ['Flatter, less calm delivery for meditation', 'No voice cloning: no creator voice', 'Fixed preset voices; OpenAI may retire the model'],
  },
  {
    id: 'tts-1-hd', media: 'voice', name: 'OpenAI tts-1-hd', vendor: 'OpenAI',
    price: '$30 per million characters', billing: { kind: 'chars', perM: 30 },
    label: 'company-price', date: 'Nov 2026 (wiki research notes; not in today’s pricing page summary)', source: 'OpenAI pricing', sourceUrl: 'https://developers.openai.com/api/docs/pricing',
    pros: ['Cleaner audio than tts-1 at twice the price', 'Same simple API, many languages'],
    cons: ['Same preset voices, no cloning', 'Slower than tts-1'],
  },
  {
    id: 'eleven-flash', media: 'voice', name: 'ElevenLabs Flash / Turbo', vendor: 'ElevenLabs',
    price: '$0.04 per 1,000 characters', billing: { kind: 'chars', perM: 40 },
    label: 'company-price', date: '24 Nov 2026 (read on elevenlabs.io)', source: 'ElevenLabs API pricing', sourceUrl: ELEVEN,
    pros: ['Natural voice, low latency', 'Voice cloning: a creator’s or retreat host’s own voice', '30+ languages'],
    cons: ['About 2.7× tts-1', 'Cloning a real person needs their consent and a licence', 'Voice is the biggest line of cost, so a price change hits hardest'],
  },
  {
    id: 'eleven-v3', media: 'voice', name: 'ElevenLabs v3 / Multilingual v2 (expressive)', vendor: 'ElevenLabs',
    price: '$0.08 per 1,000 characters', billing: { kind: 'chars', perM: 80 },
    label: 'company-price', date: '24 Nov 2026 (read on elevenlabs.io)', source: 'ElevenLabs API pricing', sourceUrl: ELEVEN,
    pros: ['The most expressive: breath, warmth, slow pacing', 'Creator voice cloning', 'What a premium session would sound like'],
    cons: ['The most expensive voice: about 50 cents per 10 minutes', 'Slower; less consistent take to take', 'Same vendor risk as Flash'],
  },
  {
    id: 'google-chirp', media: 'voice', name: 'Google Cloud TTS, Chirp 3 HD', vendor: 'Google',
    price: 'about $30 per million characters', billing: { kind: 'chars', perM: 30 },
    label: 'estimate', date: '24 Nov 2026 (pricing page did not load; last known list price)', source: 'Google Cloud TTS pricing', sourceUrl: 'https://cloud.google.com/text-to-speech/pricing',
    pros: ['Natural voices, many languages and locales', 'Enterprise data terms; EU regions', 'A second vendor beside OpenAI'],
    cons: ['Price not confirmed on Google’s page today (estimate)', 'Custom voice needs a separate, gated product', 'More setup (Cloud project, billing)'],
  },
  // Music
  {
    id: 'music-library', media: 'music', name: 'Licensed loop library, reused', vendor: 'Stock library',
    price: 'about $0 per chapter after a one-off licence', billing: { kind: 'free' },
    label: 'estimate', date: 'Nov 2026 (wiki research notes)', source: 'Wiki → B2B2C → Economics', sourceUrl: '/wiki/b2b2c/economics',
    pros: ['Near-zero marginal cost: a licence, storage and CDN', 'Consistent quality; no generation wait', 'Licence terms are clear before launch'],
    cons: ['Not personal: the same loops for everyone', 'The licence fee is a fixed cost not counted here', 'Limited variety; heavy users hear repeats'],
  },
  {
    id: 'stable-audio', media: 'music', name: 'Stable Audio 2.5', vendor: 'Stability AI',
    price: '8 credits ($0.08) per generation', billing: { kind: 'generation', perGen: 0.08, minutesPerGen: 3 },
    label: 'company-price', date: '24 Nov 2026 (read on docs.stability.ai)', source: 'Stability AI pricing', sourceUrl: 'https://docs.stability.ai/pricing',
    pros: ['Generated to the chapter’s mood', 'Cheap per track', 'Trained on licensed music (AudioSparx), commercial use on paid plans'],
    cons: ['One generation is assumed to cover 3 minutes (estimate); longer chapters need loops or several', 'Quality varies; needs a check', 'Smaller vendor: higher vendor risk'],
  },
  {
    id: 'eleven-music', media: 'music', name: 'ElevenLabs Music', vendor: 'ElevenLabs',
    price: '$0.15 per minute', billing: { kind: 'minute', perMin: 0.15 },
    label: 'company-price', date: '24 Nov 2026 (read on elevenlabs.io)', source: 'ElevenLabs API pricing', sourceUrl: ELEVEN,
    pros: ['Full-length, generated per chapter', 'Cleared for commercial use', 'One vendor with the voice'],
    cons: ['The dearest music: $1.50 per 10 minutes', 'Adds to the ElevenLabs dependency'],
  },
  // Image
  {
    id: 'flux-dev', media: 'image', name: 'FLUX.1 [dev]', vendor: 'Black Forest Labs',
    price: '$0.025 per image', billing: { kind: 'image', perImage: 0.025 },
    label: 'company-price', date: '24 Nov 2026 (read on bfl.ai)', source: 'BFL pricing', sourceUrl: 'https://bfl.ai/pricing',
    pros: ['Cheapest good image', 'Fast'],
    cons: ['Weaker on fine detail than the pro tiers', 'Licence of the open weights differs from the API’s; use the API'],
  },
  {
    id: 'flux-pro', media: 'image', name: 'FLUX 1.1 [pro]', vendor: 'Black Forest Labs',
    price: '$0.04 per image', billing: { kind: 'image', perImage: 0.04 },
    label: 'company-price', date: '24 Nov 2026 (read on bfl.ai)', source: 'BFL pricing', sourceUrl: 'https://bfl.ai/pricing',
    pros: ['High quality, consistent style', 'Commercial use through the API'],
    cons: ['Smaller vendor than Google or OpenAI'],
  },
  {
    id: 'nano-banana-2', media: 'image', name: 'Google Nano Banana 2', vendor: 'Google',
    price: 'about $0.034–0.067 per 1K image', billing: { kind: 'image', perImage: 0.067 },
    label: 'company-price', date: '24 Nov 2026 (read on aistudio.google.com; the top of the range used)', source: 'Gemini API pricing', sourceUrl: 'https://aistudio.google.com/docs/pricing',
    pros: ['Good at following a scene description', 'Enterprise data terms on the paid tier'],
    cons: ['Priced per output token, so the cost moves with the image', 'Google’s model names and prices change often'],
  },
  {
    id: 'nano-banana-pro', media: 'image', name: 'Google Nano Banana Pro', vendor: 'Google',
    price: 'about $0.134 per 1K/2K image', billing: { kind: 'image', perImage: 0.134 },
    label: 'company-price', date: '24 Nov 2026 (read on aistudio.google.com)', source: 'Gemini API pricing', sourceUrl: 'https://aistudio.google.com/docs/pricing',
    pros: ['Google’s best image tier'],
    cons: ['Twice to five times the others for a cover image'],
  },
  {
    id: 'gpt-image-2', media: 'image', name: 'OpenAI gpt-image-2', vendor: 'OpenAI',
    price: '$30 per million output image tokens (about $0.04 an image)', billing: { kind: 'image', perImage: 0.04 },
    label: 'estimate', date: '24 Nov 2026 (token price read on OpenAI; ~1,300 tokens an image assumed)', source: 'OpenAI pricing', sourceUrl: 'https://developers.openai.com/api/docs/pricing',
    pros: ['Strong at text in images and edits', 'Same vendor as the cheap voice'],
    cons: ['Per-image cost is our estimate from the token price', 'Slower than FLUX'],
  },
  // Video (off by default)
  {
    id: 'none-video', media: 'video', name: 'No video', vendor: '—',
    price: '$0', billing: { kind: 'free' },
    label: 'estimate', date: '—', source: 'The Change Plan: no video in the MVP', sourceUrl: '/wiki/backend-old',
    pros: ['Video was 37% of the 2025 measured cost; leaving it out saves most of that'],
    cons: ['No moving picture; audio-first only'],
  },
  {
    id: 'omni-video', media: 'video', name: 'Gemini Omni 1.2 Flash, 10 s clip', vendor: 'Google',
    price: 'about $0.07 per second at 720p', billing: { kind: 'second', perSec: 0.07 },
    label: 'company-price', date: '24 Nov 2026 (read on aistudio.google.com)', source: 'Gemini API pricing', sourceUrl: 'https://aistudio.google.com/docs/pricing',
    pros: ['A short moving cover per chapter'],
    cons: ['$0.70 for 10 seconds: more than all the rest of a chapter', 'Little evidence it helps someone sleep'],
  },
]

export const supplier = (id: string) => SUPPLIERS.find((s) => s.id === id)!

export type Personalisation = 'full' | 'inserts' | 'cached'
export const PERSONALISATION_LABEL: Record<Personalisation, string> = {
  full: 'Fully generated per user',
  inserts: 'Produced once + personal inserts',
  cached: 'Cached reuse',
}

export interface CostInputs {
  minutes: number
  wordsPerMinute: number
  models: Record<Media, string>
  personalisation: Personalisation
  /** Share of music and image served from cache, 0–1. */
  cacheHit: number
}

/** Assumptions behind the formulas (estimates; see the notes on the page). */
export const ASSUME = {
  charsPerWord: 6,
  tokensPerWord: 1.75,
  promptTokens: 3000,
  /** People one produced chapter is shared with, when reused. */
  reuseAcross: 50,
  /** The share of a chapter's words that is personal in "inserts" mode. */
  insertShare: 0.2,
  imagesPerChapter: 1,
  videoSeconds: 10,
  usdPerEur: 1.08,
}

/** What share of the per-user generation one user pays for, by personalisation level. */
export function generatedShare(p: Personalisation) {
  if (p === 'full') return 1
  if (p === 'inserts') return ASSUME.insertShare + (1 - ASSUME.insertShare) / ASSUME.reuseAcross
  return 1 / ASSUME.reuseAcross
}

function rawCost(s: Supplier, minutes: number, words: number) {
  const b = s.billing
  switch (b.kind) {
    case 'tokens':
      return (ASSUME.promptTokens * b.inPerM + words * ASSUME.tokensPerWord * b.outPerM) / 1e6
    case 'chars':
      return (words * ASSUME.charsPerWord * b.perM) / 1e6
    case 'minute':
      return minutes * b.perMin
    case 'generation':
      return Math.ceil(minutes / b.minutesPerGen) * b.perGen
    case 'image':
      return ASSUME.imagesPerChapter * b.perImage
    case 'second':
      return ASSUME.videoSeconds * b.perSec
    case 'free':
      return 0
  }
}

export type MediaCost = Record<Media, number>

/** The cost of one chapter for one user, by media, in US dollars (estimate). */
export function chapterCost(i: CostInputs): MediaCost {
  const words = i.minutes * i.wordsPerMinute
  const gen = generatedShare(i.personalisation)
  const out = {} as MediaCost
  for (const m of MEDIA) {
    const c = rawCost(supplier(i.models[m]), i.minutes, words)
    // Script and voice follow the personalisation; music, image and video follow the cache.
    out[m] = m === 'script' || m === 'voice' ? c * gen : c * (1 - i.cacheHit) * (i.personalisation === 'cached' ? gen : 1)
  }
  return out
}

export const total = (c: MediaCost) => MEDIA.reduce((s, m) => s + c[m], 0)

/** The media with the largest share, and that share. */
export function dominant(c: MediaCost): { media: Media; share: number } {
  const t = total(c)
  const media = MEDIA.reduce((a, b) => (c[b] > c[a] ? b : a))
  return { media, share: t ? c[media] / t : 0 }
}

export interface Preset {
  id: 'lean' | 'balanced' | 'premium'
  name: string
  blurb: string
  models: Record<Media, string>
  personalisation: Personalisation
  cacheHit: number
}

export const PRESETS: Preset[] = [
  {
    id: 'lean', name: 'Lean', blurb: 'Budget models, chapters produced once with personal inserts, most music and images reused.',
    models: { script: 'haiku-5.5', voice: 'tts-1', music: 'music-library', image: 'flux-dev', video: 'none-video' },
    personalisation: 'inserts', cacheHit: 0.8,
  },
  {
    id: 'balanced', name: 'Balanced', blurb: 'Good script and natural voice per user; generated music and images, half reused.',
    models: { script: 'sonnet-5', voice: 'eleven-flash', music: 'stable-audio', image: 'nano-banana-2', video: 'none-video' },
    personalisation: 'full', cacheHit: 0.5,
  },
  {
    id: 'premium', name: 'Premium', blurb: 'The best tier of every media, fully generated for each person, nothing reused.',
    models: { script: 'opus-5.5', voice: 'eleven-v3', music: 'eleven-music', image: 'nano-banana-pro', video: 'none-video' },
    personalisation: 'full', cacheHit: 0,
  },
]

export const LENGTHS = [3, 5, 10] as const
export const DEFAULT_WPM = 105

export function presetInputs(p: Preset, minutes: number, wordsPerMinute = DEFAULT_WPM): CostInputs {
  return { minutes, wordsPerMinute, models: p.models, personalisation: p.personalisation, cacheHit: p.cacheHit }
}

/* ---------------------------------------------- The 2025 measured baseline */

/** The 2025 old admin's vendor costs, 8 Mar 2025 – 20 Apr 2026, in euros (measured). A campaign is a session. */
export const MEASURED_2025 = {
  total: 40.27,
  byMedia: { script: 3.07, voice: 16.64, music: 1.99, image: 3.59, video: 14.99 } as MediaCost,
  campaigns: [
    { name: 'Sylvie C…eam', script: 0.26, voice: 3.2, image: 0.23, music: 0.06, video: 1.0, total: 4.76 },
    { name: 'welness test', script: 0.25, voice: 0.96, image: 0.51, music: 0.24, video: 2.2, total: 4.15 },
    { name: 'Harmony', script: 0.14, voice: 1.82, image: 0.18, music: 0.06, video: 0.48, total: 2.68 },
    { name: 'Credit Test', script: 0.07, voice: 1.56, image: 0.03, music: 0.6, video: 0.41, total: 2.67 },
    { name: 'Script 2', script: 0.08, voice: 1.53, image: 0.3, music: 0.06, video: 0.48, total: 2.45 },
    { name: 'New Campaign', script: 0.05, voice: 0, image: 0, music: 0.06, video: 2.0, total: 2.12 },
    { name: 'Script 3', script: 0.08, voice: 1.48, image: 0.03, music: 0.06, video: 0.21, total: 1.86 },
    { name: 'Script 1', script: 0.07, voice: 1.34, image: 0.18, music: 0.06, video: 0.21, total: 1.85 },
    { name: 'One Script', script: 0.05, voice: 0.87, image: 0.28, music: 0.06, video: 0.48, total: 1.75 },
    { name: 'New Campaign', script: 0.06, voice: 1.47, image: 0, music: 0, video: 0, total: 1.53 },
  ],
}

export function measuredAverage() {
  const c = MEASURED_2025.campaigns
  return c.reduce((s, x) => s + x.total, 0) / c.length
}

/* ------------------------------------------------- From bad to good (goal) */

export type Stage = 1 | 2 | 3

/** The spec PDF's Causal AI stages (SCENARIO: the business owner's assumptions). */
export const STAGES: Record<Stage, { name: string; sessions: string; costFactor: number; uplift: number; success: number; density: number; velocity: number; specChapters: number; specCostPerFlip: number }> = {
  1: { name: 'Stage 1', sessions: 'under 1,000 sessions', costFactor: 1, uplift: 1.43, success: 0.54, density: 0.22, velocity: 0.35, specChapters: 42, specCostPerFlip: 4.98 },
  2: { name: 'Stage 2', sessions: '10,000+ sessions', costFactor: 0.58, uplift: 1.88, success: 0.745, density: 0.61, velocity: 0.72, specChapters: 32, specCostPerFlip: 2.04 },
  3: { name: 'Stage 3', sessions: '100,000+ sessions', costFactor: 0.26, uplift: 2.73, success: 0.89, density: 0.91, velocity: 0.94, specChapters: 22, specCostPerFlip: 0.58 },
}

export type Anchor = 'flip' | 'plus-month' | 'plus-year' | 'retreat-low' | 'retreat-high'
export const ANCHORS: Record<Anchor, { label: string; note: string }> = {
  flip: { label: '$19.99 per flip (spec)', note: 'Paid only when the flip happens: revenue = $19.99 × flip probability.' },
  'plus-month': { label: 'Plus $10 a month (app)', note: 'The Upgrade screen’s monthly price, paid for every month the journey lasts.' },
  'plus-year': { label: 'Plus $100 a year (app)', note: 'The Upgrade screen’s yearly price; one year covers the journey.' },
  'retreat-low': { label: 'Retreat ticket €19.99', note: 'The whole ticket, at $1.08 a euro; Aurelia’s share would be less.' },
  'retreat-high': { label: 'Retreat ticket €39', note: 'The whole ticket, at $1.08 a euro; Aurelia’s share would be less.' },
}

export interface GoalInputs {
  baseline: number
  target: number
  chaptersPerWeek: number
  stage: Stage
  anchor: Anchor
}

export const DEFAULT_GOAL: GoalInputs = { baseline: 25, target: 85, chaptersPerWeek: 3, stage: 1, anchor: 'flip' }

export const clamp = (x: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, x))

/** Condition: lower scores are worse. A worse start moves more slowly per chapter (scenario). */
export function conditionFactor(baseline: number) {
  return clamp(1 + (0.6 * (baseline - 25)) / 100, 0.7, 1.3)
}
export function conditionName(baseline: number) {
  return baseline < 30 ? 'severe' : baseline < 55 ? 'moderate' : 'mild'
}
/** Longer chapters do more, with diminishing returns; 10 minutes = 1 (scenario). */
export const lengthFactor = (minutes: number) => Math.sqrt(minutes / 10)
/** Less personal chapters do less (scenario). */
export const PERSONAL_FACTOR: Record<Personalisation, number> = { full: 1, inserts: 0.9, cached: 0.75 }
/** Fewer than 3 chapters a week lowers the chance of a flip; more helps a little (scenario). */
export const adherenceFactor = (perWeek: number) => clamp(Math.pow(perWeek / 3, 0.4), 0, 1.1)

export interface GoalResult {
  gap: number
  uplift: number
  chapters: number
  flipProbability: number
  weeks: number
  costPerChapter: number
  costPerJourney: number
  costPerFlip: number
  revenuePerJourney: number
  profitPerJourney: number
  profitPerFlip: number
  costPerPoint: number
}

export function revenue(anchor: Anchor, weeks: number, p: number) {
  switch (anchor) {
    case 'flip':
      return 19.99 * p
    case 'plus-month':
      return 10 * Math.max(1, Math.ceil(weeks / 4.345))
    case 'plus-year':
      return 100
    case 'retreat-low':
      return 19.99 * ASSUME.usdPerEur
    case 'retreat-high':
      return 39 * ASSUME.usdPerEur
  }
}

/**
 * The journey from the starting level to the target.
 * uplift/chapter = stage uplift × condition × length × personalisation
 * chapters = ⌈gap ÷ uplift⌉ · P(flip) = stage success × adherence
 * cost/chapter = chapter cost × stage cost factor · cost/flip = cost/journey ÷ P(flip)
 * profit/journey = revenue − cost/journey · profit/flip = profit/journey ÷ P(flip)
 */
export function goal(g: GoalInputs, c: CostInputs): GoalResult {
  const s = STAGES[g.stage]
  const gap = Math.max(0, g.target - g.baseline)
  const uplift = s.uplift * conditionFactor(g.baseline) * lengthFactor(c.minutes) * PERSONAL_FACTOR[c.personalisation]
  const chapters = gap === 0 ? 0 : Math.ceil(gap / uplift)
  const flipProbability = clamp(s.success * adherenceFactor(g.chaptersPerWeek), 0, 0.97)
  const weeks = chapters / g.chaptersPerWeek
  const costPerChapter = total(chapterCost(c)) * s.costFactor
  const costPerJourney = costPerChapter * chapters
  const costPerFlip = flipProbability ? costPerJourney / flipProbability : Infinity
  const revenuePerJourney = revenue(g.anchor, weeks, flipProbability)
  const profitPerJourney = revenuePerJourney - costPerJourney
  const profitPerFlip = flipProbability ? profitPerJourney / flipProbability : -Infinity
  return { gap, uplift, chapters, flipProbability, weeks, costPerChapter, costPerJourney, costPerFlip, revenuePerJourney, profitPerJourney, profitPerFlip, costPerPoint: gap ? costPerFlip / gap : 0 }
}

/* ----------------------------------------------------- The connected graph */

export type NodeId =
  | 'condition' | 'adherence' | 'length' | 'personalisation' | 'models' | 'stage'
  | 'uplift' | 'chapters' | 'flip' | 'costChapter' | 'weeks'
  | 'costJourney' | 'costFlip' | 'anchor' | 'profit'

export interface GraphNode {
  id: NodeId
  label: string
  col: number
  row: number
  input: boolean
  label2: NumberLabel
  formula: string
  source: string
}

export const GRAPH_NODES: GraphNode[] = [
  { id: 'condition', label: 'User condition', col: 0, row: 0, input: true, label2: 'scenario', formula: 'Starting score 0–100 (lower is worse). Condition factor = 1 + 0.6 × (start − 25) ÷ 100, kept between 0.7 and 1.3: a worse start moves more slowly per chapter.', source: 'Assumption of this report; the spec’s default 25 → 85.' },
  { id: 'adherence', label: 'Adherence', col: 0, row: 1, input: true, label2: 'scenario', formula: 'Chapters a week. Adherence factor = (per week ÷ 3)^0.4, at most 1.1. It scales the chance of a flip and sets the weeks.', source: 'Assumption of this report.' },
  { id: 'length', label: 'Chapter length', col: 0, row: 2, input: true, label2: 'estimate', formula: 'Minutes. Words = minutes × words per minute. Length factor on uplift = √(minutes ÷ 10).', source: 'Wiki research notes: 10 minutes ≈ 900–1,200 words.' },
  { id: 'personalisation', label: 'Personalisation', col: 0, row: 3, input: true, label2: 'scenario', formula: 'Share generated per user: full 1, inserts 0.2 + 0.8 ÷ 50, cached 1 ÷ 50. Uplift factor: 1 / 0.9 / 0.75.', source: 'Assumption of this report.' },
  { id: 'models', label: 'Model choice', col: 0, row: 4, input: true, label2: 'company-price', formula: 'Script, voice, music, image and video suppliers, priced from the catalogue above.', source: 'Supplier pages, read 24 Nov 2026 or the wiki notes.' },
  { id: 'stage', label: 'Causal AI stage', col: 0, row: 5, input: true, label2: 'scenario', formula: 'Stage 1 / 2 / 3: base uplift 1.43 / 1.88 / 2.73 points a chapter, success 54 / 74.5 / 89%, cost factor 1 / 0.58 / 0.26.', source: 'The spec PDF (the business owner’s assumptions, not measured).' },
  { id: 'uplift', label: 'Uplift per chapter', col: 1, row: 0.5, input: false, label2: 'scenario', formula: 'Stage uplift × condition × length × personalisation.', source: 'Spec stage uplift; factors assumed here.' },
  { id: 'chapters', label: 'Chapters to flip', col: 2, row: 0.5, input: false, label2: 'scenario', formula: '⌈(target − start) ÷ uplift per chapter⌉.', source: 'Spec §6 equations.' },
  { id: 'flip', label: 'Flip probability', col: 1, row: 1.75, input: false, label2: 'scenario', formula: 'Stage success × adherence factor, at most 97%.', source: 'Spec stage success rates.' },
  { id: 'weeks', label: 'Weeks to flip', col: 2, row: 1.75, input: false, label2: 'scenario', formula: 'Chapters to flip ÷ chapters a week.', source: 'Derived.' },
  { id: 'costChapter', label: 'Cost per chapter', col: 1, row: 4, input: false, label2: 'estimate', formula: 'Σ media cost (catalogue price × words, characters, minutes or images) × personalisation or cache share × stage cost factor.', source: 'Supplier prices × our assumptions × spec cost factor.' },
  { id: 'costJourney', label: 'Cost per journey', col: 2, row: 3, input: false, label2: 'estimate', formula: 'Cost per chapter × chapters to flip.', source: 'Derived.' },
  { id: 'costFlip', label: 'Cost per flip', col: 3, row: 3, input: false, label2: 'estimate', formula: 'Cost per journey ÷ flip probability: the journeys that fail are paid for too.', source: 'Derived.' },
  { id: 'anchor', label: 'Price anchor', col: 3, row: 4.5, input: true, label2: 'company-price', formula: '$19.99 per flip × P(flip); Plus $10 × months; Plus $100 a year; or a retreat ticket (€ at $1.08).', source: 'Spec PDF; the app’s Upgrade screen; the retreat funnel.' },
  { id: 'profit', label: 'Profit per flip', col: 4, row: 3, input: false, label2: 'scenario', formula: '(Revenue per journey − cost per journey) ÷ P(flip). Before fees, CAC and fixed costs.', source: 'Derived; spec §3 “net per flip” is the same idea per journey.' },
]

export const GRAPH_EDGES: [NodeId, NodeId][] = [
  ['condition', 'uplift'], ['length', 'uplift'], ['personalisation', 'uplift'], ['stage', 'uplift'],
  ['uplift', 'chapters'], ['condition', 'chapters'],
  ['stage', 'flip'], ['adherence', 'flip'],
  ['chapters', 'weeks'], ['adherence', 'weeks'],
  ['length', 'costChapter'], ['personalisation', 'costChapter'], ['models', 'costChapter'], ['stage', 'costChapter'],
  ['costChapter', 'costJourney'], ['chapters', 'costJourney'],
  ['costJourney', 'costFlip'], ['flip', 'costFlip'],
  ['costFlip', 'profit'], ['anchor', 'profit'], ['weeks', 'anchor'], ['flip', 'anchor'],
]

/** Every node downstream of a node, itself included. */
export function downstream(id: NodeId): Set<NodeId> {
  const out = new Set<NodeId>([id])
  let grew = true
  while (grew) {
    grew = false
    for (const [a, b] of GRAPH_EDGES) if (out.has(a) && !out.has(b)) {
        out.add(b)
        grew = true
      }
  }
  return out
}
