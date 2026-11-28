// Demo scope control — the registry behind the hidden /__demo console.
//
// Two different things are easy to confuse, so to be explicit:
//
//   /__demo   is a PRESENTATION TOOL. It is not part of the product. It exists
//             only to decide what a client can reach during a walkthrough, and
//             would not ship to real users.
//
//   /admin    is a PRODUCT FEATURE — the back office an operator would really
//             use to run the platform (users, payments, moderation, AI spend).
//             It is something the client is being shown, not something that
//             controls the showing.
//
// This registry drives the first, and now covers the second: an admin module
// can be switched off for a walkthrough just like a consumer screen.

export type ModuleKind = 'consumer' | 'admin'

export interface DemoFeature {
  id: string
  label: string
  description: string
  /** Built, but off until someone switches it on. See `unreleased` below. */
  unreleased?: boolean
}

export interface DemoModule {
  id: string
  kind: ModuleKind
  label: string
  description: string
  /** Route this module owns, if any. Used by the route guard. */
  route?: string
  /** false = designed in Figma but no screen built yet. */
  built: boolean
  /**
   * Built and working, but deliberately switched off by default.
   *
   * Distinct from `built: false`, which means there is nothing to switch on.
   * Two cases: work that has landed while a walkthrough is being given from
   * the same branch — it must not appear in a demo nobody has rehearsed, so it
   * ships dark — and a screen that has been taken out of the flow but not out
   * of the tree, where the switch is how you get it back.
   *
   * A new key is off for everyone the moment it exists, which is the reason to
   * add one rather than flip an existing default: both the published set and
   * the local draft merge *over* these defaults, so a key that has been
   * published as `true` stays true until someone presses Publish again.
   */
  unreleased?: boolean
  features?: DemoFeature[]
}

export const DEMO_MODULES: DemoModule[] = [
  {
    id: 'auth',
    kind: 'consumer',
    label: 'Authentication',
    description: 'Sign in, sign up, and the full password-reset path.',
    route: '/login',
    built: true,
    features: [
      { id: 'signUp', label: 'Sign up', description: 'Account creation with password strength and consent.' },
      { id: 'passwordReset', label: 'Password reset', description: 'Request link, confirmation, and the reset form.' },
    ],
  },
  {
    id: 'home',
    kind: 'consumer',
    label: 'Home',
    description: 'The landing screen — the same page signed in or out. Hero prompt, live sessions, and the pitch.',
    route: '/home',
    built: true,
    features: [
      { id: 'liveSessions', label: 'Ongoing Live Sessions', description: 'Global activity card with the world map.' },
      { id: 'quickStart', label: 'Quick Start', description: 'Affirmations / Guided Breath Work shortcuts.' },
      { id: 'promo', label: 'Generative Wellness banner', description: 'Dark full-bleed brand section.' },
      { id: 'community', label: 'Recreate from Community', description: 'Category chips and community session cards.' },
      { id: 'adaptive', label: 'Adaptive Wellness grid', description: 'Six-tile capability grid and closing CTA.' },
    ],
  },
  {
    id: 'chat',
    kind: 'consumer',
    label: 'Aurelia Chat',
    description: 'The cockpit — conversational session creation, tuning and publishing.',
    route: '/chat',
    built: true,
    features: [
      { id: 'recommendations', label: 'Recommendation cards', description: 'Tunable cards with Add/Remove and Apply.' },
      { id: 'voice', label: 'Voice input', description: 'Record, transcribe, review, then send as a voice note.' },
      { id: 'publish', label: 'Publish flow', description: 'More-menu publish, publishing sheet, and confirmation.' },
    ],
  },
  {
    id: 'settings',
    kind: 'consumer',
    label: 'Settings',
    description: 'Connected accounts, coin redemption, account deletion — and the only way out of an account.',
    route: '/settings',
    built: true,
    features: [
      { id: 'accounts', label: 'Connected accounts', description: 'Google accounts and the switch on each.' },
    ],
  },
  {
    id: 'player',
    kind: 'consumer',
    label: 'Player',
    description: 'Playback itself — cover full-bleed, transport over the art, and the session sheet beneath.',
    route: '/play/dolphins-frequency',
    built: true,
    features: [
      { id: 'cue', label: 'Spoken cue', description: 'The line the session is on, under the art.' },
      { id: 'readMore', label: 'Read more', description: 'The clamped summary opens in place.' },
    ],
  },
  {
    id: 'sessionDetail',
    kind: 'consumer',
    label: 'Session detail',
    description: 'A community session in full — structure, sound layers, lineage and safety.',
    route: '/session/dolphins-frequency',
    built: true,
    features: [
      { id: 'lineage', label: 'Lineage', description: 'Where the session was forked from.' },
      { id: 'changes', label: 'What people changed', description: 'The edits made most often by recreators.' },
    ],
  },
  {
    id: 'recreate',
    kind: 'consumer',
    label: 'Recreate',
    description: 'Forking someone else’s session — state the differences, hand the brief to chat.',
    route: '/recreate/dolphins-frequency',
    built: true,
    features: [
      {
        id: 'screen',
        label: 'The Recreate form',
        description:
          'Off: Recreate opens the cockpit with the fork attached and asks what should be different. On: the form states it first — length, voice, pace, layers.',
        unreleased: true,
      },
    ],
  },
  {
    id: 'profile',
    kind: 'consumer',
    label: 'Profile',
    description: 'User profile, stats and account surface.',
    route: '/profile',
    built: true,
  },
  {
    id: 'seeAll',
    kind: 'consumer',
    label: 'See All',
    description: 'A whole shelf as a two-column grid — Picked for You, Biggest Impact, Community.',
    route: '/see-all/picked',
    built: true,
  },
  {
    id: 'challenge',
    kind: 'consumer',
    label: 'Challenge detail',
    description: 'A running challenge — podium, leaderboard, its sessions, and Join.',
    route: '/challenge/nervous-system-reset',
    built: true,
  },
  {
    id: 'notifications',
    kind: 'consumer',
    label: 'Notifications',
    description: 'Activity feed — who played or recreated your sessions, grouped by age.',
    route: '/notifications',
    built: true,
  },
  {
    id: 'help',
    kind: 'consumer',
    label: 'Help',
    description: 'The FAQ. Open without an account, since being locked out is a reason to read it.',
    route: '/help',
    built: true,
  },
  {
    id: 'invite',
    kind: 'consumer',
    label: 'Invite a Friend',
    description: 'Referral screen — the link, what it is worth, and one-tap copy.',
    route: '/invite',
    built: true,
  },
  {
    id: 'explore',
    kind: 'consumer',
    label: 'Explore',
    description: 'The browse surface — the same screen Sessions opens, which the design calls Explore.',
    route: '/explore',
    built: true,
  },
  {
    id: 'sessions',
    kind: 'consumer',
    label: 'Sessions',
    description: 'The browse surface — today’s banner, quick starts, live activity and four ranked shelves.',
    route: '/sessions',
    built: true,
    features: [
      { id: 'hero', label: 'Hero banner', description: 'The one session to press today.' },
      { id: 'quickStart', label: 'Quick Start', description: 'Affirmations / Sleep Meditation shortcuts.' },
      { id: 'liveSessions', label: 'Ongoing Live Sessions', description: 'Global activity card with the world map.' },
      { id: 'community', label: 'Recreate from Community', description: 'Category chips and community session cards.' },
      { id: 'creators', label: 'Trusted Creators', description: 'The creator row.' },
      { id: 'challenge', label: 'Monthly Challenge', description: 'The 30-day challenge card.' },
      { id: 'picked', label: 'Picked for You', description: 'The personalized shelf.' },
      { id: 'impact', label: 'Sessions with Biggest Impact', description: 'The outcome-ranked shelf.' },
    ],
  },
  {
    id: 'sessionSettings',
    kind: 'consumer',
    label: 'Session settings',
    description:
      'Script, Visual and Sound tabs — add or drop styles on a session. Reached from the Settings row in the chat’s ⋯ menu.',
    route: '/session-settings',
    built: true,
  },
  {
    id: 'wellness',
    kind: 'consumer',
    label: 'My wellness',
    description: 'The signal sources Aurelia may read — six switches, grouped by what they tell it, with the summary derived from them.',
    route: '/wellness',
    built: true,
  },

  /* --- Back office (the product's own admin, shown as a feature) --- */
  { id: 'admin', kind: 'admin', label: 'Admin — access', description: 'Master switch. Off means /admin is unreachable entirely.', route: '/admin', built: true },
  { id: 'adminUsers', kind: 'admin', label: 'Users', description: 'Account list, roles, suspensions.', route: '/admin/users', built: true },
  { id: 'adminExperimentation', kind: 'admin', label: 'Experimentation · feedback group', description: 'The 30-person, 8-week study of therapeutic outcomes: criteria, participants, measures, data quality and safety.', route: '/admin/experimentation', built: true },
  { id: 'adminOutcomes', kind: 'admin', label: 'Well-being outcomes', description: 'How much each user’s well-being has changed (WHO-5, check-ins, wearable).', route: '/admin/outcomes', built: true },
  { id: 'adminUserJourney', kind: 'admin', label: 'User journey', description: 'The journey map: four stages (Reflect, Create, Experience, Share), their moments, the feature each suggests, and the screens that serve them.', route: '/admin/user-journey', built: true },
  { id: 'adminPersonas', kind: 'admin', label: 'Personas', description: '300 synthetic personas as candidates for AI-run research, with role-play prompts and balanced panels.', route: '/admin/personas', built: true },
  { id: 'adminBusinessFunnel', kind: 'admin', label: 'Business funnel', description: 'The brief’s stages from a free start to Aurelia Plus, with targets, the buyer agents’ prediction, the feedback group and a decision log.', route: '/admin/business-funnel', built: true },
  { id: 'adminTherapeuticMap', kind: 'admin', label: 'Therapeutic map', description: 'Product, business and wellness as one triangle with each corner’s core targets; the bad-to-good sleep process as the app runs it; the five wellness worlds (scenario).', route: '/admin/therapeutic-map', built: true },
  { id: 'adminHealingMap', kind: 'admin', label: 'Healing Map', description: 'Rings of bad states, building blocks and good states; every link says where its strength comes from: design sample, cited research, or learned from users (none yet).', route: '/admin/healing-map', built: true },
  { id: 'adminStateFlips', kind: 'admin', label: 'StateFlips', description: 'The sleep StateFlip from bad (25) to good (85): markers, the path X → Y → Z, how it is measured, who has it, the DOJO links; chapters to flip and chance it works as transparent formulas; the cohort over time. Staging only.', route: '/admin/stateflips', built: true },
  { id: 'adminSessionBuilder', kind: 'admin', label: 'How a session is built', description: 'The business owner’s Meta → Path → Script cascade (16 steps, BAR / ELEMENTS workbook): purpose, inputs, what feeds each step, what exists today and what is missing; one worked example, sleep chapter 1 (wind-down), labelled draft.', route: '/admin/session-builder', built: true },
  { id: 'adminTherapeuticFunnel', kind: 'admin', label: 'Therapeutic funnel', description: 'Per StateFlip: has the problem → starts → chapter 1 → X → Y → Z (the flip) → stays good, with counts and drop-off from the simulated cohort, the reason for each drop and the levers (AKPs, features).', route: '/admin/therapeutic-funnel', built: true },
  { id: 'adminBuyerAgent', kind: 'admin', label: 'Buyer agent results', description: 'What a buyer agent answered as each persona in a panel: try, pay, price, objections, test cases. Runs v1–v3 and the re-run by production version.', route: '/admin/buyer-agent', built: true },
  { id: 'adminReportsOverview', kind: 'admin', label: 'Reports overview', description: 'How Aurelia improves, as one map: the sources we learn from, the reports and tests that read them, and the decisions and versions that came out. Details open in a drawer.', route: '/admin/reports', built: true },
  { id: 'adminReportUxFeedback', kind: 'admin', label: 'UX feedback report', description: 'The latest feedback group view (was Feedback group · v2) with a summary-first top: goal, headline, key numbers, next steps. Sample data until the study runs.', route: '/admin/reports/ux-feedback', built: true },
  { id: 'adminReportBuyerAgent', kind: 'admin', label: 'Buyer agent report', description: 'Every buyer agent iteration as a timeline: question, what changed, results, the change from the one before, and the decision it fed. With a source graph.', route: '/admin/reports/buyer-agent', built: true },
  { id: 'adminReportCombination', kind: 'admin', label: 'Combination report', description: 'One reading of Aurelia stage by stage of the business funnel, joining the old backend, the product versions, user feedback, personas, the funnels and the PRD.', route: '/admin/reports/combination', built: true },
  { id: 'adminReportCost', kind: 'admin', label: 'Cost report', description: 'What a chapter costs by media and supplier (with pros and cons), in several variations and against the 2025 measured costs; then the bad-to-good sleep journey as a connected graph: uplift, chapters and cost per flip across the Causal AI stages (scenario).', route: '/admin/reports/cost', built: true },
  { id: 'adminReportB2b2c', kind: 'admin', label: 'B2B2C report', description: 'Which partner channel to build first (creator journey, team plan, codes and gifts), re-ranked with round 2 research and the buyer tests; the features to build as a board by channel and priority, each with problem, evidence, effort and success number; the phased plan.', route: '/admin/reports/b2b2c', built: true },
  { id: 'adminReportMetrics', kind: 'admin', label: 'Report metrics', description: 'Every headline number in the reports with its formula, the data it comes from and the calculation step by step; whether the number shown matches the data, and whether it improved since the last test. Staging only.', route: '/admin/reports/metrics', built: true },
  { id: 'adminRoles', kind: 'admin', label: 'Roles & permissions', description: 'Permission matrix.', route: '/admin/roles', built: true },
  { id: 'adminSessions', kind: 'admin', label: 'Sessions', description: 'Generated session catalogue.', route: '/admin/sessions', built: true },
  { id: 'adminChallenges', kind: 'admin', label: 'Challenges', description: 'Setup, pacing and reward tiers.', route: '/admin/challenges', built: true },
  { id: 'adminModeration', kind: 'admin', label: 'Moderation', description: 'Report queue and SLA.', route: '/admin/moderation', built: true },
  { id: 'adminAi', kind: 'admin', label: 'AI monitoring', description: 'Cost, latency, quality, guardrails.', route: '/admin/ai', built: true },
  { id: 'adminCockpitRules', kind: 'admin', label: 'Cockpit rules', description: 'The reply engine behind every chat session.', route: '/admin/cockpit-rules', built: true },
  { id: 'adminRevenue', kind: 'admin', label: 'Revenue', description: 'MRR movement, churn, cohorts.', route: '/admin/revenue', built: true },
  { id: 'adminPricing', kind: 'admin', label: 'Pricing', description: 'Plans, entitlements, regional pricing.', route: '/admin/pricing', built: true },
  { id: 'adminPayments', kind: 'admin', label: 'Payments', description: 'Transactions, refunds, dunning.', route: '/admin/payments', built: true },
  { id: 'adminCoins', kind: 'admin', label: 'Coins & rewards', description: 'Economy ledger.', route: '/admin/coins', built: true },
  { id: 'adminExperiments', kind: 'admin', label: 'Experiments', description: 'A/B tests.', route: '/admin/experiments', built: true },
  { id: 'adminNotifications', kind: 'admin', label: 'Notifications', description: 'Campaigns.', route: '/admin/notifications', built: true },
  { id: 'adminCompliance', kind: 'admin', label: 'Compliance', description: 'DSAR, consent, retention.', route: '/admin/compliance', built: true },
  { id: 'adminSignalSources', kind: 'admin', label: 'Signal sources', description: 'Wearable/integration catalogue and consent text.', route: '/admin/signal-sources', built: true },
  { id: 'adminAudit', kind: 'admin', label: 'Audit log', description: 'Privileged-action history.', route: '/admin/audit', built: true },
  { id: 'adminSettings', kind: 'admin', label: 'Settings', description: 'Model config and feature flags.', route: '/admin/settings', built: true },
]

export type FlagState = Record<string, boolean>

/**
 * Everything built is on by default. Two things stay off: modules with no
 * screen behind them, and anything marked `unreleased` — built, but not yet
 * meant to be seen.
 */
export function defaultFlags(): FlagState {
  const flags: FlagState = {
    [SITE_LOCK_FLAG]: true,
    [ANNOTATIONS_FLAG]: false,
    [CLICKS_FLAG]: true,
    [NETWORK3D_FLAG]: false,
    [NETWORK3D_MOTION_FLAG]: true,
  }
  for (const mod of DEMO_MODULES) {
    flags[mod.id] = mod.built && !mod.unreleased
    for (const feature of mod.features ?? []) {
      flags[`${mod.id}.${feature.id}`] = !feature.unreleased
    }
  }
  return flags
}

export const STORAGE_KEY = 'aurelia.demo.flags'

/**
 * The password gate in front of the whole site.
 *
 * Kept out of DEMO_MODULES on purpose: every entry there answers "what can the
 * client reach during the walkthrough", and this one answers "who can reach
 * the walkthrough at all". It rides in the same flag state so Publish carries
 * it, and the console gives it its own control rather than a row among thirty.
 *
 * It defaults to ON, and it has to: a gate that fails open — first load, KV
 * unreachable, a flag fetch that never resolves — is not a gate.
 */
export const SITE_LOCK_FLAG = 'siteLock'

/**
 * Review annotations — numbered, draggable notes pinned over any screen,
 * saved to and opened from a .txt file. See src/demo/annotations/.
 *
 * Like the site lock, this is a tool for the people giving and reviewing the
 * demo, not a screen in it, so it stays out of DEMO_MODULES, keeps its own
 * card in the console, and is untouched by Enable all / Disable all.
 *
 * Defaults OFF: an overlay nobody asked for must not appear in a walkthrough.
 * Even when on, it only renders when the window is narrower than
 * MOBILE_WEB_BREAKPOINT — the mobile web layout — and never on /__demo itself.
 */
export const ANNOTATIONS_FLAG = 'annotations'

/**
 * Click insights — records anonymous taps and screen-to-screen moves so they
 * can be read back at /__demo/insights (U032). A tool, like annotations, so it
 * stays out of DEMO_MODULES and Enable/Disable all. Defaults ON: the point is
 * to have data from people who were never told to switch anything on.
 */
export const CLICKS_FLAG = 'clickInsights'

/**
 * The Home closing-CTA network artwork as a live Three.js scene instead of
 * the PNG (U035; src/components/network3d/). Built to be animated later, so
 * it is hidden until someone switches it on here — the PNG stays the default.
 * `network3d.motion` is its sub-switch: on = gentle orbit, flowing dashes,
 * breathing halos; off = the scene held at its rest pose (identical to the
 * PNG). Kept out of DEMO_MODULES and Enable/Disable all, like the other tools.
 */
export const NETWORK3D_FLAG = 'network3d'
export const NETWORK3D_MOTION_FLAG = 'network3d.motion'

/** The overlay shows below this width (px), i.e. at 699 and not at 700. */
export const MOBILE_WEB_BREAKPOINT = 700
