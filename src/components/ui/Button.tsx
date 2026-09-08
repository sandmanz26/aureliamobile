import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  icon?: ReactNode
  children: ReactNode
}

// Maps 1:1 to the `button/*` tokens in Aurelia Semantic — see
// design-tokens/figma-export.json -> collections["Aurelia Semantic"].button
const variantClasses: Record<Variant, string> = {
  primary:
    'bg-button-primary-background text-button-primary-foreground hover:bg-button-primary-background-pressed disabled:bg-button-disabled-background disabled:text-button-disabled-foreground',
  secondary:
    'bg-button-secondary-background text-button-secondary-foreground border border-button-secondary-border hover:bg-background-elevated disabled:bg-button-disabled-background disabled:text-button-disabled-foreground disabled:border-transparent',
  ghost:
    'bg-transparent text-button-ghost-foreground hover:bg-background-elevated disabled:text-button-disabled-foreground',
}

export function Button({ variant = 'primary', icon, children, className = '', ...props }: ButtonProps) {
  return (
    <button
      className={`u-press inline-flex items-center justify-center gap-8 rounded-full px-24 py-14 text-style-body font-semibold disabled:cursor-not-allowed ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {icon}
      {children}
    </button>
  )
}
