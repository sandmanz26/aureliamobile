import { ChevronDown, Coins, Menu } from 'lucide-react'
import { useState } from 'react'
import { HELP_TOPICS } from '../lib/help'
import { useDrawer } from '../layouts/DrawerContext'

/**
 * Help — the FAQ, as a stack of cards rather than the hairline accordion used
 * on Session detail.
 *
 * Different job, so a different form: there each row is one facet of a single
 * thing, and the rules between them hold that together. Here each row is an
 * unrelated question, and separating them into cards makes it obvious you can
 * skip the nine you do not have.
 *
 * More than one can be open at a time — comparing two answers is a normal thing
 * to want, and closing the one you are reading to open another is not.
 */
export function HelpPage() {
  const { openDrawer } = useDrawer()
  const [open, setOpen] = useState<string[]>([])

  function toggle(question: string) {
    setOpen((current) =>
      current.includes(question) ? current.filter((item) => item !== question) : [...current, question],
    )
  }

  return (
    <div className="flex min-h-[calc(100vh-54px)] flex-col bg-background-default lg:min-h-screen">
      <header className="flex items-center justify-between gap-12 px-20 py-16 lg:px-24">
        <div className="flex min-w-0 items-center gap-12">
          <button
            type="button"
            aria-label="Open menu"
            onClick={openDrawer}
            className="u-press flex size-40 shrink-0 items-center justify-center rounded-full bg-surface-default text-icon-strong shadow-sm"
          >
            <Menu size={20} />
          </button>
          <h1 className="text-style-title-large truncate text-text-primary">Help</h1>
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

      <div className="mx-auto w-full max-w-[402px] px-20 pb-40 lg:max-w-[720px] lg:px-24">
        <div className="flex flex-col gap-12">
          {HELP_TOPICS.map((topic) => {
            const expanded = open.includes(topic.question)
            return (
              <div
                key={topic.question}
                className="overflow-hidden rounded-16 bg-surface-default shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
              >
                <button
                  type="button"
                  onClick={() => toggle(topic.question)}
                  aria-expanded={expanded}
                  aria-controls={`help-${topic.question}`}
                  className="u-press flex w-full items-center gap-12 px-18 py-18 text-left"
                >
                  <span className="text-style-body flex-1 text-text-primary">{topic.question}</span>
                  <ChevronDown
                    size={18}
                    className={`shrink-0 text-icon-secondary transition-transform duration-200 ${
                      expanded ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                <div id={`help-${topic.question}`} className="u-collapse" data-open={expanded}>
                  <div inert={!expanded}>
                    <p className="text-style-body-small px-18 pb-18 text-text-secondary">{topic.answer}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-24 rounded-16 border border-border-subtle p-16">
          <p className="text-style-body-small text-text-primary">Still stuck?</p>
          <p className="text-style-caption mt-4 text-text-secondary">
            Write to support@aurelia.ai and include the session name — it makes the answer much faster.
          </p>
        </div>
      </div>
    </div>
  )
}
