import { type FormEvent, useState } from 'react'
import { LogOut, PackageCheck, Search, ShieldCheck, ShoppingBag, Sparkles, Truck, UserRound } from 'lucide-react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { ROUTE_PATHS } from '../routes/route.paths'
import { logoutApi } from '../services/auths.services'
import { clearAuth, getRefreshToken, getToken } from '../utils/authSession'
import cn from '../utils/cn'

const mobileNav = [
  { to: ROUTE_PATHS.USER_HOME, label: 'Trang chủ', icon: ShoppingBag },
  { to: ROUTE_PATHS.USER_CART, label: 'Giỏ hàng', icon: PackageCheck },
  { to: ROUTE_PATHS.USER_ORDERS, label: 'Đơn hàng', icon: Truck },
  { to: ROUTE_PATHS.USER_PROFILE, label: 'Tài khoản', icon: UserRound }
]

type HeaderSearchBarProps = {
  initialSearch: string
  onSearch: (query: string) => void
}

function HeaderSearchControls({
  initialSearch,
  onSearch,
  children
}: HeaderSearchBarProps & {
  children: (props: {
    headerSearch: string
    setHeaderSearch: (value: string) => void
    handleSubmit: (e: FormEvent) => void
  }) => React.ReactNode
}) {
  const [headerSearch, setHeaderSearch] = useState(initialSearch)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    onSearch(headerSearch.trim())
  }

  return <>{children({ headerSearch, setHeaderSearch, handleSubmit })}</>
}

function HeaderIconLink({
  to,
  label,
  children
}: {
  to: string
  label: string
  children: React.ReactNode
}) {
  return (
    <Link
      to={to}
      aria-label={label}
      title={label}
      className='grid h-10 w-10 place-items-center rounded-lg border border-[#eaded8] bg-white text-[#4a403c] transition hover:border-[#cbb8af] hover:bg-[#fdf8f6]'
    >
      {children}
    </Link>
  )
}

export default function UserLayout() {
  const location = useLocation()
  const navigate = useNavigate()

  const hasToken = Boolean(getToken())

  const handleLogout = async () => {
    const refresh_token = getRefreshToken()
    if (refresh_token) {
      try {
        await logoutApi(refresh_token)
      } catch {
        // ignore
      }
    }
    clearAuth()
    toast.success('Đăng xuất thành công!')
    navigate(ROUTE_PATHS.AUTH_LOGIN)
  }

  const isHome = location.pathname === ROUTE_PATHS.USER_HOME || location.pathname === ROUTE_PATHS.USER
  const urlSearch = isHome ? (new URLSearchParams(location.search).get('search') ?? '') : ''
  const searchKey = `${location.pathname}${location.search}`

  const handleSearch = (q: string) => {
    const params = new URLSearchParams(isHome ? location.search : '')
    if (q) params.set('search', q)
    else params.delete('search')
    const query = params.toString()
    const target = query
      ? `${ROUTE_PATHS.USER_HOME}?${query}#featured-products`
      : `${ROUTE_PATHS.USER_HOME}#featured-products`
    navigate(target)
  }

  return (
    <div className='min-h-screen bg-[var(--page-bg)] text-[#3d3330]'>
      <HeaderSearchControls key={searchKey} initialSearch={urlSearch} onSearch={handleSearch}>
        {({ headerSearch, setHeaderSearch, handleSubmit }) => (
          <header className='sticky top-0 z-50 border-b border-[#eaded8] bg-[#fffcfb]/92 shadow-sm backdrop-blur-xl'>
            <div className='mx-auto max-w-7xl px-4 md:px-6'>
              <div className='flex items-center gap-3 py-3 md:gap-4'>
                <Link
                  to={ROUTE_PATHS.USER_HOME}
                  className='flex shrink-0 items-center gap-2.5'
                  aria-label='Vibrant Mart home'
                >
                  <span className='grid h-10 w-10 place-items-center rounded-lg bg-[#3d3330] text-white'>
                    <Sparkles size={18} />
                  </span>
                  <span className='hidden leading-tight sm:block'>
                    <span className='block text-sm font-semibold tracking-tight'>Vibrant Mart</span>
                    <span className='block text-[10px] font-medium uppercase tracking-[0.16em] text-[#b07a72]'>
                      Beauty &amp; Skincare
                    </span>
                  </span>
                </Link>

                <form onSubmit={handleSubmit} className='relative hidden min-w-0 flex-1 md:block'>
                  <Search className='pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#a89890]' size={17} />
                  <input
                    value={headerSearch}
                    onChange={(e) => setHeaderSearch(e.target.value)}
                    placeholder='Tìm serum, sữa rửa mặt, son môi...'
                    className='h-10 w-full rounded-lg border border-[#eaded8] bg-white pl-10 pr-4 text-sm font-medium text-[#3d3330] outline-none transition placeholder:text-[#b0a09a] focus:border-[#cbb8af] focus:ring-2 focus:ring-[#f5d5cf]/60'
                  />
                </form>

                <div className='ml-auto flex items-center gap-2'>
                  <HeaderIconLink to={ROUTE_PATHS.USER_CART} label='Giỏ hàng'>
                    <PackageCheck size={18} />
                  </HeaderIconLink>
                  <HeaderIconLink to={ROUTE_PATHS.USER_PROFILE} label='Tài khoản'>
                    <UserRound size={18} />
                  </HeaderIconLink>
                  {hasToken ? (
                    <button
                      type='button'
                      onClick={handleLogout}
                      title='Đăng xuất'
                      aria-label='Đăng xuất'
                      className='grid h-10 w-10 place-items-center rounded-lg border border-rose-200 bg-rose-50/50 text-rose-600 transition hover:border-rose-300 hover:bg-rose-50'
                    >
                      <LogOut size={18} />
                    </button>
                  ) : null}
                  <Link
                    to={ROUTE_PATHS.USER_ORDERS}
                    className='hidden h-10 items-center rounded-lg border border-[#eaded8] bg-white px-3 text-xs font-semibold text-[#5c504a] transition hover:bg-[#fdf8f6] lg:inline-flex'
                  >
                    Đơn hàng
                  </Link>
                </div>
              </div>

              <form onSubmit={handleSubmit} className='pb-3 md:hidden'>
                <div className='relative'>
                  <Search className='pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#a89890]' size={16} />
                  <input
                    value={headerSearch}
                    onChange={(e) => setHeaderSearch(e.target.value)}
                    placeholder='Tìm sản phẩm...'
                    className='h-10 w-full rounded-lg border border-[#eaded8] bg-white pl-10 pr-4 text-sm font-medium outline-none focus:border-[#cbb8af] focus:ring-2 focus:ring-[#f5d5cf]/60'
                  />
                </div>
              </form>
            </div>

            <div className='border-t border-[#f0e4de] bg-[#fffcfb]/95 lg:hidden'>
              <nav className='mx-auto grid max-w-7xl grid-cols-4 gap-1 px-3 py-2'>
                {mobileNav.map(({ to, label, icon: Icon }) => (
                  <NavLink
                    key={to}
                    to={to}
                    className={({ isActive }) =>
                      cn(
                        'flex min-h-14 flex-col items-center justify-center gap-1 rounded-lg text-[10px] font-semibold transition',
                        isActive ? 'bg-[#3d3330] text-white' : 'text-[#6b5f59] hover:bg-[#fdf2f0]'
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
        )}
      </HeaderSearchControls>

      <main className='min-h-[calc(100vh-140px)]'>
        <Outlet />
      </main>

      <footer className='border-t border-[#eaded8] bg-[#fffcfb]/90'>
        <div className='mx-auto flex max-w-7xl flex-col gap-3 px-4 py-6 text-sm text-[#8a7a74] md:flex-row md:items-center md:justify-between md:px-6'>
          <div className='flex items-center gap-2 font-medium'>
            <ShieldCheck size={17} className='text-[#b07a72]' />
            Thanh toán bảo mật · Hàng chính hãng · Hỗ trợ sau bán hàng
          </div>
          <div>© {new Date().getFullYear()} Vibrant Mart. All rights reserved.</div>
        </div>
      </footer>
    </div>
  )
}
