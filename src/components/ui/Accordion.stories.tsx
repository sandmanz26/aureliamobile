import type { Meta, StoryObj } from '@storybook/react-vite'
import { Accordion } from './Accordion'

const meta = {
  title: 'UI/Accordion',
  component: Accordion,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Accordion>

export default meta
type Story = StoryObj<typeof meta>

const sections = [
  {
    id: 'overview',
    label: 'Overview',
    content: (
      <p className="text-style-body-small text-text-secondary">
        A slow descent built around cetacean song pitched down two octaves, laid over a tide that breathes at six
        cycles a minute.
      </p>
    ),
  },
  {
    id: 'structure',
    label: 'Session structure',
    meta: '4 chapters · 22 min',
    content: (
      <p className="text-style-body-small text-text-secondary">Arrival · Descent · Deep water · Surface.</p>
    ),
  },
  {
    id: 'safety',
    label: 'Safety & licensing',
    content: (
      <p className="text-style-body-small text-text-secondary">
        Not a treatment for any medical condition, and not a substitute for care.
      </p>
    ),
  },
]

export const Default: Story = {
  args: { sections, defaultOpen: ['overview'] },
}

export const AllCollapsed: Story = {
  args: { sections, defaultOpen: [] },
}
