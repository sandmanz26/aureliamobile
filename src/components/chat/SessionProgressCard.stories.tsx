import type { Meta, StoryObj } from '@storybook/react-vite'
import { SessionProgressCard } from './SessionProgressCard'

const meta = {
  title: 'Chat/SessionProgressCard',
  component: SessionProgressCard,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div className="w-[360px]">
        <Story />
      </div>
    ),
  ],
  args: { title: 'Sleep meditation v1.3', by: 'Adam Nilson' },
} satisfies Meta<typeof SessionProgressCard>

export default meta
type Story = StoryObj<typeof meta>

export const Generating: Story = {
  args: { status: 'Creating your new session..', progress: 47 },
}

export const Ready: Story = {
  args: { status: 'Ready to play', progress: null, to: '/play/dolphins-frequency' },
}
