import type { Meta, StoryObj } from '@storybook/react-vite'
import { ChatComposer } from './ChatComposer'

/** Figma "Container" — 356x59, radius 70, the cockpit's own input row. */
const meta = {
  title: 'Chat/ChatComposer',
  component: ChatComposer,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div className="w-[380px]">
        <Story />
      </div>
    ),
  ],
  args: { onSend: () => {}, onVoice: () => {}, onAdd: () => {} },
} satisfies Meta<typeof ChatComposer>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const VoiceDisabled: Story = {
  args: { canVoice: false },
}

export const Disabled: Story = {
  args: { disabled: true },
}
