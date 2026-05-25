import { motion } from 'framer-motion'
import { Boxes, ChartNoAxesCombined, FolderTree, LayoutDashboard, Search, ShoppingBag, Tags, UserRound } from 'lucide-react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { pageMotion } from '../constants/motion'
import cn from '../utils/cn'

const nav = [
  { to: '/admin', label: 'Tổng quan', icon: LayoutDashboard, end: true },
  { to: '/admin/products', label: 'Sản phẩm', icon: Boxes },
  { to: '/admin/brands', label: 'Thương hiệu', icon: Tags },
  { to: '/admin/categories', label: 'Danh mục', icon: FolderTree },
  { to: '/admin/orders', label: 'Đơn hàng', icon: ShoppingBag }
]

export default function AdminLayout() {
  const location = useLocation()

  return (
    <div className='min-h-screen bg-[var(--page-bg)] text-ink-950'>
      <div className='flex min-h-screen'>
        <aside className='sticky top-0 hidden h-screen w-[288px] shrink-0 border-r border-slate-300/60 bg-white/[0.84] p-4 shadow-sm backdrop-blur-2xl md:block'>
          <Link to='/admin' className='surface-card flex items-center gap-3 rounded-3xl p-4'>
            <span className='grid h-11 w-11 place-items-center rounded-2xl bg-ink-950 text-white'>
              <ChartNoAxesCombined size={20} />
            </span>
            <span>
              <span className='block text-sm font-black tracking-tight'>Vibrant Admin</span>
              <span className='block text-xs font-semibold text-slate-500'>Commerce console</span>
            </span>
          </Link>

          <nav className='mt-6 space-y-1'>
            {nav.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  cn(
                    'flex min-h-12 items-center gap-3 rounded-2xl px-4 text-sm font-bold transition',
                    isActive
                      ? 'bg-ink-950 text-white shadow-card'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-ink-950'
                  )
                }
              >
                <Icon size={18} />
                {label}
              </NavLink>
            ))}
          </nav>

          <div className='mt-8 rounded-3xl border border-slate-200 bg-slate-50 p-4'>
            <div className='text-sm font-black text-ink-950'>Vận hành</div>
            <div className='mt-2 space-y-2 text-xs leading-5 text-slate-500'>
              <p>Kiểm tra tồn kho thấp trước khi chạy khuyến mãi.</p>
              <p>Đơn hàng chỉ nên hủy khi còn ở trạng thái xử lý.</p>
            </div>
          </div>
        </aside>

        <div className='flex min-w-0 flex-1 flex-col'>
          <header className='sticky top-0 z-40 border-b border-slate-300/60 bg-white/[0.88] shadow-sm backdrop-blur-2xl'>
            <div className='mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 md:px-6'>
              <div className='flex min-w-0 items-center gap-3 md:hidden'>
                <Link to='/admin' className='grid h-10 w-10 place-items-center rounded-2xl bg-ink-950 text-white'>
                  <ChartNoAxesCombined size={18} />
                </Link>
                <span className='text-sm font-black'>Admin</span>
              </div>

              <div className='relative hidden w-full max-w-md md:block'>
                <Search className='pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400' size={17} />
                <input
                  placeholder='Tìm nhanh trong hệ thống...'
                  className='h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm font-semibold outline-none transition focus:border-brand-500/50 focus:bg-white focus:ring-4 focus:ring-brand-500/10'
                />
              </div>

              <div className='flex items-center gap-3'>
                <div className='surface-muted hidden rounded-2xl px-4 py-2 text-xs font-semibold text-slate-500 sm:block'>
                  Vai trò: <span className='font-black text-ink-950'>Admin</span>
                </div>
                <div className='surface-card flex items-center gap-3 rounded-2xl px-3 py-2'>
                  <span className='grid h-9 w-9 place-items-center rounded-xl bg-slate-100 text-ink-950'>
                    <UserRound size={17} />
                  </span>
                  <div className='hidden leading-tight sm:block'>
                    <div className='text-sm font-black'>Quản trị viên</div>
                    <div className='text-xs font-semibold text-slate-500'>admin@shop.com</div>
                  </div>
                </div>
              </div>
            </div>

            <nav className='flex gap-1 overflow-x-auto border-t border-slate-100 px-3 py-2 md:hidden'>
              {nav.map(({ to, label, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    cn(
                      'inline-flex min-h-10 shrink-0 items-center gap-2 rounded-2xl px-3 text-xs font-bold transition',
                      isActive ? 'bg-ink-950 text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-ink-950'
                    )
                  }
                >
                  <Icon size={15} />
                  {label}
                </NavLink>
              ))}
            </nav>
          </header>

          <main className='mx-auto w-full max-w-7xl flex-1 px-4 py-6 md:px-6'>
            <motion.div
              key={location.pathname}
              {...pageMotion}
            >
              <Outlet />
            </motion.div>
          </main>

          <footer className='border-t border-slate-300/60 bg-white/[0.84] py-5 text-center text-xs font-semibold text-slate-500'>
            © {new Date().getFullYear()} Vibrant Mart Admin. All rights reserved.
          </footer>
        </div>
      </div>
    </div>
  )
}
