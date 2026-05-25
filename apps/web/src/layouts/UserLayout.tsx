import { AnimatePresence, motion } from 'framer-motion'
import { Menu, PackageCheck, Search, ShieldCheck, ShoppingBag, Truck, UserRound } from 'lucide-react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { pageMotion } from '../constants/motion'
import { ROUTE_PATHS } from '../routes/route.paths'
import cn from '../utils/cn'

const nav = [
  { to: ROUTE_PATHS.USER_HOME, label: 'Trang chủ', icon: ShoppingBag },
  { to: ROUTE_PATHS.USER_CART, label: 'Giỏ hàng', icon: PackageCheck },
  { to: ROUTE_PATHS.USER_ORDERS, label: 'Đơn hàng', icon: Truck },
  { to: ROUTE_PATHS.USER_PROFILE, label: 'Tài khoản', icon: UserRound }
]

export default function UserLayout() {
  const location = useLocation()

  return (
    <div className='min-h-screen bg-[var(--page-bg)] text-slate-800'>
      <header className='sticky top-0 z-50 border-b border-slate-300/60 bg-white/[0.88] shadow-sm backdrop-blur-2xl'>
        <div className='mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 md:px-6'>
          <Link to={ROUTE_PATHS.USER_HOME} className='flex shrink-0 items-center gap-3' aria-label='Vibrant Mart home'>
            <span className='grid h-11 w-11 place-items-center rounded-2xl bg-brand-600 text-white shadow-card'>
              <ShoppingBag size={20} />
            </span>
            <span className='leading-tight'>
              <span className='block text-base font-black tracking-tight'>Vibrant Mart</span>
              <span className='block text-[11px] font-black uppercase tracking-[0.18em] text-brand-600'>
                Premium Store
              </span>
            </span>
          </Link>

          <div className='relative ml-auto hidden max-w-xl flex-1 md:block'>
            <Search className='pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400' size={18} />
            <input
              placeholder='Tìm sản phẩm, thương hiệu, danh mục...'
              className='h-11 w-full rounded-2xl border border-slate-200 bg-slate-50/90 pl-11 pr-4 text-sm font-semibold text-slate-800 outline-none transition focus:border-brand-500/50 focus:bg-white focus:ring-4 focus:ring-brand-500/10'
            />
          </div>

          <nav className='hidden items-center rounded-2xl border border-slate-200 bg-white p-1 shadow-sm lg:flex'>
            {nav.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className='relative inline-flex min-h-10 items-center gap-2 rounded-xl px-4 text-sm font-bold text-ink-500 transition hover:bg-brand-50 hover:text-brand-900'
              >
                {({ isActive }) => (
                  <>
                    {isActive ? (
                      <motion.span
                        layoutId='user-nav-pill'
                        className='absolute inset-0 rounded-xl bg-brand-600 shadow-sm'
                        transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                      />
                    ) : null}
                    <span className='relative z-10 flex items-center gap-2'>
                      <Icon size={16} className={isActive ? 'text-white' : 'text-ink-500'} />
                      <span className={isActive ? 'text-white' : ''}>{label}</span>
                    </span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <button
            className='grid h-11 w-11 place-items-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm lg:hidden'
            aria-label='Mở menu'
          >
            <Menu size={20} />
          </button>
        </div>

        <div className='border-t border-slate-200 bg-white/[0.92] lg:hidden'>
          <nav className='mx-auto grid max-w-7xl grid-cols-4 gap-1 px-3 py-2'>
            {nav.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  cn(
                    'flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl text-[11px] font-bold transition',
                    isActive ? 'bg-brand-600 text-white' : 'text-ink-500 hover:bg-brand-50 hover:text-brand-900'
                  )
                }
              >
                <Icon size={17} />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className='min-h-[calc(100vh-156px)]'>
        <AnimatePresence mode='wait'>
          <motion.div key={location.pathname} {...pageMotion}>
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className='border-t border-slate-300/60 bg-white/[0.86]'>
        <div className='mx-auto flex max-w-7xl flex-col gap-3 px-4 py-6 text-sm text-slate-500 md:flex-row md:items-center md:justify-between md:px-6'>
          <div className='flex items-center gap-2 font-semibold'>
            <ShieldCheck size={18} className='text-mint-600' />
            Thanh toán bảo mật, đổi trả minh bạch, hỗ trợ sau bán hàng.
          </div>
          <div>© {new Date().getFullYear()} Vibrant Mart. All rights reserved.</div>
        </div>
      </footer>
    </div>
  )
}
