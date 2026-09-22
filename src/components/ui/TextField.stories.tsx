import type { Meta, StoryObj } from '@storybook/react-vite'
import { Lock, Mail, Search } from 'lucide-react'
import { TextField } from './TextField'

const meta = {
  title: 'UI/TextField',
  component: TextField,
  tags: ['autodocs'],
  args: { placeholder: 'Type here' },
} satisfies Meta<typeof TextField>

export default meta
type Story = StoryObj<typeof meta>

export const Empty: Story = {}

export const WithLeadingIcon: Story = {
  args: { leadingIcon: <Search size={16} />, placeholder: 'Search sessions' },
}

export const Email: Story = {
  args: { leadingIcon: <Mail size={16} />, type: 'email', placeholder: 'Email address' },
}

export const Password: Story = {
  args: { leadingIcon: <Lock size={16} />, type: 'password', placeholder: 'Password' },
}

export const Disabled: Story = {
  args: { placeholder: 'Type here', disabled: true },
}
