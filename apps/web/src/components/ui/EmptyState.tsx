import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  desc?: string
  action?: ReactNode
}

export default function EmptyState({ icon, title, desc, action }: EmptyStateProps) {
  return (
    <div className='flex flex-col items-center justify-center rounded-3xl border border-[#E7E0D8] bg-white p-8 md:p-14 text-center shadow-soft animate-soft-pop'>
      {icon ? <div className='mb-4 grid h-14 w-14 place-items-center rounded-2xl border border-[#E7E0D8] bg-[#FAF7F2] text-[#A16207]'>{icon}</div> : null}
      <h2 className='font-display text-xl font-extrabold tracking-tight text-[#1C1917]'>{title}</h2>
      {desc ? <p className='mt-2 max-w-md text-xs md:text-sm leading-relaxed text-[#786C60]'>{desc}</p> : null}
      {action ? <div className='mt-6'>{action}</div> : null}
    </div>
  )
}
