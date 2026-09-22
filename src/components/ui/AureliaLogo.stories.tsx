import type { Meta, StoryObj } from '@storybook/react-vite'
import { AureliaLogo } from './AureliaLogo'

/**
 * The brand mark. This is the only file that draws it — see the component's
 * own doc comment — so a real vector swap happens here and nowhere else.
 */
const meta = {
  title: 'UI/AureliaLogo',
  component: AureliaLogo,
  tags: ['autodocs'],
  args: { iconSize: 40, markOnly: false },
} satisfies Meta<typeof AureliaLogo>

export default meta
type Story = StoryObj<typeof meta>

export const Full: Story = {}

export const MarkOnly: Story = {
  args: { markOnly: true },
}

export const Large: Story = {
  args: { iconSize: 72 },
}
