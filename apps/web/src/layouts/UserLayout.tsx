import { Outlet, Link, NavLink, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Menu, PackageCheck, Search, ShieldCheck, ShoppingBag, Truck, UserRound } from 'lucide-react'

const nav = [
  { to: '/user/home', label: 'Trang chủ', icon: ShoppingBag },
  { to: '/user/cart', label: 'Giỏ hàng', icon: PackageCheck },
  { to: '/user/orders', label: 'Đơn hàng', icon: Truck },
  { to: '/user/me', label: 'Tài khoản', icon: UserRound }
]

export default function UserLayout() {
  const location = useLocation()

  return (
    <div className='min-h-screen bg-[#f7f8f5] text-slate-950'>
      <header className='sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl'>
        <div className='mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 md:px-6'>
          <Link to='/user/home' className='flex shrink-0 items-center gap-3' aria-label='Vibrant Mart home'>
            <span className='grid h-10 w-10 place-items-center rounded-xl bg-slate-950 text-white shadow-sm'>
              <ShoppingBag size={20} />
            </span>
            <span className='leading-tight'>
              <span className='block text-base font-black tracking-tight'>Vibrant Mart</span>
              <span className='block text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-700'>
                Official Store
              </span>
            </span>
          </Link>

          <div className='relative ml-auto hidden max-w-xl flex-1 md:block'>
            <Search className='pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400' size={18} />
            <input
              placeholder='Tìm sản phẩm, thương hiệu, danh mục...'
              className='h-11 w-full rounded-full border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm font-medium text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100'
            />
          </div>

          <nav className='hidden items-center rounded-full border border-slate-200 bg-white p-1 shadow-sm lg:flex'>
            {nav.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className='relative inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold text-slate-600 transition hover:text-slate-950'
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <motion.span
                        layoutId='user-nav-pill'
                        className='absolute inset-0 rounded-full bg-slate-950 shadow-sm'
                        transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                      />
                    )}
                    <span className='relative z-10 flex items-center gap-2'>
                      <Icon size={16} className={isActive ? 'text-white' : 'text-slate-500'} />
                      <span className={isActive ? 'text-white' : ''}>{label}</span>
                    </span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <button className='grid h-10 w-10 place-items-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm lg:hidden'>
            <Menu size={20} />
          </button>
        </div>

        <div className='border-t border-slate-100 bg-white/95 lg:hidden'>
          <nav className='mx-auto grid max-w-7xl grid-cols-4 gap-1 px-3 py-2'>
            {nav.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  [
                    'flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl text-[11px] font-bold transition',
                    isActive ? 'bg-slate-950 text-white' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-950'
                  ].join(' ')
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
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className='border-t border-slate-200 bg-white'>
        <div className='mx-auto flex max-w-7xl flex-col gap-3 px-4 py-6 text-sm text-slate-500 md:flex-row md:items-center md:justify-between md:px-6'>
          <div className='flex items-center gap-2 font-semibold'>
            <ShieldCheck size={18} className='text-emerald-700' />
            Thanh toán bảo mật, đổi trả minh bạch, hỗ trợ sau bán hàng.
          </div>
          <div>© {new Date().getFullYear()} Vibrant Mart. All rights reserved.</div>
        </div>
      </footer>
    </div>
  )
}
