import { Plus } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

interface AdminTableShellProps {
  title: string
  subTitle?: string
  createTo?: string
  createLabel?: string
  showSearch?: boolean
  children: ReactNode
}

export default function AdminTableShell({
  title,
  subTitle,
  createTo,
  createLabel = 'Tạo mới',
  children
}: AdminTableShellProps) {
  return (
    <div className='space-y-6'>
      <div className='flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between'>
        <div className='min-w-0'>
          <div className='surface-muted inline-flex items-center rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] text-brand-700'>
            Admin panel
          </div>

          <h1 className='mt-3 text-2xl font-black tracking-tight text-ink-950 sm:text-3xl'>{title}</h1>

          <p className='mt-2 max-w-2xl text-sm leading-relaxed text-slate-500'>
            {subTitle || 'Quản lý dữ liệu và theo dõi hoạt động hệ thống.'}
          </p>
        </div>

        {createTo ? (
          <Link
            to={createTo}
            className='inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-2xl bg-ink-950 px-5 text-sm font-black text-white shadow-card transition hover:-translate-y-0.5 hover:bg-brand-600'
          >
            <Plus size={16} />
            {createLabel}
          </Link>
        ) : null}
      </div>

      <div className='min-w-0'>{children}</div>
    </div>
  )
}
