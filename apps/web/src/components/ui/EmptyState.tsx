import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  desc?: string
  action?: ReactNode
}

export default function EmptyState({ icon, title, desc, action }: EmptyStateProps) {
  return (
    <div className='surface-card animate-soft-pop flex flex-col items-center justify-center rounded-3xl px-6 py-14 text-center'>
      {icon ? <div className='surface-muted mb-4 grid h-14 w-14 place-items-center rounded-2xl text-ink-950'>{icon}</div> : null}
      <h2 className='text-xl font-black tracking-tight text-ink-950'>{title}</h2>
      {desc ? <p className='mt-2 max-w-md text-sm leading-6 text-slate-500'>{desc}</p> : null}
      {action ? <div className='mt-6'>{action}</div> : null}
    </div>
  )
}
