import { type FormEvent, useEffect, useMemo, useState } from 'react'
import { ChevronDown, LogOut, Menu, PackageCheck, Search, ShieldCheck, ShoppingBag, Sparkles, Truck, UserRound, X } from 'lucide-react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { ROUTE_PATHS } from '../routes/route.paths'
import { logoutApi } from '../services/auths.services'
import { clearAuth, getRefreshToken, getToken } from '../utils/authSession'
import cn from '../utils/cn'
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
  const { data: suggestionData } = useProducts(1, 4, {
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
    <div className='min-h-screen bg-[#FAF7F2] text-[#2B2118] selection:bg-[#9A8069]/20'>
      {/* Top Announcement Bar */}
      <div className='bg-[#2B2118] py-2 px-4 text-center text-xs font-medium text-[#EFE9E0] tracking-wide'>
        <div className='mx-auto max-w-7xl flex items-center justify-between gap-4'>
          <span className='hidden sm:inline-flex items-center gap-1.5 text-amber-200/90 text-[11px] font-semibold uppercase tracking-widest'>
            <Sparkles size={13} className='text-[#9A8069]' /> Vibrant Mart
          </span>
          <span className='mx-auto sm:mx-0'>
            Miễn phí vận chuyển cho đơn hàng từ <strong>500.000đ</strong> 🚚
          </span>
          <span className='hidden md:inline-flex items-center gap-2 text-[11px] text-[#DFD3C3]'>
            Hỗ trợ trực tuyến 24/7
          </span>
        </div>
      </div>

      <HeaderSearchControls key={searchKey} initialSearch={urlSearch} onSearch={handleSearch}>
        {({ headerSearch, setHeaderSearch, handleSubmit, shouldSuggest, suggestionData, setFocused }) => (
          <header className='sticky top-0 z-50 glass-header shadow-sm transition-all'>
            <div className='mx-auto max-w-7xl px-4 md:px-6'>
              <div className='flex items-center justify-between gap-4 py-3.5'>
                {/* Mobile Menu Trigger */}
                <button
                  type='button'
                  onClick={() => setMobileMenuOpen((prev) => !prev)}
                  className='grid h-10 w-10 place-items-center rounded-xl border border-[#EFECE6] bg-white text-[#2B2118] md:hidden shadow-xs hover:bg-[#F5EFE6]'
                  aria-label='Mở menu danh mục'
                  aria-expanded={mobileMenuOpen}
                >
                  {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
                </button>

                {/* Brand Logo */}
                <Link
                  to={ROUTE_PATHS.USER_HOME}
                  className='flex shrink-0 items-center gap-3 group'
                  aria-label='Vibrant Mart Home'
                >
                  <span className='grid h-11 w-11 place-items-center rounded-xl bg-[#2B2118] text-[#FAF7F2] shadow-md transition-transform duration-300 group-hover:scale-105'>
                    <Sparkles size={20} className='text-[#9A8069]' />
                  </span>
                  <span className='leading-none'>
                    <span className='block font-display text-xl font-extrabold tracking-tight md:text-2xl text-[#2B2118]'>
                      Vibrant Mart
                    </span>
                    <span className='block mt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#9A8069]'>
                      Luxury &amp; Editorial
                    </span>
                  </span>
                </Link>

                {/* Desktop Search Bar */}
                <div className='relative hidden min-w-0 max-w-md flex-1 md:block'>
                  <form onSubmit={handleSubmit} className='relative w-full'>
                    <Search className='pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#8C7D70]' size={17} />
                    <input
                      value={headerSearch}
                      onChange={(e) => setHeaderSearch(e.target.value)}
                      placeholder='Tìm sản phẩm dưỡng da, nước hoa, serum...'
                      className='h-11 w-full rounded-full border border-[#EFECE6] bg-white/90 pl-11 pr-14 text-sm font-medium text-[#2B2118] shadow-xs outline-none transition placeholder:text-[#A3968B] focus:border-[#9A8069] focus:bg-white focus:ring-4 focus:ring-[#9A8069]/10'
                    />
                    <kbd className='pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 rounded-md border border-[#EFECE6] bg-[#F5EFE6] px-2 py-0.5 text-[10px] font-semibold text-[#8C7D70]'>
                      ⌘K
                    </kbd>
                  </form>
                  {shouldSuggest && suggestionData?.products?.length ? (
                    <div className='absolute left-0 right-0 top-full mt-2 z-[60] overflow-hidden rounded-2xl border border-[#EFECE6] bg-white p-2 shadow-xl shadow-[#2B2118]/10'>
                      <p className='px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-[#9A8069]'>Gợi ý tìm kiếm</p>
                      {suggestionData.products.map((product) => {
                        const firstMedia = product.medias?.[0]
                        const image = formatImageUrl(product.thumbnail || (typeof firstMedia === 'string' ? firstMedia : firstMedia?.url))
                        return (
                          <Link
                            key={product._id}
                            to={ROUTE_PATHS.USER_PRODUCT_DETAIL(product._id)}
                            onClick={() => setFocused(false)}
                            className='flex items-center gap-3 rounded-xl border border-transparent px-3 py-2.5 transition hover:border-[#EFECE6] hover:bg-[#FAF7F2]'
                          >
                            <span className='h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-[#F5EFE6] border border-[#EFECE6]'>
                              {image ? <img src={image} alt='' className='h-full w-full object-cover' /> : null}
                            </span>
                            <span className='min-w-0 flex-1'>
                              <span className='block truncate text-sm font-bold text-[#2B2118]'>{product.name}</span>
                              <span className='mt-0.5 block text-xs font-semibold text-[#9A8069]'>{money(product.price)}</span>
                            </span>
                          </Link>
                        )
                      })}
                    </div>
                  ) : null}
                </div>

                {/* Right Action Icons */}
                <div className='flex items-center gap-2.5'>
                  <Link
                    to={ROUTE_PATHS.USER_CART}
                    aria-label='Giỏ hàng'
                    title='Giỏ hàng của bạn'
                    className='relative grid h-11 w-11 place-items-center rounded-xl border border-[#EFECE6] bg-white text-[#2B2118] shadow-xs transition hover:border-[#9A8069] hover:bg-[#F5EFE6]'
                  >
                    <ShoppingBag size={20} />
                    {cartCount > 0 ? (
                      <span className='absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-[#2B2118] px-1 text-[10px] font-bold text-[#FAF7F2] shadow-sm ring-2 ring-[#FAF7F2]'>
                        {cartCount > 99 ? '99+' : cartCount}
                      </span>
                    ) : null}
                  </Link>

                  <div className='relative'>
                    <button
                      type='button'
                      onClick={() => setUserMenuOpen((prev) => !prev)}
                      className='inline-flex h-11 items-center gap-2 rounded-xl border border-[#EFECE6] bg-white px-3.5 text-sm font-medium text-[#2B2118] shadow-xs transition hover:border-[#9A8069] hover:bg-[#F5EFE6]'
                      aria-label='Menu tài khoản'
                      aria-expanded={userMenuOpen}
                    >
                      <UserRound size={19} className='text-[#9A8069]' />
                      <span className='hidden lg:inline text-xs font-bold text-[#2B2118]'>Tài khoản</span>
                      <ChevronDown size={14} className='text-[#8C7D70]' />
                    </button>
                    {userMenuOpen ? (
                      <div className='absolute right-0 top-13 z-[70] w-56 overflow-hidden rounded-2xl border border-[#EFECE6] bg-white p-1.5 shadow-xl shadow-[#2B2118]/10'>
                        <Link to={ROUTE_PATHS.USER_PROFILE} onClick={() => setUserMenuOpen(false)} className='block rounded-xl px-3.5 py-2.5 text-sm font-semibold text-[#2B2118] hover:bg-[#F5EFE6] transition-colors'>
                          Hồ sơ cá nhân
                        </Link>
                        <Link to={ROUTE_PATHS.USER_ORDERS} onClick={() => setUserMenuOpen(false)} className='block rounded-xl px-3.5 py-2.5 text-sm font-semibold text-[#2B2118] hover:bg-[#F5EFE6] transition-colors'>
                          Đơn hàng đã đặt
                        </Link>
                        {hasToken ? (
                          <button
                            type='button'
                            onClick={handleLogout}
                            className='flex w-full items-center gap-2 rounded-xl px-3.5 py-2.5 text-left text-sm font-semibold text-rose-600 hover:bg-rose-50 transition-colors'
                          >
                            <LogOut size={16} />
                            Đăng xuất
                          </button>
                        ) : (
                          <Link to={ROUTE_PATHS.AUTH_LOGIN} onClick={() => setUserMenuOpen(false)} className='block rounded-xl px-3.5 py-2.5 text-sm font-bold text-[#9A8069] hover:bg-[#F5EFE6] transition-colors'>
                            Đăng nhập / Đăng ký
                          </Link>
                        )}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>

              {/* Mobile Search Bar Input */}
              <div className='relative pb-3 md:hidden'>
                <form onSubmit={handleSubmit}>
                  <div className='relative'>
                    <Search className='pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C7D70]' size={16} />
                    <input
                      value={headerSearch}
                      onChange={(e) => setHeaderSearch(e.target.value)}
                      placeholder='Tìm sản phẩm...'
                      className='h-10 w-full rounded-xl border border-[#EFECE6] bg-white pl-10 pr-4 text-sm font-medium outline-none focus:border-[#9A8069] focus:ring-2 focus:ring-[#9A8069]/20'
                    />
                  </div>
                </form>
                {shouldSuggest && suggestionData?.products?.length ? (
                  <div className='absolute left-0 right-0 top-full mt-1 z-[60] overflow-hidden rounded-xl border border-[#EFECE6] bg-white shadow-xl'>
                    {suggestionData.products.map((product) => {
                      const firstMedia = product.medias?.[0]
                      const image = formatImageUrl(product.thumbnail || (typeof firstMedia === 'string' ? firstMedia : firstMedia?.url))
                      return (
                        <Link
                          key={product._id}
                          to={ROUTE_PATHS.USER_PRODUCT_DETAIL(product._id)}
                          onClick={() => setFocused(false)}
                          className='flex items-center gap-3 border-b border-[#EFECE6] px-3 py-2.5 last:border-0 hover:bg-[#F5EFE6]'
                        >
                          <span className='h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-[#F5EFE6]'>
                            {image ? <img src={image} alt='' className='h-full w-full object-cover' /> : null}
                          </span>
                          <span className='min-w-0 flex-1'>
                            <span className='block truncate text-xs font-bold text-[#2B2118]'>{product.name}</span>
                            <span className='block text-[11px] font-bold text-[#9A8069]'>{money(product.price)}</span>
                          </span>
                        </Link>
                      )
                    })}
                  </div>
                ) : null}
              </div>
            </div>

            {/* Sub-Navigation Categories Bar */}
            <div className='hidden border-t border-[#EFECE6] bg-white/70 md:block'>
              <nav className='mx-auto flex max-w-7xl items-center gap-2 overflow-x-auto px-6 py-2 text-xs font-bold uppercase tracking-[0.14em] text-[#594D42]'>
                {['Tất cả sản phẩm', 'Skincare High-End', 'Chống Nắng', 'Làm Sạch', 'Trang Điểm Editorial', 'Bộ Giftset & Combo'].map((item) => (
                  <a
                    key={item}
                    href={item === 'Tất cả sản phẩm' ? `${ROUTE_PATHS.USER_HOME}#new-arrivals` : `${ROUTE_PATHS.USER_HOME}?search=${encodeURIComponent(item)}#featured-products`}
                    className='shrink-0 border-b-2 border-transparent px-3 py-1.5 transition-all hover:border-[#9A8069] hover:text-[#2B2118]'
                  >
                    {item}
                  </a>
                ))}
              </nav>
            </div>

            {/* Mobile Expandable Drawer Menu */}
            {mobileMenuOpen ? (
              <div className='border-t border-[#EFECE6] bg-white px-4 py-4 md:hidden'>
                <div className='grid grid-cols-2 gap-2'>
                  {['Tất cả sản phẩm', 'Skincare High-End', 'Chống Nắng', 'Làm Sạch', 'Trang Điểm', 'Bộ Giftset'].map((item) => (
                    <a
                      key={item}
                      href={item === 'Tất cả sản phẩm' ? `${ROUTE_PATHS.USER_HOME}#new-arrivals` : `${ROUTE_PATHS.USER_HOME}?search=${encodeURIComponent(item)}#featured-products`}
                      onClick={() => setMobileMenuOpen(false)}
                      className='rounded-xl border border-[#EFECE6] bg-[#FAF7F2] px-3 py-2.5 text-xs font-bold text-[#2B2118]'
                    >
                      {item}
                    </a>
                  ))}
                </div>
              </div>
            ) : null}

            {/* Mobile Floating Bottom Dock */}
            <div className='md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-[#EFECE6] bg-white/95 backdrop-blur-md shadow-lg shadow-black/5'>
              <nav className='mx-auto grid grid-cols-4 gap-1 px-2 py-2'>
                {mobileNav.map(({ to, label, icon: Icon }) => (
                  <NavLink
                    key={to}
                    to={to}
                    className={({ isActive }) =>
                      cn(
                        'flex flex-col items-center justify-center gap-1 rounded-xl py-1.5 text-[10px] font-bold transition',
                        isActive ? 'bg-[#2B2118] text-[#FAF7F2] shadow-sm' : 'text-[#594D42] hover:bg-[#F5EFE6]'
                      )
                    }
                  >
                    <div className='relative'>
                      <Icon size={18} />
                      {to === ROUTE_PATHS.USER_CART && cartCount > 0 ? (
                        <span className='absolute -right-2 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-[#9A8069] px-1 text-[9px] font-bold text-white'>
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

      {/* Editorial Luxury Footer */}
      <footer className='mt-20 border-t border-[#EFECE6] bg-[#2B2118] text-[#FAF7F2]'>
        <div className='mx-auto max-w-7xl px-4 py-16 md:px-6'>
          <div className='grid gap-10 md:grid-cols-2 lg:grid-cols-4'>
            {/* Brand Info */}
            <div className='space-y-4'>
              <div className='flex items-center gap-2.5'>
                <span className='grid h-9 w-9 place-items-center rounded-xl bg-[#9A8069] text-[#2B2118]'>
                  <Sparkles size={18} />
                </span>
                <span className='font-display text-2xl font-bold tracking-tight text-white'>Vibrant Mart</span>
              </div>
              <p className='text-xs leading-relaxed text-[#DFD3C3]'>
                Thương hiệu phân phối mỹ phẩm &amp; giải pháp chăm sóc da cao cấp theo tinh thần Warm Luxury. Cam kết 100% chính hãng.
              </p>
            </div>

            {/* Navigation Links */}
            <div>
              <h4 className='font-display text-sm font-bold uppercase tracking-wider text-amber-200/90 mb-4'>Danh mục nổi bật</h4>
              <ul className='space-y-2.5 text-xs text-[#DFD3C3]'>
                <li><a href={`${ROUTE_PATHS.USER_HOME}#featured-products`} className='hover:text-white transition'>Skincare Chuyên Sâu</a></li>
                <li><a href={`${ROUTE_PATHS.USER_HOME}#featured-products`} className='hover:text-white transition'>Kem Chống Nắng Quang Phổ Rộng</a></li>
                <li><a href={`${ROUTE_PATHS.USER_HOME}#featured-products`} className='hover:text-white transition'>Trang Điểm Natural Look</a></li>
                <li><a href={`${ROUTE_PATHS.USER_HOME}#featured-products`} className='hover:text-white transition'>Bộ Sản Phẩm Tiết Kiệm</a></li>
              </ul>
            </div>

            {/* Customer Care */}
            <div>
              <h4 className='font-display text-sm font-bold uppercase tracking-wider text-amber-200/90 mb-4'>Hỗ trợ khách hàng</h4>
              <ul className='space-y-2.5 text-xs text-[#DFD3C3]'>
                <li><Link to={ROUTE_PATHS.USER_ORDERS} className='hover:text-white transition'>Tra cứu đơn hàng</Link></li>
                <li><a href='#' className='hover:text-white transition'>Chính sách đổi trả 7 ngày</a></li>
                <li><a href='#' className='hover:text-white transition'>Chính sách bảo mật thông tin</a></li>
                <li><a href='#' className='hover:text-white transition'>Điều khoản dịch vụ</a></li>
              </ul>
            </div>

            {/* Newsletter Subscription */}
            <div>
              <h4 className='font-display text-sm font-bold uppercase tracking-wider text-amber-200/90 mb-4'>Đăng ký nhận ưu đãi</h4>
              <p className='text-xs text-[#DFD3C3] mb-3'>Nhận mã voucher giảm 10% cho đơn hàng đầu tiên.</p>
              <form onSubmit={(e) => { e.preventDefault(); toast.success('Đăng ký nhận ưu đãi thành công!') }} className='space-y-2'>
                <input
                  type='email'
                  required
                  placeholder='Nhập email của bạn...'
                  className='h-10 w-full rounded-xl border border-white/20 bg-white/10 px-3.5 text-xs text-white placeholder:text-white/40 outline-none focus:border-[#9A8069]'
                />
                <button type='submit' className='h-10 w-full rounded-xl bg-[#9A8069] text-xs font-bold text-[#2B2118] hover:bg-[#DFD3C3] transition-colors'>
                  Gửi đăng ký
                </button>
              </form>
            </div>
          </div>

          <div className='mt-12 border-t border-white/10 pt-6 flex flex-col gap-4 text-center md:flex-row md:items-center md:justify-between text-xs text-[#DFD3C3]'>
            <div className='flex items-center justify-center gap-2'>
              <ShieldCheck size={16} className='text-[#9A8069]' />
              Thanh toán an toàn với SSL 256-bit · PayOS · MoMo · Visa / MasterCard
            </div>
            <div>© {new Date().getFullYear()} Vibrant Mart Inc. Bản quyền được bảo lưu.</div>
          </div>
        </div>
      </footer>
    </div>
  )
}
