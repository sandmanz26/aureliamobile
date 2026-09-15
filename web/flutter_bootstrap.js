// Flutter's own bootstrap template, with one line added.
//
// Without it the engine fetches CanvasKit from gstatic.com at run time, even
// though `flutter build web` has already written a copy into
// `build/web/canvaskit/`. On a machine with no route to that CDN — a locked-down
// network, an offline demo, a CI box — the page then renders **blank, with no
// visible error**: the only sign is a failed request in the console.
//
// Pointing the loader at the copy we already ship makes the web build
// self-contained, which is the same bargain as the rest of this app: one
// command, no network needed to see it work.
//
// Flutter uses this file in place of its generated one whenever it exists
// (3.22+). The two tokens below are substituted at build time — leave them.
{{flutter_js}}
{{flutter_build_config}}

_flutter.loader.load({
  config: {
    canvasKitBaseUrl: "canvaskit/",
  },
});
