import { v6Tallies } from './buyerRunV6'
import { v7Tallies } from './buyerRunV7'
import type { ReportSummary } from './reportSummaries'

/**
 * Admin → Reports → B2B2C report: B2B2C research round 2, as data. The
 * channels re-ranked with the new research and buyer tests 6 and 7, the
 * features each channel needs (who, what problem, the evidence, priority,
 * effort, the API v2 endpoints, the success number) and the phased plan.
 * The wiki pages /wiki/b2b2c/round-2 and /wiki/b2b2c/features say the same
 * in prose; `b2b2cReport.test.ts` checks every feature carries a source,
 * a priority, an effort and a metric. Pure, so the page stays thin.
 */

export type EvidenceLabel = 'measured' | 'company' | 'third-party' | 'estimate' | 'simulated' | 'internal'

export const EVIDENCE_LABEL_TEXT: Record<EvidenceLabel, string> = {
  measured: 'Measured',
  company: 'Company claim',
  'third-party': 'Third party',
  estimate: 'Estimate',
  simulated: 'Simulated',
  internal: 'Our documents',
}

export interface B2b2cSource {
  id: string
  title: string
  /** A web address, or a wiki / admin route for our own documents. */
  url: string
  /** When it was published or read. */
  date: string
  label: EvidenceLabel
  /** What we took from it, in one line. */
  used: string
}

/** Every source round 2 uses: new web research (read 25 Nov 2026) and our own documents. */
export const B2B2C_SOURCES: B2b2cSource[] = [
  // New web research, round 2
  { id: 'sword-headspace', title: 'Sword Health to acquire Headspace', url: 'https://cryptobriefing.com/sword-health-acquires-headspace/', date: '2026', label: 'third-party', used: 'Headspace sold for up to $300M, folded into an AI care platform: the content-only employer app is consolidating.' },
  { id: 'cigna-headspace', title: 'Headspace for Cigna Healthcare', url: 'https://newsroom.cigna.com/2025-11-10-Headspace-for-Cigna-Healthcare-Enhances-Everyday-Mental-Health-Support-Through-Self-Guided,-Science-Backed-Resources', date: '10 Nov 2025', label: 'company', used: 'From 1 Jan 2026, Headspace reaches 7M+ people through a health plan: big buyers buy through payers, not apps.' },
  { id: 'calm-solera', title: 'Calm Health joins the Solera Network', url: 'https://www.calm.com/blog/calm-health-solera-press', date: 'Jan 2026', label: 'company', used: 'Calm Health says it reaches 39M+ people through plans, providers and employers. Enterprise is quote-only.' },
  { id: 'calm-teams', title: 'Calm for Organizations, groups of 5–300', url: 'https://support.calm.com/hc/en-us/articles/360038432493', date: 'read 25 Nov 2026', label: 'company', used: 'A self-serve team plan from 5 seats, cheaper per seat as the group grows.' },
  { id: 'vendr-calm', title: 'Vendr: Calm buyer data', url: 'https://www.vendr.com/marketplace/calm', date: 'read 25 Nov 2026', label: 'third-party', used: 'Median buyer pays about $7,880 a year (51 purchases): small teams, not enterprises.' },
  { id: 'wysa-teams', title: 'Wysa for Teams', url: 'https://wysa.com/for-teams', date: 'read 25 Nov 2026', label: 'company', used: '$50 per employee per year, teams of 200 or fewer, a unique access code per person.' },
  { id: 'headspace-smb', title: 'Headspace for small business', url: 'https://organizations.headspace.com/small-business', date: 'read 25 Nov 2026', label: 'company', used: 'Buy seats online and share one enrolment link with the team.' },
  { id: 'wtw-2026', title: 'WTW: employee wellbeing enters a new phase', url: 'https://www.wtwco.com/en-us/insights/2026/10/employee-wellbeing-enters-its-next-chapter-smarter-investments-greater-impact', date: 'Oct 2026', label: 'third-party', used: 'Only 16% of US employers are cutting wellbeing spend; buyers now ask for outcomes, not more programmes.' },
  { id: 'wellable-2026', title: 'Wellable: employee well-being trends 2026', url: 'https://www.wellable.co/resources/employee-well-being-industry-trends-report/2026/', date: '2026', label: 'third-party', used: '66% plan to invest more in stress and resilience in 2026 (70% in 2025).' },
  { id: 'nfp-2026', title: 'NFP benefits trends, via Insurance Business', url: 'https://www.insurancebusinessmag.com/us/news/benefits/nearly-half-of-us-employers-expect-healthcare-budget-increases--nfp-562773.aspx', date: '2025', label: 'third-party', used: 'Average spend on mental health resources fell about 7%: the budgets disagree, so price low and prove use.' },
  { id: 'mmb-indonesia', title: 'Mercer Marsh Benefits: Indonesia health and benefits study 2025', url: 'https://www.marsh.com/id/en/services/employee-health-benefits/insights/id-indonesia-health-and-benefits-study-2025.html', date: '2025', label: 'third-party', used: '400 organisations: 48% of Indonesian companies already include an employee assistance programme.' },
  { id: 'imarc-indonesia', title: 'IMARC: Indonesia corporate wellness market', url: 'https://www.imarcgroup.com/indonesia-corporate-wellness-market', date: '2025', label: 'estimate', used: 'About $968M in 2025, 5.6% a year. Market-research estimates disagree by 2×.' },
  { id: 'jakpost-tiktok', title: 'Jakarta Post: businesses tap TikTok’s creator economy', url: 'https://thejakartapost.com/business/2026/06/27/businesses-tap-tiktoks-creator-economy-to-boost-sales', date: '27 Jun 2026', label: 'third-party', used: 'Content commerce was 32% of Southeast Asia’s e-commerce in 2025 (Momentum Works): creators sell there.' },
  { id: 'tokopedia-creators', title: 'Tokopedia × TikTok Shop Creators Lab, Bali', url: 'https://www.tokopedia.com/blog/creators-lab-bali-eng/', date: 'Jun 2025', label: 'company', used: 'Indonesian creators are trained to earn commission per sale from short videos and live streams.' },
  { id: 'it-india', title: 'Insight Timer launches in India', url: 'https://m.thewire.in/article/ptiprnews/worlds-largest-free-wellness-app-insight-timer-launches-in-india/amp', date: '11 Mar 2026', label: 'company', used: '35M+ users; local teachers recruited to reach a global audience. The free-first library keeps expanding.' },
  { id: 'it-ai', title: 'Insight Timer: intentions with an AI recommendation engine', url: 'https://www.globenewswire.com/news-release/2026/01/06/3213643/0/en/insight-timer-launches-new-year-s-resolution-and-intention-setting-features-with-ai-recommendation-engine.html', date: '6 Jan 2026', label: 'company', used: '16M intentions set in 2025; personal recommendations are now table stakes, not a moat.' },
  { id: 'it-retreats', title: 'Insight Timer Retreats FAQ for teachers', url: 'https://insight-timer.freshdesk.com/support/solutions/articles/67000739470-insight-timer-retreats-faqs-for-teachers', date: 'read 25 Nov 2026', label: 'company', used: '10% non-refundable booking fee; the teacher runs everything; nothing continues after the retreat.' },
  { id: 'maven-guarantee', title: 'Maven satisfaction guarantee', url: 'https://help.maven.com/en/articles/8705540-maven-s-satisfaction-guarantee', date: 'read 25 Nov 2026', label: 'company', used: 'Full refund up to the course midpoint, shown as a badge on the course page.' },
  { id: 'maven-refunds', title: 'Maven: issuing refunds to students', url: 'https://help.maven.com/en/articles/5597391-issuing-refunds-to-students', date: 'read 25 Nov 2026', label: 'company', used: 'A refund returns both the creator’s share and the platform fee; card fees are lost.' },
  { id: 'revenuecat-2026', title: 'RevenueCat: subscription app benchmarks 2026', url: 'https://www.revenuecat.com/blog/growth/subscription-app-trends-benchmarks-2026', date: '2026', label: 'measured', used: '115,000+ apps: trials of 17–32 days convert 42.5%, under 4 days 25.5%; freemium 2.1% of downloads pay by day 35.' },
  { id: 'adapty-2026', title: 'Adapty: state of in-app subscriptions 2026', url: 'https://adapty.io/state-of-in-app-subscriptions-2026', date: 'Mar 2026', label: 'measured', used: 'Health & Fitness trial-to-paid 35%, the highest category (16,000 apps).' },
  { id: 'ftc-reviews', title: 'FTC final rule banning fake reviews and testimonials', url: 'https://www.ftc.gov/news-events/news/press-releases/2024/08/federal-trade-commission-announces-final-rule-banning-fake-reviews-testimonials', date: 'Aug 2024, in force 21 Oct 2024', label: 'company', used: 'Civil penalties per fake or AI-made review or testimonial, and for fake social proof.' },
  { id: 'nielsen-trust', title: 'Nielsen: global trust in advertising', url: 'https://www.nielsen.com/global-trust-in-advertising', date: '2021 data, read 25 Nov 2026', label: 'third-party', used: '83% trust recommendations from people they know, far above ads.' },
  { id: 'bbb-influencer', title: 'BBB National Programs: Influencer Trust Index 2025', url: 'https://bbbprograms.org/media/insights/blog/influencer-trust-index', date: 'Feb 2025', label: 'third-party', used: '26% say they do not trust influencers; disclosure and honesty drive trust.' },
  { id: 'kajabi-analytics', title: 'Kajabi analytics', url: 'https://kajabi.com/features/analytics', date: 'read 25 Nov 2026', label: 'company', used: 'A creator dashboard: revenue, new customers, active members, lesson completion and last activity.' },
  { id: 'teachable-reports', title: 'Teachable reporting tools', url: 'https://teachable.com/blog/new-teachable-reporting-tools-2024', date: '2024', label: 'company', used: 'Sales, earnings, refunds, fees and payouts in one view; lesson drop-off per course.' },
  { id: 'circle-pricing', title: 'Circle pricing 2026 and transaction fees', url: 'https://schoolmaker.com/blog/circle-so-pricing', date: '2026', label: 'third-party', used: 'Community platforms take 0.5–2% plus card fees: creators compare Aurelia’s 30% to this.' },
  { id: 'headspace-gift', title: 'Headspace: redeem a promo, voucher or gift code', url: 'https://help.headspace.com/hc/en-us/articles/215057448-I-have-a-promo-gift-code-How-do-I-redeem-activate-it', date: 'read 25 Nov 2026', label: 'company', used: 'One code page for gifts, promos and partner vouchers; a code cannot stack on a live subscription.' },
  // Our own documents
  { id: 'buyer-v6', title: 'Buyer agent test 6 (60 simulated people)', url: '/admin/buyer-agent?v=6', date: '25 Nov 2026', label: 'simulated', used: 'Freemium beat the €19.99 retreat ticket in every channel; trust was the top objection; 21 of 60 would buy if their employer paid.' },
  { id: 'buyer-v7', title: 'Buyer agent test 7 (100 simulated people)', url: '/admin/buyer-agent?v=7', date: '25 Nov 2026', label: 'simulated', used: 'A free library lifted trying; among creator followers, freemium still beat the ticket on expected paid plans.' },
  { id: 'round-1', title: 'B2B2C research, round 1', url: '/wiki/b2b2c', date: '23–24 Nov 2026', label: 'internal', used: 'The 15 models and scores, the redesign, the five pilot numbers, the claims rules.' },
  { id: 'it-round-3', title: 'Insight Timer research, round 3', url: '/wiki/research', date: '25 Nov 2026', label: 'internal', used: 'Insight Timer Retreats against Retreat-in-a-Box: their 10% fee, our “after”.' },
  { id: 'owner-retreat', title: 'The business owner’s retreat brief and mock-up', url: '/wiki/b2b2c/round-2', date: '23–24 Nov 2026', label: 'internal', used: 'The retreat’s purpose: reach through creators, then usage, then paid plans; the co-branded box, AI companion and live group.' },
  { id: 'retreat-funnel', title: 'Creator retreat funnel', url: '/admin/business-funnel?view=retreat', date: '24 Nov 2026', label: 'estimate', used: 'Aurelia’s share per ticket and paid plans per ticket buyer, in three outcome cases.' },
  { id: 'cost-model', title: 'Cost report', url: '/admin/reports/cost', date: '25 Nov 2026', label: 'estimate', used: 'What a session costs to make: the free week must stay cheap, so it reuses the creator’s pre-made journey.' },
  { id: 'api-v2', title: 'API contract v2, the pilot slice', url: '/wiki/api', date: 'Nov 2026', label: 'internal', used: 'Which features already have endpoints (tickets, refunds, creator metrics, payouts) and which need new ones (codes, teams).' },
]

export const sourceById = (id: string) => B2B2C_SOURCES.find((s) => s.id === id)

/* ------------------------------------------------------------ Channels */

export type ChannelId = 'creator' | 'employer' | 'partner' | 'free'

export interface Channel {
  id: ChannelId
  name: string
  short: string
  rank: number
  /** Round 1 score out of 18, or null when it was not scored. */
  round1: number | null
  round1Rank: number | null
  /** Round 2: the same six questions (out of 18) plus “what the simulations say” (0–3). */
  score18: number
  sim: number
  why: string
  changed: string
  sources: string[]
}

/** The free plan is the base every channel lands on, so it is not ranked against them. */
export const CHANNELS: Channel[] = [
  {
    id: 'creator',
    name: 'Creator journey, free first week',
    short: 'Creator journey',
    rank: 1,
    round1: 15,
    round1Rank: 2,
    score18: 15,
    sim: 2,
    why: 'Creators bring people who already trust them. The journey in the creator’s own voice is what a course tool cannot do. People start free and pay after the first week, not before.',
    changed: 'Was a ticket paid up front. The simulations say almost nobody pays a stranger’s ticket before anything has helped, so the ticket moves after a free week.',
    sources: ['buyer-v6', 'buyer-v7', 'owner-retreat', 'revenuecat-2026', 'jakpost-tiktok'],
  },
  {
    id: 'employer',
    name: 'Self-serve team plan for small employers',
    short: 'Team plan',
    rank: 2,
    round1: 13,
    round1Rank: 4,
    score18: 13,
    sim: 3,
    why: 'The employer pays, so price stops being the person’s problem. Small teams buy online with a card: Wysa at $50 a seat, Calm from 5 seats, Headspace with one link.',
    changed: 'Moved up from fourth. In test 6, 21 of 60 people named “my employer pays” as a reason to buy, more than any single offer we tested.',
    sources: ['buyer-v6', 'wysa-teams', 'calm-teams', 'headspace-smb', 'vendr-calm', 'wtw-2026'],
  },
  {
    id: 'partner',
    name: 'Partner codes and gifting',
    short: 'Codes and gifts',
    rank: 3,
    round1: 16,
    round1Rank: 1,
    score18: 15,
    sim: 0,
    why: 'Cheap reach where the person still enters their own card. One code system serves gifts, partner trials and team seats.',
    changed: 'Was first. Nothing tested it yet, and API v2 has no code endpoints, so it is built once, for the team plan first, then reused.',
    sources: ['headspace-gift', 'round-1', 'api-v2'],
  },
]

/** Models from round 1 that round 2 moved out of the top three, with why. */
export const MOVED_DOWN: { name: string; round1: string; now: string; why: string; sources: string[] }[] = [
  { name: 'Creator retreat with a ticket paid up front', round1: '2nd (as the redesign)', now: 'An upgrade inside the creator journey', why: 'Test 6: 1 expected paid plan from the €19.99 ticket against 17.5 from the free app. Test 7: still behind among creator followers.', sources: ['buyer-v6', 'buyer-v7'] },
  { name: 'Retreat and studio aftercare', round1: '3rd (14 of 18)', now: 'Later', why: 'Still a real gap: Insight Timer’s retreats end when the retreat does. But it needs in-person retreat leaders and the same backend; it follows the creator pilot.', sources: ['it-retreats', 'it-round-3'] },
  { name: 'Insurers and clinical routes', round1: 'Out (6–7)', now: 'Still out', why: 'The buyers there now want clinical care: Headspace goes to an AI care company, Calm Health sells through health plans.', sources: ['sword-headspace', 'cigna-headspace', 'calm-solera'] },
]

/* ------------------------------------------------------------ Features */

export type Priority = 'Now' | 'Next' | 'Later'
export type Effort = 'frontend' | 'backend' | 'new-backend'
export type FeatureUser = 'creator' | 'participant' | 'employer admin' | 'Aurelia staff'

export const EFFORT_TEXT: Record<Effort, string> = {
  frontend: 'Frontend only',
  backend: 'Needs the backend (in API v2)',
  'new-backend': 'Needs new backend (not in API v2)',
}

export const CHANNEL_NAME: Record<ChannelId, string> = {
  free: 'Free plan (the base)',
  creator: 'Creator journey',
  employer: 'Team plan',
  partner: 'Codes and gifts',
}

export interface Feature {
  id: string
  channel: ChannelId
  title: string
  user: FeatureUser
  problem: string
  evidence: string
  /** Ids in B2B2C_SOURCES. */
  sources: string[]
  priority: Priority
  effort: Effort
  /** API v2 endpoints it uses; empty for frontend-only or new endpoints. */
  endpoints: string[]
  metric: string
  /** A trust feature: it answers “can I trust this?”. */
  trust?: boolean
  /** Rank among all features, 1–3 for the top three. */
  top?: 1 | 2 | 3
}

export const FEATURES: Feature[] = [
  // The free plan, the base
  { id: 'free-week', channel: 'free', title: 'A free first week of every journey, no card', user: 'participant', problem: 'People will not pay before anything has helped. A ticket up front lost almost everyone in the simulations.', evidence: 'Test 6: free app 17.5 expected paid plans, the €19.99 ticket 1. Longer trials convert better: 42.5% for 17–32 days against 25.5% under 4 days.', sources: ['buyer-v6', 'revenuecat-2026'], priority: 'Now', effort: 'backend', endpoints: ['POST /journeys', 'GET /me/entitlements'], metric: 'Share of starters who reach day 7, and who then pay', trust: true, top: 1 },
  { id: 'help-now', channel: 'free', title: '“Need help now?” on every feelings screen', user: 'participant', problem: 'A creator or employer cannot vouch for an AI that has no safety net. Crisis handling is required by law in some markets.', evidence: 'Round 1 regulation: California’s companion-AI law needs a crisis protocol. Test 7 kept the link; it moved nobody but it is a floor, not a feature.', sources: ['round-1', 'buyer-v7'], priority: 'Now', effort: 'backend', endpoints: ['GET /safety/resources', 'POST /safety/reports'], metric: 'Shown on 100% of check-in and session screens; local numbers in every pilot country', trust: true },
  { id: 'data-line', channel: 'free', title: 'One plain line on what we keep and who sees it', user: 'participant', problem: 'Privacy is the first question of protective people, and no quick win answered it.', evidence: 'Test 7: 8 of 17 very protective people would try, and “what happens to my data” was still their first question.', sources: ['buyer-v7', 'round-1'], priority: 'Now', effort: 'frontend', endpoints: [], metric: 'Privacy as an objection in the next buyer test, down from test 7', trust: true },
  { id: 'local-price', channel: 'free', title: 'Bahasa Indonesia and a rupiah price', user: 'participant', problem: 'In Indonesia, language and a local price mattered more than any feature.', evidence: 'Test 7: Indonesian simulated people barely moved on quick wins; Bahasa and rupiah were their condition.', sources: ['buyer-v7', 'mmb-indonesia'], priority: 'Later', effort: 'backend', endpoints: ['GET /plans'], metric: 'Indonesian starters who pay, against the rest' },

  // Creator journey
  { id: 'voice-sample', channel: 'creator', title: 'The creator’s page with a 60-second sample in their own voice', user: 'participant', problem: 'Trust was the top objection to the retreat. Followers trust the creator, not an unknown AI app.', evidence: 'Test 6: trust was the top objection (25 mentions); the creator’s own voice moved 5 answers, more than any other change. 83% trust recommendations from people they know.', sources: ['buyer-v6', 'nielsen-trust'], priority: 'Now', effort: 'backend', endpoints: ['GET /creators/{handle}', 'GET /retreats/{id}'], metric: 'Page visitors who start the free week', trust: true, top: 2 },
  { id: 'pay-after-week', channel: 'creator', title: 'Pay after week one: the creator’s journey or the paid plan', user: 'participant', problem: 'The ticket must come after the first help, not before it.', evidence: 'Tests 6 and 7: the ticket up front lost to the free app among creator followers both times.', sources: ['buyer-v6', 'buyer-v7', 'retreat-funnel'], priority: 'Now', effort: 'backend', endpoints: ['POST /checkout/tickets', 'POST /checkout/subscription'], metric: 'Paid by day 10 among free-week starters (judgement: at least 15%)' },
  { id: 'refund-window', channel: 'creator', title: 'Full refund until week 4, said on the page before paying', user: 'participant', problem: 'Paying for an 8-week journey is a risk. A visible guarantee lowers it, and the EU withdrawal rules must be met anyway.', evidence: 'Maven refunds in full to the midpoint and shows it as a badge. A refund returns both shares, so the creator must agree to it.', sources: ['maven-guarantee', 'maven-refunds', 'round-1'], priority: 'Now', effort: 'backend', endpoints: ['POST /orders/{id}/withdrawal', 'POST /admin/orders/{id}/refunds'], metric: 'Refunds under 10% (the pilot number)', trust: true, top: 3 },
  { id: 'real-quotes', channel: 'creator', title: 'Quotes from real participants only, with consent and date', user: 'Aurelia staff', problem: 'Invented quotes and numbers would break trust and the law. The spec’s “+85.7% sleep” is mock data.', evidence: 'The US fake-reviews rule fines each fake or AI-made testimonial. Until the pilot, the page shows none.', sources: ['ftc-reviews', 'bbb-influencer', 'owner-retreat'], priority: 'Now', effort: 'frontend', endpoints: [], metric: 'Invented quotes or results on any page: zero', trust: true },
  { id: 'claims-check', channel: 'creator', title: 'What a creator may say: a checklist in onboarding', user: 'creator', problem: 'A creator’s post can make Aurelia a medical device by implying it treats something.', evidence: 'Round 1: under UK guidance, social posts implying the app reduces depression can do it.', sources: ['round-1'], priority: 'Now', effort: 'frontend', endpoints: [], metric: 'Every pilot creator signs it before their first post', trust: true },
  { id: 'creator-dashboard', channel: 'creator', title: 'Creator dashboard: totals only, groups of 10 or more', user: 'creator', problem: 'Creators need to see their journey work. They must never see one person’s feelings.', evidence: 'Kajabi and Teachable show revenue, active members, completion and drop-off. Round 1: aggregate only, minimum group sizes.', sources: ['kajabi-analytics', 'teachable-reports', 'round-1'], priority: 'Now', effort: 'backend', endpoints: ['GET /creator/retreats', 'GET /creator/cohorts/{id}/metrics'], metric: 'Creators who open it weekly; no screen shows a group under 10' },
  { id: 'payouts', channel: 'creator', title: 'Payouts and the split, in plain view', user: 'creator', problem: 'Creators compare our 30% to Insight Timer’s 10% and Circle’s 2%. Hiding it costs trust.', evidence: 'Insight Timer Retreats: 10% fee. Community platforms: 0.5–2% plus card fees.', sources: ['it-retreats', 'circle-pricing', 'api-v2'], priority: 'Next', effort: 'backend', endpoints: ['POST /creator/connect/onboarding-link', 'GET /creator/payouts', 'GET /creator/split-rules'], metric: 'Payout questions to staff per creator per month' },
  { id: 'live-calendar', channel: 'creator', title: 'The live group sessions in the calendar', user: 'participant', problem: 'The live group is part of what the creator sells; people miss it without a reminder.', evidence: 'The business owner’s mock-up: weekly live meditations with the creator. The app already makes calendar reminders.', sources: ['owner-retreat'], priority: 'Next', effort: 'frontend', endpoints: [], metric: 'Participants at the week-1 live session' },
  { id: 'plus-share', channel: 'creator', title: 'The creator earns a share of the paid plans they bring', user: 'creator', problem: 'With the ticket later, creators earn less up front; the paid-plan share keeps them selling.', evidence: 'Round 1: 70/30 plus a share of the paid plan was the answer to “why not Kajabi?”.', sources: ['round-1', 'api-v2'], priority: 'Later', effort: 'backend', endpoints: ['PUT /admin/split-rules/{id}'], metric: 'Paid plans per creator, 90 days after the journey' },

  // Team plan
  { id: 'ask-employer', channel: 'employer', title: '“Ask my employer to pay”: a one-page request to forward', user: 'participant', problem: 'Many would use it if work paid, but nobody asks HR.', evidence: 'Test 6: 21 of 60 named their employer paying as a reason to buy; only 4 heard of Aurelia through work.', sources: ['buyer-v6'], priority: 'Now', effort: 'frontend', endpoints: [], metric: 'Requests sent, and teams that buy from one' },
  { id: 'team-buy', channel: 'employer', title: 'Buy 5–200 seats online with a card', user: 'employer admin', problem: 'Small employers will not sit through a sales process.', evidence: 'Wysa: $50 a seat a year up to 200 people. Calm: 5–300 seats, discounted with size. Vendr: median Calm buyer about $7,880 a year.', sources: ['wysa-teams', 'calm-teams', 'vendr-calm'], priority: 'Next', effort: 'new-backend', endpoints: [], metric: 'Teams bought without a call' },
  { id: 'team-link', channel: 'employer', title: 'One invite link or a code per person', user: 'employer admin', problem: 'Seats bought are worthless if nobody joins.', evidence: 'Headspace: one enrolment link. Wysa: a unique code per person. Round 1: only 38% of enrolled staff used any tool.', sources: ['headspace-smb', 'wysa-teams', 'round-1'], priority: 'Next', effort: 'new-backend', endpoints: [], metric: 'Seats activated in 30 days (judgement: above 38%)' },
  { id: 'team-report', channel: 'employer', title: 'Team report: joined, active, back after 30 days', user: 'employer admin', problem: 'Employers renew on proof of use. The law bans inferring staff emotions at work.', evidence: 'WTW: buyers want outcomes. EU AI Act: no emotion inference at work, so counts only, groups of 10 or more.', sources: ['wtw-2026', 'round-1'], priority: 'Next', effort: 'new-backend', endpoints: [], metric: 'Teams that renew at month 12' },
  { id: 'eap-indonesia', channel: 'employer', title: 'An Indonesian team pack beside the company’s assistance programme', user: 'employer admin', problem: 'Half of Indonesian employers already have a programme; Aurelia must fit beside it, not replace it.', evidence: 'Mercer Marsh 2025: 48% include an employee assistance programme. Market estimates differ by 2×.', sources: ['mmb-indonesia', 'imarc-indonesia'], priority: 'Later', effort: 'new-backend', endpoints: [], metric: 'Indonesian teams signed' },

  // Codes and gifts
  { id: 'codes', channel: 'partner', title: 'One code system: gift, partner trial, team seat', user: 'Aurelia staff', problem: 'Three channels need codes; building three systems wastes the backend.', evidence: 'Headspace runs gifts, promos and partner vouchers through one code page. API v2 has no code endpoints yet.', sources: ['headspace-gift', 'api-v2'], priority: 'Next', effort: 'new-backend', endpoints: [], metric: 'Codes redeemed; redeemers with their own card on file at day 30' },
  { id: 'gift', channel: 'partner', title: 'Gift a creator’s journey', user: 'participant', problem: 'A journey makes a natural gift, and the gift buyer pays the reach.', evidence: 'Round 1: gifting scored highest because the receiver keeps their own card after.', sources: ['round-1', 'headspace-gift'], priority: 'Later', effort: 'new-backend', endpoints: [], metric: 'Gifts redeemed, and receivers who pay after' },
  { id: 'aftercare', channel: 'partner', title: 'Retreat aftercare: a retreat continues as a journey', user: 'creator', problem: 'In-person retreats end and nothing follows; Insight Timer does not fill this either.', evidence: 'Insight Timer Retreats: 10% fee, teacher-run, nothing after.', sources: ['it-retreats', 'it-round-3'], priority: 'Later', effort: 'backend', endpoints: ['POST /admin/retreats', 'POST /admin/retreats/{id}/cohorts'], metric: 'Retreat guests still active 8 weeks later' },

  // Staff
  { id: 'scoreboard', channel: 'creator', title: 'The pilot scoreboard in the admin, on real numbers', user: 'Aurelia staff', problem: 'The gates need real numbers, not the simulated ones.', evidence: 'Round 1 plan: five pilot numbers set in advance; API v2 has cohort metrics for staff.', sources: ['round-1', 'api-v2'], priority: 'Next', effort: 'backend', endpoints: ['GET /admin/cohorts/{id}/metrics', 'GET /admin/outcomes/journeys'], metric: 'All five pilot numbers shown weekly from real data' },
]

export const PRIORITIES: Priority[] = ['Now', 'Next', 'Later']
export const CHANNEL_ORDER: ChannelId[] = ['free', 'creator', 'employer', 'partner']

export const featuresBy = (channel: ChannelId | 'all', priority: Priority | 'all') =>
  FEATURES.filter((f) => (channel === 'all' || f.channel === channel) && (priority === 'all' || f.priority === priority))

export const topFeatures = () => FEATURES.filter((f) => f.top).sort((a, b) => (a.top ?? 9) - (b.top ?? 9))

/** Every source a feature or channel cites, in registry order: the page’s “Sources used”. */
export function citedSources(): B2b2cSource[] {
  const used = new Set([...FEATURES.flatMap((f) => f.sources), ...CHANNELS.flatMap((c) => c.sources), ...MOVED_DOWN.flatMap((m) => m.sources)])
  return B2B2C_SOURCES.filter((s) => used.has(s.id))
}

/* ------------------------------------------------------------ The plan */

export interface Phase {
  id: string
  name: string
  when: string
  build: string[]
  gate: string
}

export const PHASES: Phase[] = [
  { id: 'p0', name: 'Phase 0: prove the offer', when: 'Now, no backend', build: ['data-line', 'real-quotes', 'claims-check', 'ask-employer'], gate: 'Gate 0: a buyer test of the creator journey with a free first week beats the free app among followers, and at least 3 creators agree to the terms.' },
  { id: 'p1', name: 'Phase 1: the creator pilot', when: 'After the minimum backend', build: ['free-week', 'help-now', 'voice-sample', 'pay-after-week', 'refund-window', 'creator-dashboard'], gate: 'Gate 1: the five pilot numbers, with “paid after the free week” in place of “seats sold”.' },
  { id: 'p1b', name: 'Phase 1b: the team plan, beside it', when: 'Same time, 2–3 small employers', build: ['codes', 'team-buy', 'team-link', 'team-report'], gate: 'Seats activated in 30 days above 38%, and at least one team buys without a call.' },
  { id: 'p2', name: 'Phase 2: repeat', when: 'Gate 1 passed', build: ['payouts', 'live-calendar', 'scoreboard'], gate: 'Gate 2: the numbers hold across creators, not only the best one.' },
  { id: 'p3', name: 'Phase 3: widen', when: 'Gate 2 passed', build: ['plus-share', 'gift', 'aftercare', 'local-price', 'eap-indonesia'], gate: 'Indonesia and gifting only with retention data to show.' },
]

/* ------------------------------------------------------------ Summary */

export const WIKI_ROUND_2 = '/wiki/b2b2c/round-2'
export const WIKI_FEATURES = '/wiki/b2b2c/features'

export function b2b2cSummary(): ReportSummary {
  const x6 = v6Tallies()
  const x7 = v7Tallies()
  const best = CHANNELS[0]
  const top = topFeatures()
  const now = featuresBy('all', 'Now').length
  return {
    intro: 'Which partner to sell Aurelia through first, a creator, an employer or a gift, and what we must build for it.',
    goal: 'Helps the business owner choose which partner channel to build first and which features it needs.',
    detail: { to: WIKI_ROUND_2, label: 'Round 2 on the wiki' },
    question: 'Which partner channel do we build first, and what does it need?',
    headline: `Build the creator journey first, but free for the first week: people pay after it has helped, not before. Next, a self-serve team plan, because many people want their employer to pay. ${now} features are needed now; most need the backend.`,
    status: 'not-measured',
    statusNote: 'No real creator or employer has tried it yet',
    sure: 'The ranking rests on public research and on tests with {{simulated|simulated people}}. Nothing here is measured on real buyers yet.',
    tiles: [
      { label: 'Best channel', value: best.short, badge: 'estimate', note: `Scored ${best.score18 + best.sim} of 21. Free first week, then the creator’s journey or the {{paid-plan|paid plan}}.` },
      { label: 'Top 3 features', value: top.map((f, i) => `${i + 1}. ${f.title.split(/[,:]/)[0]}`).join(' · '), badge: 'estimate', note: 'All three answer “can I trust this?”.' },
      { label: 'What the tests with {{simulated|simulated people}} say', value: `${x6.plus.A} vs ${x6.plus.B}`, badge: 'prediction', note: `Expected paying people: free app against the ticket paid up front, ${x6.A.n} people. ${x6.employerTrigger} of ${x6.A.n} would buy if work paid. Next test, ${x7.followers.n} creator followers: free app ${x7.followers.plusB}, ticket ${x7.followers.plusALT}.` },
      { label: 'How sure', value: 'Low to medium', badge: 'scenario', note: 'Public prices and benchmarks are firm. The ranking is our judgement; the tests are not real buyers.' },
    ],
    actions: [
      { text: 'Run the next buyer test on the creator journey with a free first week.', to: '#b2b2c-plan', linkLabel: 'The phased plan' },
      { text: 'Ask five creators: would you sell it free for a week, with a refund to week 4?', to: '#b2b2c-features', linkLabel: 'The feature board' },
      { text: 'Decide whether the team plan is built beside the pilot or after it.', to: '#b2b2c-channels', linkLabel: 'The channels compared' },
    ],
    confidence: {
      measured: 'Benchmarks across 115,000 apps (trial length, freemium conversion). Nothing about Aurelia.',
      predicted: `Two buyer tests with ${x6.A.n} and ${x7.A.n} {{simulated|simulated people}}.`,
      assumed: 'The scores, the priorities and the pilot thresholds are our judgement.',
    },
  }
}

/* ------------------------------------------------------------ How it works */

/**
 * The "How it works" diagrams on the report (and their twins in mermaid on
 * the wiki): the big picture, one journey per channel, before and after,
 * the phases. Labels and every number come from here; the numbers are
 * derived from the buyer tests, never typed twice. Diagram labels are plain
 * words (no glossary marks: SVG text cannot carry a tooltip); the drawer
 * text may carry `{{term|shown}}` marks.
 */

export interface DiagramBox {
  id: string
  title: string
  /** One short line under the title. */
  sub: string
  /** The drawer's plain explanation. May carry glossary marks. */
  explain: string
  /** Feature ids involved, shown with their endpoints in the drawer. */
  features: string[]
}

/** The numbers the diagrams show, all derived from buyer tests 6 and 7. */
export function howNumbers() {
  const x6 = v6Tallies()
  const x7 = v7Tallies()
  return {
    t6: {
      n: x6.A.n,
      freeTry: x6.A.tries.yes,
      freePlus: x6.plus.A,
      ticketTry: x6.B.tries.yes,
      ticketPlus: x6.plus.B,
      ticket39Plus: x6.plus.ALT,
      employer: x6.employerTrigger,
      trust: x6.themes.find(([t]) => t === 'trust')?.[1] ?? 0,
    },
    t7: {
      followers: x7.followers.n,
      freeTry: x7.followers.B.tries.yes,
      freeNot: x7.followers.n - x7.followers.B.tries.yes,
      freePayYes: x7.followers.B.pays.yes,
      freePayMaybe: x7.followers.B.pays.maybe,
      freePlus: x7.followers.plusB,
      ticketTry: x7.followers.ALT.tries.yes,
      ticketPlus: x7.followers.plusALT,
    },
  }
}

/** Unique API v2 endpoints of a set of features, in feature order. */
export const endpointsOf = (ids: string[]) => [...new Set(ids.flatMap((id) => FEATURES.find((f) => f.id === id)?.endpoints ?? []))]

/** Splits text into lines of at most `max` characters, on spaces. A longer word gets its own line. */
export function wrapWords(text: string, max: number): string[] {
  const lines: string[] = []
  let line = ''
  for (const w of text.split(/\s+/).filter(Boolean)) {
    if (line && line.length + 1 + w.length > max) {
      lines.push(line)
      line = w
    } else line = line ? `${line} ${w}` : w
  }
  if (line) lines.push(line)
  return lines
}

/** 1. The big picture: who has the people, what Aurelia adds, where the money goes. */
export function bigPicture(): { partners: DiagramBox[]; aurelia: DiagramBox; people: DiagramBox; paid: DiagramBox; money: DiagramBox; trust: DiagramBox } {
  const n = howNumbers()
  return {
    partners: [
      { id: 'creators', title: 'Creators', sub: 'Followers who trust them', explain: 'Wellness creators and retreat leaders. Their followers already trust them, so Aurelia does not have to buy that reach with ads. The creator records a journey in their own voice and sells it; they keep 70% of the ticket and, later, a share of the paid plans they bring.', features: ['voice-sample', 'claims-check', 'creator-dashboard', 'payouts', 'plus-share'] },
      { id: 'employers', title: 'Employers', sub: 'Staff, and a budget', explain: `Small employers buy seats for their staff online with a card, about $50 a seat a year at other apps. The person no longer pays, which is why ${n.t6.employer} of ${n.t6.n} {{simulated|simulated people}} said they would use it if work paid. The employer sees counts only, never one person’s feelings.`, features: ['ask-employer', 'team-buy', 'team-link', 'team-report'] },
      { id: 'partners', title: 'Partners, gift buyers', sub: 'Codes for their customers', explain: 'Hotels, brands and people buying a gift pay for a code. The person redeems it, gets a free period and then enters their own card, which is how the partner deals that lasted worked.', features: ['codes', 'gift'] },
    ],
    aurelia: { id: 'aurelia', title: 'Aurelia', sub: 'App, AI sessions, check-ins', explain: 'The app every channel lands in. Sessions are made by AI from the creator’s journey or from what the person says; short check-ins ask how they feel, and that shapes the next session. The free plan is the base: every channel starts there.', features: ['free-week', 'help-now', 'data-line', 'live-calendar'] },
    people: { id: 'people', title: 'People', sub: 'Followers, staff, gift receivers', explain: 'The person who uses the app: a creator’s follower, an employee with a seat, or someone who got a code or a gift. They start free and pay only after it has helped.', features: ['free-week', 'help-now', 'data-line', 'local-price'] },
    paid: { id: 'paid', title: 'Paid plan', sub: 'After it has helped', explain: 'What turns reach into a business: the {{paid-plan|paid plan}} (or the creator’s full journey) bought after the free week, or seats renewed by the employer.', features: ['pay-after-week', 'plus-share'] },
    money: { id: 'money', title: 'Money', sub: 'Ticket, seats, paid plan', explain: 'Money comes in three ways: a person pays for the creator’s journey or the paid plan after the free week; an employer pays for seats; a partner or gift buyer pays for codes. On a creator’s journey the split is 70% to the creator and 30% to Aurelia, and the creator also earns a share of the paid plans they bring.', features: ['pay-after-week', 'payouts', 'plus-share', 'team-buy', 'codes'] },
    trust: { id: 'trust', title: 'Trust', sub: 'Free week, voice, refund', explain: `Trust, not price, was the main objection (${n.t6.trust} mentions in a test of ${n.t6.n} {{simulated|simulated people}}). So people get a free first week with no card, hear a 60-second sample in the creator’s own voice before they start, and can get a full refund until week 4.`, features: ['free-week', 'voice-sample', 'refund-window', 'real-quotes'] },
  }
}

export type DropLabel = 'test' | 'measured' | 'judgement' | 'not tested'

export interface JourneyStep {
  id: string
  title: string
  /** What the person sees at this step. */
  sees: string
  /** Where people drop off here; `label` says what kind of number it is. */
  drop?: { text: string; label: DropLabel }
  explain: string
  features: string[]
}

export interface Journey {
  id: ChannelId
  title: string
  steps: JourneyStep[]
}

export const DROP_LABEL_TEXT: Record<DropLabel, string> = {
  test: 'From a test',
  measured: 'Measured elsewhere',
  judgement: 'Our judgement',
  'not tested': 'Not tested',
}

/** 2. One journey per channel, step by step, with where people drop off. */
export function journeys(): Journey[] {
  const n = howNumbers()
  const t7 = n.t7
  return [
    {
      id: 'creator',
      title: 'Creator journey, free first week',
      steps: [
        { id: 'c-post', title: 'Sees a post', sees: 'The creator’s post or story about the journey', drop: { text: 'Unknown: no share of followers who click is published', label: 'not tested' }, explain: 'It starts where the creator already is: a post, a story or a live stream. Aurelia does not pay for this reach. What the creator may say is set by a checklist they sign first.', features: ['claims-check'] },
        { id: 'c-page', title: 'Creator page', sees: 'The journey, a 60-second sample in their voice, the refund promise', explain: 'One page per creator. The sample in the creator’s own voice answers “is this really them?”, the top worry. The refund to week 4 is shown before anyone pays.', features: ['voice-sample', 'refund-window', 'real-quotes'] },
        { id: 'c-free', title: 'Free week', sees: 'The first week of the journey in the app, no card', drop: { text: `${t7.freeNot} of ${t7.followers} followers would not try the free app`, label: 'test' }, explain: `The first week is free with no card. In test 7, ${t7.freeTry} of ${t7.followers} creator followers would try the free app, the nearest thing to the free week that was tested; ${t7.freeNot} would not. These are {{simulated|simulated people}}.`, features: ['free-week', 'help-now', 'data-line'] },
        { id: 'c-check', title: 'Check-ins', sees: '“How do you feel now?” after each session', explain: 'A short question after each session. The answers shape the next session and become the person’s own record of progress. The creator sees totals for groups of 10 or more, never one person.', features: ['help-now', 'creator-dashboard'] },
        { id: 'c-pay', title: 'Pay after week 1', sees: 'The creator’s full journey, or the paid plan', drop: { text: `${t7.freePayYes} of ${t7.followers} would pay, ${t7.freePayMaybe} maybe`, label: 'test' }, explain: `After the first week has helped, the person chooses: the creator’s full journey or the {{paid-plan|paid plan}}. In test 7, ${t7.freePayYes} of ${t7.followers} creator followers ({{simulated|simulated people}}) said they would pay for the app and ${t7.freePayMaybe} maybe. The pilot asks for at least 15% of free-week starters to pay by day 10 (our judgement).`, features: ['pay-after-week', 'refund-window'] },
        { id: 'c-weeks', title: 'Weeks 2–8', sees: 'The journey, live group sessions in the calendar', drop: { text: 'The pilot needs at least 35% still active at week 8', label: 'judgement' }, explain: 'The rest of the journey, with the creator’s weekly live session in the calendar. Wellness apps lose most people in the first month, so the pilot needs at least 35% still active at week 8.', features: ['live-calendar', 'creator-dashboard', 'scoreboard'] },
        { id: 'c-grad', title: 'Graduation', sees: 'What changed, in their own words from the check-ins', explain: 'The journey ends with the person’s own check-ins played back: how they felt in week 1 and now. No invented results: only what they said.', features: ['real-quotes'] },
        { id: 'c-plus', title: 'Paid plan', sees: 'Keep going on the paid plan', drop: { text: 'The pilot needs at least 8% of starters on the paid plan', label: 'judgement' }, explain: 'After the journey, the {{paid-plan|paid plan}} keeps the sessions coming. The creator earns a share of each paid plan they bring, so they keep selling.', features: ['plus-share', 'pay-after-week'] },
      ],
    },
    {
      id: 'employer',
      title: 'Team plan',
      steps: [
        { id: 'e-sign', title: 'HR signs up', sees: 'Buy 5–200 seats online with a card, no sales call', drop: { text: `${n.t6.employer} of ${n.t6.n} would use it if work paid`, label: 'test' }, explain: `A small employer buys seats online. Many people would use Aurelia if work paid (${n.t6.employer} of ${n.t6.n} {{simulated|simulated people}} in test 6), but nobody asks HR, so the app gives them a one-page request to forward.`, features: ['ask-employer', 'team-buy'] },
        { id: 'e-invite', title: 'Invite link', sees: 'One link to share, or a code per person', explain: 'HR shares one link with the team, or gives each person a code. The same code system serves gifts and partners later.', features: ['team-link', 'codes'] },
        { id: 'e-start', title: 'Staff start', sees: 'Their own sessions and check-ins, free to them', drop: { text: 'Elsewhere only 38% of enrolled staff used any tool', label: 'measured' }, explain: 'Seats are worthless if nobody joins. In one measured study only 38% of enrolled staff used any digital tool, so the pilot needs more than that in 30 days.', features: ['team-link', 'free-week', 'help-now', 'data-line'] },
        { id: 'e-report', title: 'Team report', sees: 'Joined, active, back after 30 days, for groups of 10 or more', explain: 'The employer sees counts only: how many joined, are active and came back. Never feelings, and never a group under 10; the EU bans inferring staff emotions at work.', features: ['team-report'] },
        { id: 'e-renew', title: 'Renewal', sees: 'Renew the seats for another year', drop: { text: 'Teams that renew at month 12: not tested yet', label: 'not tested' }, explain: 'Employers renew on proof of use, not on promises. The team report is that proof.', features: ['team-report', 'team-buy'] },
      ],
    },
    {
      id: 'partner',
      title: 'Codes and gifts',
      steps: [
        { id: 'p-buy', title: 'Partner or gift buyer', sees: 'A hotel, a brand or a friend buys a code', explain: 'Someone else pays for the reach: a partner for its customers, or a person buying a gift.', features: ['codes', 'gift'] },
        { id: 'p-code', title: 'Code', sees: 'A code in an email, a card or a booking', explain: 'One code system for gifts, partner trials and team seats, built once.', features: ['codes'] },
        { id: 'p-redeem', title: 'Redeem', sees: 'One page: enter the code, start', drop: { text: 'How many redeem: not tested yet', label: 'not tested' }, explain: 'One page to redeem any code. A code cannot be stacked on a live subscription.', features: ['codes'] },
        { id: 'p-free', title: 'Free period', sees: 'The app or the creator’s journey, free for a while', explain: 'The receiver uses the app free for the period the code gives.', features: ['free-week', 'help-now', 'data-line'] },
        { id: 'p-card', title: 'Card on file', sees: 'Add your own card to keep going', drop: { text: 'Redeemers with a card at day 30: not tested yet', label: 'not tested' }, explain: 'The deals that lasted were the ones where the person enters their own card after the free period.', features: ['codes'] },
        { id: 'p-plus', title: 'Paid plan', sees: 'The paid plan on their own card', explain: 'The receiver pays for the {{paid-plan|paid plan}} themselves.', features: ['pay-after-week', 'gift'] },
      ],
    },
  ]
}

/** 3. Before and after: round 1’s ticket up front against round 2’s free first week. */
export function beforeAfter(): { before: BeforeAfterSide; after: BeforeAfterSide } {
  const n = howNumbers()
  return {
    before: {
      id: 'before',
      title: 'Ticket paid up front',
      sub: 'Round 1: pay €19.99, then try',
      rows: [
        { value: `${n.t6.ticketTry}`, label: `of ${n.t6.n} would buy the ticket` },
        { value: `${n.t6.ticketPlus}`, label: `expected to pay, of ${n.t6.n}` },
        { value: `${n.t7.ticketPlus}`, label: `expected to pay, of ${n.t7.followers} followers` },
      ],
      explain: `Round 1’s plan: a €19.99 ticket for the creator’s 8-week journey, paid before anything has helped. In test 6, ${n.t6.ticketTry} of ${n.t6.n} {{simulated|simulated people}} would buy it and about ${n.t6.ticketPlus} would end on the {{paid-plan|paid plan}} (${n.t6.ticket39Plus} at €39). Trust was the top objection (${n.t6.trust} mentions). Among ${n.t7.followers} creator followers in test 7, ${n.t7.ticketTry} would buy the ticket.`,
      features: [],
    },
    after: {
      id: 'after',
      title: 'Free first week, then pay',
      sub: 'Round 2: try free, pay once it helped',
      rows: [
        { value: `${n.t6.freeTry}`, label: `of ${n.t6.n} would try the free app` },
        { value: `${n.t6.freePlus}`, label: `expected to pay, of ${n.t6.n}` },
        { value: `${n.t7.freePlus}`, label: `expected to pay, of ${n.t7.followers} followers` },
      ],
      explain: `Round 2’s plan: the first week free with no card, then the creator’s journey or the {{paid-plan|paid plan}}. The free week itself is not tested yet; the free app is the nearest thing that was. In test 6, ${n.t6.freeTry} of ${n.t6.n} {{simulated|simulated people}} would try it and about ${n.t6.freePlus} would pay; among ${n.t7.followers} creator followers in test 7, ${n.t7.freeTry} would try it. Across 115,000 apps, trials of 17–32 days turn 42.5% into payers, against 25.5% for trials under 4 days.`,
      features: ['free-week', 'voice-sample', 'pay-after-week', 'refund-window'],
    },
  }
}

export interface BeforeAfterSide {
  id: string
  title: string
  sub: string
  rows: { value: string; label: string }[]
  explain: string
  features: string[]
}

/** Short feature name for a diagram: the title up to its first comma or colon, quotes dropped. */
export const shortTitle = (id: string) => (FEATURES.find((f) => f.id === id)?.title ?? id).split(/[,:]/)[0].replace(/[“”]/g, '').trim()
