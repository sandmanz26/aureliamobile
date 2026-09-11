import { ArrowUp, Plus } from 'lucide-react'
import { useState } from 'react'

interface ChatComposerProps {
  onSend: (text: string) => void
  onVoice: () => void
  disabled?: boolean
  /** Voice input is switched off in the /__demo console. */
  canVoice?: boolean
}

// Figma "Container" — 356x59, radius 70, surface/default on a 0.5px
// #e4e4e4 hairline. Plus / field / voice orb / send.
export function ChatComposer({ onSend, onVoice, disabled, canVoice = true }: ChatComposerProps) {
  const [value, setValue] = useState('')

  function submit(event: React.FormEvent) {
    event.preventDefault()
    const text = value.trim()
    if (!text || disabled) return
    onSend(text)
    setValue('')
  }

  return (
    <form
      onSubmit={submit}
      className="flex h-[59px] items-center gap-14 rounded-full border-[0.5px] border-border-subtle bg-surface-default py-12 pl-19 pr-12"
    >
      {/* Padding pulled back by an equal negative margin: a 40x40 touch target
          around a 16px glyph, with the row spacing unchanged. */}
      <button
        type="button"
        aria-label="Add attachment"
        className="-m-12 flex shrink-0 items-center justify-center p-12 text-icon-strong"
      >
        <Plus size={16} />
      </button>

      <input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Type here"
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
  )
}
