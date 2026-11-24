# Unit economics
*Part of the [B2B2C research](/wiki/b2b2c). Sources: 30, from the notes in `docs/research/research_notes/Aurelia B2B2C models and plan/`.*

This page collects the conversion, retention, price, fee, AI-cost and acquisition benchmarks behind Aurelia's B2B2C channels. It then works through the €19.99 Retreat-in-a-Box ticket and a per-100-buyers funnel. Research was collected on 2026-11-23. "H&F" means the Health & Fitness app-store category, where RevenueCat and Adapty put meditation apps; neither publishes a meditation-only cut.

Labels used on this page: **(measured)** is a peer-reviewed or large-dataset measurement. **(company terms)** is a published price or fee. **(company claim)** is a company's own figure, not audited. **(third-party)** is a vendor blog, comparison site or calculator. **(estimate)** is our own arithmetic or assumption. Every number in the two models below is either sourced or marked "estimate".

## In one minute

- **Aurelia keeps about €6.45 of a €19.99 web ticket before AI cost** (estimate: 20% VAT, Stripe EEA fees, 60/40 split on the net). Sold in-app at a 15% store fee it is about €5.66. If the 60% is paid on the gross price, it is about €4.13.
- **AI cost decides whether the ticket makes money.** 24 personalised sessions cost about $2.40–13.20 per buyer (estimate). At the premium end Aurelia loses money on every ticket. A shared, pre-generated creator script costs close to nothing.
- **Plus conversion per ticket buyer is far below 30%.** Per 100 buyers: about 3 Plus subscribers in the low case, 10.5 in the middle case and 23 in the spec case (estimate). The spec's 30% is per graduate, and the spec assumes 76.5% graduate.
- **The retreat's real value is cheap acquisition.** Paid ads cost about $100–170 in media per paying subscriber at median conversion (estimate). In the retreat the creator brings the buyer, and the ticket covers the AI cost.
- **A physical box loses €10–25 per ticket** at a €19.99 price (estimate). Keep it digital or sell it separately.
- **Plus at $100 a year is priced at the top of the category,** level with Waking Up and well above Calm and Headspace.

## Conversion: install to trial to paid

| Measure (H&F unless stated) | Figure | Date | Label | Source |
| --- | --- | --- | --- | --- |
| Download → trial (day 30), median | 6.9% (top performers above 23%) | 2025 data, published 2026 | measured (115k+ apps) | [RevenueCat 2026][rc26] |
| Trial → paid, median | 37.7% (top quartile above 51.4%) | 2025 data | measured | [RevenueCat 2026][rc26] |
| Download → paid (day 35), median | 2.9% (top quartile above 6.2%) | 2025 data | measured | [RevenueCat 2026][rc26] |
| Download → paid, all categories: hard paywall vs freemium | 10.7% vs 2.1% | 2025 data | measured | [RevenueCat 2026][rc26] |
| Trial → paid by trial length, all categories | 25.5% (≤4 days), 37.4% (5–9 days), 42.5% (17–32 days) | 2025 data | measured, cross-sectional | [RevenueCat 2026][rc26] |
| Trial → paid, North America vs India/SEA | 34.2% vs 15.2% | 2025 data | measured | [RevenueCat 2026][rc26] |
| Trial → paid, prior year | 39.9% median, 68.3% top decile | 2024 data | measured (about 75k apps) | [RevenueCat 2025][rc25] |
| Install → trial; trial → paid (weekly plans) | 9.5%; 42.2% | Published 2026-03-27 | measured (16k+ apps) | [Adapty H&F][adapty-hf] |
| Trial → paid after a 7-, 14- or 30-day trial, one app | 15.36%, 14.96%, 14.67% | 2023 | measured (randomised, n=337,724; original paper not opened) | [Adapty on trial conversion][adapty-trial] |

For a freemium app like Aurelia, the honest planning base is **2–3% of installs paying by day 35** (estimate, from the H&F median of 2.9%). Trial-to-paid rates of 37–42% apply only to the 7–10% of installs who start a trial.

The long-trial advantage is cross-sectional, and the randomised test found no length effect. **An 8-week retreat should not be modelled as a long trial with 42% conversion** (estimate).

## Retention and renewal

| Measure | Figure | Date | Label | Source |
| --- | --- | --- | --- | --- |
| Mental-health apps, median day-15 / day-30 retention | 3.9% / 3.3% | 2019 | measured (93 apps) | [Baumel et al., JMIR][baumel] |
| Mindfulness/meditation apps, median day-30 retention | 4.7% | 2019 | measured | [Baumel et al., JMIR][baumel] |
| Paying subscribers still active after year 1: yearly / monthly / weekly plans | 44.1% / 17.0% / 3.4% | 2024 data | measured | [RevenueCat 2025][rc25] |
| H&F refund rate | 4.71% | 2024 data | measured | [RevenueCat 2025][rc25] |
| AI-powered apps vs others | 41% more revenue per payer, churn 30% faster | 2025 data | measured | [RevenueCat 2026][rc26] |
| Renewal retention, all categories: 1st / 2nd / 3rd | 59.2% / 45.1% / 37.1% | 2026 | measured | [Adapty H&F][adapty-hf] |
| Monthly subscriptions active after a year | 17% | 2026 | measured | [Adapty SOIS 2026][adapty-sois] |

If 17% of monthly subscribers last 12 months, average monthly churn is about **14%** (estimate). For Plus annual, plan on **44–59% renewal after year 1**, or about 1.8–2.0 paid years per annual payer (estimate).

## Prices in the category

| App | Annual | Monthly | Date | Label | Source |
| --- | --- | --- | --- | --- | --- |
| H&F median | $39.94 | $9.99 | 2025 data | measured | [RevenueCat 2026][rc26] |
| Headspace | $69.99 | $12.99 | 2025–2026 | third-party | [Breethe comparison][breethe] |
| Calm | $69.99–79.99 | $14.99–16.99 (sources disagree) | 2026 | third-party | [Carepaths][carepaths] |
| Insight Timer MemberPlus | About $59.99 | $9.99 | 2024; current | third-party; company | [Breethe 2024][breethe24]; [Insight Timer support][it-price] |
| Waking Up | About $99.99 (App Store); $129.99 (web, 2024) | — | Current; 2024 | company listing; third-party | [App Store][wakingup]; [Breethe 2024][breethe24] |
| Balance | About $69.99 | — | 2024 | third-party | [Breethe 2024][breethe24] |
| **Aurelia Plus** | **$100** | **$10** | — | — | — |

Annual plans are 68% of H&F subscriptions sold and 59% of revenue (measured, [RevenueCat 2026][rc26]; the same report also calls H&F "monthly-heavy", an internal inconsistency). Year-1 realised revenue per yearly payer is $35.64 median (measured, [RevenueCat 2026][rc26]).

Regional prices differ by more than four times: Adapty's H&F weekly price index is 1.3 for the UK, France and Germany and 0.3 for India (measured, 2026, [Adapty H&F][adapty-hf]). At $100, Plus is about 40–45% above Calm and Headspace and 2.5 times the H&F median annual price (estimate). The AI personalisation has to carry that premium.

## Fees and tax

| Item | Figure | Date | Label | Source |
| --- | --- | --- | --- | --- |
| Google Play, subscriptions | 15% (10% + 5% billing fee in AU, EEA, JP, UK, US on the first $1M) | Current | company terms | [Google Play help][gplay] |
| Apple Small Business Program | 15% | Since 2020 | third-party | [Computerworld][computerworld] |
| Apple standard in-app rate | 30% (as applied to Insight Timer donations) | 2026-04-22 | company terms | [Insight Timer help][it-earn] |
| US link-out to web checkout | Commission barred (2025-04-30); Ninth Circuit then allowed a "reasonable" commission, rate not yet set (2025-12-11) | 2025 | third-party | [TechCrunch][tc-apple]; [MacRumors][macrumors] |
| Web share of subscription app revenue | 3.2% global, 4.9% North America | 2025 data | measured | [RevenueCat 2026][rc26] |
| Stripe, standard EEA cards | 1.4% + €0.25 | Not verified on Stripe's own page | third-party calculator | [fee-calc][feecalc] |
| Stripe Indonesia | 2.9% + 30¢, plus 1–2% for currency conversion | Current | company terms | [Stripe Connect pricing][stripe] |
| Indonesia VAT on foreign digital services | Effective 11% (12% on a base of 11/12) | 2025 rule | government | [DJP][djp] |
| EU VAT | Buyer's national rate (17–27%; rates not fetched) | — | — | — |

## AI cost per session

| Input | Price | Date | Label | Source |
| --- | --- | --- | --- | --- |
| Anthropic Haiku 5.5, per million tokens in/out | $0.10 / $0.50 | Current | company terms | [Anthropic pricing][anthropic] |
| Anthropic Sonnet 5, per million tokens in/out | $2 / $10 | Current | company terms | [Anthropic pricing][anthropic] |
| OpenAI tts-1 / tts-1-hd, per million characters | $15 / $30 | Current | company terms | [OpenAI pricing][openai] |
| ElevenLabs fast / expressive voices, per 1,000 characters | $0.04 / $0.08 | October–November 2026 | third-party, not verified on elevenlabs.io | [Wireflow][wireflow] |

**Per 10-minute session (estimate).** A session script is about 5,500–7,000 characters, or about 1,500–2,000 output tokens, with about 3,000 input tokens of prompt. Silence between phrases is not billed.

| Tier | Script | Voice | Cost per session (estimate) |
| --- | --- | --- | --- |
| Budget | Haiku 5.5, about $0.001 | tts-1, about $0.10 | about **$0.10** |
| Middle | Sonnet 5, about $0.026 | tts-1, about $0.10 | about **$0.13** |
| Premium | Sonnet 5, about $0.026 | ElevenLabs expressive, about $0.52 | about **$0.55** |
| Shared creator script | Written and voiced once per cohort | Same | about **$0 per buyer** (amortised) |

Music from a licensed stem library adds about $0 per session (estimate). A Plus user at 4 sessions a month costs $0.40–2.20; at 30 a month, $3–16.50 (estimate). Heavy users on premium voices lose money against about $7 of net monthly Plus revenue.

## Acquisition cost

| Measure | Figure | Date | Label | Source |
| --- | --- | --- | --- | --- |
| Average cost per install (CPI), all categories | $4.70 iOS, $3.70 Android; H&F $3–6; fully loaded CAC 2–3× CPI | 2025 | third-party (vendor blog) | [Adapty CAC guide][adapty-cac] |
| Fitness and wellness CPI | TikTok $1.50–3.50, Meta $2.50–5.00 | 2026 | third-party (vendor benchmark) | [Semnexus 2026][semnexus] |
| Cheap installs vs retained installs | TikTok $2.60 with 22% day-30 retention vs YouTube $5.80 with 47% | 2026 | third-party case study | [Semnexus TikTok vs Meta][semnexus-tvm] |

Paid media per paying subscriber ≈ $3–5 CPI ÷ 2.9% install-to-paid ≈ **$100–170**, or about $200–400 fully loaded (estimate). That is far above the $35.64 median year-1 revenue per yearly payer. Paid acquisition at median conversion does not pay back, which is the case for creator-led distribution. No credible influencer-versus-paid-ads CAC benchmark was found.

## Model 1: one €19.99 retreat ticket

Every input, with its source:

| Input | Value | Source or status |
| --- | --- | --- |
| Ticket price | €19.99, VAT-inclusive | Spec |
| VAT | 20% | Estimate (EU rates run 17–27%; not fetched) |
| Card fee, web | 1.4% + €0.25 | [fee-calc][feecalc] (third-party) |
| Store fee, in-app | 15% (small developers, subscriptions) or 30% (Apple standard) | [Google Play help][gplay]; [Computerworld][computerworld]; [Insight Timer help][it-earn] |
| Split | 60% creator / 40% Aurelia, applied to the net after VAT and fees | Spec; "net" is our assumption, the spec does not say |
| Sessions per buyer | 24 (3 a week × 8 weeks) | Estimate |
| AI cost per session | $0 / $0.10 / $0.13 / $0.55 | Estimate from the AI table above |
| Exchange rate | $1 = €1 | Estimate, a simplification; it slightly overstates the euro cost of AI |
| Physical box | $14–28 (product $5–10 plus fulfilment $9–18, US figures) | Estimate from [FreightWaves][freightwaves] and [Fulfyld][fulfyld] |

### Web sale, split on net

| Line | € per ticket |
| --- | --- |
| Ticket price | 19.99 |
| VAT at 20% (19.99 ÷ 1.2) | −3.33 |
| Stripe EEA fee (1.4% + €0.25) | −0.53 |
| **Net to split** | **16.13** |
| Creator 60% | −9.68 |
| **Aurelia 40%, before AI** | **6.45** |
| AI, shared creator script (about $0) | 6.45 |
| AI, budget tier (24 × $0.10 = $2.40) | 4.05 |
| AI, middle tier (24 × $0.13 ≈ $3.02) | 3.43 |
| AI, premium tier (24 × $0.55 = $13.20) | −6.75 |
| Optional physical box paid by Aurelia, middle AI ($14–28) | −10.57 to −24.57 |

VAT sensitivity (estimate): at 17% VAT Aurelia's pre-AI share is €6.62; at 27% it is €6.08. With a card fee of about 3% + €0.30 instead, it is €6.30.

### Aurelia's share by channel and AI tier (€ per ticket, estimate)

| Channel | Before AI | Shared script | Budget | Middle | Premium |
| --- | --- | --- | --- | --- | --- |
| Web, split on net | 6.45 | 6.45 | 4.05 | 3.43 | −6.75 |
| Web, creator paid 60% of gross (€11.99) | 4.13 | 4.13 | 1.73 | 1.11 | −9.07 |
| In-app, 15% store fee | 5.66 | 5.66 | 3.26 | 2.64 | −7.54 |
| In-app, 30% store fee | 4.66 | 4.66 | 2.26 | 1.64 | −8.54 |

The creator's share is €9.68 on the web, €8.50 in-app at 15% and €7.00 at 30%. A full cohort of 200 web tickets pays the creator about €1,936 (estimate). See [Creators and cohorts](/wiki/b2b2c/creators).

Refunds are not in this table. With a Maven-style refund until the halfway point ([Maven guidebook][maven]), budget 5–10% of tickets refunded (estimate, from weak third-party rates of 2–10%, [Communipass][communipass]).

## Model 2: per 100 ticket buyers

"Graduate" means still active at week 8. Plus conversion is shown per graduate and per buyer.

| Input | Low | Middle | Spec | Source or status |
| --- | --- | --- | --- | --- |
| Active at week 8 | 20% | 35% | 76.5% | Low and middle: estimate, from the 20–50% planning range on [Creators and cohorts](/wiki/b2b2c/creators), set between measured self-paced (4–13%) and fee-paying (about 60%) completion ([IRRODL 2019][irrodl]). Spec: company claim, origin unknown |
| Graduate → Plus | 15% | 30% | 30% | Spec value 30%; low is a sensitivity case (estimate). For reference, H&F trial-to-paid is 37.7% ([RevenueCat 2026][rc26]) |
| Refunds | 10% | 7.5% | 5% | Estimate (5–10% placeholder) |
| Aurelia ticket net | €6.45 | €6.45 | €6.45 | Model 1, web, split on net |
| AI cost per buyer | $3.02 | $3.02 | $3.02 | Model 1, middle tier; assumes every buyer generates all 24 sessions, an upper bound |
| Plus net revenue, year 1, annual plan | $70.83 | $70.83 | $70.83 | Estimate: $100 ÷ 1.2 VAT × 0.85 after a 15% store fee |

| Per 100 buyers | Low | Middle | Spec |
| --- | --- | --- | --- |
| Buyers | 100 | 100 | 100 |
| Week-8 graduates | 20 | 35 | 76.5 |
| **Plus subscribers** | **3** | **10.5** | **23** (22.95) |
| **Plus conversion per buyer** | **3%** | **10.5%** | **23%** |
| Plus conversion per graduate | 15% | 30% | 30% |
| Aurelia ticket net after refunds | €581 | €597 | €613 |
| AI cost (100 × $3.02, at $1 = €1) | −€302 | −€302 | −€302 |
| **Aurelia ticket margin after AI** | **€278** | **€294** | **€310** |
| Plus net revenue, year 1, if all choose annual | $212 | $744 | $1,626 |
| AI cost per Plus subscriber, covered by the ticket | About $101 | About $29 | About $13 |

All figures in this table are estimates built from the inputs above.

**At full scale** (50 creators × 200 = 10,000 buyers, which assumes every cohort fills, unlikely): 300, 1,050 or 2,295 Plus subscribers, and a ticket margin after AI of about €27,800–31,000 (estimate).

What the funnel shows:

- **The spec's headline is per graduate.** Per buyer it is 23%, and only if 76.5% graduate. The middle case is less than half of that.
- **The ticket margin barely moves between scenarios** (€278–310). Plus conversion is what changes the outcome.
- **Even the low case acquires Plus subscribers at no media cost,** because the ticket margin covers the AI. That compares with about $100–170 of media per paying subscriber from paid ads (estimate).
- **Plus AI cost after the retreat is not deducted here.** At 4 sessions a month it is about $5–26 a year per subscriber (estimate).
- **The premium voice tier turns every case negative** on the ticket: −€6.75 per buyer, or about −€710 to −€740 per 100 buyers after refunds (100 × $13.20 of AI against €581–613 of ticket net), before any Plus revenue.

## What this means for Aurelia

- **Choose the voice tier per product, not once.** Retreats should use a shared creator script with short personalised inserts, or the budget tier. Premium voices make the ticket a loss.
- **Sell the ticket on the web where possible.** It keeps about €0.80 more per ticket than a 15% store sale and €1.80 more than a 30% one (estimate). Watch the outcome of the US link-out remand.
- **Write the split on the net.** Paying 60% of the gross costs Aurelia about €2.30 per ticket (estimate).
- **Report Plus conversion per buyer** in every deck, alongside per graduate. Use the middle case (about 10%) as the planning number until a pilot measures it.
- **Measure three numbers in the first pilot:** week-8 activity, Plus conversion per buyer, and AI cost per buyer. They decide the model more than the split does.
- **Keep the box digital,** or sell it as a separate add-on priced to cover $14–28 of cost plus margin.
- **Consider a higher ticket.** At €19.99 the ticket margin is a few euros; most of the value is the Plus conversion.
- Channel-specific costs: [Employers and insurers](/wiki/b2b2c/employers), [Partners](/wiki/b2b2c/partners). Claims that can be made about outcomes: [Claims and regulation](/wiki/b2b2c/regulation). Sequencing: [Plan](/wiki/b2b2c/plan).

## Gaps

- No meditation- or mental-health-specific conversion data from RevenueCat, Adapty or Sensor Tower.
- **No published conversion rate from a paid cohort, challenge or course to a subscription.** The 30% cannot be benchmarked directly.
- **No completion rate for paid multi-week digital wellness programmes.** The week-8 figures in Model 2 are estimates.
- No H&F-specific monthly churn figure; the 14% is derived.
- EU VAT rates by country not fetched. Stripe's EEA fee not verified on Stripe's own page. Apple's US link-out rate not yet set.
- No Google Cloud TTS prices, no audio-token rate for gpt-4o-mini-tts, no AI music API prices. ElevenLabs prices are third-party.
- No published data on how AI-native wellness apps control generation cost.
- No primary AppsFlyer, Adjust or Sensor Tower CPI report; no credible influencer CAC benchmark.
- No EU fulfilment benchmarks; box costs are US.
- **Before quoting:** state the VAT, fee, split-basis and AI-tier assumptions with any per-ticket figure; never quote 76.5% or the spec's 23% per buyer as measured.

## Sources

1. [RevenueCat: State of Subscription Apps 2026](https://www.revenuecat.com/state-of-subscription-apps)
2. [RevenueCat: State of Subscription Apps 2025](https://www.revenuecat.com/state-of-subscription-apps-2025)
3. [Adapty: Health and fitness app subscription benchmarks](https://adapty.io/blog/health-fitness-app-subscription-benchmarks/)
4. [Adapty: trial conversion rates for in-app subscriptions](https://adapty.io/blog/trial-conversion-rates-for-in-app-subscriptions/)
5. [Adapty: State of In-App Subscriptions 2026](https://adapty.io/state-of-in-app-subscriptions/)
6. [Baumel et al. 2019, JMIR: retention of mental-health apps](https://www.jmir.org/2019/9/e14567/)
7. [Breethe: price comparison with Calm and Headspace](https://breethe.com/sleep-and-meditation-app-guide/compare-evaluate/how-much-does-breethe-cost-compared-to-calm-and-headspace-a-real-world-price-breakdown)
8. [Carepaths: Calm vs Headspace 2026](https://carepaths.com/calm-app-vs-headspace/)
9. [Breethe: 2024 mindfulness app yearly price comparison](https://admin.breethe.com/sleep-and-meditation-app-guide/compare-evaluate/which-mindfulness-app-offers-the-best-yearly-value-a-2024-price-comparison)
10. [Insight Timer support: price](https://insight-timer.freshdesk.com/support/solutions/articles/67000664579-hoeveel-kost-insight-timer-)
11. [App Store: Waking Up](https://apps.apple.com/app/id1307736395)
12. [Google Play Console Help: service fees](https://support.google.com/googleplay/android-developer/answer/112622)
13. [Computerworld: Apple v. Epic](https://www.computerworld.com/article/3712224/apple-v-epic-the-still-unanswered-question.html)
14. [Insight Timer help: How can teachers earn revenue from their work](https://insight-timer.freshdesk.com/support/solutions/articles/67000664874-how-can-teachers-earn-revenue-from-their-work-)
15. [TechCrunch: Apple changes US App Store rules (2025-05-02)](https://techcrunch.com/2025/05/02/apple-changes-us-app-store-rules-to-let-apps-redirect-users-to-their-own-websites-for-payments)
16. [MacRumors: Apple fees on external payment links (2025-12-11)](https://www.macrumors.com/2025/12/11/apple-app-store-fees-external-payment-links/)
17. [fee-calc: Stripe fees](https://www.fee-calc.com/stripe-fees)
18. [Stripe Connect pricing](https://stripe.com/it-us/connect/pricing)
19. [DJP: Indonesia digital tax](https://pajak.go.id/en/digitaltax)
20. [Anthropic: pricing](https://platform.claude.com/docs/en/about-claude/pricing)
21. [OpenAI: API pricing](https://developers.openai.com/api/docs/pricing)
22. [Wireflow: ElevenLabs API pricing](https://www.wireflow.ai/blog/elevenlabs-api-pricing)
23. [Adapty: customer acquisition cost](https://adapty.io/blog/customer-acquisition-cost/)
24. [Semnexus: app user acquisition benchmarks by vertical 2026](https://semnexus.com/app-user-acquisition-benchmarks-by-vertical-2026)
25. [Semnexus: TikTok vs Meta app user acquisition 2026](https://semnexus.com/tiktok-vs-meta-app-user-acquisition-2026-performance-data)
26. [FreightWaves: subscription box fulfilment](https://www.freightwaves.com/checkpoint/best-subscription-box-fulfillment-services/)
27. [Fulfyld: wellness fulfilment benchmarks](https://www.fulfyld.com/data/wellness-healthcare-fulfillment-benchmarks/)
28. [Maven Instructor Policy Guidebook](https://help.maven.com/en/articles/12240853-maven-instructor-policy-guidebook)
29. [Communipass: online course refund rates](https://communipass.com/blog/online-course-refund-crisis-2026/)
30. [IRRODL 2019 (citing Ho et al. and Chuang & Ho)](https://www.erudit.org/fr/revues/irrodl/2019-v20-n3-irrodl04799/1062521ar.pdf)

[rc26]: https://www.revenuecat.com/state-of-subscription-apps
[rc25]: https://www.revenuecat.com/state-of-subscription-apps-2025
[adapty-hf]: https://adapty.io/blog/health-fitness-app-subscription-benchmarks/
[adapty-trial]: https://adapty.io/blog/trial-conversion-rates-for-in-app-subscriptions/
[adapty-sois]: https://adapty.io/state-of-in-app-subscriptions/
[baumel]: https://www.jmir.org/2019/9/e14567/
[breethe]: https://breethe.com/sleep-and-meditation-app-guide/compare-evaluate/how-much-does-breethe-cost-compared-to-calm-and-headspace-a-real-world-price-breakdown
[carepaths]: https://carepaths.com/calm-app-vs-headspace/
[breethe24]: https://admin.breethe.com/sleep-and-meditation-app-guide/compare-evaluate/which-mindfulness-app-offers-the-best-yearly-value-a-2024-price-comparison
[it-price]: https://insight-timer.freshdesk.com/support/solutions/articles/67000664579-hoeveel-kost-insight-timer-
[wakingup]: https://apps.apple.com/app/id1307736395
[gplay]: https://support.google.com/googleplay/android-developer/answer/112622
[computerworld]: https://www.computerworld.com/article/3712224/apple-v-epic-the-still-unanswered-question.html
[it-earn]: https://insight-timer.freshdesk.com/support/solutions/articles/67000664874-how-can-teachers-earn-revenue-from-their-work-
[tc-apple]: https://techcrunch.com/2025/05/02/apple-changes-us-app-store-rules-to-let-apps-redirect-users-to-their-own-websites-for-payments
[macrumors]: https://www.macrumors.com/2025/12/11/apple-app-store-fees-external-payment-links/
[feecalc]: https://www.fee-calc.com/stripe-fees
[stripe]: https://stripe.com/it-us/connect/pricing
[djp]: https://pajak.go.id/en/digitaltax
[anthropic]: https://platform.claude.com/docs/en/about-claude/pricing
[openai]: https://developers.openai.com/api/docs/pricing
[wireflow]: https://www.wireflow.ai/blog/elevenlabs-api-pricing
[adapty-cac]: https://adapty.io/blog/customer-acquisition-cost/
[semnexus]: https://semnexus.com/app-user-acquisition-benchmarks-by-vertical-2026
[semnexus-tvm]: https://semnexus.com/tiktok-vs-meta-app-user-acquisition-2026-performance-data
[freightwaves]: https://www.freightwaves.com/checkpoint/best-subscription-box-fulfillment-services/
[fulfyld]: https://www.fulfyld.com/data/wellness-healthcare-fulfillment-benchmarks/
[maven]: https://help.maven.com/en/articles/12240853-maven-instructor-policy-guidebook
[communipass]: https://communipass.com/blog/online-course-refund-crisis-2026/
[irrodl]: https://www.erudit.org/fr/revues/irrodl/2019-v20-n3-irrodl04799/1062521ar.pdf
