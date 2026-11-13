import type { WeekDay } from '../../lib/dailyCheckIn'

/**
 * Mon–Sun with today framed (Figma 16906:5374 / 16906:5468): 11px caps over a
 * 16px day number, the selected day in a white tile with the brand hairline,
 * days still to come greyed and not selectable.
 */
export function WeekStrip({ days, selected, onSelect }: { days: WeekDay[]; selected: string; onSelect?: (date: string) => void }) {
  return (
    <div role="group" aria-label="This week" className="flex justify-between">
      {days.map((d) => {
        const on = d.date === selected
        const Tag = onSelect && !d.future ? 'button' : 'div'
        return (
          <Tag
            key={d.date}
            {...(Tag === 'button' ? { type: 'button' as const, onClick: () => onSelect?.(d.date), 'aria-pressed': on } : {})}
            aria-label={`${d.label} ${d.day}${d.today ? ', today' : ''}`}
            className={`flex h-[60px] w-[50px] flex-col items-center justify-center gap-6 rounded-12 ${on ? 'bg-surface-default' : ''}`}
            style={
              on
                ? {
                    border: '1px solid transparent',
                    backgroundImage: 'linear-gradient(var(--color-surface-default), var(--color-surface-default)), linear-gradient(160deg, #FFE682, #FF881B)',
                    backgroundOrigin: 'border-box',
                    backgroundClip: 'padding-box, border-box',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.06)',
                  }
                : undefined
            }
          >
            <span className={`text-[11px] leading-[13px] ${d.future ? 'text-[#A8A8A8]' : 'text-text-primary'}`}>{d.label}</span>
            <span className={`text-[16px] leading-[20px] ${d.future ? 'text-[#A8A8A8]' : 'text-text-primary'}`}>{d.day}</span>
          </Tag>
        )
      })}
    </div>
  )
}
