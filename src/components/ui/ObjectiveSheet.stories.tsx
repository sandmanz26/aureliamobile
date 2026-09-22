import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { ObjectiveSheet } from './ObjectiveSheet'

/** Figma "drawer" inside Session/Insights/Chapters/Objective (16659:41284). */
const meta = {
  title: 'UI/ObjectiveSheet',
  component: ObjectiveSheet,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof ObjectiveSheet>

export default meta
type Story = StoryObj<typeof meta>

function ReopenableObjectiveSheet({ objective }: { objective: string }) {
  const [open, setOpen] = useState(true)
  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="m-20 underline">
        Reopen sheet
      </button>
    )
  }
  return <ObjectiveSheet objective={objective} onSave={() => setOpen(false)} onClose={() => setOpen(false)} />
}

export const Empty: Story = {
  args: { objective: '', onSave: () => {}, onClose: () => {} },
  render: () => <ReopenableObjectiveSheet objective="" />,
}

export const Prefilled: Story = {
  args: { objective: 'Improve my sleep pattern', onSave: () => {}, onClose: () => {} },
  render: () => <ReopenableObjectiveSheet objective="Improve my sleep pattern" />,
}
