import type { Meta, StoryObj } from '@storybook/react-vite'
import { AttachedSession } from './AttachedSession'

/**
 * The original a fork is being made from, shown under the message that
 * carries it. Reads the session by slug from the real catalogue
 * (`lib/sessions.ts`), the same way the chat thread does.
 */
const meta = {
  title: 'Chat/AttachedSession',
  component: AttachedSession,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: { slug: 'dolphins-frequency' },
} satisfies Meta<typeof AttachedSession>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const UnknownSlug: Story = {
  args: { slug: 'does-not-exist' },
}
