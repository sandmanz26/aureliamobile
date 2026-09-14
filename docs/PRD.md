# Aurelia — Product Requirements

**Status** Draft for review · **Compiled** 14 Sep 2026 · **Source** the Figma
file, the screens as built, and the team's own review notes.

> This document is kept identical on `mobile_app`, `web_app` and `admin_cms`.
> Change it on one branch and port it, or it drifts.

---

## 01 · What Aurelia is

**A generative wellness companion.** The home screen opens on a single text
field — *"Ask Aurelia.."* — because the product's bet is that a conversation is
a better entry point than a category grid. From that chat, Aurelia proposes a
session (a guided meditation script, a visual theme, a soundscape) that the user
can accept, tune per channel, and play. Everything else — Explore, Community
recreation, Progress, Coins — exists to bring people back to that conversation.

---

## 02 · Who uses it

Neither persona is stated in the Figma file. Both are inferred from the flows
that exist, and both should be confirmed.

**The self-directed seeker (primary).** Opens the app when something is off —
can't sleep, stressed before a meeting — and wants something made *for that
exact feeling* in under a minute, not a 40-item library to filter. Success is
speed from "Ask Aurelia.." to playing.

**The community sharer (secondary).** Has already made sessions worth showing
off and returns for recognition — plays, recreates, coins, a leaderboard.
Success is being recreated.

**Goals this document assumes.** None are stated anywhere in the source
material. Flag for confirmation with product and business:

- Time from app open to first session played.
- 7-day retention, driven by the coins/progress loop and daily-relevant prompts.
- Share rate on the community tab — recreate count per published session.

---

## 03 · Product map

| Area | Screens | |
| --- | --- | --- |
| Auth | Sign In, Sign Up, forgot/reset password | Core |
| Home | Hero ask, live sessions, quick start, community shelf, closing CTA | Core |
| The cockpit | Chat and its states | Core |
| Session setup | Session settings: Script, Visual, Sound | Support |
| Sessions | Browse shelves, Session Detail, Recreate | Core |
| Playback | Player, publishing sheet | Core |
| Discovery | Explore, See All | Core |
| Community | Challenge, Challenge Detail, Leaderboard | Support |
| Account | Profile, Invite a Friend, Notifications, My Wellness, Help | Core |
| Admin | 15 modules, web only | Internal |

---

## 04 · How a session gets made

1. **Ask.** The user types or speaks into "Ask Aurelia.." on Home, or continues
   a thread. Mic and send sit in the same field — voice and text are equal
   entry points, not a fallback.
2. **Aurelia answers with a diagnosis, then a recommendation.** It opens with a
   status read ("sleep score improved by 7%") before proposing two or three
   concrete adjustments, each individually removable — not one take-it-or-leave-it
   suggestion.
3. **Tune per channel.** Script, Visual and Sound are separate screens, so the
   words, the look and the audio bed are each editable without a monolithic
   "regenerate".
4. **Play.** Design review has asked for the player to be persistent — a
   mini-player that survives navigation. No frame demonstrates it yet.
5. **Publish.** A progress sheet resolves to "Session Published!" and the
   session appears under Recreate from Community, attributed to its creator.

---

## 05 · Requirements, by area

### Accounts

- Sign-up collects name, email and password, gated on an **explicit consent
  checkbox naming mood, sleep and voice data** — the categories the account
  actually collects. Burying special-category consent inside a linked document
  is the exposure flagged at P1; naming it on the form is the cheapest available
  mitigation.
- **The password-reset confirmation must not reveal whether an address is
  registered.** Same message either way. A different message hands an anonymous
  visitor a way to test whether any email has an Aurelia account, and for a
  wellness product that is a disclosure in itself.
- Reset links are single-use and expire in 30 minutes, so the expired state is
  reachable by design. The token must be validated **before** the form renders,
  not on submit.
- Changing a password signs out every other device, and says so.

### Home, and the signed-out experience

- **Home is open, and it is the same page signed in or out.** A visitor reads
  the entire pitch without an account. Asking for an email before showing
  anything is how the funnel loses people who would have converted.
- **The sign-in ask lands on send, not on the first keystroke.** Someone can
  type their whole sentence into Ask Aurelia with nothing in the way;
  interrupting mid-thought to ask for an email loses the person who was already
  describing what they wanted. What they typed travels through the redirect and
  is waiting in the thread afterwards, so nobody types it twice.
- **Every visit currently starts signed out — deliberately, and only for now.**
  Sign-in is held in memory and not persisted. Right while the data is mock;
  wrong the moment an account holds history worth returning to. Treat it as a
  demo setting with an expiry date.
- **Quick Start carries two actions and they are not the same action.** Play
  runs the starter as it stands; Create opens chat with it as the brief. That
  distinction is the product in miniature — a catalogue you can consume, and the
  same catalogue as raw material. It also sets an expectation the backend must
  meet: a starter has to be playable as a finished session, not only as a prompt.
- **The category chips filter, and the count on a chip is not the shelf.** The
  number is the size of the whole catalogue behind it; the rail shows a sample.
  That has to survive into the real build — "Music (8.3k)" over four cards is
  honest only if See All can actually reach the rest.

### The cockpit

- **An empty session says what the field is for.** A new thread carries Aurelia
  present and waiting, the question that names the job ("what are you
  *creating* today"), and three openers — the hardest part of a blank chat is
  the first sentence. Nothing that needs a session to act on appears until there
  is one.
- **Every recommendation arrives applied.** Aurelia proposed them off its own
  diagnosis, so the user's job is to take away what they do not want, not to opt
  in to each. The count on "Apply new changes (3)" is what they are about to
  accept.
- **The set arrives folded and stays in the thread.** Three full cards is most of
  a phone screen, so they come as one deck with the count on it, opening when the
  reader wants to weigh them and folding back once applied. It keeps its place
  against the message that handed it over: a transcript that drops the request
  but keeps the answer reads as a gap.
- **Applying says so in the user's own voice.** The request enters the thread as
  their line before Aurelia answers it. A session that changes with nothing in
  the transcript to explain why reads as the app acting on its own — the
  opposite of what a chat-first product is claiming.
- **The composer's plus is a menu of what can be asked for**, in two sets that
  must not be merged: changes Aurelia can argue for, each carrying a predicted
  score, and experiments carrying only the channel they would change. A
  predicted score and "try this and see" are different kinds of claim.
- **Voice never ends silently.** Stopping transcribes; the transcript lands in an
  **editable review step** and is sent only on confirmation. Transcription is
  imperfect and the user is the one who knows what they said.
- **Listening is a state of the screen, not a panel on it.** A warm wash rises
  off the bottom edge and the composer gives way to three controls — Aurelia's
  voice, your mic, and Stop. The live level bars sit inside Stop: a screen that
  says it is listening has to show something that is, and muting has to visibly
  stop it.

### Sessions, detail and Recreate

- Each shelf has a See All rendering the whole shelf as a two-column grid. One
  screen serves every shelf, so a shelf added later gets its See All free.
- **Outcome figures ("−43% stress") are self-reported by listeners and must be
  labelled as such on the screen.** Presenting them unqualified next to a
  wellness claim is a regulatory problem, not a copy preference.
- **Recreate is a diff, not a new-session form.** The original is pinned, presets
  are edits real recreators made (with their share), and every control states a
  change against the original. Sound layers are *ticked off* rather than
  checkbox-ed, because the question is which of the original's layers you are
  keeping.
- **Attribution is not a toggle.** A fork keeps its lineage, the original creator
  stays credited, and the coin split follows the lineage on every play. Lineage
  is a chain, not a single parent.

### Playback

- **The artwork is the screen, not a header on it.** Play opens a full-bleed
  cover with the transport floating over it and no app chrome — no drawer, no
  status band. Anything that frames the art turns a session into a page about a
  session.
- **Play makes sound.** The transport drives an audio bed, not just a moving
  bar — a play button that animates a scrubber and plays nothing is the one
  thing a listener will test first. The bed is a mock, and it starts paused
  because a browser will not let audio begin without a gesture.
- **The session speaks on screen.** The line being spoken sits under the art in
  the one serif the product uses. It is there for the same reason a lyric sheet
  is: it lets someone follow when they cannot, or will not, listen closely.
- **Starting a session is not a decision to leave the conversation.** Playback
  outlives the player screen: walking back to the cockpit keeps the audio
  running and parks the session in a card under the header, which carries the
  transport so it can be paused without going anywhere. The header's own play
  glyph stands down while that card is there — two controls for one thing is
  worse than none.
- **The sheet has two resting places.** Sitting under the transport, and pulled
  up to just below the status bar. The grabber is the control — it drags, and a
  tap snaps — because a handle that does nothing teaches people the sheet does
  not move. Free scrolling still works either way.
- **What you would read lives beneath what you hear.** The sheet carries the
  author, the title, the summary and the session's attributes, and it slides up
  over the art rather than replacing it — leaving playback is not a condition of
  reading about it.
- **Every control that says Play, plays.** A glyph labelled Play that opens a
  detail page or the cockpit instead is a broken promise, and the app shipped
  several. The session card, the sessions shelf's Resume and the cockpit
  header's play all land on playback.
- **The summary opens in place.** Read More expands the clamped text where it
  is. Sending someone to another screen to finish a paragraph costs them their
  place in the session.

- **Publishing confirms in green, and hands over the session.** Success is the
  one moment the app reports an outcome rather than its own identity, so the
  confirmation is green rather than brand-coloured, and the action after it
  opens what was just published rather than the shelf it will appear on.

- **A session being built survives leaving the screen.** Generating one,
  applying changes and going off to hear it are three steps of one task. The
  thread is held above the router, so coming back finds the session still there
  and ready to publish rather than a fresh conversation. New session is still
  the only thing that clears it. A reload starts over, like the rest of a visit.
- **A creator's name is a way in.** Tapping the byline — on the player sheet or
  a session's detail — opens that person. Which profile depends on the entry
  point, not on a mode: your own session opens yours, someone else's opens
  theirs, and the difference is chrome (drawer and coins vs. back and Follow)
  around the same published work. The entry point is carried, not inferred — a
  session just built in the cockpit has no catalogue author to read it from.

- **The cockpit is not a destination.** The drawer goes Profile, Explore,
  Sessions, My wellness — there is no Chat entry. You reach the cockpit by
  starting a session ("New session"), by the card of one already playing, or by
  a recommendation that wants changing. Naming it in the nav invites people to
  open an empty conversation and wonder what it is for.
- **Settings is where an account ends.** Connected accounts, coin redemption,
  account deletion and sign-out. Sign-out had been unreachable from anywhere in
  the UI since it left the drawer, which left reloading the page as the only
  way out of an account.
- **Only your own profile has a gear.** There is nothing of a stranger's to
  configure, so the control is not shown rather than shown and refused.

- **Explore and Sessions are two screens, not one.** Explore is the browse
  surface — shelves, community, creators. Sessions is the plain list of what
  there is to play, with two scopes: everything, and what you made.
- **Sessions has two scopes.** "All" is the whole catalogue as a list;
  "Created by you" is what you have published — artwork, who
  made it, how long, and what it moved. The outcome pill carries the session's
  own headline figure and the arrow follows its sign: a fall in stress and a
  rise in focus are both good news and would otherwise point the same way.
- **All Categories is a sheet, not a page.** The shelf's chip row shows what
  fits; the sheet is the whole list with the one in force marked rather than
  merely tinted, and picking closes it — a filter sheet that stays open hides
  the thing it just changed.

### Challenges

- A challenge is **not a session**: it is a time-boxed streak people join, with
  its own record — join date, day count, end date, leaderboard.
- The card on the browse surface opens the challenge from anywhere on it. A card
  that describes a thing and then reacts only to one small pill reads as broken.
- **The leaderboard is public by default, and that is a decision, not a detail.**
  It exposes how consistently a named person uses a mental-health product.
  Joining must be an explicit opt-in to appearing on it, with a way to compete
  without being listed.
- **Ranking by raw day count rewards whoever joined earliest.** Rank by
  completion rate within the window, or reset the window per participant.
- Streaks push daily use, which is the point, but for a wellness product they
  also punish a bad week. The rules need a defined break or pause before launch.

### My Wellness — the consent surface

- **This is the consent surface, not a settings page.** Six sources in three
  groups. Every other screen *spends* these signals; this is the only one that
  says what they are and lets someone take them back. A checkbox at sign-up can
  carry the permission; only this screen can carry the withdrawal.
- **The summary is computed from the controls, never written alongside them.**
  A summary that can contradict the controls beneath it is worse than none.
- **Each row states what its source reads** — "Busy blocks only, never titles or
  guests". Consent is not informed when the thing being consented to lives
  behind a link. These strings are product commitments: whatever the integration
  pulls has to match them.
- Unsupported sources are requested through a sheet. **Those requests are demand
  data** — which wearable to integrate next is an expensive decision currently
  made without evidence. It needs somewhere to write to; today it goes nowhere.

---

## 06 · The two clients are one design

**The web app is the reference implementation; the Flutter app is held to it.**
Not because it matters more, but because a single reference is the only way two
codebases stay in step without a third document arbitrating every pixel.

- **One type scale.** Mobile had grown its own — 17px headings against the web's
  20, 14px labels against 12 — and no amount of per-screen matching could close
  a gap every screen inherited.
- **One page gutter.** 20px, which is what every consumer screen on the web
  carries at phone width.
- **Shared assets, not re-made ones.** Brand and illustration vectors move as the
  same SVG path strings; raster assets are the same files in both trees.

Two differences are intended: the web renders a simulated phone status bar
because it is viewed in a browser, and platform chrome — drawer scrim, keyboard,
text selection — follows each platform's own conventions.

---

## 07 · States that do not exist yet

Every frame shows the happy path fully populated. That is normal for a design
file, but the cockpit *is* the product, so its failure modes need specifying
before engineering meets them in QA.

| Area | Missing state | Why it cannot wait |
| --- | --- | --- |
| Cockpit | Generation failed or timed out | The core loop's only failure mode is undesigned |
| Cockpit | Mic permission denied | Voice is a primary input; denial needs a text fallback |
| Cockpit | Recording hits a length cap | Voice is billed per second — uncapped is an open cost |
| Cockpit | Offline | A chat-first app is unusable with no network messaging |
| Auth | Invalid credentials; email already registered | The forms have no error slot designed |
| Auth | Reset link expired or used | Reachable by design; must be caught before the form renders |
| Home | Day-0 user with no personalisation | Quick Start and Live Sessions show fixed content |
| Sessions | Not enough history for "Picked for You" | Needs an honest fallback, not an empty rail |
| Challenge | Streak broken; fewer than three participants | The mechanic turns on day count and the podium assumes three |
| Player | Playback failure; session withdrawn after being linked | Detail pages are shareable, so dead slugs are reachable |
| Profile | Zero stats; delete-account confirmation | Delete is missing entirely, not just its state |
| Global | Free-tier cap reached | Only once pricing exists — but the cockpit is where a paywall lands |

---

## 08 · Open gaps

**P0**

- `/admin` has no authentication of any kind.
- No pricing or subscription model exists anywhere in the product.
- No backend. Both clients are frontend-only on mock data.

**P1**

- Special-category consent (mood, sleep, voice, biometrics) needs legal review
  beyond the sign-up checkbox.
- The coin economy has exactly one defined rule — the referral reward. Earning
  and spending are otherwise unspecified.
- Referral reward on sign-up alone is trivially farmable with disposable email.
  It needs an activation trigger, a per-account cap and a self-referral check.
- Sign-out is currently unreachable from anywhere on either platform.

**P2**

- Trusted Creators, Picked for You and Sessions with Biggest Impact each imply
  ranking with no defined input set. The last is built on self-reported figures,
  which is a weak basis for a shelf with that title.
- Cover art is hotlinked from a third-party CDN. Fine for a demo, not for
  production.

---

## 09 · Open questions

1. What is the real session lifetime? The current "signed out every launch" is a
   demo setting, not an answer.
2. What earns a coin, and what spends one?
3. What does the free tier cap, and what does paying remove?
4. Does a challenge participant have to appear on the public leaderboard?
5. What happens to sessions personalised on a signal source the user has since
   switched off?
6. Who owns a recreated session — and what share of its coins reaches the
   original creator, through how many generations of lineage?
