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
          <div className='inline-flex items-center rounded-full border border-[#eaded8] bg-[#fdf8f6] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#b07a72]'>
            Quản trị
          </div>

          <h1 className='mt-3 text-2xl font-semibold tracking-tight text-[#3d3330] sm:text-3xl'>{title}</h1>

          <p className='mt-2 max-w-2xl text-sm leading-relaxed text-[#8a7a74]'>
            {subTitle || 'Quản lý dữ liệu và theo dõi hoạt động hệ thống.'}
          </p>
        </div>

        {createTo ? (
          <Link
            to={createTo}
            className='inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-[#3d3330] px-5 text-sm font-semibold text-white transition hover:bg-[#2a2421]'
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
