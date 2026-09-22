import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import type { CategoryFilter } from '../../lib/sessions'
import { CategorySheet } from './CategorySheet'

/**
 * Figma 16523:18461 — "All Categories" as a bottom sheet. Portalled to
 * `document.body`, so the canvas is set to `fullscreen` rather than
 * Storybook's centred default, which would otherwise pad an overlay that
 * ignores that padding anyway.
 */
const meta = {
  title: 'UI/CategorySheet',
  component: CategorySheet,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof CategorySheet>

export default meta
type Story = StoryObj<typeof meta>

function ReopenableCategorySheet() {
  const [selected, setSelected] = useState<CategoryFilter>('Sleep')
  const [open, setOpen] = useState(true)
  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="m-20 underline">
        Reopen sheet
      </button>
    )
  }
  return <CategorySheet selected={selected} onSelect={setSelected} onClose={() => setOpen(false)} />
}

export const Open: Story = {
  args: { selected: 'Sleep', onSelect: () => {}, onClose: () => {} },
  render: () => <ReopenableCategorySheet />,
}
