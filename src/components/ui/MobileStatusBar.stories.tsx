import type { Meta, StoryObj } from '@storybook/react-vite'
import { MobileStatusBar } from './MobileStatusBar'

/**
 * Faithful reproduction of the Figma "Status Bar - iPhone" component. Only
 * rendered in the mobile-frame layout, so a screen using it wraps it in
 * `lg:hidden` — this story shows the bar alone, the way every consumer
 * screen's own story should compose it.
 */
const meta = {
  title: 'UI/MobileStatusBar',
  component: MobileStatusBar,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <div className="w-[402px] bg-surface-default">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof MobileStatusBar>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
