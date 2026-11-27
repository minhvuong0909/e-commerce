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
      <div className='flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between'>
        <div className='min-w-0'>
          <h1 className='font-display text-[1.75rem] font-bold leading-tight text-ink-950'>{title}</h1>
          <p className='mt-1 max-w-2xl text-sm text-ink-500'>
            {subTitle || 'Quản lý dữ liệu và theo dõi hoạt động hệ thống.'}
          </p>
        </div>
        {createTo ? (
          <Link
            to={createTo}
            className='inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-berry-600 px-5 text-sm font-semibold text-white shadow-glow transition hover:bg-berry-700'
          >
            <Plus size={17} />
            {createLabel}
          </Link>
        ) : null}
      </div>
      <div className='min-w-0'>{children}</div>
    </div>
  )
}
