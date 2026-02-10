import { Link } from 'react-router-dom'

export default function AdminTableShell({
  title,
  subTitle,
  createTo,
  createLabel = 'Tạo mới',
  searchPlaceholder = 'Tìm theo tên, mã...',
  showSearch = true,
  children
}: {
  title: string
  subTitle?: string
  createTo?: string
  createLabel?: string
  searchPlaceholder?: string
  showSearch?: boolean
  children: React.ReactNode
}) {
  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex flex-col gap-3 md:flex-row md:items-center md:justify-between'>
        <div>
          <h1 className='text-2xl font-extrabold'>{title}</h1>

          <p className='mt-1 text-sm text-white/60'>{subTitle || 'Quản lý dữ liệu và theo dõi hoạt động hệ thống.'}</p>
        </div>

        <div className='flex w-full gap-2 md:w-auto'>
          {showSearch && (
            <input
              placeholder={searchPlaceholder}
              className='h-11 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none placeholder:text-white/40 focus:border-orange-500/40 focus:ring-2 focus:ring-orange-500/20 md:w-72'
            />
          )}

          {createTo && (
            <Link
              to={createTo}
              className='inline-flex h-11 items-center justify-center rounded-2xl bg-gradient-to-r from-orange-500 to-pink-500 px-5 text-sm font-extrabold text-white shadow-lg hover:opacity-95'
            >
              + {createLabel}
            </Link>
          )}
        </div>
      </div>

      {/* Table wrapper */}
      <div className='overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur'>{children}</div>
    </div>
  )
}
