import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Check, Copy, Mail, MessageCircle, MoreHorizontal, Send, X } from 'lucide-react'

/** Lucide dropped brand marks, so the brands without a fitting glyph get a
 *  lettermark on their colour — recognisable, and no traced logos to keep. */
const mark = (text: string) => <span className="text-[18px] font-bold leading-none">{text}</span>

/**
 * Version 2 (staging): a share sheet like a phone's — social targets in a
 * row, the link with a Copy button under them, and "More" for the system
 * share sheet where the browser has one.
 *
 * Each target opens its own web intent in a new tab with the session's title
 * and link prefilled; nothing is posted on the user's behalf. Portaled for
 * the reason in CLAUDE.md, and a `.u-sheet`, so v2's drag-to-close applies.
 */
export function ShareSheet({ title, url, onClose }: { title: string; url: string; onClose: () => void }) {
  const [copied, setCopied] = useState(false)
  const text = `Listen to “${title}” on Aurelia`
  const e = encodeURIComponent

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  useEffect(() => {
    if (!copied) return
    const t = window.setTimeout(() => setCopied(false), 2000)
    return () => window.clearTimeout(t)
  }, [copied])

  const targets: { name: string; icon: ReactNode; bg: string; href: string }[] = [
    { name: 'WhatsApp', icon: <MessageCircle size={22} />, bg: '#25D366', href: `https://wa.me/?text=${e(`${text} ${url}`)}` },
    { name: 'X', icon: mark('𝕏'), bg: '#000000', href: `https://x.com/intent/post?text=${e(text)}&url=${e(url)}` },
    { name: 'Facebook', icon: mark('f'), bg: '#1877F2', href: `https://www.facebook.com/sharer/sharer.php?u=${e(url)}` },
    { name: 'Telegram', icon: <Send size={20} />, bg: '#229ED9', href: `https://t.me/share/url?url=${e(url)}&text=${e(text)}` },
    { name: 'LinkedIn', icon: mark('in'), bg: '#0A66C2', href: `https://www.linkedin.com/sharing/share-offsite/?url=${e(url)}` },
    { name: 'Email', icon: <Mail size={22} />, bg: '#6F5F4D', href: `mailto:?subject=${e(title)}&body=${e(`${text}\n${url}`)}` },
  ]

  async function copy() {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
    } catch {
      // Clipboard refused (old browser, insecure context): select the field so
      // one more keystroke copies it.
      const field = document.getElementById('share-link') as HTMLInputElement | null
      field?.select()
    }
  }

  async function more() {
    try {
      await navigator.share({ title, text, url })
      onClose()
    } catch {
      /* dismissed */
    }
  }

  return createPortal(
    <div className="u-fade fixed inset-0 z-50 flex items-end justify-center bg-icon-strong/40" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-title"
        className="u-sheet flex w-full max-w-[402px] flex-col rounded-t-24 bg-surface-default px-20 pb-[calc(24px+env(safe-area-inset-bottom))] pt-28 lg:max-w-[560px]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-16">
          <div className="min-w-0">
            <h2 id="share-title" className="text-style-title text-text-primary">Share session</h2>
            <p className="text-style-body-small truncate text-text-secondary">{title}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="u-press flex size-32 shrink-0 items-center justify-center rounded-full text-icon-default"
          >
            <X size={22} />
          </button>
        </div>

        <div className="-mx-20 mt-20 flex gap-16 overflow-x-auto px-20 pb-4">
          {targets.map(({ name, icon, bg, href }) => (
            <a
              key={name}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="u-press flex w-60 shrink-0 flex-col items-center gap-6 text-center"
            >
              <span className="flex size-52 items-center justify-center rounded-full text-white" style={{ background: bg }}>
                {icon}
              </span>
              <span className="text-style-caption text-text-primary">{name}</span>
            </a>
          ))}
          {typeof navigator !== 'undefined' && 'share' in navigator && (
            <button type="button" onClick={more} className="u-press flex w-60 shrink-0 flex-col items-center gap-6 text-center">
              <span className="flex size-52 items-center justify-center rounded-full bg-background-elevated text-icon-strong">
                <MoreHorizontal size={22} />
              </span>
              <span className="text-style-caption text-text-primary">More</span>
            </button>
          )}
        </div>

        <label htmlFor="share-link" className="text-style-caption mt-20 text-text-secondary">
          Link
        </label>
        <div className="mt-6 flex items-center gap-8 rounded-full border border-border-subtle bg-background-default py-6 pl-16 pr-6">
          <input
            id="share-link"
            readOnly
            value={url}
            onFocus={(event) => event.currentTarget.select()}
            className="text-style-body-small min-w-0 flex-1 truncate bg-transparent text-text-primary outline-none"
          />
          <button
            type="button"
            onClick={copy}
            className={`u-press flex h-36 shrink-0 items-center gap-6 rounded-full px-14 text-[14px] transition-colors ${
              copied ? 'bg-success-600 text-white' : 'bg-interactive-primary text-text-inverse'
            }`}
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? 'Copied' : 'Copy link'}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
