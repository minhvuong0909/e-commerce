import { NavLink, Outlet, Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'

const nav = [
  { to: '/admin', label: 'Tổng quan' },
  { to: '/admin/products', label: 'Sản phẩm' },
  { to: '/admin/brands', label: 'Thương hiệu' },
  { to: '/admin/categories', label: 'Danh mục' },
  { to: '/admin/orders', label: 'Đơn hàng' },
  { to: '/admin/media', label: 'Thư viện media' }
]

// const titleMap = {
//   '/admin': 'Tổng quan',
//   '/admin/products': 'Quản lý sản phẩm',
//   '/admin/brands': 'Quản lý thương hiệu',
//   '/admin/categories': 'Quản lý danh mục',
//   '/admin/orders': 'Quản lý đơn hàng',
//   '/admin/media': 'Thư viện media'
// }

export default function AdminLayout() {
  const location = useLocation()

  return (
    <div className='relative min-h-screen overflow-hidden bg-[#0b0b10] text-white'>
      {/* Background blobs */}
      <div className='pointer-events-none absolute inset-0 opacity-70'>
        <div className='absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-orange-500/25 via-pink-500/20 to-indigo-500/25 blur-3xl' />
        <div className='absolute -bottom-52 left-0 h-[520px] w-[520px] rounded-full bg-gradient-to-tr from-emerald-500/20 via-sky-500/15 to-purple-500/20 blur-3xl' />
      </div>

      <div className='relative flex min-h-screen'>
        {/* SIDEBAR */}
        <aside className='sticky top-0 hidden h-full-screen w-[290px] shrink-0 border-r border-white/10 bg-black/25 p-4 backdrop-blur-xl md:block'>
          <Link to='/admin' className='flex items-center gap-3 rounded-3xl bg-white/5 p-4'>
            <div className='h-11 w-11 rounded-2xl bg-gradient-to-tr from-orange-500 to-pink-500 shadow-lg' />
            <div>
              <div className='text-sm font-extrabold tracking-wide'>Vibrant Admin</div>
              <div className='mt-0.5 text-xs text-white/55'>Bảng điều khiển quản trị</div>
            </div>
          </Link>

          <div className='mt-5'>
            <div className='mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-white/45'>Quản lý</div>

            <nav className='space-y-1'>
              {nav.map((x) => (
                <NavLink
                  key={x.to}
                  to={x.to}
                  end={x.to === '/admin'}
                  className={({ isActive }) =>
                    [
                      'flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold transition',
                      isActive
                        ? 'bg-gradient-to-r from-orange-500/35 to-pink-500/20 text-white'
                        : 'text-white/70 hover:bg-white/8 hover:text-white'
                    ].join(' ')
                  }
                >
                  {x.label}
                  <span className='text-white/40'>›</span>
                </NavLink>
              ))}
            </nav>
          </div>

          {/* Tips */}
          <div className='mt-6 rounded-3xl border border-white/10 bg-white/5 p-4'>
            <div className='text-sm font-bold'>Lưu ý</div>
            <div className='mt-2 space-y-1 text-xs text-white/65'>
              <div>• Không được xoá Thương hiệu/Danh mục nếu còn sản phẩm.</div>
              <div>• Đơn hàng chỉ được huỷ khi trạng thái là “Chờ xử lý”.</div>
            </div>
          </div>
        </aside>

        {/* CONTENT */}
        <div className='flex min-w-0 flex-1 flex-col'>
          {/* TOPBAR */}
          <div className='sticky top-0 z-40 border-b border-white/10 bg-black/25 backdrop-blur-xl'>
            <div className='mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 md:px-6'>
              {/* Breadcrumb */}
              <div className='flex min-w-0 flex-1 items-center justify-between gap-4'>
                <div className='hidden md:block w-full max-w-sm'>
                  <input
                    placeholder='Tìm nhanh trong trang...'
                    className='h-11 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none placeholder:text-white/35 focus:border-orange-500/40 focus:ring-2 focus:ring-orange-500/20'
                  />
                </div>
              </div>

              {/* Admin info */}
              <div className='flex items-center gap-3'>
                <div className='hidden rounded-2xl bg-white/5 px-4 py-2 text-xs text-white/65 md:block'>
                  Vai trò: <span className='font-bold text-white'>Admin</span>
                </div>

                <div className='flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-2'>
                  <div className='h-9 w-9 rounded-2xl bg-gradient-to-tr from-orange-500 to-pink-500' />
                  <div className='leading-tight'>
                    <div className='text-sm font-bold'>Quản trị viên</div>
                    <div className='text-xs text-white/55'>admin@shop.com</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* PAGE */}
          <main className='mx-auto w-full max-w-7xl flex-1 p-4 md:p-6'>
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
            >
              <Outlet />
            </motion.div>
          </main>

          {/* FOOTER */}
          <footer className='border-t border-white/10 bg-black/25 py-5 text-center text-xs text-white/45 backdrop-blur'>
            © {new Date().getFullYear()} Vibrant Mart Admin. Tất cả quyền được bảo lưu.
          </footer>
        </div>
      </div>
    </div>
  )
}
