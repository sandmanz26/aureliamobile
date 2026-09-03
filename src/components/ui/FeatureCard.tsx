import type { ReactNode } from 'react'

interface FeatureCardProps {
  icon: ReactNode
  title: string
  description: string
}

export function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="flex flex-col gap-12 rounded-16 bg-background-elevated p-16">
      <span className="flex size-40 items-center justify-center rounded-full bg-surface-default text-icon-default">
        {icon}
      </span>
      <div>
        <p className="text-style-body font-medium text-text-primary">{title}</p>
        <p className="text-style-body-small">{description}</p>
      </div>
    </div>
  )
}
