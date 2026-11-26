/**
 * Creator retreat funnel (U113, J159): Eugene's Retreat-in-a-Box as a
 * B2B2C funnel, on the inputs of the wiki's Unit economics page
 * (/wiki/b2b2c/economics) so the admin and the research cannot disagree.
 * Two things vary separately: the OFFER (the terms: price, split, how the
 * sessions are made, the box) and the OUTCOME scenario (how many stay to
 * week 8 and move to Plus). Every figure here is an estimate until a pilot
 * measures it; none is a result.
 */

export type Channel = 'web' | 'store15' | 'store30'

export interface Offer {
  id: string
  name: string
  note: string
  /** Ticket price in euros, VAT included. */
  price: number
  /** The creator's share of the ticket, 0–1, applied to the net after VAT and fees. */
  creatorShare: number
  /** The creator's share of year-1 Plus revenue from their cohort, 0–1 (redesign: a proposal to negotiate). */
  creatorPlusShare: number
  /** AI cost per buyer for the whole retreat, in euros ($1 = €1, as on the wiki). */
  aiPerBuyer: number
  aiNote: string
  /** Physical box cost per buyer paid by Aurelia, euros; 0 for a digital kit. */
  boxPerBuyer: number
  channel: Channel
}

export interface Outcome {
  id: 'low' | 'middle' | 'spec'
  name: string
  /** Share of buyers still active at week 8. */
  activeWeek8: number
  /** Share of week-8 graduates who choose Plus. */
  gradToPlus: number
  refundRate: number
}

export const VAT = 0.2
export const CARD = { pct: 0.014, fixed: 0.25 }
/** Year-1 net of an annual Plus subscriber to Aurelia: $100 ÷ 1.2 VAT × 0.85 after a 15% store fee. */
export const PLUS_NET_YEAR1 = 70.83
/** What a creator keeps selling the same ticket on a course platform (about 90%, after card fees). */
export const COURSE_PLATFORM_KEEP = 0.9

export const OFFERS: Offer[] = [
  {
    id: 'spec',
    name: 'Spec, as written',
    note: '€19.99, 60/40, 24 personalised sessions, a physical box in every ticket.',
    price: 19.99,
    creatorShare: 0.6,
    creatorPlusShare: 0,
    aiPerBuyer: 3.12,
    aiNote: '24 personalised sessions, middle voice tier (24 × $0.13)',
    boxPerBuyer: 14,
    channel: 'web',
  },
  {
    id: 'redesign',
    name: 'Redesign at €19.99',
    note: 'Approved 24 Nov 2026: 70/30 plus a share of the Plus each cohort drives, a journey produced once in the creator’s voice with personal inserts, a digital kit.',
    price: 19.99,
    creatorShare: 0.7,
    creatorPlusShare: 0.2,
    aiPerBuyer: 0.5,
    aiNote: 'Journey produced once per creator; about 24 short personal inserts per buyer (estimate)',
    boxPerBuyer: 0,
    channel: 'web',
  },
  {
    id: 'redesign39',
    name: 'Redesign at €39',
    note: 'The same terms at the higher ticket the plan tests against €19.99.',
    price: 39,
    creatorShare: 0.7,
    creatorPlusShare: 0.2,
    aiPerBuyer: 0.5,
    aiNote: 'As the €19.99 redesign',
    boxPerBuyer: 0,
    channel: 'web',
  },
]

export const OUTCOMES: Outcome[] = [
  { id: 'low', name: 'Low', activeWeek8: 0.2, gradToPlus: 0.15, refundRate: 0.1 },
  { id: 'middle', name: 'Middle (plan on this)', activeWeek8: 0.35, gradToPlus: 0.3, refundRate: 0.075 },
  { id: 'spec', name: 'Spec', activeWeek8: 0.765, gradToPlus: 0.3, refundRate: 0.05 },
]

export function storeFee(channel: Channel) {
  return channel === 'store15' ? 0.15 : channel === 'store30' ? 0.3 : 0
}

/** One ticket, in euros. */
export function perTicket(o: Offer) {
  const exVat = o.price / (1 + VAT)
  const fees = o.channel === 'web' ? o.price * CARD.pct + CARD.fixed : exVat * storeFee(o.channel)
  const net = exVat - fees
  const creator = net * o.creatorShare
  const aurelia = net - creator
  const margin = aurelia - o.aiPerBuyer - o.boxPerBuyer
  return { exVat, fees, net, creator, aurelia, ai: o.aiPerBuyer, box: o.boxPerBuyer, margin }
}

/** A cohort of `seats` buyers under an offer and an outcome. */
export function cohort(o: Offer, s: Outcome, seats: number) {
  const t = perTicket(o)
  const refunded = seats * s.refundRate
  const kept = seats - refunded
  const graduates = seats * s.activeWeek8
  const plus = graduates * s.gradToPlus
  const plusNet = plus * PLUS_NET_YEAR1
  const creatorPlus = plusNet * o.creatorPlusShare
  // AI is spent on every buyer, refunded or not (an upper bound); the box ships to every buyer.
  const aureliaTicket = kept * t.aurelia - seats * (t.ai + t.box)
  const aureliaPlus = plusNet - creatorPlus
  const creatorTicket = kept * t.creator
  return {
    seats,
    refunded,
    kept,
    graduates,
    plus,
    plusPerBuyer: seats ? plus / seats : 0,
    aureliaTicket,
    aureliaPlus,
    aureliaTotal: aureliaTicket + aureliaPlus,
    creatorTicket,
    creatorPlus,
    creatorTotal: creatorTicket + creatorPlus,
    /** What the creator would keep selling the same seats on a course platform. */
    creatorElsewhere: kept * t.net * COURSE_PLATFORM_KEEP,
  }
}

/** The pilot's five numbers, with thresholds set in advance (/wiki/b2b2c/plan). */
export function pilotGates(o: Offer, s: Outcome, seats: number) {
  const t = perTicket(o)
  const c = cohort(o, s, seats)
  const payment = o.channel === 'web' ? o.price * CARD.pct + CARD.fixed : t.fees
  return [
    { id: 'seats', label: 'Median paid seats per cohort', target: 'at least 100', value: `${Math.round(seats)}`, pass: seats >= 100 },
    { id: 'active', label: 'Active at week 8', target: 'at least 35%', value: pct(s.activeWeek8), pass: s.activeWeek8 >= 0.35 },
    { id: 'plus', label: 'Plus per ticket buyer', target: 'at least 8%', value: pct(c.plusPerBuyer, 1), pass: c.plusPerBuyer >= 0.08 },
    { id: 'refunds', label: 'Refunds', target: 'under 10%', value: pct(s.refundRate, 1), pass: s.refundRate < 0.1 },
    { id: 'cost', label: 'AI and payment cost per buyer', target: `under a third of Aurelia’s share (€${(t.aurelia / 3).toFixed(2)})`, value: `€${(t.ai + payment).toFixed(2)}`, pass: t.ai + payment < t.aurelia / 3 },
  ]
}

export function pct(v: number, digits = 0) {
  return `${(v * 100).toFixed(digits).replace(/\.0$/, '')}%`
}

export const eur = (v: number) => {
  const a = Math.abs(v)
  const d = a < 100 ? 2 : 0
  return `${v < 0 ? '−' : ''}€${a.toLocaleString('en-GB', { minimumFractionDigits: d, maximumFractionDigits: d })}`
}
