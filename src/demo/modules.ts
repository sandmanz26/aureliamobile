// Demo scope control — the module/feature registry driving the hidden
// /__demo panel. Toggling here changes what a client can reach during a
// walkthrough, without touching the code or rebuilding.

export interface DemoFeature {
  id: string
  label: string
  description: string
}

export interface DemoModule {
  id: string
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
    label: 'Authentication',
    description: 'Sign in / sign up screen and the dummy login that enters the app.',
    route: '/login',
    built: true,
  },
  {
    id: 'home',
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
    label: 'Profile',
    description: 'User profile, stats and account surface.',
    route: '/profile',
    built: true,
  },
  {
    id: 'explore',
    label: 'Explore',
    description: 'Browse and search the wider session catalogue.',
    route: '/explore',
    built: false,
  },
  {
    id: 'sessions',
    label: 'Sessions',
    description: 'The user’s own library of created and saved sessions.',
    route: '/sessions',
    built: false,
  },
  {
    id: 'wellness',
    label: 'My wellness',
    description: 'Progress tracking — chapters, mood baseline and social impact.',
    route: '/wellness',
    built: false,
  },
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
