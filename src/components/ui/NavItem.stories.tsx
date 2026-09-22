import type { Meta, StoryObj } from '@storybook/react-vite'
import { Compass, Heart, ListMusic, User } from 'lucide-react'
import { NavItem } from './NavItem'

/**
 * Figma "Menu List Item" — 281x56, the drawer's own row. Needs a Router
 * (`NavLink`), which every story in this catalogue gets from the global
 * decorator in `.storybook/preview.tsx`.
 */
const meta = {
  title: 'UI/NavItem',
  component: NavItem,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div className="w-[281px]">
        <Story />
      </div>
    ),
  ],
  args: { to: '/profile', icon: <User size={24} />, label: 'Profile' },
} satisfies Meta<typeof NavItem>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Disabled: Story = {
  args: { disabled: true, label: 'My wellness', icon: <Heart size={24} /> },
}

/** The real usage — a stack of rows, one active. */
export const Stack: Story = {
  render: () => (
    <div className="flex w-[281px] flex-col">
      <NavItem to="/profile" icon={<User size={24} />} label="Profile" />
      <NavItem to="/explore" icon={<Compass size={24} />} label="Explore" />
      <NavItem to="/sessions" icon={<ListMusic size={24} />} label="Sessions" />
      <NavItem to="/wellness" icon={<Heart size={24} />} label="My wellness" disabled />
    </div>
  ),
}
