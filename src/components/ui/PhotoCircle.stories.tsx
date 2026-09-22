import type { Meta, StoryObj } from '@storybook/react-vite'
import { PhotoCircle } from './PhotoCircle'

const meta = {
  title: 'UI/PhotoCircle',
  component: PhotoCircle,
  tags: ['autodocs'],
  args: {
    photo: 'avatar',
    size: 40,
    gradient: 'conic-gradient(from 180deg, var(--color-blue-300), var(--color-gold-300), var(--color-blue-300))',
  },
} satisfies Meta<typeof PhotoCircle>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** The sizes this app actually renders it at — 20 in a lineage row, 32 in a
 *  mini player, 40 in an author row, 56 on a profile header. */
export const Sizes: Story = {
  render: () => (
    <div className="flex items-end gap-12">
      {[20, 32, 40, 56].map((size) => (
        <PhotoCircle
          key={size}
          photo="avatar"
          size={size}
          gradient="conic-gradient(from 180deg, var(--color-blue-300), var(--color-gold-300), var(--color-blue-300))"
        />
      ))}
    </div>
  ),
}
