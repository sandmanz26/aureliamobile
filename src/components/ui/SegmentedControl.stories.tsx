import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { SegmentedControl } from './SegmentedControl'

const meta = {
  title: 'UI/SegmentedControl',
  component: SegmentedControl,
  tags: ['autodocs'],
} satisfies Meta<typeof SegmentedControl>

export default meta
type Story = StoryObj<typeof meta>

function ControlledSegmentedControl({ options }: { options: readonly string[] }) {
  const [value, setValue] = useState<string>(options[0])
  return <SegmentedControl options={options} value={value} onChange={setValue} />
}

/** Controlled by design — args alone can't hold live state, so the story
 *  wraps it the way every real caller does. */
export const Default: Story = {
  args: { options: ['Chapters', 'Social', 'Insights'], value: 'Chapters', onChange: () => {} },
  render: () => <ControlledSegmentedControl options={['Chapters', 'Social', 'Insights']} />,
}

export const TwoOptions: Story = {
  args: { options: ['Small', 'Large'], value: 'Small', onChange: () => {} },
  render: () => <ControlledSegmentedControl options={['Small', 'Large']} />,
}
