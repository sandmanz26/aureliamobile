import { defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from './vite.config.ts'

// Unit tests run on the app's own Vite config (same aliases, the same
// build-time constants `lib/build.ts` reads), in jsdom for anything that
// touches the DOM or storage. Tests sit next to what they test: `*.test.ts(x)`.
export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      include: ['src/**/*.test.{ts,tsx}', 'api/**/*.test.ts'],
      setupFiles: ['src/test/setup.ts'],
      restoreMocks: true,
      unstubEnvs: true,
      unstubGlobals: true,
    },
  }),
)
