import type { Meta, StoryObj } from '@storybook/react-vite'
import { Play } from 'lucide-react'
import { Button } from './Button'

/**
 * Maps 1:1 to the `button/*` tokens in Aurelia Semantic — three variants,
 * one disabled state each, and nothing that isn't in
 * `design-tokens/figma-export.json`. If a screen needs a button that isn't
 * one of these three, that's a design decision to raise, not a fourth
 * variant to add here quietly.
 */
const meta = {
  title: 'UI/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'radio', options: ['primary', 'secondary', 'ghost'] },
  },
  args: {
    children: 'Continue',
    disabled: false,
  },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {
  args: { variant: 'primary' },
}

export const Secondary: Story = {
  args: { variant: 'secondary' },
}

export const Ghost: Story = {
  args: { variant: 'ghost' },
}

export const WithIcon: Story = {
  args: { variant: 'primary', icon: <Play size={16} fill="currentColor" />, children: 'Play session' },
}

export const Disabled: Story = {
  args: { variant: 'primary', disabled: true },
}

/** All three variants, both states, in one frame — the fastest way to catch
 *  a token that drifted from Figma without opening three separate stories. */
export const AllVariants: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div className="flex flex-col items-start gap-16">
      {(['primary', 'secondary', 'ghost'] as const).map((variant) => (
        <div key={variant} className="flex items-center gap-12">
          <Button variant={variant}>Continue</Button>
          <Button variant={variant} disabled>
            Continue
          </Button>
        </div>
      ))}
    </div>
  ),
}
