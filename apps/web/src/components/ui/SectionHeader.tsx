import type { ReactNode } from 'react'

interface SectionHeaderProps {
  eyebrow?: string
  title: string
  desc?: string
  action?: ReactNode
}

export default function SectionHeader({ eyebrow, title, desc, action }: SectionHeaderProps) {
  return (
    <div className='flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between'>
      <div className='min-w-0'>
        {eyebrow ? (
          <p className='eyebrow'>
            {eyebrow}
          </p>
        ) : null}
        <h2 className='mt-2 font-display text-2xl font-semibold leading-tight text-ink-950 md:text-3xl'>{title}</h2>
        {desc ? <p className='mt-3 max-w-2xl text-[15px] leading-relaxed text-ink-600'>{desc}</p> : null}
      </div>
      {action ? <div className='shrink-0'>{action}</div> : null}
    </div>
  )
}
