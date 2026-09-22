import type { StorybookConfig } from '@storybook/react-vite'

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: ['@storybook/addon-a11y', '@storybook/addon-docs'],
  framework: '@storybook/react-vite',
  // Same public/ the app itself serves from (vite.config.ts has no override,
  // so this is Vite's own default) — components that reference /audio/... or
  // /favicon.svg need it, and Storybook's own Vite instance does not infer it
  // from the sibling vite.config.ts automatically.
  staticDirs: ['../public'],
  // BuildBadge/BuildStamp read __BUILD_ID__ etc. as bare identifiers, defined
  // by the app's own vite.config.ts at build time — Storybook runs its own
  // Vite instance and never sees that file's `define` block, so without this
  // every story that imports either component throws a ReferenceError before
  // it renders. Static "you're in Storybook" values rather than the real
  // build.ts helpers: a story does not need to be honest about which commit
  // built it, just not crash.
  viteFinal: async (viteConfig) => {
    viteConfig.define = {
      ...viteConfig.define,
      __BUILD_ID__: JSON.stringify('storybook'),
      __BUILD_BRANCH__: JSON.stringify('storybook'),
      __BUILD_ENV__: JSON.stringify('local'),
      __APP_VERSION__: JSON.stringify('0.0.0'),
      __BUILT_AT__: JSON.stringify(new Date().toISOString()),
    }
    return viteConfig
  },
}
export default config
