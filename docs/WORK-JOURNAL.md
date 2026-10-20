# Work journal — every request, not only code

`docs/UPDATE-LOG.md` records **code changes** (U-IDs, commits, patches,
reverts). This journal records **everything that was asked**, including the
requests that changed no code: questions answered, analyses, proposals,
discussions, decisions still open, and operational steps such as Figma pairing.
Started 2026-10-20 at the product owner's request: "setiap hal kamu harus catat
dalam sebuah md, tidak boleh terlewatkan".

**Rules for whoever works here next (human or agent):**

1. Every request gets a J-entry, in the same push as any code it produced.
2. A request that changed code also gets its U-entry in `UPDATE-LOG.md`. The
   J-entry links to it rather than repeating it.
3. Write down what was **answered or proposed**, not only what was done. The
   reasoning is what gets lost.
4. Anything waiting on a decision goes into **Open items** at the top and stays
   there until it is decided. Record the decision in the entry that made it.
5. Do not record secrets. Pairing codes expire in 5 minutes; log that one was
   issued, not the code.

Entries J001–J017 were reconstructed on 2026-10-20 from this session's
transcript and the update log. Everything from J018 on was written at the time.

---

## Open items (waiting on a decision)

| # | Item | Raised in | Waiting on |
| --- | --- | --- | --- |
| O1 | **15 product decisions** with recommended defaults (free-plan limit, version model, live vs current, unpublish, fork source, lineage rules and payouts, conversation model, what a "play" is, challenge winners, one currency, safety and claims, identity, analytics consent) | J012, `docs/reviews/Aurelia-Logic-Review-2026-10-18.pdf` §11 | Product owner: accept the defaults or change them |
| O2 | **Beta simplification list**: what stays visible, what is merged, what goes behind flags | J015 | Product owner + Eugene to agree. Then build a "Beta" preset in `/__demo` and add flags for coins in the header and Recreate on the player |
| O3 | **Promote to production**: `web_prod` is at `4140e59`; staging carries U030–U038 | J005 onward | Product owner request (production moves only on request) |
| O4 | **Sticky player**: U037 added Close. Options A (swipe away + Undo) and C (auto-hide after 30 min paused) were proposed and not yet chosen | J008, J011 | Product owner |
| O5 | **Free limit counts "Apply"**, so three applies trip it. This conflicts with v3's "keep experimenting" | J020 | Decision O1 #1 (limit model) |
| O6 | **Two version systems** (cockpit ids vs Progress ids), so the earlier-version cards play the current recording | J011, J020 | Decision O1 #3 |
| O7 | **mobile_app (Flutter)** lacks U032–U038 (feeling chips, reply, Play rule, lineage/version/publish details, Connect toast, v3) | J008 onward | A mobile pass when scheduled |

---

## Index

| ID | Date | Kind | Request (short) | Code |
| --- | --- | --- | --- | --- |
| J001 | ≤2026-10-14 | Question | URL for the owner panel | — |
| J002 | 2026-10-14 | Bug | Mobile still showed the old generating animation | U026 |
| J003 | 2026-10-14 | Code | Make the animated generating card the default | U026 |
| J004 | 2026-10-14 | Code | New Home logo, Invite/Help icons | U027, U028 |
| J005 | 2026-10-14 | Ops | Promote all of staging v2 to production | U029 |
| J006 | 2026-10-15 | Code | Desktop fixes: Quick Start, Live Sessions, Monthly Challenge | U030, U031, U033 |
| J007 | 2026-10-15 | Code | Click-detection tool, then per-element detail | U032, U034 |
| J008 | 2026-10-15 | Code + Proposal | Six product points (feelings, sign-in width, limit, reply, Play icon, sticky player idea) | U036 |
| J009 | 2026-10-15 | Code | Home network artwork in Three.js, hidden behind a flag | U035 |
| J010 | 2026-10-18 | Question | "Do you understand this app?" | — |
| J011 | 2026-10-18 | Code | Card heights, See All, player Close, version history, publish date | U037 |
| J012 | 2026-10-18 | Analysis | PDF of odd or missing logic | U037 (docs) |
| J013 | 2026-10-18 | Discussion | Eugene: "remove parts without removing?" | — |
| J014 | 2026-10-18 | Question | Why did Eugene mention the backend? | — |
| J015 | 2026-10-18 | Proposal | What to hide for beta | — |
| J016 | 2026-10-19 | Ops | Figma pairing code (×1) | — |
| J017 | 2026-10-20 | Ops | Figma pairing code (×2) | — |
| J018 | 2026-10-20 | Check | Does Publish have loading/success states? | — |
| J019 | 2026-10-20 | Code | Figma "My Wellness – Connect" | U038 |
| J020 | 2026-10-20 | Code | Sheet width + v3 change summary + every build kept | U038 |
| J021 | 2026-10-20 | Process | Record everything in an md | this file |

---

## Entries

### J001 — Owner panel URL
- **Asked:** "bisa berikan url untuk owner panel?"
- **Answered:** `/admin` (the admin CMS) and `/__demo` (the feature-flag console). Noted that `/admin` has no authentication (P0).
- **Follow-up:** none chosen.

### J002 — Old generating animation on mobile
- **Asked:** on mobile the music-generation animation still used the old design.
- **Found:** the new card was behind a local, never-published flag (`chat.generatingV2`), so other devices saw the default.
- **Outcome:** see J003.

### J003 — Make the new generating card the default
- **Code:** U026. The flag was removed and the animated card is the only one.

### J004 — Home logo, Invite and Help icons
- **Code:** U027 (vector logo replaces the blurry PNG), U028 (SVG icons).

### J005 — Promote staging v2 to production
- **Ops:** `web_prod` fast-forwarded (U029). Production pinned to v2 (decided in U020).

### J006 — Desktop layout fixes
- **Code:** U030 (Quick Start squashed), U031 (Live Sessions full-width banner), U033 (Monthly Challenge 320px on desktop).
- **Asked afterwards:** whether to promote U030/U031. No answer yet (O3).

### J007 — Click detection
- **Asked:** a tool to understand how users use the app, with results that can be reviewed later. Then: more detail per element, not only per page.
- **Code:** U032 (screens, taps, paths, heatmap, `/__demo/insights`), U034 (element kind, section, position, state, timing, rage/dead taps, result).
- **Note:** on by default; a privacy and consent decision is needed before production (O1 #15).

### J008 — Six product points
- **Code (U036):** feeling chips on Home; sign-in fills 540px; limit copy says new sessions are free; reply-to-message; header Play only once something exists.
- **Proposal (no code):** sticky player options A–D, recommending A + C (O4).

### J009 — Three.js network artwork
- **Code:** U035. Measured from the PNG; off by default; `/__demo` → 3D network (+ Motion).

### J010 — "Do you understand this app?"
- **Answered** with a summary of the product, its core loops, the technical facts (stack, mock data, branches, flags, versions), the working rules, and the known gaps. No code.

### J011 — Card heights, See All, Close, version history, publish date
- **Code:** U037.
- **Standing instruction received:** from now on, think as a senior PM and flag what is missing.

### J012 — Logic review PDF
- **Asked:** a PDF (in English) of logic that is odd or missing. The owner noted that earlier logic questions had gone unanswered.
- **Delivered:** `docs/reviews/Aurelia-Logic-Review-2026-10-18.pdf` (source `.html` beside it). 43 findings (6 critical, 16 high, 14 medium, 4 low, 4 fixed) and 15 decisions with recommended defaults (O1).
- **Top five:** the free limit never lifts while also being unlimited; two version systems; Recreate on the player forks the wrong session; lineage has no data behind it; challenge win criteria contradict each other.

### J013 — Eugene: "how can we remove parts without removing?"
- **Context:** WhatsApp thread. Eugene wants simplification before beta users arrive with the backend.
- **Explained:** reduce what the user *sees and must think about*, not the features. Techniques: show when needed, one main path, smart defaults, hold features behind flags, merge similar screens.
- **Suggested reply to Eugene** (English) proposing a beta of the core loop only, with social and economy features behind flags.

### J014 — Why did Eugene mention the backend?
- **Explained:** today everything is mock, so features cost nothing. Once the backend lands, every visible feature needs backend work, a decided rule, and support for real users, and too many features blur beta feedback. Simplification is about **backend scope and feedback quality**, not just UI.

### J015 — What to hide for beta (proposal)
- **Keep:** Home Ask + feeling chips, cockpit (chat, build, reply), player + mini player, Sessions (own), sign-in/settings/sign-out, Upgrade only once pricing exists.
- **Merge:** the recommendation deck into "applied by default + Change"; Quick Start into Ask + chips; Progress + Details into one screen; full version history into a one-step undo.
- **Hide behind flags:** Publish, Recreate + Lineage, Coins/Credits/Invite reward, Challenges/Leaderboard, Explore community shelves, other people's profiles, Live Sessions, Wellness scores and claims, Notifications, Session settings, promo banner, 3D network.
- **Effect:** navigation becomes Home, Chat, Sessions, Settings. Beta backend shrinks to accounts, conversations, builds, audio, simple version history and limits. Open decisions drop from 15 to about 6.
- **Offered:** a "Beta" preset in `/__demo` plus the missing flags (O2).

### J016 — Figma pairing
- **Ops:** a pairing code was issued for the Figma Desktop Bridge (Cloud Mode). Codes expire in 5 minutes and are not recorded.

### J017 — Figma pairing again
- **Ops:** two more codes were issued on request.

### J018 — Do the Publish states exist?
- **Checked:** yes. `PublishSheet` covers Publishing (spinner + Cancel) → Session Published! (View Session), plus Unpublished. These match the Figma frames Session/Chat/Publish, /Loading and /Success.
- **Flagged:** Publish can still be pressed while a build is running (review B3, O1 #4).

### J019 — Figma "My Wellness – Connect" (16883:18480)
- **Found:** the screen already existed. The differences were the request sheet styling and the success state.
- **Code (U038):** sheet matched to the frame (input 44px/r16, Send 51px/r16 #331B04). After Send, the Figma centred dialog appears: green send-2 icon, "Your recommendation has been sent!", Done. Specs were read directly from the Figma file through the Figma bridge.

### J020 — Sheet width, v3 change summary, builds kept in the thread
- **Asked:** the "+" sheet is not full width; improve it with a summary before applying (in v3); in v3 every Apply should keep its own result, like an AI chat.
- **Code (U038):** all 8 bottom sheets are full width below 640px. New design **Version 3** (cumulative over v2). The v3 sheet is a list with a pre-apply summary that does not sum percentages. Each build stays in the thread with its own card and says what went into it.
- **Flagged:** three applies trip the free limit (O5); earlier-version cards play the current recording (O6).

### J021 — Record everything in an md
- **Asked:** "setiap hal kamu harus catat dalam sebuah md, tidak boleh terlewatkan".
- **Done:** created this journal with rules, open items, an index, and reconstructed entries J001–J020. Added the rule to `CLAUDE.md` so every future session keeps it.
