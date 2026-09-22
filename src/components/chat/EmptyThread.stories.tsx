import type { Meta, StoryObj } from '@storybook/react-vite'
import { EmptyThread, EmptyThreadPrompts } from './EmptyThread'

const meta = {
  title: 'Chat/EmptyThread',
  component: EmptyThread,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: { name: 'Adam' },
} satisfies Meta<typeof EmptyThread>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** The orb plus its own opener chips, the way the cockpit composes them. */
export const WithPrompts: Story = {
  render: (args) => (
    <div className="flex flex-col items-center gap-24">
      <EmptyThread {...args} />
      <div className="flex flex-wrap justify-center gap-8">
        <EmptyThreadPrompts
          prompts={["I can't sleep", 'I feel anxious', 'Help me focus']}
          onPrompt={() => {}}
        />
      </div>
    </div>
  ),
}
