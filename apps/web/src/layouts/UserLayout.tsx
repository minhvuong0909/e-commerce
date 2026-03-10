import { Outlet, Link, NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

export default function UserLayout() {
  const location = useLocation()

  const nav = [
    { to: '/user/home', label: 'Trang chủ' },
    { to: '/user/cart', label: 'Giỏ hàng' },
    { to: '/user/orders', label: 'Đơn hàng' },
    { to: '/user/me', label: 'Tài khoản' }
  ]

  return (
    <div className='relative min-h-screen text-white'>
      {/* Background */}
      <div className='absolute inset-0 -z-20 bg-[#0b0b10]' />

      {/* Gradient background */}
      <div className='pointer-events-none absolute inset-0 -z-10 overflow-hidden opacity-60'>
        <div className='absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-orange-500/25 via-pink-500/20 to-indigo-500/25 blur-3xl' />
        <div className='absolute -bottom-40 left-0 h-[520px] w-[520px] rounded-full bg-gradient-to-tr from-emerald-500/20 via-sky-500/15 to-purple-500/20 blur-3xl' />
      </div>

      <div className='relative flex min-h-screen flex-col'>
        {/* HEADER */}
        <header className='sticky top-0 z-50 w-full border-b border-white/10 bg-black/60 backdrop-blur-xl'>
          <div className='mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-6'>
            <Link
              to='/user/home'
              className='inline-flex items-center gap-2 rounded-2xl bg-white/10 px-3 py-2 text-lg font-extrabold tracking-wide text-white'
            >
              Vibrant <span className='text-white/60'>Mart</span>
            </Link>

            {/* SEARCH */}
            <div className='hidden max-w-xl flex-1 md:block'>
              <input
                placeholder='Tìm kiếm sản phẩm...'
                className='h-11 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none'
              />
            </div>

            {/* NAVBAR */}
            <nav className='flex items-center gap-2'>
              {nav.map((x) => (
                <NavLink
                  key={x.to}
                  to={x.to}
                  className='relative px-4 py-2 text-sm font-semibold text-white/70 hover:text-white'
                >
                  {({ isActive }) => (
                    <>
                      {x.label}

                      {isActive && (
                        <motion.div
                          layoutId='navbar-underline'
                          className='absolute left-0 right-0 -bottom-1 h-[2px] rounded-full bg-orange-500'
                        />
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </nav>
          </div>
        </header>

        {/* PAGE TRANSITION */}
        <main className='flex-1 w-full'>
          <div className='mx-auto max-w-7xl px-4 py-6 md:px-6'>
            <AnimatePresence mode='wait'>
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </div>
        </main>

        {/* FOOTER */}
        <footer className='w-full border-t border-white/10 bg-black/60 py-6 text-center text-sm text-white/45'>
          © {new Date().getFullYear()} Vibrant Mart. Tất cả quyền được bảo lưu.
        </footer>
      </div>
    </div>
  )
}
