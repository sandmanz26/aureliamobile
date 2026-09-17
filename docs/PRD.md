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

- **One face.** Mulish, which is the `font-family/base` variable in Figma. Both
  clients spent a while quietly agreeing with each other about the wrong thing:
  this app's token export carried "SF Pro" and the Flutter app left the family
  unset, so each rendered its platform's system UI face.

Two differences are intended: the web renders a simulated phone status bar
because it is viewed in a browser, and platform chrome — drawer scrim, keyboard,
text selection — follows each platform's own conventions.

### One difference is not a design decision — it needs one

**The Flutter client's player has no sound.** Every audio package for Flutter
ships native code, and that app's single dependency and one-command build on a
fresh machine is what that buys; this client plays a ten-second mock bed at no
such cost. So on mobile the clock runs, the bar fills, the mini player behaves
exactly as designed, and nothing is audible.

That is the right trade while the catalogue is mock — there is no real audio to
play — and the wrong one the moment a session is a real file. The seam is one
method on `PlaybackController`; the decision to spend a native plugin on it is
a product call, not an engineering one.

**Both clients hold playback and the cockpit thread above their router.** A
session being built has to survive leaving the cockpit to play it, and a session
that is playing has to survive walking back to the cockpit. Owned by their
screens, each tore down the other.

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
- Sign-out is unreachable on mobile. On web it now lives on `/settings`,
  reached by the gear on your own profile.

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
