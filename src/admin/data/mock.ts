// Deterministic mock data for the admin CMS. No backend yet — every table and
// chart in the panel reads from here so the shapes match what a real API would
// need to return. Seeded PRNG keeps values stable across renders.

function makeRng(seed: number) {
  let state = seed
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296
    return state / 4294967296
  }
}

function pick<T>(rng: () => number, list: readonly T[]): T {
  return list[Math.floor(rng() * list.length)]
}

function daysAgo(days: number) {
  const date = new Date('2026-09-04T09:00:00Z')
  date.setUTCDate(date.getUTCDate() - days)
  return date.toISOString()
}

/* ------------------------------------------------------------------ Roles */

export interface Role {
  id: string
  name: string
  description: string
  members: number
  permissions: string[]
}

export const PERMISSION_GROUPS: { group: string; permissions: { id: string; label: string }[] }[] = [
  {
    group: 'Users',
    permissions: [
      { id: 'users.read', label: 'View users' },
      { id: 'users.write', label: 'Edit users' },
      { id: 'users.suspend', label: 'Suspend / ban users' },
    ],
  },
  {
    group: 'Content',
    permissions: [
      { id: 'sessions.read', label: 'View sessions' },
      { id: 'sessions.write', label: 'Edit / unpublish sessions' },
      { id: 'moderation.review', label: 'Review reports' },
      { id: 'moderation.action', label: 'Take down content' },
    ],
  },
  {
    group: 'AI',
    permissions: [
      { id: 'ai.read', label: 'View AI monitoring' },
      { id: 'ai.config', label: 'Change model / prompt config' },
      { id: 'ai.budget', label: 'Set spend limits' },
    ],
  },
  {
    group: 'Economy',
    permissions: [
      { id: 'coins.read', label: 'View coin ledger' },
      { id: 'coins.adjust', label: 'Grant / revoke coins' },
    ],
  },
  {
    group: 'Platform',
    permissions: [
      { id: 'roles.manage', label: 'Manage roles' },
      { id: 'audit.read', label: 'View audit log' },
      { id: 'settings.write', label: 'Change app settings' },
    ],
  },
]

export const ALL_PERMISSIONS = PERMISSION_GROUPS.flatMap((g) => g.permissions.map((p) => p.id))

export const ROLES: Role[] = [
  {
    id: 'super_admin',
    name: 'Super Admin',
    description: 'Unrestricted access, including roles and platform settings.',
    members: 2,
    permissions: ALL_PERMISSIONS,
  },
  {
    id: 'ops',
    name: 'Operations',
    description: 'Day-to-day user and content operations. No AI config or role changes.',
    members: 6,
    permissions: [
      'users.read', 'users.write', 'users.suspend',
      'sessions.read', 'sessions.write',
      'moderation.review', 'moderation.action',
      'coins.read', 'ai.read', 'audit.read',
    ],
  },
  {
    id: 'moderator',
    name: 'Moderator',
    description: 'Reviews reported sessions and community content only.',
    members: 11,
    permissions: ['users.read', 'sessions.read', 'moderation.review', 'moderation.action'],
  },
  {
    id: 'ai_engineer',
    name: 'AI Engineer',
    description: 'Owns model configuration, prompts and spend limits.',
    members: 4,
    permissions: ['ai.read', 'ai.config', 'ai.budget', 'sessions.read', 'audit.read'],
  },
  {
    id: 'analyst',
    name: 'Analyst',
    description: 'Read-only across the platform for reporting.',
    members: 5,
    permissions: ['users.read', 'sessions.read', 'ai.read', 'coins.read', 'audit.read'],
  },
]

/* ------------------------------------------------------------------ Users */

export interface AdminUser {
  id: string
  name: string
  email: string
  role: string
  status: 'active' | 'suspended' | 'pending'
  plan: 'free' | 'plus' | 'pro'
  coins: number
  sessionsCreated: number
  country: string
  joinedAt: string
  lastActiveAt: string
}

const FIRST = ['Adam', 'Sara', 'Lily', 'Marcus', 'Nadia', 'Tomas', 'Priya', 'Chen', 'Diego', 'Amara', 'Jonas', 'Yuki', 'Rafael', 'Ingrid', 'Omar', 'Elena', 'Kwame', 'Mira', 'Felix', 'Aisha']
const LAST = ['Nilson', 'Trezeguat', 'Ahmad', 'Lee', 'Haddad', 'Novak', 'Sharma', 'Wei', 'Alvarez', 'Okafor', 'Berg', 'Tanaka', 'Costa', 'Lindqvist', 'Farouk', 'Petrova', 'Mensah', 'Kapoor', 'Braun', 'Diallo']
const COUNTRIES = ['ID', 'US', 'GB', 'DE', 'JP', 'BR', 'IN', 'NL', 'AU', 'SG', 'FR', 'CA']

export const USERS: AdminUser[] = (() => {
  const rng = makeRng(42)
  const roles = ['member', 'member', 'member', 'member', 'moderator', 'ops', 'analyst', 'ai_engineer', 'super_admin']
  return Array.from({ length: 68 }, (_, i) => {
    const first = pick(rng, FIRST)
    const last = pick(rng, LAST)
    const joined = Math.floor(rng() * 400) + 5
    return {
      id: `usr_${(1000 + i).toString(36)}`,
      name: `${first} ${last}`,
      email: `${first.toLowerCase()}.${last.toLowerCase()}@example.com`,
      role: pick(rng, roles),
      status: (rng() > 0.9 ? (rng() > 0.5 ? 'suspended' : 'pending') : 'active') as AdminUser['status'],
      plan: (rng() > 0.72 ? (rng() > 0.5 ? 'pro' : 'plus') : 'free') as AdminUser['plan'],
      coins: Math.floor(rng() * 4200),
      sessionsCreated: Math.floor(rng() * 90),
      country: pick(rng, COUNTRIES),
      joinedAt: daysAgo(joined),
      lastActiveAt: daysAgo(Math.floor(rng() * Math.min(joined, 30))),
    }
  })
})()

/* --------------------------------------------------------------- Sessions */

export interface ContentSession {
  id: string
  title: string
  author: string
  type: 'Meditation' | 'Soundscape' | 'Breathwork' | 'Affirmation'
  status: 'published' | 'draft' | 'under_review' | 'removed'
  plays: number
  recreations: number
  durationMin: number
  moodDelta: number
  createdAt: string
}

const TITLES = ['Dolphins frequency', 'Raise your Vibration', 'Mind Dance', 'Sleep meditation', 'Morning Mindfulness', 'Stress relief techniques', 'Deep Rest 432Hz', 'Ocean Drift', 'Golden Hour Calm', 'Breath of Fire', 'Evening Wind-down', 'Focus Field', 'Gratitude Loop', 'Anxiety Reset', 'Forest Rain']

export const SESSIONS: ContentSession[] = (() => {
  const rng = makeRng(7)
  return Array.from({ length: 54 }, (_, i) => ({
    id: `ses_${(2000 + i).toString(36)}`,
    title: `${pick(rng, TITLES)} v1.${Math.floor(rng() * 5)}`,
    author: `${pick(rng, FIRST)} ${pick(rng, LAST)}`,
    type: pick(rng, ['Meditation', 'Soundscape', 'Breathwork', 'Affirmation'] as const),
    status: (rng() > 0.86 ? (rng() > 0.5 ? 'under_review' : 'removed') : rng() > 0.2 ? 'published' : 'draft') as ContentSession['status'],
    plays: Math.floor(rng() * 21000),
    recreations: Math.floor(rng() * 1800),
    durationMin: Math.floor(rng() * 25) + 5,
    moodDelta: Math.round((rng() * 24 - 4) * 10) / 10,
    createdAt: daysAgo(Math.floor(rng() * 180)),
  }))
})()

/* ------------------------------------------------------------- Moderation */

export interface Report {
  id: string
  sessionTitle: string
  reportedBy: string
  reason: 'Harmful advice' | 'Sexual content' | 'Medical claim' | 'Spam' | 'Copyright' | 'Self-harm risk'
  severity: 'critical' | 'serious' | 'warning'
  status: 'open' | 'in_review' | 'resolved' | 'dismissed'
  reportedAt: string
  slaHoursLeft: number
}

export const REPORTS: Report[] = (() => {
  const rng = makeRng(11)
  return Array.from({ length: 32 }, (_, i) => {
    const reason = pick(rng, ['Harmful advice', 'Sexual content', 'Medical claim', 'Spam', 'Copyright', 'Self-harm risk'] as const)
    return {
      id: `rpt_${(3000 + i).toString(36)}`,
      sessionTitle: pick(rng, TITLES),
      reportedBy: `${pick(rng, FIRST)} ${pick(rng, LAST)}`,
      reason,
      severity: (reason === 'Self-harm risk' ? 'critical' : reason === 'Harmful advice' || reason === 'Medical claim' ? 'serious' : 'warning') as Report['severity'],
      status: pick(rng, ['open', 'open', 'in_review', 'resolved', 'dismissed'] as const),
      reportedAt: daysAgo(Math.floor(rng() * 21)),
      slaHoursLeft: Math.round((rng() * 48 - 6) * 10) / 10,
    }
  })
})()

/* --------------------------------------------------------- AI monitoring */

export interface ModelStat {
  model: string
  requests: number
  inputTokens: number
  outputTokens: number
  costUsd: number
  p50Ms: number
  p95Ms: number
  errorRate: number
  cacheHitRate: number
}

// Rates are Anthropic list prices per 1M tokens, so cost columns reconcile.
export const MODEL_PRICING: Record<string, { in: number; out: number }> = {
  'claude-opus-5': { in: 5.0, out: 25.0 },
  'claude-sonnet-5': { in: 2.0, out: 10.0 },
  'claude-haiku-4-5': { in: 1.0, out: 5.0 },
}

export const MODEL_STATS: ModelStat[] = [
  { model: 'claude-opus-5', requests: 41280, inputTokens: 128_400_000, outputTokens: 19_800_000, costUsd: 0, p50Ms: 2140, p95Ms: 6820, errorRate: 0.4, cacheHitRate: 71.2 },
  { model: 'claude-sonnet-5', requests: 118_640, inputTokens: 262_100_000, outputTokens: 44_300_000, costUsd: 0, p50Ms: 980, p95Ms: 2740, errorRate: 0.7, cacheHitRate: 64.5 },
  { model: 'claude-haiku-4-5', requests: 206_910, inputTokens: 91_700_000, outputTokens: 12_400_000, costUsd: 0, p50Ms: 410, p95Ms: 1120, errorRate: 1.1, cacheHitRate: 58.9 },
].map((row) => {
  const price = MODEL_PRICING[row.model]
  const cost = (row.inputTokens / 1e6) * price.in + (row.outputTokens / 1e6) * price.out
  return { ...row, costUsd: Math.round(cost * 100) / 100 }
})

export interface DayPoint {
  date: string
  opus: number
  sonnet: number
  haiku: number
  p50: number
  p95: number
  p99: number
  requests: number
  errors: number
  refusals: number
}

export const AI_TIMESERIES: DayPoint[] = (() => {
  const rng = makeRng(99)
  return Array.from({ length: 30 }, (_, i) => {
    const weekend = (i + 2) % 7 < 2
    const load = weekend ? 0.72 : 1
    const drift = 1 + i * 0.012
    const requests = Math.round((9800 + rng() * 2600) * load * drift)
    return {
      date: daysAgo(29 - i).slice(0, 10),
      opus: Math.round((118 + rng() * 46) * load * drift * 100) / 100,
      sonnet: Math.round((84 + rng() * 30) * load * drift * 100) / 100,
      haiku: Math.round((26 + rng() * 12) * load * drift * 100) / 100,
      p50: Math.round(820 + rng() * 260),
      p95: Math.round(2350 + rng() * 900 + (i > 24 ? 700 : 0)),
      p99: Math.round(4100 + rng() * 1500 + (i > 24 ? 1600 : 0)),
      requests,
      errors: Math.round(requests * (0.004 + rng() * 0.006)),
      refusals: Math.round(requests * (0.001 + rng() * 0.002)),
    }
  })
})()

export interface Trace {
  id: string
  user: string
  intent: string
  model: string
  inputTokens: number
  outputTokens: number
  costUsd: number
  latencyMs: number
  ttftMs: number
  status: 'ok' | 'error' | 'refusal' | 'timeout'
  judgeScore: number | null
  flagged: boolean
  at: string
}

const INTENTS = ['session.generate', 'session.revise', 'chat.reply', 'recommendation.rank', 'script.write', 'safety.classify', 'title.suggest']

export const TRACES: Trace[] = (() => {
  const rng = makeRng(5)
  return Array.from({ length: 90 }, (_, i) => {
    const model = pick(rng, ['claude-opus-5', 'claude-sonnet-5', 'claude-haiku-4-5'])
    const price = MODEL_PRICING[model]
    const inputTokens = Math.floor(rng() * 14000) + 900
    const outputTokens = Math.floor(rng() * 2600) + 120
    const roll = rng()
    const status = (roll > 0.965 ? 'error' : roll > 0.94 ? 'refusal' : roll > 0.925 ? 'timeout' : 'ok') as Trace['status']
    // Only a sampled slice of traffic gets an LLM-as-judge score, as in prod.
    const sampled = rng() < 0.04
    return {
      id: `trc_${(500000 + i * 37).toString(36)}`,
      user: `${pick(rng, FIRST)} ${pick(rng, LAST)}`,
      intent: pick(rng, INTENTS),
      model,
      inputTokens,
      outputTokens,
      costUsd: Math.round(((inputTokens / 1e6) * price.in + (outputTokens / 1e6) * price.out) * 10000) / 10000,
      latencyMs: Math.round(380 + rng() * 7200),
      ttftMs: Math.round(120 + rng() * 900),
      status,
      judgeScore: sampled && status === 'ok' ? Math.round((3.1 + rng() * 1.9) * 10) / 10 : null,
      flagged: rng() > 0.94,
      at: daysAgo(Math.floor(rng() * 3)),
    }
  })
})()

export const EVAL_SCORES = [
  { band: '1 — unusable', count: 14 },
  { band: '2 — weak', count: 63 },
  { band: '3 — acceptable', count: 402 },
  { band: '4 — good', count: 1186 },
  { band: '5 — excellent', count: 742 },
]

export interface SafetyEvent {
  id: string
  category: 'Self-harm language' | 'Medical claim' | 'Crisis keyword' | 'Prompt injection' | 'PII in prompt'
  action: 'blocked' | 'rerouted' | 'escalated' | 'logged'
  model: string
  severity: 'critical' | 'serious' | 'warning'
  at: string
  handledBy: string
}

export const SAFETY_EVENTS: SafetyEvent[] = (() => {
  const rng = makeRng(23)
  return Array.from({ length: 28 }, (_, i) => {
    const category = pick(rng, ['Self-harm language', 'Medical claim', 'Crisis keyword', 'Prompt injection', 'PII in prompt'] as const)
    return {
      id: `saf_${(7000 + i).toString(36)}`,
      category,
      action: pick(rng, ['blocked', 'rerouted', 'escalated', 'logged'] as const),
      model: pick(rng, ['claude-opus-5', 'claude-sonnet-5', 'claude-haiku-4-5']),
      severity: (category === 'Self-harm language' || category === 'Crisis keyword' ? 'critical' : category === 'Medical claim' ? 'serious' : 'warning') as SafetyEvent['severity'],
      at: daysAgo(Math.floor(rng() * 14)),
      handledBy: rng() > 0.5 ? 'auto-guardrail' : `${pick(rng, FIRST)} ${pick(rng, LAST)}`,
    }
  })
})()

/* ------------------------------------------------------------------ Coins */

export interface CoinTx {
  id: string
  user: string
  type: 'earn' | 'spend' | 'grant' | 'refund'
  reason: string
  amount: number
  balanceAfter: number
  at: string
}

export const COIN_TX: CoinTx[] = (() => {
  const rng = makeRng(17)
  return Array.from({ length: 60 }, (_, i) => {
    const type = pick(rng, ['earn', 'earn', 'spend', 'grant', 'refund'] as const)
    const amount = Math.floor(rng() * 400) + 10
    return {
      id: `cn_${(9000 + i).toString(36)}`,
      user: `${pick(rng, FIRST)} ${pick(rng, LAST)}`,
      type,
      reason: pick(rng, ['Daily streak', 'Session published', 'Community recreate', 'Redeemed theme', 'Referral bonus', 'Support credit', 'Challenge win']),
      amount: type === 'spend' ? -amount : amount,
      balanceAfter: Math.floor(rng() * 5000),
      at: daysAgo(Math.floor(rng() * 30)),
    }
  })
})()

/* -------------------------------------------------------------- Audit log */

export interface AuditEntry {
  id: string
  actor: string
  actorRole: string
  action: string
  target: string
  ip: string
  result: 'success' | 'denied'
  at: string
}

const ACTIONS = [
  'user.suspend', 'user.role_change', 'session.unpublish', 'report.resolve',
  'ai.model_switch', 'ai.budget_update', 'coins.grant', 'role.permission_update',
  'settings.update', 'user.export', 'auth.login', 'auth.login_failed',
]

export const AUDIT_LOG: AuditEntry[] = (() => {
  const rng = makeRng(31)
  return Array.from({ length: 120 }, (_, i) => {
    const action = pick(rng, ACTIONS)
    return {
      id: `aud_${(400000 + i * 13).toString(36)}`,
      actor: `${pick(rng, FIRST)} ${pick(rng, LAST)}`,
      actorRole: pick(rng, ['super_admin', 'ops', 'moderator', 'ai_engineer', 'analyst']),
      action,
      target: action.startsWith('user') ? `usr_${(1000 + Math.floor(rng() * 68)).toString(36)}`
        : action.startsWith('session') ? `ses_${(2000 + Math.floor(rng() * 54)).toString(36)}`
        : action.startsWith('report') ? `rpt_${(3000 + Math.floor(rng() * 32)).toString(36)}`
        : action.startsWith('ai') ? pick(rng, ['claude-opus-5', 'claude-sonnet-5'])
        : '—',
      ip: `${Math.floor(rng() * 200) + 20}.${Math.floor(rng() * 255)}.${Math.floor(rng() * 255)}.${Math.floor(rng() * 255)}`,
      result: (action === 'auth.login_failed' || rng() > 0.94 ? 'denied' : 'success') as AuditEntry['result'],
      at: daysAgo(Math.floor(rng() * 30)),
    }
  })
})()
