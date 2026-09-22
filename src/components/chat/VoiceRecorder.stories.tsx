import type { Meta, StoryObj } from '@storybook/react-vite'
import { VoiceRecorder } from './VoiceRecorder'

/**
 * Recording → transcribing → review, all internal state — open this story
 * and press Stop to walk the real sequence (the 1.1s transcribing beat is
 * real, not sped up for the story).
 */
const meta = {
  title: 'Chat/VoiceRecorder',
  component: VoiceRecorder,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  args: { onSend: () => {}, onCancel: () => {} },
} satisfies Meta<typeof VoiceRecorder>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
