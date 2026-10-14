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
