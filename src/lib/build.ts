/**
 * What this bundle is, in one place.
 *
 * Two sites now serve the same code — staging on `web_app`, production on
 * `web_prod` — and two deployments of one commit are indistinguishable from a
 * screenshot. "It is not live yet" and "you are looking at staging" produce
 * exactly the same report. So the bundle carries its own provenance and the
 * app says it out loud, in the drawer and in `/__demo`.
 *
 * Everything here is baked in by `vite.config.ts` at build time. Nothing is
 * inferred from the hostname: a custom domain, a branch alias and a preview URL
 * all point at the same deployment, and guessing from any of them is how a
 * badge ends up confidently wrong.
 */

export type Environment = 'production' | 'preview' | 'local'

export interface BuildFacts {
  environment: Environment
  /** How a person says it. Vercel's "preview" is this project's staging. */
  label: string
  /** Short commit — the only one of these that cannot go stale. */
  commit: string
  branch: string
  /** `package.json`'s version. Hand-bumped when a release is cut. */
  version: string
  builtAt: string
}

function environment(): Environment {
  if (__BUILD_ENV__ === 'production') return 'production'
  if (__BUILD_ENV__ === 'preview') return 'preview'
  return 'local'
}

const LABELS: Record<Environment, string> = {
  production: 'Production',
  preview: 'Staging',
  local: 'Local',
}

const env = environment()

export const BUILD: BuildFacts = {
  environment: env,
  label: LABELS[env],
  commit: __BUILD_ID__,
  branch: __BUILD_BRANCH__,
  version: __APP_VERSION__,
  builtAt: __BUILT_AT__,
}

/** `0.1.0 · d135f24` — the release somebody named, and the commit that proves it. */
export const BUILD_VERSION = `${BUILD.version} · ${BUILD.commit}`

/**
 * The other deployment, if there is one.
 *
 * Both sites carry both URLs and each links to the one it is not, so a single
 * shared pair of env vars configures them. Neither is required: unset, there is
 * no link, which is the correct rendering for a project with one deployment.
 */
export function peerSite() {
  const production = import.meta.env.VITE_PRODUCTION_URL?.trim()
  const staging = import.meta.env.VITE_STAGING_URL?.trim()
  if (BUILD.environment === 'production') return staging ? { label: 'Open staging', href: staging } : null
  return production ? { label: 'Open production', href: production } : null
}
