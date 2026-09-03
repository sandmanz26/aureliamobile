import type { InputHTMLAttributes, ReactNode } from 'react'

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  leadingIcon?: ReactNode
  trailing?: ReactNode
}

export function TextField({ leadingIcon, trailing, className = '', ...props }: TextFieldProps) {
  return (
    <div className="flex h-48 items-center gap-8 rounded-full border border-border-default bg-surface-default px-16 focus-within:border-brand-emphasis">
      {leadingIcon && <span className="text-icon-secondary shrink-0">{leadingIcon}</span>}
      <input
        className={`text-style-body h-full flex-1 bg-transparent text-text-primary placeholder:text-text-secondary outline-none ${className}`}
        {...props}
      />
      {trailing && <span className="text-icon-secondary shrink-0">{trailing}</span>}
    </div>
  )
}
