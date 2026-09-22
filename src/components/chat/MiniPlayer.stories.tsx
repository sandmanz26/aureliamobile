import type { Meta, StoryObj } from '@storybook/react-vite'
import { useEffect } from 'react'
import { useAudioPlayer } from '../../audio/AudioPlayerContext'
import { MiniPlayer } from './MiniPlayer'

/**
 * Figma "Chat: Play" (16523:18533) — the session on the deck, parked in the
 * cockpit header. Reads straight from `useAudioPlayer()` with no props at
 * all, so this story loads a track onto the shared deck on mount (the same
 * `load()` a real Play tap calls) rather than passing one in.
 */
function LoadedMiniPlayer() {
  const { load } = useAudioPlayer()
  useEffect(() => {
    load({
      slug: 'dolphins-frequency',
      href: '/play/dolphins-frequency',
      title: 'Dolphins frequency',
      author: 'Adam Nilson',
      photo: 'dolphins',
      gradient: 'linear-gradient(160deg, var(--color-info-800), var(--color-info-400))',
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return <MiniPlayer />
}

const meta = {
  title: 'Chat/MiniPlayer',
  component: MiniPlayer,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div className="w-[362px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof MiniPlayer>

export default meta
type Story = StoryObj<typeof meta>

export const WithTrackOnDeck: Story = {
  render: () => <LoadedMiniPlayer />,
}

/** No track loaded — the real component's own state, since it renders
 *  nothing until the first Play. */
export const NothingOnDeck: Story = {}
