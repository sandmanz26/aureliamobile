# Aurelia Web

Frontend-only web client for Aurelia AI — the consumer app and the admin CMS,
one React app, two shells. React 19 + Vite + Tailwind CSS v4, no backend yet.

**Start here, in order:**

1. `CLAUDE.md` — this branch's own engineering notes: conventions, the traps
   that have already cost someone time, and the branch workflow (`web_app` /
   `admin_cms` / `web_prod` / `mobile_app` / `storybook` are five branches of
   one repo, not five repos — see that file before touching git).
2. This file — where things live and how the pieces fit together.
3. `docs/FOR-AI-AGENT.md` if you're an automated agent, `docs/FOR-BACKEND.md`
   if you're about to wire this to a real API. Both assume you've read this
   file first and don't repeat it.

## Commands

```bash
npm install
npm run dev          # vite dev server, localhost:5173
npm run typecheck    # tsc -b — see the note below, this is not tsc --noEmit
npm run lint         # oxlint
npm run build        # typecheck + production build
npm run build:tokens # regenerate src/styles/tokens.css from design-tokens/figma-export.json
npm run preview      # serve the production build locally
```

**`npm run typecheck` runs `tsc -b`, not `tsc --noEmit`.** The root
`tsconfig.json` has `"files": []` and only wires up project references
(`tsconfig.app.json` for `src/`, `tsconfig.node.json` for `vite.config.ts`,
`tsconfig.api.json` for `api/`) — so `tsc --noEmit` on its own checks nothing
and exits clean on a broken tree. Always use the script. All three projects
run in `strict` mode.

There is no test runner configured. Verification here is typecheck, lint, a
production build, and driving the real app in a browser — see
`docs/FOR-AI-AGENT.md` for what "verify" means on this codebase in practice.

## Architecture, in one pass

```
src/
  App.tsx            Route table. Every consumer page is React.lazy() and
                      wrapped in Suspense (PageSkeleton); admin, auth and the
                      demo console load eagerly.
  main.tsx           Entry point: StrictMode > ErrorBoundary > BrowserRouter > App.

  pages/             One file per consumer screen (23) — Home, Chat, Explore,
                      Sessions, Profile, Player, the auth screens, etc.
  admin/             A second, self-contained app: its own layout
                      (AdminLayout), its own page set (15, admin/pages/),
                      its own mock data (admin/data/) and its own design
                      system (adm-* Tailwind classes, admin/admin.css) —
                      deliberately not the consumer app's tokens, since the
                      brief for /admin was always "an internal back office,"
                      not a themed extension of the product.

  components/
    ui/              Shared, cross-page primitives: Button, TextField,
                      CoinPill, SessionGridCard, PageSkeleton, ErrorBoundary,
                      PageMeta — one component per file.
    chat/             The cockpit's own parts (ChatHeader, ChatComposer,
                      ChatMessageItem, the recommendation deck, the voice
                      recorder) — specific to /chat, not reused elsewhere.

  layouts/
    AppLayout.tsx     The persistent shell around every signed-in consumer
                      route: sidebar on desktop, drawer on mobile, the
                      Suspense boundary lazy pages render into.
    DrawerContext.tsx Open/close state for that drawer, via context so any
                      page's header button can trigger it without prop
                      drilling through AppLayout.

  auth/
    AuthContext.tsx   Sign-in state — a boolean in memory, no persistence,
                      on purpose (see CLAUDE.md). Every load starts signed
                      out.
    RequireAuth.tsx   Route guard: redirects to /login and remembers where
                      you were headed.
    useSignInGate.tsx The softer version — for an action a signed-out
                      visitor can attempt (e.g. "Ask Aurelia" on Home) that
                      should detour through sign-in and then continue,
                      rather than blocking the whole page.

  chat/
    ChatSessionContext.tsx  The cockpit's state — messages, the draft
                      session, build progress, publish state — held *above*
                      the router (mounted in App.tsx, not ChatPage.tsx) so
                      leaving /chat to play a session and coming back
                      doesn't lose the thread.
  audio/
    AudioPlayerContext.tsx  Same pattern, for playback: also above the
                      router, so navigating away doesn't stop the audio.

  demo/
    modules.ts        The registry behind /__demo — what a walkthrough can
                      show, and the `unreleased: true` mechanism for
                      shipping something dark until it's ready to demo.
    FeatureFlags.tsx  Reads/writes that registry, syncs with `/api/config`
                      when configured, falls back to compiled defaults when
                      not.

  lib/                The mock "database" and its query functions — no
                      network, no persistence beyond localStorage/in-memory.
                      One file per domain (sessions/, challenges.ts,
                      credits.ts, notifications.ts, signals.ts, people.ts,
                      photos.ts, replies.ts, ...). `lib/sessions/` is split
                      into `data.ts` (types + the 26 records) and
                      `queries.ts` (findSession, sessionsOnShelf, publish/
                      unpublish, ...) precisely because that split *is* the
                      seam a real backend replaces — see
                      `docs/FOR-BACKEND.md` §1.1 for the full data model and
                      what each field means.

  styles/tokens.css   GENERATED — see "Design tokens" below. Do not hand-edit.
```

### State lives in four places, and it's deliberate which

| Where | What | Persists? |
| --- | --- | --- |
| `AuthContext` | signed in / out | No — resets on every load |
| `ChatSessionContext` | the cockpit's thread, draft, versions | Until reload (in-memory, above the router) |
| `AudioPlayerContext` | what's playing | Until reload (in-memory, above the router) |
| `FeatureFlagsProvider` | `/__demo` toggles | localStorage (draft) + `/api/config` (published) |

If you're adding state and reaching for a fifth context, ask first whether it
belongs in one of these four, or as a plain prop — a new context for every
feature is how six providers turn into twenty.

### Routing

React Router v6, one `<Routes>` tree in `App.tsx`. Three protection layers,
stacked in this order: `RequireAuth` (real gate — redirects to `/login`),
then `ModuleGuard` (a `/__demo` walkthrough-scoping gate, not security — see
`docs/FOR-BACKEND.md` §4 for what "not security" means for `/admin`
specifically). A route with neither is intentionally public (`/home`,
`/help`, the auth screens). The catch-all (`*`) renders `NotFoundPage`.

### Error handling

`ErrorBoundary` (`src/components/ErrorBoundary.tsx`) wraps the whole app in
`main.tsx`. It only catches render/lifecycle errors (React's own contract) —
not errors inside event handlers, effects, or async code, which is why
`FeatureFlags.tsx`'s `/api/config` calls and similar have their own
`try/catch`. There's no error-reporting service wired up yet; the boundary's
`componentDidCatch` just logs, with a comment marking where that call goes.

### Metadata

`PageMeta` (`src/components/PageMeta.tsx`) sets a page's `<title>` and meta
description using React 19's native support for hoisting `<title>`/`<meta>`
tags rendered anywhere in the tree — no Helmet-style library. It only reaches
clients that execute JavaScript; `index.html` carries the static fallback for
anything that doesn't (see the comment there, and `robots.txt`, for why this
whole app is `noindex`d for now).

## Design token sync

This is the part that stays true across every refactor above: every color,
spacing, radius, and type-scale value in this codebase is generated from
`design-tokens/figma-export.json`, a snapshot of the Figma file's variables
(`Aurelia Brand`, `Aurelia Primitives`, `Aurelia Semantic`, `Aurelia Numbers`,
`Aurelia Typography` collections).

```
design-tokens/figma-export.json   <- snapshot of Figma variables (source of truth)
        |
        |  npm run build:tokens  (scripts/build-tokens.mjs)
        v
src/styles/tokens.css             <- GENERATED, do not edit by hand
        |
        v
  Tailwind utility classes (bg-surface-default, text-text-primary, p-16, rounded-12, ...)
```

**When the design changes:** re-export the variables from Figma into
`design-tokens/figma-export.json` (same shape, keyed by collection -> group ->
name -> value), then run:

```bash
npm run build:tokens
```

No component code needs to change — class names like `bg-brand-default` or
`text-style-title` keep working because they read from the regenerated CSS
custom properties. This only breaks if a *variable is renamed or removed* in
Figma, in which case grep the old name across `src/` and swap it for the new
one (should be rare — semantic tokens are the layer meant to absorb this).
Every change to a variable, a token or the type scale gets logged in
`docs/DESIGN-SYSTEM-HISTORY.md` — read it before touching the pipeline.

**Not everything visual is in the token pipeline yet.** Effects (shadows) in
particular aren't exported from Figma — `src/lib/shadows.ts` is the one place
that spells out the shared card shadow rather than a Figma variable, exactly
because there's no `--shadow-*` token to read it from. If you're adding a
new shared visual value that Figma doesn't export, put it somewhere similarly
explicit (a small, purpose-named file in `lib/`) rather than redeclaring it
per page — that's how the shadow ended up copy-pasted into four files before
someone noticed they'd drift.

### Naming convention

CSS variable names mirror Figma variable paths 1:1 (`/` -> `-`):

- `Aurelia Semantic` -> `text/primary` -> `--color-text-primary` -> `text-text-primary` / `bg-text-primary` utility
- `Aurelia Primitives` -> `primary/400` -> `--color-primary-400` -> `bg-primary-400`
- `Aurelia Numbers` -> `radius/12` -> `--radius-12` -> `rounded-12`
- `Aurelia Numbers` -> spacing scale drives Tailwind's spacing multiplier directly
  (`--spacing: 1px`), so `p-16`, `m-24`, `gap-8` etc. equal their token value in px.
- `Aurelia Typography` -> named text styles (`Aurelia/Title`, etc.) are available
  as `className="text-style-title"` (see the generated classes at the bottom of
  `tokens.css`).

## What's mock, and what isn't

**Everything is mock data**, deliberately specific rather than "Lorem" so a
demo full of it can still be reasoned about — 26 sessions, cover art
hotlinked from Unsplash at runtime (a `photo` enum key, not a URL — see
`src/lib/photos.ts`), invented play counts and outcomes, an in-memory
publish/unpublish map, a keyword-matched reply engine (`src/lib/replies.ts`).
None of it is a placeholder waiting to be filled in; it's the whole product,
running frontend-only. **`docs/FOR-BACKEND.md` is the authoritative account**
of exactly what's mock, why each shape is the way it is, and the API surface
the clients already imply — read it before assuming something here is
unfinished rather than intentional.

## The other documents

| File | For | What it holds |
| --- | --- | --- |
| `CLAUDE.md` | anyone working on this branch | Conventions, the branch workflow, and the traps that have already cost someone time — read first. |
| `docs/FOR-BACKEND.md` | a backend engineer | Every data shape the clients model, the endpoints they imply, what's mock, and the decisions backend work is blocked on. |
| `docs/FOR-MOBILE.md` | a mobile engineer | The Flutter client (`mobile_app` branch) in detail. |
| `docs/FOR-PRODUCT.md` | a product manager | What works, what only looks like it works, and the open questions. |
| `docs/FOR-AI-AGENT.md` | an automated agent | Cold-start orientation: the facts that invalidate the obvious approach, and how to verify honestly. |
| `docs/PRD.md` | everyone | Requirements and the "why" behind behaviour that looks arbitrary in the source. |
| `docs/DESIGN-SYSTEM-HISTORY.md` | anyone touching tokens | Every token change logged, and the standing decisions behind the odd-looking ones. |
| `docs/CHANGE-LOG.md` | anyone asking "did branch X get this yet" | Every change, on every branch, in the same commit as the change. |

## Known gaps

Tracked in `docs/PRD.md` as the source of truth (P0/P1/P2), not repeated in
full here — but the two that most affect how you work in this codebase:

- **`/admin` has no authentication.** `ModuleGuard` (demo-flag scoping) is
  not a security boundary; every admin module is reachable by URL today.
- **No automated tests.** Verification is typecheck + lint + build + manual
  browser checks. Adding a test framework is a real decision (which one,
  what it covers first) worth making deliberately rather than as a side
  effect of an unrelated change.
