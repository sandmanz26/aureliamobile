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
    <div className="flex flex-1 flex-col items-center gap-28 pt-56">
      {/* Drawn, not an image: it is the largest warm thing on the screen and a
          raster of a blur bands badly on a phone. */}
      <span
        aria-hidden="true"
        className="size-[150px] shrink-0 rounded-full blur-[32px]"
        style={{
          background:
            'radial-gradient(circle at 50% 45%, #FFD86B 0%, #FFB43F 42%, rgba(255,150,40,0.35) 70%, rgba(255,150,40,0) 100%)',
        }}
      />

      <h1 className="text-style-headline max-w-[330px] text-balance text-center font-normal text-text-primary">
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
