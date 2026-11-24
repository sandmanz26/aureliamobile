# Conversion, retention and cost benchmarks for a wellness / meditation subscription (Aurelia B2B2C unit economics)

Researched 2026-11-23. Every figure is dated and sourced. Where only third-party write-ups were found, that is stated. "H&F" = the Health & Fitness app-store category, which is where meditation and mental-health apps are usually classified in RevenueCat and Adapty data (neither publishes a separate meditation cut).

## Install → trial → paid conversion (H&F / meditation), trial length and its effect

### Takeaway
In RevenueCat's 2025 data (115k+ apps), the median H&F app turns 6.9% of downloads into trials, 37.7% of trials into paid, and 2.9% of downloads into payers by day 35. Longer trials convert better (42.5% for 17–32 days vs 25.5% for 4 days or less). Freemium apps convert about 2% of downloads, against about 11–12% for hard-paywall apps.

### Cited Findings
- **RevenueCat State of Subscription Apps 2026** (calendar-2025 data; more than 115,000 apps, more than $16B revenue, more than 1B transactions). The H&F medians are: download→trial (D30) **6.9%**, with top performers above 23%; download→paid (D35) **2.9%**, with the top quartile above 6.2%; trial→paid **37.7%**, with the top quartile above 51.4%; **82.1%** of trials start on day 0. — [RevenueCat 2026](https://www.revenuecat.com/state-of-subscription-apps)
- RevenueCat 2026, all categories: download→paid (D35) has a **2.0%** global median. Hard paywall converts **10.7%** at D35 and freemium **2.1%**. North America download→trial is **7.1%**. Trial→paid is **34.2% in North America vs 15.2% in India/SEA**. — [RevenueCat 2026](https://www.revenuecat.com/state-of-subscription-apps)
- RevenueCat 2026, trial length vs trial→paid (all categories): **25.5%** for trials of 4 days or less, **37.4%** for 5–9 days, **42.5%** for 17–32 days. H&F trials: **54.0%** run 5–9 days, **59%** of H&F apps use a mixed trial / no-trial strategy (the highest of any category), and **18.3%** use no trial (the lowest). — [RevenueCat 2026](https://www.revenuecat.com/state-of-subscription-apps)
- **RevenueCat 2025 edition** (about 75,000 apps, more than $10B revenue; 2024 data): H&F trial→paid median **39.9%**, top 10% **68.3%**. The 17–32-day trials had the highest median conversion at **45.7%**, against **26.8%** for trials of 4 days or less. The overall trial-start rate median is **6.2%** (P90 20.3%). D35 download→paid is **12.11%** for hard paywalls vs **2.18%** for freemium. H&F download→paid P90 is **12.1%**. — [RevenueCat 2025](https://www.revenuecat.com/state-of-subscription-apps-2025); trial-length summary also in [Athletech News](https://athletechnews.com/fitness-apps-monetizable-winner-take-all-or-most/)
- **Adapty State of In-App Subscriptions 2026** (published 2026-03-27; more than 16,000 apps, more than $3B revenue). H&F weekly-subscription funnel: install→trial **9.5%** (global median, all categories, 11.2%; North America 14.5%), trial→paid **42.2%**, and **86.1%** of trials start on day 0. Global install→paid (direct) is about **3.7%**. Trial users retain **8–60%** better at first renewal. — [Adapty H&F benchmarks](https://adapty.io/blog/health-fitness-app-subscription-benchmarks/); [Adapty SOIS 2026](https://adapty.io/state-of-in-app-subscriptions/)
- A randomized field experiment (*Management Science*, 2023, n=337,724 users of one app) found conversion after trial was nearly flat across lengths: 15.36% after a 7-day trial, 14.96% after 14 days and 14.67% after 30 days. This contrasts with the cross-sectional RevenueCat finding. — reported via [Adapty](https://adapty.io/blog/trial-conversion-rates-for-in-app-subscriptions/) (search snippet; the original paper was not opened)
- Sensor Tower: I found no category conversion benchmark in this pass.

### Inferences
- For a freemium app like Aurelia, the honest planning base is about **2–3% of installs paying by day 35** (H&F median 2.9%). The 37–42% trial→paid figures apply only to users who opt into a trial, about 7–10% of installs.
- The longer-trial advantage in RevenueCat is cross-sectional (apps choosing long trials may differ), and the RCT shows no length effect. An 8-week paid retreat should not be modelled as a "long trial" with a 42% conversion rate.
- Indonesia, India and Brazil users convert at less than half the North American rate (IN/SEA 15.2% vs NA 34.2% trial→paid).

### Gaps
- No meditation- or mental-health-specific conversion cut is published by RevenueCat or Adapty. I found no Sensor Tower conversion data.

## Day 1 / 7 / 30 retention, annual renewal and monthly churn

### Takeaway
Engagement with mental-health apps collapses fast. In panel data on popular apps (Baumel et al., 2019), the median day-30 retention was 3.3%, and 4.7% for mindfulness apps. Among payers, about 44% of annual subscribers renew after year 1 against 17% of monthly subscribers. Adapty's first-renewal figure is about 59% across categories.

### Cited Findings
- **Baumel, Muench, Edan & Kane 2019, JMIR 21(9):e14567.** This was panel-based usage data (SimilarWeb) on 93 popular mental-health apps with more than 100k installs, 59 of which had retention data. The median daily-open retention was **3.9% at day 15** and **3.3% at day 30** (IQR 6.2%). The median day-30 retention by type was **4.7%** for mindfulness/meditation, **8.9%** for peer support, **6.1%** for trackers and **0.0%** for breathing apps. Retention was defined as the share of day-0 installers who opened the app on a given day. — [JMIR 2019](https://www.jmir.org/2019/9/e14567/)
- **RevenueCat 2025**, Year-1 retention of paying subscribers by plan (all categories): **44.1%** yearly, **17.0%** monthly, **3.4%** weekly. Median first renewal is **61.7%** (down from 64.9%). H&F refund rate is **4.71%**, the second highest after Education at 4.86%. Hard paywall refunds are 5.8% and freemium refunds 3.4%. — [RevenueCat 2025](https://www.revenuecat.com/state-of-subscription-apps-2025)
- **RevenueCat 2026**: AI-powered apps earn **41% more revenue per payer but churn 30% faster**. — [RevenueCat 2026](https://www.revenuecat.com/state-of-subscription-apps)
- **Adapty 2026**, global renewal retention (all categories): 1st renewal **59.2%**, 2nd **45.1%**, 3rd **37.1%**, 4th **31.6%**, 5th **27.6%**. The H&F weekly-plan first renewal is **67.7%**. — [Adapty H&F benchmarks](https://adapty.io/blog/health-fitness-app-subscription-benchmarks/). One secondary summary claims H&F has the *lowest* first-renewal retention at 30.3%, which conflicts with the 67.7% figure. The two may measure different plan types. — [Adapty SOIS summaries via search](https://www.rocketshiphq.com/adapty-subscription-app-benchmark-2025-summary/)
- Adapty: 17% of monthly subscriptions are still active after a year. — [Adapty SOIS 2026](https://adapty.io/state-of-in-app-subscriptions/)

### Inferences
- Implied monthly churn: if 17% of monthly subscribers survive 12 months, the average monthly churn is about **14%** (0.83^12 ≈ 0.11, 0.86^12 ≈ 0.16). This is my own calculation, not a published figure.
- For Aurelia Plus annual at $100: plan on about **44–59%** renewal after year 1, falling to about 45% / 37% at later renewals. Expected paid years per annual payer are about 1.8–2.0 (1 + 0.5 + 0.23 + …).
- An 8-week retreat is a deliberate counter to the day-30 collapse (3–5%). Graduates are by definition the retained few, so the 30% conversion target applies to a small, highly selected group. Model **completion rate** explicitly. No source here gives it for paid wellness cohorts.

### Gaps
- No primary Sensor Tower D1/D7/D30 figures for meditation apps were found in this pass. No 2023–2026 peer-reviewed replication of Baumel was checked.
- No H&F-specific monthly churn figure is published. The ~14% figure above is derived.

## Price points and ARPU: Calm, Headspace, Insight Timer, Balance, Waking Up, Rise; regional pricing

### Takeaway
The category clusters around **$60–$80 a year and $10–$17 a month** (Headspace $69.99/yr and $12.99/mo; Calm $69.99–$79.99/yr; Insight Timer about $59.99/yr; Balance about $69.99/yr; Waking Up $99.99–$129.99/yr). The RevenueCat H&F median is $9.99/mo and $39.94/yr. Aurelia's $10/$100 is at the market monthly median and at the top of the annual range, level with Waking Up.

### Cited Findings
- **RevenueCat 2026**, H&F median prices: **$9.99 monthly**, **$4.99 weekly**, **$39.94 yearly**. All-category medians are $10 monthly and $34.80 yearly. Annual plans are **68%** of H&F subscriptions sold and **59%** of H&F revenue (the report elsewhere calls H&F "monthly-heavy (68%)", which is an internal inconsistency). — [RevenueCat 2026](https://www.revenuecat.com/state-of-subscription-apps)
- RevenueCat 2026, per-payer and per-install revenue for H&F: monthly realized LTV per payer in month 1 is **$24.23** median (top performers above $60), and yearly realized LTV per payer in year 1 is **$35.64** median (global $23). Revenue per install is **$0.48** at D14 and **$0.66** at D60, against all-category medians of $0.23 and $0.34. — [RevenueCat 2026](https://www.revenuecat.com/state-of-subscription-apps)
- Adapty 2026: the H&F 12-month install LTV is **$1.21** median, the highest category. One-year LTV is **$70** for a high-priced annual plan and **$17** for a low-priced annual plan. — [Adapty H&F benchmarks](https://adapty.io/blog/health-fitness-app-subscription-benchmarks/)
- **Headspace**: $69.99/yr, $12.99/mo; student $9.99/yr; family $99.99/yr for up to 6 people (2025–2026 third-party price comparisons). — [Breethe comparison](https://breethe.com/sleep-and-meditation-app-guide/compare-evaluate/how-much-does-breethe-cost-compared-to-calm-and-headspace-a-real-world-price-breakdown); [Lifestack 2026](https://lifestack.ai/blog/headspace-pricing)
- **Calm**: $69.99–$79.99/yr depending on platform. Monthly is reported at $14.99–$16.99. Sources disagree. — [Carepaths 2026](https://carepaths.com/calm-app-vs-headspace/); [Neurobeatx 2026](https://www.neurobeatx.com/blog/calm-vs-headspace-2026)
- **Insight Timer Member Plus**: about $59.99/yr (third-party 2024 comparison) and $9.99/mo (Insight Timer support page). Prices vary by location. — [Breethe 2024 comparison](https://admin.breethe.com/sleep-and-meditation-app-guide/compare-evaluate/which-mindfulness-app-offers-the-best-yearly-value-a-2024-price-comparison); [Insight Timer support](https://insight-timer.freshdesk.com/support/solutions/articles/67000664579-hoeveel-kost-insight-timer-)
- **Waking Up**: about $99.99/yr in an App Store listing; $129.99/yr on the website (2024 comparison). — [App Store](https://apps.apple.com/app/id1307736395); [Breethe 2024](https://admin.breethe.com/sleep-and-meditation-app-guide/compare-evaluate/which-mindfulness-app-offers-the-best-yearly-value-a-2024-price-comparison)
- **Balance**: about $69.99/yr, with periodic lifetime deals (2024). — [Breethe 2024](https://admin.breethe.com/sleep-and-meditation-app-guide/compare-evaluate/which-mindfulness-app-offers-the-best-yearly-value-a-2024-price-comparison)
- **Regional pricing**: Adapty's H&F weekly pricing index is **1.3** for the UK, France and Germany vs **0.3** for India (a gap of more than 4x). H&F annual prices in Germany are **4.4x** those in Turkey. Brazil's all-category country index is **0.9**. — [Adapty H&F benchmarks](https://adapty.io/blog/health-fitness-app-subscription-benchmarks/); [Adapty SOIS 2026](https://adapty.io/state-of-in-app-subscriptions/)

### Inferences
- At $100/yr, Aurelia is about 40–45% above Calm and Headspace annual pricing and 2.5x the H&F median annual price. The personalised-AI positioning has to carry that premium. Waking Up is the only mainstream comparable at about $100.
- For Indonesia and India, an index of 0.3 implies an annual price of roughly $25–35 for the same relative positioning. For Brazil, an index of 0.9 implies close to US pricing. Indonesia was not in any index found.

### Gaps
- **Rise** (sleep app) pricing: not found.
- No absolute Indonesian, Brazilian or Indian store prices for these apps were retrieved. Store listings vary by storefront and need a manual check.
- No official per-user ARPU for Calm or Headspace was found. Both are private, and no 2023–2026 filing was retrieved.

## Conversion of a paid cohort, challenge or course into a subscription afterwards

### Takeaway
**I found no published data** on the rate at which paid cohorts, challenges or courses (Noom, Insight Timer courses, fitness challenges) convert to a subscription afterwards. The 30% graduate→Plus assumption cannot be benchmarked directly. The nearest proxies are trial→paid (37.7–42.2% of trial starters in H&F) and post-trial conversion timing.

### Cited Findings
- H&F trial→paid medians are **37.7%** (RevenueCat 2026) and **42.2%** (Adapty 2026, weekly funnel). The top quartile is above 51.4%. — [RevenueCat 2026](https://www.revenuecat.com/state-of-subscription-apps); [Adapty H&F](https://adapty.io/blog/health-fitness-app-subscription-benchmarks/)
- One vendor analysis estimates that up to **50%** of eventual paid conversions happen after the formal trial ends, so conversion should be measured beyond the end of the programme. — [Linkrunner](https://linkrunner.io/blog/attribution-for-subscription-apps-tracking-trials-conversions-and-churn) (vendor blog, unverified)

### Inferences
- A €19.99 ticket buyer has already paid, a stronger intent signal than a free-trial starter. Graduates who completed 8 weeks are more selected still. A 30% graduate→Plus rate sits **below** the median H&F trial→paid rate (37.7%), so it is plausible **per graduate**. The hidden risk is completion: if, say, 20–40% of ticket buyers complete (an assumption, unsourced), the conversion is only 6–12% per ticket buyer.
- The scenario should state conversion per ticket buyer, not only per graduate, and run sensitivity at 15% / 30% / 40%.
- The retreat price is a structural difference. A €19.99 ticket followed by $10/mo Plus is a step up in price, not a step down, so the decision to convert is a second purchase decision rather than "keep what you have".

### Gaps
- Noom, Insight Timer course→Member Plus, and fitness-challenge→subscription conversion: no public figures found. Company disclosures or creator-platform data (e.g. Kajabi, Mighty Networks) would be the next place to look.
- Completion rates of paid multi-week digital wellness programmes: not found in this pass.

## App-store and payment fees, web checkout after the 2025 US ruling, Stripe, VAT (EU, Indonesia)

### Takeaway
Store fees on subscriptions are effectively **15%** for small developers and for subscriptions on Google Play in most markets. US link-out to web checkout became commission-free in April 2025, but in December 2025 the Ninth Circuit allowed Apple to set a "reasonable" commission (the amount is still undefined). Stripe card fees are about 1.5% + €0.25 in the EEA and about 2.9% + a fixed fee in Indonesia. Indonesian VAT on foreign digital services is effectively 11%. EU VAT is charged at the buyer's national rate (gap: rates not fetched).

### Cited Findings
- **Google Play** (official): auto-renewing subscriptions for users in Australia, the EEA, Japan, the UK and the US fall under a "10% + 5% billing fee" on the first $1M of annual earnings. In all other markets subscriptions pay a flat **15%**. Outside subscriptions, the 15% tier covers the first $1M of revenue a year and 30% applies above it. — [Google Play Console Help](https://support.google.com/googleplay/android-developer/answer/112622)
- **Apple Small Business Program**: 15% commission for smaller developers since the 2020 programme (secondary source). — [Computerworld](https://www.computerworld.com/article/3712224/apple-v-epic-the-still-unanswered-question.html). In January 2024 Apple's US link-out terms charged 27% (12% for Small Business Program and second-year subscriptions). — [AppleInsider 2024](https://appleinsider.com/articles/24/01/16/apples-app-store-anti-steering-rules-are-gone-but-the-replacement-isnt-much-better)
- **Epic v. Apple**: on 30 April 2025 the district court found Apple in willful violation and barred any commission on US external-link purchases, and Apple changed its US rules in May 2025 to allow links to the web. — [TechCrunch 2025-05-02](https://techcrunch.com/2025/05/02/apple-changes-us-app-store-rules-to-let-apps-redirect-users-to-their-own-websites-for-payments). On **11 December 2025** the Ninth Circuit upheld that the 27% fee was prohibitive but ruled Apple **may charge a reasonable, non-prohibitive commission** on linked-out purchases, remanding the rate. — [MacRumors 2025-12-11](https://www.macrumors.com/2025/12/11/apple-app-store-fees-external-payment-links/); [9to5Mac](https://9to5mac.com/2025/12/11/apple-defeats-ban-on-charging-commission-on-linked-out-purchases-from-ios-apps/)
- Web revenue was **3.2%** of subscription app revenue globally (**4.9%** in North America) in 2025. — [RevenueCat 2026](https://www.revenuecat.com/state-of-subscription-apps)
- **Stripe Indonesia**: 2.9% + 30¢ per successful card charge (Stripe Connect pricing page), plus 1–2% for currency conversion. A third-party calculator says 2.9% + Rp5,500. — [Stripe Connect pricing](https://stripe.com/it-us/connect/pricing); [fee-calc](https://www.fee-calc.com/stripe-fees)
- **Stripe EEA**: one third-party calculator cites **1.4% + €0.25** for standard EEA cards. It was not verified on Stripe's own EU page in this pass. — [fee-calc](https://www.fee-calc.com/stripe-fees)
- **Indonesia VAT on foreign digital services (PMSE)**: 12% applied to a deemed base of 11/12 of the payment, an **effective 11%** (PER-12/PJ/2025 replaced the flat 11%). Foreign providers are appointed collectors above IDR 600M a year or 12,000 users a year (IDR 50M or 1,000 users a month). VAT may be remitted in IDR or USD, with monthly reporting. — [DJP (Indonesian tax office)](https://pajak.go.id/en/digitaltax); [MUC Consulting](https://muc.co.id/en/article/vat-on-digital-goods-and-services-regulation-revised-monthly-reporting-now-mandatory)

### Inferences
- Rough take-home per $10 of a store-billed monthly subscription: −15% store fee, and store prices are VAT-inclusive in the EU and Indonesia. At 20% EU VAT, net is about $10 / 1.2 × 0.85 ≈ **$7.08**. In Indonesia (11% effective VAT): $10 / 1.11 × 0.85 ≈ **$7.66**. Apple and Google remit VAT on store sales. These are my own calculations.
- On the web via Stripe (EEA): roughly 1.4–1.5% + €0.25 plus VAT that Aurelia must remit itself (EU OSS). That is about 4% on a €10 charge versus 15% in-store, but with lower checkout conversion (web is only 3–5% of category revenue).
- For the €19.99 retreat ticket: through Stripe in the EU, about €0.53 in fees plus VAT (at 20%: €3.33), leaving about €16.13 net to split 60/40. **Aurelia's 40% is about €6.45 per ticket before AI cost.** If sold as an in-app purchase (15%): €19.99 / 1.2 × 0.85 ≈ €14.16 net, of which 40% is about €5.66.

### Gaps
- EU VAT rates by country (17–27%) were not fetched; use the European Commission VAT rates table.
- The rate Apple will charge on US link-outs after remand is not yet settled (as of the sources found).
- Whether Stripe offers native Indonesian local methods (QRIS, e-wallets) was not checked; Xendit or Midtrans are the usual local alternatives.

## AI generation cost per session (LLM, text-to-speech, music) and how AI-native apps handle it

### Takeaway
The script is negligible: about **$0.001–$0.04** for a 10-minute session, depending on the model. **Voice dominates.** ElevenLabs costs about **$0.26–$0.52** per 10-minute script and OpenAI tts-1/tts-1-hd about **$0.10–$0.20**. Music is about zero if drawn from a licensed library. A personalised 10-minute session therefore costs about **$0.10–$0.60**. A Plus user generating one a day costs about $3–18 a month, which can exceed the $10 price at the top end. The voice model choice and session reuse decide whether Plus is profitable.

### Cited Findings
- **Anthropic API** (official, current), per million tokens input/output: **Haiku 5.5** $0.10 / $0.50 (prompts up to 100k tokens); **Haiku 4.5** $1 / $5; **Sonnet 5 and 5.5** $2 / $10; **Sonnet 4.6** $3 / $15; **Opus 5.5** $4 / $20. Batch API is −50%. Cache reads cost 0.1x input (0.05x on Sonnet and Opus 5.5). Claude 4.7+ models use a tokenizer that produces about **30% more tokens** for the same text. — [Anthropic pricing docs](https://platform.claude.com/docs/en/about-claude/pricing)
- **OpenAI API** (official, current), per million tokens: gpt-5-nano $0.05 / $0.40; gpt-5-mini $0.25 / $2.00; gpt-4o-mini $0.15 / $0.60; gpt-5.4-mini $0.75 / $4.50; gpt-5.4 $2.50 / $15. Batch is about half price. — [OpenAI pricing](https://developers.openai.com/api/docs/pricing)
- **OpenAI TTS** (official): **tts-1 $15 per 1M characters**; **tts-1-hd $30 per 1M characters**; **gpt-4o-mini-tts** $0.60 per 1M text-input tokens + **$12 per 1M audio-output tokens**. — [OpenAI pricing](https://developers.openai.com/api/docs/pricing)
- **ElevenLabs API** (third-party summaries dated October–November 2026; not verified on elevenlabs.io): expressive models (v4, v3, Multilingual v2) **$0.08 per 1k characters**; fast models (Flash/Turbo) **$0.04 per 1k characters**. Earlier 2026 articles listed $0.10 and $0.05. 1k characters is roughly 1 minute of continuous speech. — [Wireflow](https://www.wireflow.ai/blog/elevenlabs-api-pricing); [Goodvibecode](https://www.goodvibecode.com/text-to-speech/elevenlabs-api-pricing-explained); [Puter](https://developer.puter.com/tutorials/elevenlabs-api-pricing/)

### Inferences (worked estimate; my own calculation from the prices above)
- **Script size**: a 10-minute guided session spoken slowly with pauses is about 900–1,200 words, or about **5,500–7,000 characters**, about 1,500–2,000 output tokens on the newer tokenizer. Assume about 3,000 input tokens of prompt (system prompt + user sentence + context).
- **LLM per session**: Haiku 5.5 ≈ **$0.001**; Sonnet 5 ≈ 3k × $2 + 2k × $10 per MTok ≈ **$0.026**; Opus 5.5 ≈ **$0.052**. With a cached system prompt, input cost drops by up to 90–95%.
- **TTS per session** (on 6,500 characters): OpenAI tts-1 ≈ **$0.10**, tts-1-hd ≈ **$0.20**; ElevenLabs Flash ≈ **$0.26**, expressive ≈ **$0.52**. TTS is billed per character, not per minute, so meditation pauses (silence inserted by SSML or by stitching) are free. A 10-minute session with 40% silence costs as much as 6 minutes of speech.
- **Music**: if Aurelia layers a licensed stem library under the voice, the marginal cost is about $0 plus storage and CDN.
- **Total**: about **$0.10** (budget: Haiku + tts-1) to **$0.55** (premium: Sonnet + ElevenLabs expressive) per new session, before hosting.
- **Per user per month**: 4 sessions/mo → $0.40–$2.20; 30 sessions/mo → $3–$16.50. Against Plus net revenue of about $7/mo (after the 15% store fee and VAT), heavy users on premium voices are loss-making. Options: generation caps, caching and reuse of near-duplicate sessions, a cheaper voice tier for free users, and batch pre-generation.
- **8-week retreat**: about 3 sessions a week × 8 = 24 sessions → **$2.40–$13** per participant. At the premium end that exceeds Aurelia's ~€6 share of the €19.99 ticket. Creator-led retreats could instead use a **pre-generated, shared** creator script and voice recorded once (cost amortised to about $0), with personalisation limited to short inserts.

### Gaps
- **Google Cloud TTS** current prices were not retrieved; check cloud.google.com/text-to-speech/pricing.
- **Audio-output tokens per minute** for gpt-4o-mini-tts were not on the pricing page, so its per-session cost could not be computed from official figures.
- **AI music generation** API prices (e.g. Suno, Stability Audio, ElevenLabs Music) were not found in this pass.
- **How AI-native wellness apps manage generation cost** (caps, caching, pre-generation): no published sources were found. This is a gap, not a finding.

## Customer acquisition cost (CPI, CAC) for wellness apps; influencer vs paid ads

### Takeaway
Paid-social CPI for H&F / wellness is roughly **$1.50–$5** (TikTok cheaper than Meta) and fully loaded CAC is about 2–3x CPI. With 2–3% install→paid, that implies **about $100–$250 per paying subscriber** from paid media, against a year-1 H&F payer LTV of about $36 (median yearly). Paid UA at median conversion does not pay back, which is the case for creator-led (B2B2C) distribution. No credible influencer-vs-paid CAC benchmark was found.

### Cited Findings
- 2025 average CPI (all categories): **$4.70 iOS**, **$3.70 Android**. Fully loaded CAC is typically **2–3x CPI**. H&F subscription apps cost **$3–$6** per install. — [Adapty CAC guide](https://adapty.io/blog/customer-acquisition-cost/) (vendor blog)
- Fitness and wellness CPI in 2026: **TikTok $1.50–$3.50**, **Meta $2.50–$5.00** (vendor benchmark table); another TikTok guide gives **$2–$8** for H&F. — [Semnexus 2026](https://semnexus.com/app-user-acquisition-benchmarks-by-vertical-2026); [TheViralApp 2026](https://theviralapp.com/blog/tiktok-cpi-benchmarks-app-category-2026/)
- Cheaper installs do not mean cheaper subscribers. One case study reports TikTok installs at $2.60 with 22% D30 retention vs YouTube at $5.80 with 47%. A vendor reports that Meta beats TikTok on D30 ROAS by 15–30% in subscription fitness. — [Semnexus TikTok vs Meta](https://semnexus.com/tiktok-vs-meta-app-user-acquisition-2026-performance-data); [Airbridge](https://www.airbridge.io/en/blog/cost-per-trial-cost-per-subscription-subscription-app-ua-metrics)
- One fitness case study shows a $4.12 CPI across 3 markets on $190k spend. — [Growthunders](https://www.growthunders.com/case-studies/fitness-app-installs-190k-3-markets-412-cpi-vs-460-forecast)

### Inferences
- Paid CAC per subscriber ≈ CPI / install→paid = $3–5 / 0.029 ≈ **$100–$170** media-only, or about $200–$400 fully loaded. My calculation, with medians.
- In the B2B2C retreat, acquisition is paid out of the creator's 60% share and audience: Aurelia's CAC for a retreat graduate is about $0 in media. At a 30% graduate→Plus rate and about $70 of net year-1 Plus revenue (annual plan after fees), each graduate is worth about $21 of expected Plus revenue, plus the ~€6 ticket share. This is the core argument for the model, provided completion and AI cost are controlled.

### Gaps
- No primary AppsFlyer, Adjust or Sensor Tower 2025 CPI report was retrieved. All CPI figures come from vendor blogs.
- **Influencer-marketing CAC vs paid ads** for wellness apps: no credible quantitative source found.
