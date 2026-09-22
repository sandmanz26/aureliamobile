import type { Meta, StoryObj } from '@storybook/react-vite'
import { ChatHeader } from './ChatHeader'

/**
 * Figma "Top Header" — 44px circular surface buttons either side of the
 * points pill. The "more" menu's own row is exercised by opening it in the
 * canvas; Storybook can't default a story into an already-open popover
 * without faking the click, so `Default` starts closed like the real screen
 * does.
 */
const meta = {
  title: 'Chat/ChatHeader',
  component: ChatHeader,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  args: {
    points: '1,323',
    onMenu: () => {},
    onPublish: () => {},
    onInsights: () => {},
    onSettings: () => {},
  },
} satisfies Meta<typeof ChatHeader>

export default meta
type Story = StoryObj<typeof meta>

export const UnpublishedDraft: Story = {
  args: { publishLabel: 'Publish' },
}

export const PublishedAndCurrent: Story = {
  args: { publishLabel: null },
}

export const ChangedSincePublish: Story = {
  args: { publishLabel: 'Republish', onUnpublish: () => {} },
}

export const NothingToPlayYet: Story = {
  args: { publishLabel: null, canPlay: false },
}
