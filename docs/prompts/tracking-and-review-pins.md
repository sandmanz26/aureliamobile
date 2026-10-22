# Prompt — click insights + review pins, for another web app

Two internal tools built for Aurelia (click insights: U032/U034; review
annotations: the `/__demo` annotation tool, synced and version-scoped by U011), written as a prompt you can paste into an AI coding
agent working on a different project. The two parts are independent: paste
both, or only the one you want. Replace everything in `<ANGLE BRACKETS>`
first.

---

## The prompt

```text
You are adding two internal tools to this web app: (A) click insights — a
record of which screens people open and what they tap, reviewable later with
heatmaps — and (B) review pins — a floating button that lets reviewers drop
numbered notes on any screen, shared between browsers. They are tools around
the product, not product features. Build them so they can be switched off
completely, and never let them change how the app itself behaves.

Project facts (fill in):
- App name / storage prefix: <app>            (keys below are "<app>.…")
- Stack: <React 18/19 + React Router | Next.js | Vue | …>
- Server functions: <Vercel /api/*.ts | Next route handlers | Express>
- Key-value store: <Upstash Redis REST (KV_REST_API_URL / KV_REST_API_TOKEN) | other>
- Environments: <production branch name> and <staging branch name>
- Feature flags: <existing flag system, or "none — add a localStorage flag">
- Mobile breakpoint for the review button: <500>px

Read the codebase first and follow its conventions (styling system, icons,
naming, comment density). Do not add dependencies unless the project has no
way to do something below.

======================================================================
SHARED RULES (both tools)
======================================================================
1. Storage contract. Each tool has one server endpoint backed by the KV
   store. When the store's env vars are missing, the endpoint answers
   HTTP 200 `{ configured: false, ... }` and the client falls back to
   localStorage — so local dev and a misconfigured deploy still work, and
   the UI says which mode it is in. Never throw on a missing store.
2. Per-deployment scoping. One store usually sits behind every deployment,
   so derive the key from the environment: production keeps the bare key
   (e.g. `<app>:insights:clicks`); every other deployment appends its branch
   (`<app>:insights:clicks:<branch>`), sanitised to [a-zA-Z0-9._-]. On Vercel:
   bare key only when VERCEL_ENV=production AND the branch is the production
   branch (a staging project can also report VERCEL_ENV=production). Return
   the key as `scope` in every response so the UI can print it.
3. Validate every POST on the server — both endpoints are unauthenticated.
   Check types, string lengths, array sizes; drop anything that fails. Say in
   a comment at the top of each endpoint that it is unauthenticated and what
   that means (anyone can read/clear it), and why that is acceptable for an
   internal tool. Never store anything that would make that unacceptable.
4. `Cache-Control: no-store` on every response.
5. Overlays render through a portal to document.body, with a very high
   z-index. (A transformed ancestor — page transitions often use one — makes
   `position: fixed` relative to that ancestor instead of the viewport.)
6. Both tools are off on their own admin/console route, and each marks its
   own DOM with a data attribute (`data-insights-ignore`,
   `data-review-pins`) so neither records nor reacts to the other.
7. A flag turns each tool off. Default: insights ON in staging; in
   production only after the consent decision below. Review pins OFF until
   a reviewer switches them on.

======================================================================
PART A — CLICK INSIGHTS
======================================================================
Goal: answer "which screens do people open, what do they tap, where do they
get stuck" without recording anything personal.

Privacy rules (non-negotiable — put them in the file header):
- Never record what is typed into a field, field values, names, emails, or
  page content. For a field, record only its placeholder/name/type.
- Session id: random, per browser tab (sessionStorage), not linked to a user.
- Labels are a control's visible name (aria-label, else its text, max 80–120
  chars), never the surrounding content.
- Before this runs in production, the product owner decides on consent
  (banner / privacy policy). Until then, production default = OFF. Flag
  this in your summary; do not decide it yourself.

Client tracker (one module, e.g. `src/insights/tracker.ts`):
- Two event types, each with: type, t (ISO time), sid, page (pathname),
  vw, vh, and optionally `ui` (design version, if the app has variants).
  - view: on every route change, with `from` = previous pathname.
  - click: one capturing `click` listener on document. Find the nearest
    control with closest('a, button, [role=button], [role=tab], [role=link],
    [role=switch], [role=checkbox], [role=menuitem], [role=option], input,
    select, textarea, label, summary'). Record:
      x (% of window width, 1 decimal), y (page px = clientY + scrollY),
      docH, label, tag, href (links),
      kind: toggle | field | tab | menu item | chip (has aria-pressed) |
            card (area ≥ 24 000 px²) | link | button | "not a control",
      section: nearest dialog ("Dialog · <title>"), nav/aside, or the
            section/article/form/header/toolbar whose aria-label or first
            h1–h4 names it; else "Page",
      sel: a selector that finds the element again — try #id, then
            tag[aria-label="…"], then a[href="…"], accepting each only if it
            resolves to this exact visible element; otherwise a tree path with
            :nth-of-type, max 10 levels / 300 chars,
      ex, ey (% within the element), ew, eh (element px),
      state (aria-pressed/expanded/checked/selected/current, disabled),
      ms (since the screen opened), sy (% of the page scrolled into view),
      rage: true if this is the 3rd+ tap within 1 s within 40 px,
      dead: true if no control was hit (label "(not a control) …"),
      fx: watch for 700 ms with a MutationObserver (ignoring the tool's own
          DOM): pathname changed → "navigated" (+ `to`), DOM mutated →
          "changed", else "nothing". Push the event after the 700 ms.
- Batching: queue events; flush every ~8 s (max 200 per POST) and on
  visibilitychange→hidden / pagehide via navigator.sendBeacon. If the server
  says configured:false, stop calling it for this page load and append to
  localStorage (`<app>.insights.clicks`, keep the newest 3 000).
  On any network error, fall back to localStorage for that batch.
- Install once; return an uninstall function. Do not record on the console
  route, nor while a heatmap is being shown.

Endpoint `/api/clicks`:
- POST { events: Event[] } (≤ 200) → validate each, RPUSH as JSON lines,
  LTRIM to the newest 20 000. Reply { configured, scope, stored }.
- POST { clear: true } → DEL the key.
- GET → { configured, scope, events } (LRANGE 0 -1, skip unparsable lines).

Review page (inside the existing admin/console, e.g. `/<console>/insights`):
- Header: source ("Server · <scope>" or "This browser only"), total events,
  sessions, screens viewed, taps; Refresh; Clear (confirm first).
- Filters: date range, page, layout (mobile < 640 px, tablet < 1024 px,
  desktop), design version if the app has one.
- Cards:
  - Screens — views per page, each with "Heatmap" (opens the page with
    `?heatmap` in a new tab) and "Elements".
  - Problem taps — elements with fx "nothing", rage taps, and dead taps,
    sorted by count; explain each in one line of hint text.
  - Elements — per page: element label, kind, section, taps, % that did
    nothing, rage count, median ms-to-tap, median scroll depth; a row expands
    to show where on the element people tap (ex/ey dots) and the states seen;
    "Show on screen" opens `?heatmap=elements&el=<encoded sel>`.
  - Paths — the most common from → to screen moves.
- Empty state that explains how to generate data.

Heatmap overlay (mounted app-wide, active only when the URL has ?heatmap):
- Loads events, keeps only clicks for this pathname AND the same layout
  bucket as the current window (a phone's taps drawn over a desktop layout
  are meaningless).
- ?heatmap → a dot per tap at (x% of width, y px), translucent, in a
  pointer-events:none layer over the document.
- ?heatmap=elements → group by `sel`, find each element on screen (first
  visible match), outline it with its tap count; colour by share of
  "nothing" results. Re-measure every second and on any scroll (horizontal
  shelves move elements). Report how many recorded elements could not be
  found on the current layout.
- &el=<sel> → scroll that element into view and ring it.
- A small floating bar: count, mode switch (dots / elements), Close (removes
  the query param).

======================================================================
PART B — REVIEW PINS (floating comment button)
======================================================================
Goal: reviewers drop numbered notes on any screen of the running app, and
everyone on the same deployment sees them.

When it shows:
- Only when its flag is on, only below <500>px wide (the mobile web layout;
  use matchMedia and react to changes), never on the console route.
- Rendered in a portal, marked `data-review-pins`.

Data (one array, the whole set):
  { id (random), page (pathname), x, y (% of the viewport), vw, vh,
    scrollY (window.scrollY when placed or last dragged), ui? (design
    version, if any), text, createdAt, updatedAt }
  A pin's place in the document is left = x% of the CURRENT width,
  top = scrollY + y% × vh-at-placement. (y alone is only a fraction of one
  screen; without scrollY a pin lands wherever the page happens to be
  scrolled.) Pins scroll with the page.

UI:
- A 40 px round floating button (pen icon) with a badge = notes on this
  page. Draggable anywhere (pointer events, mouse + touch; < 5 px of travel
  counts as a tap); its position is saved (`<app>.reviewPins.button`) and
  clamped into the viewport on resize.
- Tap → menu (opens away from the nearest screen edge): Add a note ·
  All notes (n) · Save to .txt · Open a .txt · Delete all notes (danger,
  confirm, says how many) · Hide until reload. The menu's last line is the
  sync state, verbatim: "Synced — visible in any browser" / "Saving…" /
  "Connecting…" / "Local only — no server configured" / "Sync error — saved
  on this device only", with the scope underneath when synced.
- Add a note → placing mode: the button becomes ×; the next tap anywhere
  drops a numbered 26 px pin there and opens its note card.
- Note card: textarea (autofocus), Delete, Close; saves as you type. Esc
  closes whatever is open (card → list → menu → placing).
- Pins are draggable; tap opens the card. Numbered in reading order
  (version, page, top to bottom).
- All notes: a list in reading order with each note's page; tapping one
  navigates to its page, scrolls to it and opens it.
- If the app has design variants, a pin only shows in the variant it was
  written in, and list/count/delete-all are per variant.

Sync (`/api/annotations` or `/api/review-pins`):
- GET → { configured, scope, annotations }; POST { annotations } replaces
  the whole set (≤ 500 notes, text ≤ 4 000 chars, strings ≤ 300; validate
  each). Last write wins — say so in a comment; it is accepted for a
  low-traffic internal tool.
- Client: paint from localStorage (`<app>.reviewPins`) first, then fetch;
  poll every 15 s, but skip applying a poll while someone is placing a pin
  or has a note open; debounce pushes by 700 ms; don't push what you just
  received. configured:false → local-only mode for good on that load.

.txt export/import (how notes move between deployments or to people outside
them) — human-readable and lossless:
  # <App> review annotations
  # version: 1
  # exported: <ISO>

  --- #1 <id>
  page: /chat
  design: v2            (only if the app has variants)
  pos: 42.5, 61.2
  viewport: 390x844
  scroll: 240
  created: <ISO>
  updated: <ISO>
  note:
  <text, multi-line>
A note line that starts with "--- #" or "\" is written with a leading "\"
and unescaped on read; CRLF files parse the same. Import merges by id (the
file wins, so opening the same file twice never duplicates); a file with no
notes says so in a toast. After import, a file covering one page goes
straight to it, several pages open the list.
File name: <app>-annotations-YYYYMMDD-HHMM.txt.

======================================================================
DELIVERABLES AND VERIFICATION
======================================================================
- Code for both tools, the two endpoints, the review page, the heatmap,
  the flags; a short section in the project's README/CLAUDE.md describing:
  what is recorded and what never is, where to review it, the per-deployment
  scoping, the configured:false fallback, and that the endpoints are
  unauthenticated.
- Verify in a real browser (e.g. Playwright), not only by type-checking:
  1. Without KV env vars: endpoints return configured:false; clicks land in
     localStorage; pins work locally; the menu says "Local only".
  2. Tap a button, a link, a non-control, and the same spot 3× fast →
     events have the right kind, fx, dead and rage. Type into a field and
     confirm its value appears nowhere in storage.
  3. ?heatmap and ?heatmap=elements draw over the right elements at phone
     and desktop widths; &el= scrolls to one.
  4. Drop a pin, scroll, reload → same spot. Resize → it follows width.
     Export .txt, delete all, import → identical notes.
  5. With KV set: a pin dropped in one browser appears in another within
     one poll; staging and production keys differ.
  6. Both tools ignore each other's DOM and are absent on the console route.
- In your summary, list anything you could not verify and the open
  decision on consent for production tracking.
```

---

## Notes for whoever uses this prompt

- **The consent decision is still the owner's.** On Aurelia, click insights
  is on by default and has been live in production since U044. The prompt
  sets the production default to off until that decision is made (journal
  O1 #15).
- **No KV store means nothing is lost.** Both tools work in local-only mode,
  which is enough for a single reviewer. Sharing between browsers needs the
  KV env vars.
- **Source on `web_app`:** `src/demo/insights/` (tracker, overlay,
  ElementsTable), `src/pages/InsightsPage.tsx`, `api/clicks.ts`,
  `src/demo/annotations/` (DemoAnnotator, format), `api/annotations.ts`.
