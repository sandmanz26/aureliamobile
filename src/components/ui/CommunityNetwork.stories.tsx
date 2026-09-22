import type { Meta, StoryObj } from '@storybook/react-vite'
import { CommunityNetwork } from './CommunityNetwork'

/**
 * The figure standing inside a network, above Home's closing CTA — drawn
 * rather than shipped as a PNG, so the palette follows the theme tokens
 * rather than baking one set of oranges into pixels.
 */
const meta = {
  title: 'UI/CommunityNetwork',
  component: CommunityNetwork,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div className="w-[402px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof CommunityNetwork>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
