
/** Injected by `vite.config.ts` — the commit this bundle was built from. */
declare const __BUILD_ID__: string
/** Injected by `vite.config.ts` — when it was built, as an ISO string. */
declare const __BUILT_AT__: string
/** Injected by `vite.config.ts` — the branch it was built from. */
declare const __BUILD_BRANCH__: string
/** Injected by `vite.config.ts` — `production`, `preview`, or `local`. */
declare const __BUILD_ENV__: string
/** Injected by `vite.config.ts` — `package.json`'s version at build time. */
declare const __APP_VERSION__: string

interface ImportMetaEnv {
  /**
   * The public site, so staging can link to it. Optional: without it the
   * cross-link in `/__demo` is simply not rendered, which is the right
   * behaviour for a one-deployment project.
   */
  readonly VITE_PRODUCTION_URL?: string
  /** The staging site, so production can link back. Optional, as above. */
  readonly VITE_STAGING_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
