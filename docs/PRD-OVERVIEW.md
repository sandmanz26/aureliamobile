# Aurelia — Product Requirements (overview)

**Status:** Draft for review · **Written:** 11 Nov 2026 · **Covers:** production
(prod v1 and prod v2), staging, and the admin site.

This is the whole product on one page: what Aurelia is, who it is for, what it
does, what is built, what is not, how success is measured, and what has to be
decided next. It is the overview. `docs/PRD.md` holds every detailed
requirement and the reasoning behind each behaviour. The API contract
(`docs/api/API-CONTRACT.md`) holds the backend plan.

> **Everything you can open today is a front-end product on sample data.** No
> account persists, no real AI answers, and every figure (plays, "−43% stress",
> coins) is invented so the demo can be reasoned about. This document marks each
> feature as **Built**, **Built on sample data**, or **Not built**.

---

## 1 · Summary

**Aurelia is a generative wellness companion.** A person says how they feel or
what they need, for example *"I can't fall asleep, my mind keeps racing"*.
Aurelia builds a personal audio-visual session for it: a guided script, a voice,
a soundscape and visuals. They play it, tell Aurelia what to change, and come
back to a journey of chapters that adapts to how they say they feel. Sessions
can be published so others can play them or recreate their own version, with
the original creator always credited.

The product's bet: **a conversation is a better way in than a library.**
Someone who cannot sleep should not have to filter 40 meditations. They should
say one sentence and be listening within a minute.

---

## 2 · The problem

| What people told us | What it means for the product |
| --- | --- |
| Choosing is hard when you already feel bad | Minimal input. Aurelia decides first and the person removes what they do not want. |
| Generic content does not fit *this* feeling | Every session is built for the sentence that started it. |
| Invented numbers are distrusted ("−43% stress?") | No figure is shown that is not the person's own or that nobody measured. |
| Scores can make people anxious | Progress is told in words, with a report every two weeks and detail on demand. |
| "Why is it suggesting this?" | Every suggested change carries a reason (prod v2). |
| Competitive challenges feel wrong for well-being | Challenges without ranks (prod v2). |
| Wearables are wanted, but with consent | Asked once during onboarding, and off until switched on. |

Sources: three real user interviews (Ishmeet, Olivia, Bryan, late Oct 2026),
a simulation with six personas (J039), and the product owner's and Eugene's
reviews. See `docs/HANDOFF.md` §13.

---

## 3 · Who it is for

**The self-directed seeker (primary).** They open the app when something is
off: they cannot sleep, they are stressed before a meeting, their head is
foggy. Success for them is the time from "Ask Aurelia…" to a session playing,
and feeling it worked.

**The community sharer (secondary).** They have made sessions worth sharing
and come back for recognition: plays, recreates, coins. Success for them is
being recreated.

**The operator (internal).** The Aurelia team runs content, safety, AI cost,
revenue and compliance from the admin site. Success for them is seeing a
problem before a user reports it.

**The researcher (internal, new).** They run the 30-person feedback-group
study of therapeutic outcomes, from the admin's Experimentation section.

Personas are inferred from the flows and the interviews. Confirm them with the
business before launch.

---

## 4 · Product principles

These are decisions, not preferences. Each one has a reason recorded in
`docs/PRD.md` or the work journal.

1. **The cockpit is the product.** The chat is where sessions are made.
   Every other screen feeds it or shows what it made.
2. **Recommendations arrive applied.** The person takes away what they do not
   want, rather than opting into each change.
3. **Honesty over impressiveness.** A figure carries its provenance:
   self-reported, measured, or sample. Sample data is never presented as a
   person's own result.
4. **Privacy by default.** Signal sources start off. Consent is stored per
   source. Publishing shares the session, never check-ins, journal, wearable
   data or the conversation.
5. **Attribution is not a toggle.** A recreated session keeps its lineage, and
   the original creator stays credited.
6. **Safety runs on every word a person writes.** A crisis signal goes to a
   person, not to an automated reply.
7. **A change makes a new version, and every version is kept.** v1.0, v1.1, …
   Each can be played or restored.
8. **Staging first; production on request.** Experiments ship as a switchable
   design version before they become anyone's default.

---

## 5 · The product today

### 5.1 Environments and versions

| Site | What it is | Design versions offered |
| --- | --- | --- |
| **Production** (`aureliaprod.vercel.app`) | What the client and end users see. Moves only when the product owner asks. | **prod v1** (= staging v4, the default) and **prod v2** (= staging v5) |
| **Staging** | Every change lands here first, and it is shared for review. | v1 to v5, switchable from the bar at the top |
| **Admin** (`/admin` on each site) | The operator's site, inside the same app. | One version per site |

A design version is a whole-app variant. Versions are cumulative:

| Version | What it adds |
| --- | --- |
| v1 | The app as built from Figma: Home with Ask, cockpit, player, Explore, Sessions, Profile, Progress, Credits, Notifications, Signal sources, auth |
| v2 | Motion, the floating mini player, the share sheet, a tablet layout, Wellness Analysis |
| v3 | A summary of changes, and every build kept in the conversation |
| **v4 = prod v1** | First-run onboarding; the first-session fixes; a five-chapter journey with check-ins and calendar reminders; four bottom tabs (Create, Discover, Progress, Me) |
| **v5 = prod v2** | From the interviews: progress in words, "Why?" on each change, the wearable asked in onboarding, a journal, community without ranks, no analytics on the player |

### 5.2 The core loop

```
Home: "Ask Aurelia…"  →  onboarding (goal, feeling, style; the sentence pre-fills it)
  →  the cockpit: Aurelia replies and proposes changes, already applied
  →  Apply  →  a build: v1.0, then v1.1, v1.2 … every version kept
  →  Play  →  "How do you feel now?" (1–5)  →  journal line (prod v2)
  →  "Chapter 2 is ready tomorrow"  →  calendar reminder
  →  Progress, told in words  →  back to the cockpit
```

### 5.3 Consumer features

Status key: **Built** works end to end in the browser. **Sample** is built
but runs on invented data or a stand-in. **Not built** is designed or planned
only.

| Area | Requirement | prod v1 | prod v2 | Status |
| --- | --- | --- | --- | --- |
| Entry | Home with one ask field and feeling chips; Quick Start plays before sign-in | ✓ | ✓ | Built |
| Entry | Visitor headline "Sessions made for how you feel *today*", no live map | — | ✓ | Built |
| Accounts | Email and password, "Continue with Google"; reset never reveals whether an address exists | ✓ | ✓ | Sample (a demo account; sign-in does not persist) |
| Onboarding | Goal → feeling → style (length, voice, sounds) → editable summary; Skip keeps answers; replay from Settings | ✓ | ✓ | Built (per browser) |
| Onboarding | "Do you wear one of these?" Apple Watch, Whoop, Oura, Not now | — | ✓ | Built; readings are sample |
| Cockpit | One conversation per person, never the demo one; a reply; proposals that follow the person's goal | ✓ | ✓ | Sample (about 20 keyword rules, no model) |
| Cockpit | One list of changes in the "+" sheet; Apply builds a new version | ✓ | ✓ | Built |
| Cockpit | "Why?" on each change: what it does and what it is based on | — | ✓ | Built |
| Cockpit | Voice input | ✓ | ✓ | The microphone is real; the transcript is a fixed sample |
| Cockpit | Free limit counts only after the first build | ✓ | ✓ | Built; the number is a placeholder |
| Player | Play, pause, mute, details sheet; playback survives leaving the player | ✓ | ✓ | Sample (one audio bed for every session) |
| Journey | Five chapters; check-in "How do you feel now?"; next chapter tomorrow with an .ics reminder | ✓ | ✓ | Built (per browser) |
| Journey | After a check-in: a wearable reading, a journal line, what the next chapter changes | — | ✓ | Built; the wearable reading is sample |
| Progress | Goals and data sources, with sample analyses | ✓ | — | Sample |
| Progress | Progress in words from the person's own check-ins; the next two-week report date; a journal | — | ✓ | Built |
| Discover | Community shelves, creators, live, a challenge | ✓ | ✓ | Sample catalogue (26 sessions) |
| Discover | Cards show a summary instead of an outcome claim; tags without "#"; challenge without ranks | — | ✓ | Built |
| Publish | Publish, Republish (only if changed), Unpublish with confirmation; Recreate keeps lineage | ✓ | ✓ | Built for the visit only |
| Publish | A privacy note on what is and is not shared | — | ✓ | Built |
| Me | Library (created / played), Credits & plan, notifications, invite, settings, help, sign-out | ✓ | ✓ | Sample |
| Signals | Signal sources, each consent-gated with its own "Reads" text | ✓ | ✓ | Sample (no real integration) |
| Offline | Every screen opens with no network after one visit; covers show their gradient | ✓ | ✓ | Built |

### 5.4 The admin site

Twenty-one modules in eight groups. Each is described in full in the
[Admin guideline](/guide/admin).

| Group | Modules | On production |
| --- | --- | --- |
| Overview | Dashboard | ✓ |
| People | Users and user detail, Well-being outcomes (WHO-5), Roles & permissions | Outcomes: staging only |
| Experimentation | Feedback group study, version 1 and version 2 | Staging only |
| Content | Sessions, Challenges, Moderation | ✓ |
| Intelligence | AI monitoring, Cockpit rules | ✓ |
| Revenue | Revenue, Pricing, Payments, Coins & rewards | ✓ |
| Growth | Experiments (A/B), Notifications | ✓ |
| Platform | Compliance & privacy, Signal sources, Audit log, Settings | ✓ |

**The admin has no login (P0).** Everything is on sample data and edits last
for the visit only.

### 5.5 Tools around the product

- **`/__demo`** is a feature-flag console that scopes a walkthrough, with a
  "This build" panel naming the site, commit and build time. It is
  deliberately not linked from the app.
- **Review annotations:** numbered pins on phone-width screens, shared per site.
- **Click insights:** screens and taps per visit, labels and positions only,
  never field values.
- **The site password** keeps strangers out of unfinished work. It is a
  courtesy, not security.

---

## 6 · AI

There is no model in the product yet. The cockpit's replies come from keyword
rules, editable in the admin's Cockpit rules. The API contract specifies six AI
capabilities, all server-side:

| Capability | What it does |
| --- | --- |
| Understanding the first sentence | Turns "I can't sleep, my mind races" into a goal, a feeling and a starting style |
| The cockpit conversation | Replies, asks when it must, and proposes changes |
| Proposals with a "Why" | Each change says what it does and what it rests on (goal, last check-in, wearable) |
| The session build | Script, then voice (text-to-speech), then sound, then visuals, as a job with streamed progress |
| The next-chapter plan | What chapter N+1 changes, from the check-ins |
| Progress in words | A plain-language summary of the person's own check-ins |

**A safety layer runs on every user-written input before generation.** A
crisis signal routes to crisis resources and to the on-call reviewer in
Moderation. Quality is scored by an LLM-as-judge rubric on sampled traffic,
and cost and latency are reported per route in AI monitoring.

---

## 7 · Data, privacy and safety

- **Special-category data.** Mood, sleep, voice and biometrics are
  special-category data under GDPR Art. 9. Each purpose is consented
  separately and the consent text is versioned.
- **What publishing shares:** title, sound, visuals and script. Never
  check-ins, the journal, wearable readings or the conversation.
- **Claims.** Outcome figures are labelled self-reported on screen. Aurelia
  does not diagnose and does not claim to cause an improvement.
- **Well-being follow-up.** A WHO-5 of 28 or below is a cue for a person to
  reach out, never an automated action.
- **Today:** nothing leaves the browser except flags, annotations and click
  insights (labels and positions only).

---

## 8 · Business model

**Not decided. The client's pricing is awaited.**

- A **free limit** exists in the product. It counts builds, not messages, and
  only after the first build. The number is a placeholder.
- **Plans:** the admin's Pricing module shows a Free / Plus / Pro design. The
  API contract recommends 5 builds a day free; Plus 30 a day with 20-minute
  sessions and all voices; Pro unlimited within fair use.
- **Coins:** one currency is recommended. Only one earning rule is defined
  today: the referral reward. That rule needs an activation trigger and a cap
  before launch, because sign-up alone is farmable.
- **Creators:** when a recreated session earns coins, part of them follows the
  lineage chain. How far up the chain, and what share, is still open.

---

## 9 · How success is measured

| Metric | Definition | Where it stands |
| --- | --- | --- |
| Activation | A new person plays a built session in their first visit | **Predicted** 57% on v5 (simulation, not measured) |
| Retention | Active on day 1 / day 7 / day 30 | **Predicted** v5: 24% / 11.4% / 6.9%. Benchmark for wellness apps: 20–27% / 8–13% / 3–8% |
| Time to first play | From the first sentence to audio playing | Not instrumented yet |
| Therapeutic outcome | WHO-5 change of 10 points or more; the condition measure reaching the healthy band | The feedback-group study (30 people, 8 weeks) is designed but has not started |
| Share rate | Recreates per published session | Not instrumented yet |

**No retention number can be measured until sign-in persists** (decision D2).
Every predicted figure comes from the J039 simulation, recalibrated with the
three interviews. None of them is a measurement.

---

## 10 · Out of scope (for now)

- Clinical treatment, diagnosis or a medical-device claim.
- An editorial content library. The community is the catalogue.
- Real-time group sessions.
- A native wearable app. Signals come through Apple Health, Whoop and Oura
  integrations.

---

## 11 · Roadmap

From the API contract's phasing. Each phase unblocks the next.

| Phase | Ships | Unblocks |
| --- | --- | --- |
| **P0 · Accounts and persistence** | Sign-in that persists; onboarding, journey, check-ins and journal saved to the account; admin login and the audit log | The first real retention test; the study |
| **P1 · The AI core loop** | Intent from the first sentence, the streamed cockpit, proposals with Why, builds (script → voice → sound), playback, the next-chapter plan, reminders, safety | prod v1 and v2 on real data end to end |
| **P2 · Progress and signals** | Progress in words, two-week reports, Apple Health then Whoop and Oura, push reminders | prod v2's promises without example data |
| **P3 · Community and economy** | Publish and recreate with lineage, challenges, wallet and ledger, plans and payments, notifications | Discover; Me → Credits & plan |
| **P4 · Admin and growth** | Every admin module on real data, the AI policies console, experiments, the outcomes module | Operations at scale |

Alongside: the Flutter app catches up with the web app (O7), and a designer
does a Figma pass on the new screens (O16).

---

## 12 · Risks

| Risk | Why it matters | Mitigation |
| --- | --- | --- |
| A wellness claim without evidence | Regulatory risk and loss of trust | Provenance on every figure; the study before any outcome claim |
| A crisis message gets an automated answer | Harm to a person | A mandatory safety layer, a human on call, crisis resources per country |
| AI cost per build | Margins on a free tier | Per-route effort and model settings, evals before any downgrade, a spend ceiling in Settings |
| Voice quality | The interviews named it | A blind listening test of three text-to-speech vendors |
| The admin has no login | Anyone with the address can change things | Admin SSO with roles in P0 |
| The demo looks real | Promises about things that do not exist | This document's status column; "sample data" labels in the app |

---

## 13 · Open decisions

The full list is the Open items table in `docs/WORK-JOURNAL.md` (O1–O23). The
ones that block the next phase:

| # | Decision | Recommendation |
| --- | --- | --- |
| D2 / O17 | Persist sign-in | Yes. Nothing can be measured without it. |
| Pricing | Free limit N; what Plus and Pro add | Waiting on the client. Contract default: 5 builds a day free. |
| O19 | Make prod v2 (staging v5) the production default? | Yes, once the follow-up with the same three users confirms it |
| O21 | WHO-5 in the app, and who owns follow-ups | Ask at the start and every two weeks with the report, behind consent |
| O22 | API contract decisions, AI vendors, data residency | Accept §2 of the contract as written; decide residency with legal before P1 |
| O23 | Feedback-group study: version 1 or 2; ethics review; start date | Keep v2's Wins and This week, and v1's criteria and data quality |
| O1 | 15 product decisions (versions, lineage payouts, what a play is, …) | Defaults in the logic review |
| PRD §10 | Session lifetime; what earns and spends a coin; public leaderboard; signals switched off; ownership of a recreated session | Each needs an owner's answer before P3 |

---

## 14 · Where to read further

| Document | What it holds |
| --- | --- |
| [Admin guideline](/guide/admin) | Every admin module: purpose, screens, actions, rules, permissions |
| [API contract](/guide/api) | The backend plan: endpoints, data model, AI system, phasing |
| `docs/PRD.md` | Every detailed requirement, with the reasoning |
| `docs/HANDOFF.md` | The whole project: people, rules, state, research |
| `docs/reviews/` | The logic review, simplification plan, retention simulation, v5 proposal, study protocol |
