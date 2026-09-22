import type { Meta, StoryObj } from '@storybook/react-vite'
import { RECOMMENDATIONS } from '../../chat/ChatSessionContext'
import { RecommendationDeck } from './RecommendationDeck'

/**
 * The folded deck — Figma "Frame 74" (16523:8076). The point of this
 * component, per its own doc comment, is that cards two and three show
 * their own orb rather than being hidden entirely behind the front card;
 * watch the right edge of each card behind the front one.
 */
const meta = {
  title: 'Chat/RecommendationDeck',
  component: RecommendationDeck,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: { recommendations: RECOMMENDATIONS, count: RECOMMENDATIONS.length, onOpen: () => {} },
} satisfies Meta<typeof RecommendationDeck>

export default meta
type Story = StoryObj<typeof meta>

export const Openable: Story = {}

/** Applied and no longer editable — the deck reads as a record, not a control. */
export const ReadOnly: Story = {
  args: { onOpen: undefined },
}
