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
   * This is for work that has landed while a walkthrough is being given from
   * the same branch: it must not appear in a demo nobody has rehearsed, so it
   * ships dark and someone turns it on here when they are ready for it.
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
    description: 'Browse and search the wider session catalogue.',
    route: '/explore',
    built: false,
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
      'Script, Visual and Sound tabs behind the chat’s ⋯ menu — add or drop styles on a session. Built but switched off: turn it on here when it has been rehearsed.',
    route: '/session-settings',
    built: true,
    unreleased: true,
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
  { id: 'adminRoles', kind: 'admin', label: 'Roles & permissions', description: 'Permission matrix.', route: '/admin/roles', built: true },
  { id: 'adminSessions', kind: 'admin', label: 'Sessions', description: 'Generated session catalogue.', route: '/admin/sessions', built: true },
  { id: 'adminModeration', kind: 'admin', label: 'Moderation', description: 'Report queue and SLA.', route: '/admin/moderation', built: true },
  { id: 'adminAi', kind: 'admin', label: 'AI monitoring', description: 'Cost, latency, quality, guardrails.', route: '/admin/ai', built: true },
  { id: 'adminRevenue', kind: 'admin', label: 'Revenue', description: 'MRR movement, churn, cohorts.', route: '/admin/revenue', built: true },
  { id: 'adminPricing', kind: 'admin', label: 'Pricing', description: 'Plans, entitlements, regional pricing.', route: '/admin/pricing', built: true },
  { id: 'adminPayments', kind: 'admin', label: 'Payments', description: 'Transactions, refunds, dunning.', route: '/admin/payments', built: true },
  { id: 'adminCoins', kind: 'admin', label: 'Coins & rewards', description: 'Economy ledger.', route: '/admin/coins', built: true },
  { id: 'adminExperiments', kind: 'admin', label: 'Experiments', description: 'A/B tests.', route: '/admin/experiments', built: true },
  { id: 'adminNotifications', kind: 'admin', label: 'Notifications', description: 'Campaigns.', route: '/admin/notifications', built: true },
  { id: 'adminCompliance', kind: 'admin', label: 'Compliance', description: 'DSAR, consent, retention.', route: '/admin/compliance', built: true },
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
  const flags: FlagState = {}
  for (const mod of DEMO_MODULES) {
    flags[mod.id] = mod.built && !mod.unreleased
    for (const feature of mod.features ?? []) {
      flags[`${mod.id}.${feature.id}`] = !feature.unreleased
    }
  }
  return flags
}

export const STORAGE_KEY = 'aurelia.demo.flags'
