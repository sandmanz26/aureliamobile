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
