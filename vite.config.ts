import { execSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

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
  const env = process.env.VERCEL_ENV ?? 'local'
  // The staging site is its own Vercel project whose *production* branch is
  // `web_app`, so VERCEL_ENV alone calls it production. Only `web_prod` is.
  const ref = process.env.VERCEL_GIT_COMMIT_REF
  if (env === 'production' && ref && ref !== 'web_prod') return 'preview'
  return env
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
  plugins: [
    react(),
    tailwindcss(),
    // Offline (U049): a service worker precaches the app shell, every route's
    // code, the fonts, the bundled images and the session audio, so after one
    // visit the app opens and every screen works with no network — the data is
    // bundled mock data. Unsplash covers are cached as they are seen (the token
    // gradient underneath shows for any not yet seen). /api is never cached:
    // flags, annotations and insights already fall back to this device.
    //
    // `prompt`, not auto-update: a new build waits until the user taps Reload
    // in the update toast (UpdatePrompt), so a deploy can never restart a
    // session someone is listening to. Registration lives in main.tsx.
    VitePWA({
      registerType: 'prompt',
      injectRegister: false,
      // public/site.webmanifest is the manifest; the plugin must not write a second one.
      manifest: false,
      includeAssets: ['favicon.svg', 'favicon-32.png', 'apple-touch-icon.png', 'site.webmanifest', 'fonts/*.woff2'],
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,webp,woff2,webmanifest}'],
        // three.js behind the off-by-default 3D network: cached when first used, not up front.
        globIgnores: ['**/networkScene-*.js'],
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api\//, /^\/__/],
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          {
            // Session audio: not precached, because a media element asks for
            // byte ranges and Safari will not play a plain 200 from a cache.
            // This route answers ranges from the cached file; UpdatePrompt
            // warms it with one full download once the worker is in control.
            urlPattern: ({ url, sameOrigin }) => sameOrigin && url.pathname.startsWith('/audio/'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'session-audio',
              rangeRequests: true,
              cacheableResponse: { statuses: [200] },
            },
          },
          {
            urlPattern: ({ url }) => url.origin === 'https://images.unsplash.com',
            handler: 'CacheFirst',
            options: {
              cacheName: 'cover-photos',
              expiration: { maxEntries: 300, maxAgeSeconds: 30 * 24 * 60 * 60 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: ({ url, sameOrigin }) => sameOrigin && url.pathname.startsWith('/assets/'),
            handler: 'CacheFirst',
            options: { cacheName: 'lazy-assets', expiration: { maxEntries: 50 } },
          },
        ],
      },
      devOptions: { enabled: false },
    }),
  ],
  build: {
    // The one chunk over 500 kB is three.js behind the 3D network flag, which
    // only loads when that flag is on; everything on the first load is well
    // under. Raised so the warning stays meaningful for the rest.
    chunkSizeWarningLimit: 600,
    rolldownOptions: {
      output: {
        // Framework code changes far less often than the app, so it gets its
        // own long-cached chunk: a deploy that only touches screens does not
        // make returning visitors download React again. three.js is not
        // listed — it is already split out behind the lazy 3D network.
        codeSplitting: {
          groups: [
            { name: 'react-vendor', test: /node_modules[\\/](react|react-dom|react-router|react-router-dom|scheduler)[\\/]/ },
            { name: 'query-vendor', test: /node_modules[\\/](@tanstack|zod)[\\/]/ },
          ],
        },
      },
    },
  },
  define: {
    __BUILD_ID__: JSON.stringify(buildId()),
    __BUILD_BRANCH__: JSON.stringify(buildBranch()),
    __BUILD_ENV__: JSON.stringify(buildEnv()),
    __APP_VERSION__: JSON.stringify(appVersion()),
    __BUILT_AT__: JSON.stringify(new Date().toISOString()),
  },
})
