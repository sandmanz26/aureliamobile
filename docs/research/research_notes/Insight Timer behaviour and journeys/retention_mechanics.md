# Insight Timer retention mechanics, and the evidence for whether they work

Scope note: this round goes deeper than the business overview in `research_notes/Insight Timer deep research/strategy_business.md` and `reports/Insight Timer deep research.md`. Facts already established there (Return Rate pay, onboarding paywall, the 50% to 40% teacher cut, Apple's tip ruling, the review-sentiment trend) are referred to, not repeated. Company claims are marked **[company]**; independent data is marked **[independent]**; vendor or blog figures with no traceable method are marked **[unverified]**. Research done 18 Nov 2026, within a limited budget (about 18 searches and fetches). Several full-text fetches of JMIR papers returned empty pages, so some academic figures below come from abstracts and search-result summaries rather than full papers, and are flagged where that matters.

## 1. What Insight Timer itself has said about retention and habit drivers

### Takeaway
Insight Timer has never published a retention curve, DAU/MAU or cohort figure. What it has said, mostly in a 2020 interview and a 2025 teacher podcast, points to four habit drivers: the free timer (long daily sessions by a committed core), word-of-mouth growth, the community and groups, and, since 2024, paying teachers for next-day return. The widely quoted "5x Calm's retention" and "16% day-30 retention" figures have no traceable method and should not be relied on.

### Cited Findings
- **The timer is the habit core [company, 2020]:** "About a third of our community, about 300,000 people every day use the timer for about 24 minutes on average" (Christopher Plowman, CEO). That implies a daily timer core of about 300k against 18M registered users at the time. — [Koetsier / TechFirst, 16 Nov 2020](https://johnkoetsier.com/no-selling-allowed-how-insight-timer-is-building-the-biggest-meditation-community-on-the-planet/)
- **Retention vs Calm [company framing, 2020, no method]:** the interview's introduction says Insight Timer "has 5X the retention of better-known competitors like Calm" and ranks above TikTok, Facebook, Netflix and Twitter for session duration. No source or definition is given. — [Koetsier 2020](https://johnkoetsier.com/no-selling-allowed-how-insight-timer-is-building-the-biggest-meditation-community-on-the-planet/)
- **Plowman's theory of retention [company, 2020]:** people who go to effort to find the app "tend to stick around". In other words, he credits self-selection by word-of-mouth users, not a feature. — [Koetsier 2020](https://johnkoetsier.com/no-selling-allowed-how-insight-timer-is-building-the-biggest-meditation-community-on-the-planet/)
- **Acquisition is word of mouth [company, 2020]:** "about 15,000 people sign up to our community every day"; "70% of the people who sign up … are word of mouth referrals"; $0 spent on paid search, "one or two billboards" tried. — [Koetsier 2020](https://johnkoetsier.com/no-selling-allowed-how-insight-timer-is-building-the-biggest-meditation-community-on-the-planet/)
- **Community scale [company, 2020]:** "12,000 discussion groups", about 10,000 teachers, and under 1% of users subscribing. — [Koetsier 2020](https://johnkoetsier.com/no-selling-allowed-how-insight-timer-is-building-the-biggest-meditation-community-on-the-planet/)
- **Notifications and renewals: deliberately light-touch on money [company, 2020]:** four emails during a free trial warn of the charge and link to cancel, and subscribers are contacted before their 12-month renewal. Plowman contrasts this with Calm, which he says found that users "would be more likely to unsubscribe" if messaged 90 days before renewal and so stopped messaging inactive users. Plowman: "you don't constantly get harassed on our app to spend money with us." This was the 2020 position; by 2025 most new users met a paywall in onboarding (see the earlier notes). — [Koetsier 2020](https://johnkoetsier.com/no-selling-allowed-how-insight-timer-is-building-the-biggest-meditation-community-on-the-planet/)
- **Live events reach a minority [company, 2025]:** about 10% of users take part in lives, per the CTO. Live is kept mainly as a sales channel for courses and retreats despite its cost. — [Lou Redmond podcast, Mar 2025](https://louredmond.com/podcast-1/2025/03/11/insight-timer-ceo-christopher-plowman-on-teacher-earnings-how-the-platform-is-changing) (already in strategy_business.md §2)
- **The 2025 priority is next-day return:** Return Rate, meaning listeners who come back the next day and do anything, decides 25–30% of teacher pay. January 2025 set records for plays, DAU and subscribers, but no figures were given. — [Teacher Income FAQ, Aug 2024](https://insight-timer.freshdesk.com/support/solutions/articles/67000737721-teacher-income-faq-august-2024); [Lou Redmond podcast, Mar 2025](https://louredmond.com/podcast-1/2025/03/11/insight-timer-ceo-christopher-plowman-on-teacher-earnings-how-the-platform-is-changing)
- **Onboarding as a retention device [independent teardown, undated, about 2025]:** onboarding opens with a scientific case for its own efficacy: graphs of mood improvement, a consistency curve, and a personalised prediction dated three months from sign-up, all before any content. A soft paywall comes late in the flow (about 1:31 in), after the user has invested in personalising. — [ScreensDesign showcase](https://screensdesign.com/showcase/insight-timermeditate-sleep)
- **"16% day-30 retention, double the leaders' ~8.5%" [unverified]:** this comes from a gamification vendor's blog with no method, no date for the data and no primary source. The earlier round also failed to trace it. — [StriveCloud](https://strivecloud.io/blog/user-retention-examples)
- **"MemberPlus (late 2018) lifted retention about 40%" [unverified]:** Starter Story attributes this to a Medium post that I could not open (HTTP 403). — [Starter Story](https://www.starterstory.com/businesses/insight-timer/monetization)
- **A CMO podcast exists but was not analysed:** Melissa Rosenthal, CMO, appears on a growth podcast. The episode is undated in the listing and its content was not retrieved. — [Everand listing](https://www.everand.com/podcast/709523595/Ep-24-Melissa-Rosenthal-CMO-at-Insight-Timer-Disruption-isn-t-just-a-buzzword-it-s-the-lifeline-of-growth-and-innovation-in-today-s-business-lands)

### Inferences
- The most defensible picture of Insight Timer's retention is a **small, very committed core**: timer users doing about 24 minutes a day, roughly 1.7% of registered users in 2020. Around that core is a large, mostly lapsed registered base. The "5x Calm" claim probably compares session length or a committed-user metric, not cohort retention.
- The original habit loop (timer, then the bell, the stats and "meditated with N people") required no content decision. That matters for Aurelia: the lowest-friction daily action is not the content.
- Word of mouth plus self-selection explains more of the historic retention than any one feature. A paid-acquisition startup should not expect Insight Timer-like curves from copying features.

### Gaps
- No DAU/MAU, D1/D7/D30 or subscriber-churn figure from Insight Timer in any interview, press piece or job ad found.
- No Insight Timer job ads or staff LinkedIn posts with metrics were found in this budget.
- The Medium post "23 million downloads without a cent spent on advertising" is blocked (403) and is unread.

## 2. Category benchmarks: retention, conversion, churn

### Takeaway
Independent data agrees that meditation and mental-health apps lose almost everyone fast. Median 30-day retention in panel data is about 3–5%. Half of new meditation-app users do 16 minutes or less in their first month. Category engagement has been shrinking since 2020. Subscription conversion, by contrast, is healthy: health and fitness trials convert at a median of about 40%. The industry problem is usage, not checkout.

### Cited Findings
- **Panel data, 93 Android mental-health apps [independent, 2019]:** median 15-day retention was 3.9% (IQR 10.3%) and median 30-day retention 3.3% (IQR 6.2%). The authors conclude that installs and daily minutes "may seem high", but only a small portion of users keep using the apps. — [Baumel et al., JMIR 2019;21(9):e14567](https://www.jmir.org/2019/9/E14567/)
  - Meditation and mindfulness apps had a day-30 median of **4.7%** vs 0.0% for breathing apps, with peer support at 8.9% and trackers at 6.1%. **This is from the preprint; I did not confirm it in the published version.** — [Baumel preprint](https://preprints.jmir.org/preprint/14567)
- **Medito, first 30 days [independent, 2026]:** 668 users from 30 countries were followed for their first 30 days after download. Half (328 of 655) engaged for **16 minutes or less in the whole first month**. Acute stress motivated use, while chronic stress disrupted it. The paper cites prior naturalistic work reporting **about 90% attrition after one week**. (Abstract and search summary only; the full text did not load.) — [JMIR mHealth 2026;e79366](https://mhealth.jmir.org/2026/1/e79366)
- **Cross-sectional survey of 536 meditation-app users [independent, 2026]:** 50% engage 40 minutes or less a month. Appeal, perceived impact and subjective quality were moderately associated with engagement, and **no mental-health factor** was. A related Medito longitudinal study found engagement is best when the experience matches expectations and users are ready to change. — [JMIR 2026;e71960](https://www.jmir.org/2026/1/e71960/PDF); [Mount Sinai record](https://scholars.mssm.edu/en/publications/real-world-meditation-app-engagement-longitudinal-study-of-the-me/)
- **Category engagement decline [independent, Apptopia, 2022–23]:** combined sessions of the top 10 meditation apps fell **48%** from the Q2 2020 peak. In July (2022), Calm sessions were down **26.4%** YoY and Headspace's **60.3%**. Apptopia attributes this to pandemic-era users churning. — [Apptopia](https://apptopia.com/blog/calm-and-headspace-losing-app-engagement/)
- **Downloads [independent, Appfigures, May 2024]:** Calm peaked at about 3.4M estimated downloads in January 2021, described as "the beginning of the end". Demand for mental-health apps was at "an all-time low". — [Appfigures, 10 May 2024](https://appfigures.com/resources/insights/20240510/amp?f=3)
- **Headspace weekly actives (US iOS) [independent, Sensor Tower]:** about 464k fell to about 396k in Q2 2023, and about 652k (first week of January) fell to about 556k by the end of Q1 2024. That is a January resolution spike then about a 15% decay within the quarter. — [Sensor Tower Q2 2023](https://sensortower.com/blog/q-2-2023-performance-of-top-wellness-apps-on-i-os-in-the-us); [Sensor Tower Q1 2024](https://sensortower.com/blog/2024-q1-unified-top-5-wellness%20apps-revenue-us-63e274e1e1714cfff10eaa2f)
- **Day-90 retention, Calm about 2% and Headspace about 3% [unverified, informal Substack]:** no method is given. — [Bloom Collective](https://bloomcollective.substack.com/p/uncovering-the-best-guided-meditation)
- **Trial conversion, health and fitness [independent vendor data, RevenueCat 2025]:** median trial-to-paid was **39.9%**, top decile **68.3%**. Across categories, 17–32 day trials convert best (median **45.7%**) vs 26.8% for trials of 4 days or less. H&F conversion is about 2x higher on iOS than Android. Only 5% of H&F apps reach $10k revenue within two years. H&F has high revenue per install but elevated refund rates. (Secondary coverage; full category tables not retrieved.) — [Athletech News on RevenueCat 2025](https://athletechnews.com/?p=124212); [Athletech News](https://athletechnews.com/fitness-apps-monetizable-winner-take-all-or-most/); [Kitemetric summary](https://kitemetric.com/blogs/subscription-app-benchmark-data-key-insights-for-developers); [RevenueCat report](https://www.revenuecat.com/state-of-subscription-apps-2025)
- **Insight Timer conversion [company, 2020]:** under 1% of users subscribed. — [Koetsier 2020](https://johnkoetsier.com/no-selling-allowed-how-insight-timer-is-building-the-biggest-meditation-community-on-the-planet/). (About 350k subscribers in 2025 against about 3M MAU, about 12% of MAU, per strategy_business.md, is a company figure Plowman himself doubted.)

### Inferences
- For Aurelia's planning, a realistic unaided baseline is **D30 of about 3–5% of installs**. Anything above about 10% is a strong result, and the untraced "16%" is not a benchmark.
- Engagement tracks **appeal and perceived impact**, not how unwell people are. A daily check-in that shows people "this is working for you" targets the variable the 2026 survey found mattered. Showing it rather than asserting it is an inference, not a tested finding.
- Chronic stress disrupting use, while acute stress drives it, argues for an "I'm stressed right now" entry point, which Aurelia's one sentence is, plus designed recovery for lapsed users rather than streak pressure.
- Longer trials convert better in RevenueCat data. That is worth testing against Aurelia's chapter structure, for example a trial that covers a whole journey.

### Gaps
- No independent D1/D7/D30 figures for Insight Timer, Calm, Headspace, Balance or Medito individually from Sensor Tower or data.ai (paywalled).
- RevenueCat 2025/2026 H&F retention and churn tables were not retrieved; only conversion figures were.
- No Adapty meditation-specific benchmarks were found in budget.

## 3. Which specific mechanics have evidence of effect

### Takeaway
Rigorous evidence is thin and effects are small. Streaks raise continuation modestly, and breaking them demotivates. Tailored push notifications raise next-day engagement by about 4%. Mood check-ins are associated with more meditation the following week, mainly among inactive users, and only for a week. Social co-presence ("people meditating now") has **no** direct engagement study. Live sessions have qualitative support for routine-building. No independent evidence was found for teacher-follow, daily-unlock courses, sleep content or personalised recommendations in meditation apps specifically.

### Cited Findings
**Streaks and loss aversion**
- Across seven studies, highlighting an **intact** streak in a behaviour log increased subsequent engagement compared with highlighting a **broken** one. People treat keeping a logged streak as a goal in itself. The demotivation is **stronger when people blame themselves** for the break, and **weaker when they can "repair"** it. — [Silverman & Barasch, "On or Off Track: How (Broken) Streaks Affect Consumer Decisions", J. Consumer Research 49(6):1095–1117, Apr 2023](https://udspace.udel.edu/items/42ce576b-8e1f-429a-8541-e29e48dbcfbb)
- The effect size is modest. In one experiment about **66%** with an intact streak chose another exercise vs about **58%** after a broken streak, "a small, but reliable tendency". Participants would pay costs to repair a broken streak. — [Psychology Today summary, Jun 2023](https://www.psychologytoday.com/us/blog/ulterior-motives/202306/how-broken-streaks-sap-motivation)
- Across nine preregistered studies, observers predict more persistence after a streak, and people are **less likely to adopt costly goal-support tools after a streak**. That is overconfidence: the streak reduces the self-protection people put in place. — [Silverman, Barasch & Small, "Hot streak!", OBHDP 2023](https://vufind-test.katalog.k.utb.cz/SummonRecord/FETCH-LOGICAL-c303t-329b241d6ec052ef17febd36c3c6709e7f63d93ccc3fdc323cdc919a9dd937623)
- Related work extends this to streak-based incentives for work persistence. — [Mehr, Silverman, Sharif, Barasch & Milkman, OBHDP 2025, via UDaily](https://udel.edu/udaily/2024/march/power-of-streaks-motivation-jackie-silverman)
- **Insight Timer-specific backlash:** 27 of 168 one- and two-star reviews in 2026 cited streaks, milestones or "commit to 14 days". These are keyword counts and show direction only. — earlier round, [App Store reviews](https://apps.apple.com/us/app/id337472899?see-all=reviews) (see the report)

**Reminders and push notifications**
- A micro-randomised trial with 1,255 users of a commercial workplace well-being app over 89 days randomised a tailored push at one of six daily times. Users were **3.9% more likely** to self-monitor in the next 24h when sent one (RR 1.039, 95% CI 1.01–1.08). The effect was larger on weekends (**+8.7%**) than weekdays (+2.5%, CI includes 1), though the weekday-weekend difference was not significant (p=.18). — [Bidargaddi et al., JMIR mHealth 2018;6(11):e10123](https://mhealth.jmir.org/2018/11/e10123/)

**Mood check-ins**
- Calm data, a retrospective difference-in-differences study of 2,600 first-time subscribers (summer 2018/2019), around a feature launched Oct 2019 (emoji mood after a session). Check-ins in the prior week were associated with meditating the next week, but the association **did not persist beyond one week**. Eight weeks of check-ins were linked to about **one extra session**. The effect was **largest for previously inactive subscribers**. **Positive** mood check-ins raised the odds of meditating, while negative ones were not associated. The study is observational and the authors are Calm-affiliated. — [Huberty et al., JMIR mHealth 2021;9(4):e27106 (PMC8105761)](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC8105761/); [Calm science page](https://www.calm.com/blog/clinical-studies)
- RCTs of mood self-monitoring show small or inconclusive effects. A 12-week trial in 100 adults with major depression found slightly higher engagement and emotional self-awareness, but the CIs include zero. A youth trial (n=118, NCT00794222) aimed at emotional self-awareness; only the registry entry was found. — [ClinicalTrials.gov NCT00794222](https://clinicaltrials.gov/study/NCT00794222); summary via [JMIR mHealth 2024;e44214](https://mhealth.jmir.org/2024//e44214/)

**Social presence and live**
- No study testing a "meditating with you" or co-presence counter's effect on app engagement was found. — (search result, Nov 2026)
- Qualitative work: live-stream meditation has weaker social presence than in-person sessions but "facilitates attendees in establishing a practice routine and connecting with other meditators". — [arXiv 2402.13992, 2024](https://arxiv.org/html/2402.13992v1)
- A lab study found an embodied robot guide raised social presence in a loving-kindness meditation versus audio-only. That is not an engagement measure. — [Univ. of Glasgow eprint, 2026](https://eprints.gla.ac.uk/386301/2/386301.pdf)
- Peer-support apps had the highest day-30 median (8.9%) in Baumel's panel data (preprint figure; correlation by app type, not a feature test). — [Baumel preprint](https://preprints.jmir.org/preprint/14567)
- Insight Timer: about 10% of users join lives (CTO, 2025, company); 12,000 groups (2020, company). No retention effect was disclosed. — sources above

### Inferences
- **Streaks:** if Aurelia uses a streak, design it for repair: a chapter-based "pick up where you left off", forgiveness, and no self-blame framing. Silverman and Barasch's own moderators point there, and Insight Timer's reviews show the cost of making streaks loud.
- **Check-ins:** the Calm result is the closest analogue to Aurelia's daily check-in. It suggests the check-in brings people back **next week**, mostly among people who were drifting, and mostly when it captures a good moment. Aurelia should (a) put the check-in after the session, not before, since Insight Timer users punish "questions before I can listen"; (b) expect the effect to decay unless the check-in feeds back visibly; and (c) not treat a negative check-in as a retention lever. It needs a care response, not a nudge.
- **Notifications:** expect single-digit percentage lifts per message, and test timing (weekend vs weekday) rather than volume.
- **Co-presence** is cheap to build and plausible, but unproven. Treat it as an experiment, not a known driver.

### Gaps
- No independent evidence was found on teacher-follow, daily-unlock courses/challenges, sleep content or algorithmic recommendations as retention drivers in meditation apps.
- No Insight Timer A/B results on any mechanic are public.
- Full texts of the Medito and mood-monitoring RCT papers were not read (fetch failures).

## 4. The two-sided marketplace: teachers as acquisition and retention

### Takeaway
Teachers are Insight Timer's supply and part of its distribution. Pay is play-based, with a quarter or more tied to next-day return, and courses are a premium carrot. But there is no public number for how many users a teacher brings in, or how teacher-follow affects retention. The marketplace's documented effect on retention is indirect: it pays supply to optimise "come back tomorrow".

### Cited Findings
- Teacher revenue comes from MemberPlus subscription revenue, distributed by play count and content type, with separate earning paths for premium tracks, free tracks and courses. Courses are MemberPlus-only, and "a significant share" of teacher revenue goes to course plays. Donations are paid monthly via PayPal above a US$10 threshold. — [Insight Timer Help: How can teachers earn revenue](https://insight-timer.freshdesk.com/support/solutions/articles/67000664874-how-can-teachers-earn-revenue-from-their-work-); [Course requirements](https://insight-timer.freshdesk.com/support/solutions/articles/67000664708-instructions-and-requirements-for-courses)
- Teacher count grew from about 10,000 (2020) to about 20,000 (2025) to "30k" (2026) [company]. Teacher payouts were up 8% YoY in January 2025 [company]. 25–30% of pay is tied to Return Rate. — see strategy_business.md §2–3 ([Lou Redmond podcast, Mar 2025](https://louredmond.com/podcast-1/2025/03/11/insight-timer-ceo-christopher-plowman-on-teacher-earnings-how-the-platform-is-changing); [Teacher Income FAQ](https://insight-timer.freshdesk.com/support/solutions/articles/67000737721-teacher-income-faq-august-2024))
- Teachers may not "off-ramp" subscribers to sell off-platform [company, 2025]. This shows the company treats teacher audiences as platform retention, not teacher-owned. — [Lou Redmond podcast](https://louredmond.com/podcast-1/2025/03/11/insight-timer-ceo-christopher-plowman-on-teacher-earnings-how-the-platform-is-changing)
- Teacher-side pain: a teacher-run podcast is titled "Losing 50% of My Insight Timer Income: What I'm Doing Next". This is supply-side churn risk. — [The Art & Business of Meditation](https://podcastaddict.com/podcast/the-art-amp-business-of-meditation/4431496)
- 2025 totals for teacher payouts ($18.5M) and revenue ($45M or $72M) appear only on template/"PESTLE" sites with internally inconsistent figures [unverified]. Do not use. — [canvasbusinessmodel.com](https://canvasbusinessmodel.com/products/insight-timer-pestle-analysis); [businessmodelcanvastemplate.com](https://businessmodelcanvastemplate.com/blogs/how-it-works/insight-timer-how-it-works)
- Sensor Tower named Insight Timer "best meditation app" in its APAC Awards 2025 (aggregator report). — [pulse.bot](https://www.pulse.bot/meditation/news/insight-timer-named-best-meditation-app-by-sensor-tower-apac-awards-2025-e03bb5b3-af68-432f-86be-bd0bb05b5a7c)

### Inferences
- The 70% word-of-mouth figure (2020) plus 10k–30k teachers, each promoting their own Insight Timer profile, suggests teachers are a material acquisition channel. No source quantifies it.
- The Return Rate design is the transferable idea for Aurelia: **make "came back the next day" the metric the content engine is optimised on**. Aurelia's generator and chapter design can be scored on next-day return directly, without a teacher payroll to negotiate. The warning from Insight Timer is that optimising for return produced pop-ups and prompts users hated (see §5).

### Gaps
- No number for share of new users arriving via a teacher, teacher-follow rates, or retention of users who follow a teacher vs those who don't.
- No course completion or course-to-subscription conversion figures.

## 5. Known failure points: overload, paywalls, ads, performance

### Takeaway
Insight Timer's documented failure points are self-inflicted friction: prompts and questions before listening, paywalls on previously free basics, findability after redesigns, and streak pressure. These show up as a doubling of 1–2 star review share, 2022 to 2025 (earlier round). Independent evidence that "content overload" hurts meditation-app retention specifically was not found. Insight Timer has no ads, so ad effects are moot for it.

### Cited Findings
- 2026 one- and two-star themes (n=168): prompts or questions before listening (65), paywall on things that used to be free (50), can't find things (36), streaks and commitments (27), video/social-media feel (13), unwanted AI (4). 1–2 star share was 9% (2022) → 23% (2025) → 18% (2026). Keyword counts, directional only. — earlier round, [App Store reviews](https://apps.apple.com/us/app/id337472899?see-all=reviews); details in `reports/Insight Timer deep research.md`
- Engagement correlates with appeal, perceived impact and subjective quality. Engagement is best when experience matches expectations [independent, 2026]. This is consistent with friction and broken expectations, such as paywalling formerly free rewind, driving disengagement. — [JMIR 2026;e71960](https://www.jmir.org/2026/1/e71960/PDF)
- Paywall timing: the teardown shows a soft paywall late in onboarding, after personalisation investment [independent teardown]. Plowman says most new users now meet a paywall in onboarding, and a ~30% UK price cut reportedly raised revenue about 50% [company, 2025]. — [ScreensDesign](https://screensdesign.com/showcase/insight-timermeditate-sleep); [Lou Redmond podcast](https://louredmond.com/podcast-1/2025/03/11/insight-timer-ceo-christopher-plowman-on-teacher-earnings-how-the-platform-is-changing)
- Calm reportedly found renewal-reminder emails 90 days out increased unsubscribes, and stopped messaging inactive users. This is Plowman's second-hand account [company claim about a competitor, 2020]. — [Koetsier 2020](https://johnkoetsier.com/no-selling-allowed-how-insight-timer-is-building-the-biggest-meditation-community-on-the-planet/)

### Inferences
- For a 300k-track library, choice is a plausible cost. The review data shows "can't find things" rather than "too many things". The complaint is navigation after redesigns, not size. Aurelia's one-sentence-to-session model removes the choice step entirely, which is a real advantage if it stays prompt-free before the first play.
- The 30% cut → 50% more revenue anecdote suggests price elasticity in some markets. That is relevant to Aurelia's $100/yr vs Insight Timer's $59.99.

### Gaps
- No independent study of choice overload in meditation or audio-content apps was found in budget.
- No data on app performance (crashes, load time) and Insight Timer retention or ratings.
- No public before/after retention data around the onboarding paywall or the redesigns, only review sentiment.
