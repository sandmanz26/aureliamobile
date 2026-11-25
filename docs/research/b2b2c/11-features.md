# Features: what we must build

*Part of the [B2B2C research](/wiki/b2b2c), from [Round 2](/wiki/b2b2c/round-2). The same list is in the admin under Reports → B2B2C report, as a board you can filter by channel and priority; both are made from one data file, so they cannot disagree. Priorities and success numbers are our judgement, set before anything is built.*

## In one minute

- **The free plan is the base.** Every channel lands people in it, so its features come first: a free first week with no card, "Need help now?" on every feelings screen, and one plain line on data.
- **The top three features all answer "can I trust this?"**: (1) a free first week, (2) the creator's page with a 60-second sample in their own voice, (3) a full refund until week 4, said before paying.
- **Now** = needed for the creator pilot or doable today. **Next** = the team plan and what the pilot needs once it runs. **Later** = after Gate 2.
- **Effort** says whether it is frontend only, uses an endpoint already in [API v2](/wiki/api/apps), or needs a backend API v2 does not have yet (codes and teams). The team plan needs new endpoints; the creator pilot mostly does not.
- **Who uses it:** the creator, the participant, the employer admin, or Aurelia staff.

## How to read a row

| Column | Meaning |
| --- | --- |
| For | Who uses the feature |
| The problem it solves | In the user's terms |
| Evidence | What says it matters, with the source; simulated results are AI playing made-up people, not measurements |
| Priority | Now, Next or Later |
| Effort | Frontend only · Needs the backend (in API v2), with the endpoints · Needs new backend (not in API v2) |
| Success number | What we count to know it worked |

## Free plan (the base)

| Feature | For | The problem it solves | Evidence | Priority | Effort | Success number |
| --- | --- | --- | --- | --- | --- | --- |
| **A free first week of every journey, no card** *(trust)* *(top 1)* | participant | People will not pay before anything has helped. A ticket up front lost almost everyone in the simulations. | Test 6: free app 17.5 expected paid plans, the €19.99 ticket 1. Longer trials convert better: 42.5% for 17–32 days against 25.5% under 4 days. Sources: [Buyer agent test 6 (60 simulated people)](/admin/buyer-agent?v=6); [RevenueCat: subscription app benchmarks 2026](https://www.revenuecat.com/blog/growth/subscription-app-trends-benchmarks-2026) | Now | Needs the backend (in API v2): `POST /journeys`, `GET /me/entitlements` | Share of starters who reach day 7, and who then pay |
| **“Need help now?” on every feelings screen** *(trust)* | participant | A creator or employer cannot vouch for an AI that has no safety net. Crisis handling is required by law in some markets. | Round 1 regulation: California’s companion-AI law needs a crisis protocol. Test 7 kept the link; it moved nobody but it is a floor, not a feature. Sources: [B2B2C research, round 1](/wiki/b2b2c); [Buyer agent test 7 (100 simulated people)](/admin/buyer-agent?v=7) | Now | Needs the backend (in API v2): `GET /safety/resources`, `POST /safety/reports` | Shown on 100% of check-in and session screens; local numbers in every pilot country |
| **One plain line on what we keep and who sees it** *(trust)* | participant | Privacy is the first question of protective people, and no quick win answered it. | Test 7: 8 of 17 very protective people would try, and “what happens to my data” was still their first question. Sources: [Buyer agent test 7 (100 simulated people)](/admin/buyer-agent?v=7); [B2B2C research, round 1](/wiki/b2b2c) | Now | Frontend only | Privacy as an objection in the next buyer test, down from test 7 |
| **Bahasa Indonesia and a rupiah price** | participant | In Indonesia, language and a local price mattered more than any feature. | Test 7: Indonesian simulated people barely moved on quick wins; Bahasa and rupiah were their condition. Sources: [Buyer agent test 7 (100 simulated people)](/admin/buyer-agent?v=7); [Mercer Marsh Benefits: Indonesia health and benefits study 2025](https://www.marsh.com/id/en/services/employee-health-benefits/insights/id-indonesia-health-and-benefits-study-2025.html) | Later | Needs the backend (in API v2): `GET /plans` | Indonesian starters who pay, against the rest |

## Creator journey

| Feature | For | The problem it solves | Evidence | Priority | Effort | Success number |
| --- | --- | --- | --- | --- | --- | --- |
| **The creator’s page with a 60-second sample in their own voice** *(trust)* *(top 2)* | participant | Trust was the top objection to the retreat. Followers trust the creator, not an unknown AI app. | Test 6: trust was the top objection (25 mentions); the creator’s own voice moved 5 answers, more than any other change. 83% trust recommendations from people they know. Sources: [Buyer agent test 6 (60 simulated people)](/admin/buyer-agent?v=6); [Nielsen: global trust in advertising](https://www.nielsen.com/global-trust-in-advertising) | Now | Needs the backend (in API v2): `GET /creators/{handle}`, `GET /retreats/{id}` | Page visitors who start the free week |
| **Pay after week one: the creator’s journey or the paid plan** | participant | The ticket must come after the first help, not before it. | Tests 6 and 7: the ticket up front lost to the free app among creator followers both times. Sources: [Buyer agent test 6 (60 simulated people)](/admin/buyer-agent?v=6); [Buyer agent test 7 (100 simulated people)](/admin/buyer-agent?v=7); [Creator retreat funnel](/admin/business-funnel?view=retreat) | Now | Needs the backend (in API v2): `POST /checkout/tickets`, `POST /checkout/subscription` | Paid by day 10 among free-week starters (judgement: at least 15%) |
| **Full refund until week 4, said on the page before paying** *(trust)* *(top 3)* | participant | Paying for an 8-week journey is a risk. A visible guarantee lowers it, and the EU withdrawal rules must be met anyway. | Maven refunds in full to the midpoint and shows it as a badge. A refund returns both shares, so the creator must agree to it. Sources: [Maven satisfaction guarantee](https://help.maven.com/en/articles/8705540-maven-s-satisfaction-guarantee); [Maven: issuing refunds to students](https://help.maven.com/en/articles/5597391-issuing-refunds-to-students); [B2B2C research, round 1](/wiki/b2b2c) | Now | Needs the backend (in API v2): `POST /orders/{id}/withdrawal`, `POST /admin/orders/{id}/refunds` | Refunds under 10% (the pilot number) |
| **Quotes from real participants only, with consent and date** *(trust)* | Aurelia staff | Invented quotes and numbers would break trust and the law. The spec’s “+85.7% sleep” is mock data. | The US fake-reviews rule fines each fake or AI-made testimonial. Until the pilot, the page shows none. Sources: [FTC final rule banning fake reviews and testimonials](https://www.ftc.gov/news-events/news/press-releases/2024/08/federal-trade-commission-announces-final-rule-banning-fake-reviews-testimonials); [BBB National Programs: Influencer Trust Index 2025](https://bbbprograms.org/media/insights/blog/influencer-trust-index); [The business owner’s retreat brief and mock-up](/wiki/b2b2c/round-2) | Now | Frontend only | Invented quotes or results on any page: zero |
| **What a creator may say: a checklist in onboarding** *(trust)* | creator | A creator’s post can make Aurelia a medical device by implying it treats something. | Round 1: under UK guidance, social posts implying the app reduces depression can do it. Sources: [B2B2C research, round 1](/wiki/b2b2c) | Now | Frontend only | Every pilot creator signs it before their first post |
| **Creator dashboard: totals only, groups of 10 or more** | creator | Creators need to see their journey work. They must never see one person’s feelings. | Kajabi and Teachable show revenue, active members, completion and drop-off. Round 1: aggregate only, minimum group sizes. Sources: [Kajabi analytics](https://kajabi.com/features/analytics); [Teachable reporting tools](https://teachable.com/blog/new-teachable-reporting-tools-2024); [B2B2C research, round 1](/wiki/b2b2c) | Now | Needs the backend (in API v2): `GET /creator/retreats`, `GET /creator/cohorts/{id}/metrics` | Creators who open it weekly; no screen shows a group under 10 |
| **Payouts and the split, in plain view** | creator | Creators compare our 30% to Insight Timer’s 10% and Circle’s 2%. Hiding it costs trust. | Insight Timer Retreats: 10% fee. Community platforms: 0.5–2% plus card fees. Sources: [Insight Timer Retreats FAQ for teachers](https://insight-timer.freshdesk.com/support/solutions/articles/67000739470-insight-timer-retreats-faqs-for-teachers); [Circle pricing 2026 and transaction fees](https://schoolmaker.com/blog/circle-so-pricing); [API contract v2, the pilot slice](/wiki/api) | Next | Needs the backend (in API v2): `POST /creator/connect/onboarding-link`, `GET /creator/payouts`, `GET /creator/split-rules` | Payout questions to staff per creator per month |
| **The live group sessions in the calendar** | participant | The live group is part of what the creator sells; people miss it without a reminder. | The business owner’s mock-up: weekly live meditations with the creator. The app already makes calendar reminders. Sources: [The business owner’s retreat brief and mock-up](/wiki/b2b2c/round-2) | Next | Frontend only | Participants at the week-1 live session |
| **The creator earns a share of the paid plans they bring** | creator | With the ticket later, creators earn less up front; the paid-plan share keeps them selling. | Round 1: 70/30 plus a share of the paid plan was the answer to “why not Kajabi?”. Sources: [B2B2C research, round 1](/wiki/b2b2c); [API contract v2, the pilot slice](/wiki/api) | Later | Needs the backend (in API v2): `PUT /admin/split-rules/{id}` | Paid plans per creator, 90 days after the journey |
| **The pilot scoreboard in the admin, on real numbers** | Aurelia staff | The gates need real numbers, not the simulated ones. | Round 1 plan: five pilot numbers set in advance; API v2 has cohort metrics for staff. Sources: [B2B2C research, round 1](/wiki/b2b2c); [API contract v2, the pilot slice](/wiki/api) | Next | Needs the backend (in API v2): `GET /admin/cohorts/{id}/metrics`, `GET /admin/outcomes/journeys` | All five pilot numbers shown weekly from real data |

## Team plan

| Feature | For | The problem it solves | Evidence | Priority | Effort | Success number |
| --- | --- | --- | --- | --- | --- | --- |
| **“Ask my employer to pay”: a one-page request to forward** | participant | Many would use it if work paid, but nobody asks HR. | Test 6: 21 of 60 named their employer paying as a reason to buy; only 4 heard of Aurelia through work. Sources: [Buyer agent test 6 (60 simulated people)](/admin/buyer-agent?v=6) | Now | Frontend only | Requests sent, and teams that buy from one |
| **Buy 5–200 seats online with a card** | employer admin | Small employers will not sit through a sales process. | Wysa: $50 a seat a year up to 200 people. Calm: 5–300 seats, discounted with size. Vendr: median Calm buyer about $7,880 a year. Sources: [Wysa for Teams](https://wysa.com/for-teams); [Calm for Organizations, groups of 5–300](https://support.calm.com/hc/en-us/articles/360038432493); [Vendr: Calm buyer data](https://www.vendr.com/marketplace/calm) | Next | Needs new backend (not in API v2) | Teams bought without a call |
| **One invite link or a code per person** | employer admin | Seats bought are worthless if nobody joins. | Headspace: one enrolment link. Wysa: a unique code per person. Round 1: only 38% of enrolled staff used any tool. Sources: [Headspace for small business](https://organizations.headspace.com/small-business); [Wysa for Teams](https://wysa.com/for-teams); [B2B2C research, round 1](/wiki/b2b2c) | Next | Needs new backend (not in API v2) | Seats activated in 30 days (judgement: above 38%) |
| **Team report: joined, active, back after 30 days** | employer admin | Employers renew on proof of use. The law bans inferring staff emotions at work. | WTW: buyers want outcomes. EU AI Act: no emotion inference at work, so counts only, groups of 10 or more. Sources: [WTW: employee wellbeing enters a new phase](https://www.wtwco.com/en-us/insights/2026/10/employee-wellbeing-enters-its-next-chapter-smarter-investments-greater-impact); [B2B2C research, round 1](/wiki/b2b2c) | Next | Needs new backend (not in API v2) | Teams that renew at month 12 |
| **An Indonesian team pack beside the company’s assistance programme** | employer admin | Half of Indonesian employers already have a programme; Aurelia must fit beside it, not replace it. | Mercer Marsh 2025: 48% include an employee assistance programme. Market estimates differ by 2×. Sources: [Mercer Marsh Benefits: Indonesia health and benefits study 2025](https://www.marsh.com/id/en/services/employee-health-benefits/insights/id-indonesia-health-and-benefits-study-2025.html); [IMARC: Indonesia corporate wellness market](https://www.imarcgroup.com/indonesia-corporate-wellness-market) | Later | Needs new backend (not in API v2) | Indonesian teams signed |

## Codes and gifts

| Feature | For | The problem it solves | Evidence | Priority | Effort | Success number |
| --- | --- | --- | --- | --- | --- | --- |
| **One code system: gift, partner trial, team seat** | Aurelia staff | Three channels need codes; building three systems wastes the backend. | Headspace runs gifts, promos and partner vouchers through one code page. API v2 has no code endpoints yet. Sources: [Headspace: redeem a promo, voucher or gift code](https://help.headspace.com/hc/en-us/articles/215057448-I-have-a-promo-gift-code-How-do-I-redeem-activate-it); [API contract v2, the pilot slice](/wiki/api) | Next | Needs new backend (not in API v2) | Codes redeemed; redeemers with their own card on file at day 30 |
| **Gift a creator’s journey** | participant | A journey makes a natural gift, and the gift buyer pays the reach. | Round 1: gifting scored highest because the receiver keeps their own card after. Sources: [B2B2C research, round 1](/wiki/b2b2c); [Headspace: redeem a promo, voucher or gift code](https://help.headspace.com/hc/en-us/articles/215057448-I-have-a-promo-gift-code-How-do-I-redeem-activate-it) | Later | Needs new backend (not in API v2) | Gifts redeemed, and receivers who pay after |
| **Retreat aftercare: a retreat continues as a journey** | creator | In-person retreats end and nothing follows; Insight Timer does not fill this either. | Insight Timer Retreats: 10% fee, teacher-run, nothing after. Sources: [Insight Timer Retreats FAQ for teachers](https://insight-timer.freshdesk.com/support/solutions/articles/67000739470-insight-timer-retreats-faqs-for-teachers); [Insight Timer research, round 3](/wiki/research) | Later | Needs the backend (in API v2): `POST /admin/retreats`, `POST /admin/retreats/{id}/cohorts` | Retreat guests still active 8 weeks later |

## Trust features, together

| Feature | What it promises | Rule |
| --- | --- | --- |
| Free first week, no card | You pay only after it has helped | Pre-made creator journey with personal inserts, so the week stays cheap to run |
| The creator's own voice sample | You know whose journey it is | Recorded or licensed with the creator's written consent |
| Refund until week 4 | You can leave halfway | Said on the page before paying; the creator's share is refunded too |
| Real quotes only | What others say is true | Real participants, with consent and a date; none until the pilot |
| One line on data | Nobody sees how you feel | Creators and employers see totals only, groups of 10 or more |
| "Need help now?" | Someone real is one tap away | Local crisis numbers in every pilot country |

## The build order

| Phase | When | Features | Gate |
| --- | --- | --- | --- |
| Phase 0: prove the offer | Now, no backend | One plain line on what we keep and who sees it; Quotes from real participants only, with consent and date; What a creator may say: a checklist in onboarding; “Ask my employer to pay”: a one-page request to forward | Gate 0: a buyer test of the creator journey with a free first week beats the free app among followers, and at least 3 creators agree to the terms. |
| Phase 1: the creator pilot | After the minimum backend | A free first week of every journey, no card; “Need help now?” on every feelings screen; The creator’s page with a 60-second sample in their own voice; Pay after week one: the creator’s journey or the paid plan; Full refund until week 4, said on the page before paying; Creator dashboard: totals only, groups of 10 or more | Gate 1: the five pilot numbers, with “paid after the free week” in place of “seats sold”. |
| Phase 1b: the team plan, beside it | Same time, 2–3 small employers | One code system: gift, partner trial, team seat; Buy 5–200 seats online with a card; One invite link or a code per person; Team report: joined, active, back after 30 days | Seats activated in 30 days above 38%, and at least one team buys without a call. |
| Phase 2: repeat | Gate 1 passed | Payouts and the split, in plain view; The live group sessions in the calendar; The pilot scoreboard in the admin, on real numbers | Gate 2: the numbers hold across creators, not only the best one. |
| Phase 3: widen | Gate 2 passed | The creator earns a share of the paid plans they bring; Gift a creator’s journey; Retreat aftercare: a retreat continues as a journey; Bahasa Indonesia and a rupiah price; An Indonesian team pack beside the company’s assistance programme | Indonesia and gifting only with retention data to show. |

## What is deliberately not on the list

- **A physical box for every participant.** At $14–28 delivered it costs most of a ticket ([Unit economics](/wiki/b2b2c/economics)). A paid add-on at most.
- **Per-person reports for creators or employers.** Health data; and in the EU, AI that infers staff emotions at work is banned ([Claims and regulation](/wiki/b2b2c/regulation)).
- **Ranks, streak pressure or ads on feelings screens.** Tests 6 and 7 found daily pressure was a deal breaker for many followers.
- **Clinical claims or insurer reporting.** Out of scope, as in round 1.

*Sources: each row names its own. The new web sources were read on 25 Nov 2026; notes in `docs/research/research_notes/Aurelia B2B2C round 2/`.*
