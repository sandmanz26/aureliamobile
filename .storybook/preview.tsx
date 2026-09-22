import type { Preview, Decorator } from '@storybook/react-vite'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider } from '../src/auth/AuthContext'
import { AudioPlayerProvider } from '../src/audio/AudioPlayerContext'
import { ChatSessionProvider } from '../src/chat/ChatSessionContext'
import { FeatureFlagsProvider } from '../src/demo/FeatureFlags'
import '../src/index.css'

/**
 * Every real screen in this app sits under this same stack (see
 * `src/main.tsx` / `src/App.tsx`) — Router, then Auth, then the audio deck,
 * then the cockpit thread, then the feature-flag console. A component here
 * that reads `useAuth()` or does a `<Link>` would otherwise throw the moment
 * its story tries to render, with an error that names React context and not
 * the actual missing piece.
 *
 * `MemoryRouter` rather than `BrowserRouter`: Storybook's own iframe URL is
 * not this app's routing, and a memory router keeps the two from fighting
 * over `window.location`.
 */
const withAppProviders: Decorator = (Story) => (
  <MemoryRouter initialEntries={['/']}>
    <AuthProvider>
      <AudioPlayerProvider>
        <ChatSessionProvider>
          <FeatureFlagsProvider>
            <Story />
          </FeatureFlagsProvider>
        </ChatSessionProvider>
      </AudioPlayerProvider>
    </AuthProvider>
  </MemoryRouter>
)

const preview: Preview = {
  decorators: [withAppProviders],
  parameters: {
    // This is a phone-first design system — see CLAUDE.md's "page gutter is
    // 20, which is what every consumer screen carries at phone width" — so
    // stories default to a phone-shaped canvas rather than Storybook's own
    // full-bleed default, which stretches a card meant for 360px into
    // something nobody who designed it ever saw.
    layout: 'centered',
    backgrounds: {
      options: {
        default: { name: 'default', value: '#F7F5F2' },
        dark: { name: 'dark', value: '#141414' },
      },
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      // 'todo' surfaces violations in the addon panel without failing a
      // story — right for a catalogue nobody has audited page by page yet.
      test: 'todo',
    },
    options: {
      storySort: {
        order: ['Foundations', 'UI', 'Chat', '*'],
      },
    },
  },
}

export default preview
