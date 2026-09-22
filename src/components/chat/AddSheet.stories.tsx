import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { AddSheet } from './AddSheet'

/**
 * The sheet behind the composer's plus — "Improve based on diagnosis" (a
 * predicted score) kept visually apart from "Experiment" (a guess), per the
 * component's own doc comment. Portalled to `document.body`, so the canvas
 * is `fullscreen`.
 */
const meta = {
  title: 'Chat/AddSheet',
  component: AddSheet,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof AddSheet>

export default meta
type Story = StoryObj<typeof meta>

function StatefulAddSheet() {
  const [added, setAdded] = useState<string[]>(['yellow'])
  return (
    <AddSheet
      added={added}
      onToggle={(id) => setAdded((current) => (current.includes(id) ? current.filter((x) => x !== id) : [...current, id]))}
      onApply={() => {}}
      onClose={() => {}}
    />
  )
}

export const Open: Story = {
  args: { added: [], onToggle: () => {}, onApply: () => {}, onClose: () => {} },
  render: () => <StatefulAddSheet />,
}
