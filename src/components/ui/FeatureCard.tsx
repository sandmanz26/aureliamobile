import type { ReactNode } from 'react'

interface FeatureCardProps {
  icon: ReactNode
  title: string
  description: string
  /** Which icon micro-animation to play (design Version 2 only — see versions.css). */
  motion?: 'rise' | 'wave' | 'beat' | 'breeze' | 'flip' | 'gather'
}

export function FeatureCard({ icon, title, description, motion }: FeatureCardProps) {
  return (
    <div className="flex flex-col gap-12 rounded-16 bg-surface-default p-16 shadow-[0_5px_24px_4px_rgba(0,0,0,0.05)]">
      <span
        className="u-feature-icon flex size-40 items-center justify-center rounded-12 text-icon-default"
        data-motion={motion}
        style={{ background: 'linear-gradient(225deg, #fff1db, #ffe682)' }}
      >
        {icon}
      </span>
      <div>
        <p className="text-style-body font-medium text-text-primary">{title}</p>
        <p className="text-style-body-small">{description}</p>
      </div>
    </div>
  )
}
