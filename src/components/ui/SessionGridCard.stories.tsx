import type { Meta, StoryObj } from '@storybook/react-vite'
import { findSession } from '../../lib/sessions'
import { SessionGridCard } from './SessionGridCard'

const session = findSession('dolphins-frequency')!

/**
 * The tall card on the See All grid and the challenge shelf. Full-bleed
 * cover art plus Play/Recreate, both wired through `react-router-dom`'s
 * `Link` — the global decorator's `MemoryRouter` is what lets this render at
 * all outside the real app.
 */
const meta = {
  title: 'UI/SessionGridCard',
  component: SessionGridCard,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div className="w-[164px]">
        <Story />
      </div>
    ),
  ],
  args: { session },
} satisfies Meta<typeof SessionGridCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** The wider ratio the challenge shelf overrides `className` for. */
export const Wide: Story = {
  decorators: [
    (Story) => (
      <div className="w-[260px]">
        <Story />
      </div>
    ),
  ],
  args: { className: 'aspect-[260/180] w-full' },
}
