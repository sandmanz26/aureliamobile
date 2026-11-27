# Product opportunities: what else we can and should do (27 Nov 2026)

**Written as head of product.** Read-only analysis; no code changed. Sources: `EUGENE-CONTEXT.md` (§0 A1–A46, timeline rows 1–49, §5–§7), every brief in `docs/briefs/` (PDFs skimmed as text), `2026-11-27-gap-check.md`, `2026-11-27-plan-objective-learning.md`, `2026-11-27-admin-ux-audit.md`, `2026-11-27-menu-review.md`, `docs/WORK-JOURNAL.md` Open items (O2–O56) and J196–J205, `docs/research/b2b2c/00-summary.md`, `10-round-2.md`, `11-features.md`, `06-regulation.md`, `docs/api/CHANGE-PLAN-REVIEW.md`, `src/admin/` (pages and data modules, incl. `stateFlips.ts`, `akps.ts`, `costModel.ts`) and `src/versions/releases.ts` (all flags `true` since U144).

**Excluded because other agents are on them now:** tidy 125 StateFlips; one shared 5-dimension list; AKP-driven chapter graph and AKP graph explorer; cost per StateFlip in the Cost report; data sources on every report; trimmed buyer report summary; API contract entities for StateFlip/AKP/chapter/check-in; three metric lines over time; thesis page; next, buyer agent test 8 and the AI brain (Product/Business/Brand prediction, feature ranking vs MVP targets, weekly report). Admin design phase 2 was dropped by the product owner (J205) and is not proposed again.

**Legend.** Effort: S (≤ half a day), M (1–3 days), L (a week or more). Status: **open** (on record, not started), **partly done**, **forgotten** (asked, then no later entry). Dependency: **data** (a file or access we lack), **decision** (owner or business owner), **backend**, or none.

---

## 1. Forgotten or half-done asks

| # | Ask, in his words | Source | Why it matters for MVP validation / his goals | Effort | Dependency | Status |
|---|---|---|---|---|---|---|
| 1.1 | **Meta → Path → Script cascade in the admin.** "Check this tab. Very important you and Claude understand this. It's snapshots of our own Causal AI. Important admin gets right system logic." | Row 45, A28; plan step 2 (B6) | This is how a session is assembled from AKPs: the bridge between the 125 StateFlips / 1,046 AKPs we now have and an actual chapter. Not in the in-progress list, yet he called it "very important". Without it the AKP catalogue reads as a list, not a system. Map the 16 modules to today's build flow and API v2 builds, one worked example (sleep chapter). | M | none (BAR / ELEMENTS xlsx + Notion PDF in hand) | **open** (planned, not started) |
| 1.2 | **Therapeutic funnel in Product lab.** "end the Task with adding Therapeutic funnel into Product Labs.. same as user product mapping.. business funnel.. we need therapeutic map." | Row 40, A4 | The third leg of his triangle. Today the Therapeutic map is a diagram (now labelled "older version") with borrowed buyer numbers; there is no funnel per StateFlip with drop-offs (enrolled → X → Y → Z → held), which is what the feedback group will actually measure. | M | none for sample; real data needs backend | **partly done** |
| 1.3 | **Analysis function of the brain.** "AKPs for: Wellness, Brand, Product, Business + Analysis (Maxwell + TheraGPS). 5 different functions of the Brain. They all need interconnection." | Row 47, A40 | Our AI-brain menu has Wellness, Product, Business and a Brand placeholder; Analysis (MicroBite "Maxwell", TheraGPS "Governor") has no home. A one-page map of his 5 functions to our pages (what exists, what is placeholder, what is prototype-only) prevents "you dropped half my brain". | S | none | **forgotten** |
| 1.4 | **Feedback project rewritten as Digital Retreats / dual track.** "Pls update the feedback Project in Wiki to this model… So its commercially aligned." | Rows 27, 30, 31; A34, O43 part 3 | The playbook is the PM's source of truth for the real-human track. It still describes the 10 Nov free 30-person pilot, not a paid creator cohort with a buyer-agent twin. Round 2 changes the model (free first week, then ticket or Plus), so the rewrite must follow that, not the €19.99-at-the-door spec. | M | decision (free week vs ticket, D2 in §4) | **forgotten** |
| 1.5 | **AI speed and quality appendix.** Speed = compute time per session "30–60 s"; quality "against human-made Spotify-level quality", as GOAL requirements for the backend. | Row 12 ask 5, A32, O25 | Directly feeds the backend (A6) and the Cost report's supplier choice: a session that takes 3 minutes to build kills the aha moment in the funnel. We already hold real supplier prices in `costModel.ts`; latency and quality bars per medium are missing. | S–M | none (public supplier docs) | **forgotten** (never started, since 13 Nov) |
| 1.6 | **2025 backend wiki finish:** black logo, his diagram, 2025 → 2026 as one story. | Row 12 ask 4, row 17, A33 | Small, visible, his oldest unfinished ask; also gives the backend team the lineage of entities (Concept, recommendation service, LLM-as-judge) we now map in API work. | S | data (logo, diagram files) | **forgotten** |
| 1.7 | **Entities as gateways / the Notion entity model.** "entities are the gateways to AKPs, and so Claude can get a sense for what ideas are entities here." | Rows 42, 44; A38 | API entities for StateFlip/AKP/chapter are in progress, but the Notion model's Concept-as-script-goal, nesting, LLM-as-judge and feedback attribution to script entities are not mapped. That attribution is how "tournaments" ever learn. | M | none | **partly done** |
| 1.8 | **Aurelia Pro, corporate wellness.** "How big of a exploration is the make feature propositions for doing Aurelia Pro - cooprate Wellness…" | Row 18, A35, O32 | Round 2 ranks the self-serve team plan second (21 of 60 simulated people buy "if work pays"), and `11-features.md` lists its features. What he asked for, an answer to "how big", is not written: a one-page sizing (employee + HR personas, features, effort vs API v2, emotion-inference ban at work under the EU AI Act). | S | none | **partly done** |
| 1.9 | **Competitor research Calm, Headspace, Waking Up** at Insight Timer depth. | Row 39, A13 | Trust was the top objection (round 2). Knowing how three leaders earn trust and price informs the free-week offer and the creator voice. | M | none | **open** |
| 1.10 | **Google Analytics against our admin.** | Row 38, A14 | The 10 metrics need a real event source the day users arrive; click insights only covers taps. A mapping (GA4 event ↔ metric ↔ admin page) is cheap now and saves a week later. | S | data (GA property access, or plan only) | **open** |
| 1.11 | **The 10 metrics approved and wired;** send the backend team the admin link. | Row 31, A20, O46, O55 | Every report, target and the coming feature ranking needs one metric dictionary. U109 calls them "approved", O46 says pending: a contradiction on record. | S | decision | **partly done** |
| 1.12 | **Healing Map citations verified.** "the math of healing… as medical foundation for our AI." | Row 38, A12 | Now on production (U144) with research links not yet checked. A wrong citation on a "medical foundation" page is the fastest way to lose credibility with an investor or clinician. | S | none | **partly done** |
| 1.13 | **Persisted sign-in for a real retention test (D2).** | Row 4, O17, O23 | The real-human track cannot measure day-7/30 return when every load starts signed out (CLAUDE.md "Sign-in does not persist, on purpose"). This is the gate for the feedback group, not a nice-to-have. | M | backend (or local persistence for the pilot); decision | **forgotten** since 25 Oct |
| 1.14 | **Upgrade offer that names the person's own progress** (funnel decision d4). | O47 | His lighthouse funnel's Plus step; the one funnel decision not built. | S–M | none (app, behind a release flag) | **partly done** |
| 1.15 | **Insight Timer quick wins as an app version;** "Need help now?" link and fixing the every-sign-in check-in. "Its a quick win for us!" | Rows 29, 39; A18, O37 | Safety ("Need help now?") is also a regulatory expectation (crisis handling, `06-regulation.md`) and is first on the B2B2C feature list. | M | decision (mobile change needs explicit permission) | **open** |
| 1.16 | **Retreat as an event, costed.** "AI retreat as an event: cost it." | 26 Nov clarification, A8 | We can ship a costing template with ranges (venue, stay, facilitators, per-seat) instead of waiting idle, then fill it when details arrive. | S | data (event details) | **open** (waiting) |
| 1.17 | **Version thinking.** "In the same way we need to think about our version updates, in Admin and App." | Row 49, A46 | Figma is parked, but the principle is not: a visible admin "What changed" page (from the U-log and RELEASES) shows him the iteration rhythm he values, with no Figma work. | S | none | **forgotten** (parked with Figma) |
| 1.18 | **Cross-split dialogues as a habit.** "cross split dialogues … as a natural habit". | Row 39, A36 | A working rule: every research output checked against journey, funnel and Product lab. Writing it into AI-KNOWLEDGE stops it being lost each session. | S | none | **forgotten** |
| 1.19 | **Icon.** "make the icon correct". | Row 38, A16 | Trivial once we know which; open for 3 days because nobody asked. | S | decision (which icon) | **open** |

**19 items.**

---

## 2. What would most increase his confidence and reduce confusion

| # | Proposal | Grounded in | Why | Effort | Dependency | Status |
|---|---|---|---|---|---|---|
| 2.1 | **Monday delivery sheet:** each of the six committed items (1k AKPs 6h, graph over time 1.5h, sleep detail 1h, how it is calculated 1h, AKPs in our agent 3h, persona system 2h) → the page, the commit, a screenshot, what is draft. | Row 48, A42: "Great! Cool." + 👍 on the invoice note | The commitment is the invoice. A one-page proof of delivery prevents "is it done?" ambiguity and protects payment. | S | none | **open** |
| 2.2 | **"Your asks" tracker in the admin** (Start here): A1–A46 with status, link and date, read from one data file. | His own §0 list exists only in a repo md | He sends bursts (five screenshots an hour) and cannot see what happened to each. One page answers "did you forget X" before he asks. | S–M | none | **open** |
| 2.3 | **Assumptions ledger:** every number that drives a decision (54% success, +1.43 per chapter, 42 → 22 chapters, $4.98 → $0.58 per flip, $1 floor, 20–50% week-8, funnel targets) with origin (his spec / research / ours), and which pilot measurement replaces it. | Gap check §7; §6 of EUGENE-CONTEXT | Data sources per report is in progress; this is the cross-report view. It turns "are these real?" into a plan to make them real, the actual MVP validation path. | S | none | **open** |
| 2.4 | **One end-to-end worked example:** one persona → one StateFlip (sleep) → the AKPs chosen → Meta → Path → Script → chapter → check-ins → chance and cost. | Rows 42–45; "how/what/why is moving user from bad to good sleep" | Pulls every new page into one story he can follow and present. Pairs with 1.1. | M | none | **open** |
| 2.5 | **His vocabulary ↔ ours glossary:** AKP / entity / Lego bite / champion / tournament / chapter vs session / StateFlip / worlds vs dimensions / Maxwell, TheraGPS. | Rows 42, 47 | The admin uses some of his terms and some of ours; the menu review found "StateFlips" and "Therapeutic map" unclear in 5 seconds. `glossary.ts` exists; extend it with his terms. | S | none | **partly done** |
| 2.6 | **Prototype → admin map:** his Figma Make numbers (Wellness 4,590 AKPs, 127 champions; Product 18 dimensions; Command Center 10,087 AKPs) beside ours (1,046 draft AKPs, 409 drafted by us), labelled "prototype value" vs "in our catalogue". | Row 47–48: "No logic behind it more than what you see." | Prevents the expectation that the admin will show 10,000+ AKPs and 89% effectiveness; shows honestly what moved and why. | S | none | **open** |
| 2.7 | **"Decisions for you" one-pager** with our default for each item in §4 and a date by which the default applies. | §4 below | He decides fast when given a default; open items O45–O56 have sat for days because they are buried in the journal. | S | none | **open** |
| 2.8 | **Feature-lock draft for API v1**, written by us for him to sign. | O54; CHANGE-PLAN-REVIEW "features must be locked" | He wants "backend follows product"; backend cannot plan until a lock exists. Drafting it ourselves (Pilot slice: free plan, check-ins, StateFlip sleep, creator journey with free week, payments) removes the blocker. | S | decision (sign-off) | **open** |

**8 items.**

---

## 3. Risks and contradictions to raise with him

| # | Risk / contradiction | His words vs the facts | What to ask or propose | Effort | Dependency |
|---|---|---|---|---|---|
| 3.1 | **Claims vs regulation.** | "Help millions to better health"; TheraGPS "therapeutic precision"; Healing Map "as medical foundation for our AI"; spec "+85.7% sleep", "stress −50%". `06-regulation.md`: treating or preventing insomnia, anxiety or depression makes it a medical device in all four markets; a creator's posts count (MHRA); EU AI Act transparency from 2 Aug 2026; emotion inference at work banned (matters for Aurelia Pro). | A one-line claims policy he signs: wellness wording only ("better everyday sleep"), no numbers outside the app's own logs, "AI" disclosed, synthetic voice marked. Audit admin and wiki labels ("therapeutic", "heal") for public-facing surfaces. | S | decision |
| 3.2 | **Numbers that are assumptions look like results.** | 54% "chance it works", +1.43 a chapter, 42 chapters, 5B flips, $1 floor, 500B variations. All from his spec or deck; none measured. The AI brain's coming "x% chance to reach MVP targets" will be an assumption built on assumptions. | Keep "assumed / predicted / measured" on every number (the code already labels them); show a confidence band, not a point; state that no causal link can be learned before real outcomes. | S | none |
| 3.3 | **AKP data existence.** | "We have around 120 000 AKPs"; prototype 10,087; workbooks give type counts (~1,670 product types, ~1,100 per modality), not instances; our catalogue is 1,046, of which 409 drafted by us. Tournaments "via our backend" need outcome data that does not exist. | Ask directly: does a populated AKP database exist (the 2025 backend, `aureliabase_knowledge`, O31/O33)? If yes, get access and import; if no, say "120,000" is a target, and budget the authoring work. | S (ask) | data / decision |
| 3.4 | **Three different "retreats".** | Retreat-in-a-Box (digital 8-week, €19.99, box); "AI retreat is a physical event" (26 Nov); round 2's "creator journey, free first week". Each has different economics and a different funnel. | Ask which one the pilot is, or confirm: digital creator journey with free week for the pilot, event later. Until then, A8 and the playbook rewrite stay ambiguous. | S | decision |
| 3.5 | **Scope vs his own rule.** | "We need to use our time and compute wisely. Concrete straight forward moves that adds up closer range to MVP validation." vs 5 brain functions, 18 product dimensions, 13 UI/UX dimensions, marketing AKPs, 1,328-version Figma extraction. | Propose a rule: anything not on the path to the first paid pilot goes to the backlog after the feature lock (O54). Show the MVP path on one page (pilot → measures → decision). | S | decision |
| 3.6 | **Unit economics.** | O56: stage 1 loses money per flip on Balanced defaults; spec price anchor $19.99/flip; round 2: freemium beats the ticket. Spec split 60/40 vs approved 70/30 + Plus share. | Confirm the 70/30 terms with him (approved by the product owner, not by him); show the break-even stage in the Cost report as a headline. | S | decision |
| 3.7 | **Synthetic buyers as validation.** | "buyer agents populate the ranking"; feature ranking driven by agents. Our position (J136): agents predict stated intent; v1's 8/10 "try" became 15/36 under calibration. | A feature ranking from agents alone is self-referential; require each top-ranked feature to name the human measure that would confirm it. | S | none |
| 3.8 | **The real-human track cannot start.** | Dual track "looping daily"; but sign-in does not persist, no backend, PM name and start date unknown (O23), no clinical advisor. | Raise as the critical path: without D2 persistence, a PM and a date, there is one track, not two. | — | decision / backend |
| 3.9 | **Admin is unauthenticated (PRD P0) and now holds strategy.** | We are asked to send the admin link to the backend team (O46); `/admin` has no auth; `/api/config` accepts any POST; the site password is in the bundle. | Before sharing more widely, at minimum flag that the admin and wiki (B2B2C economics, his thesis) are readable by anyone with the URL. | S (flag) / M (basic auth) | backend |
| 3.10 | **His name in shared documents.** | Owner's rule (J073, J078): no names in shared docs; B2B2C wiki pages say "Asked by Eugene", "Decisions for Eugene". | Confirm or remove (EUGENE-CONTEXT §7 q8). | S | decision |
| 3.11 | **Record inconsistencies.** | 10 metrics "approved" (U109) vs pending (O46); HANDOFF vs AI-KNOWLEDGE disagree on names. | Resolve in the decision pack. | S | decision |
| 3.12 | **Display-only prototype moved as-is.** | "All this needs to move into our Admin" vs "Just prototypes. No logic behind it." | Move structure, not numbers: every card we port must have a formula or a source, or be labelled placeholder (as Brand is today). | — | none |

**12 items.**

---

## 4. Decisions blocking progress

| # | Decision | Blocks | Owner | Our default | Source |
|---|---|---|---|---|---|
| 4.1 | **Feature lock for API v1** | Backend plan, API v3 delta for AKP/StateFlip, "backend follows product" | Product owner + him | Pilot slice (draft in 2.8) | O54, A19 |
| 4.2 | **Which retreat, at which price** (digital free week vs €19.99 vs €39; event or not) | Playbook rewrite (1.4), event costing (1.16), Phase 0, buyer test 8 stimulus | Him | Digital creator journey, free first week, €19.99 vs €39 after | O45, O49, A8, A21 |
| 4.3 | **Phase 0 go, first market, who interviews creators, backend owner** | Any real paying user | Him | Go; one market (EU or Indonesia); he interviews 5–10 creators | O49 |
| 4.4 | **The 10 metrics and the funnel targets** (one metric dictionary) | Feature ranking vs MVP targets, weekly report, reports | Him | Approve shortlist and eight defaults as v1 | O46, O48, O55, A20 |
| 4.5 | **Feedback group: PM, start date, version, clinical advisor; persistence** | The real-human track entirely | Product owner + him | Prod v3 (staging v5); local persistence for pilot accounts | O23, O41, O17 |
| 4.6 | **AKP priority and usage in our agent** ("the owner sets priority and how it is used") | Committed item (4), chapter assembly | Product owner | Goal AKPs drive selection; strategy AKPs ranked by layer fit | J197 point 4 |
| 4.7 | **Files owed:** marketing AKPs .xlsx, persona screenshots, Gemini deck, "how I wish you to build the prototype" doc, logo + diagram, 2025 repo access | Brand AKPs (A30), persona item, 1.6, 3.3 | Him / product owner | — | J196, J201, O25, O31, O33 |
| 4.8 | **Claims policy** (wellness wording, WHO-5 or not, AI disclosure) | Any public or creator-facing copy; outcomes page | Him + product owner | Wellness-only wording; WHO-5 optional, observational | O21, 3.1 |
| 4.9 | **Mobile change permission** for Insight Timer quick wins / "Need help now?" | 1.15 | Product owner | Allow "Need help now?" only | A18, O37, CLAUDE.md frozen-mobile rule |
| 4.10 | **Which icon** | 1.19 | Him | — | A16 |

**10 items.**

---

## 5. Top-10 recommendation

1. **Monday delivery sheet** for the six committed items (2.1). S. Protects the invoice and his trust this week.
2. **Decision pack with defaults** (2.7 + 4.1–4.5): feature lock draft, retreat model, Phase 0, metrics and targets, feedback group. S. Unblocks backend and the real-human track.
3. **Assumptions ledger + claims policy** (2.3, 3.1, 3.2). S. Keeps the admin honest and keeps Aurelia out of medical-device territory.
4. **Ask the AKP-existence question** and request the 2025 repo (3.3, O31/O33). S. Decides whether "120,000 AKPs" is import work or authoring work.
5. **Meta → Path → Script cascade with one worked sleep example** (1.1 + 2.4). M. His "very important" item, not in progress anywhere.
6. **"Your asks" tracker on Start here** (2.2). S–M. Ends "did you forget X".
7. **Therapeutic funnel per StateFlip with drop-offs** (1.2). M. Completes his triangle and matches what the pilot will measure.
8. **Playbook rewritten as Digital Retreats dual track with a free first week** (1.4), once 4.2 is decided. M.
9. **Persisted sign-in for pilot accounts** (1.13). M. Without it the dual track has one track.
10. **5-function brain map incl. Analysis (Maxwell, TheraGPS) and prototype-vs-ours numbers** (1.3 + 2.6). S. Shows nothing of his brain was dropped, and nothing is faked.

**Counts:** §1 forgotten or half-done 19 · §2 confidence 8 · §3 risks 12 · §4 decisions 10.
