# Design system history

Every change that has touched a **Figma variable**, a **design token**, or the
**type scale** — what changed, why, and what it cost. Behaviour and product
reasoning live in `PRD.md`; this file is only the system underneath.

Append to the log when you change any of:

- a variable in the Figma file (`2QV1yuYjiwYrhSsxODi7LZ`, five collections)
- `design-tokens/figma-export.json` — the snapshot, which is the repo's source
- `src/styles/tokens.css` — **generated**, never hand-edited
- `scripts/build-tokens.mjs` — the generator between them
- an `Aurelia/*` text style

---

## Current state

Audited against the live file on **2026-09-17**.

| | Count |
| --- | --- |
| Variables in Figma | **251** across 5 collections |
| Variables in the repo snapshot | **251** |
| Value mismatches | **0** |
| Variables missing from either side | **0** |
| Reaching CSS as a custom property | 231 |
| Reachable through `--spacing: 1px` | 20 (`p-16`, `gap-24`, …) |
| `Aurelia/*` text styles | **16**, all Mulish, all binding family + weight + size + leading |

The collections:

| Collection | Count | What it holds |
| --- | --- | --- |
| Aurelia Brand | 68 | The raw ramps — `gold`, `espresso`, `red`, `amber`, `blue`, `green`, plus `white`/`black` |
| Aurelia Primitives | 68 | Aliases of Brand under role names — `primary`, `neutral`, `danger`, `warning`, `info`, `success`, `base` |
| Aurelia Semantic | 33 | What components actually bind — `surface/default`, `text/primary`, `icon/inverse`, `button/*` |
| Aurelia Numbers | 50 | `spacing` (20), `radius` (9), `size` (11), `padding` (5), `margin` (5) |
| Aurelia Typography | 32 | One family, 4 weights, 3 letter-spacings, 12 size/line-height pairs |

---

## Log

### 2026-09-17 — Notifications (`16659:42262`) bound at the source

The frame carried **13 text nodes with no style at all and 26 raw fills**. Fixed
in the file first, per the rule that the design is the source and the app
follows it — and fixed on the **main components** rather than per instance, so
the three notification variants (`16659:42062` sparkle, `16659:42061` play,
`16659:42060` challenge) and `Tab Set_notClear` (`16538:21547`) carry it
everywhere they are used, not only here.

**Styles applied to 7 nodes** that had been set by hand at the right size and
weight but bound to nothing:

| Node | Was | Now |
| --- | --- | --- |
| the `1s` / `1h` stamps (×4) | Mulish Light 14, AUTO leading | `Aurelia/Body Small Light` 14/20 |
| Today / Yesterday / Last 7 days | Mulish Regular 14, AUTO leading | `Aurelia/Body Small` 14/20 |
| the `1,323` points figure | Mulish Regular 14, AUTO leading | `Aurelia/Body Small` 14/20 |

AUTO leading on Mulish 14 resolves near 17.6, so those rows all gained ~2px of
line box. That is the scale asserting itself and is the point of binding them.

**Two value-changing replacements.** Everything else was an exact match sitting
unbound; these two were a *different colour* doing a job a token already owns:

| Was | Now | Δ |
| --- | --- | --- |
| `#331B04` — the title, every row's message, four chip labels, the back arrow, the challenge badge | `text/primary` / `icon/default` / `interactive/primary` → **`#3C2405`** | imperceptible; two dark browns, one job |
| `#9A9A9A` — every group heading and every age stamp | `text/secondary` → **`#7B7B7B`** | **visible**: the greys darken |

`#9A9A9A` sits between `neutral/300` `#CBC4B8` and `neutral/400` `#7B7B7B` with
no slot of its own. Inventing a variable for one screen's grey would grow the
palette to fit a drift; binding it to the role it was already playing is the
cheaper correction. The timestamps read slightly heavier as a result.

**Exact matches, now bound (13):** `#FFFFFF` → `surface/default` on the back
button's disc and the points pill, `icon/inverse` on the sparkle, leaderboard
and play marks; `#000000` → `icon/strong` on `menu-01`.

**Still without a variable** — reported, not invented:

| Colour | Where |
| --- | --- |
| `#FFF1DB` | the sparkle badge behind the upgrade notice |
| `#D6D6D6` | the outline on all five inactive filter chips |

The iOS status bar and home indicator were left alone throughout: `#0E0E0E` at
98% is Apple's chrome, not ours.

### 2026-09-17 — Named padding and margin aliases reach the CSS

The full 251-variable audit against the live file found **no drift at all**:
every name present on both sides, every value identical. The only gap was
representation, not content.

`padding/xs…xl` and `margin/xs…xl` had no CSS form of any kind. `spacing/16` is
reachable as `p-16` because `--spacing` is 1px, but `padding/md` is a *name* for
16 and the name is the point — it is what a frame is bound to in the file. Ten
tokens added: `--padding-xs…xl`, `--margin-xs…xl`.

**`--spacing-*` was deliberately not emitted**, and this was tested rather than
assumed. It is a live Tailwind v4 theme namespace. Probing the compiler:

```
--spacing-16 defined   →  .p-16  { padding: var(--spacing-16) }
--spacing-13 undefined →  .p-13  { padding: calc(var(--spacing) * 13) }
```

A partial namespace is safe — defined keys win, undefined ones fall back — and
every `spacing/N` in Figma equals N, so both paths give the same pixels.
Emitting it would buy nothing and split one scale into two resolution paths.
`--padding-*` and `--margin-*` are not namespaces, so they are plain tokens and
change no utility.

Purely additive: ten unused custom properties, no visual change.

### 2026-09-17 — `da694be` — The type scale is Mulish, and it has sixteen styles

The largest correction so far, and the one that had been hiding the longest.

**The library said one thing and did another.** All 13 `Aurelia/*` text styles
hard-set **SF Pro** and bound only `fontSize` and `lineHeight`. `font-family/base`
had said Mulish since the file was built and governed nothing: styled text was SF
Pro, unstyled text was Sofia Pro, four stray nodes were Mulish. Three families in
one library, and the variable ruled none of them.

All 13 now resolve to Mulish and bind `fontFamily` and `fontWeight` as well, so
the family is the variable's to change.

**Three styles were added — because a weight was missing, not a size.** Nine
nodes could not be bound to anything: button labels and an eyebrow at 12
Regular, the Home stat figures at 24 Regular, the banner headline at 32 Regular.
Every one of those sizes already had variables. What the library lacked was a
*style* at those sizes in Regular — it had 12 in Medium and Light, and 24 and 32
only in Semibold.

| Added | Resolves to |
| --- | --- |
| `Aurelia/Label Regular` | Mulish Regular 12/16 |
| `Aurelia/Title Large Regular` | Mulish Regular 24/32 |
| `Aurelia/Headline Regular` | Mulish Regular 32/40 |

Adding them beat restyling nine nodes heavier, which would have changed the
design to fit the system rather than the other way round.

**The snapshot was 9 text styles behind a library of 13 even before that**, so it
now carries all 16 and `tokens.css` emits a class for each. The four Light
variants had only ever been composed in code as `text-style-caption font-light!`;
that still works and the named classes are additive.

Component section `16596:9091` was brought with it:

| | Before | After |
| --- | --- | --- |
| Text nodes on a style | 67 / 96 | **96 / 96** |
| Text nodes on Mulish | 4 / 96 | **96 / 96** |
| Solid text fills on a colour variable | 84 | **92 — all** |
| Raw hex text fills | 8 | **0** |

Two real bugs fell out of it: the `Button_notClear` gradient and primary labels
were 16px with a **12px line-height** — leading below the font size, which clips
— and the uncleaned components used percentage leading (150%, 120%) giving
15/18/21/38.4 where the scale says 14/16/20/40.

### 2026-09-15 — `fa97144` — Mulish weights actually loaded

`index.html` pulls Mulish at 300/400/500/600 from Google Fonts — exactly the four
weights the styles bind.

### 2026-09-14 — `5ff8777` — The app font is Mulish, as the variable had always said

`figma-export.json` carried `font-family/base: "SF Pro"` where the variable said
**Mulish**. This was the *only* mismatch in a 251-variable audit — spacing,
radius, size, padding/margin, the 12-step scale with its line-heights, the
weights, the letter-spacing and all 33 semantic colours were already identical.

Regenerating touched **two lines** of `tokens.css`, which is the proof that
nothing else had drifted.

### 2026-09-03 — `ea8e84c` — Scaffold

`design-tokens/figma-export.json`, `scripts/build-tokens.mjs` and the generated
`src/styles/tokens.css` created together. 9 text styles in the snapshot against
13 in the file — a gap that went unnoticed for two weeks.

---

## Standing decisions

**The snapshot is the repo's source, not the Figma file.** `figma-export.json` is
a checked-in copy of the variables; `tokens.css` is generated from it by
`npm run build:tokens`. Editing `tokens.css` by hand means the next export
silently reverts you.

**Brand and Primitives are the same values under two names.** `gold/400`,
`primary/400` and `brand/default` all resolve to `#FFD242`; `espresso/900`,
`neutral/900`, `text/primary` and `icon/default` all resolve to `#3C2405`. Four
names for `#FFFBEB` (`gold/50`, `amber/50`, `primary/50`, `warning/50`). This is
a deliberate two-layer system — raw ramp, then role — but it is also a drift
risk: change one name and the other keeps the old value with nothing to flag it.

**`--spacing: 1px`**, so every numeric utility maps 1:1 to pixels. `p-16` is
16px, not 4rem. Read every number in this codebase as px.

**The radius scale is closed**: 0 / 2 / 4 / 8 / 12 / 16 / 24 / 32 / full.
`rounded-6`, `rounded-10` and `rounded-20` are not classes and render **square,
silently**. Eleven elements were doing exactly that before anyone noticed. Use
`rounded-[20px]` for off-scale values — several frames use them by decision.

**`.text-style-*` sits outside Tailwind's utility layer**, so it beats utilities
regardless of class order. Overriding a style's weight or leading needs `!`:
`text-style-caption font-light! leading-[15px]!`.

---

## Open — no variable exists

Found by sweeping section `16596:9091`. Each needs a decision, not a bind.

| Colour | Uses | Where | Note |
| --- | --- | --- | --- |
| `#FF881B` | 12 | New session gradient, glow ellipses, card washes | **The brand orange.** A literal in both codebases until it becomes a token |
| `#FFE682` | 3+ | The other end of every brand gradient | Near `gold/200` `#FFE58A` but not equal |
| `#818181` @94% | 15 | the `playlist-02` icon | Near `neutral/400` `#7B7B7B` but not equal |
| `#D6D6D6` | 6+ | tab borders, the Objective sheet's input and Cancel button | |
| `#E0E0E0` | 2 | Profile Card stat border | |
| `#331B04` | many | **every text and chip on the Insight frames** | Not `text/primary` `#3C2405`. Two dark browns doing one job |
| `#525252` | many | secondary body copy on Insights | Not `text/secondary` `#7B7B7B` |
| `#626262` | 1 | the Objective sheet's placeholder | |
| `#FFF1DB` | 3+ | the sparkle badge on Notifications, the Published pill on a session card | A pale gold wash; nearest is `gold/100` `#FFF3C4` |
| `#ECFBED` | 1 | the trend pill on a session card | A pale green; nearest is `success/50` `#F0FDF4` but not equal |
| `#F0F0F0` | 5 | the rules between Credits history rows | Lighter than `border/subtle` `#E4E1DC` |

**Radius 20 / 36 / 48 / 60 are raw in Figma too** — the recommendation card's
`[36,20,20,20]`, the New session button's 60. A design decision, not a sync gap;
do not invent tokens for them.

**The brand gradient is a paint style, and the code has a different one.**
`16658:17634` resolves to **`#FF8514` → `#FFE270`**. Both codebases write
`#FF881B` → `#FFE682` in thirteen places. Neither pair is a variable, the
difference is small, and changing it touches every coin and every CTA — so it
is recorded here and left alone until someone decides which is right.

**Strokes: 0 of 76 bound** in that section. Colour binding is nearly done on
fills and has never been started on strokes.

**~44 fills and strokes are an exact match for a token and simply unbound** —
`#3C2405` icon strokes/fills → `icon/default`, `#FFFFFF` strokes →
`icon/inverse`. Mechanical, visually a no-op, not yet applied.

---

## Changing a token

1. Change the variable in Figma.
2. Mirror it into `design-tokens/figma-export.json` — **surgically**. A
   `JSON.stringify` rewrite reformats all 500 lines and buries the next diff;
   that has already happened once and was reverted.
3. `npm run build:tokens`.
4. Check the `tokens.css` diff is the size you expect. A two-line change proving
   nothing else moved is the point of the generated file.
5. `npm run typecheck && npm run lint && npm run build`.
6. Append an entry above.
7. The Flutter client on `mobile_app` follows the web — see `CLAUDE.md`.
