import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  desc?: string
  action?: ReactNode
}

export default function EmptyState({ icon, title, desc, action }: EmptyStateProps) {
  return (
    <div className='relative flex flex-col items-center justify-center overflow-hidden rounded-4xl border border-dashed border-ink-200 bg-white px-6 py-14 text-center animate-soft-pop md:py-20'>
      <div aria-hidden className='bg-grain pointer-events-none absolute inset-0 opacity-50' />
      <div className='relative flex flex-col items-center'>
        {icon ? (
          <div className='mb-5 grid h-16 w-16 rotate-[-6deg] place-items-center rounded-3xl bg-berry-100 text-berry-600 shadow-soft'>
            {icon}
          </div>
        ) : null}
        <h2 className='font-display text-2xl font-bold text-ink-950'>{title}</h2>
        {desc ? <p className='mt-2 max-w-md text-sm leading-relaxed text-ink-600'>{desc}</p> : null}
        {action ? <div className='mt-7'>{action}</div> : null}
      </div>
    </div>
  )
}
