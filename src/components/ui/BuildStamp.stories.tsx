import type { Meta, StoryObj } from '@storybook/react-vite'
import { BuildStamp } from './BuildStamp'

/**
 * The `/__demo` "This build" panel's own card. Same stubbed build facts as
 * `BuildBadge` — see that story for why. `peerSite()` reads
 * `VITE_PRODUCTION_URL`/`VITE_STAGING_URL`, unset here, so the "Open
 * staging/production" link is correctly absent rather than wrong.
 */
const meta = {
  title: 'UI/BuildStamp',
  component: BuildStamp,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div className="w-[360px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof BuildStamp>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
