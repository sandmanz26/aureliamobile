# Aurelia Mobile

Flutter app for Aurelia AI. Design tokens under `lib/core/theme/` mirror the
Figma variable structure 1:1:

`Aurelia Brand` (seed colors) -> `Aurelia Primitives` (50-950 ramps) ->
`Aurelia Semantic` (role tokens) -> `Aurelia Numbers` (radius/spacing/line-height).

## Getting started

```
flutter pub get
flutter run
```

## Structure

```
lib/
  core/theme/       # color/spacing/typography tokens + ThemeData
  features/auth/     # Sign In screen and its widgets
```

## Known placeholders

- Font family is Inter (`google_fonts`) pending confirmation of the exact
  Figma type styles.
- The Aurelia wordmark/icon in `aurelia_logo.dart` is an approximation —
  swap in the exported brand asset when available.
- Google/Apple buttons are UI-only; OAuth wiring is not implemented yet.
