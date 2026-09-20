# Aurelia — for a product manager

What the product is, what actually works, what only looks like it works, and
what has to be decided before any of it can ship.

`docs/PRD.md` is the requirements document and stays authoritative. This is the
orientation around it: the state of play, the shape of the decisions, and the
things that will surprise you in a demo.

> **Status** Written 20 Sep 2026 against `mobile_app` @ `e4fc580` and
> `web_app` @ `4dfaa4b`.

---

## 1 · What Aurelia is, in one screen

A wellness app where **you do not browse a library — you describe what you need
and the app builds a session for it**, then you can publish it so other people
can play it or fork it into their own version.

Three things follow from that sentence, and they are the whole product:

1. **The cockpit is the product.** A chat screen where you say "I can't sleep"
   and get a session back. Every other screen exists to feed it or to show what
   it produced.
2. **Sessions have provenance.** Every one traces back through a lineage chain
   to an Aurelia starter template. Forking someone's session keeps them
   credited, and the coin split follows the chain.
3. **The community is the catalogue.** There is no editorial library. Shelves
   are what people made.

---

## 2 · What exists right now

### 2.1 Two clients, one design

| | Web | Flutter |
| --- | --- | --- |
| Consumer app | ✅ | ✅ |
| Admin CMS | ✅ 15 modules | — |
| Audio playback | ✅ | ✅ |
| Voice input | ✅ | ✅ (real microphone) |
| Google / Apple sign-in | ✅ paths, dummy behind | ✅ paths, dummy behind |

The web app is the reference implementation. Where the two disagree, the web is
right and the Flutter app changes. That is a rule, not a preference: it is the
only way two codebases stay in step without a third document arbitrating every
pixel.

### 2.2 Consumer screens (both clients)

Home · Explore · Sessions · See All · Session detail · Recreate · Player ·
Cockpit (chat) · Progress (Chapters / Social Impact / Insights) · Challenge ·
Profile · Settings · Credits · Notifications · Invite · Help · My Wellness ·
Upgrade · Auth (sign in, sign up, forgot, reset)

### 2.3 Admin (web only)

Dashboard · Users · Sessions · AI Monitoring · Payments · Revenue · Pricing ·
Coins · Moderation · Compliance · Roles · Experiments · Notifications · Audit ·
Settings

> **`/admin` has no authentication of any kind.** Every module is reachable by
> typing its URL. This is the P0 and it is in the code, not just in the
> document.

---

## 3 · The core loops

### 3.1 Make a session

```
"New session" → empty cockpit → say what you need
  → Aurelia proposes a set of changes (already applied — you remove, not opt in)
  → Apply → a new cut, named v1.3
  → Play it, keep talking, or Publish
```

**Recommendations arrive already applied.** The user's job is to take away what
they do not want, not to opt in to each. That is a deliberate product decision
about a person who came here because deciding was hard.

**A change makes a version, and every version is kept.** The progress card
names the cut it is holding — v1.2 with white noise added is not v1.2. The
history lives in Progress → Chapters, and each cut can be reverted to, which
lands as two lines in the conversation rather than a card quietly renaming
itself.

### 3.2 Fork someone's session

```
Recreate (from a card, a profile, a session detail, the player)
  → the cockpit, with the original attached and playable
  → "Tell me what should be different; anything you leave alone stays as they made it"
```

**The Recreate form is switched off.** There used to be a screen between the
two: sliders for length, voice and pace, a layer list, and a summary at the
bottom. Its own footer made the case against it — *"Opens in chat so you can
keep tuning it out loud."* It is a form you fill in to reach a conversation
that takes the same answers. The screen is kept in both codebases behind a
switch, because a slider is a better instrument than a sentence for "how long",
and that argument may yet win.

### 3.3 Publish

```
⋯ menu → Publish → sheet → the session is out in the world
```

The menu says the true thing rather than always offering a button:

| State | Menu shows |
| --- | --- |
| Never published | **Publish** |
| Published, unchanged since | *nothing* — a button that would do nothing is worse than no button |
| Published, moved on since | **Republish** |
| Anything published | plus **Unpublish** |

Unpublishing gets its own confirmation sheet, with a **neutral** disc rather
than the brand's warm one: taking a session down is a reversal, not a failure
and not an achievement. It needs the sheet because it is the one action with no
visible consequence on screen — without a word for it you cannot tell whether
it worked.

---

## 4 · What is real and what is theatre

**This matters more than anything else in this document.** The app is designed
to look real in a demo. Knowing which parts are means you will not promise
something that does not exist.

| Looks real | Actually |
| --- | --- |
| 26 sessions with full structure, mixes, chapters, lineage | hand-written constants in the app bundle |
| "18.5k plays", "−43% stress", "1,323 credits" | **invented**, deliberately specific because a demo full of Lorem cannot be reasoned about |
| Playing a session | one 10-second audio bed, looped, identical for every session |
| Aurelia's replies | ~20 keyword rules matched in order. No model. |
| Google / Apple sign-in | both paths real end to end; a dummy account behind them |
| Publishing | recorded in memory for the run; gone on reload |
| Cover art | hotlinked from Unsplash at run time |
| Voice input | **the microphone is genuinely real** — the clip is recorded, written to disk and plays back. Only the transcript is a fixed sample string. |

**Nothing persists.** Sign-in, publishes, mutes, version history — all in
memory, all gone on reload. That is deliberate while the data is mock, and
wrong the moment an account holds real history.

Two things to say out loud in any demo:

- **An app showing flat orange gradients is not broken — it has no network.**
  Cover photos come from Unsplash; the gradient underneath is the floor, not a
  fallback.
- **Sign-in resets on every launch**, so the app always opens on the case for
  itself rather than on someone's leftover session.

---

## 5 · The demo console, and the lock

`/__demo` on the web app is a **feature-flag console**: a registry of every
module with a switch, so a walkthrough can be scoped to exactly what is being
shown. 17 consumer modules, 15 admin modules.

- Toggling changes **only your browser** until you press **Publish**.
- Publish writes to a shared store (Upstash KV via `/api/config`), so every
  visitor sees the same scope.
- Without the KV env vars the endpoint reports `configured: false`, Publish is
  disabled, and everyone falls back to compiled defaults.
- `built: false` means there is nothing behind the switch. `unreleased: true`
  means built but deliberately off.

**If a screen or a control is missing and the code plainly renders it, check
the flags before reporting a bug.**

> **The site password is not security.** The check runs in the browser and the
> password is inlined into the JavaScript bundle — anyone willing to open
> devtools can read it or skip the gate. It exists to stop strangers wandering
> into unfinished work and filing feedback on things already known and already
> scheduled. `/__demo` itself is deliberately *outside* the lock, so nobody can
> shut themselves out of the switch — which also makes that URL a way around
> it.
>
> `/api/config` is also unauthenticated: anyone who finds it can POST a new
> flag set, the lock included. Narrow by design — it only stores booleans.

---

## 6 · Decisions already made, and why

These look arbitrary in the product and are not. Read the PRD entry before
changing one.

| Decision | Reason |
| --- | --- |
| Recommendations arrive applied | The user removes rather than opts in. |
| The sign-in ask lands on **send**, not the first keystroke | Asking mid-thought loses the thought. |
| Password reset must not reveal whether an address is registered | The confirmation is identical either way. |
| Outcome figures are labelled self-reported **on the screen** | A wellness claim next to an unqualified number is a regulatory problem, not a copy preference. |
| The leaderboard ranks **sessions**, not people | What competes is the work; the creator is credited beside it. |
| The leaderboard is public by default | Called out in the PRD as a decision about a mental-health product, not a detail. Still open whether it can be opted out of. |
| Attribution is not a toggle | A fork keeps its lineage, the creator stays credited, the coin split follows the chain. |
| A draft shows zeroes and says why | Rather than borrowing figures it has not earned. |
| The second challenge is deliberately empty | Every other list is populated, which makes the app pleasant to demo and useless for judging day one. |
| Playback survives leaving the player | Starting a session is not a decision to stop doing other things. |

---

## 7 · States that do not exist yet

Every Figma frame shows the happy path fully populated. That is normal for a
design file — but the cockpit *is* the product, so its failure modes need
specifying before engineering meets them in QA.

| Area | Missing state | Why it cannot wait |
| --- | --- | --- |
| Cockpit | **Generation failed or timed out** | The core loop's only failure mode is undesigned |
| Cockpit | Mic permission denied | Voice is a primary input; denial needs a text fallback |
| Cockpit | Recording hits a length cap | Voice is billed per second — uncapped is an open cost |
| Cockpit | Offline | A chat-first app is unusable with no network messaging |
| Auth | Invalid credentials; email already registered | The forms have no error slot designed |
| Auth | Reset link expired or used | Reachable by design; must be caught before the form renders |
| Home | Day-0 user with no personalisation | Quick Start and Live Sessions show fixed content |
| Sessions | Not enough history for "Picked for You" | Needs an honest fallback, not an empty rail |
| Challenge | Streak broken; fewer than three participants | The mechanic turns on day count; the podium assumes three |
| Player | Playback failure; session withdrawn after being linked | Detail pages are shareable, so dead slugs are reachable |
| Profile | Zero stats; delete-account confirmation | Delete is missing entirely, not just its state |
| Global | Free-tier cap reached | Only once pricing exists — but the cockpit is where a paywall lands |

The free limit **is** built now — the cockpit pauses after three sends and
offers New Session or Upgrade — but three is a number chosen for a demo, not a
plan. See §9.3.

---

## 8 · Open gaps, by priority

### P0

- `/admin` has no authentication of any kind.
- **No pricing or subscription model exists anywhere in the product.**
- No backend. Both clients are frontend-only on mock data.

### P1

- Special-category consent (mood, sleep, voice, biometrics) needs legal review
  beyond the sign-up checkbox.
- The coin economy has **exactly one defined rule** — the referral reward.
  Earning and spending are otherwise unspecified.
- **The referral reward on sign-up alone is trivially farmable** with
  disposable email. It needs an activation trigger, a per-account cap and a
  self-referral check.
- Sign-out is unreachable on mobile. On web it lives on `/settings`, reached by
  the gear on your own profile.

### P2

- Trusted Creators, Picked for You and Sessions with Biggest Impact each imply
  a ranking with **no defined input set**. The last is built on self-reported
  figures, which is a weak basis for a shelf with that title.
- Cover art is hotlinked from a third-party CDN. Fine for a demo, not for
  production.

---

## 9 · Questions only you can answer

Engineering is blocked on these, not stalling on them.

1. **What is the real session lifetime?** "Signed out every launch" is a demo
   setting, not an answer.
2. **What earns a coin, and what spends one?** This blocks the entire ledger
   design — whether entries are immutable postings or a mutable balance depends
   on the answer.
3. **What does the free tier cap, and what does paying remove?** Three sends is
   a placeholder. Nothing else about pricing exists.
4. **Must a challenge participant appear on the public leaderboard?**
5. **What happens to a session personalised on a signal the user has since
   switched off?** Regenerate, freeze, or warn — all three are defensible and
   the data model differs for each.
6. **Who owns a recreated session, and what share of its coins reaches the
   original creator, through how many generations of lineage?** Lineage is a
   chain, not a single parent, so this is a payout graph.

---

## 10 · How work gets done here

Useful to know when you ask for something.

- **Figma is the source of truth for anything visual**, and the *node* is read
  over the API rather than a screenshot. Screenshots lose the weight, the
  leading and the exact spacing — which is what reads wrong first.
- **Design tokens are generated.** `design-tokens/figma-export.json` →
  `npm run build:tokens` → `src/styles/tokens.css`. Editing the CSS by hand
  gets silently reverted by the next export. Every change is logged in
  `docs/DESIGN-SYSTEM-HISTORY.md`.
- **The PRD is updated with the code**, in the same commit, and is kept
  identical on all three branches.
- **Verification is running the real app**, not just tests. Two bugs in one
  pass — a missing asset and a theme border bleeding through — survived 62
  green tests and a clean analyzer because neither can see a screen.

### Colours still without a Figma variable

`#FF881B` (the brand orange), `#FFE682`, `#FFF1DB`, `#ECFBED`, `#F0F0F0`,
`#D6D6D6`, `#818181`, `#E0E0E0`, `#331B04`, `#525252`, `#626262`. They are
written as literals in both codebases with a note. Binding them in Figma is a
design task, not an engineering one.

**One open design decision:** the Figma paint style `16658:17634` resolves to
`#FF8514 → #FFE270`, while both codebases write `#FF881B → #FFE682` in about
thirteen places. One of them is wrong and nobody has said which.

---

## 11 · Where to read further

| File | What it holds |
| --- | --- |
| `docs/PRD.md` | The requirements document. Every "why" behind a behaviour. Identical on all three branches. |
| `docs/DESIGN-SYSTEM-HISTORY.md` | Every token, variable and type-scale change, with its reason. |
| `docs/FOR-BACKEND.md` | The API the clients need, and the decisions blocking it. |
| `docs/FOR-MOBILE.md` | The Flutter client in detail. |
| `docs/FOR-AI-AGENT.md` | Orientation for an automated agent. |
| `CLAUDE.md` | Engineering notes, different on each branch. |
