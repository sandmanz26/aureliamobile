// Reads a component's props from its own source, so the design system shows the
// real API rather than a copy that would drift. A small, forgiving parser for
// the shapes this codebase uses: `export function Name({ a, b = 1 }: Props)`
// with `interface Props { … }`, or an inline `}: { … }) {` type.

export interface PropInfo {
  name: string
  type: string
  optional: boolean
  defaultValue?: string
  doc?: string
}

export interface ComponentProps {
  component: string
  props: PropInfo[]
  /** e.g. "ButtonHTMLAttributes<HTMLButtonElement>": every native attribute too. */
  extendsFrom?: string
}

/** The text between `open` at `start` and its matching closer. */
function balanced(src: string, start: number, open: string, close: string): string {
  let depth = 0
  for (let i = start; i < src.length; i++) {
    if (src[i] === open) depth++
    else if (src[i] === close) {
      depth--
      if (depth === 0) return src.slice(start + 1, i)
    }
  }
  return ''
}

/** Split at top-level separators, ignoring those inside <>, (), {} and []. */
function splitTop(body: string, seps: string[]): string[] {
  const out: string[] = []
  let depth = 0
  let cur = ''
  for (let i = 0; i < body.length; i++) {
    const c = body[i]
    if ('<({['.includes(c)) depth++
    else if ('>)}]'.includes(c) && !(c === '>' && body[i - 1] === '=')) depth--
    if (depth === 0 && seps.includes(c)) {
      out.push(cur)
      cur = ''
    } else cur += c
  }
  out.push(cur)
  return out
}

function members(body: string): PropInfo[] {
  // Drop line comments, keep the JSDoc blocks as docs for the next member.
  const clean = body.replace(/^\s*\/\/.*$/gm, '')
  const props: PropInfo[] = []
  let doc: string | undefined
  for (const raw of splitTop(clean, ['\n', ';'])) {
    let line = raw.trim()
    if (!line) continue
    const d = line.match(/^\/\*\*([\s\S]*?)\*\/\s*/)
    if (d) {
      doc = d[1].replace(/^\s*\*\s?/gm, ' ').replace(/\s+/g, ' ').trim()
      line = line.slice(d[0].length).trim()
      if (!line) continue
    }
    if (line.startsWith('/*') || line.startsWith('*')) continue
    const m = line.match(/^([A-Za-z_$][\w$]*)(\?)?\s*:\s*([\s\S]+?),?$/)
    if (m) {
      props.push({ name: m[1], optional: Boolean(m[2]), type: m[3].replace(/\s+/g, ' ').trim(), doc })
      doc = undefined
    }
  }
  return props
}

function defaults(destructure: string): Record<string, string> {
  const out: Record<string, string> = {}
  for (const part of splitTop(destructure.replace(/\/\*[\s\S]*?\*\//g, ''), [','])) {
    const m = part.trim().match(/^([A-Za-z_$][\w$]*)\s*=\s*([\s\S]+)$/)
    if (m) out[m[1]] = m[2].trim()
  }
  return out
}

export function extractProps(src: string): ComponentProps[] {
  const out: ComponentProps[] = []
  const re = /export function ([A-Z][\w]*)\s*\(/g
  let m: RegExpExecArray | null
  while ((m = re.exec(src))) {
    const component = m[1]
    const params = balanced(src, m.index + m[0].length - 1, '(', ')')
    // `(props: Props)` as well as `({ a, b }: Props)`; no parameter means no props.
    const named = params.trim().match(/^[A-Za-z_$][\w$]*\s*:\s*([\s\S]+)$/)
    if (!params.trim().startsWith('{') && !named) {
      out.push({ component, props: [] })
      continue
    }
    const destructure = named ? '' : balanced(params, params.indexOf('{'), '{', '}')
    const typeText = named ? named[1].trim() : params.slice(params.indexOf('{') + destructure.length + 2).replace(/^\s*:\s*/, '')
    const defs = defaults(destructure)
    let props: PropInfo[] = []
    let extendsFrom: string | undefined
    if (typeText.startsWith('{')) {
      props = members(balanced(typeText, 0, '{', '}'))
    } else {
      const typeName = typeText.match(/^[A-Za-z_$][\w$]*/)?.[0]
      if (typeName) {
        // interface X extends Y { … } · type X = { … } · type X = Y & { … }
        const decl = new RegExp(`(?:interface ${typeName}(?:\\s+extends\\s+([^{]+))?\\s*\\{|type ${typeName}\\s*=\\s*(?:([^{=;]+?)\\s*&\\s*)?\\{)`).exec(src)
        if (decl) {
          extendsFrom = (decl[1] ?? decl[2])?.trim()
          props = members(balanced(src, decl.index + decl[0].length - 1, '{', '}'))
        }
      }
    }
    for (const p of props) if (defs[p.name] !== undefined) p.defaultValue = defs[p.name]
    out.push({ component, props, extendsFrom })
  }
  return out
}
