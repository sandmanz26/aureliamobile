interface EmptyThreadPromptsProps {
  prompts: string[]
  onPrompt: (prompt: string) => void
}

/**
 * A session with nothing in it yet.
 *
 * The thread is where the product happens, so an empty one cannot just be
 * blank space above a text field — it has to say what the field is for. The
 * orb is Aurelia present and waiting; the question names what this screen is
 * actually asking ("creating", not "searching"); and the prompts are there
 * because the hardest part of a blank chat is the first sentence.
 */
export function EmptyThread({ name }: { name: string }) {
  return (
    <div className="flex flex-1 flex-col items-center pt-32">
      {/* Figma "Ellipse 30" + "Group 34" (16658:28872). Three layers, not one:
          a 160 radial wash at half opacity, with a 52 gold disc and a 64 orange
          disc blurred inside it and deliberately off-centre from each other.
          That offset is the whole effect — one centred blur reads as a dot,
          where these read as light with a direction in it.

          Drawn rather than an image: it is the largest warm thing on the
          screen and a raster of a blur bands badly on a phone. */}
      <span aria-hidden="true" className="relative size-160 shrink-0">
        <span
          className="absolute inset-0 rounded-full"
          style={{
            opacity: 0.5,
            background:
              'radial-gradient(circle, #FF9E49 0%, rgba(253,188,86,0.5) 50%, rgba(255,241,219,0) 100%)',
          }}
        />
        <span
          className="absolute size-52 rounded-full"
          style={{ left: 45, top: 45, background: '#FFE682', filter: 'blur(30px)' }}
        />
        <span
          className="absolute size-64 rounded-full"
          style={{ left: 52, top: 52, background: '#FF881B', opacity: 0.8, filter: 'blur(40px)' }}
        />
      </span>

      {/* 24 Regular at 27.6, not the 32 Semibold it was rendering. The weight
          was already meant to be Regular — `font-normal` without `!` is a
          no-op against `.text-style-*`, which sits outside Tailwind's utility
          layer. Written out because the frame's leading is 115%, not the
          scale's 32. 295 wide is what breaks it after "you", as the frame
          does. */}
      <h1 className="mt-32 max-w-[295px] text-center text-[24px] leading-[28px] text-text-primary">
        Hello {name}, What are you creating today?
      </h1>
    </div>
  )
}

/**
 * The openers, shown in the chip rail above the composer so they sit where
 * every other suggestion in this screen sits.
 */
export function EmptyThreadPrompts({ prompts, onPrompt }: EmptyThreadPromptsProps) {
  return (
    <>
      {prompts.map((prompt) => (
        <button
          key={prompt}
          type="button"
          onClick={() => onPrompt(prompt)}
          className="text-style-body-small flex h-44 shrink-0 items-center whitespace-nowrap rounded-full border border-border-subtle bg-surface-default px-20 text-text-primary"
        >
          {prompt}
        </button>
      ))}
    </>
  )
}
