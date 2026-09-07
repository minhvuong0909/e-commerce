import { type FormEvent, useEffect, useMemo, useState } from 'react'
import { ChevronDown, LogOut, Menu, PackageCheck, Search, ShieldCheck, ShoppingBag, Sparkles, Truck, UserRound, X } from 'lucide-react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { ROUTE_PATHS } from '../routes/route.paths'
import { logoutApi } from '../services/auths.services'
import { clearAuth, getRefreshToken, getToken } from '../utils/authSession'
import cn from '../utils/cn'
import FloatingContactWidget from '../components/ui/FloatingContactWidget'
import { useCart } from '../hooks/useCart'
import { useProducts } from '../hooks/useProducts'
import money from '../utils/money'
import { formatImageUrl } from '../utils/formatImageUrl'
import type { Product } from '../models/ProductRequests'

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
    shouldSuggest: boolean
    suggestionData?: { products: Array<Product> }
    setFocused: (focused: boolean) => void
  }) => React.ReactNode
}) {
  const [headerSearch, setHeaderSearch] = useState(initialSearch)
  const [focused, setFocused] = useState(false)
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch)
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(headerSearch.trim()), 250)
    return () => clearTimeout(timer)
  }, [headerSearch])
  const shouldSuggest = focused && debouncedSearch.length >= 2
  const { data: suggestionData } = useProducts(1, 3, {
    search: shouldSuggest ? debouncedSearch : undefined,
    sort: 'newest'
  })

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setFocused(false)
    onSearch(headerSearch.trim())
  }

  return (
    <div
      className='contents'
      onFocus={(event) => { if (event.target instanceof HTMLInputElement) setFocused(true) }}
      onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false) }}
      onKeyDown={(event) => { if (event.key === 'Escape') setFocused(false) }}
    >
      {children({ headerSearch, setHeaderSearch, handleSubmit, shouldSuggest, suggestionData, setFocused })}
    </div>
  )
}

export default function UserLayout() {
  const location = useLocation()
  const navigate = useNavigate()

  const hasToken = Boolean(getToken())
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { data: cartItems = [] } = useCart(hasToken)
  const cartCount = useMemo(() => cartItems.reduce((sum, item) => sum + item.quantity, 0), [cartItems])

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
        {({ headerSearch, setHeaderSearch, handleSubmit, shouldSuggest, suggestionData, setFocused }) => (
          <header className='sticky top-0 z-50 border-b border-[#eaded8] bg-white'>
            <div className='mx-auto max-w-7xl px-4 md:px-6'>
              <div className='flex items-center gap-3 py-3 md:gap-4'>
                <button
                  type='button'
                  onClick={() => setMobileMenuOpen((prev) => !prev)}
                  className='grid h-10 w-10 place-items-center rounded-lg border border-[#eaded8] bg-white text-[#4a403c] md:hidden'
                  aria-label='Mở danh mục'
                  aria-expanded={mobileMenuOpen}
                >
                  {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
                </button>

                <Link
                  to={ROUTE_PATHS.USER_HOME}
                  className='flex shrink-0 items-center gap-2.5'
                  aria-label='Vibrant Mart home'
                >
                  <span className='grid h-10 w-10 place-items-center rounded-lg bg-[#3d3330] text-white'>
                    <Sparkles size={18} />
                  </span>
                  <span className='leading-tight'>
                    <span className='block font-serif text-lg tracking-tight md:text-2xl'>Vibrant Mart</span>
                    <span className='block text-[10px] font-medium uppercase tracking-[0.16em] text-[#b07a72]'>
                      Beauty &amp; Skincare
                    </span>
                  </span>
                </Link>

                <div className='relative hidden min-w-0 flex-1 md:block'>
                  <form onSubmit={handleSubmit} className='relative w-full'>
                    <Search className='pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#a89890]' size={17} />
                    <input
                      value={headerSearch}
                      onChange={(e) => setHeaderSearch(e.target.value)}
                      placeholder='Tìm serum, kem chống nắng, toner...'
                      className='h-11 w-full rounded-full border border-[#EFECE6] bg-white pl-10 pr-4 text-sm font-semibold text-[#3d3330] shadow-sm outline-none transition placeholder:text-[#8a7a74] focus:border-[#c65f4a] focus:ring-2 focus:ring-[#f5d5cf]/80'
                    />
                  </form>
                  {shouldSuggest && suggestionData?.products?.length ? (
                    <div className='absolute left-0 right-0 top-full mt-2 z-[60] overflow-hidden rounded-2xl border border-[#eaded8] bg-white shadow-2xl shadow-[#3d3330]/10'>
                      {suggestionData.products.map((product) => {
                        const firstMedia = product.medias?.[0]
                        const image = formatImageUrl(product.thumbnail || (typeof firstMedia === 'string' ? firstMedia : firstMedia?.url))
                        return (
                          <Link
                            key={product._id}
                            to={ROUTE_PATHS.USER_PRODUCT_DETAIL(product._id)}
                            onClick={() => setFocused(false)}
                            className='flex items-center gap-3 border-b border-[#f2e7e1] px-3 py-3 last:border-0 hover:bg-[#fdf8f6]'
                          >
                            <span className='h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-[#f5ebe6]'>
                              {image ? <img src={image} alt='' className='h-full w-full object-cover' /> : null}
                            </span>
                            <span className='min-w-0 flex-1'>
                              <span className='block truncate text-sm font-black text-[#3d3330]'>{product.name}</span>
                              <span className='mt-0.5 block text-xs font-bold text-[#c65f4a]'>{money(product.price)}</span>
                            </span>
                          </Link>
                        )
                      })}
                    </div>
                  ) : null}
                </div>

                <div className='ml-auto flex items-center gap-2'>
                  <Link
                    to={ROUTE_PATHS.USER_CART}
                    aria-label='Giỏ hàng'
                    title='Giỏ hàng'
                    className='relative order-last grid h-10 w-10 place-items-center rounded-lg border border-[#eaded8] bg-white text-[#4a403c] transition hover:border-[#cbb8af] hover:bg-[#fdf8f6]'
                  >
                    <ShoppingBag size={20} />
                    {cartCount > 0 ? (
                      <span className='absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-[#c65f4a] px-1 text-[10px] font-black text-white'>
                        {cartCount > 99 ? '99+' : cartCount}
                      </span>
                    ) : null}
                  </Link>

                  <div className='relative'>
                    <button
                      type='button'
                      onClick={() => setUserMenuOpen((prev) => !prev)}
                      className='inline-flex h-10 items-center gap-2 rounded-lg border border-[#eaded8] bg-white px-3 text-[#4a403c] transition hover:border-[#cbb8af] hover:bg-[#fdf8f6]'
                      aria-label='Menu tài khoản'
                      aria-expanded={userMenuOpen}
                    >
                      <UserRound size={18} />
                      <ChevronDown size={14} />
                    </button>
                    {userMenuOpen ? (
                      <div className='absolute right-0 top-12 z-[70] w-52 overflow-hidden rounded-2xl border border-[#eaded8] bg-white p-1 text-sm font-bold shadow-2xl shadow-[#3d3330]/10'>
                        <Link to={ROUTE_PATHS.USER_PROFILE} onClick={() => setUserMenuOpen(false)} className='block rounded-xl px-3 py-2.5 text-[#4a403c] hover:bg-[#fdf8f6]'>
                          Hồ sơ cá nhân
                        </Link>
                        <Link to={ROUTE_PATHS.USER_ORDERS} onClick={() => setUserMenuOpen(false)} className='block rounded-xl px-3 py-2.5 text-[#4a403c] hover:bg-[#fdf8f6]'>
                          Đơn mua của tôi
                        </Link>
                        {hasToken ? (
                          <button
                            type='button'
                            onClick={handleLogout}
                            className='flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-rose-600 hover:bg-rose-50'
                          >
                            <LogOut size={15} />
                            Đăng xuất
                          </button>
                        ) : (
                          <Link to={ROUTE_PATHS.AUTH_LOGIN} onClick={() => setUserMenuOpen(false)} className='block rounded-xl px-3 py-2.5 text-[#c65f4a] hover:bg-[#fff7f4]'>
                            Đăng nhập
                          </Link>
                        )}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className='relative pb-3 md:hidden'>
                <form onSubmit={handleSubmit}>
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
                {shouldSuggest && suggestionData?.products?.length ? (
                  <div className='absolute left-0 right-0 top-full mt-1 z-[60] overflow-hidden rounded-xl border border-[#eaded8] bg-white shadow-xl'>
                    {suggestionData.products.map((product) => {
                      const firstMedia = product.medias?.[0]
                      const image = formatImageUrl(product.thumbnail || (typeof firstMedia === 'string' ? firstMedia : firstMedia?.url))
                      return (
                        <Link
                          key={product._id}
                          to={ROUTE_PATHS.USER_PRODUCT_DETAIL(product._id)}
                          onClick={() => setFocused(false)}
                          className='flex items-center gap-3 border-b border-[#f2e7e1] px-3 py-2.5 last:border-0 hover:bg-[#fdf8f6]'
                        >
                          <span className='h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-[#f5ebe6]'>
                            {image ? <img src={image} alt='' className='h-full w-full object-cover' /> : null}
                          </span>
                          <span className='min-w-0 flex-1'>
                            <span className='block truncate text-xs font-bold text-[#3d3330]'>{product.name}</span>
                            <span className='block text-[11px] font-bold text-[#c65f4a]'>{money(product.price)}</span>
                          </span>
                        </Link>
                      )
                    })}
                  </div>
                ) : null}
              </div>
            </div>

            <div className='hidden border-t border-[#f0e4de] bg-white/90 md:block'>
              <nav className='mx-auto flex max-w-7xl items-center gap-2 overflow-x-auto px-6 py-2 text-xs font-black uppercase tracking-[0.1em] text-[#6b5f59]'>
                {['Tất cả sản phẩm', 'Skincare', 'Chống nắng', 'Làm sạch', 'Trang điểm', 'Combo Routine'].map((item) => (
                  <a key={item} href={item === 'Tất cả sản phẩm' ? `${ROUTE_PATHS.USER_HOME}#new-arrivals` : `${ROUTE_PATHS.USER_HOME}?search=${encodeURIComponent(item)}#featured-products`} className='shrink-0 border-b border-transparent px-3 py-1.5 transition hover:border-[#786452] hover:text-[#2B2118]'>
                    {item}
                  </a>
                ))}
              </nav>
            </div>

            {mobileMenuOpen ? (
              <div className='border-t border-[#f0e4de] bg-white px-4 py-3 md:hidden'>
                <div className='grid grid-cols-2 gap-2'>
                  {['Tất cả sản phẩm', 'Skincare', 'Chống nắng', 'Làm sạch', 'Trang điểm', 'Combo Routine'].map((item) => (
                    <a
                      key={item}
                      href={item === 'Tất cả sản phẩm' ? `${ROUTE_PATHS.USER_HOME}#new-arrivals` : `${ROUTE_PATHS.USER_HOME}?search=${encodeURIComponent(item)}#featured-products`}
                      onClick={() => setMobileMenuOpen(false)}
                      className='rounded-xl border border-[#eaded8] px-3 py-2 text-sm font-bold text-[#5c504a]'
                    >
                      {item}
                    </a>
                  ))}
                </div>
              </div>
            ) : null}

            {/* Mobile Bottom Dock Navigation Bar */}
            <div className='md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-[#eaded8] bg-white/95 backdrop-blur-md shadow-lg shadow-black/10'>
              <nav className='mx-auto grid grid-cols-4 gap-1 px-2 py-1.5'>
                {mobileNav.map(({ to, label, icon: Icon }) => (
                  <NavLink
                    key={to}
                    to={to}
                    className={({ isActive }) =>
                      cn(
                        'flex flex-col items-center justify-center gap-0.5 rounded-xl py-1.5 text-[10px] font-bold transition',
                        isActive ? 'bg-[#3d3330] text-white shadow-sm' : 'text-[#6b5f59] hover:bg-[#fdf2f0]'
                      )
                    }
                  >
                    <div className='relative'>
                      <Icon size={18} />
                      {to === ROUTE_PATHS.USER_CART && cartCount > 0 ? (
                        <span className='absolute -right-2 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-[#c65f4a] px-1 text-[9px] font-black text-white'>
                          {cartCount > 99 ? '99+' : cartCount}
                        </span>
                      ) : null}
                    </div>
                    <span>{label}</span>
                  </NavLink>
                ))}
              </nav>
            </div>
          </header>
        )}
      </HeaderSearchControls>

      <main className='min-h-[calc(100vh-140px)] pb-16 md:pb-0'>
        <Outlet />
      </main>

      <FloatingContactWidget />

      <footer className='border-t border-[#2b2523] bg-[#2a2421]'>
        <div className='mx-auto flex max-w-7xl flex-col gap-3 px-4 py-7 text-sm text-white/70 md:flex-row md:items-center md:justify-between md:px-6'>
          <div className='flex items-center gap-2 font-medium'>
            <ShieldCheck size={17} className='text-[#f0b3a4]' />
            Thanh toán bảo mật · Hàng chính hãng · Hỗ trợ sau bán hàng
          </div>
          <div>© {new Date().getFullYear()} Vibrant Mart. All rights reserved.</div>
        </div>
      </footer>
    </div>
  )
}
