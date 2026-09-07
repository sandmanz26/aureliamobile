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
  features?: DemoFeature[]
}

export const DEMO_MODULES: DemoModule[] = [
  {
    id: 'auth',
    kind: 'consumer',
    label: 'Authentication',
    description: 'Sign in / sign up screen and the dummy login that enters the app.',
    route: '/login',
    built: true,
  },
  {
    id: 'home',
    kind: 'consumer',
    label: 'Home',
    description: 'The landing screen after login — hero prompt, live sessions, and discovery.',
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
      { id: 'voice', label: 'Voice input', description: 'Listening state with stop / mic / volume.' },
      { id: 'publish', label: 'Publish flow', description: 'More-menu publish, publishing sheet, and confirmation.' },
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
    description: 'The user’s own library of created and saved sessions.',
    route: '/sessions',
    built: false,
  },
  {
    id: 'wellness',
    kind: 'consumer',
    label: 'My wellness',
    description: 'Progress tracking — chapters, mood baseline and social impact.',
    route: '/wellness',
    built: false,
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

/** Everything that is built is on by default; unbuilt modules stay off. */
export function defaultFlags(): FlagState {
  const flags: FlagState = {}
  for (const mod of DEMO_MODULES) {
    flags[mod.id] = mod.built
    for (const feature of mod.features ?? []) {
      flags[`${mod.id}.${feature.id}`] = true
    }
  }
  return flags
}

export const STORAGE_KEY = 'aurelia.demo.flags'
