# Aurelia — web client

Context for anyone (human or AI) reading this code for the first time. It covers
what is here, the decisions that are not obvious from the source, and the things
that will mislead you if nobody tells you.

**This branch is the React app.** The repository keeps one app per branch:

| Branch | What is on it |
| --- | --- |
| `web_app` | This app — the consumer web client *and* the admin CMS. **Work happens here.** |
| `admin_cms` | **Deliberately identical** to `web_app` |
| `web_prod` | The production cut — `web_app` as of the last time someone asked to ship |
| `mobile_app` | The Flutter app |

`admin_cms` exists as a name for a workstream, not as different code. Keep them
identical: commit on `web_app`, then `git checkout admin_cms && git merge
--ff-only web_app`, and push both. A divergence between them is a mistake, not
a feature.

**`web_prod` is different in kind: it is allowed to be behind.** `web_app` is
the staging branch and every commit lands there first; `web_prod` moves only
when somebody asks for it, by fast-forward:

```bash
# On web_app first, if the release gets a new number:
#   bump "version" in package.json, commit, push web_app + admin_cms
git checkout web_prod && git merge --ff-only web_app && git push -u origin web_prod
git checkout web_app
```

`package.json`'s `version` is the release name and nothing bumps it for you.
It is shown throughout the app beside the commit precisely because it is the
one fact here a human maintains: the version is what a release was *called*,
the short SHA is what it *is*. If they disagree, believe the SHA.

Never commit on `web_prod` directly — a commit there is a divergence that the
next fast-forward will refuse, and the fix is a merge nobody wanted. If
`--ff-only` fails, that has already happened; stop and say so rather than
forcing it. **Do not push it because the work looks finished.** Standing
instruction from the product owner: production moves on request, not on
judgement.

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
  pages/        one file per consumer screen (22)
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

**The Figma text styles are on Mulish too, and there are sixteen of them.** All
13 `Aurelia/*` styles used to hard-set SF Pro and bind only size and
line-height, so the family variable governed nothing; they now bind
`fontFamily` and `fontWeight` as well. Three were added — `Label Regular`,
`Title Large Regular`, `Headline Regular` — because the library had those
*sizes* but not those *weights*. The snapshot had only 9 of them; it now carries
all 16 and `tokens.css` emits a class for each. The four Light variants are
still composed in code as `text-style-caption font-light!` where that reads
better; the named classes are additive, not a replacement.

**Every change to a variable, a token or the type scale is logged in
`docs/DESIGN-SYSTEM-HISTORY.md`** — what changed, why, and the standing
decisions behind the odd-looking ones. Read it before touching the pipeline, and
append to it after. It also lists the colours that have no variable yet
(`#FF881B`, the brand orange, among them) so they are not rediscovered a fourth
time.

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

**Everything is mock data and it is meant to look real.** `src/lib/` holds 26
sessions, two challenges, a notification feed and six signal sources. The figures
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

**Staging and production keep separate flag sets, and that took work.** One
Upstash store sits behind every deployment of the project, so the original
single key `aurelia:demo:config` would have meant pressing Publish on staging
changed what the public site shows — the opposite of why staging exists.
`api/config.ts` now derives its key from `VERCEL_ENV`: production keeps the
bare key (so everything published before the split stayed put) and every other
deployment appends its branch, `aurelia:demo:config:web_app`. `/__demo` prints
the key the server reported next to the sync indicator, so which one Publish is
about to write is never a guess. **The two flag sets do not sync** — publishing
a scope on staging and expecting production to follow is the mistake this
design makes possible; do it twice, deliberately.

**`/player-beta/:slug` is a `/__demo` flag (`player.beta`), not a route with
its own link anywhere in the app.** It started as a Settings preference and
was moved into `/__demo` on request — if you find a comment or an old commit
calling it a "user preference," that predates the move. If a screen never
shows this route and you go looking for what links to it, check the mini
player and the attached-session card in chat: both redirect there instead of
`/play/...` only while `player.beta` is on (`playerHref()` in
`src/lib/playerBeta.ts` does the rewrite). `/play/:slug` itself also redirects
to `/player-beta/...` when the flag is on — reached any way other than the
beta page's own "open full player" link, which deliberately carries router
state (`skipBeta: true`) so tapping it does not immediately bounce back. A
direct link to either route with the flag off lands on `/play/...`, which is
intentional, not a bug in the route guard.

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

**One rule per gap.** A section's spacing belongs to the section's own
`mt-*`, not to a parent's `pb-*` as well. Home had 92px between Quick Start and
the banner because a scroller's `pb-4`, a column's `pb-40` and the banner's
`mt-48` all set the same gap — and 92 appeared nowhere in the source, so there
was nothing to correct against the frame. If a gap will not match Figma, check
whether it is being set twice before changing the number you can see.

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

**"I pushed that and I cannot see it" is usually the deploy, not the code.**
`/__demo` opens with a **This build** panel — environment, commit, branch, and
when it was built — so the question is answerable from the page. If the commit
is behind the branch you pushed, the *deployment* is behind and clearing a cache
will not help. If it matches and a screen still looks old, it is the browser.

Since there are two sites, the panel leads with **Environment** — `Production`,
`Staging` or `Local`, read from `VERCEL_ENV` at build time — because the two are
identical from a screenshot and "it is not live yet" and "you are looking at
staging" have the same symptom. Set `VITE_PRODUCTION_URL` and
`VITE_STAGING_URL` on both Vercel projects and each panel grows a link to the
other; leave them unset and the link is simply absent, which is right for a
project with one deployment.

**The same answer is in the app, not only in the console.** `BuildBadge` —
`Staging · 0.1.0 · d135f24` — sits at the foot of the consumer drawer, at the
foot of the admin sidebar, and in the `/__demo` header. All of it comes from
`src/lib/build.ts`, the one place that reads the injected constants; nothing is
inferred from the hostname, because a custom domain, a branch alias and a
preview URL all resolve to the same deployment and guessing from any of them is
how a badge ends up confidently wrong.

**The badge does not link to `/__demo`, and must not.** That console sits
outside the password so nobody can shut themselves out of the switch, which
makes its URL a way around the gate — linking it from the drawer would hand
that to every visitor. Staging gets the loud brand chip and production a quiet
grey one: production is the normal state of affairs, and being on the rehearsal
copy without noticing is the mistake worth interrupting for.

`vercel.json` sends `index.html` with `must-revalidate` and `/assets/*` as
`immutable`, so a browser can no longer pin itself to an old build. **That file
takes no comments of any kind** — Vercel validates it against a strict schema
and rejects unknown keys, so a `"comment"` field inside a `headers` entry fails
the build with `should NOT have additional property`. It has happened once.
Explain the config here instead.

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

## The other documents

`CLAUDE.md` is the short, authoritative version for engineering conventions on
this branch. Four longer documents sit beside it in `docs/`, each written for
one reader and kept identical on all three branches:

| File | For | What it holds |
| --- | --- | --- |
| `docs/FOR-BACKEND.md` | a backend engineer | Every data shape the clients already model, the endpoints they imply, what is mock, and the six decisions the backend is blocked on. |
| `docs/FOR-MOBILE.md` | a mobile engineer | The Flutter client at length: toolchain, running on an emulator and a real iPhone, the architecture and why, and every trap with the symptom it produces. |
| `docs/FOR-PRODUCT.md` | a product manager | What works, what only looks like it works, the decisions already made and their reasons, the undesigned states, and the open questions. |
| `docs/FOR-AI-AGENT.md` | an automated agent | Orientation for a cold start: the four facts that invalidate the obvious approach, the standing rules, and how to verify honestly. |

`docs/PRD.md` remains the requirements document and
`docs/DESIGN-SYSTEM-HISTORY.md` the token log. Update the relevant one in the
same commit as the change.

**`docs/CHANGE-LOG.md` is a fifth, and it is not optional.** Every change, on
any of the four branches, gets an entry — what changed and which branch(es)
it actually reached, in the same commit. `web_prod` moves only on request and
is expected to run behind; `web_app` and `mobile_app` do not diverge from
each other for long without a reason, and this is the file that says whether
one currently does. Skipping it is how "did mobile get the thing web has"
turns back into a question nobody can answer without diffing four branches by
hand — which is exactly how `mobile_app`'s `PRD.md` was found to have quietly
drifted two sections behind.

---

## Where the product decisions live

Behaviour that looks arbitrary in the source usually is not — the reasoning is
in `docs/PRD.md`. Two examples: the sign-in ask lands on send rather than on the
first keystroke, and the password-reset confirmation must not reveal whether an
address is registered. If you are about to change one of those, read the entry
first.
