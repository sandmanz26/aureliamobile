import { execSync } from 'node:child_process'
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

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
    __BUILD_ID__: JSON.stringify(buildId()),
    __BUILT_AT__: JSON.stringify(new Date().toISOString()),
  },
})
