import { Check, Coins, Copy, MapPin, MessageCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { PhotoCircle } from '../components/ui/PhotoCircle'
import { useDrawer } from '../layouts/DrawerContext'
import type { CoverKey } from '../lib/photos'

/**
 * Invite a Friend.
 *
 * The referral link is the whole screen — everything above it exists to explain
 * why to send it. So the field is wide, the URL is fully visible, and copying is
 * one tap with a state change that proves it worked.
 */
const REWARD = 500

// A per-user code has to be here in production, or two people's invites are
// indistinguishable and neither can be credited. Shown plain for the demo.
const INVITE_LINK = 'https://www.aurelia.ai/inviteafriend'

/** Orbiting friends, placed as percentages of the illustration box. */
const ORBIT: { photo: CoverKey; size: number; left: string; top: string }[] = [
  { photo: 'creatorSophia', size: 66, left: '28%', top: '13%' },
  { photo: 'creatorDaniel', size: 52, left: '7%', top: '44%' },
  { photo: 'creatorMaya', size: 60, left: '89%', top: '58%' },
  { photo: 'creatorEthan', size: 56, left: '52%', top: '83%' },
]

const RING_GRADIENT = 'conic-gradient(from 200deg, var(--color-gold-300), var(--color-amber-400), var(--color-gold-300))'

/** The dashed orbits, glow and avatars — decorative, so it is hidden from AT. */
function InviteConstellation() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[320px]" aria-hidden="true">
      {/* Warm centre glow the rings sit in. */}
      <span
        className="absolute inset-[14%] rounded-full blur-2xl"
        style={{ background: 'radial-gradient(circle, rgba(255,183,77,0.55), rgba(255,214,140,0.08) 70%)' }}
      />
      <span className="absolute inset-[6%] rounded-full border border-dashed border-amber-300" />
      <span className="absolute inset-[24%] rounded-full border border-dashed border-amber-300" />

      {/* You, in the middle, with what an invite is worth. */}
      <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <span className="relative block">
          <span className="block rounded-full bg-surface-default p-6 shadow-lg">
            <PhotoCircle
              photo="avatar"
              size={132}
              gradient="linear-gradient(160deg, var(--color-amber-500), var(--color-espresso-700))"
            />
          </span>
          <span className="absolute -top-6 left-1/2 flex h-32 items-center gap-6 whitespace-nowrap rounded-full bg-surface-default px-12 shadow-md">
            <span
              className="flex size-16 items-center justify-center rounded-full"
              style={{ background: 'linear-gradient(160deg, #ffe682, #ff881b)' }}
            >
              <Coins size={10} className="text-text-inverse" />
            </span>
            <span className="text-style-label text-text-primary">+{REWARD}</span>
          </span>
        </span>
      </span>

      {ORBIT.map((friend) => (
        <span
          key={friend.photo}
          className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full bg-surface-default p-4 shadow-md"
          style={{ left: friend.left, top: friend.top }}
        >
          <PhotoCircle photo={friend.photo} size={friend.size} gradient={RING_GRADIENT} />
        </span>
      ))}

      {/* Two markers that say this spreads by place and by conversation. */}
      <span
        className="absolute flex size-28 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-white"
        style={{ left: '77%', top: '14%', background: 'linear-gradient(160deg, #ffa83b, #f2801a)' }}
      >
        <MapPin size={15} />
      </span>
      <span
        className="absolute flex size-28 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-white"
        style={{ left: '15%', top: '75%', background: 'linear-gradient(160deg, #ffa83b, #f2801a)' }}
      >
        <MessageCircle size={15} />
      </span>
    </div>
  )
}

export function InvitePage() {
  const { openDrawer } = useDrawer()
  const [copied, setCopied] = useState(false)

  // The confirmation is temporary — a button stuck on "Copied" stops reading as
  // a button you can press again.
  useEffect(() => {
    if (!copied) return
    const timer = window.setTimeout(() => setCopied(false), 2000)
    return () => window.clearTimeout(timer)
  }, [copied])

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(INVITE_LINK)
      setCopied(true)
    } catch {
      // Clipboard access needs a secure context and can be refused. Selecting
      // the text lets the user copy it themselves rather than nothing happening.
      const field = document.getElementById('invite-link') as HTMLInputElement | null
      field?.select()
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-54px)] flex-col bg-background-default lg:min-h-screen">
      <header className="flex items-center justify-between gap-12 px-20 py-16 lg:px-24">
        <div className="flex items-center gap-12">
          <button
            type="button"
            aria-label="Open menu"
            onClick={openDrawer}
            className="flex size-40 items-center justify-center rounded-full bg-surface-default text-icon-strong shadow-sm lg:hidden"
          >
            <span className="flex flex-col gap-3">
              <span className="block h-[2px] w-16 rounded-full bg-current" />
              <span className="block h-[2px] w-16 rounded-full bg-current" />
              <span className="block h-[2px] w-16 rounded-full bg-current" />
            </span>
          </button>
          <h1 className="text-style-title-large text-text-primary">Invite a Friend</h1>
        </div>
        <div className="flex h-40 shrink-0 items-center gap-8 rounded-full bg-surface-default px-14 shadow-sm">
          <span
            className="flex size-16 items-center justify-center rounded-full"
            style={{ background: 'linear-gradient(160deg, #ffe682, #ff881b)' }}
          >
            <Coins size={10} className="text-text-inverse" />
          </span>
          <span className="text-style-label">1,323</span>
        </div>
      </header>

      <div className="mx-auto w-full max-w-[402px] px-20 lg:max-w-[560px] lg:px-24">
        <div className="mt-16">
          <InviteConstellation />
        </div>

        <h2 className="text-style-title-large mt-40 text-center text-text-primary">Invite Friends, Get Points!</h2>
        <p className="text-style-body mt-12 text-center text-text-secondary">
          Share the link below with a friend. When they sign up, you both get {REWARD} credits!
        </p>

        <div className="mt-32 flex h-56 items-center gap-12 rounded-full border border-amber-300 bg-surface-default pl-20 pr-12">
          <input
            id="invite-link"
            readOnly
            value={INVITE_LINK}
            aria-label="Your invite link"
            onFocus={(event) => event.currentTarget.select()}
            className="text-style-body min-w-0 flex-1 bg-transparent text-text-secondary outline-none"
          />
          <button
            type="button"
            onClick={copyLink}
            aria-label={copied ? 'Link copied' : 'Copy invite link'}
            className="flex size-36 shrink-0 items-center justify-center rounded-full text-text-inverse transition-colors"
            style={{ background: copied ? 'var(--color-feedback-success)' : 'linear-gradient(160deg, #ffa83b, #f2801a)' }}
          >
            {copied ? <Check size={18} /> : <Copy size={18} />}
          </button>
        </div>

        <p
          role="status"
          className={`text-style-caption mt-10 text-center transition-opacity ${
            copied ? 'text-feedback-success opacity-100' : 'text-text-secondary opacity-0'
          }`}
        >
          Link copied — paste it anywhere.
        </p>
      </div>
    </div>
  )
}
