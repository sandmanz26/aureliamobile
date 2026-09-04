// Commerce, growth and compliance mock data. Same seeded-PRNG approach as
// data/mock.ts — shapes mirror what a billing provider (Stripe-style) plus a
// consent/DSAR store would return.

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

const FIRST = ['Adam', 'Sara', 'Lily', 'Marcus', 'Nadia', 'Tomas', 'Priya', 'Chen', 'Diego', 'Amara', 'Jonas', 'Yuki', 'Rafael', 'Ingrid', 'Omar', 'Elena']
const LAST = ['Nilson', 'Trezeguat', 'Ahmad', 'Lee', 'Haddad', 'Novak', 'Sharma', 'Wei', 'Alvarez', 'Okafor', 'Berg', 'Tanaka', 'Costa', 'Farouk']
const name = (rng: () => number) => `${pick(rng, FIRST)} ${pick(rng, LAST)}`

/* ---------------------------------------------------------------- Pricing */

export interface Plan {
  id: string
  name: string
  tagline: string
  monthlyUsd: number
  yearlyUsd: number
  status: 'live' | 'grandfathered' | 'draft'
  subscribers: number
  mrrUsd: number
  /** Hard limits enforced by the app. null = unlimited. */
  sessionsPerMonth: number | null
  voiceInput: boolean
  communityPublish: boolean
  offlineDownload: boolean
  prioritySupport: boolean
  aiModel: string
}

export const PLANS: Plan[] = [
  {
    id: 'free', name: 'Free', tagline: 'Try the cockpit, keep three sessions.',
    monthlyUsd: 0, yearlyUsd: 0, status: 'live', subscribers: 41820, mrrUsd: 0,
    sessionsPerMonth: 5, voiceInput: false, communityPublish: false,
    offlineDownload: false, prioritySupport: false, aiModel: 'claude-haiku-4-5',
  },
  {
    id: 'plus', name: 'Plus', tagline: 'Unlimited generation and voice.',
    monthlyUsd: 9.99, yearlyUsd: 79.0, status: 'live', subscribers: 7340, mrrUsd: 61_240,
    sessionsPerMonth: 60, voiceInput: true, communityPublish: true,
    offlineDownload: true, prioritySupport: false, aiModel: 'claude-sonnet-5',
  },
  {
    id: 'pro', name: 'Pro', tagline: 'Everything, on the strongest model.',
    monthlyUsd: 19.99, yearlyUsd: 179.0, status: 'live', subscribers: 2180, mrrUsd: 37_180,
    sessionsPerMonth: null, voiceInput: true, communityPublish: true,
    offlineDownload: true, prioritySupport: true, aiModel: 'claude-opus-5',
  },
  {
    id: 'plus_legacy', name: 'Plus (2025)', tagline: 'Closed to new signups.',
    monthlyUsd: 6.99, yearlyUsd: 59.0, status: 'grandfathered', subscribers: 1420, mrrUsd: 8_940,
    sessionsPerMonth: 60, voiceInput: true, communityPublish: true,
    offlineDownload: true, prioritySupport: false, aiModel: 'claude-sonnet-5',
  },
]

export interface RegionPrice {
  region: string
  currency: string
  plusMonthly: number
  proMonthly: number
  pppAdjusted: boolean
  taxMode: 'inclusive' | 'exclusive'
}

export const REGION_PRICING: RegionPrice[] = [
  { region: 'United States', currency: 'USD', plusMonthly: 9.99, proMonthly: 19.99, pppAdjusted: false, taxMode: 'exclusive' },
  { region: 'Eurozone', currency: 'EUR', plusMonthly: 9.99, proMonthly: 19.99, pppAdjusted: false, taxMode: 'inclusive' },
  { region: 'United Kingdom', currency: 'GBP', plusMonthly: 8.99, proMonthly: 17.99, pppAdjusted: false, taxMode: 'inclusive' },
  { region: 'Indonesia', currency: 'IDR', plusMonthly: 69000, proMonthly: 139000, pppAdjusted: true, taxMode: 'inclusive' },
  { region: 'India', currency: 'INR', plusMonthly: 399, proMonthly: 799, pppAdjusted: true, taxMode: 'inclusive' },
  { region: 'Brazil', currency: 'BRL', plusMonthly: 29.9, proMonthly: 59.9, pppAdjusted: true, taxMode: 'inclusive' },
  { region: 'Japan', currency: 'JPY', plusMonthly: 1500, proMonthly: 2980, pppAdjusted: false, taxMode: 'inclusive' },
]

export interface CoinPack {
  id: string
  name: string
  coins: number
  priceUsd: number
  soldLast30d: number
}

export const COIN_PACKS: CoinPack[] = [
  { id: 'pack_s', name: 'Handful', coins: 500, priceUsd: 1.99, soldLast30d: 3210 },
  { id: 'pack_m', name: 'Pouch', coins: 1500, priceUsd: 4.99, soldLast30d: 2480 },
  { id: 'pack_l', name: 'Chest', coins: 4000, priceUsd: 11.99, soldLast30d: 940 },
  { id: 'pack_xl', name: 'Vault', coins: 10000, priceUsd: 24.99, soldLast30d: 260 },
]

/* --------------------------------------------------------------- Payments */

export interface Payment {
  id: string
  customer: string
  email: string
  description: string
  plan: string
  gross: number
  fee: number
  net: number
  currency: string
  method: 'card' | 'apple_pay' | 'google_pay' | 'paypal'
  brand: string
  status: 'succeeded' | 'failed' | 'refunded' | 'pending' | 'disputed'
  failureReason: string
  country: string
  at: string
}

const FAILURES = ['insufficient_funds', 'card_expired', 'do_not_honor', 'authentication_required', '']

export const PAYMENTS: Payment[] = (() => {
  const rng = makeRng(77)
  return Array.from({ length: 96 }, (_, i) => {
    const plan = pick(rng, ['Plus monthly', 'Pro monthly', 'Plus yearly', 'Pro yearly', 'Coin pack — Pouch', 'Coin pack — Chest'])
    const gross = plan.includes('yearly') ? (plan.startsWith('Pro') ? 179 : 79)
      : plan.startsWith('Coin') ? (plan.includes('Chest') ? 11.99 : 4.99)
      : plan.startsWith('Pro') ? 19.99 : 9.99
    const roll = rng()
    const status = (roll > 0.955 ? 'disputed' : roll > 0.9 ? 'refunded' : roll > 0.79 ? 'failed' : roll > 0.76 ? 'pending' : 'succeeded') as Payment['status']
    const fee = Math.round((gross * 0.029 + 0.3) * 100) / 100
    const person = name(rng)
    return {
      id: `pi_${(800000 + i * 91).toString(36)}`,
      customer: person,
      email: `${person.toLowerCase().replace(' ', '.')}@example.com`,
      description: plan,
      plan: plan.split(' ')[0],
      gross,
      fee: status === 'succeeded' ? fee : 0,
      net: status === 'succeeded' ? Math.round((gross - fee) * 100) / 100 : status === 'refunded' ? -gross : 0,
      currency: 'USD',
      method: pick(rng, ['card', 'card', 'card', 'apple_pay', 'google_pay', 'paypal'] as const),
      brand: pick(rng, ['Visa', 'Mastercard', 'Amex', '—']),
      status,
      failureReason: status === 'failed' ? pick(rng, FAILURES.slice(0, 4)) : '',
      country: pick(rng, ['US', 'ID', 'GB', 'DE', 'JP', 'BR', 'IN', 'NL', 'AU']),
      at: daysAgo(Math.floor(rng() * 30)),
    }
  })
})()

/** Involuntary churn recovery — 20–40% of subscription churn is failed cards. */
export interface DunningItem {
  id: string
  customer: string
  plan: string
  amount: number
  reason: string
  attempt: number
  maxAttempts: number
  nextRetry: string
  gracePeriodEndsAt: string
  outcome: 'retrying' | 'recovered' | 'lapsed'
  channel: 'email' | 'email+push' | 'email+sms'
}

export const DUNNING: DunningItem[] = (() => {
  const rng = makeRng(88)
  return Array.from({ length: 34 }, (_, i) => {
    const outcome = pick(rng, ['retrying', 'retrying', 'recovered', 'recovered', 'lapsed'] as const)
    return {
      id: `dun_${(6000 + i).toString(36)}`,
      customer: name(rng),
      plan: pick(rng, ['Plus monthly', 'Pro monthly', 'Plus yearly']),
      amount: pick(rng, [9.99, 19.99, 79]),
      reason: pick(rng, FAILURES.slice(0, 4)),
      attempt: Math.floor(rng() * 4) + 1,
      maxAttempts: 4,
      nextRetry: daysAgo(-Math.floor(rng() * 5) - 1),
      gracePeriodEndsAt: daysAgo(-Math.floor(rng() * 12) - 1),
      outcome,
      channel: pick(rng, ['email', 'email+push', 'email+sms'] as const),
    }
  })
})()

/* ---------------------------------------------------------------- Revenue */

export interface MrrMonth {
  month: string
  starting: number
  newMrr: number
  expansion: number
  contraction: number
  churn: number
  ending: number
  subscribers: number
}

export const MRR_MONTHS: MrrMonth[] = (() => {
  const rng = makeRng(55)
  let starting = 52_000
  return Array.from({ length: 12 }, (_, i) => {
    const newMrr = Math.round(9200 + rng() * 3800 + i * 260)
    const expansion = Math.round(2100 + rng() * 1400)
    const contraction = -Math.round(900 + rng() * 700)
    const churn = -Math.round(4200 + rng() * 2100)
    const ending = starting + newMrr + expansion + contraction + churn
    const row = {
      month: new Date(Date.UTC(2025, 9 + i, 1)).toISOString().slice(0, 7),
      starting, newMrr, expansion, contraction, churn, ending,
      subscribers: Math.round(ending / 8.4),
    }
    starting = ending
    return row
  })
})()

/** Cohort retention grid — % of each signup cohort still subscribed by month. */
export const COHORTS: { cohort: string; size: number; retention: (number | null)[] }[] = (() => {
  const rng = makeRng(66)
  return Array.from({ length: 9 }, (_, c) => {
    const months = 9 - c
    let value = 100
    return {
      cohort: new Date(Date.UTC(2026, c, 1)).toISOString().slice(0, 7),
      size: Math.round(900 + rng() * 1400),
      retention: Array.from({ length: 9 }, (_, m) => {
        if (m >= months) return null
        if (m === 0) return 100
        // Steep month-1 drop, then flattening — typical consumer subscription shape.
        value = value * (m === 1 ? 0.62 + rng() * 0.08 : 0.93 + rng() * 0.05)
        return Math.round(value)
      }),
    }
  })
})()

/* ------------------------------------------------------- Compliance / DSAR */

export interface DsarRequest {
  id: string
  user: string
  email: string
  type: 'export' | 'deletion' | 'rectification' | 'restriction'
  status: 'new' | 'verifying' | 'in_progress' | 'completed' | 'rejected'
  jurisdiction: 'GDPR' | 'CCPA' | 'UK GDPR' | 'PDP (ID)'
  receivedAt: string
  dueInDays: number
  handledBy: string
}

export const DSAR: DsarRequest[] = (() => {
  const rng = makeRng(101)
  return Array.from({ length: 26 }, (_, i) => {
    const person = name(rng)
    return {
      id: `dsr_${(4000 + i).toString(36)}`,
      user: person,
      email: `${person.toLowerCase().replace(' ', '.')}@example.com`,
      type: pick(rng, ['export', 'deletion', 'deletion', 'rectification', 'restriction'] as const),
      status: pick(rng, ['new', 'verifying', 'in_progress', 'completed', 'completed', 'rejected'] as const),
      jurisdiction: pick(rng, ['GDPR', 'CCPA', 'UK GDPR', 'PDP (ID)'] as const),
      receivedAt: daysAgo(Math.floor(rng() * 28)),
      dueInDays: Math.round(rng() * 30 - 4),
      handledBy: rng() > 0.4 ? name(rng) : '—',
    }
  })
})()

/** Consent ledger. Emotional-state and sleep data are special-category under
    GDPR Art. 9, so each purpose is consented separately and revocably. */
export interface ConsentPurpose {
  id: string
  purpose: string
  basis: 'Explicit consent (Art. 9)' | 'Consent' | 'Legitimate interest' | 'Contract'
  specialCategory: boolean
  optedIn: number
  optedOut: number
  withdrawnLast30d: number
}

export const CONSENT: ConsentPurpose[] = [
  { id: 'health_profile', purpose: 'Store mood & sleep data to personalise sessions', basis: 'Explicit consent (Art. 9)', specialCategory: true, optedIn: 44120, optedOut: 8640, withdrawnLast30d: 312 },
  { id: 'voice_processing', purpose: 'Process voice recordings for session prompts', basis: 'Explicit consent (Art. 9)', specialCategory: true, optedIn: 21480, optedOut: 31280, withdrawnLast30d: 588 },
  { id: 'wearable_sync', purpose: 'Import sleep & HRV from connected wearables', basis: 'Explicit consent (Art. 9)', specialCategory: true, optedIn: 12060, optedOut: 40700, withdrawnLast30d: 141 },
  { id: 'model_training', purpose: 'Use anonymised transcripts to improve models', basis: 'Consent', specialCategory: false, optedIn: 18340, optedOut: 34420, withdrawnLast30d: 806 },
  { id: 'marketing_push', purpose: 'Marketing push notifications', basis: 'Consent', specialCategory: false, optedIn: 29870, optedOut: 22890, withdrawnLast30d: 1204 },
  { id: 'product_analytics', purpose: 'Product analytics & crash reporting', basis: 'Legitimate interest', specialCategory: false, optedIn: 50110, optedOut: 2650, withdrawnLast30d: 96 },
]

export const RETENTION_POLICY = [
  { data: 'Chat transcripts', period: '24 months', afterwards: 'Deleted' },
  { data: 'Voice recordings', period: '7 days', afterwards: 'Deleted after transcription' },
  { data: 'Mood & sleep entries', period: 'Account lifetime', afterwards: 'Deleted on account closure' },
  { data: 'Generated session audio', period: 'Account lifetime', afterwards: 'Deleted on account closure' },
  { data: 'Billing records', period: '7 years', afterwards: 'Retained — statutory' },
  { data: 'Audit log', period: '7 years', afterwards: 'Retained — statutory' },
]

/* ------------------------------------------------------------ Experiments */

export interface Experiment {
  id: string
  name: string
  hypothesis: string
  surface: string
  status: 'running' | 'ready' | 'draft' | 'stopped'
  variants: number
  exposed: number
  metric: string
  lift: number
  significance: number
  startedAt: string
}

export const EXPERIMENTS: Experiment[] = [
  { id: 'exp_paywall_timing', name: 'Paywall after 3rd session', hypothesis: 'Delaying the paywall until value is felt raises trial starts.', surface: 'Onboarding', status: 'running', variants: 2, exposed: 18420, metric: 'Trial start rate', lift: 14.2, significance: 0.97, startedAt: daysAgo(18) },
  { id: 'exp_cockpit_cards', name: 'Cards expanded by default', hypothesis: 'Showing recommendations unstacked increases apply rate.', surface: 'Chat cockpit', status: 'running', variants: 2, exposed: 24180, metric: 'Apply-changes rate', lift: 6.8, significance: 0.88, startedAt: daysAgo(11) },
  { id: 'exp_ppp_pricing', name: 'PPP pricing in SEA', hypothesis: 'Local pricing in IDR/INR lifts paid conversion more than it dilutes ARPU.', surface: 'Paywall', status: 'running', variants: 3, exposed: 9640, metric: 'Paid conversion', lift: 31.5, significance: 0.99, startedAt: daysAgo(26) },
  { id: 'exp_streak_push', name: 'Evening streak reminder', hypothesis: 'A 20:00 local push lifts D7 retention.', surface: 'Notifications', status: 'ready', variants: 2, exposed: 31200, metric: 'D7 retention', lift: 2.1, significance: 0.62, startedAt: daysAgo(34) },
  { id: 'exp_voice_onboard', name: 'Voice-first onboarding', hypothesis: 'Opening with voice input increases first-session completion.', surface: 'Onboarding', status: 'stopped', variants: 2, exposed: 6180, metric: 'First session completed', lift: -8.4, significance: 0.95, startedAt: daysAgo(52) },
  { id: 'exp_coin_bundle', name: 'Bundle coins with Plus', hypothesis: 'Including 1,000 coins raises Plus conversion.', surface: 'Paywall', status: 'draft', variants: 2, exposed: 0, metric: 'Plus conversion', lift: 0, significance: 0, startedAt: daysAgo(2) },
]

/* ---------------------------------------------------------- Notifications */

export interface Campaign {
  id: string
  name: string
  channel: 'push' | 'email' | 'in-app'
  segment: string
  status: 'sent' | 'scheduled' | 'draft' | 'paused'
  audience: number
  delivered: number
  opened: number
  converted: number
  consentGated: boolean
  sentAt: string
}

export const CAMPAIGNS: Campaign[] = (() => {
  const rng = makeRng(44)
  const names = [
    ['Evening wind-down reminder', 'push', 'Active, opted-in'],
    ['Win-back: lapsed 30d', 'email', 'Churned 30–60d'],
    ['New: Breathwork sessions', 'push', 'Plus + Pro'],
    ['Streak at risk', 'push', 'Streak ≥ 5, idle 2d'],
    ['Payment failed — update card', 'email', 'Dunning queue'],
    ['Weekly wellness digest', 'email', 'All opted-in'],
    ['Try voice input', 'in-app', 'Never used voice'],
    ['Annual plan offer', 'email', 'Monthly ≥ 3 months'],
  ] as const
  return names.map(([label, channel, segment], i) => {
    const audience = Math.round(4000 + rng() * 30000)
    const delivered = Math.round(audience * (0.86 + rng() * 0.11))
    const opened = Math.round(delivered * (0.18 + rng() * 0.3))
    return {
      id: `cmp_${(200 + i).toString(36)}`,
      name: label,
      channel: channel as Campaign['channel'],
      segment,
      status: pick(rng, ['sent', 'sent', 'scheduled', 'draft', 'paused'] as const),
      audience,
      delivered,
      opened,
      converted: Math.round(opened * (0.06 + rng() * 0.16)),
      // Transactional (dunning) mail is not consent-gated; marketing is.
      consentGated: !label.startsWith('Payment failed'),
      sentAt: daysAgo(Math.floor(rng() * 40)),
    }
  })
})()
