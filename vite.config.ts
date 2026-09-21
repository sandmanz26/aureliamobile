import { execSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

/**
 * Which commit is live?
 *
 * There is no way to answer that from a deployed page, and "I don't see my
 * change" has cost this project real time — the answer has been a stale
 * deployment at least once, and a browser holding an old `index.html` is the
 * same symptom. So the build stamps itself and `/__demo` prints it.
 *
 * Vercel exports the SHA it is building; locally there is a git checkout. If
 * neither answers, say so rather than printing something that looks like a
 * version and is not one.
 */
function buildId() {
  const fromCi = process.env.VERCEL_GIT_COMMIT_SHA
  if (fromCi) return fromCi.slice(0, 7)
  try {
    return execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim()
  } catch {
    return 'unknown'
  }
}

/** Which branch produced this bundle — the other half of "is this the build I pushed?". */
function buildBranch() {
  const fromCi = process.env.VERCEL_GIT_COMMIT_REF
  if (fromCi) return fromCi
  try {
    return execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim()
  } catch {
    return 'unknown'
  }
}

/**
 * Production or staging?
 *
 * Once two deployments exist, "is this the build I pushed?" is only half the
 * question — the other half is which site you are looking at, and the two are
 * identical from a screenshot. Vercel answers it: `production` for the branch
 * the project deploys to its production domain, `preview` for every other.
 */
function buildEnv() {
  return process.env.VERCEL_ENV ?? 'local'
}

/**
 * The release name, as opposed to the commit.
 *
 * `package.json`'s version, bumped by hand when `web_prod` is moved. It is the
 * one fact here that a human maintains and can therefore be wrong, which is why
 * it is never shown without the commit beside it: the version is what a release
 * was called, the commit is what it actually is.
 */
function appVersion() {
  try {
    return (JSON.parse(readFileSync('./package.json', 'utf8')) as { version?: string }).version ?? '0.0.0'
  } catch {
    return '0.0.0'
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
    __BUILD_ID__: JSON.stringify(buildId()),
    __BUILD_BRANCH__: JSON.stringify(buildBranch()),
    __BUILD_ENV__: JSON.stringify(buildEnv()),
    __APP_VERSION__: JSON.stringify(appVersion()),
    __BUILT_AT__: JSON.stringify(new Date().toISOString()),
  },
})
