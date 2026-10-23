import { ArrowUp, Plus, Reply, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { Message } from '../../chat/thread'

interface ChatComposerProps {
  onSend: (text: string) => void
  onVoice: () => void
  /** Opens the sheet of things Aurelia can add to the session. */
  onAdd?: () => void
  disabled?: boolean
  /** Voice input is switched off in the /__demo console. */
  canVoice?: boolean
  /** The line being replied to (U036), shown above the field until sent or cancelled. */
  replyingTo?: Message | null
  onCancelReply?: () => void
}

// Figma "Container" — 356x59, radius 70, surface/default on a 0.5px
// #e4e4e4 hairline. Plus / field / voice orb / send.
export function ChatComposer({ onSend, onVoice, onAdd, disabled, canVoice = true, replyingTo, onCancelReply }: ChatComposerProps) {
  const [value, setValue] = useState('')
  const input = useRef<HTMLInputElement>(null)

  // Choosing Reply means "I'm about to type" — put the caret there.
  useEffect(() => {
    if (replyingTo) input.current?.focus()
  }, [replyingTo])

  function submit(event: React.FormEvent) {
    event.preventDefault()
    const text = value.trim()
    if (!text || disabled) return
    onSend(text)
    setValue('')
  }

  return (
    <div>
      {/* The reply sits on the composer like a tab, so it reads as part of
          what is about to be sent rather than a separate notice. */}
      {replyingTo && (
        <div className="mx-16 flex items-start gap-8 rounded-t-16 border border-b-0 border-border-subtle bg-background-elevated px-12 py-8">
          <Reply size={14} className="mt-2 shrink-0 text-text-brand" />
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-medium leading-[14px] text-text-primary">
              Replying to {replyingTo.from === 'aurelia' ? 'Aurelia' : 'yourself'}
            </p>
            <p className="truncate text-[12px] leading-[16px] text-text-secondary">{replyingTo.text}</p>
          </div>
          <button
            type="button"
            aria-label="Cancel reply"
            onClick={onCancelReply}
            className="-m-8 flex shrink-0 items-center justify-center p-8 text-text-secondary"
          >
            <X size={14} />
          </button>
        </div>
      )}
    <form
      onSubmit={submit}
      className="flex h-[59px] items-center gap-14 rounded-full border-[0.5px] border-border-subtle bg-surface-default py-12 pl-19 pr-12"
    >
      {/* Padding pulled back by an equal negative margin: a 40x40 touch target
          around a 16px glyph, with the row spacing unchanged. */}
      <button
        type="button"
        aria-label="Add to this session"
        onClick={onAdd}
        className="-m-12 flex shrink-0 items-center justify-center p-12 text-icon-strong"
      >
        <Plus size={16} />
      </button>

      <input
        ref={input}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={replyingTo ? 'Say what to change about this' : 'Type here'}
        disabled={disabled}
        className="text-style-body min-w-0 flex-1 bg-transparent font-light text-text-primary outline-none placeholder:text-text-secondary"
      />

      <div className="flex shrink-0 items-center gap-7">
        <button
          type="button"
          aria-label="Voice input"
          onClick={onVoice}
          disabled={!canVoice}
          className="u-press relative flex size-35 items-center justify-center rounded-full border-[1.5px] border-icon-strong disabled:cursor-not-allowed disabled:opacity-40"
        >
          <span className="absolute size-[21px] rounded-full bg-brand-default" />
          <span className="absolute size-[18px] rounded-full bg-primary-200" />
          <span className="relative flex items-end gap-[2px]">
            {[6, 10, 7, 11, 5].map((height, index) => (
              <span key={index} className="w-[1.5px] rounded-full bg-icon-strong" style={{ height }} />
            ))}
          </span>
        </button>

        <button
          type="submit"
          aria-label="Send"
          disabled={disabled}
          className="u-press flex size-35 items-center justify-center rounded-full bg-icon-strong text-icon-inverse disabled:opacity-40"
        >
          <ArrowUp size={19} />
        </button>
      </div>
    </form>
    </div>
  )
}
