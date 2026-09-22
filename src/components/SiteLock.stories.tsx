import type { Meta, StoryObj } from '@storybook/react-vite'
import { SiteLock } from './SiteLock'

/**
 * The shared password in front of the whole site — **not security**, see the
 * component's own doc comment. The lock defaults on (`siteLock` in
 * `demo/modules.ts` is `true` unless a flag store says otherwise) and this
 * story's browser has never unlocked it, so it renders the real
 * `LockScreen` the same way a fresh visit does. The password is
 * `aurelia-preview` unless `VITE_SITE_PASSWORD` overrides it.
 */
const meta = {
  title: 'UI/SiteLock',
  component: SiteLock,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof SiteLock>

export default meta
type Story = StoryObj<typeof meta>

export const Locked: Story = {
  args: {
    children: <div className="p-40 text-center">The site, once unlocked.</div>,
  },
}
