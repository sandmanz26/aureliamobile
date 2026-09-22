import type { Meta, StoryObj } from '@storybook/react-vite'
import { CoverImage } from './CoverImage'

/**
 * The gradient is the floor, not a fallback — it is always painted, and the
 * Unsplash photo layers over it once decoded. Every card in this app carries
 * one; if the network is gone, the card still reads as designed. This
 * sandbox has no outbound network to Unsplash, so every story below renders
 * the gradient — which is the correct, intended state, not a broken story.
 */
const meta = {
  title: 'UI/CoverImage',
  component: CoverImage,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="relative h-[220px] w-[320px] overflow-hidden rounded-16">
        <Story />
      </div>
    ),
  ],
  args: {
    photo: 'dolphins',
    gradient: 'linear-gradient(160deg, var(--color-info-800), var(--color-info-400))',
  },
} satisfies Meta<typeof CoverImage>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const NoScrim: Story = {
  args: { scrim: false },
}
