# Aurelia — handoff

The complete picture for whoever (human or model) picks this project up next:
the context, the people and how they work, the state of every branch and
environment, how the code is put together, how work is recorded and shipped,
how to verify it honestly, and what is still open.

> **Status:** written 1 Nov 2026; brought up to date 17 Nov 2026 (U084 / J109).
> `web_app`, `admin_cms` and `web_prod` are at the same head. **§17 is the
> complete ledger of every request (J) and every code change (U)** and is
> kept current in the same push as the work, so nothing asked or changed is
> missing from this file. If the branch heads have moved, trust `git log` and
> the logs (§9) over the prose snapshot in §4.

**Read order for a cold start:** §1 → §2 (and Appendix A, the complete rulebook) → §3 → §4, then `CLAUDE.md` (the
authoritative engineering conventions), then whichever later section your task
touches. §12 lists the traps that cost the most time; skim it before your
first change.

---

## Contents

1. [What Aurelia is, and who is involved](#1--what-aurelia-is-and-who-is-involved)
2. [Standing rules (non-negotiable)](#2--standing-rules-non-negotiable)
3. [Repository, branches, environments](#3--repository-branches-environments)
4. [Where things stand right now](#4--where-things-stand-right-now)
5. [Stack and architecture](#5--stack-and-architecture)
6. [Design versions (v1–v5, and production's own two)](#6--design-versions-v1v5-and-productions-own-two)
7. [Feature map by version, with files](#7--feature-map-by-version-with-files)
8. [Admin CMS](#8--admin-cms)
9. [How work is recorded (U / J / O / CHANGE-LOG / patches)](#9--how-work-is-recorded)
10. [How work is shipped (staging, production, CI, deploys)](#10--how-work-is-shipped)
11. [How to verify (recipes that work here)](#11--how-to-verify)
12. [Traps this project has actually hit](#12--traps-this-project-has-actually-hit)
13. [Research, reports and deliverables](#13--research-reports-and-deliverables)
14. [Open decisions and known gaps](#14--open-decisions-and-known-gaps)
15. [Tools and connectors available to an agent](#15--tools-and-connectors)
16. [Glossary](#16--glossary)
17. [Ledger: every request and every change](#17--ledger-every-request-and-every-change)
- [Appendix A · The rulebook: every rule of the game, with its source](#appendix-a--the-rulebook-every-rule-of-the-game-with-its-source)
- [Appendix B · Research compendium: every result](#appendix-b--research-compendium-every-result)

---

## 1 · What Aurelia is, and who is involved

**Aurelia** is a generative wellness app. A person says how they feel or what
they want ("I can't fall asleep, my mind keeps racing"). Aurelia builds a
personal audio-visual session for it (meditation, breathwork, sleep), and the
person changes it through a conversation (the "cockpit"). Sessions can be
published, played and recreated by others. A community layer (Discover,
creators, challenges) and a coin economy sit around it. A wearable or other
"signal sources" can inform the sessions.

**Everything is a front-end demo on mock data.** There is no backend: no
accounts, no real AI, no real wearable data. The plumbing (TanStack Query,
typed HTTP, storage, error reporting, three small serverless endpoints on
Upstash KV) is production-grade, so a backend can plug in. The data is
deliberately realistic and invented. Treat every figure in `src/lib/` and
`src/admin/data/` as sample data.

**Two clients.** The React web app in this repository (`web_app`) is the
**reference implementation**. The Flutter app (`mobile_app`) follows it, and
is currently far behind (§4).

### People

| Who | Role | How they show up |
| --- | --- | --- |
| **The session owner** | Runs these Claude sessions and decides day to day. Writes in **Indonesian**. Eugene addresses them as Daniel in WhatsApp. | The requests in the work journal. Often forwards Eugene's or users' feedback as screenshots. |
| **Eugene** (Eugene Werner) | Owner / stakeholder. Gives product feedback, often by WhatsApp screenshot. Asked for the work to be analysed "with AI". | Quoted in J038, J047–J048, J054 ("This header has to follow as you scroll down", the admin well-being outcomes request). |
| **Ishmeet, Olivia, Bryan** | The first three real users interviewed (late Oct 2026). Their feedback produced design v5. | J049; the v5 proposal report. |
| **Six simulated personas** | Maya, Sari, Tom, Raka, Dewi, Leo: the AI-simulated first-time users of the retention simulation. | J039, J046; the retention and owner reports. |

Use **they/them** for anyone whose pronouns have not been stated.

### How the session owner likes to work

- **Reply in Indonesian.** Deliverables for others (reports, PDFs, user
  updates) are in **English**, in plain language.
- **Act as a senior PM / product designer**, not only an engineer: interpret
  feedback, propose, recommend, and say what the recommendation rests on.
- Reports for the owner use a fixed format: before → suggestion → now →
  impact. They tag figures **Measured** vs **Predicted** and carry the label
  "AI analysis · Based on Claude self-analysis and deep research" (§13).
- They often forward a screenshot with one line of text. Read the
  screenshot carefully: the red markings are the request.
- They like a short status in chat and the detail in the logs.

---

## 2 · Standing rules (non-negotiable)

Each of these came from the owner, or from a mistake that was expensive once.

1. **Staging first; production moves only on explicit request.** Every commit
   lands on `web_app` (and `admin_cms`). `web_prod` is fast-forwarded *only*
   when the session owner asks ("naikkan ke production", "di prod juga …").
   Work being finished is not a reason. Never commit on `web_prod`. If
   `--ff-only` fails, stop and say so.
2. **`admin_cms` is byte-identical to `web_app`.** After every push to
   `web_app`, run `git checkout admin_cms && git merge --ff-only web_app &&
   git push origin admin_cms`.
3. **The mobile web layout (below `lg:`, the 402px frame) is frozen**, unless
   the user explicitly asks for a mobile change. Desktop work goes in `lg:`
   utilities. Check every desktop change at 402px.
4. **Do not dirty earlier design versions.** "Jangan sampai mengotori v2." A new
   idea goes into a new version (or the version the owner names). Prove v1–vN
   are unchanged with a pixel comparison (§11.4).
5. **Every request is logged, code or not** (§9): a J-entry for every request;
   for code, also a U-entry, a patch file and a CHANGE-LOG entry, all in the
   same push. Anything awaiting a decision goes into **Open items**.
6. **No secrets in any document or commit message.** That covers site
   passwords, pairing codes and tokens. The site passwords are given in chat
   only; they live in `src/demo/siteLock.ts` and can be overridden by
   `VITE_SITE_PASSWORD`.
7. **Never run Prettier** (no config; it would reformat the tree).
8. **Never edit `src/styles/tokens.css`.** It is generated from
   `design-tokens/figma-export.json` (`npm run build:tokens`).
9. **Commit messages** end with the attribution trailer the session provides
   (`Co-Authored-By: …` and `Claude-Session: …`). Do **not** put a model
   identifier in commits, PR text, code or docs.
10. **No pull request** unless asked. The workflow is direct pushes to the
    branches above.
11. Verify before claiming. Run `npm run check`, build, and drive the real app
    in a browser for anything visual. Report failures as failures.
12. **Every request and every change also lands in this file** (owner,
    17 Nov 2026: "pastikan semua permintaan, changes selalu disimpan dalam
    handoff md agar tidak ada yang terhilang"). In the same push as the
    work: add the J row (and the U row, for code) to §17, and update §4 when
    the state moves. `src/guides/records.test.ts` fails `npm run check` (and
    CI) when a J or U id in the journal or the update log is missing here.
14. **Keep `docs/AI-KNOWLEDGE.md` current** (owner, J129): every request adds
    what was learned (people, rules, state, positions, traps), rewriting stale
    lines, and moves its "Covers up to J###". A test fails when it is behind.
13. **The knowledge-base repository is updated only on request** (J114).
    `danielaurelia26/aureliabase_knowledge` holds the wiki as Markdown, made
    by `scripts/knowledge/export.py`. Run and push it only when the owner
    asks; never as part of other work.

---

## 3 · Repository, branches, environments

Repository: **`sandmanz26/aureliamobile`** (GitHub). One app per branch:

| Branch | What | Head (1 Nov) | Moves |
| --- | --- | --- | --- |
| `web_app` | React app: consumer client + admin CMS. **Work happens here.** Staging. | `e5c3dcf` | every change |
| `admin_cms` | Identical to `web_app` | `e5c3dcf` | ff after every `web_app` push |
| `web_prod` | Production cut of `web_app` | same as `web_app` (U064) | ff **on request only** |
| `mobile_app` | Flutter 3.x client | `2e3f202` (27 Sep) | stale, see §14 |
| `storybook` | Storybook catalogue of `src/components/` | `6e144b7` (27 Sep) | stale, see §14 |
| `claude/figma-variable-check-t6kazm` | The branch a fresh cloud session may open on: an almost empty Flutter scaffold, reverted. **Not the app.** | `ea49ba6` | — |

> **First thing in a fresh container:** `git fetch origin web_app && git
> checkout -B web_app origin/web_app && npm install`. A cloud session can
> start on the scaffold branch above, where `CLAUDE.md`, `docs/` and
> `package.json` do not exist. That looks like data loss, but it is only the
> wrong branch.

### Deployments (Vercel)

| Vercel project | Branch | What it is |
| --- | --- | --- |
| `aureliamobile` | `web_app` (Vercel "preview" = **Staging**) | staging site |
| `aureliaprod` | `web_prod` (Vercel "production") | **https://aureliaprod.vercel.app** (admin: `/admin`) |
| `storybook` | `storybook` | component catalogue |

- Deploy status is visible on GitHub as commit statuses ("Vercel –
  aureliaprod", etc.): `gh api repos/sandmanz26/aureliamobile/commits/<sha>/statuses`.
- `VERCEL_ENV` is read at build time:
  - it sets the environment label (Production / Staging / Local) in the build badge and in `/__demo`;
  - it picks the KV key scope (production uses the bare key; other deployments append the branch);
  - it decides which design version is the default (§6).
- **Both sites are behind a shared password** (`src/demo/siteLock.ts`). It
  differs between staging and production. It is a courtesy, not security: it
  is inlined into the bundle. The password values are not written here.
  `/__demo` (the flag console) sits outside the lock.
- **Environment variables:**
  - `KV_REST_API_URL` / `KV_REST_API_TOKEN` (or the `UPSTASH_*` equivalents): Upstash, used by `/api/config`, `/api/annotations` and `/api/clicks`. Without them every endpoint reports `configured: false`.
  - `VITE_SITE_PASSWORD`: overrides the default site password.
  - `VITE_PRODUCTION_URL`, `VITE_STAGING_URL`: optional cross-links in `/__demo`.
- **CI:** `.github/workflows/ci.yml` runs typecheck, lint, test and build on
  every push to the web branches. A red run is never promoted.

---

## 4 · Where things stand right now

### 23 Nov 2026 (J153)

On request, **nothing waits behind `RELEASES` any more**: journey tags, the folding desktop sidebar rail, personas, buyer agent results and the new Business funnel are on staging and production, and `web_prod` was fast-forwarded (U108). The funnel (`/admin/business-funnel`) is the hub of Eugene's loop: stages, targets, agents beside people, the biggest gap, the decision log, and since U109 a Fix next panel. Open: O43, O45, O46, O48.

### 17 Nov 2026 in one paragraph

All three web branches are at the same head (U083). Since J076 every
documents change ships to production too, and new app work waits behind
`RELEASES`. Production offers three design versions of its own since U075
(prod v1 = staging v3, prod v2 = staging v4, prod v3 = staging v5, the
default). The team documents are the **Wiki** at `/wiki` (U083; `/guide/*`
and `/designsystem` redirect): Feedback group playbook (v1–v3), Admin
guideline (v1–v3), Product requirements, API contract, Research (Insight
Timer deep research, screenshots, competitors), Backend (old) and Artefact
(the three 2025 backend documents: what to reuse, what they teach; U085) and Design system (live from
the Figma export and the components). The work since 13 Nov is mostly
research and documents for Eugene's brief (J088–J109); the decisions it
raised are O24–O31. The older snapshot below is kept for history.

### Production (`web_prod` = `web_app`, U061, 11 Nov 2026)

- **Version bar and picker are visible on production** (U054, temporary; owner
  said "nanti kita clean up"). Production offers **two versions of its own**
  (U055):
  - **prod v1 = staging v4.** This is the default every visitor sees.
  - **prod v2 = staging v5.** Opt-in, saved per browser.
- It includes everything up to U061:
  - the U056 chat box and Discover header;
  - admin Well-being outcomes;
  - the v5 Why? fix;
  - admin Experimentation v1 and v2;
  - the team documents at **`/wiki`** (was `/guide` until U083; feedback playbook, admin guideline, `docs/PRD-OVERVIEW.md`, API contract, Research, Design system), behind the site password.

### Staging (`web_app`)

Level with production (U072, 13 Nov 2026). Everything in `RELEASES` (`src/versions/releases.ts`) is on for both sites:
- the Chapter card;
- Personal journeys;
- the daily check-in and Journal (on the session's About page);
- the simplified player;
- the analytics redesign (v1–v4; v5 unchanged);
- the About page in every version.

**Standing rule (J076):** `/wiki` stays identical on both sites. New app work that should wait goes behind a `RELEASES` flag set to `BUILD.environment !== 'production'`, and is turned on only on request.

### Last things delivered (most recent first)

The full list is §17. Since 13 Nov:

- **J130 / U098:** Insight Timer round 2 in the wiki Research tab (default v2): behaviour, 11 journey flow charts, adopt/avoid after a roast; Mermaid charts.
- **J129 / U097:** `docs/AI-KNOWLEDGE.md`, the agent's working knowledge for other AIs, updated every request and enforced by a test.
- **J128 / U096:** admin Product lab (User journey, Personas); 300 seeded synthetic personas for AI-run research (staging only, `RELEASES.personas`).
- **J121 / U094:** desktop sidebar sizes made consistent (20px icons, 56px rail tiles, 72px rail); staging only.
- **J120 / U093:** desktop sidebar starts on the rail; expanded it is 232px with tighter rows (staging only).
- **J119 / U091–U092:** desktop sidebar folds to an icon rail (staging only, `RELEASES.sidebarRail`); the admin user journey reworked into one page with tabs and one side panel (Journey tags merged in; `/admin/journey-tags` redirects).
- **J118 / U090:** admin sidebar groups fold and the sidebar is sticky; the admin's phone menu button (hidden by the v4/v5 `Open menu` rule) is back. Staging; production on request.
- **J116 / U089:** admin module Product → Journey tags (`/admin/journey-tags`), the journey's tagging for review; staging only (`RELEASES.journeyTags`, O34).
- **J115 / U088:** admin module Product → User journey (`/admin/user-journey`), the owner's journey map, on staging and production.
- **J114 / U087:** knowledge-base export of the wiki; the push to `danielaurelia26/aureliabase_knowledge` waits for access (O33), and future updates happen only on request.
- **J113 / U086:** the API contract rewritten to read as a team document (info table, plain overview, no internal review codes).
- **J112 / U085:** wiki tabs Backend (old) and Artefact, from the three 2025 backend documents.
- **J109:** gap analysis of the three 2025 backend sources against today, and what can be reused (Appendix B.12); this file became the complete ledger (§17).
- **J108 / U083:** Docs renamed Wiki (`/wiki`); the design system is its sixth tab.
- **J107 / U082:** wiki typography for comfortable reading.
- **J104–J106 / U080–U081:** Insight Timer screenshots and competitors; the design system with all components by pattern.
- **J100–J102 / U079:** admin redefinition proposal (O28), the entity coherence check (O29), admin guideline v2/v3.
- **J094–J098 / U076–U078:** Insight Timer deep research (Research tab), playbook v1–v3 and the junior-PM roast.
- **J088–J093:** Eugene's brief read and recapped; founder-skill test of prod v1–v3 (`docs/reviews/`).

Before that:

- **J058 / U057:** `docs/user-updates/Aurelia-Whats-New-v5.pdf`, a 4-page
  English guide for users. Eight changes, each on a v5 screenshot marked in
  orange. Users were to receive it.
- **J055–J057:** the v5 update text in English bullets, in a short version,
  and formatted for WhatsApp (single-asterisk bold).
- **J054 / U056:** the chat box, Explore header and admin outcomes (above).
- **J049 / U053:** design v5 and the v5 proposal report.

### Branches that have fallen behind

- `mobile_app` (Flutter) stopped at 27 Sep. It lacks roughly U032 onward,
  including v3–v5, onboarding, tabs and offline.
- `storybook` stopped at 27 Sep. It lacks stories for, among others,
  `TabBar`, `ChapterCheckIn`, `NextChapterCard`, `FeelingProgress`, the
  taller `ChatComposer` and the admin outcomes page.
- `CHANGE-LOG.md` and `PRD.md` are meant to be identical on every branch.
  Since late September they have only been updated on
  `web_app`/`admin_cms`/`web_prod`.

---

## 5 · Stack and architecture

Full conventions are in `CLAUDE.md`. In short:

- **React 19, Vite, TypeScript, Tailwind CSS v4, React Router 7, TanStack
  Query 5, Zod 4, Vitest + Testing Library, oxlint, vite-plugin-pwa,
  three.js** (lazy, behind a flag). Node ≥ 20.19.
- **Scripts:**
  - `npm run dev` (port 5173);
  - `npm run check` = `tsc -b` + `oxlint --deny-warnings` + `vitest run` (what CI runs);
  - `npm run build`;
  - `npm run build:tokens`.
  - Use `npm run typecheck`, not `tsc --noEmit`, which checks nothing here.
- **Tailwind v4 specifics:**
  - `--spacing: 1px`, so `p-16` = 16px.
  - The radius scale is closed (0/2/4/8/12/16/24/32/full; anything else renders square).
  - Utilities order by layer, not by string order.
  - `rotate-*` sets the CSS `rotate` property.
- **Layout of `src/`:**
  - `pages/`: one file per consumer screen.
  - `admin/`: `AdminLayout`, `pages/`, `components/` (DataTable, Charts, ui), `data/` (mock, outcomes, commerce, challenges).
  - `components/`: `chat/` (cockpit), `ui/` (shared), `wellness/` (check-in, progress), `network3d/`.
  - `layouts/AppLayout.tsx`: drawer, shell, `TabBar` in v4+, floating player.
  - `lib/`: catalogue data and pure helpers (sessions, journey, onboarding, signals, people, challenges, build, http, storage, monitoring, queryClient).
  - `chat/`: cockpit state and pure data.
  - `versions/`: design versions.
  - `demo/`: `/__demo` console, flags, annotations, click insights, site lock.
  - `api/`: typed fetchers.
  - Top-level `api/`: Vercel functions `config.ts`, `annotations.ts`, `clicks.ts`, with shared code in `api/_lib`. **Never put a non-route file directly in `api/`.**
- **Foundation rules (U048):**
  - Server state through TanStack Query.
  - HTTP through `requestJson` (timeout, abort, Zod-validated).
  - Storage through `lib/storage.ts` (`readJson`/`writeJson`/`readString`/`writeString`/`removeKey`; never throws; schema-validated).
  - Errors through `reportError`.
  - Pure data outside component files.
- **Offline (U049):**
  - The service worker precaches everything.
  - A new deploy waits for the user to tap **Reload** in the update toast. "I pushed and can't see it" is often this, or the deploy not being finished yet.
- **Routing guards:**
  - `RequireAuth`: a signed-out user who *types or reloads* a protected URL gets the **404 page** (with Sign in). In-app navigation goes to `/login`.
  - Sign-in deliberately **does not persist**, so every load starts signed out.
- **Portals:** sheets and modals must use `createPortal`, because `.u-page`
  animates with a transform (§12).

### Browser storage keys (all per browser; no accounts exist)

| Key | Holds |
| --- | --- |
| `aurelia.site.unlocked` | the site password the browser unlocked with |
| `aurelia.ui.version` | chosen design version (staging ids 1–5) |
| `aurelia.onboarding` | onboarding answers (goal, feeling, style, `wearable` in v5, `done`) |
| `aurelia.journey` | the five-chapter journey: goal, name, slug, href, `checkIns[{at,mood,note?}]`, `reminder`, `notes[]` (v5 journal) |
| `aurelia.demo.flags` | local feature-flag draft |
| `aurelia.demo.annotations`, `aurelia.demo.annotationsButton` | review pins (offline cache) and FAB position |
| `aurelia.insights.sid`, `aurelia.insights.clicks` | click-insights session id and local fallback |
| `aurelia.notifications.seen`, `aurelia.audio.muted` | small UI state |

---

## 6 · Design versions (v1–v5, and production's own two)

The project's way of shipping experiments without disturbing what works.

- **Files:**
  - `src/versions/versions.ts`: the list, the dialog text, the production mapping and `readVersion`/`storeVersion`.
  - `src/versions/useUiVersion.ts`: the hook.
  - `src/versions/StagingBar.tsx`: the 28px bar at the top, holding the picker.
  - `src/versions/VersionSwitcher.tsx`: the picker and its "what changes" dialog.
  - `src/styles/versions.css`: version-scoped CSS and the staging-bar offsets.
- **Mechanics:**
  - The chosen version is written to `<html data-ui-version="N">`; v1 has no attribute.
  - Versions are **cumulative**: code checks `useUiVersion() >= N`.
  - v2's CSS is scoped `:root[data-ui-version]` (any version above 1).
  - The v4 tab-bar CSS is scoped `:root:is([data-ui-version='4'],[data-ui-version='5'])`. **A v6 that keeps the tabs must add `'6'` there.**
- **Defaults (`DEFAULT_VERSION`):** staging opens on **v1**; production opens on
  `PRODUCTION_VERSION = 5` (since U075; it was 4).
- **Production's own list (U075; U055 had two):** prod v1 = staging v3, prod v2 = staging v4, prod v3 = staging v5 (default).
  - `PRODUCTION_VERSIONS` in `versions.ts` maps production labels to staging ids: `{id:1, ui:4}`, `{id:2, ui:5}`.
  - Only the labels differ. `data-ui-version`, the stored value, `useUiVersion()`, click insights and pins all carry the **staging id**, so "prod v2" appears as `5` in data.
  - To offer something else on production, edit that array (the test `versions.test.ts` checks every `ui` exists and the default is offered).
  - Production pins ignore the version (`IS_PRODUCTION` in `DemoAnnotator`).
- **To add v6:**
  1. Append it to `UI_VERSIONS` with a `changes` dialog.
  2. Gate code with `useUiVersion() >= 6`.
  3. Widen the v4/v5 CSS selectors if the tabs stay.
  4. Run the pixel regression for v1–v5 (§11.4).
  5. Production gets it only on request, via `PRODUCTION_VERSIONS` and/or `PRODUCTION_VERSION`.

---

## 7 · Feature map by version, with files

### v1: the app as originally built from Figma

Consumer screens:
- Home with Ask, Quick Start, Live Sessions map and community.
- Chat/cockpit with the recommendation deck and the "+" sheet.
- Player with a details sheet, Session detail, Recreate, Explore, Sessions, Profile, Settings, Invite, Help.
- Credits/Upgrade, Notifications, Wellness (Progress) and Signal sources.
- Auth screens.

### v2 (U020+): motion, the floating player, and more

Page transitions, scroll reveals, draggable sheets, pull to refresh, the
floating mini player, the share sheet, the sheet filter, the tablet layout,
Wellness Analysis (U039–U041) and the player analysis drawer.

### v3 (U038): change summary, every build kept in the thread

The "+" sheet gets a summary, and each Apply keeps its version (v1.2, v1.3…)
in the conversation.

### v4 (U047, U050, U051): production default (= prod v1)

- **Onboarding** `/welcome` (`pages/OnboardingPage.tsx`, `lib/onboarding.ts`):
  - steps: Welcome → goal → feeling → style → editable summary;
  - Skip keeps answers;
  - Settings → Replay onboarding runs it again.
- **First-session fixes (U050, from the J039 simulation):**
  - a sentence typed on Home pre-fills onboarding and becomes the first brief;
  - every path opens the person's *own* thread;
  - the deck follows their goal;
  - the free limit counts only after the first build.
- **Journey** (`lib/journey.ts`, `components/wellness/ChapterCheckIn.tsx`, `NextChapterCard.tsx`):
  - five chapters;
  - the player asks "How do you feel now?" (1–5);
  - "Chapter 2 is ready tomorrow" with a calendar `.ics` reminder at a goal-based time;
  - signed-in Home leads with the next chapter.
- **Simplification D1–D7 (U051):**
  - four bottom tabs below `lg` (`components/ui/TabBar.tsx`): Create `/home`, Discover `/explore`, Progress `/wellness`, Me `/profile`;
  - the hamburger is hidden;
  - Library is `/sessions`;
  - coins appear only in Me, Invite and challenges;
  - Insights is folded into Session details;
  - one list of changes in the chat (the deck opens the "+" sheet).

### v5 (U053, J049): v4 + the three real interviews (= prod v2)

- **Progress in words** (`components/wellness/FeelingProgress.tsx`, `feelingSummary` in `lib/journey.ts`):
  - the person's own check-ins, with no percentages;
  - the date of the two-week report;
  - "See what's behind this" for detail;
  - the sample analysis cards are hidden;
  - `/wellness/analysis/*` redirects to `/wellness`.
- **No analytics on the player** (`PlayerPage.tsx`).
- **"Why?" on every suggested change** (`components/chat/AddSheet.tsx`, `basis` prop; `ChatPage.tsx` builds `basisLine` from goal, last check-in and wearable):
  - experiments say they are untested;
  - the experiments count is corrected in v5 only.
- **After a check-in** (`ChapterCheckIn.tsx`):
  - a wearable reading (labelled example data);
  - a journal line (`noteLastCheckIn`);
  - what the next chapter changes.
- **Wearable asked in onboarding:**
  - Apple Watch / Whoop / Oura Ring / Not now (`WEARABLES` in `lib/onboarding.ts`);
  - only that source is on (`connectionsForWearable` in `lib/signals.ts`; Whoop added as `V5_SOURCES`).
- **Journal** on Progress (`addJournalNote`).
- **Community:**
  - cards show `summary` instead of the "reduce stress by 43%" description (`SessionGridCard.tsx`);
  - tags have no "#" (`TagRow.tsx`);
  - the challenge has no podium or ranks (`ChallengeDetailPage.tsx`, "Made for this journey");
  - Publish has a privacy note (`PublishSheet.tsx`).
- **Visitor Home:** the headline "Sessions made for how you feel *today*." and no live map (`HomePage.tsx`).

### Every version (changes that were explicitly requested for all)

- **U043:** Session settings is full width below `lg`.
- **U056:** the chat composer is 75px tall (`ChatComposer.tsx`).
- **U056:** the Explore/Discover header is sticky (`ExplorePage.tsx`):
  - it is transparent at rest and frosted once content passes under it (IntersectionObserver sentinel);
  - a measured spacer keeps the hero at 92px (lg: 122px).

---

## 8 · Admin CMS

- `/admin` is under `AdminLayout` (`src/admin/`). It has 19 modules, each
  behind a flag `admin*` in `src/demo/modules.ts` and wrapped in `ModuleGuard`
  in `App.tsx`:
  - Dashboard; Users (+ detail); **Well-being outcomes**; Roles;
  - Sessions; Challenges; Moderation; AI monitoring; Cockpit rules;
  - Revenue; Pricing; Payments; Coins; Experiments; Notifications;
  - Compliance; Signal sources; Audit; Settings.
- **Experimentation → Feedback group · v1 and · v2 (U058, U060; on production since U061):** the 30-person, 8-week outcomes pilot. U059 hid it and U060 reopened it. v1 (`ExperimentationPage`) covers criteria, participants, measures and data quality. v2 (`ExperimentationV2Page`, `/admin/experimentation/v2`) covers Wins (clinical bands), This week (a task list) and Engagement (dose). Both are kept for review until O23 picks one. **U062 (on production since U064):** v2 opens on **Milestones** (`milestones()` in `study.ts`; the same M0–M5 as the PM playbook, change both together), and each participant page has a **coaching log** (`data/coachingLog.ts`, `aurelia.admin.study.log`, per browser). Rules are in `admin/data/study.ts`; the protocol PDF is in `docs/reviews/`. Outcome criteria are not judged before week 8. **Every admin module is described in the guideline: in the app at `/guide/admin` (both sites), generated with the standalone `docs/guidelines/admin-guideline.html` by `scripts/guides/admin_guideline.py`.**
- **No authentication on `/admin`.** This is the P0 in `docs/PRD.md`.
- Data comes from seeded mock data (`admin/data/mock.ts`) through
  `AdminDataContext`. Edits live in memory only.
- **Well-being outcomes (U056, Eugene's request "how well have each user
  improved their well-being therapeutically"):**
  - `admin/data/outcomes.ts`: model, rules and seeded sample. `admin/pages/OutcomesPage.tsx`: the page. Plus a panel on `UserDetailPage`.
  - Proposed measure: **WHO-5** (0–100), at the start and then every two weeks.
  - **±10 points** = improved / declined; fewer than two scores = "too early".
  - A **latest score ≤ 28** is flagged "follow up" for a human.
  - Also shown: check-ins (first three vs last three) and resting heart rate where a wearable is connected.
  - Explicitly labelled self-reported, observational, not causal or clinical.
  - **The consumer app does not ask WHO-5 yet** (open item O21).

---

## 9 · How work is recorded

Four documents in `docs/`, plus patch files, updated **in the same push** as
the work.

| File | One entry per | Format notes |
| --- | --- | --- |
| `WORK-JOURNAL.md` | **every request** (questions included) | **Index** table row `\| J0NN \| date \| kind \| request \| U-ref or — \|`, then a `### J0NN — title` section appended at the **end** of the file. **Open items** table at the top (`\| O## \| … \|`). |
| `UPDATE-LOG.md` | every code change | **Index** row `\| U0NN \| \`sha\` \| date \| summary \| [patch](patches/U0NN-sha.patch) \|`, then a `### U0NN — title` section inserted **right after `## Entries`** (newest first). Fields: Commit, Patch, Request (verbatim), Interpretation, Changed, Verified, Revert. |
| `update-log/patches/U0NN-<sha>.patch` | every code change | `git format-patch -1 <code-commit> --stdout > …` |
| `HANDOFF.md` §17 | every request and every code change | Copy the J index row into §17.1 and the U index row into §17.2 (patch links as `update-log/patches/…`). Update §4 when the state moves. |
| `CHANGE-LOG.md` | every change | Newest entry **at the top of the entries**. The entries sit inside the fenced block that starts under "## Entry format": an old quirk, so keep inserting there. Each ends with `Branches: …` saying which branches it reached. |

**Numbering as of 17 Nov 2026:** last U = **U109**, last J = **J153**, last
O = **O48**. Before numbering, check the files for anything newer.

**And this file:** every J row and every U row is copied into §17 in the same
push. `src/guides/records.test.ts` enforces it.

**Commit pattern used throughout:**

1. Commit the code alone (message body explains what and why), with the
   session's trailer.
2. Generate the patch from that commit. Write the U-, J- and CHANGE-LOG
   entries, referencing the code commit's short SHA.
3. Commit the docs (`Docs: U0NN log and patch, J0NN, change log`).
4. Push `web_app`, fast-forward and push `admin_cms`. Push `web_prod` only on
   request.

A docs-only request (a question, a report) gets just a J-entry; the U column
reads `—` or `docs only`.

**Journal entry style:** **Asked** (quote the request verbatim, in the
original language), **Answered/Done**, **Open items** affected. Never include
passwords.

---

## 10 · How work is shipped

```bash
# staging (every change)
npm run check && npm run build
git push origin web_app
git checkout admin_cms && git merge --ff-only web_app && git push origin admin_cms && git checkout web_app

# production (ONLY when the session owner asks)
git checkout web_prod && git pull --ff-only origin web_prod && git merge --ff-only web_app && git push origin web_prod && git checkout web_app
```

- `package.json` `version` (0.1.0) is the human-maintained release name. It
  has not been bumped and nobody asked. The short SHA is the truth.
- **Check CI** for the pushed SHA:
  `gh api "repos/sandmanz26/aureliamobile/actions/runs?head_sha=<sha>" --jq '.workflow_runs[] | [.head_branch,.conclusion]'`.
  In this environment, wait with an until-loop, not a bare `sleep`.
- **Check the deploy** via commit statuses (§3). `/__demo` on each site shows
  the commit it was built from.
- If the session owner says "I can't see it", check in this order: the deploy
  status, the commit in `/__demo`, then the Reload toast.
- When production moves, log it in the U/J entries and in CHANGE-LOG
  (`Branches: … web_prod (fast-forwarded from <old>)`), and update §4 here.

---

## 11 · How to verify

Visual claims need the real app in a browser. Recipes that work in the cloud
container:

### 11.1 Playwright

Chromium and Playwright are preinstalled. **Do not** run `playwright
install`.

```js
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs'
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' })
```

Serve a build with `npx vite preview --outDir <dir> --port <p> --strictPort`.
Build in staging or production mode explicitly:

```bash
VERCEL_ENV=preview    VERCEL_GIT_COMMIT_REF=web_app  npx vite build --outDir /tmp/…/stg
VERCEL_ENV=production VERCEL_GIT_COMMIT_REF=web_prod npx vite build --outDir /tmp/…/prod
```

### 11.2 Getting past the lock, picking a version, signing in

```js
await page.addInitScript(() => {
  localStorage.setItem('aurelia.site.unlocked', '<site password for this build>') // see src/demo/siteLock.ts
  localStorage.setItem('aurelia.ui.version', '5')
  localStorage.setItem('aurelia.demo.flags', JSON.stringify({ clickInsights: false, annotations: false }))
})
await page.goto(url + '/home')
// In-app navigation (a typed/reloaded protected URL shows the 404 by design):
const go = (u) => page.evaluate((u) => { history.pushState({ usr: null, key: Math.random().toString(36).slice(2), idx: 1 }, '', u); dispatchEvent(new PopStateEvent('popstate')) }, u)
await go('/login'); await page.getByRole('button', { name: /continue with google/i }).click()
await go('/explore')
```

To exercise the first-run flow end to end at 402×874:

1. On Home, type in **Ask Aurelia**, press Enter, then **Continue with Google**.
2. **Let's begin**. In v5, pick a wearable radio.
3. **Build my first session**.
   - The recommendation deck "Open 3 recommended changes" exists for about 2s while it builds.
   - Click it then to see the "Aurelia suggests" sheet.
4. Play the session (aria-label "Play session").
5. Drag up the sheet grabber `[data-sheet-grabber]`, tap a mood radio ("Pleasant"), and type in `#checkin-note`.

Screenshots: clip `y: 28` to drop the staging bar. Use `deviceScaleFactor: 2`
for documents.

### 11.3 Admin

`/admin/...` needs only the lock. No sign-in.

### 11.4 Proving earlier versions are unchanged (pixel regression)

1. Make a worktree of the base commit: `git worktree add <scratch>/before HEAD`.
2. Symlink `node_modules` into it and build both trees in staging mode. Serve
   them on two ports.
3. For each version, route and width (402 and 1280), screenshot both after
   disabling animations (`*{animation:none!important;transition:none!important;caret-color:transparent!important}`)
   and aborting Unsplash requests. Compare the images.
4. Earlier runs covered v2/v3/v4 × 25 routes × 2 widths (150 pairs), all
   identical.
5. Text anti-aliasing can differ when an element gets its own layer (e.g. a
   sticky header). Confirm by eye that positions and colours match.
6. Remove the worktree afterwards (`git worktree remove --force …`).

### 11.5 Reports and PDFs

- Write the HTML in `docs/reviews/` (owner-facing) or `docs/user-updates/`
  (user-facing), with images in a sibling folder.
- Render with Playwright `page.pdf({ format: 'A4', printBackground: true, … })`
  after injecting the local font
  (`@font-face{font-family:'Mulish';src:url('file:///…/public/fonts/mulish-variable.woff2')}`)
  and awaiting `document.fonts.ready`. Google Fonts is blocked in the
  container.
- Preview pages with `python3 -c "import pymupdf …"` (`pdftoppm` is not
  installed).
- Marking screenshots: record each element's `boundingBox()` at capture time
  (subtract the 28px clip; ×2 for the scale). Draw orange
  (`#E8770F`) rounded boxes with numbered badges using PIL. Never guess
  coordinates.
- Owner reports are also published as **private** claude.ai artifacts (the
  Artifact tool; images through its `files` map). Send PDFs with the send-file
  tool (`display: render`); the session owner once could not download one
  otherwise.

---

## 12 · Traps this project has actually hit

- **Wrong branch in a fresh container:** it looks like the repo is empty (§3).
- **`versions.css` moves every `.lg:top-0` under the staging bar** (meant for
  sticky sidebars). For an absolutely positioned layer that must sit at 0 on
  `lg`, use `lg:top-[0px]` (U056).
- **A sticky element only sticks inside its parent.** Wrapped in a short band,
  it scrolls away. Paint the band behind instead (U056, ExplorePage).
- **The menu button is hidden on `lg` and in v4+**, so header heights differ
  by version. Don't hard-code spacers; measure (U056).
- **`.u-tap` sets `position: relative` in a later layer** and beats
  `absolute` on the same element. Put positioning on a wrapper.
- **`.u-page` has a transform**, so `position: fixed` inside a page is
  relative to the page. Overlays must use `createPortal`.
- **Grid and flex children need `min-w-0`** or wide content overflows.
- **One rule per gap:** a gap set by both a parent `pb-*` and a child `mt-*`
  produces numbers that appear nowhere in the source.
- **The radius scale is closed.** `rounded-10` renders square, silently.
- **Rules of hooks:** hoist `useUiVersion()` to the top of the component
  (`const v5 = useUiVersion() >= 5`). Never call it inside a condition.
- **Typecheck with `npm run typecheck`** (`tsc -b`).
- **`vercel.json` accepts no comments**; it failed a build once.
- **Shared admin `BarChart`:** negative values used to draw a full bar. Now
  clamped (U056).
- **String joins in UI copy:** a "replace the last comma with *and*" trick
  matched a comma inside a quoted label (U057). Join arrays instead.
- **Click insights and pins store staging version ids**, even on production.
- **Shell in this environment:**
  - `pkill -f <pattern>` can kill the calling shell when the pattern matches its own command line.
  - `rm -rf $VAR/*` is blocked by a safety check; use a literal path or `"${VAR:?}"`.
  - A bare `sleep` is blocked; use an until-loop.
- **Unsplash covers fail offline.** Flat gradients mean no network, not a bug.
- **Simulated vs real research:** the six-persona simulation was wrong about
  two things the real users corrected: scores do not motivate everyone, and
  wearables are wanted with consent. Weight real interviews above the model.

---

## 13 · Research, reports and deliverables

All in the repository unless noted.

| Date | Document | What it is |
| --- | --- | --- |
| 18 Oct | `docs/reviews/Aurelia-Logic-Review-2026-10-18.pdf` | Product logic review; 15 decisions with defaults (O1) |
| 25 Oct | `docs/reviews/Aurelia-Simplification-Plan-2026-10-25.pdf` | J038: audit plus D1–D7 (built in U051) |
| 25 Oct | `docs/reviews/Aurelia-Retention-Simulation-2026-10-25.pdf` | J039: six simulated personas on v4, questionnaire, D1/D7/D30 model |
| 27 Oct | `docs/reviews/Aurelia-Owner-Report-2026-10-27.pdf` (+ HTML, 14 images) | J047–J048: before / suggestion / now / impact; labelled AI analysis. Private artifact: https://claude.ai/artifact/VTjHzkzYfBXnGbZFKcDTJ5 |
| 27 Oct | `docs/reviews/Aurelia-v5-Proposal-2026-10-27.pdf` (+ HTML, 16 images) | J049: interviews vs simulation, v4 → v5 pairs, predicted impact. Private artifact: https://claude.ai/artifact/PXDGCwz7BXzv5ASr67bS84 |
| 30 Oct | `docs/user-updates/Aurelia-Whats-New-v5.pdf` (+ HTML, 9 marked images) | J058: **for end users**; eight changes, how to switch to v2 |
| 11 Nov | `docs/reviews/Aurelia-Feedback-Group-Playbook-2026-11-11.pdf` (+ HTML), at `/guide/playbook` | J067, J069: for the project manager: six milestones, daily rhythm, iteration, admin map; **the study protocol is its appendix** (P1–P11). Private artifact: https://claude.ai/artifact/RUUUiUx8C2N8reRYceCKPJ |
| 11 Nov | `docs/PRD-OVERVIEW.md`, at `/guide/prd` | J065: the whole product on one page: users, principles, feature status by version, AI, privacy, business model, metrics, roadmap, risks, decisions |
| 11 Nov | `docs/guidelines/admin-guideline.html` (+ 25 screenshots), at `/guide/admin` | J064: interactive guide to every admin module (purpose, actions, rules, permissions, environment, backend) |
| 10 Nov | `docs/reviews/Aurelia-Feedback-Group-Study-2026-11-10.pdf` (+ HTML, 6 images) | J062: protocol for the 30-person, 8-week therapeutic-outcomes pilot, and the admin Experimentation section (U058) |
| 10 Nov | `docs/api/API-CONTRACT.md` + `docs/api/openapi.yaml` | J061: **API contract plan** for production (prod v1/v2): conventions, data model, every consumer and admin endpoint, the AI system (routes, models, safety, evals), phasing and decisions |
| — | `docs/PRD.md`, `FOR-*.md`, `DESIGN-SYSTEM-HISTORY.md` | Requirements and reader-specific guides. `FOR-AI-AGENT.md` dates from 20 Sep; **this file supersedes it for current state.** |

### The retention model, in numbers (all **Predicted**, not measured)

Columns: activation, then the share of new users active on day 1, day 7 and day 30.

| State | Activation | D1 | D7 | D30 |
| --- | --- | --- | --- | --- |
| Before the work (v1/v2 era) | 45% | 12% | 3.8% | 1.5% |
| v4 as built (J046) | 54.3% | 20.8% | 8.3% | 4.1% |
| v4 recalibrated with the interviews | 54.3% | 20.7% | 8.1% | 3.9% |
| **v5** | 57.1% | 24.0% | **11.4%** (9.6–13.6) | **6.9%** (5.2–9.3) |

Largest single v5 levers at D7, in percentage points: wearable up front +0.6;
progress in words +0.6; "Why?" +0.5; next-chapter plan +0.4; journal +0.3;
landing +0.2; community without ranks +0.1.

Benchmark band used for wellness apps: D1 20–27%, D7 8–13%, D30 3–8%. The
J039 model and persona scripts are archived in
`docs/reviews/retention-sim-2026-10-25/simulation-scripts.txt`. The v5
recalibration is described in Appendix B.9. **Every research result in full is
in Appendix B.**

**What the three interviews said (J049):**
- **Confirmed:** invented numbers are distrusted; minimal input with Aurelia deciding; one list with toggles.
- **Corrected:** scores make some people anxious (a report every few weeks, detail on demand); wearables are wanted, with consent.
- **Missed by the simulation:**
  - the "why" behind suggestions;
  - no competitive challenges (stories, friends, local groups instead);
  - the landing "space" plus map read as co-working;
  - a journal;
  - voice quality;
  - the "#" on tags;
  - sharing privacy and incentive.
- They most likely tested a v2 build: they mention the sample "7% REM sleep" conversation.

---

## 14 · Open decisions and known gaps

The authoritative list is the **Open items** table at the top of
`docs/WORK-JOURNAL.md` (O1–O31). The ones most likely to come up next:

| # | Decision / gap | Notes |
| --- | --- | --- |
| **O34** | Journey tags | Review the eight tag groups and the proposed tagging on staging, then release to production. |
| **O33** | Knowledge-base repository access | The export is ready; install the Claude GitHub App on `danielaurelia26/aureliabase_knowledge`, then push on request. |
| **O32** | Aurelia Pro (corporate wellness, B2B2C) | Eugene asks for a feature-proposition exploration (J110). Proposed format: the retention-simulation method with employee and HR personas. |
| **O31** | The 2025 backend code | The three sources hold prompts and shapes, no code (B.12). Ask Eugene for the 2025 repository and access; then decide what to port. |
| **O29** | Shared entity model first | `src/domain/`, seeded from the 2025 taxonomy (B.12 #2), before admin rebuilds. |
| **O28** | Admin redefinition | Structure proposed in J100. |
| **O24–O27, O30** | Insight Timer recommendations, Eugene's remaining asks, founder-test fixes, default document versions, design-system token gaps | See the journal. |
| **O19** | v5: make it production's default? | Built, on prod as v2 only. Real wearable data, voice choice, friends/groups, push and a share reward need a backend or assets. |
| **O20** | Clean up the production version bar | Temporary per the owner. It takes 28px for every visitor. Options: behind a flag or URL parameter, or remove once a default is chosen. |
| **O21** | Well-being outcomes | Confirm WHO-5 and when to ask it; backend; Compliance wording; who owns follow-ups at ≤ 28; prod promotion. |
| O17 / D2 | Persist sign-in | Needed before any real retention number. The journal and check-ins are per browser until then. |
| O18 | S1–S7 second simplification | Sent to users for feedback (J044). |
| O16 | D7 Figma pass | The new screens follow drafts, not a designer's pass. |
| O7 | Flutter parity | `mobile_app` is about a month behind. |
| O14 | Production hardening | Error reporting service, E2E suite, `vercel.json` blocks the microphone (`Permissions-Policy`), bundle trimming. |
| O1 | 15 product decisions | Defaults proposed in the logic review. |

### Known bugs and gaps

- `/admin` has no authentication (P0).
- v4 (and prod v1) counts goal-deck items as "experiments" in the change-sheet
  summary. It was fixed in v5 only, so v4's pixels stay as shipped.
- Production v2 still shows the pre-U057 "Why?" sentence until production is
  promoted.
- `storybook` has no stories for the components added since 27 Sep (§4).
- Real AI replies after the first message are demo text. The reminder is a
  calendar `.ics` file, not a push notification.

---

## 15 · Tools and connectors

What a Claude session in this project has had available:

- **GitHub MCP** (`mcp__github__*`) and `gh api` through the session proxy,
  scoped to `sandmanz26/aureliamobile`. Use them for CI runs, statuses and
  files on other branches.
- **Figma Console MCP** (`mcp__FigmaConsole__*`): read variables, components
  and images. It was used for the token audit and Figma checks.
- **Higgsfield** (custom connector `https://mcp.higgsfield.ai/mcp`, connected
  at J051). It is **read-only**: workspaces, models, credits, past
  generations. It cannot generate media. `*.higgsfield.ai` is blocked from
  the container network.
- **Artifact tool:** private claude.ai pages for reports (§13).
- **Network:** the container cannot reach Google Fonts or most third-party
  hosts. Use the local Mulish font file.

---

## 16 · Glossary

| Term | Meaning |
| --- | --- |
| **Cockpit** | The chat screen where a session is built and changed (`ChatPage`, `components/chat/`) |
| **Deck** | The fanned recommendation cards in the chat. In v4+ it opens the "+" sheet. |
| **"+" sheet / AddSheet** | The one list of changes; v5 adds "Why?" |
| **Chapter / journey** | v4+: the first five sessions of a goal, one per day, each followed by a check-in |
| **Check-in** | "How do you feel now?", 1–5 (Very unpleasant … Very pleasant) |
| **Signal sources** | Wearables and other data Aurelia may read (`lib/signals.ts`) |
| **Staging bar** | The 28px top bar with the build badge and version picker |
| **prod v1 / prod v2** | Production's own labels for staging v4 / v5 (U055) |
| **U / J / O** | Update-log entry (code) / work-journal entry (every request) / open item |
| **D1–D7** | Eugene's simplification decisions (J038), built in U051. In the model, D1/D7/D30 instead mean day-1/7/30 retention. Context tells which. |
| **S1–S7** | The second simplification proposal (J043), not built |
| **R1–R10** | Retention-simulation recommendations (J039) |
| **V1–V7** | v5 levers in the v5 proposal |
| **WHO-5** | The five-item WHO well-being index, 0–100. Proposed outcome measure (U056). |

---

## 17 · Ledger: every request and every change

Copied from the index tables of `WORK-JOURNAL.md` (§17.1) and
`UPDATE-LOG.md` (§17.2), and extended in the same push as every new request.
The details stay in those files; this is the one place where the whole
history can be read without opening four documents.
`src/guides/records.test.ts` fails the build when an id is missing here.

### 17.1 Requests (J)

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
| J022 | 2026-10-21 | Ops | Figma pairing code | — |
| J023 | 2026-10-21 | Code | Figma 16885:1622: Wellness Analytics cards + Analysis page, v2 + v3 | U039 |
| J024 | 2026-10-21 | Ops | Figma pairing code | — |
| J025 | 2026-10-21 | Code | Analysis: metric list + chart text not balanced | U040 |
| J026 | 2026-10-21 | Code | Figma 16886:1623 (player drawer + Feedback) and 16883:13096 (Settings/Script), v2 + v3 | U041 |
| J027 | 2026-10-21 | Code | Current style should not be removable | U042 |
| J028 | 2026-10-21 | Code | Settings at 470–480px should stretch | U043 |
| J029 | 2026-10-21 | Ops | Promote v2 to production | U044 |
| J030 | 2026-10-21 | Code | Eugene feedback: move the filter into the "+" sheet | U045 |
| J031 | 2026-10-21 | Ops | Promote U045 to production | U046 |
| J032 | 2026-10-22 | Code | v4: onboarding for first login | U047 |
| J033 | 2026-10-22 | Question | "Try again" after v4 | — |
| J034 | 2026-10-22 | Doc | Prompt to install click tracking + the floating review button elsewhere | docs only |
| J035 | 2026-10-23 | Code + Check | Re-check staging; production-grade code quality; install libraries (cache etc.) | U048 |
| J036 | 2026-10-23 | Question | Did U048 change the user experience? | — |
| J037 | 2026-10-25 | Code | Offline: some pages must still open; 404 when forcing a signed-in page | U049 |
| J038 | 2026-10-25 | Analysis | Simplification research + plan PDF with annotated screenshots and drafts (no code) | docs only |
| J039 | 2026-10-25 | Research | First-time-user retention simulation: 6 personas on the real v4 build, sequenced questionnaire, D1/D7/D30 predictions per suggestion (no code) | docs only |
| J040 | 2026-10-26 | Code | J039 refinements applied to v4 (U050), after: validity question, summary of what to refine, "is it already in v4?" | U050 |
| J041 | 2026-10-26 | Question | Status of Eugene's simplification (J038) after U050 | docs only |
| J042 | 2026-10-26 | Code | Simplification D1–D7 applied to v4 without touching v2 (U051) | U051 |
| J043 | 2026-10-26 | Analysis | Second simplification audit of v4 after U051 (no code) | docs only |
| J044 | 2026-10-26 | Operational | Owner is sending the J043 proposal (S1–S7) to users before deciding | docs only |
| J045 | 2026-10-27 | Release | Production moved to v4; `web_prod` fast-forwarded (U052) | U052 |
| J046 | 2026-10-27 | Analysis | Production v4 compared with the J039 retention report; model re-scored for what was actually built | docs only |
| J047 | 2026-10-27 | Report | Owner report: before / suggestion / now / impact (HTML + PDF, no code) | docs only |
| J048 | 2026-10-27 | Report | Owner report labelled as AI analysis by Claude (self-analysis + deep research) | docs only |
| J049 | 2026-10-27 | Code + report | Three real user interviews vs the simulation; staging v5 built from v4; v5 proposal report (HTML + PDF) | U053 |
| J050 | 2026-10-28 | Code + Ops | Design-version picker on production too (default stays v4); `web_prod` fast-forwarded | U054 |
| J051 | 2026-10-29 | Question + Code + Ops | Production status (no code); Higgsfield connector; production limited to two versions with its own numbers | U055 |
| J052 | 2026-10-29 | Question | Is the interview version v3 + interviews or v4 + interviews? | — |
| J053 | 2026-10-30 | Question | What is the difference between staging v4 and v5? | — |
| J054 | 2026-10-30 | Code | Chat box taller, Explore header follows the scroll, admin well-being outcomes | U056 |
| J055 | 2026-10-30 | Question | v5 changes as an English bullet list | — |
| J056 | 2026-10-30 | Question | Shorter version of the v5 update | — |
| J057 | 2026-10-30 | Question | v5 update formatted for WhatsApp | — |
| J058 | 2026-10-30 | Report + Code | What's New PDF for users (v5 / prod v2), changes marked on screenshots; Why? text fix | U057 |
| J059 | 2026-11-01 | Doc | Full technical and context handoff for another person or model (`docs/HANDOFF.md`) | docs only |
| J060 | 2026-11-01 | Doc | Handoff completed with every working rule and every research result (Appendices A and B) | docs only |
| J061 | 2026-11-10 | Doc | API contract plan in English for the production version, including the AI features (`docs/api/`) | docs only |
| J062 | 2026-11-10 | Question + Code + Report | Where admin lives (same app on staging and production); Experimentation section for the 30-person feedback-group study; protocol PDF | U058 |
| J063 | 2026-11-10 | Code | Hide the Experimentation section until the client's pricing arrives | U059 |
| J064 | 2026-11-11 | Code + Doc | Reopen Experimentation with a version 2 for review; detailed admin guideline in HTML | U060 |
| J065 | 2026-11-11 | Code + Doc + Release | Guideline, a whole-product PRD and the API contract readable on production at `/guide`; production promoted | U061 |
| J066 | 2026-11-11 | Question | Production showed a 404 at `/guide/prd`: the browser was still on the cached build `bc028a6`; how to load `17b053f` | — |
| J067 | 2026-11-11 | Report + Code | Eugene: a PDF for the project manager on the two-month feedback group, linked to the admin as source of truth; Milestones and coaching log in admin | U062 |
| J068 | 2026-11-11 | Question | All the URLs (production, staging, artifacts), and where Eugene's request lives | — |
| J069 | 2026-11-11 | Code + Doc | The study protocol put inside the playbook HTML as its appendix | U063 |
| J070 | 2026-11-11 | Doc | The playbook as one HTML file instead of a PDF, to send to Eugene | docs only |
| J071 | 2026-11-11 | Code + Release | Eugene's playbook was not found on production `/guide`: put first and production promoted on request | U064 |
| J072 | 2026-11-11 | Question | What Eugene asked for, and whether it needs admin features (it does; they exist on sample data) | — |
| J073 | 2026-11-11 | Code + Doc | `/guide` front page without a person's name and more detailed; Aurelia branding on every document, strongest on the playbook | U065 |
| J074 | 2026-11-11 | Doc | Branded, self-contained HTML files for all four documents, to send | docs + scripts |
| J075 | 2026-11-12 | Discussion | Figma change list for every version on staging and production (being written by the owner): (1) chat proposal deck → Chapter card + Review sheet; (2) Personal journeys on Explore + story page | waiting on the full list |
| J076 | 2026-11-12 | Release + Code | `/guide` kept identical on both sites (production promoted for it); app work staging-only via `RELEASES`; Chapter card + Review sheet and Personal journeys built | U066, U067 |
| J077 | 2026-11-12 | Question | Staging showed the old deck: the browser was on build `9c8f298` (10 Nov), not `3cba602` | — |
| J078 | 2026-11-12 | Doc | Shared documents: no personal names, no internal ids, plainer wording; `/guide` synced to production | docs only |
| J079 | 2026-11-13 | Code + Release | Daily check-in after every sign-in, and its Journal, in every version on staging and production | U068 |
| J080 | 2026-11-13 | Code + Release | Player simplified to the Figma frame, every version, staging and production | U069 |
| J081 | 2026-11-13 | Code | "Daily check-in does not show in the journal": found and fixed where it was easy to miss (staging; production waiting on confirmation) | U070 |
| J082 | 2026-11-13 | Code + Release | My Wellness → Analytics redesigned to Figma (analysis page), staging and production; U070 shipped with it | U071 |
| J083 | 2026-11-13 | Question + Code + Release | Summary of every change and its status; then Journal moved to About as in Figma, and every release switched on for production (v5 left as is) | U072 |
| J084 | 2026-11-13 | Question | Version map: staging v1–v5 against production v1/v2, and the changes on every version | — |
| J085 | 2026-11-13 | Code + Release | v3 still showed the Journal on My Wellness: a cached pre-U072 build; plus a long note overflowing its card, fixed | U073 |
| J086 | 2026-11-13 | Code | "Ada bug di UI": the Journal note overflow again (production lacks U073); a wrapping fallback added | U074 |
| J087 | 2026-11-13 | Code + Release | Production remapped to three versions (v1 = staging v3, v2 = staging v4, v3 = staging v5), opening on v3; production updated | U075 |
| J088 | 2026-11-13 | Question | The owner's new requests read and summarised, nothing done yet: playbook tone, Insight Timer replica, buyer agents, the 2025 backend docs into /guide, AI speed/quality research, design system, main-menu rail | — |
| J089 | 2026-11-13 | Research | Insight Timer replica study, agent-run: every public feature mapped to Aurelia v1, 2,000 App Store reviews ranked; report in `docs/reviews/` | — |
| J090 | 2026-11-13 | Research | Read the owner's three sources: the Technical Architecture Deep Dive is readable and read in full; the second Google Doc and the Notion wiki need a sign-in | — |
| J091 | 2026-11-14 | Research | founder-skill installed; board (3 lenses) and a 100-buyer panel tested production v1, v2 and v3 on real screen captures; report in `docs/reviews/` | — |
| J092 | 2026-11-14 | Question | What founder-skill can do (11 skills summarised) | — |
| J093 | 2026-11-15 | Question | Recap of everything the owner asked for, with status | — |
| J094 | 2026-11-15 | Research | Insight Timer deep research: features, strategy and business, users and backlash, AI landscape and fit with Aurelia; report in Markdown, HTML and PDF | — |
| J095 | 2026-11-15 | Code + Release | The Insight Timer deep research as an easy-to-read Research tab in /guide, on staging and production; the two backend source PDFs received | U076 |
| J096 | 2026-11-15 | Question | What the owner means by "make the feedback playbook more simple and playful": the same content and accuracy, a mission tone, plain words | — |
| J097 | 2026-11-15 | Code + Release | Playbook versioning: v1 Original, v2 Mission guide, v3 Quick start (much shorter), on staging and production | U077 |
| J098 | 2026-11-16 | Review + Code + Release | Roast of playbook v2/v3 as a junior PM: ten gaps found and fixed | U078 |
| J099 | 2026-11-16 | Research | Summary of the three 2025 backend sources (Deep Dive, Technical Architecture Documentation, Wiki Aurelia): what each says, how they disagree, and what carries into 2026 | — |
| J100 | 2026-11-16 | Proposal | Does the admin need redefining? Yes: seven changes proposed against the 2025 backend, the research and the founder test | — |
| J101 | 2026-11-16 | Analysis | Entity coherence check: does the admin proposal fit today's UI flow? It fits only after one shared entity model; seven breaks found in the code | — |
| J102 | 2026-11-16 | Code + Release | Admin guideline versions like the playbook: v2 Task guide, v3 Quick start (much shorter), staging and production | U079 |
| J103 | 2026-11-16 | Question | Updated recap of everything the owner asked for, with status and the next steps | — |
| J104 | 2026-11-16 | Research + Code + Release | Insight Timer screenshots and competitor research in Research; a new /designsystem page for review; staging and production | U080 |
| J105 | 2026-11-16 | Question | "/designsystem is not found" on production: the browser ran a cached build (eb5d63f) from before the route existed; production serves 1f1e9a5 | — |
| J106 | 2026-11-16 | Code + Release | /designsystem components made complete: 71 components in 10 patterns, with detail, demos and props from source | U081 |
| J107 | 2026-11-16 | Code + Release | /guide typography made easier to read: weights, size, leading, measure, spacing, links, lists, tables | U082 |
| J108 | 2026-11-17 | Code + Release | Docs renamed Wiki (/guide → /wiki, redirects kept); design system merged in as a wiki tab | U083 |
| U084 | `e8ca69d` | 2026-11-17 | HANDOFF.md becomes the full record: a test fails the check when a request (J) or change (U) is missing from its ledger; CLAUDE.md states the rule. Staging. | [patch](update-log/patches/U084-e8ca69d.patch) |
| U085 | `a718484` | 2026-11-17 | Wiki: two new tabs from the three 2025 backend documents, Backend (old) (what we can reuse) and Artefact (eleven lessons); the open tab scrolls into view on phones. Staging and production. | [patch](update-log/patches/U085-a718484.patch) |
| U086 | `2913b15` | 2026-11-17 | API contract reads as a team document: an info table and a plain overview replace the long opening; internal review references removed; v4/v5 instead of prod v1/v2. Staging and production. | [patch](update-log/patches/U086-2913b15.patch) |
| U087 | `d14298b` | 2026-11-17 | Knowledge-base export: `scripts/knowledge/export.py` writes the eight wiki documents as Markdown (plus OpenAPI, images, README) for `danielaurelia26/aureliabase_knowledge`; run and pushed only on request. Staging. | [patch](update-log/patches/U087-d14298b.patch) |
| U088 | `92fae15` | 2026-11-18 | Admin: new module Product → User journey (`/admin/user-journey`), the journey map from the owner's blueprint: 4 stages, 10 moments, 3 screens, editable, export/import. Staging and production. | [patch](update-log/patches/U088-92fae15.patch) |
| U089 | `f029a4f` | 2026-11-18 | Admin: new module Product → Journey tags (`/admin/journey-tags`): eight tag groups for every user-journey moment, a proposed first tagging, review status and notes, coverage gaps, an editable taxonomy. Staging only (`RELEASES.journeyTags`). | [patch](update-log/patches/U089-f029a4f.patch) |
| U090 | `8440ca1` | 2026-11-18 | Admin sidebar: groups fold (current one open, choices remembered), tighter, sticky; the phone menu button, hidden by the v4/v5 rule, is back. Staging; production on request. | [patch](update-log/patches/U090-8440ca1.patch) |
| U091 | `cb7c21b` | 2026-11-18 | Desktop sidebar folds to an 88px icon rail and expands again, remembered per browser; fixed bars follow `--app-sidebar`. Staging only (`RELEASES.sidebarRail`). | [patch](update-log/patches/U091-cb7c21b.patch) |
| U092 | `01e0e78` | 2026-11-18 | User journey reworked after user feedback: Journey tags merged in as tabs, a map that fits, one side panel per moment (details + tags + review), Add moment + More, one export file. Staging. | [patch](update-log/patches/U092-01e0e78.patch) |
| U093 | `db0b3a0` | 2026-11-18 | Desktop sidebar folded to the rail by default; the expanded sidebar tighter (232px, 44px rows). Phone drawer unchanged. Staging only (`RELEASES.sidebarRail`). | [patch](update-log/patches/U093-db0b3a0.patch) |
| U094 | `1c2e0f4` | 2026-11-18 | Desktop sidebar consistent: every icon 20px, rail tiles 56px with 11px labels, rail 72px; the phone drawer unchanged. Staging only. | [patch](update-log/patches/U094-1c2e0f4.patch) |
| U095 | `09868db` | 2026-11-18 | User journey: a screen links to the moments it serves and to where it lives (route or Figma); a moment lists its screens or says "No screen yet". Built by a separate agent, reviewed here. Staging. | [patch](update-log/patches/U095-09868db.patch) |
| U096 | `f655605` | 2026-11-18 | Admin: the Product group becomes Product lab; new Personas module with 300 synthetic, seeded personas, role-play prompts and balanced research panels for AI-run research. Personas staging only. | [patch](update-log/patches/U096-f655605.patch) |
| U097 | `9ee49e0` | 2026-11-18 | `docs/AI-KNOWLEDGE.md`, the agent's working knowledge for other AIs, kept current on every request; a test fails when it falls behind the journal; included in the knowledge-base export. | [patch](update-log/patches/U097-9ee49e0.patch) |
| U098 | `f834b1e` | 2026-11-18 | Wiki Research: round 2 on Insight Timer (behaviour, 11 journey flow charts, adopt/avoid after a roast) as the default version; Mermaid charts render lazily, kept out of the precache. Staging; production on request (J076). | [patch](update-log/patches/U098-f834b1e.patch) |
| U099 | `61b4abf` | 2026-11-18 | Personas become full profiles (bio, weekday, sleep, stressors, coping, personality, tech, decision style, deal breakers, success, quotes), shown as a profile and carried into the role-play prompt; admin dropdowns follow the dark theme. Staging. | [patch](update-log/patches/U099-61b4abf.patch) |
| U100 | `a6e6f83` | 2026-11-18 | One select style across the admin (no crowded native arrows); persona rows open the drawer; each persona gains test data (jobs, pain, first sentence, spend, alternatives, buy triggers, objections, access, connectivity, three when/does/expect scenarios). Staging. | [patch](update-log/patches/U100-a6e6f83.patch) |
| U101 | `2494223` | 2026-11-19 | Admin → Product lab → Buyer agent results: the first demo run (ten personas, seed 2026, Aurelia Plus at $9.99), with tallies, a price band, objections, every answer in a drawer with its three test cases, and persona problems found. Staging only (`RELEASES.buyerAgent`). | [patch](update-log/patches/U101-2494223.patch) |
| U102 | `32cdc84` | 2026-11-19 | Buyer agent results by version (v1, v2 tabs, `?v=`). Each run states its criteria, the answer definitions and the agent's instructions; persona names open the full profile. v2: 36 personas (6 regions × 6 age bands, seed 2027, v1's incoherent three left out), local prices, language, connection, wellness (struggling / strained / coping), week-one use and day 30, calibration rules, segment tables. Staging only. | [patch](update-log/patches/U102-32cdc84.patch) |
| U103 | `8a99797` | 2026-11-19 | Persona generator 2 (coherent: an `incoherence()` check finds 0 of 300; generator 1 kept byte-identical for runs v1–v2, 144 of 300 broken). Buyer agent v3: an A/B run on 36 generator-2 personas, today's offer against a proposal built from Eugene's documents and the research. Adds references, a control, changes traced to their source, and Try A/B by segment. Staging only. | [patch](update-log/patches/U103-8a99797.patch) |
| U104 | `d229d88` | 2026-11-19 | Buyer agent results → By production version: the three agent rule sets × production v1–v3 (staging v3–v5). That is nine reports, each with a written summary, the ten market-fit metrics (predicted or estimate), a step-by-step funnel, the leave reasons and every persona's walk, plus an overall summary. The rules are written as code and checked against the hand-played runs (21/36 and 20/36 the same, 0 opposite). Staging only. | [patch](update-log/patches/U104-d229d88.patch) |
| U105 | `6f24a04` | 2026-11-19 | User journey: with tags on, screens are tied to the Product surface tag (a moment shows its surfaces' screens), with a Product surfaces strip. Adds three real screenshots (Journal, Progress, Share sheet), persona demand per moment (of 300), saved maps upgraded in place, and a guided overlay tour (9 steps, opens on the first visit, Guide button to replay). | [patch](update-log/patches/U105-6f24a04.patch) |
| U106 | `a9feb6a` | 2026-11-19 | A screen from an older build whose code is gone after a deploy now reloads once into the new build (`vite:preloadError`, and the error boundary on a failed dynamic import), with a 30 s guard against loops. Off production, the error screen shows the route and the error message. Not flagged: it is a fix. | [patch](update-log/patches/U106-a9feb6a.patch) |
| U107 | `a23faa8` | 2026-11-20 | Buyer agent results reworked as a dashboard. Numbers and charts come first: yes/maybe/no bars, with A against B, objections and changes as ranked bars, a who-says-yes heat table by wellness, age and region, and the price band. Findings read as a numbered bold lead with its detail. The method is folded into "About this run". In the re-run view: a shaded matrix, metric tiles, findings the same way, and the method folded away. Staging only. | [patch](update-log/patches/U107-a23faa8.patch) |
| U108 | `3639fcf` | 2026-11-23 | Admin → Product lab → **Business funnel** (`/admin/business-funnel`): Eugene's four stages plus staying, each with targets the team can edit, the buyer agents' prediction for a chosen production version beside the feedback group's measurement (a ceiling), the biggest gap ringed, moments linked to the user journey, a decision log (proposed → measured) and a guide. The buyer re-run now walks the free limit and the Upgrade screen (metric 8). Every staging-only flag released: journey tags, the folding sidebar rail, personas, buyer agent results and the funnel are on production. | [patch](update-log/patches/U108-3639fcf.patch) |
| U109 | `cdb7225` | 2026-11-23 | Business funnel after a roast as Eugene: a **Fix next** panel under the stage cards (the biggest gap in one sentence, why agents leave across the funnel, and the change proposed for that stage), a real proposed decision for staying (d7: the next chapter's time set in the check-in, no streaks; new defaults merge into a saved log), the shortlist metrics each stage still needs a backend for, and the feedback group labelled sample data. Staging and production. | [patch](update-log/patches/U109-cdb7225.patch) |
| J109 | 2026-11-17 | Analysis + Docs | "Docs" still on screen (an old cached build); gaps between the three 2025 backend sources and today, and what can be reused (they hold no code); every request and change now kept in HANDOFF.md §17 | U084 |
| J110 | 2026-11-17 | Question | What Eugene means by "Aurelia Pro – corporate wellness, B2B2C" and the forwarded retention-simulation PDF: a scoped exploration of feature propositions for companies | — |
| J111 | 2026-11-17 | Question | What a Pydantic model is, and confirmation that the Notion wiki holds no runnable code (only prompts with data shapes written into them) | — |
| J112 | 2026-11-17 | Code + Release | Summary of the three 2025 backend documents as two wiki tabs: Backend (old), what we can reuse; Artefact, the lessons | U085 |
| J113 | 2026-11-17 | Code + Release | API contract: the opening paragraph replaced by a simple info table; the document cleaned to read like an internal team document | U086 |
| J114 | 2026-11-17 | Code | Push the wiki to `danielaurelia26/aureliabase_knowledge` as a knowledge base, only when asked: export built; push blocked (no access from this session) | U087 |
| J115 | 2026-11-18 | Code + Release | Admin "User journey" menu built from the owner's journey-blueprint zip, on staging and production | U088 |
| J116 | 2026-11-18 | Proposal + Code | Tagging and classification for the user journey, as a new admin menu for review (Journey tags), staging only | U089 |
| J117 | 2026-11-18 | Question | "I can't see what changed": Journey tags is on staging only (O34); where to find it and how to check the build | — |
| J118 | 2026-11-18 | Code | Admin sidebar too long: folding groups and a sticky sidebar; the missing phone menu button fixed. Staging; production waits for a request | U090 |
| J119 | 2026-11-18 | Code | User journey flow simplified as head of product (one page, one panel), and the desktop sidebar that folds to an icon rail (Eugene) | U091, U092 |
| J120 | 2026-11-18 | Code | Desktop sidebar still too big, and should start minimised: rail by default, tighter when expanded | U093 |
| J121 | 2026-11-18 | Code | Desktop sidebar still too big, icons and text inconsistent: one icon size, one row height, a narrower rail | U094 |
| J122 | 2026-11-18 | Question | Head-of-product view: what the user journey is for (a shared opportunity map from moment to feature to evidence), its limits today, and what would make it useful | — |
| J123 | 2026-11-18 | Question | How the user journey is actually used: who, when, and three concrete walkthroughs (planning a sprint, after interviews, briefing content) | — |
| J124 | 2026-11-18 | Docs | A one-to-two-sentence question for the lead to confirm what the user journey is for | — |
| J125 | 2026-11-18 | Question | What "Add screen" in the user journey is for, and its weak spot (screens belong to a stage, not to a moment) | — |
| J126 | 2026-11-18 | Code + Research | Screens linked to moments (done with another agent); a second, deeper Insight Timer research started (behaviour, journeys, what to adopt, then a roast) | U095 |
| J127 | 2026-11-18 | Analysis + Proposal | Eugene on the user journey: product-team driven, every scenario across the 4 stages, an evolving platform like Trello/Asana, readable by Claude to reason about journeys and product logic; the 'AI that builds the AI' plan. Read and turned into a three-phase proposal | — |
| J128 | 2026-11-18 | Code + Opinion | Product lab menu; Personas with 300 varied synthetic personas as candidates for AI-run research, and a view on using them | U096 |
| J129 | 2026-11-18 | Code + Docs | Always add what was learned to a file other AIs can read: `docs/AI-KNOWLEDGE.md`, enforced by a test | U097 |
| J130 | 2026-11-18 | Research + Code | Insight Timer round 2 delivered: behaviour from communities and reviews, its journey as 11 flow charts, retention evidence, what to adopt now/next/later after a roast; in the wiki Research tab | U098 |
| J131 | 2026-11-18 | Code | Personas too thin: rebuilt as real profiles; a dropdown that looked broken (dark mode) fixed | U099 |
| J132 | 2026-11-18 | Code + Opinion | Dropdown issues; persona drawer and deeper test data; a buyer test agent that reads the personas (view and proposal) | U100 |
| J133 | 2026-11-19 | Code | Buyer agent results in Product lab; run the buyer agent on ten personas as a demo | U101 |
| J134 | 2026-11-19 | Code | Criteria for buyer agent v1, clickable personas; v2 with region, wellness, age range and more personas, played more carefully; every version on the page | U102 |
| J135 | 2026-11-19 | Code | Buyer agent v3 using Eugene's documents as reference; fix what v1–v2 found (the persona generator) | U103 |
| J136 | 2026-11-19 | Opinion | Eugene: retention metrics, funnel and bounce, what holds back more AI plays, designs close to the feedback group, top 10 MVP market-fit metrics in buyer agent testing (view and plan) | — |
| J137 | 2026-11-19 | Question | Which production design version the buyer agent runs used | — |
| J138 | 2026-11-19 | Opinion | The two design versions to test (buyer agent v4 and the feedback group) | — |
| J139 | 2026-11-19 | Code | Re-run the three buyer agents on production v1, v2 and v3, with a summary for every report | U104 |
| J140 | 2026-11-19 | Opinion | What Eugene wants: a business funnel map (the lighthouse's four stages over the user journey, with market-fit metrics), buyer agents that follow it and return fixes, a dual track with humans, and the feedback playbook updated (explained) | — |
| J141 | 2026-11-19 | Opinion | Is the business funnel a CMS like the user journey, and what is it for | — |
| J142 | 2026-11-19 | Opinion | How the user journey, the business funnel and the buyer agent connect; what one iteration produces | — |
| J143 | 2026-11-19 | Opinion | What the current user journey map is, and why screens should be tied to the tags (the Product surface tag) | — |
| J144 | 2026-11-19 | Code | Roast the user journey as head of product, make it work, add a guided overlay with a guideline | U105 |
| J145 | 2026-11-19 | Code | "Something went wrong" on staging (build ecbd3f6) | U106 |
| J146 | 2026-11-20 | Code | Buyer agent results: a dashboard with charts, easier and more comfortable to read | U107 |
| J147 | 2026-11-23 | Question | Eugene's "retreat in a box": not in any record or this session's history; asked for the brief | — |
| J148 | 2026-11-23 | Record | Eugene's freemium and state-transition brief kept as context (docs/briefs), not acted on until the rest arrives | — |
| J149 | 2026-11-23 | Opinion | Retreat-in-a-Box: what Eugene actually wants (a paid creator-led 8-week retreat feeding Aurelia Plus, with an admin cockpit), what not to take at face value, and the order to build it | — |
| J150 | 2026-11-23 | Opinion | Eugene's latest messages read; the 2025 measurement system reviewed against the admin: 10 critical metrics in 5 groups that the admin does not cover | — |
| J151 | 2026-11-23 | Opinion | What Eugene is asking for, in plain words: one goal (market fit), one loop (dual track), three tools in the admin | — |
| J152 | 2026-11-23 | Opinion + fix | What the machine still lacks: the business funnel as the hub (with measured human numbers and a decision log); correction: an upgrade screen does exist | — |
| J153 | 2026-11-23 | Code + release | Does the buyer agent need redoing? Build the Business funnel; put every decision on staging and production; roast again and improve so Eugene has nothing to complain about | U108, U109 |

### 17.2 Code changes (U)

| ID | Commit | Pushed (UTC) | What | Patch |
| --- | --- | --- | --- | --- |
| U001 | `d456e53` | 2026-10-09 04:53 | Add a design-version switcher on staging and create Version 2 (more motion). | [patch](update-log/patches/U001-d456e53.patch) |
| U002 | `2d7e96d` | 2026-10-09 04:55 | v2: micro-animations on Home feature-card icons. | [patch](update-log/patches/U002-2d7e96d.patch) |
| U003 | `f4710e2` | 2026-10-09 05:00 | Move the switcher into a 28px StagingBar fixed at the top of every page. | [patch](update-log/patches/U003-f4710e2.patch) |
| U004 | `a8470a3` | 2026-10-09 07:08 | v2 round 2: remove icon micro-animation; Pause/Play voice icon; floating player; directional page transitions; draggable sheets; pull to refresh; coin counter; tablet layout. | [patch](update-log/patches/U004-a8470a3.patch) |
| U005 | `9ba8ab5` | 2026-10-09 07:17 | Rewrite the v2 "What changes" dialog as grouped sections. | [patch](update-log/patches/U005-9ba8ab5.patch) |
| U006 | `19043b2` | 2026-10-09 07:24 | v2: Total Credits counts up on /credits. | [patch](update-log/patches/U006-19043b2.patch) |
| U007 | `9dd0d7d` | 2026-10-09 07:27 | v2: drifting soft background behind the new-chat orb. | [patch](update-log/patches/U007-9dd0d7d.patch) |
| U008 | `f71c219` | 2026-10-09 07:40 | v2: typing example prompts in Home Ask field; pulsing live-map dots. | [patch](update-log/patches/U008-f71c219.patch) |
| U009 | `c72297e` | 2026-10-09 07:58 | v2: stronger promo glow; coin-flip profile picture. | [patch](update-log/patches/U009-c72297e.patch) |
| U010 | `d6052a0` | 2026-10-09 08:10 | v2: promo banner light follows the cursor. | [patch](update-log/patches/U010-d6052a0.patch) |
| U011 | `37db91f` | 2026-10-09 14:59 | Annotations: pins scoped to the design version. | [patch](update-log/patches/U011-37db91f.patch) |
| U012 | `9b63ad8` | 2026-10-09 15:25 | v2: centre sign-in heading; Home order (Quick Start up, Live Sessions above Community); working Share on player. | [patch](update-log/patches/U012-9b63ad8.patch) |
| U013 | `b929beb` | 2026-10-11 15:19 | Staging password AURELIA3.0 (production stays AURELIA2.0). | [patch](update-log/patches/U013-b929beb.patch) |
| U014 | `051d1a2` | 2026-10-11 16:41 | v2: taller player sheet rest (description visible); filter chips on opened recommendations. | [patch](update-log/patches/U014-051d1a2.patch) |
| U015 | `6e5ae91` | 2026-10-12 15:16 | v2: player sheet rests at the title; description only when fully open (corrects U014). | [patch](update-log/patches/U015-6e5ae91.patch) |
| U016 | `c39e1e6` | 2026-10-12 15:29 | v2: player Share opens a share sheet (social targets, copy link, More). | [patch](update-log/patches/U016-c39e1e6.patch) |
| U017 | `d12528f` | 2026-10-12 15:32 | v2: richer recommendation filter (icon chips, sliding highlight, selected summary). | [patch](update-log/patches/U017-d12528f.patch) |
| U018 | `f3cf7cd` | 2026-10-12 15:37 | v2 dialog: recap of every v2 change, grouped by screen. | [patch](update-log/patches/U018-f3cf7cd.patch) |
| U019 | (this log commit) | 2026-10-12 15:37 | Production: `web_prod` fast-forwarded from `f738209` to `web_app`. | — |
| U020 | `0381705` | 2026-10-12 16:03 | Production uses v2 only (pinned; no v1, no picker). `web_prod` fast-forwarded. | [patch](update-log/patches/U020-0381705.patch) |
| U021 | `4def866` | 2026-10-12 17:17 | Favicon redrawn from the real mark; PNG sizes, apple-touch-icon, manifest. | [patch](update-log/patches/U021-4def866.patch) |
| U022 | `83fd46d` | 2026-10-13 00:29 | PNG icons replaced with supplied Aurelia SVGs (chat menu, header Play, Unpublish, Progress tabs). | [patch](update-log/patches/U022-83fd46d.patch) |
| U023 | `ea37c00` | 2026-10-13 00:52 | Drawer/sidebar nav icons → Aurelia SVGs (user, note, playlist-02, chart-medium). | [patch](update-log/patches/U023-ea37c00.patch) |
| U024 | `2758524` | 2026-10-13 01:01 | Drawer/sidebar: supplied sidebar logo; bell SVGs (plain/active) with local unread state. | [patch](update-log/patches/U024-2758524.patch) |
| U025 | `553c77f` | 2026-10-14 11:42 | v2: Google-Maps-style player sheet (drag anywhere, 3 rests, flick, tap; player visible at half). | [patch](update-log/patches/U025-553c77f.patch) |
| U026 | `cc85aab` | 2026-10-14 16:17 | Chat: animated generating card is the default (flag `chat.generatingV2` removed). | [patch](update-log/patches/U026-cc85aab.patch) |
| U027 | `955d004` | 2026-10-14 16:22 | Home logo: supplied vector replaces the blurry upscaled PNG. | [patch](update-log/patches/U027-955d004.patch) |
| U028 | `75f3664` | 2026-10-14 16:23 | Drawer/sidebar Invite a Friend + Help → SVG icons (user-add, message-question). | [patch](update-log/patches/U028-75f3664.patch) |
| U029 | (this log commit) | 2026-10-14 | Production: `web_prod` fast-forwarded from `803d15f` to `web_app` (U021–U028 and everything since U020). | — |
| U030 | `9b61806` | 2026-10-15 10:46 | Fix: Home Quick Start cards squashed to 56px on desktop in v2. | [patch](update-log/patches/U030-9b61806.patch) |
| U031 | `cb37df5` | 2026-10-15 10:48 | Desktop v2: Ongoing Live Sessions becomes a full-width map banner. | [patch](update-log/patches/U031-cb37df5.patch) |
| U032 | `6c2d911` | 2026-10-15 10:54 | New tool: click insights — records screens + taps, review at `/__demo/insights` with per-screen heatmap. | [patch](update-log/patches/U032-6c2d911.patch) + [b](update-log/patches/U032b-15a4254.patch) |
| U033 | `1df0c28` | 2026-10-15 10:54 | Explore: Monthly Challenge card 320px tall on desktop (was ~600px). | [patch](update-log/patches/U033-1df0c28.patch) |
| U034 | `bc433a4` | 2026-10-15 11:18 | Click insights: element-level detail (kind, section, position on element, state, timing, result, rage/dead), Elements table, Problem taps, element heatmap. | [patch](update-log/patches/U034-bc433a4.patch) |
| U035 | `b540605` | 2026-10-15 16:41 | Home closing network artwork rebuilt in Three.js (measured from the PNG); hidden by default, switched on from `/__demo` → 3D network (+ Motion). | [patch](update-log/patches/U035-b540605.patch) + [b](update-log/patches/U035b-d208547.patch) |
| U036 | `4bc9c2e` | 2026-10-15 16:51 | Home feeling chips; chat reply-to-message; header Play only after something exists; limit copy (new session free); sign-in fills <640px. | [patch](update-log/patches/U036-4bc9c2e.patch) |
| U037 | `7328ab6` | 2026-10-18 16:39 | Equal-height recommendation cards; mini player Close; lineage See All + versions; Details publishing + creator version history; logic review PDF. | [patch](update-log/patches/U037-7328ab6.patch) |
| U038 | `a7dbf32` | 2026-10-20 00:40 | Connect request + sent dialog per Figma; all sheets full-width <640; design v3 (change sheet summary, every build kept in thread). | [patch](update-log/patches/U038-a7dbf32.patch) |
| U039 | `98691ba` | 2026-10-21 08:55 | Wellness Analytics v2+: per-session analysis cards + Analysis page (Figma 16885:1622), derived logic; chat styleChanges race fix. | [patch](update-log/patches/U039-98691ba.patch) |
| U040 | `b5ea379` | 2026-10-21 09:51 | Analysis: metric list + chart type balanced (chart drawn at real width, 12px labels; one weight per row). | [patch](update-log/patches/U040-b5ea379.patch) |
| U041 | `8d6c79d` | 2026-10-21 10:03 | Player analysis drawer + Feedback (Figma 16886:1623); Settings/Script title card + rename (16883:13096); chat ask race fix. v2+. | [patch](update-log/patches/U041-8d6c79d.patch) |
| U042 | `a4c9092` | 2026-10-21 10:55 | Session settings: Current style cards read-only in v2+ (no Remove). | [patch](update-log/patches/U042-a4c9092.patch) |
| U043 | `c7a9243` | 2026-10-21 10:58 | Session settings stretches to full width below lg (was capped at 402); Add buttons aligned. All versions. | [patch](update-log/patches/U043-c7a9243.patch) |
| U044 | (this log commit) | 2026-10-21 | Production: `web_prod` fast-forwarded from `4140e59` to `web_app` (U030–U043). | — |
| U045 | `8286ffb` | 2026-10-21 17:48 | Change filter moved from the thread's opened deck into the "+" sheet (v2 + v3); summary shows the largest gain, not a sum. | [patch](update-log/patches/U045-8286ffb.patch) |
| U046 | (this log commit) | 2026-10-21 | Production: `web_prod` fast-forwarded from `2a2a376` to `web_app` (U045). | — |
| U047 | `720e50a` | 2026-10-22 06:14 | Design v4 = v3 + first-run onboarding (`/welcome`): goal, feeling, style, editable summary → first session; Skip keeps answers; Replay in Settings. | [patch](update-log/patches/U047-720e50a.patch) |
| U048 | `8bb282f` | 2026-10-23 15:35 | Production-grade foundation: TanStack Query, typed/validated HTTP, safe storage, error reporting, shared KV, 0 lint warnings, 55 Vitest tests, CI. No visual change. | [patch](update-log/patches/U048-8bb282f.patch) |
| U049 | `8a6f011` | 2026-10-25 09:42 | Offline support (service worker, offline banner, update prompt) + 404 for signed-out forced access to protected pages. | [patch](update-log/patches/U049-8a6f011.patch) |
| U050 | `ae75233` | 2026-10-26 00:05 | v4 first-time fixes from the J039 retention simulation: words kept into onboarding, own thread + goal deck, limit after first build, chapter check-in + calendar reminder, next-chapter Home, Quick Start plays, Connect off. | [patch](update-log/patches/U050-ae75233.patch) |
| U051 | `e826b7b` | 2026-10-26 01:40 | v4: J038 simplification D1–D7 — four tabs, Create/Discover/Progress/Me, Library, coins only in Me, Insights retired, simpler player sheet for others' sessions, one list of changes in the chat, Phase 0 fixes. | [patch](update-log/patches/U051-e826b7b.patch) |
| U052 | `399d87a` | 2026-10-27 | Production moves to design v4 (`PRODUCTION_VERSION` 2 → 4) and `web_prod` is fast-forwarded to `web_app`; build badge on Me in v4. | [patch](update-log/patches/U052-399d87a.patch) |
| U053 | `b030823` | 2026-10-27 | Design v5 (staging only) = v4 reworked after three real user interviews: progress in words, Why on suggestions, next-chapter plan, wearable in onboarding, journal, community without ranks, plain landing. | [patch](update-log/patches/U053-b030823.patch) |
| U054 | `e661073` | 2026-10-28 | Production gets the design-version bar and picker (default still v4); `web_prod` fast-forwarded, bringing v5 (U053) to production as an option. | [patch](update-log/patches/U054-e661073.patch) |
| U055 | `e4c8e8e` | 2026-10-29 | Production offers two versions with its own numbers: prod v1 = staging v4 (default), prod v2 = staging v5; `web_prod` fast-forwarded. | [patch](update-log/patches/U055-e4c8e8e.patch) |
| U056 | `b469f86` | 2026-10-30 | Chat box 16px taller; Explore/Discover header follows the scroll; admin Well-being outcomes (WHO-5, check-ins, heart rate) page + per-user panel. Staging only. | [patch](update-log/patches/U056-b469f86.patch) |
| U057 | `f390b95` | 2026-10-30 | v5 Why? text fix (goal-only basis read "your goal and “Sleep better”"); user-facing What's New PDF for v5 / prod v2. Staging only. | [patch](update-log/patches/U057-f390b95.patch) |
| U058 | `57e192d` | 2026-11-10 | Admin Experimentation section: the feedback-group study (30 people, 8 weeks, six cohorts): criteria, participants, measures, data quality and safety, per-participant page. Sample data. Staging only. | [patch](update-log/patches/U058-57e192d.patch) |
| U059 | `5bb9580` | 2026-11-10 | Experimentation section hidden (flag `adminExperimentation` unreleased) while the client's pricing is awaited. Staging only. | [patch](update-log/patches/U059-5bb9580.patch) |
| U060 | `ac6f07d` | 2026-11-11 | Experimentation reopened, plus a second version for review (Feedback group · v1 and · v2: Wins, This week, Engagement). Staging only. | [patch](update-log/patches/U060-ac6f07d.patch) |
| U061 | `66207a7` | 2026-11-11 | Team documents in the app at `/guide`: admin guideline, PRD overview (new), API contract; admin sidebar link. **Promoted to production with everything since U055.** | [patch](update-log/patches/U061-66207a7.patch) |
| U062 | `1ff0d04` | 2026-11-11 | Feedback group for the project manager: PM playbook (PDF + `/guide/playbook`), Version 2 → Milestones tab with computed gates, coaching log on every participant page, "not reached for 2 days" in This week. On production since U064. | [patch](update-log/patches/U062-1ff0d04.patch) |
| U063 | `ed5e2b7` | 2026-11-11 | PM playbook carries the whole study protocol as its appendix (P1–P11, six screenshots), in the HTML, the PDF and `/guide/playbook`. On production since U064. | [patch](update-log/patches/U063-ed5e2b7.patch) |
| U064 | `a876ab5` | 2026-11-11 | `/guide` lists the feedback group playbook first, titled for Eugene's request; **production promoted with U062–U064** (on request). | [patch](update-log/patches/U064-a876ab5.patch) |
| U065 | `8002466` | 2026-11-11 | Aurelia branding on every document (logo, gradient, Home's glow, network artwork), strongest on the playbook; `/guide` front page rewritten plainly, without naming a person. On production. | [patch](update-log/patches/U065-8002466.patch) |
| U066 | `0c52d70` | 2026-11-12 | Chat: one Chapter card + Review sheet instead of the fanned deck, every version. Staging only (`RELEASES.chapterCard`). | [patch](update-log/patches/U066-0c52d70.patch) |
| U067 | `6085b63` | 2026-11-12 | Explore: Personal journeys shelf, See All and a story page, every version. Staging only (`RELEASES.personalJourneys`). | [patch](update-log/patches/U067-6085b63.patch) |
| U068 | `ae2c156` | 2026-11-13 | Daily check-in sheet after every sign-in + Journal tab (v1–v3 session page, v4+ Progress), every version. **Staging and production** (on request). | [patch](update-log/patches/U068-ae2c156.patch) |
| U069 | `c535dd5` | 2026-11-13 | Player simplified (back, share, play, cue, scrubber; no coin, skips or details sheet), every version. **Staging and production** (on request). | [patch](update-log/patches/U069-c535dd5.patch) |
| U070 | `eee28bc` | 2026-11-13 | Daily check-in findable: "Saved to your Journal · Open Journal", Journal tab on Progress in every version, v5's journal lists check-ins. On production with U071. | [patch](update-log/patches/U070-eee28bc.patch) |
| U071 | `6303583` | 2026-11-13 | My Wellness → Analytics → analysis page to Figma 16906:5168 (mood-face chart, What helped me list, no Next chapter), v1–v4. Staging and production (on request). | [patch](update-log/patches/U071-6303583.patch) |
| U072 | `811a444` | 2026-11-13 | Journal moved to the session's About page (back in every version, titled About); out of Progress. Chapter card and Personal journeys switched on for production. Staging and production. | [patch](update-log/patches/U072-811a444.patch) |
| U073 | `5e73eaf` | 2026-11-13 | Journal cards wrap a long unbroken note instead of running past the card. On production with U075. | [patch](update-log/patches/U073-5e73eaf.patch) |
| U074 | `168c32d` | 2026-11-13 | Journal note wrapping: `word-break: break-word` fallback beside `overflow-wrap: anywhere` (older Safari). On production with U075. | [patch](update-log/patches/U074-168c32d.patch) |
| U075 | `593dc17` | 2026-11-13 | Production offers three versions — v1 = staging v3, v2 = staging v4, v3 = staging v5 — and opens on v3. Shipped with U073–U074. | [patch](update-log/patches/U075-593dc17.patch) |
| U076 | `eeb7a8f` | 2026-11-15 | /guide gets a fifth document, **Research**: the Insight Timer deep research rewritten for reading. Staging and production (J076). | [patch](update-log/patches/U076-eeb7a8f.patch) |
| U077 | `a6619b4` | 2026-11-15 | Feedback-group playbook in /guide gets versions: v1 Original, v2 Mission guide (plain and upbeat), v3 Quick start (one page). Staging and production (J076). | [patch](update-log/patches/U077-a6619b4.patch) |
| U078 | `07a59e1` | 2026-11-16 | Playbook v2 and v3 rewritten after a junior-PM read-through: what Aurelia is, who's who, questionnaires in plain words, a worked example, what to say when, a glossary, the first week. Staging and production. | [patch](update-log/patches/U078-07a59e1.patch) |
| U079 | `ccb84a3` | 2026-11-16 | Admin guideline in /guide gets versions: v1 Original, v2 Task guide, v3 Quick start (one page). Staging and production. | [patch](update-log/patches/U079-ccb84a3.patch) |
| U080 | `0453426` | 2026-11-16 | New page `/designsystem` (the design system read live from the Figma export and the app's components). Research gains Insight Timer screenshots and a competition section. Staging and production. | [patch](update-log/patches/U080-0453426.patch) |
| U081 | `d891491` | 2026-11-16 | /designsystem lists every component (71) in 10 patterns, with guidance, states, live demos (28) and props read from the source. Staging and production. | [patch](update-log/patches/U081-d891491.patch) |
| U083 | `de65993` | 2026-11-17 | Docs become the Wiki: /guide → /wiki (old links redirect), "Wiki" everywhere, and the design system joins it as a sixth tab (/designsystem redirects). Staging and production. | [patch](update-log/patches/U083-de65993.patch) |
| U082 | `68d7b21` | 2026-11-16 | /guide typography for comfortable reading: no faked bold, larger body text and leading, a reading measure, one spacing rhythm, calmer headings, clearer links, lists and tables. Staging and production. | [patch](update-log/patches/U082-68d7b21.patch) |

---

# Appendix A · The rulebook: every rule of the game, with its source

§2 is the short version. This is the complete set: every rule that governs how
work is done here, where it came from, and why. When two rules seem to
conflict, the **session owner's explicit words in the current request win**,
then this list, then `CLAUDE.md`'s conventions, then your own judgement.
Record any such conflict in the journal.

### A.1 Working with the session owner

| # | Rule | Source |
| --- | --- | --- |
| A1.1 | Reply in **Indonesian**. Write deliverables meant for others (reports, PDFs, user updates, WhatsApp texts) in **English**, in plain language. | Session practice; J048 ("buatkan dalam bahasa inggris") |
| A1.2 | Think and answer as a **senior PM / product designer**. Flag what is missing, not only what was asked. | J011 (standing instruction) |
| A1.3 | When a request is abstract or incomplete, **do not block on questions**. Choose the most reasonable interpretation, act, and state the assumption, in the reply and in the U-entry's **Interpretation**. Ask only when the answer would change what you build and no sensible default exists. | Practice since J023; e.g. U055's prod v1/v2 mapping |
| A1.4 | Read forwarded screenshots closely. The red markings are the request, and Eugene's WhatsApp lines are the brief. | J030, J054 |
| A1.5 | Give a short status in chat and put the detail in the logs. Offer the decisions that remain as a short numbered list. | Practice |
| A1.6 | Send files with the send-file tool (`display: render` for PDFs). Also give the GitHub link to the file on `web_app`. | J040 (the PDF would not open), the owner report |
| A1.7 | "Try again" with no context after a session restart means: re-check the state and restate the result, then ask what was meant. | J033 |

### A.2 Recording everything

| # | Rule | Source |
| --- | --- | --- |
| A2.1 | **Every request gets a J-entry**, questions included. "Setiap hal kamu harus catat dalam sebuah md, tidak boleh terlewatkan." | J021, 2026-10-20 |
| A2.2 | Every code change gets a **U-entry**, a **patch file** and a **CHANGE-LOG** entry, in the same push as the code. | `CLAUDE.md` · Update log |
| A2.3 | Write down what was **answered or proposed**, not only what was done. The reasoning is what gets lost. | Journal rule 3 |
| A2.4 | Anything waiting on a decision goes into **Open items** and stays until decided. Record the decision in the entry that made it. | Journal rule 4 |
| A2.5 | **No secrets** anywhere in the repo: passwords, Figma pairing codes (they expire in 5 minutes), tokens. Log that a code was issued, never the code itself. | Journal rule 5; J016/J017/J022/J024/J045 |
| A2.6 | Log ambiguous asks with the verbatim request and the interpretation, so a single update can be reverted on its own (`git revert --no-commit <sha> && git checkout HEAD -- docs/`). | `CLAUDE.md` · Update log |
| A2.7 | A design-token change is also logged in `docs/DESIGN-SYSTEM-HISTORY.md`. | `CLAUDE.md` · tokens |
| A2.9 | **Every request and change is also in `HANDOFF.md` §17**, in the same push; §4 is updated when the state moves. A test fails the build otherwise. | Owner, 17 Nov 2026 (J109) |
| A2.8 | Update `PRD.md` / `FOR-*.md` in the same commit when behaviour they describe changes. Update `HANDOFF.md` §4 whenever production moves or the state changes materially. | `CLAUDE.md` · other documents; this file |

### A.3 Branches and releases

| # | Rule | Source |
| --- | --- | --- |
| A3.1 | Work happens on `web_app`. **`admin_cms` is fast-forwarded to it after every push.** A divergence is a mistake. | `CLAUDE.md` |
| A3.2 | **Production (`web_prod`) moves only when the session owner asks**, by `--ff-only`. Never because work looks finished. Never commit on it. If ff fails, stop and report. | `CLAUDE.md` (standing instruction from the product owner) |
| A3.3 | Production's design version and offered versions (`PRODUCTION_VERSION`, `PRODUCTION_VERSIONS`) change only on request. | U020, U052, U054, U055 |
| A3.4 | Never promote a red CI run. Check CI for the pushed SHA after every push. | `CLAUDE.md` · Running it |
| A3.5 | `package.json` `version` is bumped only when someone names a release. The SHA is the truth. | `CLAUDE.md` |
| A3.6 | No pull requests unless asked; push directly. Commit messages end with the session's attribution trailer, and **no model identifier** goes in commits, code or docs. | Session environment rules |
| A3.7 | A new or changed shared component should get a story on `storybook` soon after it lands. That branch is currently behind (§4). | `CLAUDE.md` |
| A3.8 | The web app is the reference; Flutter follows. A change to a shared shape (type scale, 20px gutter, brand vectors) must be carried to `mobile_app`, and logged as a gap if it is not. | `CLAUDE.md`; O7 |

### A.4 Design and layout

| # | Rule | Source |
| --- | --- | --- |
| A4.1 | **The mobile layout (below `lg:`, 402px) is frozen** unless the user explicitly asks for a mobile change. Desktop work goes in `lg:` utilities and is checked at 402px. | `CLAUDE.md` (standing rule) |
| A4.2 | **New ideas go into a new design version first. Never dirty an earlier version** ("jangan sampai mengotori v2"). Change several or all versions only when the request says so (e.g. U043, U056 "untuk semua versi"). | J042; `CLAUDE.md` · Design versions |
| A4.3 | "No visible change" is proved with **pixel-identical screenshots**, before vs after, for every affected version and width. | J035, J042, J049, U056 |
| A4.4 | Figma variables are the source of truth. `tokens.css` is generated and never edited by hand. `radius/20` and `radius/48` stay raw values, with no invented tokens. | `CLAUDE.md` · tokens |
| A4.5 | Read specs from the Figma file itself (Figma bridge), not from screenshots. Where Figma contradicts itself, build the consistent version and **flag the Figma problem** to the owner. | J019, J023, J026 |
| A4.6 | Use Lucide icons, Mulish, the gold/espresso palette, Unsplash covers and light only. The `design-taste-frontend` skill's Aurelia overrides win over its upstream rules. | `CLAUDE.md` · conventions |
| A4.7 | Never run Prettier. | `CLAUDE.md` |

### A.5 Product principles that came out of the research (treat as rules)

| # | Principle | Source |
| --- | --- | --- |
| A5.1 | **Never show a person numbers that are not theirs, or that nobody measured.** No invented progress, no "+3% since yesterday" before a first listen, no numeric health claims on cards. | Logic review H2 / decision 13; J039 F4; v5 interviews |
| A5.2 | **The first session must be theirs:** it uses their words, follows their goal, opens in their own conversation, and starts with no paywall. | J039 R1–R3, U050 |
| A5.3 | **The return loop:** it heard me → a promise (Chapter 2) → a cue (reminder) → proof from their own check-ins → a next goal. | J039 §1 |
| A5.4 | **Explain, don't score.** Progress is told in words; the detail and its basis are available on demand; every suggestion can say why. | J049 / v5 |
| A5.5 | **Ask before using data.** Data sources are off for a new account; a wearable is asked for once, with what it would read. | J039 F8/R9, U050, v5 |
| A5.6 | **Community without competition:** stories and shared journeys, no rankings; say what is shared and what stays private. | J049 / v5 |
| A5.7 | **Simplify what people see, not what the product can do:** show when needed, one main path, smart defaults, features behind flags, merge similar screens. | J013, J038 |
| A5.8 | Simplification alone barely moves retention. Relevance and continuity come first. | J039 (simplification alone: D7 3.8 → 4.0%) |
| A5.9 | **Real users outrank the simulation.** Read the model's ranking, not its decimals. | J040, J049 |
| A5.10 | Mental-health adjacency: a well-being concern is **flagged for a human**, never acted on automatically by Aurelia. Outcome figures are observational, not causal or clinical. | Logic review H1; U056 |
| A5.11 | Click insights store labels and positions, **never field values**. Production tracking needs a consent decision. | `CLAUDE.md`; logic review G4; O1 #15 |

### A.6 Engineering

| # | Rule | Source |
| --- | --- | --- |
| A6.1 | Use the U048 foundation: TanStack Query for server state, `requestJson` for HTTP, `lib/storage` for storage, `reportError` for errors, pure data outside component files. | `CLAUDE.md` · foundation |
| A6.2 | `npm run check` must pass (typecheck with `tsc -b`, oxlint with `--deny-warnings`, vitest). Add tests for new pure logic. | `CLAUDE.md` |
| A6.3 | Never put a non-route file directly in `api/` (Vercel makes it an endpoint). `vercel.json` takes no comments. | `CLAUDE.md` |
| A6.4 | Sheets and modals go through `createPortal`. | `CLAUDE.md` |
| A6.5 | `/__demo` stays outside the password and **must never be linked from the app**. The site lock defaults on, and is a courtesy, not security. | `CLAUDE.md` |
| A6.6 | Sign-in deliberately does not persist (until decision D2). Don't "fix" it without the decision. | `CLAUDE.md`; J039 D2 |
| A6.7 | Behaviour that looks arbitrary usually has a reason in `docs/PRD.md`. Read it before changing it. For example, the sign-in ask lands on send, and the password-reset confirmation never reveals whether an address exists. | `CLAUDE.md` |

### A.7 Reports and deliverables

| # | Rule | Source |
| --- | --- | --- |
| A7.1 | Reports for the owner follow **before → suggestion → now → impact**, with screenshots in pairs. | J047 |
| A7.2 | Every figure is tagged **Measured** (happened on the real app) or **Predicted** (model). Ranges are stated. | J047 |
| A7.3 | AI-produced analysis carries the label **"AI analysis · Based on Claude self-analysis and deep research"** and says how Claude did it (self-analysis, simulated research, deep research, build and verify). | J048 (Eugene wanted an AI analysis) |
| A7.4 | Each research document states what it **is not** (e.g. "a simulation ranks fixes and gives an order of magnitude; a real test replaces it"). | J039, J040 |
| A7.5 | User-facing material is warm, short and English, with the changes **marked in orange on real screenshots** (boxes drawn from measured element positions). Sample data is labelled as examples. | J058 |
| A7.6 | WhatsApp texts use single-asterisk bold and plain bullets, delivered in a copyable block. | J057 |
| A7.7 | Every report has an HTML source in the repo next to its PDF, plus its images. Owner reports are also a private claude.ai artifact. | J038–J058 |

---

# Appendix B · Research compendium: every result

Everything that was researched, measured or modelled, in order. The full
documents are in `docs/reviews/` and `docs/user-updates/` (§13). This appendix
holds enough detail to act on without opening them.

## B.1 Product logic review (18 Oct, J012): 43 findings, 15 decisions

Build reviewed: `7328ab6`, design v2.
- **Method:** code reading; the app driven at 402/540/1280px; cross-checked against the PRD and FOR-PRODUCT.
- **Severity:** 6 critical, 16 high, 14 medium, 4 low, 4 fixed in U037.
- **Kinds of finding:** *Broken* (the build contradicts itself), *Missing rule* (the UI implies an undecided rule), *Contradiction* (two decisions disagree).

**The five to decide first:**
1. What the free plan limits (A1, A2): the pause never lifts, and "new sessions are free" makes it unlimited.
2. One version model (B1–B3).
3. Recreate must fork the session on screen (C1).
4. What a lineage is made of (C3, C6).
5. What wins a challenge (F2).

**All findings** (ID · title · severity/kind):

| Area | Findings |
| --- | --- |
| A · Free plan and limits | A1 "paused until" never honoured (Critical, Broken) · A2 "new session is always free" makes the limit unlimited (Critical, Contradiction) · A3 what counts as a "send" is accidental (High, Missing rule) · A4 Upgrade has no defined benefit (High, Missing rule) |
| B · Versions and publishing | B1 two version systems (High, Broken) · B2 no numbering scheme (High, Missing) · B3 Publish while building (High, Broken) · B4 live vs current undefined (Medium) · B5 any cut playable by URL (Medium) · B6 what "published on" means (Medium) · B7 unpublish consequences (Medium) |
| C · Recreate and lineage | C1 player Recreate forks the wrong session (Critical, Broken) · C2 lineage steps are names, not sessions (High) · C3 "Recreated 9.8k" has no data (High) · C4 which version a fork uses (Medium) · C5 self-recreation and credit loops (Medium) · C6 coin sharing through lineage (High) |
| D · Cockpit | D1 only one conversation exists (High, Broken) · D2 hand-offs land in whatever thread is open (High, Broken) · D3 a build only progresses while watched (Medium, Broken) · D4 recommendations ignore the request; scores add up (Medium) · D5 "arrive applied" vs free choice (Medium, Contradiction) · D6 no failure states in the core loop (High) · D7 New Session stops what is playing (Low, Contradiction) |
| E · Playback | E1 what a "play" is (Medium) · E2 floating player lifecycle (Medium) · E3 every session is the same 10-second loop (Low, known) |
| F · Coins and challenges | F1 three currencies, no rules (High) · F2 what wins a challenge (High, Contradiction) · F3 how a session enters a challenge (Medium) |
| G · Accounts, data, trust | G1 open admin and open write endpoints (Critical, known) · G2 "is this mine?" decided by display name (High, Broken) · G3 session lifetime and sign-in (High) · G4 click insights need consent (Medium) |
| H · Claims and safety | H1 no safety path in a mental-health-adjacent chat (Critical) · H2 health outcomes shown as facts (Critical) · H3 publishing has no review (High) · H4 a switched-off signal (Medium) |
| I · Process | I1 staging opens on a different app than production (Low) · I2 web and mobile drift (Low) |
| Fixed in U037 | equal-height recommendation cards · lineage See All works and counts agree · the mini player can be closed · Details show publishing state and the creator's version history |

**The 15 decisions with recommended defaults** (open item O1; none formally
accepted yet):

| # | Question | Recommended default |
| --- | --- | --- |
| 1 | What the free plan limits | Builds per account per day (e.g. 5); conversation unlimited; resets at local midnight |
| 2 | What Premium adds | More builds per day, longer sessions, all voices, analytics |
| 3 | Version numbering | v1.0 first build, +0.1 per build, per session; a fork is a new session at v1.0 |
| 4 | Live vs current | Live changes only on (Re)publish; no publishing while building; non-live cuts are creator-only |
| 5 | Unpublish consequences | Recreations stay and keep credit; links say "no longer available"; earned coins stay |
| 6 | Fork source | Always the live version; record parent and version; no automatic updates |
| 7 | Lineage membership | Every step is a real session; private or deleted steps show "Private session" with credit kept |
| 8 | Lineage payouts | 70 / 20 / 10, at most 3 generations; no payout to yourself from your own chain |
| 9 | Conversation model | One conversation per session, listed under "Latest"; hand-offs open the right one |
| 10 | What a play is | ≥ 60 s or 25% of the session; once per listener per day for rankings |
| 11 | Challenge winners | Participants: personal streak and points. Creators: a board of challenge sessions ranked by qualified plays |
| 12 | One currency | Coins only, with a written earn/spend table; rename "pts" |
| 13 | Safety and claims | Crisis policy; no numeric health claims on cards until measured; clinical and legal review |
| 14 | Identity and lifetime | User ids; a 30-day rolling session; delete account keeps lineage credit as "Former member" |
| 15 | Analytics consent | A consent notice before click insights runs on production |

**Proposed session lifecycle:** Draft → Building vX (publish disabled) →
Ready vX → Published (live = vX) ⇄ Unpublished (forks keep credit). Editing a
live session builds vX+0.1 while live stays vX; Republish moves live; revert
moves current to an older cut.

## B.2 Beta simplification thinking (J013–J015)

- **Why Eugene raised the backend (J014):** today features cost nothing
  because everything is mock. With a backend, every visible feature needs
  backend work, a decided rule and user support, and too many features blur
  beta feedback. Simplification is about **backend scope and feedback
  quality**.
- **Proposed beta (J015, O2):**
  - **Keep:** Home Ask + feeling chips, the cockpit, the player + mini player, own Sessions, auth/settings/sign-out; Upgrade only once pricing exists.
  - **Merge:**
    - the deck into "applied by default + Change";
    - Quick Start into Ask + chips;
    - Progress + Details;
    - version history into a one-step undo.
  - **Hide behind flags:**
    - Publish, Recreate + lineage;
    - coins, credits and the invite reward;
    - challenges and the leaderboard;
    - Explore shelves, other people's profiles, Live Sessions;
    - Wellness scores and claims;
    - Notifications, Session settings, the promo banner, the 3D network.
  - **Effect:** the backend shrinks to accounts, conversations, builds, audio, simple history and limits, and the open decisions go from 15 to about 6.

## B.3 Simplification plan (25 Oct, J038) → built as D1–D7 in v4 (U051)

- **Method:** 23 v4 screens at 402px. Every element was counted and marked
  keep / merge / remove. The drafts are the live app edited in the browser.
- **Findings:**
  - 7 ways to start creating on Home.
  - 9 sections on signed-in Home, including the sign-up pitch.
  - Progress appears on 6 screens under 4 names.
  - The navigation is hidden in a drawer; coins sit in about 10 headers.
  - The chat has 3 ways to pick changes from 2 lists.
  - "Settings" titles 2 different screens; there are 3 session lists.
  - Edit/delete icons appear on others' sessions (a bug).
  - Notification filters duplicate the date headings.
- **Proposal:** four tabs matching Eugene's four core features. He named them as:
  - community AI generations incl. profiles → Discover;
  - the chat that builds chapters → Create;
  - analytics → Progress;
  - the ecosystem of third-party data sources → under Progress.
  - Me holds the account.
- **Decisions and what happened:**
  - **D1** four bottom tabs;
  - **D2** hide marketing on signed-in Home;
  - **D3** Data sources under Progress;
  - **D4** coins only in Me;
  - **D5** retire Insights (redirects to Session details / Analysis);
  - **D6** one list of changes in the chat (settles O12);
  - **D7** a Figma pass.
  - D1–D6 were approved and built in v4 (U051), with v2/v3 pixel-identical (88 pairs). **D7 is still open (O16).**
- **Not to be confused** with J039's D1–D5 (B.4) or day-1/7/30 retention.

## B.4 First-time-user retention simulation (25 Oct, J039)

**The brief (Eugene):**
- Give Claude the first-time-user retention metric.
- Simulate personas with different wellness needs on the current version, with a questionnaire sequenced like a real test.
- Answer two questions: "can a user have a simple flow to solve their wellness goal?" and "why will they return to build more and reach other goals?"
- Give the probability of return for each suggestion.

**Setup:**
- Build: staging v4 at `17053fa`, 402px, driven by Playwright.
- Each persona started from a fresh, signed-out browser and came in through a **different door**: typed on Home, a feeling chip, Quick Start Play, Sign in first, Create an account, or skipping onboarding.
- Retention = came back **and played or built**, as a share of all new users.
- Benchmarks (Health & Fitness apps, vendor roundups): D1 20–27%, D7 8–13%, D30 3–8%. No meditation-specific source was found. Aurelia, as a web app without push, starts below that band.

**The questionnaire (asked in order, in role, from what was on screen):**
- **A · Screener:** need, what they tried and why they stopped, time of day, motivation 1–5.
- **B · First look:** a 5-second test on Home (what it does, first tap, clarity 1–5).
- **C · The task:** "Get help with your need." Taps and waiting time were measured; Single Ease Question 1–7; was anything asked twice?
- **D · Onboarding:** relevance; understood you 1–5.
- **E · First result:** made for you 1–5; trust in the progress screen 1–5.
- **F · Value:** the Sean Ellis question (very / somewhat / not disappointed).
- **G · Return intent:** open tomorrow 0–100; what would bring you back; use it for another goal 0–100.
- **H · Diary:** simulated day 1 / 7 / 30, current build vs fixed build.

**Personas** (panel share; profile; door; key moments; scores):

| Persona | Share | Who | Door → taps to player | What happened | Ease · Made for me · Trust · Back tomorrow |
| --- | --- | --- | --- | --- | --- |
| **Maya**, 29 · sleep, racing mind | 25% | Designer in Jakarta; quit Calm after 2 weeks | Typed on Home → 14 taps | Asked her goal again; her sentence dropped; "Increase yellow" for sleep; "+3% since yesterday" before playing | 5/7 · 3/5 · 2/5 · 45 |
| **Raka**, 35 · work stress, skeptic | 20% | Founder, Apple Watch, distrusts "frequencies" | Sign in first → 14 | Signals on without consent; demo thread with a message he never wrote; "no spiritual stuff" → 432 Hz; invented 35% chart | 3/7 · 1/5 · 1/5 · 10 |
| **Sari**, 42 · anxiety, 5 minutes | 20% | Part-time working mother | Anxious chip → 13 | Off-topic reply; "Sleep meditation v1.3"; edit limit after 1 message | 4/7 · 2/5 · 2/5 · 30 |
| **Leo**, 22 · exam focus | 15% | Student, ~30 s patience | Quick Start Play → 12, **never heard audio** | Play → sign-in wall → onboarding → sleep chat | 2/7 · 1/5 · 2/5 · 15 |
| **Dewi**, 51 · experienced meditator | 10% | 3 years on Headspace, likely to pay | Skip onboarding → 6 | Others' sessions listed as hers; body-scan request → sleep meditation; edit limit | 5/7 · 2/5 · 2/5 · 35 |
| **Tom**, 38 · burnout, therapist referral | 10% | Cautious with data, follows instructions | Create account → 15 | Answered as if he asked about focus; "mostly silence" ignored; Conversation History on | 3/7 · 2/5 · 1/5 · 20 |

Means across the six:
- clarity 3.5/5, ease 3.7/7, understood 2.0/5, made for me 1.8/5, trust 1.7/5;
- "very disappointed" 0 of 6 (the product–market-fit bar is 40%);
- back tomorrow 26/100; second goal 18/100.

**Findings:**

| # | Finding | Hit | Fix |
| --- | --- | --- | --- |
| F1 | 5 of 6 doors land in the demo conversation (fake sleep score, a user line they never wrote) | 5/6 | R2 |
| F2 | Replies and builds ignore the goal; every build is "Sleep meditation v1.3" with yellow + less movement + 432 Hz | 6/6 | R3 |
| F3 | "Edits paused" after the first message | 3/6 | R2 |
| F4 | "Great Progress! +3% since yesterday" before the first listen | all who reached the player | R5 |
| F5 | Their words are asked for twice, then dropped | 3/6 | R1 |
| F6 | Quick Start Play plays nothing | Leo | R4 |
| F7 | Nothing asks them back; Home after session one = marketing page; notifications are invented | 6/6 | R6, R7 |
| F8 | Others' things shown as theirs; Connect sources on for a new account | 3/6 | R9 |
| F9 | Sign-in and sessions do not persist, so the build cannot measure retention | all, on day 1 | P0 / D2 |

**The answers:**
- **A simple flow?** A short one, yes: 6–15 taps, under a minute of waiting.
  One that solves the goal, no: relevance and continuity fail, not the step
  count.
- **Why return?** Today nothing asks them back. The loop needed is heard me →
  promise → cue → proof → next goal (A5.3).

**Recommendations R1–R10** (effort; contribution in percentage points of all
new users as Shapley values, D1 / D7 / D30):

| R | Change | Fixes | Effort | D1 | D7 | D30 |
| --- | --- | --- | --- | --- | --- | --- |
| R1 | One first message, in their words (onboarding pre-filled from what they typed; one Build button) | F5 | S | +1.0 | +0.4 | +0.2 |
| R2 | A fresh first thread; free limit only after the first session | F1, F3 | S | +1.8 | +0.7 | +0.4 |
| R3 | Build from the goal (reply, changes and title follow goal, length, voice, sound; respect "no …") | F2 | M | +1.9 | +0.9 | +0.4 |
| R4 | A Play that plays (preview before sign-in) | F6 | S | +0.9 | +0.3 | +0.1 |
| R5 | Honest day 0 + one-tap check-in ("How do you feel now?") | F4 | S | +1.3 | +0.8 | +0.5 |
| R6 | Chapter 2 reminder ("ready tomorrow — remind me at 22:30?") | F7 | M | +2.0 | +1.4 | +0.8 |
| R7 | Personal Home on return (tonight's chapter, what changed and why, a 5-night track) | F7 | M | +1.1 | +0.7 | +0.4 |
| R8 | Real progress from their own check-ins (and a wearable if connected) | F4 | M | +0.3 | +0.6 | +0.6 |
| R9 | Only their own things (empty states; Connect off) | F8 | S | +0.7 | +0.3 | +0.2 |
| R10 | Invite a second goal after three good chapters | — | S | +0.0 | +0.1 | +0.3 |
| | **All ten** | | | **+11.0** | **+6.2** | **+3.8** |

R6 is the strongest single fix but pays off only on top of R2, R3 and R5.
R1+R2+R3+R5+R6 alone gives D1 19%, D7 7.0%, D30 3.0%. Simplification adds
≈0.8 pt of D7 on top of the fixes and 0.2 pt without them.

**Predicted retention per persona (D1 · D7 · D30):**

| Persona | Current v4 | + 10 fixes | + fixes + simplification |
| --- | --- | --- | --- |
| Maya 25% | 18 · 6 · 2.3 | 30 · 13 · 7.1 | 32 · 14 · 7.9 |
| Raka 20% | 7 · 2 · 0.6 | 16 · 6 · 2.8 | 17 · 6 · 3.1 |
| Sari 20% | 12 · 4 · 1.3 | 22 · 9 · 4.6 | 23 · 10 · 5.2 |
| Leo 15% | 7 · 2 · 0.4 | 17 · 5 · 1.7 | 18 · 6 · 2.0 |
| Dewi 10% | 16 · 6 · 3.1 | 29 · 15 · 10.5 | 30 · 16 · 11.6 |
| Tom 10% | 12 · 4 · 1.9 | 25 · 13 · 7.9 | 26 · 14 · 8.8 |
| **Weighted** | **12 · 3.8 · 1.5** (finish 45%) | **23 · 9.9 · 5.4** (finish 56%) | **24 · 10.7 · 6.0** (finish 57%) |

**Model:**
- Per-persona stage probabilities (finish first session; D1 | finished; D7 | D1; D30 | D7):
  - Maya 60/30/32/40;
  - Raka 38/18/25/35;
  - Sari 45/26/30/38;
  - Leo 25/28/22/25;
  - Dewi 52/30/40/50;
  - Tom 45/26/36/46.
- Each fix multiplies the stages it affects.
- Combined lift = 1 + 0.45 × (product of multipliers − 1); the range uses 0.25–0.65.
- Stages are capped at 90%.
- Shapley values over all 210 orderings of the fixes.
- All scenarios assume persistence (D2).
- The scripts are archived in the repo:
  `docs/reviews/retention-sim-2026-10-25/simulation-scripts.txt`.

**Decisions proposed by J039, and their outcome:**
- **D1:** R1, R2, R3, R5, R6 first. *Done in v4, U050.*
- **D2:** persist sign-in and sessions for a test build. ***Still open.***
- **D3:** a calendar `.ics` reminder now, web push later. *Done.*
- **D4:** Quick Start plays before sign-in. *Done.*
- **D5:** the free limit counts after the first session. *Done.*

**The real test that replaces the simulation (not yet run):**
- 8–12 first-time people, two per need, who have never seen Aurelia.
- A 30-minute moderated session 1 with stages A–G, on their own phone, recorded with think-aloud.
- Then days 1–30 unmoderated, with three new events: `session_played`, `checkin_answered`, `returned`, plus an anonymous per-browser id.
- A one-question diary on days 1, 7 and 30.
- **Pass line:** D1 ≥ 25%, D7 ≥ 10%, D30 ≥ 5%, and ≥ 40% "very disappointed".

## B.5 Validity of the simulation (J040)

- **Valid:** findings F1–F9 and the tap counts. They were observed on the real
  build. How many people hit each one depends on the doors chosen.
- **Low validity:** the persona answers and the retention numbers. They were
  authored by Claude, anchored to vendor benchmarks, with ranges that are not
  confidence intervals, in a circular setup. **Use the ranking, not the
  decimals; run the real test.**

## B.6 Measured after U050 (re-run of the personas on the fixed v4)

| Persona | Before | After U050 |
| --- | --- | --- |
| Maya | 14 taps; her words lost; invented progress | **5 taps**; "Sleep better" built from her words; check-in and reminder |
| Sari | 13 taps; off-topic reply; paywall on message one | **6 taps**; "Feel calmer"; no paywall |
| Tom | 15 taps; answered as if about focus | **6 taps**; "Regulate my body" |
| Raka | Demo thread; watch and calendar "connected" | His own thread; nothing connected until he chooses |
| Dewi | Body-scan request → "Sleep meditation v1.3" | A body-scan session for her goal |
| Leo | Play → sign-in wall; never heard sound | Play plays straight away |

Headline (**Measured**):
- taps from typing to hearing 14 → 5;
- landed in someone else's conversation 5/6 → 0/6;
- first session built for the user's goal 0/6 → 5/5 (the sixth hears a preview).

## B.7 Second simplification audit (J043) → S1–S7 (open, O18)

- **Counts on v4 (21 screens):**
  - Create had 92 controls (26 cards × 3 actions + 6 chips); "Recent" showed others' sessions.
  - Discover had 149 controls, 2,613px and 7 sections (three shelves from the same catalogue, a hero next to the map).
  - Session details had 5 Recreate controls, 4 of them forking *other* sessions.
  - Progress showed a mock "Ocean Meditation · Great Progress 60%", contradicting the honest journey on Create.
  - Credits and Invite duplicate the referral block; Upgrade is a third page; Settings has "Credit Redemption".
  - Edit session's Add/Remove is a second way to change a session.
- **Proposals:**
  - **S1** Progress leads with the person's own journey (a truth issue).
  - **S2** card actions 3 → 2.
  - **S3** Discover shelves 3 → 1 with chips; drop the hero.
  - **S4** Create without category chips; Recent = own conversations.
  - **S5** Credits & plan absorbs Invite, Upgrade and Credit Redemption.
  - **S6** one Recreate on Session details; versions only on your own.
  - **S7** Edit session keeps rename + script; changes go through the chat.
- **Estimated effect:** Create 92 → ~25 controls; Discover 149 → ~70.
- **Status:** sent to users for feedback (J044). S1's intent was later
  delivered differently in v5 (progress in words).

## B.8 Production v4 re-scored against J039 (J046)

- **Status of each recommendation in v4:**
  - Done: R1, R2, R5, R7.
  - Partly done:
    - R3: the first build follows the goal; later replies are keyword rules.
    - R4: visitors only.
    - R6: a calendar file, not push.
    - R8: Progress is still demo data.
    - R9: notifications are still invented.
    - R10: a prompt after five chapters only.
- **Re-scored (weighted by how much is built), Predicted:**
  - v4 production: finish 54.3%, D1 20.8%, D7 8.3%, D30 4.1%.
  - Adding S1 alone: D7 8.8%.
- U051 came from the simplification plan, not the retention report.

## B.9 Three real user interviews (J049) → v5

- **Ishmeet:**
  - numbers about feelings would cause anxiety;
  - wants minimal input and Aurelia to decide;
  - the "#" on tags looks odd.
- **Olivia:**
  - the sample figures looked "unserious";
  - prefers a report every few weeks;
  - wants to know why a change is suggested;
  - cares about voice quality;
  - read the landing "space" and the map as co-working;
  - prefers stories to competitions;
  - shares only if it is clear what others see, and wants a reason (incentive) to share.
- **Bryan:**
  - "how is this calculated?";
  - detail on demand;
  - liked one list with toggles;
  - would keep a journal;
  - wants friends and local groups, not strangers on a leaderboard.
- **All three** wear a watch or ring and expect Aurelia to use it, with
  consent. They probably tested a v2 build (they mention the "7% REM sleep"
  sample).

**Calibration of the simulation:**
- **Confirmed:** invented numbers erode trust; little input; one list.
- **Corrected:**
  - progress scores do *not* reliably motivate, so R8's weight was halved;
  - wearables are *wanted with consent*, so the wearable lever is positive.
- **Missed:**
  - the why behind suggestions;
  - no competition (stories, friends, groups);
  - the landing page;
  - a journal;
  - voice;
  - the "#";
  - share privacy and incentive.

**v5 levers (V1–V7) and the predicted effect of each on its own** (D1 / D7 / D30 pt):

| Lever | D1 | D7 | D30 |
| --- | --- | --- | --- |
| V4 wearable asked for up front | +0.8 | +0.6 | +0.5 |
| V1 progress in words, report every two weeks | +0.3 | +0.6 | +0.6 |
| V2 a "Why?" on every suggestion | +0.9 | +0.5 | +0.2 |
| V3 Aurelia plans the next chapter | +0.4 | +0.4 | +0.3 |
| V5 journal | +0.2 | +0.3 | +0.3 |
| V7 clear landing for visitors | +0.4 | +0.2 | +0.1 |
| V6 community of stories, no contest | 0 | +0.1 | +0.1 |

**Totals, Predicted:**
- v4 recalibrated: 54.3 / 20.7 / 8.1 / 3.9%.
- **v5: 57.1 / 24.0 / 11.4 / 6.9%**. D7 range 9.6–13.6%; D30 range 5.2–9.3%.
- Same method as B.4: J039 base rates, recalibrated multipliers, damping 0.45, Shapley contributions.
- The v5 calibration script lived in a session scratch area that no longer
  exists. Re-derive it from `simulation-scripts.txt` with the changes above if
  needed.

**Measured in v5:** invented numbers a new user sees went from 5 screens
(Progress, player, analysis, cards, challenge) to 0. Suggestions that explain
themselves went from 0 to all.

**Proposed but not built** (need a backend or assets): real wearable data,
voice choice with previews, friends and local groups, a share reward, the
two-week report sent as push or email, persistence.

## B.10 Well-being outcomes proposal (U056, for Eugene)

The question: "how well has each user improved their well-being
therapeutically?"

- **Measure:** WHO-5, a five-item well-being index, 0–100, widely used in
  research and primary care. Asked at the start and every two weeks (the v5
  report rhythm).
- **Thresholds:**
  - a change of **≥10 points** is meaningful (improved / declined);
  - fewer than two scores = too early;
  - **≤28** = a cue for a human follow-up.
- Shown alongside the after-session check-ins (1–5) and the resting heart
  rate from a wearable.
- **Framed as** self-reported and observational: how people changed while
  using Aurelia, not proof Aurelia caused it, and not a diagnosis. Claims need
  Compliance wording.
- **Sample run:** 25 of 37 members measured; 13 improved (52%), 11 steady,
  1 declined; average +10.7; 2 flagged. These are sample data only.

## B.11 User-facing summary of v5 (J055–J058)

The eight messages that were sent to users:
1. Progress in words, not scores.
2. No more made-up numbers.
3. A "Why?" on every suggestion.
4. Aurelia plans the next chapter.
5. Wearable asked up front.
6. Optional journal.
7. Community without competition.
8. A clearer home page.

They are in `docs/user-updates/Aurelia-Whats-New-v5.pdf`, with the WhatsApp
text in J057.

## B.12 The three 2025 backend sources against today (J099, J109)

Sources, read in full (kept outside the repository, as the owner sent them):
- **Technical Architecture Deep Dive** (Google Doc, 10 slides): the vision.
- **Technical Architecture Documentation** (PDF, 6 pages): infrastructure principles.
- **Wiki Aurelia** (Notion export, 20 pages): the prompts the 2025 backend actually used.

**There is no code in any of them.** No repository, no endpoint list, no
database schema, no deployable service. What they hold is prompts (verbatim),
data shapes (Pydantic models written into the prompts), a rubric, and
principles. They show the 2025 backend was Python (Pydantic models), MongoDB
("MongoBase", job state), Redis caching, and Azure OpenAI / AWS Bedrock behind
an `LLMModel` abstraction, with Luma AI (video, thumbnails), Beatoven.ai
(music) and a TTS service. The wiki's last page lists three things as
"MISSING (but implemented)" (Talk with analytics, Agents marketplace, Insight
cards), so **a 2025 codebase exists somewhere**. Asking for it is O31.

Our own repository has no product backend either: `api/` holds only
`config.ts` (flags), `annotations.ts` and `clicks.ts` (review tools), on
Vercel + Upstash.

### What is still a gap (2025 sources → today)

| # | Area | 2025 | Today | Gap |
| --- | --- | --- | --- | --- |
| 1 | Product shape | Creator tool: wellness pros build **campaigns** from a taxonomy; the LLM writes the script | Consumer-first: one sentence → a session, then chapters | No creator, campaign or pro-profile concept anywhere (app, admin, contract). A product decision, not a port. |
| 2 | Taxonomy | 16 entities: Pro profile, Script logic, Chakra, Concept, Skill, Mood, State, Audience, Wellness category, Method, Technique, Framework category, Framework, Style, Setting (world-building), Character. Nesting Concept → Skill → Mood → State; Method → Technique | "Building blocks" defined three times with different ids (J101 break 1); goal ids consistent | No single entity catalogue. The 2025 taxonomy is the obvious seed for O29's `src/domain/`. |
| 3 | Script structure | `ScriptVersion {plain_text, campaign_id, version_number, elements[]}`; each `ScriptElement {text, index_number, method/mood/state/framework/technique/skill name}` | `SessionSpec.chapters [{label, startSec, endSec, intent}]` (contract §8.4) | Chapters carry no entity tags, so feedback cannot be traced to the blocks that produced it. |
| 4 | Feedback loop | Free text → LLM `FeedbackEvaluation` (general 0–10, per-entity 0–10, mastery 0–10) and attribution `utility_index` −1…1 per entity → analytics aggregates | Check-in mood 1–5 + note, not linked to the build (J101 break 2); three feedback shapes (break 3) | No attribution, no per-block score, no aggregation. |
| 5 | Analytics | Campaign, script and entity performance, best combinations, user mastery over time, supply vs demand, revenue per script | Admin analytics are sample data on a separate dataset (break 4) | Nothing computed from real feedback; no supply/demand. |
| 6 | Editing | Seven LLM edit modes on script elements: suggest, (re)generate, in-between, merge, split, expand, simplify | Proposals in the cockpit and the "+" sheet; whole-session changes | No element-level editing (for a creator or for the admin). |
| 7 | Recommendations | Each step recommends the next entity, ranked, **with a reason** | Proposals with a Why? (v5) | Mostly matched; the reason field already exists as `basis`. |
| 8 | Quality | LLM-as-judge: 9 criteria scored 1–10 + strict breathing rules | Contract §8.8 lists evals but no rubric | Rubric missing on our side. |
| 9 | Media | Video and thumbnails (Luma), music (Beatoven), TTS | Parameter-driven visuals, Unsplash covers, bundled audio; vendors open (§11 of the contract) | No generation at all yet. |
| 10 | Pacing | `<break time="x.xs"/>` (max 3 s), dashes and ellipses; words-per-minute table | `voice.pace` in the spec | Pause markup missing; **the 2025 word table is wrong for meditation** (~310 words a minute is reading pace; guided meditation is roughly 100–130, so a 10-minute script at 3,094 words is about three times too long). |
| 11 | Safety | **None** in the prompts | `safety.classify` mandatory before every route (contract §8.7) | A 2025 gap. Keep ours. |
| 12 | Providers | Multi-provider routing (Azure OpenAI, Gemini, Claude, DeepSeek, Bedrock) with failover and cost routing | One gateway, Anthropic, model id as a policy field | A choice, not a gap. Provider failover can be added inside the gateway later. |
| 13 | Infrastructure | Job queue with WebSocket progress, circuit breakers, retries, cost tracking, health checks, audit trail | Same principles in contract §8.3 and §9 (SSE instead of WebSocket) | Aligned on paper; neither is built. |
| 14 | Deep Dive claims | Wellness State Graph (4,000 points, 120,000 edges), causal inference, RL with 768-/512-dim user vectors, Compassion Computational Index | Nothing | **Not supported by the 2025 prompts either.** Treat as roadmap; do not state as existing in decks or investor material. |
| 15 | Missing in both | Talk with analytics, Agents marketplace, Insight cards | Nothing | Need the 2025 code or a product decision. |

### What can be reused now (as text and shapes, not code)

| Reuse | From | Where it goes |
| --- | --- | --- |
| Script prompt 2's modality rules (breathing: 5–7 full written cycles; visualisation; affirmations; meditation phases; PMR; RAIN; hypnosis; mantra; "include only practices in the setup") | Wiki §Campaign a | `session.script` route policy (contract §8.2), after a safety and claims pass (remove "transforms lives", "healing") |
| `ScriptVersion` / `ScriptElement` with per-element entity tags | Wiki §Campaign a | Extend `SessionSpec.chapters` with block ids, as Zod in the contract |
| Feedback attribution prompt (`utility_index` −1…1 per entity, "none" when not mentioned) | Wiki §Notebook b | A new route linking a check-in note to the blocks of the build it rates; fixes J101 break 2 |
| `FeedbackEvaluation` / `EntitySatisfactionScore` | Wiki §Campaign b | Admin learning area (O28); scores stay inputs, never shown to the person as numbers |
| LLM-as-judge rubric (9 criteria, breathing rules) | Wiki §Notebook a | Contract §8.8 evals, run on every policy change |
| Seven edit modes | Wiki §Campaign c | Admin "Building blocks" editor; later the cockpit |
| Pause markup | Wiki §Campaign a | TTS input in the build pipeline |
| Media prompt templates (video, thumbnail, music with duration) | Wiki §Media | `VisualProvider` / `SoundProvider` adapters |
| Recommendation chain with reasons | Wiki §Recommendation | The allowed-change catalogue and `basis` |

Do **not** reuse: the words-per-minute table, the "world-renowned wellness
expert" persona, LLM scores as ground truth, or any Deep Dive figure.
