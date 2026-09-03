# Aurelia Web

Frontend-only web client for Aurelia AI. React + Vite + Tailwind CSS v4, no backend.

## Design token sync

This is the important part. Every color, spacing, radius, and type-scale value
in this codebase is generated from `design-tokens/figma-export.json`, which is
a snapshot of the Figma file's variables (`Aurelia Brand`, `Aurelia Primitives`,
`Aurelia Semantic`, `Aurelia Numbers`, `Aurelia Typography` collections).

```
design-tokens/figma-export.json   <- snapshot of Figma variables (source of truth)
        |
        |  npm run build:tokens  (scripts/build-tokens.mjs)
        v
src/styles/tokens.css             <- GENERATED, do not edit by hand
        |
        v
  Tailwind utility classes (bg-surface-default, text-text-primary, p-16, rounded-12, ...)
```

**When the design changes:** re-export the variables from Figma into
`design-tokens/figma-export.json` (same shape, keyed by collection -> group ->
name -> value), then run:

```bash
npm run build:tokens
```

No component code needs to change — class names like `bg-brand-default` or
`text-style-title` keep working because they read from the regenerated CSS
custom properties. This only breaks if a *variable is renamed or removed* in
Figma, in which case grep the old name across `src/` and swap it for the new
one (should be rare — semantic tokens are the layer meant to absorb this).

### Naming convention

CSS variable names mirror Figma variable paths 1:1 (`/` -> `-`):

- `Aurelia Semantic` -> `text/primary` -> `--color-text-primary` -> `text-text-primary` / `bg-text-primary` utility
- `Aurelia Primitives` -> `primary/400` -> `--color-primary-400` -> `bg-primary-400`
- `Aurelia Numbers` -> `radius/12` -> `--radius-12` -> `rounded-12`
- `Aurelia Numbers` -> spacing scale drives Tailwind's spacing multiplier directly
  (`--spacing: 1px`), so `p-16`, `m-24`, `gap-8` etc. equal their token value in px.
- `Aurelia Typography` -> named text styles (`Aurelia/Title`, etc.) are available
  as `className="text-style-title"` (see the generated classes at the bottom of
  `tokens.css`).

## Structure

```
design-tokens/figma-export.json   Figma variable snapshot (edit this to sync)
scripts/build-tokens.mjs          Generator (design-tokens -> src/styles/tokens.css)
src/styles/tokens.css             GENERATED — Tailwind @theme block, do not hand-edit
src/components/ui/                Button, TextField, SegmentedControl, NavItem, AureliaLogo
src/layouts/AppLayout.tsx         Persistent sidebar (web adaptation of the Figma "Menu" drawer)
src/pages/SignInPage.tsx          /login
src/pages/ProfilePage.tsx         /profile
```

## Web adaptations from the mobile Figma designs

- Dropped the fake iOS status bar (9:41 / battery / signal) — not meaningful on web.
- The Figma "Menu" screen is a slide-over drawer sized for a phone; here it's a
  persistent left sidebar (`AppLayout`), the common web pattern for the same
  navigation, always visible instead of a triggered overlay.
- `SF Pro` is an Apple system font not licensed for web embedding. The font
  stack falls back to `-apple-system, BlinkMacSystemFont` (native SF Pro on
  Apple devices) then `"Segoe UI", Roboto, sans-serif` elsewhere. If an exact
  cross-platform match matters, swap in a licensed geometric sans (e.g. Inter
  or General Sans) at `--font-sans` in `design-tokens/figma-export.json`.
- Profile session-card photography and the avatar image are placeholders
  (gradients / empty ring) — no image assets were exported from Figma yet.

## Commands

```bash
npm install
npm run dev          # local dev server
npm run build         # typecheck + production build
npm run build:tokens  # regenerate tokens.css from figma-export.json
```
