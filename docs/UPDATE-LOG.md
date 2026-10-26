# Update log — staging / design versions

Every change made on request is recorded here so it can be found, explained and
**undone without breaking anything else**. One entry per update, newest detail
at the bottom of the index, with:

- **ID** (`U###`) — stable name to refer to an update ("revert U014").
- **Commit + push time** (UTC) on `web_app` (mirrored to `admin_cms` by fast-forward).
- **Request** as given, and the **interpretation / assumptions** made when it was abstract.
- **Files** touched and the **before → after** of the code.
- A **patch** in `docs/update-log/patches/` holding the exact code diff
  (docs excluded), so the before/after is in the repo even if history is rewritten.
- **How to revert** just that update.

`docs/CHANGE-LOG.md` stays the cross-branch changelog; this file is the
per-request ledger with rollback detail.

## How to revert one update safely

```bash
# 1. Undo the code of that update only (docs are kept, so the logs stay intact)
git revert --no-commit <commit>
git checkout HEAD -- docs/
# 2. Check nothing else moved
npm run typecheck && npm run lint
git diff --stat                      # should list only that update's files
# 3. Commit, push web_app, fast-forward admin_cms, and add a log entry for the revert
```

If a later update edited the same lines, `git revert` reports a conflict; resolve
it by keeping the later update's lines and removing only the reverted update's
part, using its patch file as the reference. If git history is unavailable, apply
the patch in reverse: `git apply -R docs/update-log/patches/<file>.patch`.

Production (`web_prod`) is never touched by these updates unless asked.

## Index

| ID | Commit | Pushed (UTC) | What | Patch |
| --- | --- | --- | --- | --- |
| U001 | `d456e53` | 2026-10-09 04:53 | Add a design-version switcher on staging and create Version 2 (more motion). | [patch](patches/U001-d456e53.patch) |
| U002 | `2d7e96d` | 2026-10-09 04:55 | v2: micro-animations on Home feature-card icons. | [patch](patches/U002-2d7e96d.patch) |
| U003 | `f4710e2` | 2026-10-09 05:00 | Move the switcher into a 28px StagingBar fixed at the top of every page. | [patch](patches/U003-f4710e2.patch) |
| U004 | `a8470a3` | 2026-10-09 07:08 | v2 round 2: remove icon micro-animation; Pause/Play voice icon; floating player; directional page transitions; draggable sheets; pull to refresh; coin counter; tablet layout. | [patch](patches/U004-a8470a3.patch) |
| U005 | `9ba8ab5` | 2026-10-09 07:17 | Rewrite the v2 "What changes" dialog as grouped sections. | [patch](patches/U005-9ba8ab5.patch) |
| U006 | `19043b2` | 2026-10-09 07:24 | v2: Total Credits counts up on /credits. | [patch](patches/U006-19043b2.patch) |
| U007 | `9dd0d7d` | 2026-10-09 07:27 | v2: drifting soft background behind the new-chat orb. | [patch](patches/U007-9dd0d7d.patch) |
| U008 | `f71c219` | 2026-10-09 07:40 | v2: typing example prompts in Home Ask field; pulsing live-map dots. | [patch](patches/U008-f71c219.patch) |
| U009 | `c72297e` | 2026-10-09 07:58 | v2: stronger promo glow; coin-flip profile picture. | [patch](patches/U009-c72297e.patch) |
| U010 | `d6052a0` | 2026-10-09 08:10 | v2: promo banner light follows the cursor. | [patch](patches/U010-d6052a0.patch) |
| U011 | `37db91f` | 2026-10-09 14:59 | Annotations: pins scoped to the design version. | [patch](patches/U011-37db91f.patch) |
| U012 | `9b63ad8` | 2026-10-09 15:25 | v2: centre sign-in heading; Home order (Quick Start up, Live Sessions above Community); working Share on player. | [patch](patches/U012-9b63ad8.patch) |
| U013 | `b929beb` | 2026-10-11 15:19 | Staging password AURELIA3.0 (production stays AURELIA2.0). | [patch](patches/U013-b929beb.patch) |
| U014 | `051d1a2` | 2026-10-11 16:41 | v2: taller player sheet rest (description visible); filter chips on opened recommendations. | [patch](patches/U014-051d1a2.patch) |
| U015 | `6e5ae91` | 2026-10-12 15:16 | v2: player sheet rests at the title; description only when fully open (corrects U014). | [patch](patches/U015-6e5ae91.patch) |
| U016 | `c39e1e6` | 2026-10-12 15:29 | v2: player Share opens a share sheet (social targets, copy link, More). | [patch](patches/U016-c39e1e6.patch) |
| U017 | `d12528f` | 2026-10-12 15:32 | v2: richer recommendation filter (icon chips, sliding highlight, selected summary). | [patch](patches/U017-d12528f.patch) |
| U018 | `f3cf7cd` | 2026-10-12 15:37 | v2 dialog: recap of every v2 change, grouped by screen. | [patch](patches/U018-f3cf7cd.patch) |
| U019 | (this log commit) | 2026-10-12 15:37 | Production: `web_prod` fast-forwarded from `f738209` to `web_app`. | — |
| U020 | `0381705` | 2026-10-12 16:03 | Production uses v2 only (pinned; no v1, no picker). `web_prod` fast-forwarded. | [patch](patches/U020-0381705.patch) |
| U021 | `4def866` | 2026-10-12 17:17 | Favicon redrawn from the real mark; PNG sizes, apple-touch-icon, manifest. | [patch](patches/U021-4def866.patch) |
| U022 | `83fd46d` | 2026-10-13 00:29 | PNG icons replaced with supplied Aurelia SVGs (chat menu, header Play, Unpublish, Progress tabs). | [patch](patches/U022-83fd46d.patch) |
| U023 | `ea37c00` | 2026-10-13 00:52 | Drawer/sidebar nav icons → Aurelia SVGs (user, note, playlist-02, chart-medium). | [patch](patches/U023-ea37c00.patch) |
| U024 | `2758524` | 2026-10-13 01:01 | Drawer/sidebar: supplied sidebar logo; bell SVGs (plain/active) with local unread state. | [patch](patches/U024-2758524.patch) |
| U025 | `553c77f` | 2026-10-14 11:42 | v2: Google-Maps-style player sheet (drag anywhere, 3 rests, flick, tap; player visible at half). | [patch](patches/U025-553c77f.patch) |
| U026 | `cc85aab` | 2026-10-14 16:17 | Chat: animated generating card is the default (flag `chat.generatingV2` removed). | [patch](patches/U026-cc85aab.patch) |
| U027 | `955d004` | 2026-10-14 16:22 | Home logo: supplied vector replaces the blurry upscaled PNG. | [patch](patches/U027-955d004.patch) |
| U028 | `75f3664` | 2026-10-14 16:23 | Drawer/sidebar Invite a Friend + Help → SVG icons (user-add, message-question). | [patch](patches/U028-75f3664.patch) |
| U029 | (this log commit) | 2026-10-14 | Production: `web_prod` fast-forwarded from `803d15f` to `web_app` (U021–U028 and everything since U020). | — |
| U030 | `9b61806` | 2026-10-15 10:46 | Fix: Home Quick Start cards squashed to 56px on desktop in v2. | [patch](patches/U030-9b61806.patch) |
| U031 | `cb37df5` | 2026-10-15 10:48 | Desktop v2: Ongoing Live Sessions becomes a full-width map banner. | [patch](patches/U031-cb37df5.patch) |
| U032 | `6c2d911` | 2026-10-15 10:54 | New tool: click insights — records screens + taps, review at `/__demo/insights` with per-screen heatmap. | [patch](patches/U032-6c2d911.patch) + [b](patches/U032b-15a4254.patch) |
| U033 | `1df0c28` | 2026-10-15 10:54 | Explore: Monthly Challenge card 320px tall on desktop (was ~600px). | [patch](patches/U033-1df0c28.patch) |
| U034 | `bc433a4` | 2026-10-15 11:18 | Click insights: element-level detail (kind, section, position on element, state, timing, result, rage/dead), Elements table, Problem taps, element heatmap. | [patch](patches/U034-bc433a4.patch) |
| U035 | `b540605` | 2026-10-15 16:41 | Home closing network artwork rebuilt in Three.js (measured from the PNG); hidden by default, switched on from `/__demo` → 3D network (+ Motion). | [patch](patches/U035-b540605.patch) + [b](patches/U035b-d208547.patch) |
| U036 | `4bc9c2e` | 2026-10-15 16:51 | Home feeling chips; chat reply-to-message; header Play only after something exists; limit copy (new session free); sign-in fills <640px. | [patch](patches/U036-4bc9c2e.patch) |
| U037 | `7328ab6` | 2026-10-18 16:39 | Equal-height recommendation cards; mini player Close; lineage See All + versions; Details publishing + creator version history; logic review PDF. | [patch](patches/U037-7328ab6.patch) |
| U038 | `a7dbf32` | 2026-10-20 00:40 | Connect request + sent dialog per Figma; all sheets full-width <640; design v3 (change sheet summary, every build kept in thread). | [patch](patches/U038-a7dbf32.patch) |
| U039 | `98691ba` | 2026-10-21 08:55 | Wellness Analytics v2+: per-session analysis cards + Analysis page (Figma 16885:1622), derived logic; chat styleChanges race fix. | [patch](patches/U039-98691ba.patch) |
| U040 | `b5ea379` | 2026-10-21 09:51 | Analysis: metric list + chart type balanced (chart drawn at real width, 12px labels; one weight per row). | [patch](patches/U040-b5ea379.patch) |
| U041 | `8d6c79d` | 2026-10-21 10:03 | Player analysis drawer + Feedback (Figma 16886:1623); Settings/Script title card + rename (16883:13096); chat ask race fix. v2+. | [patch](patches/U041-8d6c79d.patch) |
| U042 | `a4c9092` | 2026-10-21 10:55 | Session settings: Current style cards read-only in v2+ (no Remove). | [patch](patches/U042-a4c9092.patch) |
| U043 | `c7a9243` | 2026-10-21 10:58 | Session settings stretches to full width below lg (was capped at 402); Add buttons aligned. All versions. | [patch](patches/U043-c7a9243.patch) |
| U044 | (this log commit) | 2026-10-21 | Production: `web_prod` fast-forwarded from `4140e59` to `web_app` (U030–U043). | — |
| U045 | `8286ffb` | 2026-10-21 17:48 | Change filter moved from the thread's opened deck into the "+" sheet (v2 + v3); summary shows the largest gain, not a sum. | [patch](patches/U045-8286ffb.patch) |
| U046 | (this log commit) | 2026-10-21 | Production: `web_prod` fast-forwarded from `2a2a376` to `web_app` (U045). | — |
| U047 | `720e50a` | 2026-10-22 06:14 | Design v4 = v3 + first-run onboarding (`/welcome`): goal, feeling, style, editable summary → first session; Skip keeps answers; Replay in Settings. | [patch](patches/U047-720e50a.patch) |
| U048 | `8bb282f` | 2026-10-23 15:35 | Production-grade foundation: TanStack Query, typed/validated HTTP, safe storage, error reporting, shared KV, 0 lint warnings, 55 Vitest tests, CI. No visual change. | [patch](patches/U048-8bb282f.patch) |
| U049 | `8a6f011` | 2026-10-25 09:42 | Offline support (service worker, offline banner, update prompt) + 404 for signed-out forced access to protected pages. | [patch](patches/U049-8a6f011.patch) |
| U050 | `ae75233` | 2026-10-26 00:05 | v4 first-time fixes from the J039 retention simulation: words kept into onboarding, own thread + goal deck, limit after first build, chapter check-in + calendar reminder, next-chapter Home, Quick Start plays, Connect off. | [patch](patches/U050-ae75233.patch) |

## Entries

### U001 — Add a design-version switcher on staging and create Version 2 (more motion).

- **Commit:** `d456e53` · pushed 2026-10-09 04:53:26 UTC · `web_app` + `admin_cms`
- **Request:** Request: "buatkan version switcher… pop up what changes… buatkan versi 2 dengan lebih banyak transition animation".
- **Files:** `CLAUDE.md`, `src/components/ui/BuildBadge.tsx`, `src/index.css`, `src/main.tsx`, `src/styles/versions.css`, `src/versions/VersionSwitcher.tsx`, `src/versions/versions.ts`
- **Before → after:** see [patch](patches/U001-d456e53.patch); summary in `docs/CHANGE-LOG.md` under the same date.
- **Revert:** `git revert --no-commit d456e53 && git checkout HEAD -- docs/`

### U002 — v2: micro-animations on Home feature-card icons.

- **Commit:** `2d7e96d` · pushed 2026-10-09 04:55:15 UTC · `web_app` + `admin_cms`
- **Request:** Request: "create microanimation on icon in here". Later reverted in U004 on request.
- **Files:** `src/components/ui/FeatureCard.tsx`, `src/pages/HomePage.tsx`, `src/styles/versions.css`, `src/versions/versions.ts`
- **Before → after:** see [patch](patches/U002-2d7e96d.patch); summary in `docs/CHANGE-LOG.md` under the same date.
- **Revert:** `git revert --no-commit 2d7e96d && git checkout HEAD -- docs/`

### U003 — Move the switcher into a 28px StagingBar fixed at the top of every page.

- **Commit:** `f4710e2` · pushed 2026-10-09 05:00:18 UTC · `web_app` + `admin_cms`
- **Request:** Request: "version switcher tersedia di semua pages… most top bar fixed".
- **Files:** `CLAUDE.md`, `src/App.tsx`, `src/components/ui/BuildBadge.tsx`, `src/styles/versions.css`, `src/versions/StagingBar.tsx`
- **Before → after:** see [patch](patches/U003-f4710e2.patch); summary in `docs/CHANGE-LOG.md` under the same date.
- **Revert:** `git revert --no-commit f4710e2 && git checkout HEAD -- docs/`

### U004 — v2 round 2: remove icon micro-animation; Pause/Play voice icon; floating player; directional page transitions; draggable sheets; pull to refresh; coin counter; tablet layout.

- **Commit:** `a8470a3` · pushed 2026-10-09 07:08:48 UTC · `web_app` + `admin_cms`
- **Request:** Request: 8-point list (undo icons, pause icon, music on every screen, page transition, sheet drag UX, pull to refresh, coin counter, tablet).
- **Files:** `src/components/chat/VoiceRecorder.tsx`, `src/components/ui/CoinPill.tsx`, `src/components/ui/FeatureCard.tsx`, `src/layouts/AppLayout.tsx`, `src/pages/ExplorePage.tsx`, `src/pages/HomePage.tsx`, `src/pages/SessionsPage.tsx`, `src/pages/auth/SignInPage.tsx`, `src/styles/versions.css`, `src/versions/V2Shell.tsx`, `src/versions/useUiVersion.ts`, `src/versions/versions.ts`
- **Before → after:** see [patch](patches/U004-a8470a3.patch); summary in `docs/CHANGE-LOG.md` under the same date.
- **Revert:** `git revert --no-commit a8470a3 && git checkout HEAD -- docs/`

### U005 — Rewrite the v2 "What changes" dialog as grouped sections.

- **Commit:** `9ba8ab5` · pushed 2026-10-09 07:17:55 UTC · `web_app` + `admin_cms`
- **Request:** Request: "summary changes di v2 dan update content untuk pop up v2".
- **Files:** `src/versions/VersionSwitcher.tsx`, `src/versions/versions.ts`
- **Before → after:** see [patch](patches/U005-9ba8ab5.patch); summary in `docs/CHANGE-LOG.md` under the same date.
- **Revert:** `git revert --no-commit 9ba8ab5 && git checkout HEAD -- docs/`

### U006 — v2: Total Credits counts up on /credits.

- **Commit:** `19043b2` · pushed 2026-10-09 07:24:20 UTC · `web_app` + `admin_cms`
- **Request:** Request: counter animation on the Credits total.
- **Files:** `src/pages/CreditsPage.tsx`, `src/versions/versions.ts`
- **Before → after:** see [patch](patches/U006-19043b2.patch); summary in `docs/CHANGE-LOG.md` under the same date.
- **Revert:** `git revert --no-commit 19043b2 && git checkout HEAD -- docs/`

### U007 — v2: drifting soft background behind the new-chat orb.

- **Commit:** `9dd0d7d` · pushed 2026-10-09 07:27:44 UTC · `web_app` + `admin_cms`
- **Request:** Request: "animasi soft background yang bergerak" on the chat empty state.
- **Files:** `src/components/chat/EmptyThread.tsx`, `src/styles/versions.css`, `src/versions/versions.ts`
- **Before → after:** see [patch](patches/U007-9dd0d7d.patch); summary in `docs/CHANGE-LOG.md` under the same date.
- **Revert:** `git revert --no-commit 9dd0d7d && git checkout HEAD -- docs/`

### U008 — v2: typing example prompts in Home Ask field; pulsing live-map dots.

- **Commit:** `f71c219` · pushed 2026-10-09 07:40:42 UTC · `web_app` + `admin_cms`
- **Request:** Request: roast items 12 and 13.
- **Files:** `src/pages/HomePage.tsx`, `src/styles/versions.css`, `src/versions/useTypewriterPlaceholder.ts`, `src/versions/versions.ts`
- **Before → after:** see [patch](patches/U008-f71c219.patch); summary in `docs/CHANGE-LOG.md` under the same date.
- **Revert:** `git revert --no-commit f71c219 && git checkout HEAD -- docs/`

### U009 — v2: stronger promo glow; coin-flip profile picture.

- **Commit:** `c72297e` · pushed 2026-10-09 07:58:09 UTC · `web_app` + `admin_cms`
- **Request:** Request: promo background more visible; "flipping coin effect" on profile pic.
- **Files:** `src/pages/ProfilePage.tsx`, `src/styles/versions.css`, `src/versions/CoinFlip.tsx`, `src/versions/versions.ts`
- **Before → after:** see [patch](patches/U009-c72297e.patch); summary in `docs/CHANGE-LOG.md` under the same date.
- **Revert:** `git revert --no-commit c72297e && git checkout HEAD -- docs/`

### U010 — v2: promo banner light follows the cursor.

- **Commit:** `d6052a0` · pushed 2026-10-09 08:10:24 UTC · `web_app` + `admin_cms`
- **Request:** Request: background moves with the cursor like a hover effect.
- **Files:** `src/pages/HomePage.tsx`, `src/styles/versions.css`, `src/versions/versions.ts`
- **Before → after:** see [patch](patches/U010-d6052a0.patch); summary in `docs/CHANGE-LOG.md` under the same date.
- **Revert:** `git revert --no-commit d6052a0 && git checkout HEAD -- docs/`

### U011 — Annotations: pins scoped to the design version.

- **Commit:** `37db91f` · pushed 2026-10-09 14:59:18 UTC · `web_app` + `admin_cms`
- **Request:** Request: comment system must know v1 vs v2.
- **Files:** `CLAUDE.md`, `api/annotations.ts`, `src/demo/annotations/DemoAnnotator.tsx`, `src/demo/annotations/format.ts`
- **Before → after:** see [patch](patches/U011-37db91f.patch); summary in `docs/CHANGE-LOG.md` under the same date.
- **Revert:** `git revert --no-commit 37db91f && git checkout HEAD -- docs/`

### U012 — v2: centre sign-in heading; Home order (Quick Start up, Live Sessions above Community); working Share on player.

- **Commit:** `9b63ad8` · pushed 2026-10-09 15:25:42 UTC · `web_app` + `admin_cms`
- **Request:** Request: 4 review pins.
- **Files:** `src/pages/HomePage.tsx`, `src/pages/PlayerPage.tsx`, `src/pages/auth/SignInPage.tsx`, `src/styles/versions.css`, `src/versions/versions.ts`
- **Before → after:** see [patch](patches/U012-9b63ad8.patch); summary in `docs/CHANGE-LOG.md` under the same date.
- **Revert:** `git revert --no-commit 9b63ad8 && git checkout HEAD -- docs/`

### U013 — Staging password AURELIA3.0 (production stays AURELIA2.0).

- **Commit:** `b929beb` · pushed 2026-10-11 15:19:41 UTC · `web_app` + `admin_cms`
- **Request:** Request: "untuk staging ganti passwordnya menjadi AURELIA3.0".
- **Files:** `src/demo/siteLock.ts`
- **Before → after:** see [patch](patches/U013-b929beb.patch); summary in `docs/CHANGE-LOG.md` under the same date.
- **Revert:** `git revert --no-commit b929beb && git checkout HEAD -- docs/`

### U014 — v2: player sheet shows the description; recommendation filter

- **Commit:** `051d1a2` · pushed 2026-10-11 16:41:41 UTC · `web_app` + `admin_cms` · not `web_prod`
- **Scope:** Version 2 only. v1 `/play/dolphins-frequency` and `/chat` (deck opened) verified pixel-identical at 402px.
- **Patch:** [patches/U014-051d1a2.patch](patches/U014-051d1a2.patch)

**Update 1 (ss1, player).**
- *Request:* "bottom sheet lebih pendek lagi jadi tulisan dibawah h1 itu terlihat ketika bottom sheet dibuka".
- *Interpretation:* the details sheet at rest showed author and title but cut the description. "Shorter" read as the cover area getting shorter, so the sheet's resting height grows until the description under the h1 (4 lines + Read More) is readable without dragging.
- *Change:* `src/pages/PlayerPage.tsx`
  - before: `const SHEET_PEEK = 169` used for the sheet rest and the cover's bottom padding.
  - after: new `const SHEET_PEEK_V2 = 268`; `const peek = v2 ? SHEET_PEEK_V2 : SHEET_PEEK` replaces `SHEET_PEEK` in the rest calculation (`innerHeight - SHEET_TOP - peek`), the measure effect's dependencies (`[peek]`), and the cover's `paddingBottom`.
- *Tune:* change `SHEET_PEEK_V2`. *Undo just this part:* set it back to `169`, or replace `peek` with `SHEET_PEEK`.

**Update 2 (ss2, chat recommendations).**
- *Request:* "user minta ada filter, saya juga bingung tapi kamu bisa asumsikan dulu".
- *Assumption:* the useful cut is what each change acts on, plus the set you are about to apply. Chips: **All · Visual · Sound · Movement · Selected**, each with a count; empty kinds are hidden (All and Selected always show). Selected shows the changes currently added, so the user can review before "Apply new changes". Mapping: `yellow → Visual`, `movement → Movement`, `frequency (432Hz) → Sound`.
- *Change:*
  - new `src/components/chat/RecommendationFilter.tsx` (chips + filtered row of the existing `RecommendationCard`; empty state for Selected).
  - `src/components/chat/ChatMessageItem.tsx` — before: `deckOpen && canApply ? <row of RecommendationCard>` · after: `deckOpen && canApply && v2 ? <RecommendationFilter …/> : deckOpen && canApply ? <row> …` (+ `useUiVersion` import and `const v2`).
  - `src/versions/versions.ts` — two lines added to the v2 "What changes" list.
- *Undo just this part:* delete the `v2 ?` branch in `ChatMessageItem.tsx` and the file `RecommendationFilter.tsx`.
- *Open question for review:* categories are assumed; if the intended filter is something else (e.g. by score impact or by goal), only `KIND_OF` and `FILTERS` in `RecommendationFilter.tsx` need to change.

### U015 — v2: player sheet rests at the title (corrects U014 update 1)

- **Commit:** `6e5ae91` · pushed 2026-10-12 15:16:52 UTC · `web_app` + `admin_cms` · not `web_prod`
- **Patch:** [patches/U015-6e5ae91.patch](patches/U015-6e5ae91.patch)
- **Request (clarified by the user):** "bottom sheet nya hanya mencapai title saja, content dibawahnya harus di open full baru keliatan" — at rest the sheet shows only up to the title; the description and everything below appear only when the sheet is opened fully.
- **What went wrong in U014:** "lebih pendek" was read as "the cover gets shorter", so the rest height grew to 268px and showed the description. The intent was the opposite: a *shorter sheet*.
- **Change:** `src/pages/PlayerPage.tsx`
  - before: `const SHEET_PEEK_V2 = 268`; the description block always visible.
  - after: `const SHEET_PEEK_V2 = 112` (grabber 21 + author 24 + gap 20 + title ending at 93px, plus breathing room); the description wrapper gets `opacity: up ? 1 : 0` with a 240ms fade in v2, so the few pixels of description that would sit under the title at rest are hidden and it fades in when the sheet is up.
  - `src/versions/versions.ts`: the v2 dialog line rewritten to match.
- **Verified:** v2 at 402×874 — sheet top at 762px, only author and "Dolphins frequency" visible; v1 player pixel-identical.
- **Tune:** `SHEET_PEEK_V2`. **Undo to U014 behaviour:** `git revert --no-commit 6e5ae91 && git checkout HEAD -- docs/`. **Undo both:** revert `6e5ae91`, then the PlayerPage part of `051d1a2` (see U014).

### U016 — v2: share sheet on the player

- **Commit:** `c39e1e6` · pushed 2026-10-12 15:29:01 UTC · `web_app` + `admin_cms` · not `web_prod`
- **Patch:** [patches/U016-c39e1e6.patch](patches/U016-c39e1e6.patch)
- **Request:** "tombol share gunakan saja bottom sheet layaknya di mobile, jadi ada bottom sheet untuk share di socmed dan copy link".
- **Interpretation / assumptions:** a phone-style share sheet replaces the U012 behaviour (system share or silent copy + toast). Targets chosen as the common set for a wellness audience: WhatsApp, X, Facebook, Telegram, LinkedIn, Email; plus **More** (the system share sheet) only where the browser has one. Each target opens that service's own web share link in a new tab with the title and link prefilled; nothing posts automatically. Lucide no longer ships brand logos, so X, Facebook and LinkedIn use lettermarks on their brand colours.
- **Change:**
  - new `src/components/ui/ShareSheet.tsx` — portaled bottom sheet (`.u-sheet`, so v2 drag-to-close applies), Escape closes, read-only link field + **Copy link** (turns green "Copied" for 2s; selects the field if the clipboard is refused).
  - `src/pages/PlayerPage.tsx` — before: `share()` with `navigator.share`/clipboard and a `shareToast` pill under the header · after: `shareOpen` state; the Share button (v2 only) opens `<ShareSheet>`; the U012 toast code is removed.
  - `src/versions/versions.ts` — v2 dialog line updated.
- **Verified:** v2 402×874 — sheet opens with the six targets and correct URLs, Copy link writes `…/play/dolphins-frequency` and shows Copied, Escape closes; v1 player pixel-identical (Share still inert there, as before).
- **Revert:** `git revert --no-commit c39e1e6 && git checkout HEAD -- docs/` (returns to the U012 share behaviour).

### U017 — v2: richer recommendation filter (builds on U014 update 2)

- **Commit:** `d12528f` · pushed 2026-10-12 15:32:30 UTC · `web_app` + `admin_cms` · not `web_prod`
- **Patch:** [patches/U017-d12528f.patch](patches/U017-d12528f.patch)
- **Request:** "pada bagian ini user ingin ada filternya, coba kreasikan" (on the opened recommendation cards in chat).
- **Note:** U014 already added plain chips here in v2. A screenshot without them means the viewer was on v1 or an older build; this update makes the filter more visible and more useful rather than adding a second one.
- **Assumptions / ideas:**
  - Keep the cut by what each change acts on (Visual / Sound / Movement) plus All and Selected; each chip gets an icon (grid, eye, note, wind, check) and a count badge.
  - The active highlight **slides** between chips (measured from the chip, 300ms ease-out) instead of jumping.
  - A live summary under the chips: **"2 of 3 selected · ↑ 24% combined"**, summing `improveScore` of the selected cards, so Remove/Add immediately shows its effect before Apply.
  - Switching filter re-deals the cards with a short staggered pop.
  - Empty result (e.g. Selected with nothing chosen) shows a dashed card with **Show all N**.
- **Change:** `src/components/chat/RecommendationFilter.tsx` rewritten (same props, same place in `ChatMessageItem.tsx`); `src/versions/versions.ts` dialog line updated. No other files.
- **Verified (v2, 402×874):** summary reads "3 of 3 selected · ↑ 36% combined", after one Remove "2 of 3 · ↑ 24%"; Sound shows 1 card; v1 untouched (v1 never renders this component).
- **Revert to U014's plain chips:** `git revert --no-commit d12528f && git checkout HEAD -- docs/`. **Remove the filter entirely:** also revert the `ChatMessageItem.tsx` part of `051d1a2` (U014) and delete `RecommendationFilter.tsx`.

### U018 — v2 "What changes" dialog: full recap

- **Commit:** `f3cf7cd` · pushed 2026-10-12 15:37:36 UTC · `web_app` + `admin_cms`
- **Patch:** [patches/U018-f3cf7cd.patch](patches/U018-f3cf7cd.patch)
- **Request:** "recap semua changes dan jadikan content pop up di v2".
- **Change:** `src/versions/versions.ts` only. v2's summary and list regrouped by screen — Everywhere, Home, Chat, Player, Profile/Credits/Sign-in, Tablet, Good to know — covering U001–U017. The old "Unchanged: phone and desktop layouts stay as they are" line was dropped: since U012 v2 does change Home's order on phones. Replaced by "Switching back to v1 restores the app exactly as before", plus per-version pins and reduced motion.
- **Revert:** `git revert --no-commit f3cf7cd && git checkout HEAD -- docs/`.

### U019 — Production promoted to staging

- **Request:** "push lalu naikan dari staging ke production".
- **What moved:** `web_prod` fast-forwarded from `f738209` to the head of `web_app` (this log commit), carrying U001–U018 and the desktop work before them.
- **What production users actually see:** production is pinned to **v1** and renders no StagingBar or version picker (`VERSIONS_ENABLED` is false when the build is production), so none of the v2 experiments are visible there. What does reach production users: everything shipped to v1 since `f738209` — the review-annotation version scoping (tool only, behind its flag), the staging/production label and KV-key fix, and the `docs/` additions. The production password stays `AURELIA2.0` (U013).
- **Version:** `package.json` stays `0.1.0` (not asked to bump).
- **Undo:** production can only move forward by fast-forward; to roll it back, `git push --force-with-lease origin f738209:web_prod` — only on explicit request, since it rewrites the production branch.

### U020 — Production shows v2, not v1

- **Commit:** `0381705` · pushed 2026-10-12 16:03:44 UTC · `web_app` + `admin_cms`, then `web_prod` fast-forwarded from `d5c9747` to the log commit after it.
- **Patch:** [patches/U020-0381705.patch](patches/U020-0381705.patch)
- **Request:** "untuk production gunakan v2 saja, jangan gunakan v1 lagi".
- **Change:**
  - `src/versions/versions.ts` — new `PRODUCTION_VERSION = 2`; before: `if (!VERSIONS_ENABLED) return 1` · after: `return PRODUCTION_VERSION`. Production still has no StagingBar and no picker, and ignores any stored choice (a browser that had picked v1 still gets v2).
  - `src/demo/annotations/DemoAnnotator.tsx` — on production every pin is shown regardless of its stored version, so pins saved there as v1 before this change don't vanish. Staging keeps per-version pins (U011).
  - `CLAUDE.md` — design-versions note updated.
- **Staging is unchanged:** still defaults to v1 with the switcher, so v1 remains available there for comparison.
- **Verified:** a production-mode build (`VERCEL_ENV=production`, `VERCEL_GIT_COMMIT_REF=web_prod`) served locally with `aurelia.ui.version = 1` stored: `<html data-ui-version="2">`, no staging bar, no picker, unlocks with `AURELIA2.0`, Home in v2 order (Quick Start first).
- **Undo (production back to v1):** set `PRODUCTION_VERSION = 1` (or `git revert --no-commit 0381705 && git checkout HEAD -- docs/ CLAUDE.md`), push, then fast-forward `web_prod` again.

### U021 — Favicon

- **Commit:** `4def866` · pushed 2026-10-12 17:17:30 UTC · `web_app` + `admin_cms` · not `web_prod` (reaches production on the next promotion)
- **Patch:** [patches/U021-4def866.patch](patches/U021-4def866.patch) (binary, includes the PNGs)
- **Request:** "kembali ke staging, buatkan favicon nya ya".
- **Finding:** `public/favicon.svg` existed but was a hand-traced approximation (an orange stroked swirl on transparent) that didn't match the in-app logo (`src/assets/aurelia-mark.png`: gold-to-orange rounded tile, white sweep, white dot). Only an SVG was linked; no PNG fallback, no Apple icon, no manifest.
- **Change:**
  - `public/favicon.svg` — redrawn to match the mark (64×64, radius 14, gradient #FFDA70→#FF8A1F, white sweep path + dot at 41.5,41 r 11.5). before: stroked arc, gradient #FFD86B→#F2801A. Old file kept in the patch for reference.
  - new `public/favicon-32.png`, `public/icon-192.png`, `public/icon-512.png` (rendered from the SVG), `public/apple-touch-icon.png` (180×180, full-bleed square because iOS rounds it itself), `public/site.webmanifest` (name, icons, theme #FFF1DB, start `/home`).
  - `index.html` — adds the PNG icon, apple-touch-icon and manifest links under the existing SVG link.
- **Verified:** dev server serves all six files with the right content types; `npm run build` copies them to `dist/`; 32px and 180px renders checked by eye against the mark.
- **Revert:** `git revert --no-commit 4def866 && git checkout HEAD -- docs/` (restores the old SVG and removes the new files and links).

### U022 — Icons: PNG → supplied SVGs

- **Commit:** `83fd46d` · pushed 2026-10-13 00:29:40 UTC · `web_app` + `admin_cms` · not `web_prod`
- **Patch:** [patches/U022-83fd46d.patch](patches/U022-83fd46d.patch) (binary; contains the removed PNGs for rollback)
- **Request:** five SVGs uploaded (chart-increase, chart-medium, close-circle, note, play) — "update yang sebelumnya PNG menjadi SVG ini, ini untuk icon-icon nya". Not version-gated: applies to v1 and v2.
- **Mapping (assumed from where PNG/lookalike icons were):**
  | SVG | Replaces | Where |
  | --- | --- | --- |
  | `chart-increase` | `icon-menu-insights.png` | Chat ⋯ menu → Insights |
  | `chart-medium` | `icon-insight.png` | Progress tabs → Insights |
  | `note` | `icon-chapters.png` | Progress tabs → Chapters |
  | `close-circle` | lucide `CircleX` | Chat ⋯ menu → Unpublish |
  | `play` | lucide `Play` | Chat header Play button |
  `icon-menu-settings.png` (Settings) stays a PNG — no SVG supplied for it.
- **Change:**
  - originals saved untouched in `src/assets/icons/*.svg`.
  - new `src/components/ui/AureliaIcons.tsx` — `ChartIncreaseIcon`, `ChartMediumIcon`, `CloseCircleIcon`, `NoteIcon`, `PlayIcon`; same paths, fills/strokes switched to `currentColor`, `size` prop like lucide.
  - `src/components/chat/ChatHeader.tsx`, `src/pages/ProgressPage.tsx` — use them; PNG imports removed.
  - deleted `src/assets/icon-chapters.png`, `icon-insight.png`, `icon-menu-insights.png` (no other references).
- **Visible difference:** icons now follow text colour, so the active (dark) Progress chip shows a light icon instead of a dark PNG on dark.
- **Verified:** typecheck/lint clean; chat menu and Progress tabs screenshotted at 2× — all five render.
- **Revert:** `git revert --no-commit 83fd46d && git checkout HEAD -- docs/` (restores the PNGs and lucide icons).

### U023 — Nav icons: PNG → supplied SVGs

- **Commit:** `ea37c00` · pushed 2026-10-13 00:52:49 UTC · `web_app` + `admin_cms` · not `web_prod`
- **Patch:** [patches/U023-ea37c00.patch](patches/U023-ea37c00.patch) (binary; contains the removed PNGs)
- **Request:** screenshot of the drawer's four main rows + four SVGs (chart-medium, playlist-02, note, user): "update disitu … dengan icon yang saya sudah berikan". Not version-gated.
- **Mapping:** Sign In → `user`, Explore → `note`, Sessions → `playlist-02`, My wellness → `chart-medium`. `note` and `chart-medium` are byte-identical to the U022 uploads, so the existing `NoteIcon`/`ChartMediumIcon` are reused.
- **Change:**
  - originals added: `src/assets/icons/playlist-02.svg`, `src/assets/icons/user.svg`.
  - `src/components/ui/AureliaIcons.tsx` — adds `PlaylistIcon`, `UserIcon` (currentColor).
  - `src/layouts/AppLayout.tsx` — the four rows use the SVG components at 24px; they now take NavItem's `text-icon-default` (#3C2405 token; the files used #331B04, visually the same). Invite and Help keep their PNGs (no SVG supplied).
  - deleted `src/assets/icon-nav-signin.png`, `icon-nav-explore.png`, `icon-nav-sessions.png`, `icon-nav-wellness.png`.
- **Verified:** mobile drawer (402, 2×) and desktop sidebar (1440) screenshotted — all four render; typecheck/lint clean.
- **Revert:** `git revert --no-commit ea37c00 && git checkout HEAD -- docs/`.

### U024 — Sidebar logo and notification bell

- **Commit:** `2758524` · pushed 2026-10-13 01:01:36 UTC · `web_app` + `admin_cms` · **staging only** (as instructed: "ingat semua changes ini ada di staging dulu"); `web_prod` untouched at `803d15f`.
- **Patch:** [patches/U024-2758524.patch](patches/U024-2758524.patch)
- **Request:** (1) replace the drawer logo with the supplied `Aurelia-sidebar-logo.svg`; (2) replace the bell with the supplied `notification.svg` / `notification_active.svg` — one for when there are notifications, one for when there are none. Not version-gated.
- **Assumption (unread state):** the app had no read/unread model — the red dot was hard-coded on. Now: unread = the feed has `today` items **and** this browser hasn't opened `/notifications` yet. Opening Notifications marks it seen (localStorage `aurelia.notifications.seen`), switching the bell to the plain icon. A real backend should replace this with the feed's read state (`src/lib/notificationsSeen.ts`).
- **Change:**
  - originals: `src/assets/aurelia-sidebar-logo.svg`, `src/assets/icons/notification.svg`, `src/assets/icons/notification-active.svg`.
  - `src/layouts/AppLayout.tsx` — before: `<AureliaLogo iconSize=30 />` and lucide `Bell` + an always-on red span · after: `<img src={sidebarLogo}>` (114×32, h-32), `NotificationActiveIcon`/`NotificationIcon` by `useHasUnreadNotifications()`; the button's label reads "Notifications, unread" when active.
  - `src/components/ui/AureliaIcons.tsx` — adds `NotificationIcon`, `NotificationActiveIcon` (bell in currentColor; the dot keeps its red gradient with a per-instance `useId` gradient id, because drawer and hidden desktop sidebar render the icon twice and a shared id left the visible dot unpainted).
  - new `src/lib/notificationsSeen.ts`; `src/pages/NotificationsPage.tsx` calls `markNotificationsSeen()` on mount.
  - `AureliaLogo` is still used elsewhere (hero, auth screens) — unchanged there.
- **Verified:** signed-in drawer at 402 (2×): active bell with red dot before visiting Notifications, plain bell after; new logo renders; typecheck/lint clean.
- **Revert:** `git revert --no-commit 2758524 && git checkout HEAD -- docs/`.

### U025 — v2: player sheet touch handling, Google Maps style

- **Commit:** `553c77f` · pushed 2026-10-14 11:42:27 UTC · `web_app` + `admin_cms` · staging only (not `web_prod`, still `803d15f`)
- **Patch:** [patches/U025-553c77f.patch](patches/U025-553c77f.patch)
- **Feedback (screenshots from a phone on production, relayed):** "The touchpoints is weak when you scroll up to see more data" — swiping up on the sheet's title did nothing; only the ~21px grabber strip moved it. Plus: "Pls explore Google Maps … for this part we have to [stay] below media player … try to come close here" (Google Maps place sheet: peek / half / full, map still visible at half).
- **Interpretation:** make the whole sheet the touch target and copy Google Maps' three-stop behaviour, keeping the player usable at the middle stop.
- **Change (`src/pages/PlayerPage.tsx`, v2 only — v1 code paths unchanged):**
  - **Three rests:** peek (title, `SHEET_PEEK_V2` 112 → **124** to fit the taller grabber), **half** (`halfY = collapsedY × 0.45`: title, description, tags, actions), full.
  - **Drag from anywhere** on the sheet while it isn't fully open (pointer handlers on the `<aside>`, 6px threshold, pointer capture, `touch-action: none` while not full). Fully open, the content scrolls natively and the grabber drags it down.
  - **Flick:** release velocity > 0.5 px/ms carries to the next rest in that direction; otherwise snaps to the nearest rest. `pointercancel` (phones sometimes claim a fast flick) settles from the last finger position instead of stranding the sheet.
  - **Tap** on the peeking sheet (not on a link/button) opens to half; the grabber's tap cycles peek → half → full → peek. Grabber hit area taller (`py-8` → `py-14`).
  - The click that ends a drag is swallowed, so a drag that starts on the author link doesn't open the profile.
  - **Player stays visible at half:** the player section's `padding-bottom` follows the sheet up to the half rest, so play, the cue line and the scrubber re-centre above the sheet (animated with the sheet).
  - `src/versions/versions.ts`: dialog line updated.
- **Verified (touch emulation, 402×874, v2):** peek top 750 → slow 300px drag up from the title → half (367) → flick up → full (54) → grabber drag down → peek (750) → tap title → half (367); at half the play button, cue and scrubber are fully visible above the sheet. v1 player pixel-identical.
- **Tune:** `halfY` factor (0.45), flick threshold (0.5), `SHEET_PEEK_V2`.
- **Revert:** `git revert --no-commit 553c77f && git checkout HEAD -- docs/` (back to U015 behaviour: two rests, grabber-only drag).

### U026 — Animated generating card by default

- **Commit:** `cc85aab` · pushed 2026-10-14 16:17:57 UTC · `web_app` + `admin_cms` · staging only (not `web_prod`)
- **Patch:** [patches/U026-cc85aab.patch](patches/U026-cc85aab.patch)
- **Report:** on a phone the "generating your session" state still showed the old static card. Cause: the animated card (`SessionProgressCardV2`) sat behind the `/__demo` flag `chat.generatingV2`, off by default and `unreleased`; it had been switched on locally on one device and never published, so every other device got the old card.
- **Request:** "pastikan itu jadi yang utama saja, jadi sudah by default memakai itu".
- **Change:**
  - `src/pages/ChatPage.tsx` — before: `isEnabled('chat.generatingV2') ? <SessionProgressCardV2/> : <SessionProgressCard status="Creating your new session.." progress={progress}/>` · after: always `<SessionProgressCardV2 title={draft.title} />`; the `SessionProgressCard` import removed.
  - `src/demo/modules.ts` — the `generatingV2` feature entry removed from the chat module, so no published/local flag can bring the old card back.
  - `src/components/chat/SessionProgressCardV2.tsx` — doc comment updated. `SessionProgressCard.tsx` itself is kept (unused) for reference/Storybook.
  - Not version-gated: v1 and v2 both get the animated card.
- **Verified:** fresh browser (no flags in storage), 402px, signed in → new chat → send → Apply new changes: the card shows the animated mark with the rotating status ("Layering in white noise…"); the old "Creating your new session.." line never appears. Typecheck/lint clean (one pre-existing ChatPage warning).
- **Revert:** `git revert --no-commit cc85aab && git checkout HEAD -- docs/` (brings back the flag, off by default).

### U027 — Home logo: SVG instead of blurry PNG

- **Commit:** `955d004` · pushed 2026-10-14 16:22:04 UTC · `web_app` + `admin_cms` · staging only (not `web_prod`)
- **Patch:** [patches/U027-955d004.patch](patches/U027-955d004.patch)
- **Request:** `logo_homepage.svg` uploaded — "update logo di homepage karena yang sekarang blur". Not version-gated.
- **Cause:** Home drew `AureliaLogo markOnly` at 64px, but `aurelia-mark.png` is a 48×48 bitmap, so it was scaled up 1.33×.
- **Change:**
  - new `src/assets/logo-homepage.svg` (original, untouched).
  - `src/pages/HomePage.tsx` — before: `<AureliaLogo iconSize={64} markOnly className="relative" />` · after: `<img src={logoHomepage} width/height 64 className="relative mx-auto block size-64">`; `AureliaLogo` import removed from this file. The h1 below goes `mt-20` → `mt-26`: the old inline-flex wrapper added 6px of line-box space under the mark, and the block image doesn't, so this keeps the layout identical.
  - `AureliaLogo` itself is unchanged; the other uses (site lock, admin sidebar, auth screens) still use the PNG — only the Home hero was asked for. Note for later: the sign-in/site-lock marks at 56px have the same upscaling.
- **Verified:** 402 and 1440 — logo box and title position identical to before (logo 169,158 64×64; title y 248 / 218); screenshot at 2× shows crisp edges. Typecheck/lint clean.
- **Revert:** `git revert --no-commit 955d004 && git checkout HEAD -- docs/`.

### U028 — Invite a Friend and Help icons

- **Commit:** `75f3664` · pushed 2026-10-14 16:23:26 UTC · `web_app` + `admin_cms` · staging only (not `web_prod`)
- **Patch:** [patches/U028-75f3664.patch](patches/U028-75f3664.patch) (binary; includes the removed PNGs)
- **Request:** screenshot of the drawer's bottom rows + `user-add.svg`, `message-question.svg` — "update part ini juga" (follow-up to U023). Not version-gated.
- **Change:**
  - originals: `src/assets/icons/user-add.svg`, `message-question.svg`.
  - `src/components/ui/AureliaIcons.tsx` — adds `UserAddIcon`, `MessageQuestionIcon` (currentColor).
  - `src/layouts/AppLayout.tsx` — Invite a Friend → `UserAddIcon`, Help → `MessageQuestionIcon`, 24px with `text-icon-default` like the other rows; the `NavIcon` PNG helper and its imports removed (no PNG nav icons remain).
  - deleted `src/assets/icon-nav-invite.png`, `icon-nav-help.png`.
- **Verified:** desktop sidebar 1440 (2×) shows both icons at the same size and colour as the rows above; typecheck/lint clean.
- **Revert:** `git revert --no-commit 75f3664 && git checkout HEAD -- docs/`.

### U029 — Promote staging to production

- **Request:** "naikan semua yang ada di staging v2 ke production". Production has been pinned to v2 since U020, so everything on `web_app` goes as-is.
- **What moved:** `web_prod` `803d15f` → this log commit (16 commits): U021 favicon, U022/U023/U028 SVG icons, U024 sidebar logo + notification bell (with local unread state), U025 Google-Maps-style player sheet, U026 animated generating card as default (flag removed), U027 Home vector logo, plus the logs.
- **Production specifics:** v2 behaviour with no picker/staging bar; password stays `AURELIA2.0` (U013); version `0.1.0`. A production-mode build (`VERCEL_ENV=production`, branch `web_prod`) compiled before the push.
- **Staging differs from production only by:** the StagingBar + picker (default v1 there) and the `AURELIA3.0` password.
- **Undo:** `git push --force-with-lease origin 803d15f:web_prod` — only on explicit request (rewrites the production branch). Individual changes are reverted via their own U-entries, then re-promoted.

### U030 — Fix: Quick Start cards broken on desktop (v2)

- **Commit:** `9b61806` · pushed 2026-10-15 10:46:09 UTC · `web_app` + `admin_cms` · **not yet on `web_prod`** (production still at `4140e59`, which has this bug)
- **Patch:** [patches/U030-9b61806.patch](patches/U030-9b61806.patch)
- **Report:** screenshot of desktop Home — the Quick Start cards were squashed; the play button, "Create" pill and the title/subtitle overlapped each other.
- **Cause:** the card is `lg:h-auto`: on desktop it was designed to stretch to the height of the Ongoing Live Sessions map beside it (v1 grid; card ≈ 388px). In v2 (U012) Quick Start sits alone under the Ask field, so nothing stretches it and it collapsed to its content height — **56px** measured at 1440 and 1024 — while the title is absolutely positioned at the bottom, so it landed on top of the play/Create row. Production is pinned to v2, so production showed it too.
- **Change:** `src/pages/HomePage.tsx` — card class `lg:h-auto` → `lg:h-auto lg:min-h-[160px]` (the mobile height). Where a sibling stretches the row taller (v1 desktop) the min is inert.
- **Verified:** card height at 1440 v2 / 1024 v2: 56 → 160; 1440 v1 still 388; 820 and 402 (v1 and v2) unchanged. Screenshots of the Quick Start section identical before/after for v1 1440, 402 v1/v2 and 820 v2. Typecheck clean.
- **Revert:** `git revert --no-commit 9b61806 && git checkout HEAD -- docs/`.

### U031 — Desktop: Live Sessions as a full-width banner (v2)

- **Commit:** `cb37df5` · pushed 2026-10-15 10:48:38 UTC · `web_app` + `admin_cms` · not on `web_prod` yet
- **Patch:** [patches/U031-cb37df5.patch](patches/U031-cb37df5.patch)
- **Report:** "di desktop rasanya aneh ada kotak kecil begitu di tengah-tengah dengan kanan kiri kosong".
- **Cause:** U012 moved Live Sessions below the promo banner in v2 and I capped it at 600px, centred (`lg:mx-auto lg:max-w-[600px]`), while the heading stayed left-aligned — so a small, near-square map card floated in the middle of a 912px column.
- **Change:**
  - `src/pages/HomePage.tsx` — v2 wrapper loses `lg:mx-auto lg:max-w-[600px]` (now `lg:mt-48 [&>section]:lg:mt-0`); the map card gets a `data-live-card` hook (inert in v1).
  - `src/styles/versions.css` — `@media (min-width: 1024px)` + v2: `[data-live-card]` → `aspect-ratio: auto; height: 600px; max-width: none; background-size: cover; background-position: center 0%`. The map art is near-square, so `cover` fills the width and the dots sit centred with the three stats in a row along the foot.
- **Limit:** the map PNG is 543px wide, drawn at ~912px on desktop, so the dots are slightly soft; a larger export of `live-sessions-map.png` would fix it.
- **Verified:** 1440 v2 screenshot — full-width banner, no empty sides, stats clear of the map; 1440 v1, 820 v2, 402 v1/v2 pixel-identical before/after. Typecheck clean.
- **Tune:** `height` (600), `background-position`. **Revert:** `git revert --no-commit cb37df5 && git checkout HEAD -- docs/` (back to the 600px centred box).

### U032 — Click insights: see how people use the app, and come back to it later

- **Commit:** `6c2d911` · pushed 2026-10-15 10:54:33 UTC · `web_app` + `admin_cms` · not on `web_prod` yet
- **Patch:** [patches/U032-6c2d911.patch](patches/U032-6c2d911.patch) + follow-up `15a4254` [patches/U032b-15a4254.patch](patches/U032b-15a4254.patch) (`src/demo/FeatureFlags.tsx`: `CLICKS_FLAG` added to `NOT_A_MODULE`, so Enable/Disable all on `/__demo` leaves the tracker alone)
- **Request:** "buatlah semacam alat click detection agar saya bisa memahami bagaimana user bekerja dengan sistem kita, saya mau sebuah metode agar nantinya saya bisa melihat hasilnya lagi".
- **Assumptions (the ask was open):**
  - "Understand how users work" = which screens they open, in what order (paths), what they tap, and *where* on a screen they tap (heatmap). Not scroll depth, not session replay — those cost more and record far more than needed.
  - "See the results again later" = stored on the server (Upstash KV, same store as flags/annotations), scoped per deployment exactly like `/api/config` — staging data never mixes with production. Exportable as CSV/JSON so a copy can live outside the store.
  - Privacy: records the *label* of what was tapped (aria-label, placeholder, or the control's visible text) and coordinates — **never what anyone typed** into a field. No user id; one random id per browser tab (`sessionStorage`). Taps on the annotations tool and anything marked `data-insights-ignore` are skipped. `/__demo` itself is never recorded.
  - On by default (flag `clickInsights`, toggle on `/__demo`), because data that starts collecting only after someone remembers to switch it on is data you do not have.
- **Change:**
  - `api/clicks.ts` (new) — `GET` returns the events; `POST {events}` appends (validated, max 200 per batch); `POST {clear:true}` deletes. Key `aurelia:insights:clicks` (+`:<branch>` off production); keeps the newest 20,000 events. `configured:false` without KV env vars.
  - `src/demo/insights/tracker.ts` (new) — one capture-phase click listener + a `view` event per route change; batched every 8s and on tab hide (`sendBeacon`). Without a server it keeps the newest 3,000 events in `localStorage` (`aurelia.insights.clicks`). Taps that hit no control are labelled `(not a control) …` — useful for spotting things that look tappable and are not.
  - `src/demo/insights/ClickTracker.tsx` (new) — installs the tracker; with `?heatmap` on any URL draws that screen's recorded taps as dots (same layout bucket only: mobile/tablet/desktop, because coordinates do not translate between them).
  - `src/pages/InsightsPage.tsx` (new) at `/__demo/insights` — filters (today/7 days/all, device, design version), totals (sessions, screens, taps, taps per session), Screens (with a Heatmap link per screen), Top taps (per screen), Paths (screen → screen), Recent sessions (step by step), Refresh / CSV / JSON / Clear.
  - `src/demo/modules.ts` — `CLICKS_FLAG = 'clickInsights'`, default on. `src/pages/DemoControlPage.tsx` — "Click insights" card (toggle + link). `src/App.tsx` — route + `<ClickTracker />`.
- **No visual change** to any screen (the overlay renders only with `?heatmap`). Mobile untouched.
- **Verified:** local (no KV) — taps on /home and /explore, 10 events stored locally, insights page shows sessions/screens/paths/top taps, `/explore?heatmap` draws the dots at the tapped spot. Typecheck clean; lint warnings only, of the kind already present elsewhere.
- **Revert:** `git revert --no-commit 15a4254 6c2d911 && git checkout HEAD -- docs/`. Collected data stays in KV until cleared from the page (or `DEL aurelia:insights:clicks[:branch]`).

### U033 — Explore: Monthly Challenge smaller on desktop

- **Commit:** `1df0c28` · pushed 2026-10-15 10:54:33 UTC · `web_app` + `admin_cms` · not on `web_prod` yet
- **Patch:** [patches/U033-1df0c28.patch](patches/U033-1df0c28.patch)
- **Request:** "monthly challenge di desktop juga terlalu besar".
- **Cause:** the card keeps the mobile frame's `aspect-[362/240]` at every width, so in the ~912px desktop column it was ~605px tall.
- **Change:** `src/pages/ExplorePage.tsx` — card adds `lg:aspect-auto lg:h-[320px] lg:p-24` (a banner; inner padding grows to match). Applies in v1 and v2.
- **Verified:** 402px 362×240 (unchanged), 820px unchanged (below `lg:`), 1440px 912×320 v1 / 898×315 v2 (v2's page scale). Typecheck clean.
- **Tune:** `lg:h-[320px]`. **Revert:** `git revert --no-commit 1df0c28 && git checkout HEAD -- docs/`.

### U034 — Click insights: per-element detail, not just per-page

- **Commit:** `bc433a4` · pushed 2026-10-15 11:18:58 UTC · `web_app` + `admin_cms` · not on `web_prod` yet
- **Patch:** [patches/U034-bc433a4.patch](patches/U034-bc433a4.patch)
- **Request:** "menarik tapi saya mau lebih detail element nya agar saya bisa tau tidak sekedar membaca page saja sih".
- **Interpretation:** the report should answer questions about *one element* — which control, in which part of the screen, how many of the screen's visitors use it, how quickly, where on it they press, and whether it worked — and point at it on the real screen.
- **Change:**
  - `src/demo/insights/tracker.ts` — every click now also records `kind` (button, link, card, chip, tab, toggle, field, menu item, not a control), `section` (nearest dialog / nav / sidebar / section heading), `sel` (a selector that finds the element again: id, aria-label or href when it resolves back to that exact element, else its tree path), `ex/ey` (where on the element, %), `ew/eh` (its size), `state` (aria-pressed/expanded/checked/selected/current, disabled — before the tap), `ms` (time since the screen opened), `sy` (scroll depth %), `rage` (3+ taps within 1s inside 40px), `dead` (no control hit), and after 700ms `fx` = `navigated` (with `to`), `changed` (DOM changed) or `nothing`. Clicks are now pushed 700ms after the tap to know `fx`. `findVisible()` moved here and is shared.
  - `api/clicks.ts` — validates the new optional fields (old events stay valid).
  - `src/demo/insights/ElementsTable.tsx` (new) — `elementStats()` groups taps by screen + selector; **Elements** table (label, kind, rage pill, section, taps, reach = sessions that tapped ÷ sessions that opened the screen, median time to tap, what it did) with a kind filter; a row expands into: tap positions drawn on the element at its real shape (flags < 44px targets), devices, design version, state before tap, where it led, label variants, timing/scroll depth/rage, the selector and **Show on screen**. **Problem taps** lists elements with no-response, rage or not-a-control taps.
  - `src/pages/InsightsPage.tsx` — "Top taps" replaced by Problem taps + full-width Elements (screen select); Recent sessions show section, destination (→), no response (✕), rage (!!); CSV carries every new column.
  - `src/demo/insights/ClickTracker.tsx` — heatmap gains a Taps/Elements switch; `?heatmap=elements` outlines each tapped element with its count (colour = share of the busiest), `&el=<selector>` scrolls to one element and rings it.
- **Limits:** `fx: changed` counts *any* DOM change in the 700ms, so a tap during a page's entrance or next to something animating reads as "changed" — trust "no response", treat "changed" as generous. Tree-path selectors (elements without aria-label/href) can stop resolving after a layout change; the heatmap then says "N not on screen now". Events from before U034 show "—" for the new columns.
- **Verified:** local, 1440 v2 — taps on Sign in (`changed`, dialog), Continue with Google (`navigated → /home`), 4 fast taps on the Explore header (`not a control`, `nothing`, 2 flagged rage), Join (`link`, section "Monthly Challenge!", hit at 12% across a 64×32 pill, `navigated → /challenge/…`). Show on screen outlined the Join pill (not the card link that shares its href — the selector check caught that). Typecheck clean; lint warnings only.
- **Revert:** `git revert --no-commit bc433a4 && git checkout HEAD -- docs/` (back to U032 page-level insights; recorded events keep their extra fields harmlessly).

### U035 — Home network artwork as a Three.js scene (hidden, switch in /__demo)

- **Commits:** `b540605` (scene, flags, card) + `d208547` (measurement scripts) · pushed 2026-10-15 16:41 UTC · `web_app` + `admin_cms` · not on `web_prod`
- **Patches:** [patches/U035-b540605.patch](patches/U035-b540605.patch) (binary — includes the two figure PNGs) + [patches/U035b-d208547.patch](patches/U035b-d208547.patch)
- **Request:** (screenshot of Home's closing artwork) "buatkan 3d object dengan three js dengan konsep sama persis ini… nanti bisa ada animasinya. tapi hide dulu, show off control nya dari __demo. warna dll pastikan harus sama persis".
- **Interpretation:** "sama persis" = at rest it must be indistinguishable from `aurelia-network.png`, so everything is *measured* from that file rather than redrawn by eye; "3D" = real depth (things at different distances, a figure with volume) that only shows when the camera moves; "hide dulu" = the PNG stays the default and nothing changes for anyone until the switch is on.
- **How it matches:**
  - 31 nodes (5 hubs, 4 out-of-focus "bokeh", 22 dots): positions, radii and edge softness from blob analysis of the PNG's alpha; dot colours sampled per node. Hub colour = per-pixel median of the five hubs, rebuilt in the shader as a warm base + cream highlight + coral bruise (hub means within 1–4/255); halo ring r 8.6, alpha 0.27, `#FDC59E`.
  - 49 lines: traced from each node + a Hough pass, each scored against the PNG. 11 dashed (`#FEB377`, ~0.45 opacity, 1.9/1.7 dash) and 38 solid hairlines (`#FFCBA8`, opacity measured per line).
  - The figure is the PNG's own pixels (`head.png`) on a relief inflated from its silhouette (`head-depth.png`) — its gradient is the artwork's by construction.
  - Colour management off for this chunk; values written untouched (no sRGB↔linear).
  - Depth: bokeh +46 (near), hubs 0, figure −8 (+26 relief), dots −18…−70 by paleness — each scaled so it projects onto its PNG pixel from the rest pose.
  - **Check:** rest-pose render at 778×333 vs the PNG in the same box: mean |Δ| 0.92/255; remaining differences are edge sharpness (the PNG is a 362px raster upscaled, the scene is drawn at full resolution).
- **Motion** (sub-switch, on by default once the scene is on): slow orbit that leans toward the pointer, dashes flowing, hub halos breathing, bokeh drifting. Pauses when off-screen (IntersectionObserver) and for `prefers-reduced-motion`; Motion off = held at the rest pose.
- **Change:**
  - `src/components/network3d/networkScene.ts` (scene), `Network3D.tsx` (React wrapper: lazy-imports the scene, shows the PNG until the first frame or if WebGL fails, same 362:155 box), `networkData.ts` (generated), `head.png`, `head-depth.png`.
  - `src/demo/modules.ts` — `NETWORK3D_FLAG = 'network3d'` (default **off**), `NETWORK3D_MOTION_FLAG = 'network3d.motion'` (default on); `src/demo/FeatureFlags.tsx` — both kept out of Enable/Disable all.
  - `src/pages/DemoControlPage.tsx` — "3D network" card (toggle + Motion sub-toggle + link to Home).
  - `src/pages/HomePage.tsx` — the `<img>` becomes `<Network3D>` only when the flag is on.
  - `package.json` — `three@^0.180.0` (+ `@types/three` dev). Three is a separate lazy chunk (~134 KB gzip) fetched only when the flag is on; the main bundle is unchanged.
  - `scripts/network3d/` — the measuring scripts + README (regenerate `networkData.ts` and the figure PNGs if the artwork changes).
- **Mobile:** with the flag off (default) the DOM is exactly the old `<img>`. With it on, the box keeps the PNG's size at every width (checked 402 and 1086).
- **Verified:** rest-pose pixel diff above; motion frames at 1086 and 402 differ (it moves) with no page errors; `/__demo` card renders; typecheck, lint and build clean.
- **Revert:** `git revert --no-commit d208547 b540605 && git checkout HEAD -- docs/` (then `npm install` to drop three).

### U036 — Product pass: feelings, reply, Play, limit copy, sign-in at 540

- **Commit:** `4bc9c2e` · pushed 2026-10-15 16:51:34 UTC · `web_app` + `admin_cms` · not on `web_prod`
- **Patch:** [patches/U036-4bc9c2e.patch](patches/U036-4bc9c2e.patch)
- **Request (six points, "think + work as senior product manager and designer"):** (1) conditions like "hard to sleep" because users sometimes don't know what they feel; (2) sign-in cut off at w 540; (3) New Session is never limited — the point is to explore; (4) reply, so editing is sharper; (5) the Play icon only once the user has generated something; (6) an idea for removing the sticky active music — *inform only*.
- **Mobile:** points 1, 2, 4 change the mobile layout. Done on explicit request (the standing freeze yields to an explicit mobile ask); nothing else below `lg:` was touched.
- **1 — Feeling chips (Home, under the Ask field):** "Not sure how to put it? Start from how you feel." + Hard to sleep · Stressed · Anxious · Overthinking · Can't focus · Low energy · Feeling low · Not sure. *Assumptions:* a tap writes an editable sentence into the field (nothing sends on a tap, so the user sees and owns what is said); multi-select up to 3; "Not sure" is exclusive and asks Aurelia to help name it. If the user has typed their own words, those are kept and the feeling sentence is put in front on send. Each sentence is phrased to hit an existing reply rule (verified: sleep → cannot-sleep, stressed/anxious/overthinking → stress, focus → focus, energy/low → tired). New rule `unsure-feeling` in `src/lib/replies.ts` answers "Not sure" with five nameable states, each of which lands on an existing rule when tapped. Home's hand-off to chat now answers with `replyTo(ask)` instead of one fixed line, so the feeling actually gets answered. Files: `src/pages/HomePage.tsx`, `src/lib/replies.ts`, `src/pages/ChatPage.tsx`.
- **2 — Sign-in at 540:** the screen was capped at `max-w-[402px]` below `lg`, leaving a blank band right of the photo/form on any window 403–639px wide. Now full-width below 640 and a centred 480 column from 640 (v2's tablet card styles it further). 402 is identical. File: `src/pages/auth/SignInPage.tsx`.
- **3 — Limit copy:** the count was already per thread; the copy implied the whole account. Title "Edits on this session paused until …", body says a new session is always free and uncounted, New Session carries a "Free" tag. Verified: limit trips on the 3rd send, New Session gives an enabled composer. File: `src/components/chat/FreeLimitNotice.tsx`; PRD updated.
- **4 — Reply:** `Message.replyTo` (a copy of id/from/text). Swipe right (touch, follows to 64px, commits at 48), hover → Reply (mouse), or tap a line to show Reply. Composer shows a "Replying to Aurelia" tab (cancel ×, caret focused, placeholder "Say what to change about this"); the sent bubble quotes it; tapping the quote scrolls to and flashes the original. Aurelia answers a reply to her own line as "Just that part — …". Hidden while paused or recording. Files: `src/chat/ChatSessionContext.tsx`, `src/components/chat/ChatMessageItem.tsx`, `src/components/chat/ChatComposer.tsx`, `src/pages/ChatPage.tsx`.
- **5 — Play in the chat header:** `canPlay = !track && (sessionSlug !== null || sessionState === 'ready')` — an existing session opened here, or a finished build. Was `!empty && !track`. Verified: hidden on a new thread and after a send, shown after the build. File: `src/pages/ChatPage.tsx`.
- **6 — Sticky player:** proposal only, no code (see the reply in the session; summarised in CHANGE-LOG).
- **Not yet in mobile_app:** the feeling chips, `unsure-feeling` rule, reply, and the Play rule — the Flutter client shares the reply rule set, so it now lags by one rule.
- **Verified:** Playwright at 402 (chips → field text → Not sure → sign-in → chat answers with the five states), 540 (sign-in fills), 1280 (reply via hover, quote, scoped answer, Play hidden→shown, limit notice, New Session re-enables). Typecheck clean; lint warnings only, same kinds as before.
- **Revert:** `git revert --no-commit 4bc9c2e && git checkout HEAD -- docs/`.

### U037 — Card heights, See All, player Close, version history, publish date + logic review

- **Commit:** `7328ab6` · pushed 2026-10-18 16:39:27 UTC · `web_app` + `admin_cms` · not on `web_prod`
- **Patch:** [patches/U037-7328ab6.patch](patches/U037-7328ab6.patch)
- **Request:** (1) recommendation cards should be the same height; (2) enable See All on the Lineage Tree; (3) a close button on the parked player in chat; (4) a version history in the player sheet so a creator knows where they are, and lineage rows saying which version was used; (5) Details should say when it was published. Then a PDF (English) of odd or missing logic. Standing instruction from now on: think as a senior PM and flag what is missing.
- **Mobile:** all five touch layouts below `lg:`. Done on explicit request.
- **Changes:**
  1. `RecommendationFilter.tsx` — card wrapper is `flex` so cards stretch to the tallest; `RecommendationCard.tsx` — Add/Remove gets `mt-auto` so the buttons line up (v1 row too).
  2. `LineageTreeCard.tsx` — rewritten: header shows "Recreated N×"; each step says "Built on <parent> v1.x" (or "Original template"); "This session" tag; rows link only to steps that are real catalogue sessions (before, every row opened the current session's player); **See All** opens a sheet (`LineageSheet`, exported) with the whole ancestry plus "Rebuilt from this session" (count + three illustrative recent rebuilds with the version each used). Progress's dead "See All (10)" opens the same sheet.
  3. `MiniPlayer.tsx` — × Close stops and clears playback (cockpit header and v2 floating player).
  4–5. New `src/lib/sessionHistory.ts` (versions derived from Progress's ids + v1.0, publish info, lineage steps with versions, illustrative recreations, `isOwnSession`); new `src/components/ui/SessionDetails.tsx` used by `PlayerPage` and `SessionDetailPage`: **Publishing** card (Published / Last updated / Live version, or "Not published" for drafts), **Version history** timeline on your own sessions (Live badge, "You are here" = the `?v=` being played, tap to switch, "Manage versions" → Progress), then the Lineage Tree.
  - `src/lib/sessions/queries.ts` — `lineageDate` no longer returns 2026.12.10 (a future date); dates are now all in the past and ascending.
- **Assumptions:** "the version used" = the parent's version a fork was built from; publish date = first publish, plus last update = when the live cut was published; version history is shown to the creator only. Descendant data does not exist in the catalogue — the rebuild rows are illustrative and labelled so in code (logic review C3).
- **Logic review:** `docs/reviews/Aurelia-Logic-Review-2026-10-18.pdf` (source: `logic-review-2026-10-18.html`) — 43 findings (6 critical, 16 high, 14 medium, 4 low, 4 fixed here) and 15 decisions with recommended defaults.
- **Verified:** 402 v2 (equal cards, Close removes the player, See All sheet), session detail for own published (Soft Reset) and own draft (Monday Reset). Typecheck clean, lint warnings only.
- **Revert:** `git revert --no-commit 7328ab6 && git checkout HEAD -- docs/`.

### U038 — Connect per Figma, full-width sheets, design Version 3

- **Commit:** `a7dbf32` · pushed 2026-10-20 00:40:00 UTC · `web_app` + `admin_cms` · not on `web_prod`
- **Patch:** [patches/U038-a7dbf32.patch](patches/U038-a7dbf32.patch)
- **Request:** (1) check whether Publish has its loading/success states; (2) Figma 16883:18480 (My Wellness – Connect) — build if missing; (3) the "+" bottom sheet is not full width, and improve it with a summary of what you get before applying — in v3; (4) in v3, each Apply should keep its own result (apply 3× → 3 results), like an AI chat.
- **(1)** Already built: `PublishSheet` has Publishing (spinner + Cancel) → Session Published! (View Session), plus Unpublished. No change. (Logic review B3 still applies: Publish can be pressed mid-build.)
- **(2)** Connect already existed (toggles, Active Signals, request entry). Brought to the frame: request sheet input 44px / radius 16 / #D6D6D6 and Send 51px / radius 16 / #331B04 (was pill-shaped); after Send the sheet closes and the Figma toast appears — centred 362 card, radius 24, green send-2 glyph (SVG from the file), "Your recommendation has been sent!", Done outlined. Replaced "Thanks — that’s logged." The sheet is now portalled. File: `src/pages/WellnessPage.tsx`.
- **(3) width:** every bottom sheet (`AddSheet`, `ShareSheet`, `CategorySheet`, `ObjectiveSheet`, `RewardsSheet`, `PublishSheet`, `LineageSheet`, Wellness request) was capped at `max-w-[402px]`, leaving gaps on 403–639px phones. Now full width below 640, `sm:max-w-[480px]`, desktop caps unchanged. 402 identical. All versions.
- **Design Version 3** added to `src/versions/versions.ts` (staging picker). Versions are now cumulative: the 43 `:root[data-ui-version='2']` selectors in `versions.css` became `:root[data-ui-version]` so v3 inherits v2; TS checks were already `>= 2`.
- **(3) v3 sheet:** `AddSheetV3` — "Change this session", list rows (orb, title, description, "↑3% expected" or channel), sticky summary: "You’ll get N changes as <next version>", removable chips, "Expected: up to +6%" (largest, never summed — review D4), "N experiments — effect unknown until you listen", full-width "Apply N changes". v1/v2 keep the old sheet.
- **(4) v3 thread:** `Message.build` records the version each build made (`addVersion` now returns it). In v3 every build message renders its own result card: the newest shows building/ready/playing, earlier ones "Earlier version — tap to play" (`/play/<slug>?v=<id>`); the single bottom card is kept for v1/v2 and for states no message announced (a revert). The announcement says what went in: "Built Sleep meditation v1.3 with Increase yellow and Less movement." Files: `ChatSessionContext.tsx`, `ChatPage.tsx`, `ChatMessageItem.tsx` (`after` slot), `AddSheet.tsx`.
- **Limit:** the earlier-version cards play `?v=` with cockpit ids, which the player does not resolve (logic review B1), so they play the session's current recording.
- **Verified:** 430px v3 — sheet 430 wide with summary; deck apply + two sheet applies → v1.2, v1.3 (earlier) and v1.4 (ready) all in the thread; Connect request sheet and sent dialog. Typecheck clean; lint warnings only.
- **Revert:** `git revert --no-commit a7dbf32 && git checkout HEAD -- docs/`.

### U039 — Wellness Analytics: session analysis cards and Analysis page (v2 + v3)

- **Commit:** `98691ba` · pushed 2026-10-21 08:55:56 UTC · `web_app` + `admin_cms` · not on `web_prod`
- **Patch:** [patches/U039-98691ba.patch](patches/U039-98691ba.patch)
- **Request:** "Figma 16885:1622 ada update disini, tolong update v2 + v3 ya, pastikan terimplementasi dengan detail dan logic yang benar." The section holds "My Wellness/Analytics" (16883:14834) and "Analysis" (16883:15959). Its Connect frames were already done in U038.
- **Interpretation:** v2 and above (v3 inherits through `useUiVersion() >= 2`). v1 keeps the old objective cards. Production is pinned to v2, so it gets this once promoted (O3). "Logic yang benar" was read to mean every number comes from one record, and every button goes somewhere real.
- **Analytics tab (v2+):** one `AnalyticsSessionCard` per session. Specs: radius 20; gradient hairline #FF8514→#FFE270; shadow 0 5 24 4 /5%. The 49px session art, "Session N: …" (12 light #525252), the objective (16 medium) and an arrow. Below that, a 23px ring with track #FFF1DB, "60%, Great Progress!" and the delta pill (green #70C973 up / red #F02B2B down). The cards form one column on mobile and two on `lg:`. Files: `WellnessPage.tsx`, `components/wellness/AnalyticsSessionCard.tsx`, `components/wellness/ProgressRing.tsx`.
- **Analysis page** `/wellness/analysis/:id` (lazy, RequireAuth + wellness guard):
  - A 348px hero: the session cover with a 60% black fade, Back, a 120px white ring over a 12% disc, the %, the objective and the session.
  - A sheet with radius 32 holds, in order:
    - the status heading and "N% ↑ Since yesterday";
    - the summary sentence;
    - the metrics list (objective + three shifts, coloured dots #FFB746 / #5FC52C / #D862FF / #4DCAFF);
    - the 3-chapter chart: solid history, dashed projection, objective line thick with the brand gradient;
    - "What helped me?" cards;
    - "Next chapter" prediction;
    - the proposals deck (or list);
    - "Create Chapter N" and "Go to Session".
  - File: `pages/WellnessAnalysisPage.tsx`.
- **Logic (`lib/wellnessAnalysis.ts`):** one `Analysis` record per session, and every display value is derived from it:
  - The ring, the card % and the first metric are all `progressOf()`.
  - `statusOf()` sets the heading for both the card and the page: ≥50 Great Progress!, ≥35 Good Progress, else Needs Improvement.
  - `summaryOf()` writes the sentence from the strongest shift. When progress fell since yesterday, it says so instead.
  - `predictionOf()` builds "Based on analysis of chapter one…" from `chaptersDone`.
  - The art is the session's own cover (`artOf()`).
- **Figma inconsistencies resolved in code (not copied):**
  - The 24% card's ring was drawn at about 31%. Rings are now drawn from the value.
  - "What helped me?" listed Less movement twice. Now each helper appears once.
  - The chart's axis ran 0–400 under percentage metrics. It is now 0–100%.
  - The paragraph's grammar was broken and it quoted a number the list did not show. The sentence is now generated.
  - "Go to Session" was prototyped to the Connect frame, a placeholder. It now opens `/play/<session>`.
  - "Create Chapter 2" had no prototype. It now opens `/chat/<session>` with the proposals as the style change ("Create Chapter 2 with 435 Hz, Longer exhale and Warmer light"), so the cockpit builds the next version.
- **Race fix (`ChatPage.tsx`):** a route `styleChanges` was applied before the cockpit had opened the requested session. The user line was lost and the build was named after the previous session ("Sleep meditation v1.3"). The sentence is now held in `pendingStyleChanges` and applied only once `opened.slug` matches. This affects every entry with styleChanges, not just this one.
- **Limits:** all of it is mock data and illustrative, like the rest of `lib/`. The 435 Hz proposal orb is hotlinked from Unsplash and shows only the gradient offline. What the metrics measure, and where "predicted +12%" would come from, is undefined (O8).
- **Verified:** at 402px in v2, both cards; the Analysis page for 60% (Great Progress) and 24% (Needs Improvement, red 2%); Create Chapter 2 → cockpit with the user line and a "Dolphins frequency v2" build; Go to Session → `/play/ocean-breath`; v1 Analytics unchanged. Typecheck clean; lint shows no errors and one warning fewer than before.
- **Revert:** `git revert --no-commit 98691ba && git checkout HEAD -- docs/`.

### U040 — Analysis: balance the type in the metric list and chart

- **Commit:** `b5ea379` · pushed 2026-10-21 09:51:12 UTC · `web_app` + `admin_cms` · not on `web_prod`
- **Patch:** [patches/U040-b5ea379.patch](patches/U040-b5ea379.patch)
- **Request:** (screenshot of the metric list and chart) "perhatikan area ini masih belum balance secara text font size nya".
- **Cause:** the chart was an SVG with a fixed 370-wide viewBox, scaled to fill its box. On anything wider than the phone frame the labels grew with it: "Chapter 1" reached about 25px on desktop, next to the 14px list. Its labels also mixed 11px grey and 13px dark.
- **Change (all widths, `WellnessAnalysisPage.tsx`):**
  - The chart now draws at its container's real width (a ResizeObserver feeds the width; the minimum is 280), so its text never scales.
  - Axis and chapter labels are both 12px in Mulish. The axis uses `text-secondary` and the chapters use `text-primary`.
  - Each metric row now uses one weight for its label and its value (medium for the objective, light for the shifts). Before, the objective was medium + semibold and the shifts were light + regular.
  - All rows are 14/21 with tabular figures so the % column lines up. The Next chapter row matches.
- **Mobile:** at 402px the list was already 14px and the chart was close to 1:1. What changes there is the chart labels (11/13 → 12/12) and the row weights. This is a fix to a screen added yesterday (U039), not a change to the frozen mobile layout.
- **Verified:** screenshots at 402 and 1440 (2× DPR). The labels measure the same height at both widths. Typecheck clean; lint shows no new warnings.
- **Revert:** `git revert --no-commit b5ea379 && git checkout HEAD -- docs/`.

### U041 — Player analysis drawer, session Feedback, Settings script + rename

- **Commit:** `8d6c79d` · pushed 2026-10-21 10:03:15 UTC · `web_app` + `admin_cms` · not on `web_prod`
- **Patch:** [patches/U041-8d6c79d.patch](patches/U041-8d6c79d.patch)
- **Request:** "Figma 16886:1623 ada update di area ini juga, apply di v2 dan v3" + "16883:13096 tolong di update". The first is the section "Session: Chat - Player" (player peek, open drawer, answered Feedback). The second is "Session/Settings/Script".
- **Interpretation:** v2 and above, as with U039. The new drawer is for a session that **has an analysis** (`analysisForSession(slug)`: today dolphins-frequency, which is the cockpit's default draft, and ocean-breath). The frame shows a session you are working on with an objective. A session with no analysis has nothing to show there, so it keeps the drawer it had. v1 is unchanged.
- **Player drawer** (`PlayerPage.tsx` → `AnalysisDrawer`):
  - At the peek: "Great Progress!", "3% ↑ Since yesterday", and a small ring with 60%.
  - Pulled up, in the frame's order:
    1. the summary sentence and the metrics;
    2. the 3-chapter chart;
    3. **Go to Analytics** (`/wellness/analysis/:id`) and **Ask Aurelia** (`/chat/<slug>` asking "How can I get closer to "<objective>" in my next chapter?");
    4. **Feedback**;
    5. **About this session**: the title (the name the cockpit handed over, else the version, else the catalogue title), a chevron to `/session/<slug>`, a 3-line description with Read More, and tags;
    6. **Next chapter**, with the proposals, **Create Chapter N** (the same cockpit build as the Analysis page) and **Ask Aurelia**.
  - Session **Details** (versions, publishing; U037) stay at the foot. They are not in the frame, but they are what U037 asked for.
  - What the old drawer carried and the frame drops is gone from this drawer only: the author row, the Played/Recreated figures, the Elaborate / Morning boost chips (Ask Aurelia replaces them) and the Recreate cards (you don't recreate your own session).
- **Shared parts:** `components/wellness/AnalysisParts.tsx` (`AnalysisStatus`, `AnalysisShifts`, `MetricRow`, `ProgressChart`, `NextChapter`) is now used by both the Analysis page and the drawer, so their numbers and type cannot drift apart. `chapterBrief()` and `analysisForSession()` are in `lib/wellnessAnalysis.ts`.
- **Feedback** (`components/wellness/SessionFeedback.tsx`):
  - Two #F5EEE8 cards per the frame.
  - **"How is the experience?"** is a pill input; Send stays disabled until something is typed. After sending, the card reads "Thank you for your feedback / It helps Aurelia fine-tune your next chapter."
  - **"How does listening to this make you feel?"** is five faces, using the frame's own vectors split into `src/assets/moods/mood-1…5.svg`.
  - The two cards answer independently.
  - The frame only draws the happy answer, so the reply follows the face:
    - 4–5: "Glad to hear it!" plus the frame's line.
    - 3: "Thanks for telling us."
    - 1–2: "Sorry it didn't land."
  - The pick stays changeable: it is outlined 2px #331B04 and the others fade to 50%.
  - Answers are kept per session/version for the visit, so reopening the player does not ask again. Nothing is sent, because there is no backend. In this drawer, Feedback replaces the end-of-play check-in, so nothing is asked twice.
- **Settings / Script** (`SessionSettingsPage.tsx`, v2+):
  - The title reads "Settings".
  - The chips match the frame: 35 tall, radius 12, 12px text, Lucide equivalents of cursor-text / canvas / music-note. **No General gear**, because none of the three Settings frames has one; v1 keeps it.
  - On the Script tab:
    - a **Session Title** card (gradient edge, radius 20, a 36px #FFF1DB icon disc, "Session Title" 12 light #525252, the name at 14, and a pencil);
    - "Session Script" (14 light #9A9A9A);
    - the script in a white radius-20 card at 14px.
- **Rename** (`RenameSessionSheet.tsx`, plus `renameSession` / `sessionNameOf` in `ChatSessionContext`):
  - The frame's pencil is prototyped to the Objective sheet, a copied link. This sheet uses that layout but asks for the session name.
  - Only the **name** is editable. The version ("v1.3") is shown beside the field and every cut keeps its own number, so "Sleep meditation v1.3" → "Evening calm v1.3" and the next build is "Evening calm v1.4".
  - Save waits for a non-empty name that differs from the current one.
  - The name is the cockpit's, so the progress card, player and Sessions follow it.
- **Race fix (`ChatPage.tsx`):** an `ask` arriving with `/chat/:slug` was written into the thread that was already open, and openSession then replaced it. The question vanished and a stray reply was left. It is now held in a ref until the thread is on that session, the same fix as U039's style changes. Home's ask (`/chat`) is unaffected.
- **Known limits:**
  - Ask Aurelia's reply is the generic answer rule ("Got it — noted…"). There is no rule yet for questions about progress.
  - Session settings has no session in its URL and edits whatever session the cockpit is on (true before this change too).
- **Verified (402px, v2):**
  - Player: the peek, half and full rests; Send disabled when empty; both Feedback answers, the sad-face copy, and answers remembered after leaving and coming back.
  - Go to Analytics → `/wellness/analysis/mental-clarity`; Ask Aurelia → `/chat/dolphins-frequency` with the question shown.
  - `golden-hour` keeps the old drawer.
  - Settings: Save disabled until the name changes; the rename was applied.
  - v1 player and v1 Session settings are unchanged.
  - Typecheck clean. Lint shows two new warnings, both of patterns already in the codebase (a helper exported from the context file; setState inside the deferred ask effect).
- **Revert:** `git revert --no-commit 8d6c79d && git checkout HEAD -- docs/`.

### U042 — Session settings: current styles cannot be removed (v2+)

- **Commit:** `a4c9092` · pushed 2026-10-21 10:55:13 UTC · `web_app` + `admin_cms` · not on `web_prod`
- **Patch:** [patches/U042-a4c9092.patch](patches/U042-a4c9092.patch)
- **Request:** (screenshot of Settings › Current style with the red minus) "ini harusnya tidak bisa di remove ya".
- **Interpretation:** the request is a rule rather than a one-off. It matches the Figma Visual and Sound frames (16883:13158 / 16883:13270): their file still has a minus node on the second card, but it does not render in either frame, and none shows on screen. It applies in v2 and above, following the version convention; v1 keeps the minus.
- **Change (`SessionSettingsPage.tsx`):** `AppliedChip`'s `onRemove` is now optional and v2 doesn't pass it, so no Remove button renders. Changing what a session is made of still goes through a new build (Explore new styles → Apply changes, or the cockpit).
- **Verified:** at 402px, v2 Visual and Sound show 0 Remove buttons; v1 shows 2 on each. Typecheck clean; lint unchanged.
- **Revert:** `git revert --no-commit a4c9092 && git checkout HEAD -- docs/`.

### U043 — Session settings: full width below lg, Add buttons aligned

- **Commit:** `c7a9243` · pushed 2026-10-21 10:58:26 UTC · `web_app` + `admin_cms` · not on `web_prod`
- **Patch:** [patches/U043-c7a9243.patch](patches/U043-c7a9243.patch)
- **Request:** (screenshot at 480px, Settings › Sound) "untuk ukuran 470 saya merasa aneh harusnya sih stretched ya".
- **Cause:** the content column was `mx-auto max-w-[402px]`. On anything between 403 and 1023px it sat as a centred 402 strip, while the header above it spans the width. At 480 the chips started at x=58 and the back button at x=20.
- **Change (`SessionSettingsPage.tsx`, all versions):**
  - The container is `w-full lg:mx-auto lg:max-w-[960px]`, so the content spans the width below `lg:` and keeps the 960 cap on desktop.
  - Each style card's Add button is `mt-auto` (and More has `mb-10`), so Add sits at the foot of every card. Before, a one-line description lifted it out of line with the card beside it ("Aulos" next to "Tibetan singing bowls"). This shows at 402 too.
- **Mobile rule:** the owner explicitly asked for a change below `lg:`. At 402 the layout is identical in position and size (chips x=20, cards 175 wide); only the Add alignment differs.
- **Same cap elsewhere (not changed, flagged):** 17 other screens use the same `max-w-[402px]` column below `lg:`: Help, Progress, Recreate (×2), Wellness, Chat (thread and composer), Invite, Upgrade, See all, Credits, Session detail (×2), Challenge detail (×2), the player hero, and the auth screens. Offered as a follow-up rather than changed unasked.
- **Verified:** 402 / 480 / 1280, with no horizontal scroll at any of them. At 480 the chips align with the back button (x=20) and cards are 214 wide; desktop is unchanged (cards 450). Typecheck clean; lint unchanged.
- **Revert:** `git revert --no-commit c7a9243 && git checkout HEAD -- docs/`.

### U044 — Promote staging v2 to production

- **Request:** "naikan v2 ke prod ya" (2026-10-21).
- **What moved:** `web_prod` `4140e59` → this log commit (33 commits): U030–U043.
  - Desktop fixes: U030, U031, U033.
  - Click insights: U032, U034.
  - Three.js network, off by default: U035.
  - Feelings / reply / Play rule / limit copy: U036.
  - Lineage, version history, publish date, player Close: U037.
  - Connect per Figma and full-width sheets: U038.
  - Wellness Analytics + Analysis page: U039, U040.
  - Player progress drawer, Feedback, Settings rename: U041.
  - Current style read-only: U042.
  - Settings full width: U043.
  - Plus the logs, the work journal and the logic-review PDF.
- **Production specifics:**
  - Production is pinned to **v2** (`PRODUCTION_VERSION = 2`), so the v3-only parts stay on staging: the change-sheet summary and every build kept in the thread.
  - No picker or staging bar. Version stays `0.1.0`, because no bump was asked for.
  - A production-mode build (`VERCEL_ENV=production`, branch `web_prod`) compiled before the push.
- **Flagged at promotion:**
  - **Click insights (U032/U034) is on by default, so production visitors' screens and taps are now recorded.** It stores labels and positions, never field values, but the consent decision (O1 #15) is still open. To turn it off on production: `/__demo` on the production site → Click insights off → Publish. Production keeps its own flag set.
  - O3 is closed by this promotion.
- **Undo:** `git push --force-with-lease origin 4140e59:web_prod`, only on explicit request (it rewrites the production branch). Individual changes are reverted through their own U-entries and then re-promoted.

### U045 — Change filter moved from the thread into the "+" sheet

- **Commit:** `8286ffb` · pushed 2026-10-21 17:48:52 UTC · `web_app` + `admin_cms` · `web_prod` since U046
- **Patch:** [patches/U045-8286ffb.patch](patches/U045-8286ffb.patch)
- **Request:** "saya dapat feedback ini tolong update di v2 dan v3". The feedback was a WhatsApp screenshot from Eugene: the filter row (All 3 / Visual 1 / Sound 1 / …) and "3 of 3 selected · ↑36% combined" were crossed out above the opened recommendation cards in the thread, with the note "This filter system.. should go here below instead..". A red line marked the "+" sheet just above "Improve based on diagnosis".
- **Interpretation:** move the filter, don't duplicate it. It now lives at the top of the "+" sheet, between the close button and "Improve based on diagnosis". The opened row in the thread goes back to the plain cards in every version.
- **Change:**
  - New `components/chat/FilterChips.tsx`: the chip rail with sliding highlight, icons and counts, extracted from the old `RecommendationFilter.tsx`, which is deleted.
  - `AddSheet.tsx`:
    - Every option has a `kind` (Increase yellow → visual, Less movement → movement, Aulos → sound, Art Deco → visual).
    - `useSheetFilter` narrows both sections at once and hides a section that ends up empty.
    - An empty result says "Nothing selected yet." / "No changes of this kind here." and offers "Show all 4".
    - **v2:** the chips plus "N of 4 selected · ↑ up to X% expected" under them.
    - **v3:** the chips only, because its summary panel at the foot already says what Apply will do.
  - `ChatMessageItem.tsx`: the opened deck renders the plain row for v2 too.
- **Logic fix carried with it:** the old line summed predictions ("36% combined" = 12+12+12). Two changes' expected gains do not stack (logic review D4), so the sheet shows the **largest** expected gain ("up to 6%"), the same rule as v3's summary.
- **Flagged, not changed:** the thread's cards and the sheet keep **separate selections**. The thread's "Apply new changes (3)" counts the deck's picks, while the sheet starts at "0 of 4 selected". The scores also differ: the deck says 12% for Increase yellow and the sheet says 3%. Both come from different mock lists (O12).
- **Verified (402px):**
  - The thread has no filter in v2 or v3 (0 toolbars after opening the deck).
  - The sheet shows All 4 / Visual 2 / Sound 1 / Movement 1 / Selected 0. Visual shows Increase yellow and Art Deco. Selected is empty and offers Show all.
  - After two Adds, v2 shows "2 of 4 selected · ↑ up to 6% expected" and v3's summary says "You'll get 2 changes".
  - Typecheck clean; lint unchanged.
- **Revert:** `git revert --no-commit 8286ffb && git checkout HEAD -- docs/`.

### U046 — Promote U045 to production

- **Request:** "oke naikan ke prod ya" (2026-10-21).
- **What moved:** `web_prod` went from `2a2a376` (U044) to this log commit: U045 (the change filter moved into the "+" sheet, with the largest gain shown instead of a sum) plus its logs.
- **Production specifics:** pinned to v2, so production gets the v2 sheet with the chips and the "N of 4 selected · up to X% expected" line. A production-mode build compiled before the push. Version stays `0.1.0`.
- **Undo:** `git push --force-with-lease origin 2a2a376:web_prod`, only on explicit request.

### U047 — Design v4: first-run onboarding

- **Commit:** `720e50a` · pushed 2026-10-22 06:14:32 UTC · `web_app` + `admin_cms` · not on `web_prod` (production is pinned to v2, so v4 cannot show there until it is promoted as the production version, a separate decision)
- **Patch:** [patches/U047-720e50a.patch](patches/U047-720e50a.patch)
- **Request:** "buatkan v4 yang didasarkan dari v3. saya mau ketika user pertama kali login maka ada proses onboarding, tolong coba improvisasi UX dan UI nya untuk proses onboarding user nya. pastikan fitur itu cocok untuk kondisi yang kita punya sekarang."
- **Interpretation, read against "the conditions we have now":**
  - **First login means first sign-in on this browser.** There are no accounts, and sign-in deliberately does not persist (AuthContext), so "first" is recorded in localStorage (`aurelia.onboarding`). Once accounts exist this moves to the account (O13).
  - **Ask only what the app can use today.**
    - The goal becomes the first session's objective (`writeObjective`), so Progress and Insights measure against it.
    - The feeling, length, voice and sound become the first message to the cockpit, through the same `ask` path Home uses.
  - **Don't ask for what the app can't do yet:** no wearable pairing (Connect is mock, and the summary points to it for later), no notification permission, no profile photo.
  - **Never block intent.** Every step has Skip, and Skip saves what was answered. Someone who signed in to do something specific, such as sending Home's Ask, lands there after Skip. The last step offers "Continue where I was" whenever there was a destination.
- **Flow** (`pages/OnboardingPage.tsx`, route `/welcome`, full screen, RequireAuth, v4+ only):
  1. **Welcome:** "Welcome, Adam.", "three quick questions — about a minute", and how Aurelia works as three numbered steps (tell → it composes → every chapter adapts; numbered because it is a real sequence). "Let's begin".
  2. **Goal:** a single choice from six cards with icon, label and hint (Sleep better, Feel calmer, Clear my mind, Focus, Regulate my body, More energy). "This becomes your objective". Continue is disabled until one is picked.
  3. **Feeling today:** optional, up to 3, the same chips and sentences as Home (moved to `lib/feelings.ts`). "Not sure" is left out because it asks a question, which does not belong in a brief. With nothing picked the button reads "Skip this one".
  4. **Session style:** pre-filled with the demo's own defaults, so Continue is always valid.
     - Length 5 / 10 / 20 min, Voice Female / Male / No, Sound (multi).
     - "Mostly silence" is exclusive of the other sounds.
     - "Change later in Session settings".
  5. **Ready:** an editable summary (Goal / Today / Sessions; each row jumps back to its step) and **the first message, word for word** ("Create my first session: 20 minutes to help me sleep better. I'm stressed. Male voice, with nature sounds and healing frequencies."). It says the answers stay on this device and that a wearable can be connected later.
     - **Create my first session:** a fresh thread (no demo history), the draft named after the goal ("Sleep better v1.0"), and the goal written as its objective.
     - **Explore Aurelia first** / **Continue where I was:** go to the destination or Home.
- **UI:** a warm radial #FFF1DB wash, a progress bar of 4 segments (welcome has none), Back and Skip, one question per screen, and a fixed bottom primary (#331B04, h-52, radius 16). On desktop it is a centred 520 card.
- **Supporting changes:**
  - `lib/onboarding.ts`: goals, options, storage, the brief.
  - `lib/replies.ts`: a new first rule, `first-session`, which acknowledges the setup and proposes. Without it, the brief's "20 minutes" would have been answered by the duration rule.
  - `ChatPage.tsx`: `firstTitle` route state, applied after the fresh reset.
  - Sign-in and sign-up route a first v4 sign-in through `/welcome` with the destination.
  - Settings: **Replay onboarding** (v4).
  - `versions.ts`: the v4 entry. The v2 change list now describes the filter where U045 put it.
  - `CLAUDE.md`: a note on v4.
- **Verified:**
  - **402:**
    - First sign-in → `/welcome`; Continue is disabled until a goal is picked.
    - The full flow ends in `/chat` with an empty history: the brief as the user line, the `first-session` reply, then "Here is what I would put in it:" and the deck.
    - The answers are stored. A second sign-in goes straight to `/home`.
  - **Gated path:** Home Ask "I feel tense" while signed out → login → `/welcome` → Skip → `/chat` with the ask.
  - **Settings:** Replay → `/welcome`.
  - **1280:** the centred card.
  - **v3:** sign-in still goes to `/home`, with no onboarding.
  - Typecheck clean; lint unchanged.
- **Known limits:**
  - The answers do not yet change what the build contains, because the build is mock and always the same stand-in.
  - The `first-session` rule is web-only, so `mobile_app`'s shared rule set now differs by one (O7).
- **Revert:** `git revert --no-commit 720e50a && git checkout HEAD -- docs/`.

### U048 — Production-grade foundation (code quality, caching, tests, CI)

- **Commit:** `8bb282f` · pushed 2026-10-23 15:35:03 UTC · `web_app` + `admin_cms` · not on `web_prod`
- **Patch:** [patches/U048-8bb282f.patch](patches/U048-8bb282f.patch). It excludes `package-lock.json`; after reverting, run `npm install`.
- **Request:** "lakukan pengecekan ulang di staging… perbaiki secara code qualitynya, pastikan punya production grade, dan kalau ada library tolong di install karena kita mau jadikan ini AI product… cache management atau lainnya."
- **Interpretation:**
  - Keep the mock data. Make the plumbing the AI backend will use production-grade, and change nothing a user sees. The mobile layout is frozen, so pixel-identical screenshots are the acceptance bar.
  - "Re-check staging" means a full route-by-route check of a staging-mode build. The live staging site is not reachable from this environment.
- **Audit found:**
  - 41 lint warnings.
  - Raw `fetch` with no timeout or response validation (4 places).
  - Direct `localStorage` access in 19 places.
  - No server-state cache, no test runner, no CI.
  - Duplicated KV/scoping code in the three endpoints, where a malformed JSON body produced a 500.
  - Refs and the clock read during render.
  - Three screenshots committed to the repo root.
  - `/__demo/insights` overflowing to 914px at 402.
- **Installed:**
  - `@tanstack/react-query` (cache, de-duplication, retries, cancellation, polling, mutations).
  - `zod` v4 (runtime validation of every API response and stored value).
  - Dev: `vitest`, `@testing-library/react` + `dom`, `jsdom`, `@tanstack/react-query-devtools`.
  - Existing dependencies updated within range (React 19.3, lucide 1.61, oxlint 1.89, Vite 8.3). `npm audit`: 0 vulnerabilities.
- **New foundation (described in `CLAUDE.md` → "Engineering foundation"):**
  - `lib/queryClient.ts`: defaults, plus central error reporting with a `meta.reportErrors` opt-out.
  - `lib/http.ts` `requestJson`:
    - 10s timeout and caller cancellation, with old-Safari fallbacks.
    - Zod validation of the response.
    - `HttpError` with `status` (0 = network) and `.retryable`.
  - `lib/storage.ts`: nothing throws; JSON is validated with a fallback.
  - `lib/monitoring.ts`:
    - `reportError`, the seam for Sentry.
    - Global `error` / `unhandledrejection` listeners.
  - Error boundaries: root, plus a route-level one keyed on the pathname.
  - `src/api/config.ts`, `clicks.ts`, `annotations.ts`: schemas, fetchers, query keys.
- **Migrated:**
  - **Feature flags** run on `useQuery` (15s poll) and `useMutation` (Publish writes back into the cache). Same semantics: a viewer follows the server, a presenter keeps edits until Publish or Revert.
  - **Click insights** page and heatmap read through the cache.
  - The **tracker** posts through `requestJson`, and a burst of more than 200 events now drains every batch instead of waiting for the next tap.
  - **Annotations** validate what the unauthenticated endpoint returns and what is in storage.
  - All direct storage access goes through `lib/storage` (site lock, mute, notifications seen, design version, onboarding with a schema).
- **Serverless:** `api/_lib/kv.ts` shares the Upstash client (now with an 8s timeout), `scopedKey`, `parseBody` (malformed JSON → 400) and `noStore`. The three endpoints lost their copies. Verified by compiling to Node ESM and running the handlers; the `.js` import extension resolves.
- **Lint:** 41 → 0, and the lint script now has `--deny-warnings`.
  - Pure data moved out of component files: `chat/thread.ts` (messages, deck, drafts, version labels), `chat/addOptions.ts`, `demo/insights/stats.ts`.
  - Render-time `Date.now()` and ref reads moved to lazy state or effects.
  - The Player's check-in reset uses the adjust-state-on-prop-change pattern.
  - `useEffectEvent` for the ask reply.
  - The remaining route-state "door" effects are annotated with why they are effects.
  - Provider hooks are allowed in `.oxlintrc.json`.
- **Tests:** Vitest, 55 tests in 12 files covering:
  - feelings, onboarding (brief, its reply rule, storage), replies;
  - wellness analysis (derivations, thresholds, no duplicate helpers), version labels and rename;
  - the annotation .txt round trip (escaping, CRLF), storage, HTTP;
  - insights stats;
  - the KV scoping and `parseBody`, and the three endpoints (configured:false, 400 on malformed JSON, booleans-only config, invalid clicks dropped, 405);
  - the `SessionFeedback` component.
  - Test files sit next to their code. Endpoint tests are under `api/_lib/` because every file directly in `api/` becomes a Vercel route.
- **CI:** `.github/workflows/ci.yml` runs typecheck, lint, test and build on pushes to `web_app`/`admin_cms`/`web_prod` and on pull requests. Scripts `test`, `test:watch` and `check` were added, and `engines.node >=20.19`.
- **Bundle and repo:**
  - Vendor chunks `react-vendor` and `query-vendor` are long-cached across deploys.
  - Chunk warning limit raised to 600 because the only large chunk is the lazy three.js one.
  - Stray `drawer.png` / `notif.png` / `sessions-live.png` removed.
  - `/__demo/insights` grid fixed (`grid-cols-1`, `min-w-0`).
- **Staging re-check (staging-mode production build, served locally):**
  - **Routes:** 53 routes (consumer, auth, onboarding, wellness, player, admin, `/__demo`, a 404) at 402 and 1280, v2 and v4. Result: no page errors, no console errors, no error boundary, no empty screens, no horizontal scroll, after the insights fix.
  - **Before/after visuals:** 16 key screens at 402 and 1280 are **pixel-identical** (32/32).
  - **Flows:**
    - onboarding (first sign-in, skip with intent, replay);
    - the "+" sheet filter in v2/v3;
    - the player drawer, Feedback, Ask Aurelia and Settings rename;
    - the site lock and toggling a flag from `/__demo`.
  - `npm run check` and `npm run build` are clean.
- **Not done (flagged):**
  - No end-to-end suite yet (O14).
  - No error-reporting service chosen (O14).
  - The live staging URL could not be opened from here. Check that `/__demo` → This build shows `8bb282f` or later after the deploy.
  - Initial JS grew by about 35 kB gzip for TanStack Query + Zod; `zod/mini` is an option if that matters later.
  - `Permissions-Policy: microphone=()` in `vercel.json` will block real voice input when it arrives (O14).
- **Revert:** `git revert --no-commit 8bb282f && git checkout HEAD -- docs/ && npm install`.

### U049 — Offline support, and 404 for forced signed-out access

- **Commit:** `8a6f011` · pushed 2026-10-25 09:42:14 UTC · `web_app` + `admin_cms` · not on `web_prod`
- **Patch:** [patches/U049-8a6f011.patch](patches/U049-8a6f011.patch). It excludes `package-lock.json`; after reverting, run `npm install`.
- **Request:** "saya mau memastikan ketika tidak ada internet masih ada beberapa yang bisa dibuka, kemudian perlu ada halaman 404 jika user force akses page yang butuh login."
- **Interpretation:**
  - **Offline:** everything is bundled mock data, so the whole app can work offline after one visit, not just "some" pages. That makes it a service-worker job: cache the app, not only the data.
  - **404:** "force access" means opening a signed-in address directly (typed, pasted, bookmarked, reloaded) while signed out. A link tapped inside the app is normal use and keeps going to sign-in, otherwise every in-app link would dead-end on a 404. All versions, because this is a requirement, not a design experiment.
- **Offline (`vite-plugin-pwa` 2.0 + `workbox-window`, config in `vite.config.ts`):**
  - **Precache:** 122 files, about 2.6 MB. That is the shell, every route's code, CSS, fonts, bundled images and the manifest. The existing `public/site.webmanifest` is kept (`manifest: false`).
  - **Fallbacks and exclusions:** `navigateFallback` serves `/index.html`; `/api/*` and `/__*` are excluded. three.js (the off-by-default 3D network) is not precached; it is cached on first use.
  - **Runtime caches:**
    - Unsplash covers: CacheFirst, 300 items, 30 days. Covers not yet seen show the token gradient, as designed.
    - Lazy assets: CacheFirst.
    - **Session audio:** CacheFirst with range requests, because Safari will only play a 206. `UpdatePrompt` warms it with one full download once the worker controls the page.
  - **`OfflineBanner`:** a pill under the staging bar reading "You're offline — saved screens still work", then "Back online" for 2.5s. It is not tappable, renders nothing while online, and is ignored by click insights.
  - **`UpdatePrompt`:** registers the worker, checks for a new build hourly, and shows "A new version of Aurelia is ready · Reload · ×". It is `registerType: 'prompt'`, not auto-reload, so a deploy never cuts off a session someone is listening to.
  - **`vercel.json` CSP:** `connect-src` adds `https://images.unsplash.com` (the worker fetches covers) and adds `worker-src 'self'`.
  - The Vite option `advancedChunks` was renamed `codeSplitting`, which clears its deprecation warning.
- **404 (`auth/RequireAuth.tsx`, `pages/NotFoundPage.tsx`):**
  - A signed-out visitor on a protected route whose location key is `"default"` (the router's first entry, i.e. a forced address) sees the 404 page: "404 · Page not found · This page isn't available right now. If it's yours, sign in to open it." It has a **Sign in** button and **Back to Home**.
  - It neither confirms nor denies what is at the address.
  - Sign in returns to the address. Sign-in, sign-up and onboarding now keep the query string (`?v=…`).
  - Unknown URLs keep the plain 404.
  - Because sign-in does not persist, reloading a signed-in page also lands on this 404, and Sign in brings the user back.
- **Not covered:** `/admin` still has no authentication (P0, unchanged), so it is not behind this 404.
- **Tests:** `RequireAuth` (forced address → 404 with Sign in; an in-app link → `/login`) and `OfflineBanner` (silent online; offline → back online → gone). 59 tests total.
- **Verified in a browser (staging-mode build, real service worker, network switched off):**
  - The worker controls the page after the first visit.
  - Offline, reloading `/home` works with the banner, and a hard load of `/explore` works.
  - Signing in offline works.
  - 13 routes in-app offline (explore, chat, sessions, session detail, player, wellness, analysis, progress, settings, session settings, notifications, help, admin) render without errors.
  - The Mulish font loads offline. Session audio plays offline and answers range requests with 206.
  - "Back online" appears.
  - **404:**
    - 4 protected addresses at 402 and 1280 show the 404 with Sign in; an unknown URL shows the plain 404.
    - Sign in returns to `/play/dolphins-frequency?v=v2`.
    - A Home card link while signed out goes to `/login`.
  - **Update:** a rebuild triggered the toast; Reload moved the page onto the new build.
  - Full 53-route smoke test (v2/v4, 402/1280): no problems.
  - `npm run check` is clean.
- **Noted:** `npm audit` shows 3 high findings in dev-only `@figma/code-connect` (bundled zod 3). They are not in the app bundle; `npm audit --omit=dev` = 0.
- **Revert:** `git revert --no-commit 8a6f011 && git checkout HEAD -- docs/ && npm install`. Note that a reverted deploy still leaves the old worker in browsers until it updates. A self-unregistering `sw.js` would be needed to remove it immediately.

### U050 — v4: first-time fixes from the retention simulation

- **Commit:** `ae75233` · pushed 2026-10-26 00:05 UTC · `web_app` + `admin_cms` · not on `web_prod`
- **Patch:** [patches/U050-ae75233.patch](patches/U050-ae75233.patch)
- **Request:** after J039 ("fitur apa yang harus kita refine?" → five features, "itu sudah ada di v4?" → no), "oke update saja di v4 deh".
- **Interpretation:**
  - The J039 recommendations go into **v4**, not a new v5, as the owner chose.
  - v1–v3 and production (pinned to v2) are unchanged. The v4 screens are mobile screens, so this is an explicit mobile change for v4 only.
  - Scope is the five features from the summary (R1, R2, R3, R5, R6, R7, plus a minimal R8) and the small ones (R4, and R9's Connect).
  - The Sessions and Notifications empty states (rest of R9) and the second-goal invite (R10) are partial or left for later.
  - Sign-in persistence (decision D2) is **not** changed. The journey lives in `localStorage` like onboarding, which is what lets tomorrow's visit find yesterday's chapter after signing in again.
- **What changed (all `useUiVersion() >= 4`):**
  - **R1 Their words** (`OnboardingPage`, `lib/onboarding.ts`, `chat/firstSession.ts`):
    - A sentence typed on Home before sign-in pre-fills the goal and feelings (`inferFromWords`).
    - Welcome goes straight to the summary ("Got it, Adam. Read from what you wrote"), and the brief carries "In my words: “…”".
    - There is one button, **Build my first session**; "Continue where I was" is hidden when they arrived with words.
    - Skip sends their words to a fresh thread.
  - **R2 Own thread** (`ChatPage`):
    - Bare `/chat` on the untouched demo thread resets to an empty thread of their own, whichever door they used. A fresh thread is named after the goal ("Sleep better v1.0"), "My first session v1.0" without one, and "New session v1.0" after the first.
    - A first message no rule recognises gets the first-session reply instead of "noted for the next revision".
  - **Free limit:** only sends after the first build count.
  - **R3 Goal deck** (`chat/firstSession.ts`, `ChatSessionContext` `deck`/`replaceDeck`, `ChatMessageItem` `recommendations` prop):
    - Three changes per goal (sleep, calm, clarity, focus, regulate, energy), with voice items dropped for "no voice" and sound items for "mostly silence". A "no spiritual/frequencies" request filters frequency items.
    - No invented "Improve Score" (`Recommendation.improveScore` is now optional). Titles are kept within 13 characters so the folded deck does not clip them.
    - The composer chips follow their choices (`suggestionsFor`): no "Make it longer" after 20 min.
  - **Auto-build:** onboarding's button builds as soon as Aurelia has proposed (`firstSession` route flag).
  - **Journey** (`lib/journey.ts`): the first build of an own thread starts a 5-chapter journey: goal, name, slug and check-ins, plus a reminder time once one is set.
  - **R5 + R6 + R8 Player** (`ChapterCheckIn`, `PlayerPage`):
    - The journey's session played as a build opens on "Chapter N · your starting point — How do you feel now?" (five faces) instead of the demo analysis.
    - After answering: "Chapter N+1 is ready tomorrow (night)", then **Remind me at 22:30** (default per goal, editable). This downloads an `.ics` that repeats daily for the chapters left, with an alert.
    - A 5-dot track. From two check-ins on, each answer is drawn as given.
    - After five chapters: "Start on another goal".
  - **R7 Home** (`NextChapterCard`, `HomePage`): signed in with a journey, Home leads with "Tonight · Sleep better — Chapter N". It says why ("last time you felt pleasant, this chapter keeps what worked"), shows Play, the reminder line and the track. The promo banner, the Adaptive Wellness grid and the closing CTA are hidden for signed-in users.
  - **R4 Quick Start:** Play plays a catalogue session of that kind in place, before sign-in (the floating player shows it), and the icon turns to Pause.
  - **R9 Connect:** all six sources start off (`defaultConnections(allOff)`).
  - **Settings:** Replay onboarding also resets the journey.
- **Tests:** `chat/firstSession.test.ts` (deck per goal, preference filters, no scores, title length, chips never undo a choice and reach a reply rule, inference) and `lib/journey.test.ts` (persistence, reset, schema rejects an edited record, reminder default, ICS start/repeat). The onboarding brief is now tested with their words. 74 tests total.
- **Verified in the browser** (production build, 402 px), re-running the J039 personas:

  | Persona | Before | After |
  |---|---|---|
  | Maya | 14 taps to the player | 5 taps. Summary pre-filled from her words; built "Sleep better v1.0" (Slow breath, Warm dim, Voice fades); check-in; `.ics` downloaded; Home shows "Sleep better — Chapter 2". |
  | Sari | 13 taps | 6 taps |
  | Tom | 15 taps | 6 taps |
  | Raka (explore first) | lands in the demo thread | own "Feel calmer v1.0" thread with the calm deck; Connect shows 0/6; check-in on the player |
  | Dewi (skipped onboarding) | "Sleep meditation v1.3" and the limit after one message | "Regulate my body v1.0" from "body scan"; first-session reply; no limit |
  | Leo | — | Quick Start Play plays Clear Skies on Home |

  - 53-route smoke test (v2/v4, 402/1280): no problems.
  - v3 `/chat` still opens the demo conversation.
  - Desktop 1280: Home card and player check-in checked.
  - `npm run check` and the build are clean.
- **Not done / follow-ups:**
  - Stories for `ChapterCheckIn` and `NextChapterCard` on `storybook`.
  - Sessions and Notifications empty states for a new user.
  - Analytics and My Wellness are still mock.
  - Replies after the first message are still keyword rules (mock AI).
- **Revert:** `git revert --no-commit ae75233 && git checkout HEAD -- docs/`

