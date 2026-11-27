import { type FormEvent, type ReactNode, useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowUpRight,
  Home,
  LogIn,
  LogOut,
  Menu,
  Package,
  Search,
  ShoppingBag,
  Sparkles,
  UserRound,
  X
} from 'lucide-react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { ROUTE_PATHS } from '../routes/route.paths'
import { logoutApi } from '../services/auths.services'
import { clearAuth, getRefreshToken, getToken } from '../utils/authSession'
import cn from '../utils/cn'
import { useCart } from '../hooks/useCart'
import { useProducts } from '../hooks/useProducts'
import { useStorefrontCategories } from '../hooks/useStorefrontCategories'
import money from '../utils/money'
import { formatImageUrl } from '../utils/formatImageUrl'
import type { Product } from '../models/ProductRequests'
import BrandMark from '../components/ui/BrandMark'

const SHOP_ANCHOR = '#shop'

const TICKER = [
  'Hàng chính hãng, rõ nguồn gốc',
  'Giao hàng toàn quốc',
  'Thanh toán COD · PayOS · MoMo',
  'Theo dõi đơn hàng mọi lúc',
  'Lưu sản phẩm yêu thích chỉ với một chạm'
]

const categoryHref = (id?: string) =>
  id ? `${ROUTE_PATHS.USER_HOME}?category=${encodeURIComponent(id)}${SHOP_ANCHOR}` : `${ROUTE_PATHS.USER_HOME}${SHOP_ANCHOR}`

function productThumb(product: Product) {
  const first = product.medias?.[0]
  return formatImageUrl(product.thumbnail || (typeof first === 'string' ? first : first?.url))
}

/* ───────── Search with live suggestions ───────── */
function HeaderSearch({
  initialSearch,
  onSearch,
  className,
  autoFocus
}: {
  initialSearch: string
  onSearch: (q: string) => void
  className?: string
  autoFocus?: boolean
}) {
  const [value, setValue] = useState(initialSearch)
  const [focused, setFocused] = useState(false)
  const [debounced, setDebounced] = useState(initialSearch)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const t = setTimeout(() => setDebounced(value.trim()), 250)
    return () => clearTimeout(t)
  }, [value])

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus()
  }, [autoFocus])

  // "/" focuses search, like most modern storefronts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes(target.tagName) && !target.isContentEditable) {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const shouldSuggest = focused && debounced.length >= 2
  const { data, isFetching } = useProducts(1, 5, { search: shouldSuggest ? debounced : undefined, sort: 'newest' })
  const suggestions = shouldSuggest ? (data?.products ?? []) : []

  const submit = (e: FormEvent) => {
    e.preventDefault()
    setFocused(false)
    inputRef.current?.blur()
    onSearch(value.trim())
  }

  return (
    <div
      className={cn('relative', className)}
      onFocus={() => setFocused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setFocused(false)
      }}
      onKeyDown={(e) => e.key === 'Escape' && setFocused(false)}
    >
      <form onSubmit={submit} role='search' className='relative'>
        <Search size={18} className='pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-500' aria-hidden />
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder='Tìm serum, kem chống nắng, son…'
          aria-label='Tìm kiếm sản phẩm'
          className='h-12 w-full rounded-full border-[1.5px] border-transparent bg-ink-100/70 pl-11 pr-12 text-[15px] text-ink-950 outline-none transition placeholder:text-ink-500 hover:bg-ink-100 focus:border-ink-950 focus:bg-white'
        />
        <kbd className='pointer-events-none absolute right-4 top-1/2 hidden -translate-y-1/2 rounded-md bg-white px-1.5 py-0.5 text-[11px] font-semibold text-ink-500 shadow-xs lg:block'>
          /
        </kbd>
      </form>

      {shouldSuggest ? (
        <div className='absolute inset-x-0 top-full z-[60] mt-2 overflow-hidden rounded-3xl border border-ink-100 bg-white p-2 shadow-lift animate-soft-pop'>
          {suggestions.length ? (
            <>
              <p className='px-3 pb-1 pt-2 text-xs font-semibold text-ink-500'>Gợi ý cho “{debounced}”</p>
              {suggestions.map((product) => {
                const img = productThumb(product)
                return (
                  <Link
                    key={product._id}
                    to={ROUTE_PATHS.USER_PRODUCT_DETAIL(product._id)}
                    onClick={() => setFocused(false)}
                    className='flex items-center gap-3 rounded-2xl px-2.5 py-2 transition hover:bg-ink-50'
                  >
                    <span className='h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-berry-50'>
                      {img ? <img src={img} alt='' className='h-full w-full object-contain p-1 mix-blend-multiply' /> : null}
                    </span>
                    <span className='min-w-0 flex-1'>
                      <span className='block truncate text-sm font-semibold text-ink-950'>{product.name}</span>
                      <span className='text-sm text-ink-600'>{money(product.price)}</span>
                    </span>
                    <ArrowUpRight size={16} className='text-ink-400' aria-hidden />
                  </Link>
                )
              })}
              <button
                type='button'
                onClick={() => {
                  setFocused(false)
                  onSearch(value.trim())
                }}
                className='mt-1 w-full cursor-pointer rounded-2xl bg-ink-50 px-3 py-2.5 text-left text-sm font-semibold text-ink-950 hover:bg-ink-100'
              >
                Xem tất cả kết quả →
              </button>
            </>
          ) : (
            <p className='px-3 py-4 text-sm text-ink-500'>{isFetching ? 'Đang tìm…' : `Không có gợi ý cho “${debounced}”.`}</p>
          )}
        </div>
      ) : null}
    </div>
  )
}

function IconLink({ to, label, children, badge }: { to: string; label: string; children: ReactNode; badge?: number }) {
  return (
    <Link
      to={to}
      aria-label={badge ? `${label} (${badge})` : label}
      title={label}
      className='relative grid h-11 w-11 place-items-center rounded-full text-ink-950 transition hover:bg-ink-100'
    >
      {children}
      {badge ? (
        <span className='absolute right-0.5 top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-berry-600 px-1 text-[11px] font-bold text-white ring-2 ring-canvas'>
          {badge > 99 ? '99+' : badge}
        </span>
      ) : null}
    </Link>
  )
}

export default function UserLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const hasToken = Boolean(getToken())

  const [menuOpen, setMenuOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const accountRef = useRef<HTMLDivElement>(null)

  const { data: cartItems = [] } = useCart(hasToken)
  const cartCount = useMemo(() => cartItems.reduce((sum, item) => sum + item.quantity, 0), [cartItems])
  const { data: categories = [] } = useStorefrontCategories(7)

  const isHome = location.pathname === ROUTE_PATHS.USER_HOME || location.pathname === ROUTE_PATHS.USER
  const params = new URLSearchParams(location.search)
  const urlSearch = isHome ? (params.get('search') ?? '') : ''
  const activeCategory = isHome ? (params.get('category') ?? '') : ''

  // close overlays on navigation
  const [lastPath, setLastPath] = useState(location.key)
  if (lastPath !== location.key) {
    setLastPath(location.key)
    setMenuOpen(false)
    setAccountOpen(false)
  }

  useEffect(() => {
    if (!accountOpen) return
    const onClick = (e: MouseEvent) => {
      if (!accountRef.current?.contains(e.target as Node)) setAccountOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [accountOpen])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  const handleSearch = (q: string) => {
    const next = new URLSearchParams(isHome ? location.search : '')
    if (q) next.set('search', q)
    else next.delete('search')
    const query = next.toString()
    navigate(`${ROUTE_PATHS.USER_HOME}${query ? `?${query}` : ''}${SHOP_ANCHOR}`)
  }

  const handleLogout = async () => {
    const refresh_token = getRefreshToken()
    if (refresh_token) {
      try {
        await logoutApi(refresh_token)
      } catch {
        // token may already be invalid; local sign-out still proceeds
      }
    }
    clearAuth()
    toast.success('Đã đăng xuất. Hẹn gặp lại!')
    navigate(ROUTE_PATHS.AUTH_LOGIN)
  }

  const navLinkCls = (active: boolean) =>
    cn(
      'relative shrink-0 rounded-full px-3.5 py-2 text-sm font-medium transition',
      active ? 'bg-ink-950 text-white' : 'text-ink-700 hover:bg-ink-100 hover:text-ink-950'
    )

  return (
    <div className='min-h-screen bg-canvas text-ink-950'>
      <a
        href='#main'
        className='sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-full focus:bg-ink-950 focus:px-4 focus:py-2 focus:text-white'
      >
        Bỏ qua tới nội dung
      </a>

      {/* ticker */}
      <div className='overflow-hidden bg-ink-950 text-white' aria-label='Thông tin nổi bật'>
        <div className='flex w-max animate-marquee gap-10 py-2 text-[13px] font-medium motion-reduce:animate-none'>
          {[...TICKER, ...TICKER].map((t, i) => (
            <span key={i} className='inline-flex items-center gap-10' aria-hidden={i >= TICKER.length}>
              {t}
              <Sparkles size={12} className='text-lime-300' aria-hidden />
            </span>
          ))}
        </div>
      </div>

      <header className='glass-header sticky top-0 z-50'>
        <div className='mx-auto flex max-w-[1320px] items-center gap-3 px-4 py-3 md:gap-6 md:px-6'>
          <button
            type='button'
            onClick={() => setMenuOpen(true)}
            className='grid h-11 w-11 cursor-pointer place-items-center rounded-full text-ink-950 hover:bg-ink-100 lg:hidden'
            aria-label='Mở menu'
            aria-expanded={menuOpen}
          >
            <Menu size={22} />
          </button>

          <Link to={ROUTE_PATHS.USER_HOME} aria-label='Vibrant Mart — trang chủ' className='shrink-0 rounded-xl'>
            <BrandMark className='hidden sm:inline-flex' />
            <BrandMark compact className='sm:hidden' />
          </Link>

          <HeaderSearch
            key={`${location.pathname}${location.search}`}
            initialSearch={urlSearch}
            onSearch={handleSearch}
            className='hidden flex-1 md:block lg:max-w-xl'
          />

          <div className='ml-auto flex items-center gap-1'>
            <IconLink to={ROUTE_PATHS.USER_ORDERS} label='Đơn hàng'>
              <Package size={21} />
            </IconLink>

            <div ref={accountRef} className='relative'>
              <button
                type='button'
                onClick={() => setAccountOpen((v) => !v)}
                aria-label='Tài khoản'
                aria-expanded={accountOpen}
                aria-haspopup='menu'
                className='grid h-11 w-11 cursor-pointer place-items-center rounded-full text-ink-950 transition hover:bg-ink-100'
              >
                <UserRound size={21} />
              </button>
              {accountOpen ? (
                <div
                  role='menu'
                  className='absolute right-0 top-full z-[70] mt-2 w-60 overflow-hidden rounded-3xl border border-ink-100 bg-white p-2 shadow-lift animate-soft-pop'
                >
                  {hasToken ? (
                    <>
                      <Link role='menuitem' to={ROUTE_PATHS.USER_PROFILE} className='block rounded-2xl px-4 py-2.5 text-sm font-medium hover:bg-ink-50'>
                        Hồ sơ của tôi
                      </Link>
                      <Link role='menuitem' to={ROUTE_PATHS.USER_ORDERS} className='block rounded-2xl px-4 py-2.5 text-sm font-medium hover:bg-ink-50'>
                        Đơn hàng
                      </Link>
                      <Link role='menuitem' to={ROUTE_PATHS.USER_CHANGE_PASSWORD} className='block rounded-2xl px-4 py-2.5 text-sm font-medium hover:bg-ink-50'>
                        Đổi mật khẩu
                      </Link>
                      <div className='my-1 h-px bg-ink-100' />
                      <button
                        role='menuitem'
                        type='button'
                        onClick={handleLogout}
                        className='flex w-full cursor-pointer items-center gap-2 rounded-2xl px-4 py-2.5 text-left text-sm font-medium text-rose-600 hover:bg-rose-50'
                      >
                        <LogOut size={16} /> Đăng xuất
                      </button>
                    </>
                  ) : (
                    <div className='p-2'>
                      <p className='font-display text-lg font-bold'>Chào bạn!</p>
                      <p className='mt-1 text-sm text-ink-600'>Đăng nhập để lưu giỏ hàng và theo dõi đơn.</p>
                      <Link
                        role='menuitem'
                        to={ROUTE_PATHS.AUTH_LOGIN}
                        className='mt-4 flex h-11 items-center justify-center rounded-full bg-ink-950 text-sm font-semibold text-white hover:bg-ink-800'
                      >
                        Đăng nhập
                      </Link>
                      <Link
                        role='menuitem'
                        to={ROUTE_PATHS.AUTH_REGISTER}
                        className='mt-2 flex h-11 items-center justify-center rounded-full border-[1.5px] border-ink-200 text-sm font-semibold hover:border-ink-950'
                      >
                        Tạo tài khoản
                      </Link>
                    </div>
                  )}
                </div>
              ) : null}
            </div>

            <Link
              to={ROUTE_PATHS.USER_CART}
              aria-label={`Giỏ hàng (${cartCount} sản phẩm)`}
              className='ml-1 inline-flex h-11 items-center gap-2 rounded-full bg-ink-950 pl-4 pr-1.5 text-sm font-semibold text-white transition hover:bg-berry-600'
            >
              <ShoppingBag size={18} aria-hidden />
              <span className='hidden sm:inline'>Giỏ</span>
              <span className='grid h-8 min-w-8 place-items-center rounded-full bg-white/15 px-2 text-[13px]'>
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            </Link>
          </div>
        </div>

        {/* mobile search */}
        <div className='px-4 pb-3 md:hidden'>
          <HeaderSearch key={`m-${location.pathname}${location.search}`} initialSearch={urlSearch} onSearch={handleSearch} />
        </div>

        {/* category rail (desktop) */}
        <nav aria-label='Danh mục' className='hidden border-t border-ink-100/80 lg:block'>
          <div className='no-scrollbar mx-auto flex max-w-[1320px] items-center gap-1 overflow-x-auto px-6 py-2'>
            <a href={categoryHref()} className={navLinkCls(isHome && !activeCategory && !urlSearch)}>
              Tất cả
            </a>
            {categories.map((c) => (
              <a key={c.id} href={categoryHref(c.id)} className={navLinkCls(activeCategory === c.id)}>
                {c.name}
              </a>
            ))}
            <span className='ml-auto hidden shrink-0 items-center gap-1.5 text-[13px] text-ink-500 xl:inline-flex'>
              <span className='h-2 w-2 rounded-full bg-emerald-500' aria-hidden /> Đang mở bán trực tuyến
            </span>
          </div>
        </nav>
      </header>

      {/* mobile drawer */}
      {menuOpen ? (
        <div className='fixed inset-0 z-[90] lg:hidden' role='dialog' aria-modal='true' aria-label='Menu'>
          <button type='button' aria-label='Đóng menu' className='absolute inset-0 cursor-default bg-ink-950/40 backdrop-blur-sm' onClick={() => setMenuOpen(false)} />
          <div className='absolute inset-y-0 left-0 flex w-[86%] max-w-sm flex-col bg-canvas shadow-lift animate-fade-up'>
            <div className='flex items-center justify-between px-5 py-4'>
              <BrandMark />
              <button
                type='button'
                onClick={() => setMenuOpen(false)}
                className='grid h-11 w-11 cursor-pointer place-items-center rounded-full hover:bg-ink-100'
                aria-label='Đóng menu'
              >
                <X size={22} />
              </button>
            </div>
            <div className='flex-1 overflow-y-auto px-5 pb-8'>
              <p className='eyebrow mt-2'>Danh mục</p>
              <div className='mt-3 grid gap-1'>
                <a href={categoryHref()} onClick={() => setMenuOpen(false)} className='rounded-2xl px-4 py-3 font-display text-xl font-bold hover:bg-ink-100'>
                  Tất cả sản phẩm
                </a>
                {categories.map((c) => (
                  <a
                    key={c.id}
                    href={categoryHref(c.id)}
                    onClick={() => setMenuOpen(false)}
                    className='rounded-2xl px-4 py-3 font-display text-xl font-bold hover:bg-ink-100'
                  >
                    {c.name}
                  </a>
                ))}
              </div>
              {!hasToken ? (
                <Link
                  to={ROUTE_PATHS.AUTH_LOGIN}
                  className='mt-8 flex h-12 items-center justify-center gap-2 rounded-full bg-ink-950 font-semibold text-white'
                >
                  <LogIn size={18} /> Đăng nhập
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      <main id='main' className='min-h-[60vh] pb-24 lg:pb-0'>
        <Outlet />
      </main>

      {/* footer */}
      <footer className='mt-24 bg-ink-950 text-white'>
        <div className='mx-auto max-w-[1320px] px-4 pb-28 pt-16 md:px-6 lg:pb-12'>
          <div className='grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr]'>
            <div>
              <BrandMark tone='light' />
              <p className='mt-5 max-w-sm text-sm leading-relaxed text-ink-300'>
                Mỹ phẩm và skincare chọn lọc cho routine hằng ngày. Mua sắm dễ, thanh toán linh hoạt, theo dõi đơn rõ ràng.
              </p>
              <Link
                to={ROUTE_PATHS.USER_HOME}
                className='mt-6 inline-flex h-11 items-center gap-2 rounded-full bg-lime-300 px-5 text-sm font-semibold text-ink-950 transition hover:bg-lime-200'
              >
                Mua sắm ngay <ArrowUpRight size={16} />
              </Link>
            </div>
            <div>
              <h4 className='text-sm font-semibold text-ink-400'>Danh mục</h4>
              <ul className='mt-4 space-y-2.5 text-sm'>
                {(categories.length ? categories.slice(0, 5) : []).map((c) => (
                  <li key={c.id}>
                    <a href={categoryHref(c.id)} className='text-ink-200 transition hover:text-white'>
                      {c.name}
                    </a>
                  </li>
                ))}
                <li>
                  <a href={categoryHref()} className='text-ink-200 transition hover:text-white'>
                    Tất cả sản phẩm
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className='text-sm font-semibold text-ink-400'>Tài khoản</h4>
              <ul className='mt-4 space-y-2.5 text-sm'>
                <li><Link to={ROUTE_PATHS.USER_PROFILE} className='text-ink-200 transition hover:text-white'>Hồ sơ</Link></li>
                <li><Link to={ROUTE_PATHS.USER_ORDERS} className='text-ink-200 transition hover:text-white'>Tra cứu đơn hàng</Link></li>
                <li><Link to={ROUTE_PATHS.USER_CART} className='text-ink-200 transition hover:text-white'>Giỏ hàng</Link></li>
              </ul>
            </div>
            <div>
              <h4 className='text-sm font-semibold text-ink-400'>Thanh toán</h4>
              <div className='mt-4 flex flex-wrap gap-2'>
                {['COD', 'PayOS', 'MoMo'].map((m) => (
                  <span key={m} className='chip bg-white/10 text-white'>
                    {m}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div aria-hidden className='mt-16 select-none font-display text-[18vw] font-extrabold leading-[0.8] tracking-tighter text-white/[0.06] lg:text-[13rem]'>
            vibrant.
          </div>
          <div className='mt-6 flex flex-col gap-2 border-t border-white/10 pt-6 text-xs text-ink-400 sm:flex-row sm:justify-between'>
            <span>© {new Date().getFullYear()} Vibrant Mart</span>
            <span>Made for glowing skin ✦</span>
          </div>
        </div>
      </footer>

      {/* mobile dock */}
      <nav
        aria-label='Điều hướng nhanh'
        className='fixed inset-x-3 bottom-3 z-50 rounded-full bg-ink-950/95 p-1.5 shadow-lift backdrop-blur lg:hidden'
      >
        <div className='grid grid-cols-4'>
          {[
            { to: ROUTE_PATHS.USER_HOME, label: 'Trang chủ', icon: Home },
            { to: ROUTE_PATHS.USER_CART, label: 'Giỏ hàng', icon: ShoppingBag, badge: cartCount },
            { to: ROUTE_PATHS.USER_ORDERS, label: 'Đơn hàng', icon: Package },
            { to: ROUTE_PATHS.USER_PROFILE, label: 'Tôi', icon: UserRound }
          ].map(({ to, label, icon: Icon, badge }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  'relative flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-full text-[11px] font-semibold transition',
                  isActive ? 'bg-white text-ink-950' : 'text-ink-300 hover:text-white'
                )
              }
            >
              <Icon size={19} aria-hidden />
              {label}
              {badge ? (
                <span className='absolute right-[22%] top-1 grid h-4 min-w-4 place-items-center rounded-full bg-berry-500 px-1 text-[10px] font-bold text-white'>
                  {badge > 99 ? '99+' : badge}
                </span>
              ) : null}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
