import { Outlet, Link, useLocation } from 'react-router-dom'

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
      <div className='absolute inset-0 -z-20 bg-[#0b0b10]' />

      <div className='pointer-events-none absolute inset-0 -z-10 overflow-hidden opacity-60'>
        <div className='absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-orange-500/25 via-pink-500/20 to-indigo-500/25 blur-3xl' />
        <div className='absolute -bottom-40 left-0 h-[520px] w-[520px] rounded-full bg-gradient-to-tr from-emerald-500/20 via-sky-500/15 to-purple-500/20 blur-3xl' />
      </div>

      {/* Layout */}
      <div className='relative flex min-h-screen flex-col'>
        {/* HEADER */}
        <header className='sticky top-0 z-50 w-full border-b border-white/10 bg-black/60 backdrop-blur-xl'>
          <div className='mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-6'>
            <Link
              to='/user/home'
              className='inline-flex items-center gap-2 rounded-2xl bg-white/10 px-3 py-2 text-lg font-extrabold tracking-wide text-white transition hover:bg-white/15'
            >
              Vibrant <span className='text-white/60'>Mart</span>
            </Link>

            <div className='hidden max-w-xl flex-1 md:block'>
              <input
                placeholder='Tìm kiếm sản phẩm...'
                className='h-11 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none placeholder:text-white/35 focus:border-orange-500/40 focus:ring-2 focus:ring-orange-500/20'
              />
            </div>

            <nav className='flex items-center gap-1'>
              {nav.map((x) => {
                const active = location.pathname.startsWith(x.to)
                return (
                  <Link
                    key={x.to}
                    to={x.to}
                    className={[
                      'rounded-2xl px-4 py-2 text-sm font-semibold transition',
                      active ? 'bg-white/15 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'
                    ].join(' ')}
                  >
                    {x.label}
                  </Link>
                )
              })}
            </nav>
          </div>
        </header>

        {/* CONTENT */}
        <main className='flex-1 w-full'>
          <div className='mx-auto max-w-7xl px-4 py-6 md:px-6'>
            <Outlet />
          </div>
        </main>

        {/* FOOTER */}
        <footer className='w-full border-t border-white/10 bg-black/60 py-6 text-center text-sm text-white/45 backdrop-blur-xl'>
          © {new Date().getFullYear()} Vibrant Mart. Tất cả quyền được bảo lưu.
        </footer>
      </div>
    </div>
  )
}
