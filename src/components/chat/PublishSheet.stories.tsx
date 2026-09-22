import type { Meta, StoryObj } from '@storybook/react-vite'
import { PublishSheet } from './PublishSheet'

/**
 * Figma "Chat: Publish". The three states deliberately do not share a
 * colour: publishing is the brand ring, success is green, unpublishing is
 * neutral — see the component's own doc comment for why.
 */
const meta = {
  title: 'Chat/PublishSheet',
  component: PublishSheet,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  args: { onCancel: () => {}, onView: () => {} },
} satisfies Meta<typeof PublishSheet>

export default meta
type Story = StoryObj<typeof meta>

export const Publishing: Story = {
  args: { state: 'publishing' },
}

export const Published: Story = {
  args: { state: 'published' },
}

export const Unpublished: Story = {
  args: { state: 'unpublished', onDone: () => {} },
}
