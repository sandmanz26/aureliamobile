import type { Meta, StoryObj } from '@storybook/react-vite'
import { FlipWord } from './FlipWord'

/**
 * One word inside a heading that cycles in place — "Trusted Creators"
 * becoming "Trusted Guides" — without the sentence around it reflowing.
 * Watch it in the canvas rather than a static screenshot; the interval
 * default is 2.2s.
 */
const meta = {
  title: 'UI/FlipWord',
  component: FlipWord,
  tags: ['autodocs'],
} satisfies Meta<typeof FlipWord>

export default meta
type Story = StoryObj<typeof meta>

export const InHeading: Story = {
  args: { words: ['Creators', 'Guides', 'Storytellers', 'Voices'] },
  render: () => (
    <h2 className="text-style-title-large text-text-primary">
      Trusted <FlipWord words={['Creators', 'Guides', 'Storytellers', 'Voices']} />
    </h2>
  ),
}

export const FastCycle: Story = {
  args: { words: ['Creators', 'Guides', 'Storytellers', 'Voices'], intervalMs: 600 },
  render: () => (
    <h2 className="text-style-title-large text-text-primary">
      Trusted <FlipWord words={['Creators', 'Guides', 'Storytellers', 'Voices']} intervalMs={600} />
    </h2>
  ),
}
