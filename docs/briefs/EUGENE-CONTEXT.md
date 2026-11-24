# Eugene: everything known about him and his requests

**Last updated 2026-11-24, part 1 of the cost chat received (J168)** (covers inputs up to the owner's 24 Nov approval of the B2B2C redesign, journal J159; retreat funnel U113, names cleaned U114).

**Why this file exists.** The product owner asked on 24 Nov 2026: "tolong simpan semua context eugene yang sudah ada. jangan sampai terlewatkan, taruh dalam md file atau apapun itu." Eugene's material is spread across the work journal, four briefs, the B2B2C research, the handoff, AI-KNOWLEDGE and the session transcript. This is the single place to read it.

**How to keep it current.**
- Every new Eugene input (WhatsApp screenshot, PDF, deck, link, or a request the owner relays from him) gets a new dated row in §3, in the **same push** as its journal J-entry.
- Update §5 (decisions), §6 (adaptations) and §7 (open items) when they move. Move the "Last updated" line.
- Quote him verbatim, spelling included. Mark anything that could not be read or verified.
- No secrets: no passwords, tokens, pairing codes, and no private share links (they are in the transcript and the journal entry; refer to the entry instead).
- This file does not replace the journal. The journal stays the record of each request; this is the index of everything Eugene.

**Sources read for this version:** `docs/WORK-JOURNAL.md` (every J-entry and O-item that mentions Eugene or his topics), `docs/briefs/*` (three Markdown briefs, two PDFs read as text, the xlsx via its review), `docs/AI-KNOWLEDGE.md`, `docs/HANDOFF.md`, `docs/UPDATE-LOG.md`, `docs/research/b2b2c/00-summary.md`, `07-plan.md`, `08-roast.md`, `docs/research/reports/`, and the user messages in the session transcript (`92e8d9f8-….jsonl`, the only session file; it starts 27 Oct 2026, so earlier inputs come from the journal and the transcript's continuation summaries).

---

## 1. Who Eugene is and how to read him

**Role.** Co-founder and business lead of Aurelia. The records name him differently: "lead or founder" (AI-KNOWLEDGE §2), "Owner / stakeholder" (HANDOFF §1), "eugene (owner)" and "client / eugene" in the owner's own messages (13 Nov, 18 Nov). He decides on product direction and commercial model; the session owner runs the build day to day. In the user-journey walkthrough (J123) he is the one who **decides**, the PM owns, design and content read.

**How his input arrives.** Never directly. The session owner (writes in Indonesian; Eugene addresses them as Daniel in WhatsApp, per HANDOFF) forwards:
- WhatsApp screenshots, sometimes with red markings (the markings are the request: HANDOFF A1.4);
- PDFs (Retreat-in-a-Box specs), an xlsx (the 2025 measurement system), a zip (journey blueprint, attributed to him in J142), Google Docs and a Notion wiki (2025 backend), a Gemini deck link (unreadable);
- design frames (Headline in Motion).
Deliverables meant for him are in **English**; the owner is answered in Indonesian.

**His style.**
- **Big frames.** "the grand master PLAN.. bits by bits design an AI that can build the AI"; "Dual tracks"; "Moving from Bad to Good. A lighthouse for the project to reach."
- **Borrowed mechanics.** He imports growth patterns from other categories (dating, social casinos, Duolingo hearts and streak freezes, vertical drama, live gifting) and asks how Aurelia can "reach similar".
- **Invented KPIs as illustration.** His specs carry precise-looking numbers (8,450 participants, 31.4%, sleep +85.7%, stress −50%, 14.2M reach). They are targets or mock values, not measurements, and some contradict each other (§4.3).
- **Thinks in systems and loops**, wants things "simple" in the end ("DONT USE EVERYONE… we still want to keep things simple").
- **Wants AI used visibly:** he asked for the work to be analysed "with AI" (J048), for Claude to pick the top-10 metrics (J136), and for "replica agents" (J148).
- **Quick pace, message bursts** (five screenshots in an hour on 23 Nov, 17:55–18:52).

**Standing cautions (the owner's instructions).**
- 23 Nov 2026, 17:05 UTC: "jujur saya kadang bingung yang dimaksud si eugene. tolong work as head of product, **jangan ditangkap mentah mentah** tapi coba artikulasi goal apa yang sbeetulnya dia mau buat." Read his material as head of product: state the goal underneath, then adapt.
- The owner to Eugene, on the lighthouse: "but still adjust it, to align with our product."
- 11–12 Nov (J073, J078): **do not put Eugene's name in shared documents** ("harusnya kamu tidak perlu memasukan nama eugene di dokumen supaya tidak aneh"). Internal records (this file, the journal) may name him; the wiki front page and share files must not. (The B2B2C wiki pages do name him as the asker and in "Decisions for Eugene"; flagged in §7.)
- 23 Nov (J153): "saya tidak mau eugene ada complain": roast every deliverable as Eugene would before calling it done.
- 18 Nov (J128): the owner once parked his ideas ("oke abaikan dulu yang dipikirkan oleh eugene") to do personas first. Parked is not rejected; O36 still holds them.

---

## 2. His goal in one paragraph

Eugene wants to **prove market fit fast**: do people pay to move from a bad state to a good one ("bad to good sleep"), and do they stay? The vehicle is a **daily dual-track loop**. Track one is real people in **paid, creator-led 8-week digital retreats** (Retreat-in-a-Box, €19.99 a seat, feeding Aurelia Plus); the feedback group becomes the first paid cohort ("So its commercially aligned"). Track two is **buyer agents** walking synthetic personas through the same path. Both are measured the same way, on the same **business funnel** (the lighthouse: frictionless entry → AI aha → usage cap → Plus upsell, plus staying), with a short list of market-fit metrics; the product team fixes the biggest leak and the loop runs again. The admin's **user journey** (an evolving, Trello-like board of moments), **business funnel** and **buyer agent results** are the tools that run that loop. Further out sits the "grand master plan": every pipeline across data and functions has clear logic and recorded decisions, so that eventually **an AI can build the AI**. (Synthesised in J151; confirmed by his own words in J127, J140, J148, J150.)

---

## 3. Timeline of every Eugene input

Dates are the journal's; UTC times are from the transcript where it has the message. "Owner" = the session owner relaying. Status: **done**, **open O##**, **superseded**, **parked**.

| # | Date | What he sent (verbatim where available) | Stored in | J / U | Status |
| --- | --- | --- | --- | --- | --- |
| 1 | 2026-10-18 | WhatsApp: "how can we remove parts without removing?": simplification before beta users arrive with the backend; he mentioned the backend | J013–J015; HANDOFF B.2 | J013, J014, J015 | Beta preset not built: **open O2** |
| 2 | 2026-10-21 | WhatsApp screenshot crossing out the chat's filter row: "This filter system.. should go here below instead..", red line to the "+" sheet above "Improve based on diagnosis" | UPDATE-LOG U045 | J030 / U045 | **done** (v2, v3); two lists remain **open O12** |
| 3 | 2026-10-25 | WhatsApp: UX simplification "without removing much of the core"; the core named as community AI generations incl. profiles, the chat that builds chapters, analytics, the ecosystem of third-party data sources | `docs/reviews/Aurelia-Simplification-Plan-2026-10-25.pdf`; HANDOFF B.3 | J038, J041, J042 / U051 | D1–D6 **done** in v4; D7 Figma pass **open O16**; second pass S1–S7 **open O18** |
| 4 | 2026-10-25 | WhatsApp brief: give Claude the first-time-user retention metric; simulate personas with different wellness needs on the current version with a sequenced questionnaire; "can a user have a simple flow to solve their wellness goal", "why will they return to build more and reach other goals"; probability of return per suggestion | `docs/reviews/Aurelia-Retention-Simulation-2026-10-25.pdf`; HANDOFF B.4 | J039, J040 / U050 | **done**; D2 persistence and real test **open O17** |
| 5 | 2026-10-27 | Wants the work analysed **with AI** ("karena memang eugene mau saya analisa dengan AI", owner) | `docs/reviews/Aurelia-Owner-Report-2026-10-27.pdf` (the "owner report" was for Eugene: probable, from J048) | J047, J048 | **done**; label rule HANDOFF A7.3 |
| 6 | 2026-10-30 | "This header has to follow as you scroll down.." (Explore) | UPDATE-LOG U056 | J054 / U056 | **done** (staging; production later) |
| 7 | 2026-10-30 | "Whats missing is a section on the outputs from user analytics 'how well have each user improved their well-being theraputicly'" | Admin → Well-being outcomes; HANDOFF B.10 | J054 / U056 | built on sample data; WHO-5 etc. **open O21** |
| 8 | 2026-11-10 | "a group of 30 people with different issues/illnesses that will try aurelia for a certain period of time to see if they can solve and win them (bad sleep to good sleep, mental fog to mental clarity etc)"; "make a section in admin for this project where we can track and measure the feedback group in validation of therapeutic outcomes to our MVP"; "Develop a section called experimentation… over 2 months period — and make the PDF that explains the project in close design and reason to the other PDFs" | Admin → Experimentation; `docs/reviews/Aurelia-Feedback-Group-Study-2026-11-10.pdf` | J062 / U058 | **done**; study itself **open O23** |
| 9 | 2026-11-10 | Section hidden "until the client's pricing arrives" (the client is probably Eugene: unverified) | — | J063 / U059 | **superseded** (reopened J064 / U060) |
| 10 | 2026-11-11 | "Design the PDF so it tries to explain the part of admin that is experimental… the process for how to succeed over the course of 2 months testing and iteration… clear what each milestone of the project is about to the project manager who will start… she will find up to 30 users… guiding them daily… using our MVP"; "Let the AI be creative… this market fit validation MVP process."; "Link it to the new section in admin because the new project manager… will use this admin section as source of truth to validation of users' therapeutic goals." | `/wiki/playbook`; `docs/reviews/Aurelia-Feedback-Group-Playbook-2026-11-11.pdf`; `docs/share/Aurelia-Feedback-Group-Playbook.html`; admin Experimentation v2 (Milestones, coaching log) | J067–J074 / U062–U065 | **done**, on production (U064); PM name/start **open O23** |
| 11 | 2026-11-11 (approx.) | A WhatsApp screenshot relayed with "apakah kamu memahami ini ?" (content in the transcript summary only) | transcript summary | — | unverified |
| 12 | 2026-11-13 16:28 | "baca ini, ini ada permintaan dari eugene (owner)" + WhatsApp screenshots + two Google Docs and a Notion wiki (the 2025 backend). Seven asks: (1) playbook "simpler, playful and inspiring (less techy)" so the PM can "win"; (2) Insight Timer replica study by agents; (3) buyer-agents test of v1 with a report; (4) the 2025 backend/AI docs as a /guide tab with a black logo and his diagram, 2025 and 2026 as one story; (5) an AI research appendix: **speed** = compute time from AI partners (text, image, voice, music, video) plus assembly, Eugene guesses **30–60 s**; **quality** = music, voice, text, image and video metrics "against human-made Spotify-level quality", as GOAL requirements for the backend; (6) the final design system in Product requirements; (7) desktop main menu as a narrow icon rail | J088 (records them as "the owner's" requests); links in the transcript | J088–J095 | see rows 13–17 |
| 13 | 2026-11-13 → 16 | (from row 12, ask 2) Insight Timer replica, then deep research | `docs/reviews/insight-timer-replica-2026-11-13.html`; `docs/research/reports/Insight Timer deep research.md` (+ PDF, HTML); `/wiki/research` | J089, J094, J095, J104 / U076, U080 | **done**; recommendations **open O24** |
| 14 | 2026-11-14 | (row 12, ask 3) buyer test of production versions | `docs/reviews/founder-test-prod-versions-2026-11-14.html`, `Aurelia-Founder-Test-2026-11-14.pdf` | J091 | **done**; fixes **open O26** |
| 15 | 2026-11-15 | "Make feedback playbook more simple and playful language" (his line, quoted by the owner) | `/wiki/playbook?v=2`, `?v=3` | J096–J098 / U077, U078 | **done**; default version **open O27** |
| 16 | 2026-11-15 / 16 | Owner: "oke dari convo bersama eugene, tolong recap…", "dari semua chat eugene bisa kamu rekap…" | J093, J103 (recorded as "the owner's requests") | J093, J103 | recap **done** |
| 17 | 2026-11-15 → 17 | (row 12, ask 4) the two unreadable sources arrive as PDFs: "Technical Architecture Documentation", "Wiki Aurelia" | `/wiki/backend-old`, `/wiki/artefact`; HANDOFF B.12 (PDFs kept out of the repo) | J095, J099, J109, J111, J112 / U085 | tabs **done**; black logo, his diagram and the 2025→2026 mapping not done; the 2025 code **open O31**; ask 5 (speed/quality appendix) **not started**, no later entry: **open O25**; ask 6 **done** as the wiki's Design system tab (U083); ask 7 **done** (row 21) |
| 18 | 2026-11-17 | "How big of a exploration is the make feature propositions for doing Aurelia Pro - cooprate Wellness .. the one we built now is for consumer side.. but its really not far to make B2B2C out of it.."; forwarded `Aurelia-Retention-Simulation-2026-10-25.pdf`; "You know making this for coopeate wellness.. suggestions on adaptable features etc" | J110 | J110 | **open O32** (partly answered by the B2B2C research's team tier, row 33) |
| 19 | 2026-11-18 | Journey-blueprint zip and screen recording for an admin "user journey map" (J115 calls it the owner's zip; J142 calls it "Eugene's zip": attribution unverified) | Admin → Product lab → User journey | J115 / U088 | **done** |
| 20 | 2026-11-18 | Tagging and classification for the journey ("info dari user"; likely Eugene: unverified) | `?view=tags` in User journey | J116 / U089 | review **open O34** |
| 21 | 2026-11-18 | Screenshot: "client / eugene mau untuk desktop version ada model sidebar yang bisa di squeeze atau di minimize… tapi nanti ada opsi expand nya"; also: the journey must still "mengakomodir kebutuhan eugene" | admin sidebar rail | J119–J121 / U091–U094 | **done**, on production since U108 |
| 22 | 2026-11-18 | Insight Timer, deeper: "intinya si eugene ini mau benar benar kita bisa mengadopsi apa yang dimiliki insight timer untuk bisa kita ambil dan tiru" | `docs/research/reports/Insight Timer behaviour and journeys.md`; `/wiki/research` | J126, J130 / U095, U098 | **done**; "now" list **open O37** |
| 23 | 2026-11-18 16:11 | On the user journey: "It should be driven by Product team to populate more moments and scenarios across the 4 stages"; "Iron out all possible scenarios moments user might use aurelia for/during"; "So it should be designed as evolving platform"; "A little bit the same way trello or asana works when making task tickets across projects"; "The different purposes and moments"; "So our Claude AI can start to reason and analyze user journey and product logic in a more creative way"; "Pls keep in mind the grand master PLAN.. bits by bits design an AI that can build the AI"; "So all pipelines across data and functions needs to have a clear logic and pathways"; "For accumulation of right decision making once building upwards" | J127 | J127 (answers J122–J124's question) | O35 answered; three phases **open O36** (parked by the owner in J128) |
| 24 | 2026-11-18 → 19 | His idea of a **buyer test agent** (owner: "kalau yang saya tangkap eugene itu ada mau kita buat buyer test agent") | Admin → Product lab → Personas, Buyer agent results | J128, J131–J134 / U096, U099–U102 | built; design **open O38**, next run **open O39** |
| 25 | 2026-11-19 | Owner: run buyer agent v3 using "banyak dokmen dari eugene" as reference | `src/admin/data/buyerRunV3.ts` | J135 / U103 | **done**; Offer B choices **open O40** |
| 26 | 2026-11-19 | "Pls play with core retention metrics. As well, to understand user journey map. Bounce rates, where in the funnel they might be blocked or leave. Whats holding them back from doing more AI plays. Etc etc. Just make sure the designs is as close our upcoming real world feedbackgroup testing project. Also its very good if insights of how we need to test on humans via agent buyers comes in. So admin can become stronger for the process to market fit validation. Ask Claude the top 10 MVP market fit validation metrics. And use them in this buyers agents testing. OK?" | J136 | J136–J139 / U104 | re-run **done**; v4 **open O41**; wearable move **open O42** |
| 27 | 2026-11-19 | Three screenshots: "This funnel. Including MVP metrics for market fit validation. Business logic needs to be similar to user journey but for hard core business values.. market fit validation metrics.. the funnel to it"; "I mean business analytics. Like user journey map. But business funnel map. Incl metrics for mvp market fit validation"; the lighthouse "Moving from Bad to Good"; "Pls include all this as guiding data for the Buyers Agents simulation…"; "…So we do a Dual, one via agentic buyers and one with real world humans… Pls update the feedback Project in Wiki to this model"; Gemini link "Psychology of High-Retention Freemium Apps" (Aurelia Creator-Led Cohort Engine, 11 slides) | J140–J143 | J140–J143 | funnel built in row 32; playbook rewrite as dual track **open O43**; Gemini deck unreadable |
| 28 | 2026-11-23 17:01 | Owner: "kamu masi ingat yan diminta eugene soal retreat a box ?" Nothing on record | — | J147 | **superseded** by rows 29–30 |
| 29 | 2026-11-23 (sent 17:55–18:52) | Five WhatsApp screenshots: replica agents ("Its very important with replica agents to extract all successful features on InsightTimer… Its a quick win for us!"); high-retention freemium psychology (5 verticals, common formula); "Our game in aurelia is State-Flips…" and parts 3–4 (metered AI, frustration backfire); the lighthouse table; dual track. Owner: "keep dulu itu nanti saya berikan lagi supaya lengkap context nya" | `docs/briefs/2026-11-23-eugene-freemium-state-transition.md` | J148 | kept as context; parts 1–2 and the deck still missing: **open O43** |
| 30 | 2026-11-23 17:05 | Two PDFs: "Retreat-in-a-Box: PO Specification & Blueprint" (Admin v0.2.0) and "Retreat-in-a-Box Prototype Functional Requirements & UI Component Spec" (v1.0); WhatsApp: the Gemini deck card, "Pls update the feedback Project in Wiki to this model", "So its commercially aligned", the box mock-up, "Retreat-in-a-Box concept... a physical 'Welcome' card and an elegant gold activation piece to give the 8-week digital journey a tactile sense of occasion", "And here is how I wish you to build the prototype in Admin.." + a Google Doc link (unreadable) | `docs/briefs/2026-11-23-retreat-in-a-box-po-spec.pdf`, `…-functional-spec.pdf`, `2026-11-23-retreat-in-a-box-reading.md` | J149 | five questions **open O45** |
| 31 | 2026-11-23 | Five screenshots + `Measurement_system.xlsx`: approves the owner's tagging + multi-persona buyer plan; Eugene writes the feedback playbook as **Digital Retreats**, the owner owns user journey and business-logic funnel "as a workflow for the product team"; journey as Trello/Asana board; grand master plan, dual tracks via digital retreats and buyer agents **looping daily**; "Check all tabs against our own admin to see if Claude can extract some more angles to how we measure things. DONT USE EVERYONE. Just those Claude AI thinks based on our Admin and MVP product 2026 has important to include for better analysis. It was designed for old Aurelia 2025, so much might not make sense. Let Claude make a deep analysis and return based on importance scores what metrics segment might be useful for the new product design. Because we still want to keep things simple. And use the most critical that Admin doesn't cover."; asks for the admin link for the backend team | `docs/briefs/2025-measurement-system.xlsx`, `2026-11-23-measurement-system-review.md` | J150, J151, J152 | 10 metrics **open O46**; admin link to send **open O46** |
| 32 | 2026-11-23 23:04 | Owner: build the business funnel, put every decision on both sites, "setelah selesai roast ulang lagi dan lakukan improvement, saya tidak mau eugene ada complain." | `/admin/business-funnel`, `src/admin/data/businessFunnel.ts` | J153 / U108, U109 | **done**; targets **open O48** |
| 33 | 2026-11-23 23:21 | "B2B2C ideation, plan, research" (relayed: "ada permintaan dari eugene…") | `/wiki/b2b2c` + nine pages; `docs/research/b2b2c/`; `docs/research/reports/Aurelia B2B2C models and plan.md` | J154, J155 / U110 | research **done**; redesign approved (row 36); rest **open O49** |
| 34 | 2026-11-24 07:52 → 08:01 | Owner asks for the "animated text"; then Eugene's frame "Headline in Motion (Well-being Variations)": "Create the peace / mind / energy / state you imagine.", "Make this animated…", note: 500ms, gentle ease-in-out | `src/components/ui/RotatingWord.tsx` (Home headline) | J156, J157 / U111 | **done** (desktop, both sites); O50 closed |
| 35 | 2026-11-24 08:08 → 08:49 | "sekalian di HP juga deh", "untuk headline motion update juga di prod ya" | same | J158 / U112 | **done** (phones, both sites; explicit mobile request) |
| 36 | 2026-11-24 08:52 | Owner: "oke saya setuju untuk desain ulang, kemudian lakukan pembuatan untuk business funnel nya. harusnya itu akan ada tambahan di admin kan ? tolong simpan semua context eugene yang sudah ada…" Approves the B2B2C redesign of Retreat-in-a-Box; asks for its funnel in the admin and this file | `src/admin/data/retreatFunnel.ts` (header says U113, J159), this file | J159 / U113 (in progress when this file was written; verify in the journal) | redesign **decided**; build in progress |
| 37 | 2026-11-24 19.26–22.25 | Long chat (zip part 1: 15 screenshots plus 2 PDFs). He asks for:
| 38 | 2026-11-24 18.08–18.51 | Chat part 0 (12 screenshots), earlier the same day. **Retreat purpose:** build a global influencer network: 1) reach through retreat leaders, 2) funnel participants into the app, 3) convert to paid plans. Mock-up: "Sahaj Kaur × Aurelia Nervous System Retreat" (box kit, AI companion, live cohort).
| 39 | 2026-11-24 18.55–19.25 | Chat middle part (Archive.zip; 6 of 12 screenshots new). He asks to:
- cross-check research against the user journey and the funnel ("cross split dialogues … as a natural habit");
- give 3 more competitors the Insight Timer depth;
- "include music, image, voice … AVG cost for 3, 5, 10 min sessions … likelihood they succeed with the state-flip".

Causal AI as a broker that learns which Legos drive uplift. Use case: bad to good sleep. **All three parts combined into one task list (A–K)** | `docs/briefs/2026-11-24-chat-combined.md` | J170 | **task list awaiting the owner's confirmation** |

**Tasks:**
- make the icon correct;
- research Google Analytics against our admin;
- Insight Timer quick wins, as a list and then an app version;
- a dynamic **Healing Map**, like Insight Timer's Map of Healing but "ours": a Wellness State Graph that learns from results, "the math of healing… as medical foundation for our AI".

Also: investor visuals (wellness refinery, TeraPhenoms, ping-pong, the Chronal Recalibration game) and two Vimeo videos | `docs/briefs/2026-11-24-chat-part0-healing-map.md` | J169 | **received**; Healing Map in the backlog |
- a compute **Cost** model across text, voice, music, image and video, "how much does it cost to move Bad to Good", current model first then the best tier to see the uplift;
- three metric lines: compute cost, Causal AI velocity and density, therapeutic;
- a graph of cost down against impact up, showing profit;
- the bad-to-good stage process;
- a **therapeutic map in Product lab**, a Product/Business/Wellness triangle with targets;
- a v2 unified wiki and admin knowledge base.

Also: his "mathematical inevitability" thesis (meta-AI, momondo of AI, 5B state-flips, $1 per flip floor); the "MVP, Causal AI & Admin Spec" (simulated stages 42→32→22 chapters, $4.98→$0.58 per flip); the 2025 "AI vision"; the old admin's cost analytics (€40.27 across 5 media). "Pls Prio all these tasks today" | `docs/briefs/2026-11-24-cost-causal-ai-chat-part1.md`, `2026-11-24-mvp-causal-ai-admin-spec.pdf`, `2025-ai-vision-aurelia.pdf` | J168 | **received, more parts coming**; Gemini "chat nr 2" unreadable |

**36 rows.**

---

## 4. His models and documents

### 4.1 The lighthouse: "Moving from Bad to Good" (J140, J148)

"Product and growth lighthouse… A lighthouse for the project to reach."

| Stage | His version | Aurelia's version (adapted, J140/J152/J153) |
| --- | --- | --- |
| 1. Frictionless entry (free tier) | Quick daily check-ins (mood, sleep, energy), basic tracking, zero barrier. Trigger: low-effort habit, sunk-cost data. | Quick Start plays without an account, plus the daily check-in. Both exist. |
| 2. The AI "Aha!" (free sample) | Talk to the AI coach in a bad state ("Why am I waking up at 3 AM?"); the AI connects the dots from logs and gives a micro-plan. Trigger: peak anticipation and trust. | The first personal session that connects their check-ins, with a next chapter; v5's progress in words and Why? are a start. |
| 3. The usage cap ("The Block") | After X free AI messages / analyses / protocols. Trigger: momentum interruption. | The existing free limit: 3 sends, then 30 minutes, counted after the first build (v4, v5). |
| 4. The upsell ("Aurelia Plus") | "Unlock unlimited AI coaching, full sleep/mood trend analysis, and personalized recovery plans with Aurelia Plus." Trigger: loss aversion and relief. | `/upgrade` exists ("Aurelia AI Plus", $10 a month or $100 a year), reached from the free-limit notice; nothing can be bought. Missing: an offer naming the person's own progress (decision d4). |
| (5. Staying) | not in his table | added in the built funnel: back after a week / a month. |

Built as Admin → Product lab → Business funnel (U108, U109): entry → aha → cap → Plus → staying, eight metrics with editable targets (agent defaults: activation 70%, own session finished 60%, feels better 60%, free limit 30%, Plus 15%, back after a week 15%, a month 5%, "very disappointed" 40%: **ours, not his, O48**), agents' prediction beside the feedback group (sample data, shown as a ceiling), biggest gap, Fix next panel, decision log d1–d7.

### 4.2 Freemium psychology and the state-transition model (J148)

Full transcription: `docs/briefs/2026-11-23-eugene-freemium-state-transition.md`.
- **Five verticals** (dating; social casinos and puzzles; gamified edtech and fitness, Duolingo/Strava converting about 8–9% vs a 2–5% freemium average; vertical drama, episode 11 at a cliffhanger, $0.50–1.00 an episode; live streaming gifting). Median day-30 retention across categories about 4%.
- **Common formula:** zero-friction entry; interrupt peak momentum (paywall mid-experience, never before value is felt); price the relief, not the product.
- **Aurelia:** "Our game in aurelia is State-Flips.. reaching wellness Objective... bad to good sleep… we have to find the sweet spot - when user starts moving from Bad to Good Sleep.. we ask for Aurleia Plus subscription"; "a state-transition freemium model powered by an AI metering paywall". Monetises relief and transformation.
- **Part 3, metered AI beats static paywalls:** personalisation lock-in, natural value scaling (casual users free at low inference cost), contextual timing.
- **Part 4, risks:** "frustration backfire"; "Don't block mid-crisis"; show a "good state" preview ("Sleep improves +14% when you follow…").
- **Missing:** parts 1 and 2; the Gemini deck (11 slides).

### 4.3 Retreat-in-a-Box (J149; both PDFs read as text for this file)

**PO Specification & Blueprint (Admin v0.2.0, "Growth & Creator Engine Module").**
- Vision: scale "Aurelia's validated 8-Week Digital Retreat program ('Moving from Bad to Good')" into a self-serve **B2B2C creator engine** in the admin; vetted wellness creators, co-branded retreat infrastructure.
- Wave 1 targets: **50** handpicked creators; **14.2M** combined reach (Substack, YouTube, IG, TikTok); **8,450** participants (about **169** seats per cohort, cap **200**); **€168,915** gross at **€19.99**; **~30%** of graduates to Plus at **€9.99/mo**.
- Navigation: a GROWTH section with Retreat-in-a-Box [50], Creator Payouts (Stripe Connect), Aurelia Plus Funnel; touchpoints to People (Day 1 vs Day 56 outcomes), Product (AI Studio prompts), Revenue (**60/40** split, Plus attribution).
- Screen 1 KPI bar: 50/50 creators, 14.2M, 8,450, €168,915, **31.4%** Plus graduation; tier pills Substack (Anchor), YouTube (Habit), Instagram (Community), TikTok (Discovery); cohort cards with seat fill (196/200), WoW retention (92.4%), cohort revenue (€3,918.04).
- Screen 2 "+ Handpick Creator" drawer: profile, co-branded landing page `aurelia.app/retreat/[slug]`, ticket €19.99, split 60/40, cap 200, Stripe Connect ID, "Aurelia Plus Trial Bundle: Included 8-Week Access Mode".
- Screen 3 curriculum: Week 1 Baseline Assessment & Deconstruction; 2 Regulating the Physical Baseline; 3 Pattern Identification & Cognitive Reframing; 4 Mid-Point Reflection & Integration; 5 Constructing Daily Micro-Routines; 6 Navigating External Triggers; 7 Consolidating Emotional Resilience; 8 Graduation & Aurelia Plus Transition. AI Studio prompt customiser with a `<creator_philosophy_override>` block; **hard-coded clinical guardrails stay active**; two live sessions (week 1 keynote, week 8 Q&A) and Sunday discussion prompts.
- Screen 4 outcomes: sleep **4.2 → 7.8 (+85.7%)**, stress **7.8 → 3.9 (−50%)**, reflection 1.2 → 5.6 sessions/wk (+366.6%); funnel 8,450 → week 4 **84.2%** (7,114) → week 8 **76.5%** (6,464) → Plus **31.4%** (2,653) → ARR **€318,041**. Metered trigger at **15+ weekly AI interactions**; graduation offer **€7.99/mo for life** vs €9.99.
- Data model (CreatorCohort, CohortParticipant, RetreatTemplate) and PostgreSQL tables; roadmap Sprint 1 UI shell with data for 30 founding / 50 simulated creators, Sprint 2 provisioning + Stripe, Sprint 3 payouts + outcomes; design tokens Warm Alabaster #FAF9F6, Dark Espresso #1E160E, Aurelia Gold #E2A84B, Playfair Display + Plus Jakarta Sans.

**Functional Requirements & UI Spec (v1.0).** Growth model "444 total cohort runs to secure 15,000 paid Aurelia Plus subscribers"; `/admin/growth/retreats`; `<KPIBar />` polled every 30 s over WebSocket; `<PlatformFilterPills />`, `<CohortCard />`, `<ProvisioningDrawer />` (reach min 10,000; niches Sleep, Nervous System, Circadian Health, Mindfulness; price locked at 19.99 for the MVP wave; seats 50–500); REST endpoints `GET /api/v1/admin/growth/retreats`, `POST …/provision`; its own CSS tokens; sprint checklists. Sample creator names in its JSON are examples.

**The box (WhatsApp only):** a physical welcome card and "an elegant gold activation piece".

**Our reading:** see §5 and §6; full text in `2026-11-23-retreat-in-a-box-reading.md`; redesign in §5.

### 4.4 The 2025 measurement system and the 10 metrics (J150)

`docs/briefs/2025-measurement-system.xlsx`: 8 tabs (IVAN 28 rows, Sheet17 16, Wellness 89, User Experince 46, Business 48, three example tabs), about 250 rows, built for the 2025 creator product. About 230 rows do not fit 2026. Shortlist (scored decides × measurable × gap, keep ≥12), in `2026-11-23-measurement-system-review.md`:

| Group | Metric | Score | Funnel stage |
| --- | --- | --- | --- |
| Getting started | 1 Time to first play (+ share playing on first visit) | 27 | entry |
| | 2 Drop-off point inside a session | 27 | entry |
| Coming back | 3 Measured return D1/D7/D30 by cohort | 18 | staying |
| | 4 Forgiving consistency, sessions in last 7 days ("4 of 7") | 18 | staying |
| State flip | 5 Before → after a session (check-in) | 18 | aha |
| | 6 Time to flip, first low check-in → steady good one ("Eugene's sweet spot") | 18 | staying |
| What works | 7 Building-block effect (utility index idea) | 18 | aha |
| | 8 Supply against demand | 12 | — (user journey coverage) |
| Paying and cost | 9 Cap → Plus within 7 days | 18 | cap / upsell |
| | 10 CAC and LTV:CAC by channel (creator, retreat, organic) | 9, kept as the retreat's number | — |

Distinct from the **ten MVP market-fit metrics** proposed in J136 for buyer agents: activation, funnel drop-off by step, first-session completion, D1/D7/D30, repeat AI plays and second-build rate, felt better, Sean Ellis "very disappointed" (40% bar), willingness to pay, recommend/referrals, ranked leave reasons. The agent can predict 1, 2, 7, 8, 9, 10 and estimate 3, 5, 6; only people give 4 and real values.

### 4.5 B2B2C: ideation, plan, research (J154, J155)

`/wiki/b2b2c` (summary) and nine pages from `docs/research/b2b2c/`; full report `docs/research/reports/Aurelia B2B2C models and plan.md`. Five tracks, about 330 links in notes, 184 cited.
- **Answer:** go to market through people who already have the customer; paid ads do not pay back (2.9% install → payer, about **$100–170** of media per payer).
- **Retreat-in-a-Box as specified breaks** on: the split (creators keep **87–97%** elsewhere; Maven 10%, Patreon 10%, Teachable 0–7.5%, Kajabi 0%); AI cost (Aurelia's **€6.45** share of a €19.99 web ticket vs about $13 for 24 personalised premium-voice sessions, a loss of about €6.75); the box (**$14–28** delivered, fulfilment $9–18); **76.5%** at week 8 (about 16× mindfulness apps at day 30; 4.7% at day 30 in J154).
- A full 200-seat cohort earns a creator about **€1,936** at 60%.
- Ranking (/18): trial codes and gifting 16; **creator cohort, redesigned 15**; retreat and studio aftercare 14; team tier for small employers 13 (about **$50–70 a seat a year**); insurers/DiGA/NHS 6–7.
- Per 100 ticket buyers: about **3 / 10.5 / 23** Plus (low / middle / spec); a full wave of 50 × 200: about **300 / 1,050 / 2,300** (estimates).
- Regulation: claims decide medical-device status; feelings are health data; crisis protocol mandatory (California SB 243); EU AI Act bans emotion inference at work.
- **Plan:** Phase 0 (about 4 weeks, no backend): buyer agent v5 on the redesigned retreat (€19.99 vs €39, with/without digital kit); **Eugene interviews 5–10 creators** (Indonesia included); claims pack and creator contract; admin prototype on sample data; answer O45. Gate 0: at least three creators would sell on affordable terms. Phase 1 needs a minimum backend (accounts, payments with Aurelia as merchant of record, consented storage, crisis flow, age gate, no ad pixels on feelings screens): 3–5 creators. **Five pilot numbers:** median paid seats ≥100; active at week 8 ≥35%; Plus per ticket buyer ≥8%; refunds <10%; AI + payment cost < a third of Aurelia's share. Phases 2–3: 20, then 50 creators; wearables; Indonesian carrier billing.
- **Roast** (`/wiki/b2b2c/roast`): nine fixes, two of them read as Eugene ("You tell me my numbers are wrong. What is the answer for Retreat-in-a-Box?"; "What does a full wave of 50 creators give us?").
- "Redesign" means the offer's **terms**, never the UI (J155).

### 4.6 Aurelia Pro, corporate wellness (J110)

A scope estimate and proposal, not a build: a company pays, employees use the consumer app. Not the 2025 "pro" (creators). Reusable: admin, feedback-group study, WHO-5 outcomes, challenges and community without ranks, roles. New: company and seats, invite code or SSO, HR dashboard with anonymous aggregates and a minimum group size, company content, per-company crisis/EAP link, buyer reporting, per-seat billing, an employee privacy promise. Exploration 1–2 days; building needs backend and accounts. The B2B2C research now covers employers (team tier $50–70/seat/yr; 38% of enrolled employees used any digital tool; 44% never opened the app).

### 4.7 Headline in Motion (J157, J158)

His frame: "Headline in Motion (Well-being Variations)", "Create the peace / mind / energy / state you imagine.", "Make this animated…", 500ms gentle ease-in-out. Built: Home headline, the gold italic word cycles peace → mind → energy → state, each shown 2.6 s, 500ms ease-in-out cross-fade, still under reduced motion, every version, every width, both sites. The cycle never says "space" (the word that misled an interviewed user, U053).

### 4.8 The user journey as a Trello-like board (J115–J127, J143–J144)

Admin → Product lab → User journey: 4 stages (Reflect / Create / Experience / Share), 10 moments, 8 tag groups, screens tied to the Product surface tag, persona demand per moment, a 9-step guided overlay. His intent (row 23): product-team driven, every scenario across the 4 stages, an evolving board like Trello/Asana, data Claude can reason over, decisions accumulated along clear pathways. Proposed phases (O36): (1) shared storage, status workflow Idea → Validated → Planned → Building → Live → Measured, owner, Board view, activity log; (2) scenario template, evidence, decision log, export to the knowledge base; (3) AI assist after a backend. Blocker: edits are per browser.

### 4.9 Buyer agents (J132–J139, J146, J153)

His idea, built as Product lab → Personas (300 synthetic, generator 2 coherent) and Buyer agent results (v1 demo 10 personas; v2 36; v3 A/B on his documents: trying 13 → 25, paying 0 → 4 yes; re-run on production v1–v3 with the ten metrics; dashboard; the re-run now walks the cap: 15% hit it, 9% of those choose Plus). Guard rails: compare A vs B, never absolute rates; validate with real people. Next: v4 on real screens (O41), v5 on the funnel and the retreat offer (O43, O49).

### 4.10 Feedback group, playbook and Experimentation (J062–J074, J096–J098)

30 people, six cohorts, 8-week single-arm pilot, WHO-5 (and ISI, PSS-10), Admin → Experimentation v1/v2 (Milestones M0–M5, Wins, This week, Engagement, coaching log), protocol PDF, playbook in three versions (Original, Mission guide, Quick start) at `/wiki/playbook`. His later direction: rewrite it as **Digital Retreats** on the dual track (he said he would write it himself, J150), the group becoming the first paid cohort. Not yet rewritten (O43).

### 4.11 Simplification (J013–J015, J038, J043)

"Remove parts without removing": reduce what people see, not the features. J038 found 7 ways to start creating, progress on 6 screens under 4 names, coins in about 10 headers. Built in v4 (U051): four tabs Create / Discover / Progress / Me matching his four core features, coins only in Me, Insights retired, one change list. Open: D7 Figma pass (O16), S1–S7 second pass (O18), beta preset (O2).

### 4.12 Well-being outcomes (J054)

Admin → Well-being outcomes: WHO-5 every two weeks, ≥10-point change meaningful, ≤28 flags a human follow-up, check-ins and resting heart rate, framed as observational, sample data (O21).

### 4.13 The 2025 backend documents (J088–J112)

Deep Dive (10 slides), Technical Architecture Documentation (6 pages), Wiki Aurelia (20 pages): prompts, Pydantic shapes, a rubric, principles, **no code**. The 2025 product was a creator tool (campaigns, Luma AI, Beatoven.ai, TTS, LLM-scored `utility_index` −1…1). Wiki tabs Backend (old) and Artefact (eleven lessons). The 2025 Python codebase must be asked for (O31).

---

## 5. Decisions taken on his requests

| Date | Decision | Where |
| --- | --- | --- |
| 2026-10-21 | Filter moved into the "+" sheet; its line shows the largest gain, not a sum | U045 |
| 2026-10-26 | Simplification D1–D6 built in v4 only; v2/v3 untouched | J042, U051 |
| 2026-10-27 | AI-produced analysis carries "AI analysis · Based on Claude self-analysis and deep research" | J048, HANDOFF A7.3 |
| 2026-11-10 | Feedback group as a pre-registered single-arm 8-week pilot, pseudonymous ids, sample data until backend | J062, U058 |
| 2026-11-11 | Playbook + coaching log; playbook first in the wiki and on production | J067, J071, U062–U064 |
| 2026-11-11/12 | No personal names in shared documents | J073, J078 |
| 2026-11-12 | The wiki is identical on staging and production | J076 |
| 2026-11-18 | User journey = internal opportunity map owned by the product team (Eugene confirmed) | J122, J127 |
| 2026-11-18 | Desktop admin sidebar folds to a 72px rail, minimised by default | U091–U094 |
| 2026-11-19 | Buyer agents predict stated intent; behaviour (retention, bounce) is measured on people; every metric marked predicted or measured | J136 |
| 2026-11-19 | A/B to test: production v3 (staging v5) vs production v2 (staging v4) | J138 |
| 2026-11-23 | Business funnel built as the hub; status and biggest gap from agents only; feedback group shown as a ceiling; never show a gap without a next move | J153, U108, U109 |
| 2026-11-23 | Every staging-only flag released to production ("animasi" read as the sidebar rail) | J153 |
| 2026-11-23 | Retreat-in-a-Box: build only Sprint 1 on sample data marked as targets, in our design system, under the existing Growth group; spec fonts/colours not used | J149, AI-KNOWLEDGE |
| 2026-11-24 | Headline in Motion on every width, every version, both sites | U111, U112 |
| **2026-11-24** | **The owner approved the B2B2C redesign of Retreat-in-a-Box** ("oke saya setuju untuk desain ulang"): split **70/30 plus a share of the Plus each cohort drives**; **one pre-produced journey in the creator's voice with personal inserts** instead of 24 fully personalised sessions; a **digital welcome kit** (physical box only as a paid add-on); **test €19.99 against €39**; targets **20–50% active at week 8** (not 76.5%), with **Plus measured per ticket buyer**; **no invented outcome claims** ("+85.7% sleep", "stress −50%" never used). Its funnel goes into the admin (U113, J159, in progress). Still Eugene's to confirm: Phase 0, creator interviews, first market, backend owner (O49). | J155, J159 |

---

## 6. Where we disagreed with or adapted his material, and why

| His material | What we did | Why |
| --- | --- | --- |
| Invented KPIs (8,450; 31.4%; 14.2M; €318,041; "validated" programme) | Labelled as targets or examples; never shown as results | Nothing is validated: no backend, no paying user, no 8-week programme (the app has a five-chapter journey). The app removed invented numbers on purpose after interviews (J049, U053). |
| Numbers that disagree | Called out | 31.4% is of enrollees (41% of graduates); ARR ignores the €7.99 graduate price (about €254,370); 444 runs → 15,000 means about 20%, not 31%. |
| Health claims (+85.7% sleep, stress −50%, "Sleep improves +14%") | Never used; a preview must use the person's own logs or say it is an example | Claims decide medical-device status; they are mock values. |
| 60/40 split | 70/30 plus a Plus share (approved 24 Nov) | Creators keep 87–97% on course platforms; €1,936 per full cohort will not attract big creators. |
| 24 fully personalised sessions per buyer | Pre-produced creator-voice journey + personal inserts | Voice cost would exceed Aurelia's €6.45 share. |
| Physical box in every seat | Digital kit; box as paid add-on | $14–28 delivered is most of the ticket; undefined in the PDFs. |
| 76.5% active at week 8, 30% to Plus | 20–50% target; Plus per ticket buyer; pilot gate ≥35%, ≥8% | Mindfulness apps keep about 4.7% at day 30; no public benchmark for programme → subscription. |
| Streak protection, Duolingo hearts, blocking at peak momentum, cold paywalls | Not adopted; cap only after the aha, never mid-session or at night, block new builds not replays; d7 "staying" uses the check-in's next-chapter time, **no streaks** | Insight Timer research: streak pop-ups and misplaced paywalls are top leave reasons (1–2 star share 9% → 23%). His own part 4 ("Don't block mid-crisis") agrees. |
| Spec design tokens (Playfair, Plus Jakarta Sans, own colours, new nav) | Our admin design system and groups | One design system; ours is already espresso and cream. |
| Creator "philosophy override" | Clinical guardrails non-negotiable per creator | Safety stays fixed (his spec agrees). |
| 2025 measurement sheet (~250 rows) | 10 metrics only | 230 rows measure the 2025 product; he asked to keep it simple. |
| "Business logic" for the funnel | Read as business analytics (an admin map), not backend logic | His own clarification: "I mean business analytics. Like user journey map." |
| Funnel targets | Agent defaults, editable, pending his confirmation | They are ours, not his (O48). |
| Buyer agents as validation | Prediction only, compared A vs B, then checked against people | Synthetic buyers are too agreeable; v1's 8/10 "try" became 15/36 under calibration. |
| Insurers / clinical routes (implied by "therapeutic outcomes") | Out of scope for now | Requires becoming a medical device; Headspace and Pear write-downs. |
| "Therapeutic" outcomes | Framed as observational, self-reported, not proof or diagnosis | Compliance wording needed (O21). |
| Headline on phones | First desktop only, then phones on explicit request | Mobile layout frozen unless asked (CLAUDE.md). |

---

## 7. Open questions for Eugene and open items

**Questions to put to him (from the briefs and plan):**
1. Retreat prototype: who is it for (internal, creators, investors)? Do the 30 founding creators exist, real names or invented? Is the box for every participant or a premium edition, and inside €19.99? Does €19.99 include Plus for the 8 weeks ("Included 8-Week Access Mode")? Is the 8-week curriculum a longer journey or a separate programme from today's five chapters? (O45)
2. B2B2C: approve Phase 0 and who interviews creators (the plan names him); confirm the redesign terms with creators; which ticket to test; the pilot's first market (EU, UK, US or Indonesia); who builds the minimum backend and when; confirm insurers and clinical claims are out. (O49)
3. Funnel targets: confirm or change the eight defaults; pick which proposed decision (d1–d4, d7) first. (O48)
4. The 10 metrics: approve the shortlist (U109 calls them "his ten approved metrics", but O46 still lists approval as pending: unresolved). (O46)
5. Send: the Gemini deck as text/PDF; parts 1–2 of the strategic breakdown; the readable Google Doc "how I wish you to build the prototype in Admin"; his diagram and the black logo for the backend tab; the 2025 repository and access. (O43, O25, O31)
6. Aurelia Pro: go ahead with the exploration, and validate with whom (a pilot company?). (O32)
7. The feedback group: PM name and start date, recruitment, incentive, clinical advisor, which design version they see. (O23, O41)
8. Wiki B2B2C pages name him ("Asked by Eugene", "Decisions for Eugene") despite the no-names rule for shared documents (J078): confirm whether that is acceptable for this tab. (not yet an O item)

**Open items that involve him (text as in the journal, shortened only where noted):**

| # | Item |
| --- | --- |
| O2 | Beta simplification list: what stays visible, merged, behind flags. Product owner + Eugene to agree; then a "Beta" preset in `/__demo`. |
| O16 | Simplification: still open D7 (a designer's Figma pass for the tab bar, Me rows, Recent, Library chips); storybook stories for `TabBar`; Flutter; production question. Product owner + Eugene, then a designer. |
| O17 | Retention follow-ups: D2 persisted sign-in for a real retention test; the real 8–12 person test; empty states; R10; stories. Product owner + Eugene. |
| O18 | Second simplification pass S1–S7 (all v4). Product owner + Eugene. |
| O19 | v5: promote or keep on staging; real wearable backend; voice choice; friends/local groups; sharing reward; two-week report; persistence. Product owner + Eugene; backend. |
| O21 | Well-being outcomes: confirm WHO-5 and when; backend storage; Compliance wording; who owns follow-up at WHO-5 ≤ 28. Product owner + Eugene; backend; compliance. |
| O22 | API contract decisions: persistence, limits, versions, free-plan N and Plus/Pro, AI cost posture, vendors, residency, safety, payments, WHO-5, hosting. Product owner + Eugene; legal; engineering. |
| O23 | Feedback-group study: which version, recruitment and incentive, clinical advisor and ethics, licensing, start date (needs D2), PM name and start date, coaching log needs backend. Product owner + Eugene; clinical advisor. |
| O25 | His 13 Nov asks not finished: AI speed/quality appendix (his 30–60 s and Spotify-level quality goals), the backend tab's black logo and diagram, 2025→2026 alignment. |
| O31 | The 2025 backend code: ask for the repository and access. Product owner / Eugene. |
| O32 | Aurelia Pro / corporate wellness exploration (employee and HR personas). |
| O35 | Purpose of the user journey: **answered by Eugene (J127)**. |
| O36 | User journey as an evolving platform, three phases. Product owner + Eugene (parked J128). |
| O37 | Insight Timer round 2 "now" list (incl. the every-sign-in check-in, "Need help now?"). Product owner + Eugene. |
| O38 | Buyer test agent design and where it runs. Product owner + Eugene. |
| O40 | Offer B: which of v3's changes first (no account first 16, languages 13, data line 11, …); larger text for 65+, student price. Product owner + Eugene. |
| O41 | Buyer agent v4 and the feedback group: real screens, ten metrics predicted vs measured, human test plan; needs group date, size, countries, ages, design version. Product owner + Eugene. |
| O42 | Move v5's wearable question to after the first session. |
| O43 | Business funnel model: (1) funnel, built (U108); (2) buyer agent v5 walks it; (3) wiki playbook rewritten as the dual track. Needs the Gemini deck. Brief kept in `docs/briefs/`; more context to come. Product owner + Eugene. |
| O45 | Retreat-in-a-Box: the five questions, then the order (Sprint 1 prototype on staging; buyer agent v5 on €19.99; the wiki feedback project as first paid cohort; backend only after validation). Product owner + Eugene. |
| O46 | The 10 metrics: approve; add to buyer agent reports and admin pages; send Eugene the staging admin link for the backend team, password given privately. Product owner + Eugene. |
| O47 | Mostly done (U108), except d4 (upgrade offer naming the person's own progress) and the Retreat cockpit (O45). |
| O48 | Funnel targets and proposed decisions. Product owner + Eugene. |
| O49 | B2B2C plan: approve Phase 0; the redesign (**approved by the owner 24 Nov**); first market; minimum backend owner; insurers and clinical claims out. Eugene + product owner. |
| O50 | Closed: it was his Headline in Motion (U111, U112). |

---

## 8. File map

**Briefs (his material and our readings):** `docs/briefs/`
- `2026-11-23-eugene-freemium-state-transition.md`: transcription of row 29.
- `2026-11-23-retreat-in-a-box-po-spec.pdf`, `2026-11-23-retreat-in-a-box-functional-spec.pdf`: his PDFs (row 30).
- `2026-11-23-retreat-in-a-box-reading.md`: head-of-product reading, five questions.
- `2025-measurement-system.xlsx`: his workbook (row 31); `2026-11-23-measurement-system-review.md`: the 10 metrics.
- `EUGENE-CONTEXT.md`: this file.

**Research for him:** `docs/research/b2b2c/00-summary.md` … `09-full-report.md`; `docs/research/reports/Aurelia B2B2C models and plan.md`, `Insight Timer deep research.md`, `Insight Timer behaviour and journeys.md`, `Aurelia-Insight-Timer-Deep-Research-2026-11-15.pdf`, `insight-timer-deep-research.html`; notes in `docs/research/research_notes/`.

**Reports:** `docs/reviews/` — `Aurelia-Simplification-Plan-2026-10-25.pdf`, `Aurelia-Retention-Simulation-2026-10-25.pdf`, `Aurelia-Owner-Report-2026-10-27.pdf`, `Aurelia-v5-Proposal-2026-10-27.pdf`, `Aurelia-Feedback-Group-Study-2026-11-10.pdf`, `Aurelia-Feedback-Group-Playbook-2026-11-11.pdf`, `insight-timer-replica-2026-11-13.html`, `founder-test-prod-versions-2026-11-14.html`, `Aurelia-Founder-Test-2026-11-14.pdf` (each with its HTML/folder). Share files: `docs/share/Aurelia-Feedback-Group-Playbook.html` and the three other branded documents.

**Wiki (`/wiki`, identical on both sites):** `/wiki/playbook` (`src/guides/content/pm-playbook*.html`), `/wiki/research` (`research-insight-timer.html`), `/wiki/b2b2c` and `/wiki/b2b2c/{ideation,creators,employers,partners,economics,regulation,plan,roast,sources}` (`src/guides/docPages.ts`, `GuidePage.tsx`), `/wiki/backend-old`, `/wiki/artefact`, `/wiki/admin` (admin guideline), `/wiki/design-system`.

**Admin (`/admin`):**
- `/admin/business-funnel`: `src/admin/pages/BusinessFunnelPage.tsx`, `src/admin/data/businessFunnel.ts`; creator retreat funnel `src/admin/data/retreatFunnel.ts` (+ test; U113/J159; view `?view=retreat`).
- `/admin/buyer-agent`: `BuyerResultsPage.tsx`, `pages/buyer/`, `data/buyerRuns.ts`, `buyerRunV2.ts`, `buyerRunV3.ts`, `buyerSim.ts`, `buyerRerunSummaries.ts`.
- `/admin/personas`: `PersonasPage.tsx`, `data/personas.ts`.
- `/admin/user-journey` (tags at `?view=tags`): `UserJourneyPage.tsx`, `data/userJourney.ts`, `journeyTags.ts`, `journeyBundle.ts`.
- `/admin/experimentation`, `/admin/experimentation/v2`, `/admin/experimentation/:pid`: `ExperimentationPage.tsx`, `ExperimentationV2Page.tsx`, `data/study.ts`, `coachingLog.ts`.
- `/admin/outcomes`: `OutcomesPage.tsx`, `data/outcomes.ts`.
- Sidebar rail: `src/admin/AdminLayout.tsx`.

**App:** Home headline `src/components/ui/RotatingWord.tsx` (Headline in Motion); `/upgrade` (the existing upsell); free limit in `ChatPage.tsx`.

**Records:** `docs/WORK-JOURNAL.md` (rows in §3), `docs/UPDATE-LOG.md` (U045, U050–U051, U056, U058–U065, U077–U079, U085, U088–U114), `docs/HANDOFF.md` (§1 People, §14 open decisions, B.2–B.4, B.10, B.12, §17 ledger), `docs/AI-KNOWLEDGE.md` (§2 People, §6 positions).

---

## Unverified or inconsistent points found while compiling

- **Names.** HANDOFF §1 calls him "Eugene (Eugene Werner)" and says he addresses the session owner as Daniel; AI-KNOWLEDGE §2 calls the session owner "Werner". One of them is wrong.
- **J088–J103 say "the owner's requests";** the transcript shows the owner said "permintaan dari eugene (owner)" (13 Nov) and "convo bersama eugene" / "semua chat eugene" (J093, J103). Those seven asks, the playbook-tone request and the recaps are Eugene's.
- **His speed/quality numbers** (30–60 s; Spotify-level quality) appear only in the transcript summary, not in J088, and the appendix was never built.
- **Journey blueprint zip:** "owner's" in J115, "Eugene's" in J142.
- **"Client's pricing"** (J063) is probably Eugene's; not confirmed.
- **The "owner report"** (J047) was probably for Eugene (J048's reason); not confirmed.
- **"Approved" metrics:** U109 says his ten metrics were approved; O46 says approval is pending.
- **The 11 Nov "apakah kamu memahami ini ?"** screenshot's content is not recorded anywhere.
- **The Gemini deck and the Google Doc** links were never readable.
