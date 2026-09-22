# Storybook — the component catalogue

Why this branch exists: `src/components/` (32 files — 18 in `ui/`, 13 in
`chat/`, plus `SiteLock`) is what every screen on `web_app` is built from,
and nothing showed them side by side. A design drift — two buttons at
slightly different radii, a card that quietly stopped using the shared
`Chip` — is easy to miss screen by screen and obvious the moment two
instances sit next to each other. That is what this branch is for.

---

## Running it

```bash
npm install
npm run storybook          # dev server, port 6006
npm run build-storybook    # static build, to storybook-static/ (gitignored)
```

Same Node toolchain as `web_app` — nothing here needs Flutter or a different
Node version. `npm run typecheck` and `npm run lint` also cover every
`*.stories.tsx` file; run them before committing, same as on `web_app`.

---

## What's here that `web_app` doesn't have

```
.storybook/
  main.ts            addons, the stories glob, staticDirs, and the
                      viteFinal that stubs __BUILD_ID__ etc. (see below)
  preview.tsx         the global decorator every story renders inside,
                      and the Mulish <link> in preview-head.html
  preview-head.html    the same Google Fonts <link> index.html carries —
                      Storybook renders its own document, so index.html's
                      own <head> never reaches a story
src/components/**/*.stories.tsx   one file beside every component
```

Nothing in `src/` itself changed except the addition of those
`*.stories.tsx` files — this branch is `web_app` plus a catalogue, not a
fork of the app.

### The global decorator

Every real screen sits under `Router → Auth → AudioPlayer → ChatSession →
FeatureFlags` (see `src/main.tsx`). A component that calls `useAuth()` or
renders a `<Link>` would otherwise throw the moment its story tries to
render — not with an error that names the missing piece, just a blank
canvas and a React error about context. `.storybook/preview.tsx` wraps
every story in the same stack (`MemoryRouter` in place of `BrowserRouter`,
since Storybook's own iframe URL is not this app's routing) so a story can
just import a component and render it.

### The stubbed build constants

`BuildBadge`/`BuildStamp` read `__BUILD_ID__`, `__BUILD_ENV__` and friends
as bare identifiers — defined by `web_app`'s own `vite.config.ts` at build
time. Storybook runs its own Vite instance and never reads that file, so
without `main.ts`'s `viteFinal` block, any story importing either component
throws `ReferenceError: __BUILD_ID__ is not defined` before it renders.
The stub values all read `"storybook"` / `"local"` rather than anything
that claims to be a real commit.

### No outbound network in this sandbox

Every `CoverImage`/`PhotoCircle` story hotlinks Unsplash, the same as the
real app — and the same as `web_app`'s own note in its `CLAUDE.md`, **a
story rendering as a flat gradient has no network, it is not broken**. It
was verified once, in an environment with no outbound access to
`images.unsplash.com`, and every story still rendered on its gradient
floor. Verify visually where it matters; a blocked photo is not a sign
anything here is wrong.

---

## The convention: keep this branch in step with `web_app`

Unlike `admin_cms`, this branch cannot be a `--ff-only` mirror — it carries
real code of its own (`.storybook/`, every `.stories.tsx` file) that
`web_app` does not have. It merges *from* `web_app`, not the other way:

```bash
git checkout storybook
git merge web_app        # not --ff-only — this branch has its own commits
# resolve conflicts if a component `web_app` changed also has story-file
# context nearby (rare — stories live in their own files); most merges
# here are clean
npm run typecheck && npm run lint && npm run build-storybook
git push
```

**When to do it:** whenever `web_app` gains or changes a component that
would make this catalogue misleading — a new one with no story at all, or
an existing one whose props changed enough that its story no longer
compiles. `npm run typecheck` after a merge is what catches the second
case; it will not catch the first on its own, so treat "does every file in
`src/components/` have a matching `.stories.tsx`" as a real check, not an
assumption:

```bash
comm -23 \
  <(find src/components -name "*.tsx" ! -name "*.stories.tsx" -exec basename {} .tsx \; | sort) \
  <(find src/components -name "*.stories.tsx" -exec basename {} .stories.tsx \; | sort)
```

Empty output means every component has a story. Anything it lists is a gap.

**Writing a new story:** copy the shape of a similar existing one rather
than starting blank — `Button.stories.tsx` for a simple presentational
component, `AddSheet.stories.tsx` or `CategorySheet.stories.tsx` for one
that needs local state a plain `args` object can't hold, `MiniPlayer.
stories.tsx` for one that reads a context directly instead of taking props.
Use real fixture data where it exists — `findSession('dolphins-frequency')`
from `lib/sessions.ts`, `RECOMMENDATIONS` from `chat/ChatSessionContext.tsx`
— rather than inventing parallel copy that can drift from what the app
actually ships.

**What this branch does not do:** it does not get `web_prod`'s or
`mobile_app`'s treatment — nothing merges back from it, and
`docs/CHANGE-LOG.md` tracks it the same as any other branch-specific change
but does not expect it to "catch up" to anything. It exists to be read, not
shipped.
