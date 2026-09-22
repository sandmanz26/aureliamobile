import type { Meta, StoryObj } from '@storybook/react-vite'
import { FreeLimitNotice } from './FreeLimitNotice'

const meta = {
  title: 'Chat/FreeLimitNotice',
  component: FreeLimitNotice,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div className="w-[360px]">
        <Story />
      </div>
    ),
  ],
  args: { resetAt: '9:55 PM', onNewSession: () => {}, onUpgrade: () => {} },
} satisfies Meta<typeof FreeLimitNotice>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
