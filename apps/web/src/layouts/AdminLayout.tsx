import { NavLink, Outlet, Link, useLocation } from 'react-router-dom'

const nav = [
  { to: '/admin', label: 'Dashboard', icon: '📊' },
  { to: '/admin/products', label: 'Products', icon: '📦' },
  { to: '/admin/brands', label: 'Brands', icon: '🏷️' },
  { to: '/admin/categories', label: 'Categories', icon: '🧩' },
  { to: '/admin/orders', label: 'Orders', icon: '🧾' },
  { to: '/admin/media', label: 'Media', icon: '🖼️' }
]

export default function AdminLayout() {
  const location = useLocation()

  return (
    <div className='min-h-screen bg-gray-100'>
      <div className='flex'>
        {/* SIDEBAR */}
        <aside className='sticky top-0 h-screen w-72 bg-gray-950 text-white'>
          <div className='p-5'>
            <Link to='/' className='inline-flex items-center gap-2'>
              <div className='h-10 w-10 rounded-2xl bg-gradient-to-r from-orange-500 to-pink-500' />
              <div>
                <div className='text-lg font-extrabold'>ShopAdmin</div>
                <div className='text-xs text-gray-400'>Backoffice Panel</div>
              </div>
            </Link>
          </div>

          <div className='px-3'>
            <div className='mb-2 px-3 text-xs font-semibold uppercase tracking-wide text-gray-500'>Management</div>

            <nav className='space-y-1'>
              {nav.map((x) => (
                <NavLink
                  key={x.to}
                  to={x.to}
                  end={x.to === '/admin'}
                  className={({ isActive }) =>
                    [
                      'flex items-center gap-3 rounded-2xl px-4 py-3 font-semibold transition',
                      isActive ? 'bg-white/10 ring-1 ring-white/10' : 'text-gray-300 hover:bg-white/5 hover:text-white'
                    ].join(' ')
                  }
                >
                  <span className='text-lg'>{x.icon}</span>
                  {x.label}
                </NavLink>
              ))}
            </nav>
          </div>

          <div className='absolute bottom-0 left-0 right-0 p-4'>
            <div className='rounded-2xl bg-white/5 p-4 text-sm text-gray-300'>
              <div className='font-bold text-white'>Tips</div>
              <div className='mt-1 opacity-90'>Xoá Brand/Category sẽ bị chặn nếu còn Product.</div>
            </div>
          </div>
        </aside>

        {/* CONTENT */}
        <div className='flex-1'>
          {/* TOPBAR */}
          <div className='sticky top-0 z-40 border-b bg-white/80 backdrop-blur'>
            <div className='mx-auto flex max-w-7xl items-center justify-between px-6 py-4'>
              <div>
                <div className='text-sm text-gray-500'>Admin</div>
                <div className='text-lg font-extrabold text-gray-900'>{location.pathname}</div>
              </div>

              <div className='flex items-center gap-3'>
                <button className='rounded-xl border bg-white px-4 py-2 font-semibold hover:bg-gray-50'>🔔</button>
                <div className='flex items-center gap-3 rounded-2xl border bg-white px-4 py-2'>
                  <div className='h-9 w-9 rounded-full bg-gradient-to-r from-orange-500 to-pink-500' />
                  <div className='leading-tight'>
                    <div className='text-sm font-bold'>Admin</div>
                    <div className='text-xs text-gray-500'>admin@shop.com</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <main className='mx-auto max-w-7xl p-6'>
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}
