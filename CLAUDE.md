# Aurelia — web client

Context for anyone (human or AI) reading this code for the first time. It covers
what is here, the decisions that are not obvious from the source, and the things
that will mislead you if nobody tells you.

**This branch is the React app.** The repository keeps one app per branch:

| Branch | What is on it |
| --- | --- |
| `web_app` | This app — the consumer web client *and* the admin CMS |
| `admin_cms` | **Deliberately identical** to `web_app` |
| `mobile_app` | The Flutter app |

`admin_cms` exists as a name for a workstream, not as different code. Keep them
identical: commit on `web_app`, then `git checkout admin_cms && git merge
--ff-only web_app`, and push both. A divergence between them is a mistake, not
a feature.

---

## Running it

```bash
npm install
npm run dev          # vite, port 5173
npm run typecheck    # tsc -b
npm run lint         # oxlint
npm run build        # tsc -b && vite build
```

React 19, Vite, TypeScript, Tailwind CSS v4. No test runner is configured —
verification here is typecheck, lint, and driving the real app in a browser.

**`npm run typecheck` runs `tsc -b`, not `tsc --noEmit`.** The root `tsconfig`
has `"files": []` and delegates to project references, so `tsc --noEmit` checks
nothing and passes on a broken tree. Use the script.

---

## Layout

```
src/
  pages/        one file per consumer screen (15)
  admin/pages/  one file per admin module (15)
  components/
    chat/       the cockpit's own parts
    ui/         everything shared
  layouts/      AppLayout (drawer + shell), AdminLayout
  lib/          the catalogue and its helpers — no network, no database
  auth/         AuthContext + useSignInGate
  demo/         the /__demo feature-flag console
  styles/       tokens.css — GENERATED, see below
```

---

## Design tokens are generated — do not edit `tokens.css`

```
design-tokens/figma-export.json     <- snapshot of the Figma variables (source of truth)
        |  npm run build:tokens
        v
src/styles/tokens.css               <- GENERATED
        v
  Tailwind utilities (bg-surface-default, text-text-primary, p-16, rounded-12, …)
```

When the design changes, re-export the variables into `figma-export.json` and
run `npm run build:tokens`. Editing `tokens.css` by hand means the next export
silently reverts you.

`figma-export.json` was audited against the live variables (251 across five
collections) and matched everywhere except one entry — spacing, radius, size,
padding/margin, the 12-step type scale with its line-heights, the weights, the
letter-spacing and all 33 semantic colours were already identical. The
exception was `font-family/base`, which the export had as "SF Pro" where the
variable says **Mulish**; that is fixed and the app now loads Mulish.

**`radius/20` and `radius/48` are not variables — in Figma either.** Several
frames use them as raw values, so `rounded-[20px]` and `rounded-tl-[48px]` are
correct rather than a workaround. Do not "fix" them by inventing tokens; that
is a design decision, not a sync gap.

**Two Tailwind v4 traps this codebase has actually hit:**

- **`--spacing: 1px`**, so numeric utilities map 1:1 to pixels — `p-16` is 16px,
  not 4rem. Read every number here as px.
- **The radius scale is closed**: 0/2/4/8/12/16/24/32/full. `rounded-6`,
  `rounded-10` and `rounded-20` are not classes; they render **square, silently**.
  Eleven elements were doing exactly that before anyone noticed.
- **v4 orders utilities by its own layers, not by string order**, so a `w-full`
  baked into a component beats a caller's `w-[228px]`. If a width is ignored,
  this is why.
- **`rotate-*` sets the standalone CSS `rotate` property**, not `transform`. A
  probe reading `transform` will report no rotation on an element that is
  plainly rotated.

---

## The things that will mislead you

**Everything is mock data and it is meant to look real.** `src/lib/` holds 21
sessions, a challenge, a notification feed and six signal sources. The figures
in them — play counts, "−43% stress" — are invented. They are deliberately
specific because a demo full of "Lorem" cannot be reasoned about, but nothing
here came from a measurement.

**Cover art is hotlinked from Unsplash at runtime.** Every card layers a photo
over a token gradient, and the gradient is the floor, not a fallback. **A page
rendering as flat gradients has no network; it is not broken.**

**Sign-in does not persist, on purpose.** `AuthContext` holds a bool in state
with no localStorage. Every load starts signed out so the app opens on the case
for itself. Right while the data is mock, wrong once an account holds history —
a setting with an expiry date, not the session model.

**Flag changes are local until you Publish.** `/__demo` keeps a local draft in
localStorage *and* a published set in Upstash KV via `/api/config`. Toggling
something — the site lock included — changes only your browser until you press
Publish for everyone. Without `KV_REST_API_URL` + `KV_REST_API_TOKEN` the
endpoint reports `configured: false`, Publish is disabled, and every visitor
falls back to the defaults compiled into `modules.ts`.

**`/api/config` is unauthenticated.** Anyone who finds it can POST a new flag
set, the site lock included. Narrow by design — it only stores booleans — but
it is another reason the lock is a courtesy and not a control.

**`/__demo` is a feature-flag console, and flags persist in localStorage.** If a
screen or a control is missing and the code plainly renders it, check the flags
before debugging the component. `src/demo/modules.ts` is the registry; `built:
false` means there is nothing behind it, `unreleased: true` means built but
switched off.

**A shared password sits in front of the site, but not in front of `/__demo`.**
The console that owns the switch stays open so nobody can shut themselves out of
it — which also means that URL is a way around the lock for anyone who knows it.
The lock defaults **on** and has to: a gate that fails open on a first load or an
unreachable flag store is not a gate.

**The lock is not security, and nothing behind it should depend on it being
one.** The check runs in the browser and the password is inlined into the
JavaScript bundle, so anyone willing to open devtools can read it or skip the
gate. It exists to stop strangers wandering into unfinished work and filing
feedback on things already known and already scheduled. `VITE_SITE_PASSWORD`
overrides the default and keeps it out of git — not out of the bundle.

**This app is the reference implementation for the Flutter client.** Where the
two disagree, this one is right and the other changes. If you alter a shared
shape — the type scale, the 20px page gutter, a brand vector — the mobile app
has to follow, and the vectors are shared as the same SVG path strings rather
than re-traced.

---

## Conventions worth keeping

**`.u-tap` widens a small target with a pseudo-element**, so an audit that
measures element boxes will report a 16px link as too small when it is not.
Verify by clicking above the box, not by reading its height.

**Absolutely positioned covers paint over normal-flow content.** `CoverImage`
fills its parent, so anything meant to sit on top needs `relative`. A card title
once vanished this way while its siblings looked fine, because `opacity-90`
happened to promote them.

**Grid and flex children default to `min-width: auto`.** A wide child (a chart,
a table) will stretch its column rather than scroll inside it. `min-w-0` on the
item is the fix; `/admin/revenue` overflowed 250px for exactly this reason.

**Sheets and modals must render through a portal.** `.u-page` animates with a
transform, and a transformed ancestor becomes the containing block for
`position: fixed` — so a `fixed inset-0` overlay inside a routed page is pinned
to the *page box*, not the viewport. On a viewport-height screen like the
cockpit this is invisible; on a long scrolling page the sheet lands at the
bottom of the document. Measured at `y=1710` in an 874px viewport before
`createPortal` was added.

**Do not run Prettier on this repo.** There is no config, so it would reformat
the whole tree to double quotes and semicolons and bury the next diff.

---

## Known gaps

- **`/admin` has no authentication at all.** Every module is reachable by URL.
  This is the P0 in `docs/PRD.md` and it is in the code, not just the document.
- No backend. Both clients are frontend-only.
- No automated tests. The responsive and interaction checks in this project's
  history were one-off Playwright scripts, not a suite.
- ~~Sign-out is unreachable from anywhere in the UI.~~ Fixed: it lives on
  `/settings`, reached by the gear on your own profile.

---

## Where the product decisions live

Behaviour that looks arbitrary in the source usually is not — the reasoning is
in `docs/PRD.md`. Two examples: the sign-in ask lands on send rather than on the
first keystroke, and the password-reset confirmation must not reveal whether an
address is registered. If you are about to change one of those, read the entry
first.
