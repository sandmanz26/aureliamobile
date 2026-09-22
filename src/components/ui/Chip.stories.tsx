import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { Chip } from './Chip'

/**
 * Figma `Tab Set_notClear` (16538:21547) — the filter pill shared by every
 * screen with a row of them. Unselected is an **outline**, never a grey
 * fill; `#D6D6D6` has no Figma variable and is listed in
 * `docs/DESIGN-SYSTEM-HISTORY.md` under colours still waiting for one.
 */
const meta = {
  title: 'UI/Chip',
  component: Chip,
  tags: ['autodocs'],
  args: { label: 'Sleep', active: false },
} satisfies Meta<typeof Chip>

export default meta
type Story = StoryObj<typeof meta>

export const Inactive: Story = {}

export const Active: Story = {
  args: { active: true },
}

const ROW_OPTIONS = ['All', 'Meditations', 'Music', 'Energy', 'Sleep', 'Calm']

function ChipRow() {
  const [active, setActive] = useState('Sleep')
  return (
    <div className="flex gap-8 overflow-x-auto">
      {ROW_OPTIONS.map((label) => (
        <Chip key={label} label={label} active={active === label} onClick={() => setActive(label)} />
      ))}
    </div>
  )
}

/** The real usage — a filter row, one active among several. */
export const Row: Story = {
  parameters: { layout: 'padded' },
  render: () => <ChipRow />,
}
