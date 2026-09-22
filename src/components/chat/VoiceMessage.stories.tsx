import type { Meta, StoryObj } from '@storybook/react-vite'
import { VoiceMessage } from './VoiceMessage'

/**
 * A sent voice note — a pseudo-waveform seeded from the duration, so the
 * same message always draws the same bars. Playback here is a timer against
 * the recorded length; there is no audio file behind a mocked recording.
 */
const meta = {
  title: 'Chat/VoiceMessage',
  component: VoiceMessage,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: {
    durationMs: 42_000,
    transcript: 'Make it about twenty minutes, a bit slower, and keep the ocean sound underneath the whole way through.',
  },
} satisfies Meta<typeof VoiceMessage>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Short: Story = {
  args: { durationMs: 6_000, transcript: 'Make it shorter.' },
}
