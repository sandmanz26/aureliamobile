import type { Meta, StoryObj } from '@storybook/react-vite'
import { RECOMMENDATIONS } from '../../chat/ChatSessionContext'
import { RecommendationCard } from './RecommendationCard'

/**
 * Figma "Frame 45" (16523:9513) — the asymmetric [48, 20, 20, 20] corner
 * radius is off the token scale on purpose; see the component's own doc
 * comment. Real fixture data from `RECOMMENDATIONS`
 * (`chat/ChatSessionContext.tsx`) rather than invented copy, so a change to
 * the real deck is what this story shows too.
 */
const meta = {
  title: 'Chat/RecommendationCard',
  component: RecommendationCard,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: { recommendation: RECOMMENDATIONS[0], applied: false, onToggle: () => {} },
} satisfies Meta<typeof RecommendationCard>

export default meta
type Story = StoryObj<typeof meta>

export const NotApplied: Story = {}

export const Applied: Story = {
  args: { applied: true },
}

/** The player's own variant — the score and toggle go, Recreate replaces them. */
export const RecreateVariant: Story = {
  args: { variant: 'recreate' },
}

export const AllThree: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div className="flex gap-12">
      {RECOMMENDATIONS.map((recommendation) => (
        <RecommendationCard key={recommendation.id} recommendation={recommendation} applied onToggle={() => {}} />
      ))}
    </div>
  ),
}
