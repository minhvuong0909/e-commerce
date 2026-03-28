import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import type { ReactNode } from 'react'

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
    <div className='space-y-6 text-white'>
      {/* Header */}
      <div className='flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between'>
        <div className='min-w-0'>
          <div className='inline-flex items-center rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1 text-[11px] font-medium tracking-wide text-slate-400'>
            Admin panel
          </div>

          <h1 className='mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl'>{title}</h1>

          <p className='mt-2 max-w-2xl text-sm leading-relaxed text-slate-400'>
            {subTitle || 'Quản lý dữ liệu và theo dõi hoạt động hệ thống.'}
          </p>
        </div>

        <div className='flex w-full flex-col gap-2 sm:flex-row lg:w-auto lg:items-center'>
          {createTo && (
            <Link
              to={createTo}
              className='inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-orange-400/20 bg-gradient-to-r from-orange-500 to-pink-500 px-5 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(249,115,22,0.22)] transition hover:scale-[1.01] hover:opacity-95 active:scale-[0.99]'
            >
              <Plus size={16} />
              {createLabel}
            </Link>
          )}
        </div>
      </div>

      {/* Content */}
      <div className='min-w-0'>{children}</div>
    </div>
  )
}
