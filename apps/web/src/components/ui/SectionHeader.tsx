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
        {eyebrow ? <p className='text-xs font-bold uppercase tracking-[0.18em] text-brand-600'>{eyebrow}</p> : null}
        <h2 className='mt-2 font-serif text-3xl font-normal tracking-tight text-[#2B2118] md:text-4xl'>{title}</h2>
        {desc ? <p className='mt-2 max-w-2xl text-sm leading-6 text-slate-500'>{desc}</p> : null}
      </div>
      {action ? <div className='shrink-0'>{action}</div> : null}
    </div>
  )
}
