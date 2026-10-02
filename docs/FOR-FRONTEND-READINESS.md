# Aurelia — frontend readiness for a running product

Written for whoever has to answer "what does the frontend need before this is
a real product, not a demo?" — a PM sequencing work, or an engineer picking up
the next ticket. It is not a wishlist; every item below is tied to a specific
gap in the code as it stands today, not a generic pre-launch checklist copied
from somewhere else.

> **Status** Written 2 Oct 2026 against `web_app` @ `0bf084e`. Kept identical
> on `web_app` and `admin_cms` the way the other `docs/FOR-*.md` files are.

---

## 0 · The frame

Every screen in this app — consumer and admin — reads from a `const` array
compiled into the bundle, or (in the three admin modules that now have
mutations) a React context seeded from that same array. Nothing fetches,
nothing can fail, nothing is ever "not here yet." That is exactly right for a
demo and it is why the FE work below is not a backlog of nice-to-haves: it is
the set of things that have **no code path at all** today and will need one
the moment a real network request sits where a `const` sits now.

The organizing question for everything below is the same one `AuthContext`
already answers honestly for sign-in state: *this is a decision with an
expiry date, not a permanent design* (CLAUDE.md says this almost verbatim
about sign-in persistence — the same sentence applies to nearly every other
piece of mock state in the app).

---

## 1 · There is no data-fetching layer, anywhere

Every page does one of two things:

```ts
import { SESSIONS } from '../lib/sessions'       // consumer — a straight const
const { users } = useAdminData()                  // admin — context, still sync
```

Neither has a concept of loading, error, retry, or staleness, because neither
has ever needed one — the data has always already been there, synchronously,
since before the component existed. **This is the single largest gap.** Every
screen in both the consumer app and the admin CMS needs new UI it does not
have today: a loading state, an error state, and a decision about what
"empty" means versus "still loading."

**`src/admin/data/AdminDataContext.tsx` is the template to generalize, not a
one-off.** It already isolates every mutation behind a named function
(`setUserRole`, `saveSession`, `saveChallenge`, …) rather than inline
`setState` calls scattered through JSX — built that way specifically so a
real backend call replaces the function body without any page needing to
change. What it does *not* yet model is the asynchronous part: none of those
functions can fail, take time, or need a loading flag, because today they
don't. The honest next step is not "add a backend" — it's "make this context
behave as if the functions were already async," so the loading/error seam
gets built and tested against mock data before it has to also absorb a real
network's unreliability at the same time.

**Concrete recommendation:** adopt a fetching library (TanStack Query or SWR)
now, wrapping today's synchronous mock reads in a resolved `Promise` and
today's mutations in the same shape `AdminDataContext` already uses. This
costs almost nothing today — the mock functions still just return the array —
but it means every "is this loading," "did this fail," "is this stale"
question gets answered once, by the library, instead of once per screen,
later, under deadline, when a real API is already live and every screen is
guessing differently.

---

## 2 · Auth and session: currently a boolean with an expiry date

`AuthContext` holds `signedIn` in React state, with no persistence, by
design — "every load starts signed out" is explicitly documented as correct
*for a demo on mock data* and explicitly wrong *once an account holds real
history* (CLAUDE.md says this outright). `RequireAuth` is four lines: no
token, no expiry, no refresh — it reads the boolean and redirects.

None of that is a bug today. It is a list of things that do not exist yet and
will each need a real design before launch:

- Where the session lives (httpOnly cookie vs. a token the FE holds) — this
  is a security decision as much as an FE one, and it decides whether
  `AuthContext` becomes a context around a cookie-backed session check or
  around a token the FE refreshes itself.
- Silent refresh before expiry, and what the UI does if refresh fails mid-session
  (today: nothing can fail mid-session, because nothing is a request).
  "Log out everywhere" has a UI already (`/settings`) but nothing behind it.
- SSO is a seam, not an implementation: `DummySsoProvider` returns a fixed
  account after ~900ms (per `docs/FOR-BACKEND.md` §3). The FE's OAuth
  redirect/popup handling, error states (`cancelled` / `network` /
  `rejected` are already typed) and token exchange are unbuilt.

**The one item here that is already a P0, independent of a backend:**
`/admin` has no authentication of any kind — every module, including the
ones with real write actions now (Users, Sessions, Challenges), is reachable
by typing the URL. This has been flagged in `docs/PRD.md` and
`docs/FOR-BACKEND.md` since before this session's work, and it is a FE
route-guarding problem the FE can start closing today, independent of
whether a real backend exists yet — the same way `SiteLock` already gates the
whole consumer app with a client-side check that is explicitly *not* real
security but *is* a real deterrent against wandering in. `/admin` has no
equivalent today, and it is the one place on this list where "we'll wait for
the backend" is not a defensible sequencing choice, because the admin
screens already let someone suspend a user or unpublish a session by URL
alone.

---

## 3 · Loading / error / empty states are a missing state space, not a missing feature

`docs/PRD.md` §07 names "generation has no failure state designed" as the
top gap for the cockpit specifically. The same gap exists on every other
screen, just unnamed: Explore, Sessions, Challenges, Notifications, My
Wellness, the whole of `/admin` — none of them have ever had to render "the
request is taking a while" or "that didn't work, try again." `PageSkeleton`
exists today, but only for the *route itself* taking time to download its JS
chunk (the `Suspense` boundary in `AppLayout`), never for data inside an
already-loaded page.

Building the fetching layer in §1 forces this question for every screen at
once, which is the right time to answer it once — a shared skeleton
component, a shared inline error+retry affordance, a documented rule for
when "no rows" means "really empty" versus "still loading" (SESSIONS vs.
`morning-light`'s deliberately-empty challenge in the current mock data
already shows the product has opinions about real empty states; the FE needs
the same opinion about *failed* and *loading* states, which don't exist in
the mock catalogue because nothing in it can fail).

**Offline is a related, currently unanswered question.** This is a
meditation app plausibly used on a commute or at home with patchy wifi, and
there is no offline detection, no request queue, no service worker — not
necessarily wrong, but currently undecided rather than decided-against.

---

## 4 · The image pipeline is the most likely "it broke in production" surprise

Every cover photo is hotlinked from Unsplash at request time
(`src/lib/photos.ts` maps a `photo` enum to an Unsplash photo id), with the
token gradient as a deliberate fallback — documented, and fine for a demo.
In production this is several problems at once that are each pure FE work
once decided:

- No control over availability — an Unsplash outage or a removed photo
  becomes a real-user-facing broken image, not a gradient (the current
  fallback only covers *no network*, not *this specific photo id 404s*).
- No responsive variants — the same full-size hotlink serves a 44px avatar
  and a full-bleed hero, which is wasted bandwidth on exactly the connection
  profile (mobile, on the go) this product's own users are most likely to have.
- Licensing/rate-limit exposure at real scale, already flagged in
  `docs/FOR-BACKEND.md` §6 as inherited debt, not a design choice.

This needs a decision (own CDN + upload/resize pipeline, or a service like
Cloudinary/Imgix) before real content exists, because the `photo` enum
contract (`CoverKey`) is the seam both the FE and whatever backend owns
asset storage need to agree on — deciding it late means redoing every
`CoverImage` call site instead of just its implementation.

---

## 5 · Zero automated test coverage

CLAUDE.md states this plainly: "No test runner is configured — verification
here is typecheck, lint, and driving the real app in a browser," and "the
responsive and interaction checks in this project's history were one-off
Playwright scripts, not a suite." That has been true for every verification
in this session too — the Playwright scripts written to confirm the admin
Challenges/Sessions/Users work this session live in a scratch directory and
disappear with the container, not in the repository.

This is sustainable exactly as long as one person (or one AI session) can
manually click through the whole app before every change — which stops being
true the moment there is a real team, a real backend to integrate against,
or real users whose data a regression can corrupt. Concretely:

- **Stand up Vitest + React Testing Library** for component-level tests —
  currently nothing exists to add tests *to*, which is the actual blocker,
  not test-writing effort.
- **Convert the throwaway verification scripts into a checked-in E2E suite**
  (Playwright, run in CI) for the highest-stakes flows specifically: sign-in,
  publish/unpublish, challenge join, consent toggles on My Wellness, and
  anything in `/admin` that mutates a user. This product is explicitly
  mental-health-adjacent and already carries documented compliance weight
  (`docs/FOR-BACKEND.md` §7) — an untested regression in a consent flow is a
  compliance incident, not just a bug.

---

## 6 · Admin's bundle is not code-split, and it just grew

`src/App.tsx` lazy-loads every consumer page (`const ChatPage = lazy(() =>
import(...))`) specifically so each becomes its own chunk, with
`PageSkeleton` covering the download. Every admin page is imported eagerly
instead — all 18 modules, including the three added this session, ship in
the same bundle as the admin shell regardless of whether a given admin user
ever opens anything but Dashboard. This was already true before this
session; it is more true now, and it will keep compounding as the admin
surface keeps growing the way it has in just the last few turns of this
project. There's no bundle-size budget or CI check today either, so nothing
would currently notice if this got worse.

---

## 7 · No observability — the first sign of a real bug will be a support ticket

No error tracking, no analytics, no Web Vitals / performance monitoring
exists anywhere in the dependency list or the code. Today, "did that work?"
is answered by a human watching the screen (an AI session running Playwright
and reading its own console output, for the verification done in this
session). Once real users exist, that stops being how anyone finds out
something broke. This is cheap to add early (a Sentry-equivalent has no
backend dependency) and expensive to retrofit after the first unreported
incident.

---

## 8 · Config/secrets maturity — good precedent, not yet a convention

The feature-flag store (`/api/config`, Upstash, scoped by `VERCEL_ENV`) and
the site lock (`VITE_SITE_PASSWORD`, kept out of git on purpose) are both
genuinely well-reasoned patterns — staging/production flag separation in
particular solved a real problem carefully. What doesn't exist yet is a
*general* convention for the next environment variable: no `.env.example`,
no documented naming scheme, no stated rule for "secrets never reach the
client bundle" beyond the site lock's own explicit acknowledgment that it
doesn't. Worth writing down once, before a real API base URL or API key is
the next thing that needs adding.

---

## 9 · Mobile parity is a standing process cost, not a one-time task

CLAUDE.md is explicit that this app is the Flutter client's reference
implementation, and `docs/CHANGE-LOG.md` exists specifically because "web_app
and mobile_app do not diverge from each other for long without a reason" —
and because mobile's own `PRD.md` was once found to have quietly drifted two
sections behind. That log is a *passive* record: it says what happened, but
nothing stops a change from shipping to `web_app` without the matching
`mobile_app` ticket ever getting filed. As web's rate of change increases
(this session alone shipped five admin modules and two cross-cutting data
fixes), the parity gap compounds unless there's an active forcing function —
worth considering a lighter-weight shared contract (shared JSON/constants
for the type scale, the photo enum, the vector path strings) over the
current pattern of two hand-maintained copies in TS and Dart.

---

## 10 · Where to start, in order

Given everything above, this is the sequencing that front-loads the highest
risk and the cheapest fixes, and defers the items that are genuinely blocked
on a product decision someone else owns:

1. **Gate `/admin`.** Independent of a backend — a `SiteLock`-style password
   gate (explicitly a deterrent, not real security, exactly like the one the
   consumer app already has) closes the P0 that exists *today*, with modules
   that now actually mutate data.
2. **Lazy-load the 18 admin pages**, the same way the 22 consumer pages
   already are. Mechanical, zero behavior change, same pattern already
   proven in this codebase.
3. **Wrap today's mock reads/writes in TanStack Query (or SWR).** Zero
   behavior change today; it is what makes every later item on this list
   tractable, because it is the one place "loading / error / stale" gets
   decided instead of guessed per screen.
4. **Stand up Vitest, and promote the next Playwright verification script
   into a committed CI test** instead of a scratch-directory throwaway —
   starting with sign-in, publish/unpublish, and one admin mutation flow.
5. **Wire basic error tracking.** No backend dependency, immediately useful,
   cheap.
6. **Decide the image pipeline.** This one is not FE-only — it needs a
   backend/asset-storage answer before the FE work can start, so it should
   be raised now rather than discovered at launch.
7. **Write down the env/secrets convention** before the next real API key
   needs a home.

Items 1–5 need no decision from anyone else and can start immediately. Item 6
needs a backend-side answer first. Item 9 (mobile parity tooling) is worth
raising with whoever owns the Flutter side rather than solved unilaterally
from the web branch.

---

## Where this fits among the other documents

This is the fifth `docs/FOR-*.md` file, alongside `FOR-BACKEND.md`,
`FOR-MOBILE.md`, `FOR-PRODUCT.md` and `FOR-AI-AGENT.md` — same rule: kept
identical on `web_app` and `admin_cms`, updated in the same commit as
whatever changes what it describes.
