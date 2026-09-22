import type { Meta, StoryObj } from '@storybook/react-vite'
import { HeartPulse, Sparkles, Users } from 'lucide-react'
import { FeatureCard } from './FeatureCard'

const meta = {
  title: 'UI/FeatureCard',
  component: FeatureCard,
  tags: ['autodocs'],
  args: {
    icon: <Sparkles size={18} />,
    title: 'Personalized sessions',
    description: 'Built around what your body is telling you today, not a fixed script.',
  },
} satisfies Meta<typeof FeatureCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** The real usage — a row of three on the upgrade page. */
export const Row: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div className="grid w-[360px] grid-cols-1 gap-12">
      <FeatureCard
        icon={<Sparkles size={18} />}
        title="Personalized sessions"
        description="Built around what your body is telling you today."
      />
      <FeatureCard
        icon={<Users size={18} />}
        title="Priority placement in Explore"
        description="Your sessions surface first for people looking for what you make."
      />
      <FeatureCard
        icon={<HeartPulse size={18} />}
        title="Deeper Progress insights"
        description="See what is actually changing, not just that you played something."
      />
    </div>
  ),
}
