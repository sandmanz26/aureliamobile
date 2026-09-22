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
- **Recreate opens the conversation, not a form.** Pressing Recreate anywhere
  lands in the cockpit with the fork already attached and Aurelia asking what
  should be different. The screen that used to stand between the two is built
  and kept, switched off — see §06.
- **Recreate is a diff, not a new-session form.** When the screen is on: the
  original is pinned, presets are edits real recreators made (with their
  share), and every control states a change against the original. Sound layers
  are *ticked off* rather than checkbox-ed, because the question is which of
  the original's layers you are keeping.
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
- **The bar is a control, not a read-out.** You can drag it, tap anywhere on it
  to jump there, and arrow it five seconds at a time from the keyboard. A
  progress bar you cannot move is the one thing every listener tries first, and
  it is also the only way to hear a line again.
- **Fifteen seconds has its own button.** Back 15 and forward 15 flank the play
  disc, because "say that again" is not a drag: on a ten-minute session fifteen
  seconds is under three pixels of track.
- **Sound can be turned off without stopping the session.** Muting is not
  pausing — you open a session in a room where you cannot make noise and still
  want the cues, the clock and the art. The switch is on the player and on the
  card in the cockpit, and it is the same switch: one silence for the app, not
  one per screen.
- **Silence survives a reload, and it is the only thing that does.** Everything
  else here forgets on purpose. Mute does not, because the reason you turned it
  off is the room you are in, and you are still in it after a refresh.

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

### Player Beta — a second player, switched on for a walkthrough

An experimental screen, reached from the cockpit: the session that is
loaded, or the one attached to a Recreate message, swipes between its
current cut and the cuts behind it — one card, one info block, one
control bar, rather than the plain player's single fixed view.

- **It is a `/__demo` flag** (`player.beta`, under the Player module),
  off by default. It started as a visitor's own Settings preference and
  was moved into `/__demo` on request — the console decides who sees it
  during a walkthrough, same as everything else there.
- **It reuses the version history that already exists**, rather than
  inventing a second one: the same cuts Progress's Chapters tab lists.
  Swiping a card is browsing that history with a cover in front of it,
  not a new data model.
- **Two doors, both already in the cockpit.** The mini player card and
  the attached-session card under a Recreate message both open the plain
  player normally; with the flag on, both open this instead. Nothing
  about starting or continuing playback changes — the audio deck is the
  same one either way.
- **`/play/...` itself redirects to the beta page when the flag is on**,
  not only the two doors above — reaching it any other way (typed,
  refreshed, an old bookmark) would otherwise show the plain player
  regardless of the flag. The beta page's own "open full player" link is
  the one exception, so tapping into a card for the real scrubber does
  not immediately bounce back to the card it came from.
- **A direct link is not a way around the flag.** Reaching either URL
  with it off lands on the plain player.
- **Not on mobile.** Web only for now, per the usual rule that new web
  surfaces are not ported until asked for.

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

- **One face.** Mulish, which is the `font-family/base` variable in Figma. Both
  clients spent a while quietly agreeing with each other about the wrong thing:
  this app's token export carried "SF Pro" and the Flutter app left the family
  unset, so each rendered its platform's system UI face.

Two differences are intended: the web renders a simulated phone status bar
because it is viewed in a browser, and platform chrome — drawer scrim, keyboard,
text selection — follows each platform's own conventions.

### Recreate goes straight to the conversation

The Recreate screen's own footer made the case against it: *"Opens in chat so
you can keep tuning it out loud."* It is a form you fill in to reach a
conversation that takes the same answers — every control on it is a sentence
Aurelia already understands, and the summary at the bottom was literally the
brief being handed over. Two screens for one question, and the second one can
also answer follow-ups.

So Recreate now lands in the cockpit with the fork attached and the question
asked in words — the screen's own heading, kept:

> Got it — forking Daniel Brooks's session, and they stay credited in the
> lineage. Tell me what should be different; anything you leave alone stays as
> Daniel Brooks made it.

**The opening line changes with the brief, and that is not cosmetic.** Through
the form, a fork that changed nothing sent "• Keep it as it is", which is a
thing the user actually said. Sent on behalf of someone who never saw the form,
it is the app answering its own question. With no changes stated the line is
`Recreate "Deep Grounding" by Daniel Brooks.` and stops.

**Not deleted — switched off.** `recreate.screen` in /__demo, and it is a
*feature* of the Recreate module rather than the module itself: Recreate the
action stays on, only the form is out of the way. The argument for keeping the
code is that a slider is a better instrument than a sentence for "how long",
and that may yet win.

Three things this had to get right:

- **One switch, four call sites.** The session grid card, the recommendation
  card and both controls on session detail go through `useRecreateTarget`. A
  Recreate that behaved differently depending on which card you pressed would
  be worse than either answer.
- **`/recreate/:slug` still resolves.** Bookmarked, pasted, opened from the
  console — it forwards to the cockpit with the same brief rather than showing
  the walkthrough's lock page, which says the wrong thing: Recreate has not
  been taken out of scope, only out of the way.
- **A new flag key, not a flipped default.** Both the published set and the
  local draft merge *over* the compiled defaults, so changing `recreate` to
  default-off would have done nothing for anyone whose flags were published
  while it was on. A key that has never existed is off for everybody the moment
  it ships, with nothing to press.

### The transport was a read-out with a knob drawn on it

The bar under the art had a track, a warm fill and a 28px white knob, and none
of it could be touched. Three absolutely positioned `<span>`s painted the shape
of a scrubber over a clock: the knob's `left` was `elapsed / duration`, so it
moved when the audio moved and never the other way round.

That is the first thing a listener reaches for, and it is not a nicety. A
session is a spoken thing; missing a line means you want the last twenty
seconds back, and without a scrub the only way to get them is to start over.

It is a native `<input type="range">` now, not a div with pointer handlers.
Drag, tap-to-jump, keyboard, focus and the value a screen reader announces all
come with the element; rebuilding them around a div is rebuilding this control
badly. The frame's look is kept in `.u-scrubber` — the 7px track on black at
40%, the warm fill, the 28px white knob — and the page lays out the same 7px
strip with the 28px control centred over it, so the thing you can grab is 28
tall while the times below it did not move.

Three things came with that pass:

| | Was | Now |
| --- | --- | --- |
| Arrow keys | one `step` — a hundredth of a second | ±5s, which is what a media control does |
| ±15s | — | two buttons flanking the disc |
| The cue at 100% | wrapped to "Now take a deep breath in" | holds on the last line |

The cue was a real bug and an odd one to read: `Math.floor(progress * 4) % 4`
is 0 at both ends, so a session ended by telling you to breathe in.

**And loading a second session kept the first one's playhead.** `load()` set
`elapsed` to 0 but never touched the element, so the clock read the element back
and overwrote the zero on the next frame. Opening a fresh session while one was
running dropped you seven seconds into it. The element is reset on the track's
identity now, which is where the reset belonged.

### Mute is not pause, and it is one switch

*"just in case saya mau buka tapi tidak mau berisik."*

There was no way to silence the app short of pausing it, and pausing is a
different intention: it stops the session. Muting keeps the session running —
the clock, the cues, the art — and takes the sound out of the room.

It is held on the player context rather than per screen, so the switch on the
full player and the one on the cockpit card are the same switch. The card's is
not in the frame, and it is there for a reason: that card is on screen
*precisely* when a session is running and you are doing something else, which
is when you notice you need silence. Without it the switch is two taps away at
the moment it is wanted — and a muted session playing in the cockpit would have
had nothing on it to say why it was silent.

It persists, alone among everything here. `localStorage`, best-effort: a
private window or blocked storage just means the app starts audible.

### One difference is not a design decision — it needs one

**~~The Flutter client's player has no sound.~~** It does now. The no-plugins
rule held for months and bought a real thing — `flutter run` on a fresh machine
with no CocoaPods step — and it did not survive the first product requirement
that needed a device: a wellness app whose player is silent and whose
microphone does nothing is not demoable. Three plugins, each behind a seam
(`AudioEngine`, `VoiceCapture`), so the widget tests still run without a
platform channel anywhere near them.

**One difference remains, and it is small: mute does not survive a relaunch on
mobile.** On the web the switch is one `localStorage` line. On Flutter the only
key-value store is a fourth native plugin, and the rule that app is built on is
that a plugin has to earn its place. Remembering a mute does not, yet.

**Both clients hold playback and the cockpit thread above their router.** A
session being built has to survive leaving the cockpit to play it, and a session
that is playing has to survive walking back to the cockpit. Owned by their
screens, each tore down the other.

### What the two clients now share, and what they do not

Everything in §06 above is on both clients unless this section says otherwise.
The Flutter app was ~38 commits behind and has been brought up: the draggable
scrubber and the ±15s buttons, the sound switch, Recreate opening the
conversation with the fork attached, the reply engine and the "I don't know"
questions, versions and Chapters' revert, Publish / Republish / Unpublish,
Credits and a coin that reaches it, the second challenge, the empty new
session, the free limit and Upgrade, the sixteen type styles, the deck's orbs,
and the Objective sheet.

Four differences are deliberate, and all four are platform rather than
design:

- **Mute does not persist on mobile** — see above.
- **The Recreate form's switch is a constant, not a flag.** The web has the
  `/__demo` console to hold feature flags; the Flutter client has no such
  console, so `recreateFormEnabled` in `recreate_handoff.dart` is where that
  screen is turned back on.
- **The web renders a simulated phone status bar**, because it is viewed in a
  browser.
- **Chat text size is adjustable, and only on mobile.** A tester finding
  14px small next to ChatGPT on their own phone is not the same as everyone
  finding it small, so `Settings → Chat text size` (Small / Medium / Large,
  meaning bodySm / bodyLg / bodyLarge — three points already on the type
  scale) lets a listener decide for themselves, felt immediately in a preview
  bubble on that screen and in the thread itself. In memory only, like the
  rest of the app: a fresh launch starts back at bodySm, the Figma value. The
  web's chat bubbles stay fixed at bodySm; the question that prompted this was
  specific to the phone the thread is actually read on.

Two things are known to be behind on mobile and are not yet ported: **Home's
line-by-line frame pass** (the fourteen weight and size corrections in the
section above) and the **notification row's** own frame pass. Both are visual
rather than behavioural, and both are measured against nodes that are already
written down here.

### Home, read line by line against the frame

Every text node in 16653:14937 carries a named `Aurelia/*` style, so the frame
answers the type question outright — and the page was wrong in fourteen places.
Most were a weight rather than a size, which is why it read as *nearly* right.

| | Was | The frame |
| --- | --- | --- |
| Hero claim | Headline forced to 28/1.25 | **Title Large** 24/32 |
| Points pill | Label 12 medium | **Body Small** 14/20 |
| "Ask Aurelia.." | Body | **Body Light** 16/24 |
| Section headings | Title 20 medium | **Body** 16/24 |
| Live stat figures | Title Large — semibold | **Title Large Regular** 24/32 |
| Live stat labels | Caption 10 | **Label Light** 12/16 |
| Quick Start title | Body Small semibold | **Body Small** — regular |
| Quick Start subtitle | Caption | **Caption Light** |
| Community card title | Body semibold | **Body** — regular |
| Community card body | Body Small 14/20 | **Label Light** 12/16 |
| Community card stats | Caption | **Caption Light** |
| Banner eyebrow | Caption 10 | **Label Regular** 12/16 |
| Banner sub-copy | Body Small | **Body Small Light** |
| Both 32px headlines | Headline — semibold | **Headline Regular** |

**The two 32px headlines are the Tailwind v4 layer trap, caught in the wild.**
They carried `text-style-headline font-normal`, and `font-normal` lost to
`.text-style-headline`, which sets the weight itself and sits outside the
utility layer. They rendered at 600 while the class said otherwise. There is a
real class for it now, which is what `Headline Regular` was added for.

Five of these fixes use classes that did not exist before the type scale went to
sixteen styles. The library gap and the page's drift were the same problem.

**The footer card was nearly twice its height** because its headline was 32
semibold where the frame says **24 regular at 120%**. At 32 it needed three
lines. The italic on "Free to start, no credit card required!" was missing
entirely — the only italic on the page.

**The illustration above it is not a full-bleed band.** It is `Frame 34`, the
last row of the strength grid, 362 x 164 inside the content column, and the
frame runs the footer card flush off its bottom edge. It was full-bleed with a
24px overlap, which read as a band under the page and left the card sitting in a
gap.

### The hero is white, and the warmth is one blurred circle

Figma 16653:14937. The deployed hero read as a wash of yellow where the frame
is almost white, and the cause was not the glow — it was the page under it.

**The frame's page gradient is a decoy.** "Start" is 3787px tall and carries one
vertical gradient: `#FFFFFF` held all the way to **77%** of that height, easing
to `#FFF1DB` only in the last quarter — which is under the dark banner and never
really seen. Everything from the hero to Quick Start sits in the white part. The
code had `#FFFDF6 → #FFF1DB 55% → #FFF9EF` scoped to *that block*, so the cream
that belongs a thousand pixels down landed on the hero, and the opening read
yellow before the glow was even drawn.

**The warmth is one circle, and it is small.** Figma "Ellipse 6": a **252 × 252**
circle of `#FFE682` at **60%**, under a 224 layer blur, at **x=201, y=66** — its
left edge on the page's centre line, its top behind the header rather than below
it. The code had a 280 disc of `primary/200` at 35% under a 64px blur, pinned to
the right. Smaller and more opaque under a much wider blur is not the same
effect as bigger and fainter under a tight one: the first is a wash, the second
is a spot.

The circle is now positioned and sized to the frame's own numbers — measured
back at x=201, y=66, 252 × 252. Only the blur is a judgement: Figma's layer-blur
radius has no exact CSS equivalent, so 224 became `blur(80px)`, tuned against a
render of the frame rather than converted by a formula.

### The sidebar, measured against the frame

Figma 16651:12647 — the drawer in both states, signed out and signed in. It is
the first screen taken back to the file now that the library is on variables and
Mulish, and it came back with more drift than expected, most of it in the two
things that carry a brand: typography and colour.

| | Was | The frame |
| --- | --- | --- |
| New session gradient | `#F0A032 → #FFCC66` | **`#FF881B → #FFE682`** |
| Latest row title | `Label` — 12 medium | **`Body Small`** — 14 regular |
| Latest row author | Caption, no colour | Caption on **`text/secondary`** |
| "Latest" heading | no colour, inherited | **`text/secondary`** |
| Divider | `border/subtle` #E4E1DC | **`border/default`** #CBC4B8 |
| Drawer scrim | black 50% | **black 20%** |
| Nav icons | 20 | **24** |
| Latest disc | 40 | **32** |
| Row | `-mx-12 px-12 py-14`, 4 between | **281 x 56, 16/20 padding, flush** |
| Shell | 24 all round, 24 between | **16 sides, 24 bottom, 20 between** |

**The gradient was the one that mattered.** Two oranges that are not the brand's
read as a different button, and the pair it carried was flatter than the frame's
— which runs a saturated orange into the light gold rather than a mid-orange
into a pale one. Direction was already right; only the stops were wrong.

**The New session button is written out rather than built from `Button`.** Its
height, its 60 radius and its regular weight are all its own, and overriding
three of `Button`'s utilities would leave the winner to Tailwind v4's layer
order rather than to the class string — the trap this codebase has already hit
twice.

**A row is 56 tall because the type makes it so**: 16 + 24 + 16, where 24 is
`Aurelia/Body`'s line-height. Rows stack flush, so the spacing between items is
the row's own padding rather than a gutter, which is why the gap came out.

One thing the frame has that the code does not follow: the signed-out variant
still shows Latest. The app gates that on being signed in, which is the right
call — there is no history to show someone who has none — so the frame is the
one that is wrong there.

### Two challenges, and the second one is empty on purpose

Explore carried one challenge, and carried it as **markup**: the slug, title,
summary, cover, gradient and all three stat pills were written into the page.
`CHALLENGES` existed and the card ignored it. So a second challenge could not
appear, and the card could never be wrong in a way anyone would notice.

The card now reads its challenge, and the section is a shelf — the same idiom
as every other row on Explore, card at the frame's 362 with the next one
peeking, which is what says the row scrolls. The heading takes a plural when
there is more than one.

**`14-Day Morning Light` is deliberately empty**: nobody joined, nothing made
for it, no board. Every other list in this catalogue is populated, which makes
the app pleasant to demo and useless for judging what a challenge looks like on
day one — and day one is the state a real challenge spends its first hours in.

Two empty states came out of it, both of which were holes rather than choices:

- **The podium** would have rendered its gradient block with nothing standing
  on it — a trophy plinth for nobody, because `Podium` filters missing
  contenders and an empty list filters to nothing. It is replaced by a plain
  statement of what is true and what would change it.
- **Created Session** was hidden entirely when empty (`sessions.length > 0`).
  An absent heading reads as a screen still loading; an empty one reads as a
  challenge nobody has made anything for yet, which is the invitation. It is
  shown with a line under it now.

`points` moved onto the record with them — "250 pts" had been hard-coded beside
a hard-coded everything else.

### Publish, Republish, or nothing

The cockpit's menu offered **Publish** on every session, including one already
out in the world with nothing changed since. That makes the one control here
that changes the world a no-op — and it is the loudest thing in the menu.

Three states, and the thread answers for itself:

| Thread | Buttons |
| --- | --- |
| never published | **Publish** |
| published, nothing built since | **Unpublish** |
| published, and moved on since | **Republish** + **Unpublish** |

**Unpublish is outlined, not filled.** Taking something down is a real action
but not the one being encouraged, and two solid buttons stacked would argue
with each other. It only appears where something of this thread is actually
live — a session that has never been published has nothing to take down, and
the control would do nothing.

**Publish is brown now**, not the blue gradient it carried. Blue appears
nowhere else in this product, so the loudest control in the app was also the
only thing wearing another brand.

Unpublishing needed the publish record to become a `Map<string, boolean>`
rather than a set of published slugs: pulling a session that *shipped*
published means recording `false` over the catalogue, which a set cannot
express.

**And it reports itself.** Taking something down was quiet — a menu closing and
a button changing label, which is easy to miss and easier to doubt. It now ends
on the same bottom sheet publishing uses, in a third state.

The three states do not share a colour. Publishing is the brand ring, success
is green, and unpublishing is the neutral surface: it is a reversal, not a
failure, and a warning colour would make the user feel caught out for using a
control the app offered them. The copy carries the part that actually matters —
that nothing was lost and it can go back up whenever they like.

`publishedVersionId` is the cut that is live. Compared against
`currentVersionId` — which `addVersion` moves on every build — it settles all
three without a catalogue lookup, and that matters: a brand-new session stands
in for a published catalogue session while it is being built, so asking the
catalogue would hide Publish on the one session that most needs it.

It is seeded per thread. `openSession` gives a published session its live cut
(`v0`, the baseline it sets), so Publish stays hidden until something is built;
a draft gets null, so it offers Publish. `reset()` gives a new thread null.
Finishing the sheet sets it to the current cut, which is what takes the button
away again.

Driven in the browser through the whole cycle: new session offers Publish,
falls silent once published, and offers Republish after the next build.

### The cockpit header announced the wrong session

Recreating "Soft Reset" left the sticky card at the top of the thread reading
"Sleep meditation v1.5" — a session the conversation had nothing to do with.

The card is `MiniPlayer`, and it is driven by the **audio player's** loaded
track, not by the thread. That is right for a transport and wrong for a header:
it sits inside the cockpit and names "the session running in this
conversation", so a track loaded before the thread existed kept sitting there,
over a conversation plainly about something else.

`reset()` already clears the messages, the draft and the versions on the
grounds that "forking somebody's session is starting a new one, not adding a
line to whatever was open". The loaded track belongs to that list. It is
cleared there rather than at the three doors that call `reset()`, so a fourth
door cannot forget, and in `openSession` for the same reason.

The cost is deliberate: audio stops when you start a different conversation.
Carrying it silently under a header that names the wrong session is worse.

### Social Impact has an empty state, and it is a prompt

`16658:28332`. A session nobody can reach has no social impact to report, and
the three cards would all read zero — which says "broken" rather than "not yet".

The frame replaces the whole tab with one block: a 64 mark in the brand
gradient, "See Your Social Impact", two lines of explanation, and the single
action that would change the answer. 32 above and below, 32 to the button, 24
inside the block, 8 between the lines; the button hugs its label at 48 tall and
radius 40 rather than filling the column, because it is an offer and not the
screen's primary action.

It shows when the session is not published, which is exactly the condition the
CTA addresses. Publish Now hands off to the cockpit — Publish lives there, not
in Insights — and opens the sheet on arrival.

**And pressing Publish now actually publishes.** The sheet ran
`publishing → published` and never touched the session record, so the empty
state was a dead end: the one action it offered could not change the answer it
was reporting. `published: false` is a draft's *starting* state, not a permanent
fact.

`publishSession(slug)` records it and `isPublished(session)` reads it — the
function that already existed for this question, extended rather than
duplicated, so every surface agrees. In memory like everything else this demo
remembers.

The order the design implies is now the order the app walks:

| | Social Impact | Sessions list |
| --- | --- | --- |
| Before | the empty state, ending in Publish Now | Not Published |
| After | earnings, Community, Lineage Tree | Published |

### "I don't know" is an answer the cockpit has to handle

Typing `idk`, `I don't know` or a bare `?` used to reach the fallback — *"Got
it, I've noted that for the next revision"*. That is the worst reply available
there: it accepts an answer that was not one, files it, and leaves the person
exactly as stuck, while claiming to have understood.

Aurelia now hands back smaller questions instead, each one a tap away from
being sent. Being stuck costs a tap rather than a sentence, which is the point
— the reason someone types "idk" is that composing the answer is the hard part.

**The rule is first in the list, deliberately.** "I don't know" contains words
other rules would happily match, and a bare "?" would otherwise fall through to
a reply answering a question nobody asked.

**`?` is anchored; the rest are not.** `"make it shorter?"` is a question, not a
shrug, and must not trigger it — while `"idk what to change"` should. Verified
both ways.

The prompts and the recommendation deck are mutually exclusive on a message:
the deck is a proposal, and the prompts exist precisely because there is
nothing to propose yet.

They stack full width rather than scrolling in a rail. They are read one after
another, and the longest runs to two lines, which a rail would either clip or
leave ragged.

### The free limit, and what it is allowed to stop

Three sends in a thread and the cockpit pauses. The frame gives that a notice
above the composer and a dead composer under it, with two ways out.

**Counted from the transcript, not kept as a flag.** `messages.filter(from ===
'user')` survives leaving the screen and coming back the same way the thread
does, and no counter can be left stranded by a revert or a reset. Messages a
door writes on your behalf — a Recreate brief, a Quick Start — carry an
attachment and are not counted: you did not spend anything to arrive somewhere.

**The reset time is stamped once**, when the limit trips, rather than derived
on render — otherwise the card would quietly promise a later time on every
re-render, which is the sort of thing nobody notices and everybody distrusts.

**Two ways out, and the order is the argument.** New Session is first and solid
because it costs nothing and is what most people want; Upgrade is second and
outlined, because the screen is already interrupting them and a filled paywall
button on top of an interruption reads as a toll gate.

**What the pause actually stops.** The composer and its send, the openers, the
suggestions — and *Apply new changes*, which is the one that matters: it starts
a build, which is exactly what the limit exists to prevent. Left live, the
notice would have been a suggestion rather than a limit.

`/upgrade` is a route, not a sheet: it is the only thing being asked, and a
sheet would keep the stopped composer in view behind it. Monthly and Annual are
one segmented control rather than two buttons, because they are one choice with
two positions.

Behind `chat.freeLimit`, which resolves like the other dotted sub-flags —
defaulted on, gated by the `chat` module, switchable from `/__demo`.

### A new session opens empty

`16658:28872`. New session opened on the **demo conversation** — the one about
"the sleep meditation we created", which the user had not created. So the first
thing the screen did was misrepresent itself, and `EmptyThread` — which existed,
and was already close to this frame — was unreachable from the button whose
whole job is to reach it.

The rationale in the code was that "a cockpit with an empty scroll is a worse
first screen than one already mid-conversation". The frame disagrees, and it is
right: the frame's empty screen is not blank, it is an orb, a question and three
openers. It says what the field is for without pretending work has happened.

Two things were wrong in `EmptyThread` itself, and both had been invisible:

- **The greeting rendered 32 Semibold where the frame says 24 Regular.** It
  already carried `font-normal`, which is a no-op against `.text-style-*` —
  that sits outside Tailwind's utility layer and needs `!`. So the weight had
  been "fixed" in the source and never in the browser. Written out now, because
  the frame's leading is 115% rather than the scale's 32.
- **The orb was one blurred circle where the frame has three layers**: a 160
  radial wash at half opacity, with a 52 gold disc and a 64 orange disc blurred
  inside it and offset from each other. That offset is the effect — one centred
  blur reads as a dot, these read as light with a direction in it.

The disclaimer went with them: 12 Light at 19 on `#9D9D9D`, not Caption's 10/14
on `text/secondary`. A disclaimer set smaller than everything around it reads as
fine print somebody hopes you will skip.

### Chapters is the version history, and it is the only one

`16669:12055` is a section of five Insights frames. Reading it settled a
question the app had been answering twice: **the Chapters tab is headed
"Version History" in the frame itself.** The cockpit's ... menu carried a
second one.

Two lists, one name, and they did not even hold the same thing. The menu's
sheet listed `ChatSessionContext.versions` — the cuts *this thread* had built,
alive only while the conversation is open. Chapters lists `progress.versions` —
the catalogue's cuts, which are also what `/play/:slug?v=` asks for. A user
choosing "Version history" and a user opening Chapters saw different sets and
had no way to know why.

The menu row is gone. Chapters is the history, and it now carries the action
that made the sheet worth opening:

- **Revert lives in the open card**, not on every row. Going back is
  deliberate, and a column of buttons invites a mis-tap on the one control here
  that changes what the session *is*.
- The cut the session is already on says so instead of offering to revert to
  itself. Nothing is reverted yet means the newest is the one in play, which is
  what the cockpit shows too.
- Reverting hands the cut to the conversation through the route, and the
  conversation records it in two lines. That was the sheet's behaviour and it
  is the right one: the transcript is where this session's changes are
  accounted for, so without it the card quietly renames itself and nothing says
  why.

`pointAt` is new on the chat context because `revertTo` looks a cut up in the
thread's own `versions` by id, and Chapters' ids are the catalogue's. It takes
the label and slug directly.

**The Insights tab was already right** — 14/19 title, Light 12/19 body on
`#525252`, 10/15 date on `#9A9A9A`, cards at radius 20 with 16 of padding. Only
the glyph changed: the frame draws `vuesax/outline/star`, and ours was filled.
A solid mark at 20 outweighs the sentence it introduces.

One thing in the frame deliberately not copied: the date sits in a **42-wide
fixed box**, so "2026.6.21" wraps onto two lines. That is a box too small for
its content, not a design decision, and reproducing it would ship a typo.

### Credits is a screen, and the coin finally reaches it

`16659:41283` is a **section** holding three frames — `Profile`,
`Profile/Settings` and `Profile/Credits` — not the Insights screen it was taken
for. The mistake cost three rounds, so it is worth naming the check that would
have caught it: read the node before claiming it is built. A section's name
tells you nothing about its children.

The section also answers a question left open earlier. `Profile/Settings` has a
**prototype transition from its coin pill to `Profile/Credits`**
(`transitionNodeID: 16658:29260`). The design did say where the balance goes;
it was on the Settings header, not on a Points pill.

**Credits** (`16658:29260`) — three cards on a 20 gutter, 20 apart, each radius
20 with the shared shadow:

| Card | Holds |
| --- | --- |
| 64 tall | "Total Credits" and the figure, coin at 32 |
| 170 tall | the invite pitch and the referral link in a pill |
| grows | "History" — who joined, when, and +500 each |

Two details the frame is specific about. The link field's hairline is the brand
**gradient** at half a pixel, which a `border` cannot take — it is a 1px
gradient background with the white field inset over it. And each history row
names the person in **Regular with an underline** while the rest of the line is
Light: the frame marks the subject of the sentence typographically rather than
with a colour.

There is no coin pill in this header. The frame hides its own Trailing, which
is right — the balance is the subject of the screen, so putting it in the
chrome would state it twice.

**Settings** (`16658:20631`) was close but wrong in five ways:

- a **hamburger** where the frame has a back button — and back is correct, since
  the screen is opened by the gear on your own profile
- a **toggle** on the connected account where the frame draws a tick. The toggle
  was invented, and nothing behind it honoured switching an account off. A
  control that does not work is worse than no control
- "Coin Redemption" where the product and this very screen say **Credit**
- rows at 20/16 on `border/subtle`; the frame's are **56 tall, 12 to the label,
  on `#D6D6D6`**
- the account card at radius 16 with a 44 disc; the frame's is **20 with 32**,
  and the add-account chip is a **48 pill at radius 40** with a 14 label

Credit Redemption now opens Credits, which is the only row on that list that
had a destination and did not use it.

### Insights follows the same session Play does

The cockpit's menu had Insights disabled on a new thread while Play, two lines
above it in the same component, worked fine. Both are about the same session,
so that was a contradiction rather than a rule.

`playTo` resolves `sessionSlug ?? draft.slug`. Insights was gated on
`sessionSlug` alone, which is only set once a thread belongs to a saved
session — so on a session you had just built, with three versions behind it and
Version history live beside it, Insights was greyed out. It now resolves the
same pair.

That is safe because **every draft slug is a catalogue session**: the blank
cockpit's default, a quick start's `plays`, a recreate's source, or a version's
own. `findSession` is still the guard, because Progress redirects to
`/sessions` on a slug it cannot find, and a menu item that silently bounces you
somewhere else is worse than one that is plainly unavailable.

Driven in the browser from a new session: enabled, and the click lands on
`/progress/dolphins-frequency`.

### A session card you can act on, and a coin that goes somewhere

`16662:42395` replaces the 68-tall single line (`16523:14716`) the Sessions
screen carried. The redesign is not a resize — the card grew a second row and
two controls, and that changes what the screen is *for*. It was a list of
sessions to play. It is now a list of sessions you **own and manage**.

| | Was | Now |
| --- | --- | --- |
| Card | 362 x 68, one row | 362 x **108**, two rows, 16 between |
| Row 1 | disc, title, meta, trend pill | disc, title, meta, **edit + delete** |
| Row 2 | — | trend pill `#ECFBED`, **status pill** |
| Published | third item on the byline | its own pill — `#FFF1DB`, or neutral when not |
| New Session | only in the drawer | **pinned footer**, 52 tall, radius 40 |

**The card is 108 because the frame holds its text block at 32**, rather than
letting it size to content. The title's box is 16 with 20 of leading and the
meta's is 12 with 14, so each line overflows its own box by a pixel or two —
exactly how Figma draws it. Sized to content it comes out 114, and nothing
looks wrong, which is why that kind of drift survives a visual check. Measured
in the browser both ways.

Three tap targets on one row, because a 362-wide card with one destination
wastes the row: the disc plays, the text opens that session's conversation, the
icons act on the session. Delete asks first and really removes the row —
in this browser, until reload, which is the same contract as everything else
this demo remembers.

**Published moved off the byline.** A state badge and a byline are not the same
kind of fact; run together they read as one sentence. It also used to show only
on your own rows — a judgement call that the frame settles by giving the state
a pill with two values.

### The coin balance led nowhere, from nine screens

It was drawn in **thirteen** places. Seven used `CoinPill`; six were hand-rolled
copies that had drifted from it and from each other — 40 tall against 44, a 16
coin against 20, a `Coins` glyph against the ringed dot, Label 12 against Body
Small 14. All thirteen were a `<div>`. None of them did anything.

A balance is the most obviously tappable thing in a header — it is a number
about *you* — so tapping it and getting nothing reads as a broken app rather
than a missing feature. All thirteen are now the one component, and it is a
button that opens `/credits`, gated because what you have and how you spent it
is account-shaped.

**The ledger itself is not designed.** The Points pill carries no prototype link
in any frame read so far, so `/credits` renders the placeholder the app already
had for this — it says the screen is not built rather than opening blank, which
is what a route-less destination did. `PlaceholderPage` had been dead code since
it was written; this is its first use.

### A gap set in three places is the sum of three numbers

Home put **92px** between the Quick Start cards and the dark banner where the
frame puts 20. Nothing in the code said 92. Three rules each set part of it and
none of them knew about the others:

| Rule | On | px |
| --- | --- | --- |
| `pb-4` | the card scroller | 4 |
| `pb-40` | the content column | 40 |
| `mt-48` | the banner | 48 |

The content column's `pb-40` was written when that column was the last block on
the page. The full-bleed banner was added below it later with its own `mt-48`,
and nobody removed the padding underneath — so the page grew a gap more than
four times the frame's, in a place where no single number was wrong.

The column no longer sets a bottom gap at all. Every section on Home now owns
its own top margin and nothing else contributes: 40, 40, 16, 24, 48, 24, checked
in the browser. **One rule, one gap** — a gap nobody can point at in the source
is a gap nobody can fix against a frame.

The Quick Start cards also sit 16 apart in the frame, not 12.

### The notification row is one disc, not two

`16659:42262`. Built from the frame after its variables were bound, and three
things had drifted far enough to make it a different screen rather than an
imprecise one.

**Every row carried a second 40 circle** on the right — the session's cover with
a play badge — where the frame has one, on the left. Two discs per row turned a
list you scan into a list you read, and the second one made a promise the row
did not keep: it looked like a play control and navigated to the session page.

**The faces wore the brand's conic ring.** That ring means *session* everywhere
else in the product; on a person it says the wrong thing. The frame's are plain
photographs, so these are now too — over a neutral gradient, because the
gradient is the load floor rather than decoration.

**Only one of the frame's three row types existed.** The frame has three
components, and the feed modelled one:

| Kind | Mark | Reads |
| --- | --- | --- |
| `person` | their face | **Name** in semibold, then what they did |
| `account` | a sparkle on `#FFF1DB` | one sentence, no name |
| `challenge` | a white mark on `interactive/primary` | one sentence, no name |

The two new kinds carry no session, so their rows are not links. A row that
cannot go anywhere should not look like one that can.

**The filter chip is an outline, not a fill.** `Tab Set_notClear` draws an
unselected chip as a `#D6D6D6` stroke over nothing. It was rendering as
`background-elevated`, which gave the row five solid blocks and left the
selected chip competing with them instead of standing out of them. That fix is
in the shared `Chip`, so it lands on Explore, Sessions, Home and Session
settings too.

Measured against the frame in the browser: rows pitch at 52 (a 40 mark and a 12
gap), the mark sits at the 20 page gutter, the title is Title Large Regular
24/32 on `text/primary`, group headings are Body Small on `text/secondary`, and
the header is `surface/default` — which needed `bg-surface-default!`, because
`.u-sticky-top` paints `background-default` from outside Tailwind's utility
layer and wins on class order alone.

**One deliberate departure.** The frame repeats "listens to your session" on
every row, which is a designer duplicating a component rather than a statement
that the feed has one verb. The catalogue keeps its five actions — recreated,
saved, started following, joined the challenge — because a feed that says one
thing fifteen times cannot be reasoned about, which is the same reason nothing
here is Lorem.

### Notifications, and the file was fixed before the app was

`16659:42262`. The rule the whole Figma-alignment pass runs on: where the frame
and the app disagree the frame wins, but where the frame disagrees with its own
variables, **the frame is corrected first** — otherwise the app inherits a drift
and the next export reintroduces it.

The screen carried 13 text nodes on no style and 26 raw fills. All of it was
bound in the file, on the three notification **main components** and the shared
tab set rather than on this frame's instances, so every screen using them moved
together. The full account is in `DESIGN-SYSTEM-HISTORY.md`; two calls are
product decisions rather than bookkeeping:

- **`#331B04` is not a second ink.** The title, every row's message, the chip
  labels, the back arrow and the challenge badge were painted in it;
  `text/primary` is `#3C2405`. Two dark browns doing one job, and the difference
  is invisible at any size the app renders. Bound to the role, not preserved.
- **`#9A9A9A` is `text/secondary`, and that darkens it.** The group headings and
  every age stamp used it. It falls between `neutral/300` and `neutral/400` with
  no slot of its own, so the choice was to add a variable for one screen's grey
  or to bind it to the role it was already playing. The role won, and the
  timestamps read a little heavier now. Worth knowing before someone files it as
  a regression.

`#FFF1DB` (the sparkle badge) and `#D6D6D6` (the outline on every inactive
filter chip) still have no variable anywhere in the file. They are reported, not
invented — see the open table in `DESIGN-SYSTEM-HISTORY.md`.

What the app changed with it: the title is `Title Large Regular`, not the
Semibold `Title Large`; the points figure is Body Small 14, not Label 12; the
back arrow is `icon/default`, not `icon/strong`; the age stamp is Light.

### The drawer does not draw its own status bar

The mobile drawer rendered a `MobileStatusBar` at the top of the panel, and the
page behind it renders one too — so opening the menu stacked two clocks up the
left edge. The frame's 66 of top padding is measured from the top of the phone,
not from a bar of the drawer's own. The panel now reaches that 66 as padding.
Same position, one clock.

### Variable coverage in the Figma file

The design file is the upstream of `design-tokens/figma-export.json`, so a frame
that paints a raw hex is a token the code can never inherit. The file was
audited against its live variables — 251 across five collections — at two
levels.

**The export is in sync.** Every variable matched the snapshot except
`font-family/base`, which the export carried as "SF Pro" where the variable says
**Mulish**. Fixed; regeneration touched two lines of `tokens.css`, which is the
proof nothing else had drifted. `radius/20` and `radius/48` are genuinely not
variables — several frames use them as raw values by decision, so the code's
`rounded-[20px]` and `rounded-tl-[48px]` are correct.

**The frames are not.** Measured across a representative screen (247 nodes):

| Property | Bound to a variable |
| --- | --- |
| Fill | 84% (68 of 81) |
| Type style | 81% (29 of 36) |
| Radius | 0% (0 of 78) |
| Spacing | 4% (16 of 359) |
| Stroke | 0% (0 of 25) |

Colour is close to done; geometry has effectively never been bound. Rolled up to
components, **10 of 59 fail on colour and 50 of 59 fail on geometry.**

**The ten colour failures are marked in the file.** Each carries a `_notClear`
suffix on its name so the gap is visible in the layer panel and the assets
panel, rather than living only in this document. Six nodes cover the ten,
because a component inside a component set takes its name from its variant
properties — renaming the child would rewrite `Size=Default` into
`Size=Default_notClear` and break every instance, so variant members are marked
on their parent set instead:

| Node | Kind | Name |
| --- | --- | --- |
| `16478:12871` | Component set | `Home_notClear` |
| `16480:15513` | Component set | `Button_notClear` |
| `16538:21522` | Component set | `TabItems_notClear` |
| `16538:21547` | Component | `Tab Set_notClear` |
| `16538:21548` | Component | `Homepage/Banner_notClear` |
| `16541:21631` | Component set | `Button_notClear` |

The suffix is a to-do marker, not a permanent name. It comes off when the
component's fills are bound — which for several of them is blocked on the
decisions below.

**The component library is now on Mulish, and so are its styles.** `Set of
Component` (16596:9091) was audited node by node: 96 text nodes, of which 67
were on a text style and 29 were not. The split was exact — every styled node
was SF Pro, every unstyled one Sofia Pro or Mulish. And the 67 were not as bound
as they looked: all 13 `Aurelia/*` styles hard-set **SF Pro** and bound only
`fontSize` and `lineHeight`, so `font-family/base` saying Mulish changed nothing
in the file. Three families in one library, and the variable governing none of
them.

All 13 styles now resolve to Mulish and bind `fontFamily` and `fontWeight` as
well, so the family is the variable's to change. Every text node follows: 96 of
96 on a style, 96 of 96 on Mulish, and every solid text fill on a semantic
colour variable — none of which needed a token that did not already exist.

**The scale grew by three, not because a size was missing but because a weight
was.** Nine nodes could not be bound: button labels and an eyebrow at 12
Regular, the Home stat figures at 24 Regular, the banner headline at 32 Regular.
The sizes all had variables; what the library lacked was a *style* at those
sizes in Regular — it had 12 Medium and 12 Light, and 24 and 32 only in
Semibold. Adding `Label Regular`, `Title Large Regular` and `Headline Regular`
was the right call over restyling nine nodes to a heavier weight, because the
alternative changes the design to fit the system rather than the other way
round.

The snapshot was 9 text styles behind a library of 13 even before that, so it
now carries all 16 and `tokens.css` emits a class for each. The four Light
variants were previously composed in code as `text-style-caption font-light!`;
that still works, and the named classes are additive.

Two things the sweep did **not** cover, and they are the next pass: every fill
and stroke on a non-text node in that section, and the nine `_notClear` markers,
which cannot come off on the strength of text alone.

**Three decisions block the rest of the colour work:**

- **`#FF881B`** is used as an accent 35 times across 16 files and has no
  variable anywhere — not in Semantic, not under `primary/`, not under `amber/`.
  It needs one before any of those uses can bind.
- **`#D6D6D6` and `#E0E0E0`** are used as strokes and have no variable. The
  existing `border/*` values are near misses, not matches, so this is a choice
  between adding two variables and moving the frames onto the existing ones.
- **The radius scale** would need 20, 5, 40, 25 and 60 added to be able to
  describe what the frames actually draw. Binding radius is not possible until
  that set is agreed.

Spacing is a different shape of problem: 343 unbound values, but nearly all of
them already sit on the scale. That one is mechanical once someone decides to
spend the time.

### A session row states two things the catalogue never had

Sessions (Figma 16523:14684) lists one session per 68px row. Two markers were
added to it that the frame does not carry, and each needed a rule rather than a
field:

- **Recreated.** Derived, not stored. Every session opens on an Aurelia starter
  template, so a lineage of two steps is an original — template, then its
  author — and a third step means a person stood between them. That is exactly
  what recreating is: clone and modify. Three of the twenty-one qualify, which
  is what makes the glyph worth showing at all.
- **Published.** A flag, absent meaning true because everything in the
  catalogue is out in the world. It is shown **only on your own sessions**, and
  that is a judgement call worth overruling if it is wrong: the label exists to
  separate a session you have put out from one still sitting in the cockpit,
  and that distinction only has two sides for the person who made it. On a
  stranger's row it would be a badge every row wears, which says nothing and
  costs the author its width on a 10px line.

A draft shows no label rather than saying "Draft" — the absence is the state.

**The row has two tap targets.** The play disc opens the player; the rest of
the row opens that session's conversation. That is the frame's own prototype
rather than an invention — its transition lands on 16523:8166, which is a
cockpit thread, not a detail page.

**And it opens that session's conversation, already made.** A row is a
finished thing, so the thread behind it is the one that produced it: Aurelia's
lines name the session, its changes are laid open rather than folded, and the
apply chip is there to change them. `/chat` is a new session and `/chat/:slug`
is an existing one; the folded deck belongs to the first, because a fold is
Aurelia handing over a proposal and these changes are already in the thing.

### Three ways into the cockpit, and they are not the same room

The mock catalogue now carries drafts, so all three states are reachable:

| Opening | Route | What the thread is |
| --- | --- | --- |
| A new session | `/chat` | Empty. The prompts do the talking. |
| One you made and have not published | `/chat/:slug` | It exists and only you can play it. There are no figures, because nobody has played it, so Aurelia talks about what is still wrong with it and publishing is the obvious next move. |
| One that is out | `/chat/:slug` | Now there are figures, and the conversation is about changing something people are already using. |

**A draft is yours and shows only where it is yours.** Every public surface —
shelves, categories, the creator index, and the Sessions screen's "All" —
reads the published catalogue. "Created by you" is the one place a draft
appears, which is what makes that filter worth a tap rather than a narrowing
of the same list.

A draft also carries no plays, no recreations and no outcome, because none
have happened. The figure pill on its row is absent for that reason rather
than by styling, and a creator's "34 published sessions" counts only what is
out.

### Explore's header filters, and its creators are real people

The trailing header control was a bookmark that did nothing. It is a filter
now, and it opens the category sheet this screen already had — so the header
control and the chip row below it are two ways to the same thing rather than
two different promises. It carries a dot when a category is in force: a header
that looks identical whether or not the shelf is narrowed is how somebody
loses track of why a shelf looks empty.

**Trusted Creators is built from the catalogue.** It used to name four people
of whom two, Daniel Carter and Maya Bennett, appeared in no session at all —
so tapping them could only ever go nowhere, and the counts beside them were
invented rather than counted. It now lists real creators, most published
first, each linking to their profile, and leaves the signed-in user out: a
shelf of creators to discover that leads with yourself is not one.

### New session opens the conversation, not a blank page

It used to empty the thread. A cockpit with an empty scroll is a worse first
screen than one already mid-conversation — and it left the default draft
naming a session, "Sleep meditation v1.2", that no message on screen mentioned.
New session now opens the demo exchange those two were always written against.

`reset()` takes the opening the thread should start on, so the entry points
that write their own — a Quick Start card, a Recreate — hand it over rather
than clearing and then setting. The thread never renders somebody else's
conversation on the way to theirs.

**The composer carries the accuracy caveat**, as the frame has it. It belongs
on a wellness product more than most: Aurelia talks about sleep and stress in
specific figures, and not one of them is a measurement.

### Four doors into the cockpit

The chat is never a destination of its own — there is no Chat entry anywhere in
the design. It is reached four ways, and each has to arrive somewhere coherent.

| Door | Where from | What the thread opens on |
| --- | --- | --- |
| **New session** | the drawer's button | the demo conversation |
| **Recreate** | a profile card, or `/recreate` | the fork, with the original attached |
| **Latest** | the drawer's recent list | that session's own thread |
| **Session / Quick Start** | a Sessions row, or an Explore card | that session, or that kind of session |

**Latest was the one that led nowhere.** Three inert rows naming Sleep
Meditation, Morning Mindfulness and Stress relief techniques — none of which
was a session — on the one shelf whose whole job is taking you back to a
conversation. It reads the catalogue now and each row opens `/chat/:slug`,
which is the same door a Sessions row uses.

There is no history to sort by, so the three are a fixed set rather than a
computed one; they stand in for the three the design named — a sleep one, a
morning one, and the one about stress.

### Every way into the cockpit starts its own session, and says so

Quick Start had two cards and both linked to a bare `/chat`, so whichever you
pressed you landed in the same demo thread — tap Affirmations, and Aurelia asks
how you found the sleep meditation. There are six now, each a real kind of
session with its own opening line, and pressing Create clears the thread before
seeding it.

**The cockpit knows what it is building.** It used to name one session in three
places regardless of what you had asked for: the progress card read "Sleep
meditation v1.2", Ready to play opened `dolphins-frequency`, Publish viewed it,
and the header's transport fell back to it. That is a `draft` now — a title and
the catalogue session it stands in for — and every entry point sets it:

| You came in by | The draft becomes |
| --- | --- |
| New session | the default, which matches the demo thread's own copy |
| A Quick Start card | *Card* v1.0, standing in for a session of that kind |
| Recreate | *Original* v2, standing in for the original |
| A session row | that session |

Nothing is really generated, so "Ready to play" has to open *something* — and
it has to be something of the same kind. Opening a sleep session after asking
for a focus session is the same mismatch one screen later.

**Starting is not continuing.** Quick Start and Recreate both clear the thread
first. Without that you could start Affirmations, walk to a profile, fork a
sleep session, and end up with one thread claiming to be both. Each is keyed on
the navigation rather than a flag, so pressing Create twice starts twice.

**The first answer brings the recommendations with it.** A thread that has had
nothing proposed used to still offer "Apply new changes (3)" — three changes to
nothing. Aurelia now hands the deck over with her reply to your first message,
so the chip always refers to something on screen.

### Coming back from the player is returning, not starting over

Going off to play what you have just built and pressing Back was the one path
that threw the work away. New session, apply the changes, watch it reach 100%,
press play, press Back — and the cockpit was the opening conversation again,
offering "Apply new changes (3)" as though nothing had happened. The only thing
left on screen was the mini player at the top, naming a session that, according
to the thread, had never been made.

**A door opens once, and the history entry has to say so.** Each entry point
writes its instruction into the history entry — `{ fresh }`, `{ start }`,
`{ recreate }`, `{ ask }` — and a history entry is not consumed by being used.
Back pops to that same entry and hands the cockpit the same instruction again.
The guards against that lived on the page, so leaving for the player destroyed
them on the way out. The entry is now replaced with a stateless one as soon as
it has been played out: the history says "the cockpit", which is what it is
once you have arrived, and Back has nothing left to re-run. Pressing New
session again is a fresh navigation and still starts over.

**A borrowed recording keeps the name of the thing you made.** Nothing is
really generated, so a session you build plays a catalogue session standing in
for it. That is a sound mock — the stand-in is the same kind of session, picked
for it — but four of the six have an author of their own, and announcing them
is the point at which the mock shows: you watch "Sleep meditation v1.2" reach
100%, press play, and the deck reports "Night Rain Sleep by Sophia Reynolds".
The screen that knows what it built now says so, and the player and the mini
player believe it. The recording is borrowed; the name on it is not.

The rename is scoped to a draft. A thread about a session that already exists
is making a new cut of *that* session, which is still its author's — claiming
it credited the wrong person and, because the name also keys the cut, left one
session on the deck under the previous draft's title.

**The card reports the state, not the invitation.** "Ready to play" over a
session that is already loaded and audible asks you to do the thing you just
did. Once what the thread built is the thing on the deck, the card reads
*Playing now* or *Paused* instead.

### A change to a built session makes a new version of it

Asking for a female voice on a session that exists used to change nothing. The
message went in, Aurelia said "a female voice, unhurried — I will keep the cue
count low", and the card underneath went on reading *Sleep meditation v1.2 ·
Ready to play*: the cut from before, unchanged. The app was claiming to have
done something it had not, and the only record of the request was the
transcript, which does not play.

**A request that changes the mix is the request.** It does not also need to be
applied — the deck and its Apply chip are how a *proposal* becomes a build, and
a direct instruction is not a proposal. So the eleven replies that agree to
change something (length, voice, the layers, the levels) now start a build, and
the card goes back to *Creating your new session..* and comes out as the next
version.

Two cases deliberately do not build:

- **A thread with nothing made yet.** There the deck is the proposal and Apply
  is what builds it, so a change asked for beforehand is noted rather than
  acted on — which is what the fallback reply has always said in as many words.
- **Anything that is not a change.** A brief ("I can't sleep") proposes; an
  answer about last night's sleep reports. Neither touches the session.

### Session settings is a second door into the same build, queued rather than one at a time

The deck's Apply chip and a direct chat instruction both start a build
immediately, one change at a time. Session settings — the Visual and Sound
tabs' "Explore new styles" grid — needed a third: several changes picked
across both tabs, reviewed as a set, then sent together.

**Add and Remove are the same action in reverse**, not "Add" turning into a
disabled "Added." Tapping a card queues it and flips its own button and
border; tapping an applied style's own chip queues it for removal the same
way. Nothing builds yet — the queue is a draft, held in the screen, not the
session.

**One floating "Apply changes" button, counting across both tabs.** A style
queued on Visual has to still read as queued after switching to Sound, so
the count is a total, not per tab, and the button itself is one thing
rather than a bar duplicated per tab. It composes the same sentence a
person would type — "Add Tibetan singing bowls, Aulos (Greek flute)" — and
hands it to chat as if it had been typed there, which is what actually
starts the build described above. Session settings names the change; the
thread is still the only thing that applies one.

### Every cut is kept, and you can go back to one

Generating is not a state the session passes through on its way back to the
same thing. Every build is a new version, the one before it still exists, and
until now nothing held them: try a female voice, dislike it, and there was no
way back.

**Version history** sits in the cockpit's ⋯ menu, above Settings — it is about
the session in front of you, and it is the way out of a change you regret. Each
row is a cut, named as the progress card named it, with the request that
produced it underneath; that request is the only thing that tells two versions
apart once they are both just a name and a time.

- **A build is recorded when it starts, not when it finishes.** The row for the
  one in flight reads *Creating — 40%* and offers no way back to it, which is
  more use than hiding it. Recording on completion would mean carrying the
  request across a screen the user can walk away from mid-build.
- **Reverting moves the pointer; it does not delete what came after.** Losing
  three cuts because you wanted to hear the second one again is a worse surprise
  than a history that keeps growing. The later versions stay, and you can come
  forward.
- **The next build numbers from the newest, not the current one.** Revert to
  v1.2 with a v1.4 in the list and the next change is v1.5, not a second v1.3.
  History stays a list rather than a tree, which is the right shape for a demo
  and the only one a single card can point at honestly.
- **Reverting says so in the thread**, for the same reason applying does: a
  session that changes with nothing in the transcript to explain why reads as
  the app acting on its own.

Where the history starts depends on the door, and it has to agree with the
opening line:

| You came in by | History starts |
| --- | --- |
| New session | at *Sleep meditation v1.2* — the demo thread's first line says it exists |
| A session row | at that session, published or not; the next build is its v2 |
| Quick Start, Recreate | empty. Nothing has been made, so the first build *is* v1.0 rather than the thing after it |

### The folded deck reads as three cards because the two behind show their orb

Figma "Frame 74" (16523:8076). Three cards of the same size — 135 x 133 — all
tilted the same 12°, stepping 59 to the right and a little down. Not a fan: a
spread of angles reads as a splay.

The thing that makes it a deck rather than one card with paper behind it is
that you can see *which* changes are waiting, and that comes down to one detail
that is easy to miss. At a step of 59, the second card's orb lands at 101–152
in the front card's own coordinates, and the front card ends at 135 — so if the
cards behind place their orb where the front card does, every pixel of it sits
behind and all you get is a white edge. Our first build did exactly that.

**Figma's trick is that cards two and three are not the front card repeated.**
They centre their content, which moves the orb — and only the orb, because the
text block is stretched and stays where it is — from x=12 to x=42. Those 30px
are what push it past the card in front, so about 17px of each orb shows. The
front card keeps the asymmetric 36px top-left corner; the two behind are a flat
20, since their corner never shows.

The deck also runs the full width of the message column rather than being
indented under Aurelia's avatar, and the front card leads 4px into the gutter,
both as the frame has it. That is not only fidelity: indented, the steps had to
tighten on a narrow screen, and tightening the step is precisely what puts the
orbs back into hiding.

### A profile card is a session, and both of its controls do something

The profile's shelf was a hardcoded list of four beside the catalogue, and
three of those titles — Soft Reset, Deep Space, Clear Skies — matched no
session. That is why neither control on a card could go anywhere: the play
glyph was a `<span>` and Recreate was a button with no handler. A card that
names a session has to *be* a session, so the three now exist in the catalogue
as Adam's, and both branches of the screen read from it.

- **Play** opens the player on that session.
- **Recreate** goes straight to the cockpit with the session attached, not via
  `/recreate`. That screen is where you state changes against an original;
  from a profile card there are none to state yet, so it would be a form to
  skip. The brief is the same shape either way, and an empty change list is
  what the cockpit already reads as "keep it as it is".

**Attached, not just named.** The fork used to arrive as a sentence — *Recreate
"X" by Y, at N minutes* — which names the session but does not show it, and
gives you no way to hear the thing you are about to change. The message now
carries the session itself: cover, title, author, run time, and a play control.
It hangs off that message rather than the end of the thread, so everything said
afterwards comes after it.

**One number changed on screen, and it was wrong before.** The Dolphins
frequency card showed 18.5k plays on the profile and 124k everywhere else,
because the two were different sources. It reads the catalogue now, so a
session's figures no longer depend on which screen you are looking at. The
frame carries the old figure; the catalogue is the one that also feeds Sessions
and Progress.

**"6 Posts" is the one designed figure that reconciles** — four published
sessions plus the two drafts, which is everything Adam has made. Played and
Recreated stay as designed, because summing the catalogue gives a much larger
number: one session alone has 124k plays.

### Progress — what a session has done since it was made

Insights in the cockpit's menu opens `/progress/:slug` (Figma 16523:19484,
19606, 19752): three tabs over one shell, which is how the frames are drawn —
header and chip row identical across all three, only the body changes. The tab
is in the query string rather than in state, so a link can open any of them and
coming back from a lineage entry returns to the tab you left.

| Tab | What it answers |
| --- | --- |
| **Chapters** | What this session is aiming at, and every earlier cut of it. The objective sits under a gradient hairline because it is what every figure on the other two tabs is measured against — and it is the only thing on the screen you can edit. |
| **Social Impact** | What it earned, how often it was played, how often it was forked; then who did what with it, and the chain it belongs to. |
| **Insights** | Patterns Aurelia claims to have noticed. Worded as tendencies — "tends to", "may be" — because nothing here is a measurement and the copy should not imply one. |

**A draft has nothing to show on Social Impact**, and says so rather than
printing zeroes: no earnings, no plays, no community. That falls out of the
same rule as the rest — nobody can play a session that is not published.

The objective is not the session's `intent`. That is the creator's sentence
about what the mix is for and it runs long; the objective is the listener's own
goal, short enough to sit on one line beside an edit button, as the frame has
it.

**A version card's play glyph plays that cut.** It opens the player at
`/play/:slug?v=<version>`, which shows the version's own title and art and puts
it on the deck under its own key — `slug#version`. The key matters: the deck
refuses to reload the track already on it, which is what keeps the cockpit's
transport from restarting a session you walked away from, and without a
distinct key pressing play on v1.2 would simply carry on playing v1.3. Hearing
what a change did is the reason the card carries a figure for that change at
all, so the glyph could not stay inert.

A version is the same session by the same person: only what the cut states —
its title, its art — overrides. The author, the recommendations and everything
else on the player stay the session's.

Two rules make it feel like one place rather than a reload:

- **Re-opening the session you are already in does nothing.** Go off to play
  it, or to its creator's profile, and coming back returns the thread exactly
  as you left it — a removed change stays removed. Same bargain the player
  makes with a track that is already on the deck.
- **The cockpit's transport plays the session the cockpit is about.** It used
  to play one fixed session whichever thread was open, which nobody could see
  until rows opened their own.

Both clients carry all of this. The row was read off the node rather than the
render, which corrected five sizes on each: the title is 14/19 not 16, the
byline and run time are 10/12 in #525252, the gap between them is 4, the
hairline is black at a fifth, and the figure's pill is 9 before the arrow and
12 after with the number in black. Duration is m:ss, so a session carries
seconds — mock, like the minutes beside it.

**Every size on all three tabs is read off the leaf node, not the depth-4
summary and not the render.** That matters because the summary stops before
the text nodes, so type is the one thing a shallow read cannot give you, and
it is the thing that reads wrong first. What the pass corrected:

| Where | Was | Is |
| --- | --- | --- |
| Stat tile padding | 16 all round | 20 left/right, 10 top/bottom |
| Stat figure | Semibold 28/32 | Regular 22/25, in black rather than the ink token |
| Stat label | body-small | 12/19 in #9A9A9A, 3 under the figure |
| Earnings coin | a lucide glyph inside a 48 gradient disc | the frame's own 40px gradient coin |
| Community row | one 20-gap list | 7 above and below its copy, ruled after every row in #F0F0F0 |
| Lineage row | 40 avatar, body/body-small | 35 avatar, 13/19 over 10/15, 10 apart |
| Lineage card shadow | the shared 0 5 24 4 at 5% | its own 0 4 14 at 8% |
| Insight cards | 16 apart, glyph inside the heading | 12 apart, glyph a 20px sibling 12 from a title/body/date column at 8 |
| Insight body | body-small | Light 300 12/19 in #525252 |

Two readings the frames do not settle, and what this app does instead:

- **A lineage row's caret points down in Figma** because the prototype treats
  it as a disclosure with nothing behind it. Here the row opens that session,
  so the caret points the way the row goes. Change it back when there is
  something to disclose.
- **The frames are set in Sofia Pro; the `font-family/base` variable says
  Mulish**, and the app follows the variable. Every size and line-height above
  is the frame's; only the face differs, and that difference is still open.

---

### Media, voice and sign-in are wired; three things behind them are not

The Flutter client now plays sound, records from the microphone, and treats
Google and Apple as two different doors. What sits behind each is worth stating
plainly, because each is a different kind of "not finished".

| Surface | Real | Still mock |
| --- | --- | --- |
| Session playback | the audio engine, the clock, the clip length | every session plays the same ten-second bed |
| Voice memo | the mic, the level meter, the file, playback | the transcript is a fixed sample string |
| Google / Apple | the two paths, loading, cancel, failure, which provider | no SDK; a dummy returns a fixed account |

**A cancelled sign-in gets no message.** The user dismissed the sheet
themselves; a banner about it reads as a telling-off. A network failure and a
rejection each get their own sentence, because they have different remedies.

**Apple's email is not an identifier.** It is sent once, on first
authorisation, and may be a private relay address that stops working if the
user disconnects the app. Accounts key off the provider's stable id. The dummy
returns a relay address on purpose so nobody writes code assuming otherwise.

**A signed-in state is still a client-side claim.** The id token is what a
backend would verify, and there is no backend to verify it — the same
limitation the email-and-password path already has. `docs/SSO.md` has what
turning any of this on actually requires.

---

## 07 · Staging and production

Until now the web client had one deployment, and "live" and "what we are
working on" were the same URL. That is fine while nobody outside the team has
the link and stops being fine the moment somebody does, because every push is
then a release whether or not it was meant to be one.

### 7.1 · Two branches, two sites

`web_app` is the working branch and stays the working branch: everything lands
there first, `admin_cms` is fast-forwarded to match it, and both are pushed
together. **`web_prod` is the production cut.** It only ever fast-forwards to
`web_app`, and only when the product owner asks.

That last clause is the requirement, not a convention. A change being finished,
tested and obviously correct is not a reason to move `web_prod`; somebody
deciding to release it is. An agent working in this repository does not make
that call.

The cost of the split is that a fix is live on staging and not in production
until somebody says so, and the gap is invisible from the code. The **This
build** panel is what closes it — see 7.3.

### 7.2 · The two sites do not share a feature-flag set

`/__demo` publishes a scope to Upstash KV through `/api/config`, and one store
sits behind every deployment of the project. Under a single key, rehearsing a
walkthrough on staging would change what the public site shows mid-demo — a
failure with no warning and no undo short of republishing.

So the key is scoped per environment. Production writes `aurelia:demo:config`,
unchanged, so every scope published before the split stayed exactly where it
was. Every other deployment appends its branch: `aurelia:demo:config:web_app`.

**The consequence is that the two sets never sync.** Publishing a scope on
staging does nothing to production, and the only way to move one to the other
is to open `/__demo` on the other site and publish it there. This is the right
default — a staging console that could reach production is the thing being
prevented — but it is a step somebody has to remember, so the console prints
the key it is about to write.

The endpoint is still unauthenticated, and scoping the key does not change
that: anyone who finds `/api/config` on either site can POST a flag set to it,
site lock included.

### 7.3 · The app says which site it is, on every screen

Two deployments of the same commit are indistinguishable from a screenshot, and
the two questions they produce — "is this live yet?" and "am I looking at
staging?" — have identical symptoms. `/__demo` opens with the **This build**
panel, and **Environment** is now its first row: `Production`, `Staging` or
`Local`, read from `VERCEL_ENV` when the bundle is built, not guessed from the
hostname.

Set `VITE_PRODUCTION_URL` and `VITE_STAGING_URL` on both Vercel projects and
each panel carries a link to the other, so moving between them is one click
rather than a URL somebody has to have kept. Both are optional: unset, the link
is absent, which is the correct rendering for a project with one deployment.

The console is not enough on its own, because most of the time nobody is
looking at it. A small badge — `Staging · 0.1.0 · d135f24` — sits at the foot
of the consumer drawer and at the foot of the admin sidebar, so the answer is
in view on whatever screen the question comes up on. It is a label, not a
control: it does not link to `/__demo`, because that console is deliberately
outside the password and a link to it from the drawer would hand every visitor
a way around the gate.

Staging is the loud one — the brand chip — and production is quiet grey.
Production is the normal state of affairs and does not need a banner; being on
the rehearsal copy without realising is the mistake worth interrupting for.

### 7.3.1 · Two identifiers, and only one of them can lie

The badge and the panel both carry a **version** and a **commit**, and they are
not the same kind of fact:

- **Version** is `package.json`'s `version` — the name a release was given. A
  person bumps it when `web_prod` moves. Nothing enforces that, so it can be
  stale.
- **Commit** is the short SHA the bundle was built from. It cannot be stale;
  it is what is running.

They are always shown together for that reason. The version is what a release
was *called*; the commit is what it *is*. Where they disagree, the commit wins
and somebody forgot to bump.

### 7.4 · What this does not solve

- **The password gate is still one shared password**, and it is still inlined
  into the bundle on both sites. Production being public-facing makes that more
  pointed, not less — see §09.
- **There is no promotion record.** `web_prod` fast-forwarding to `web_app` is
  the only evidence a release happened. `package.json`'s version gives a release
  a name, but nothing bumps it, tags it, or writes a changelog entry — the
  discipline is entirely human, which is exactly why the commit is printed next
  to it everywhere the version appears.
- **Data is not split, because there is no data.** Both sites run the same mock
  catalogue out of `src/lib/`. The moment a backend exists, "staging and
  production share a database" becomes the next version of the problem 7.2
  solves, and it will need solving again at that layer.

---

## 08 · States that do not exist yet

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

## 09 · Open gaps

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
- Sign-out is unreachable on mobile. On web it now lives on `/settings`,
  reached by the gear on your own profile.

**P2**

- Trusted Creators, Picked for You and Sessions with Biggest Impact each imply
  ranking with no defined input set. The last is built on self-reported figures,
  which is a weak basis for a shelf with that title.
- Cover art is hotlinked from a third-party CDN. Fine for a demo, not for
  production.

---

## 10 · Open questions

1. What is the real session lifetime? The current "signed out every launch" is a
   demo setting, not an answer.
2. What earns a coin, and what spends one?
3. What does the free tier cap, and what does paying remove?
4. Does a challenge participant have to appear on the public leaderboard?
5. What happens to sessions personalised on a signal source the user has since
   switched off?
6. Who owns a recreated session — and what share of its coins reaches the
   original creator, through how many generations of lineage?
