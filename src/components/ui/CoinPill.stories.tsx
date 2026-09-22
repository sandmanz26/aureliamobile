import type { Meta, StoryObj } from '@storybook/react-vite'
import { CoinMark, CoinPill } from './CoinPill'

/**
 * The coin balance, drawn once — see the component's own doc comment: it
 * used to be hand-rolled in thirteen places, five sizes and two glyphs
 * between them. `interactive` (the default) opens `/credits`, gated behind
 * sign-in like the real header does.
 */
const meta = {
  title: 'UI/CoinPill',
  component: CoinPill,
  tags: ['autodocs'],
  args: { points: '1,323' },
} satisfies Meta<typeof CoinPill>

export default meta
type Story = StoryObj<typeof meta>

export const Interactive: Story = {}

export const Static: Story = {
  args: { interactive: false },
}

/** `CoinMark` alone, at the two sizes the app actually uses — 20 in the
 *  pill, 32 beside the Credits balance. */
export const MarkOnly: Story = {
  render: () => (
    <div className="flex items-center gap-16">
      <CoinMark size={20} />
      <CoinMark size={32} />
    </div>
  ),
}
