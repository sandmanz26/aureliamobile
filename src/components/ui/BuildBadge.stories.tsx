import type { Meta, StoryObj } from '@storybook/react-vite'
import { BuildBadge } from './BuildBadge'

/**
 * Which site, which build — see `src/lib/build.ts`. In Storybook the build
 * facts are stubbed to fixed "storybook" values (`.storybook/main.ts`'s
 * `viteFinal`), since Storybook runs its own Vite instance and never sees
 * the app's own `vite.config.ts` `define` block. The chip's colour logic
 * still runs for real: `BUILD.environment` resolves to `'local'` here, which
 * reads as production-toned (quiet), not staging's loud brand chip — see
 * `dark` for the other background this badge sits on.
 */
const meta = {
  title: 'UI/BuildBadge',
  component: BuildBadge,
  tags: ['autodocs'],
} satisfies Meta<typeof BuildBadge>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const OnDark: Story = {
  args: { dark: true },
  decorators: [
    (Story) => (
      <div className="rounded-12 bg-icon-strong p-16">
        <Story />
      </div>
    ),
  ],
}
