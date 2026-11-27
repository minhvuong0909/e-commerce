import { Boxes, ExternalLink, FolderTree, LayoutDashboard, LogOut, Settings, ShoppingBag, Tags, TicketPercent, Users } from 'lucide-react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ROUTE_PATHS } from '../routes/route.paths'
import { getMeApi, logoutApi } from '../services/auths.services'
import { clearAuth, getRefreshToken, getRole, USER_ROLE } from '../utils/authSession'
import cn from '../utils/cn'
import BrandMark from '../components/ui/BrandMark'

const allNav = [
  { to: ROUTE_PATHS.ADMIN, label: 'Tổng quan', icon: LayoutDashboard, end: true, staffAllowed: true },
  { to: ROUTE_PATHS.ADMIN_ORDERS, label: 'Đơn hàng', icon: ShoppingBag, staffAllowed: true },
  { to: ROUTE_PATHS.ADMIN_PRODUCTS, label: 'Sản phẩm', icon: Boxes, staffAllowed: false },
  { to: ROUTE_PATHS.ADMIN_CATEGORIES, label: 'Danh mục', icon: FolderTree, staffAllowed: false },
  { to: ROUTE_PATHS.ADMIN_BRANDS, label: 'Thương hiệu', icon: Tags, staffAllowed: false },
  { to: ROUTE_PATHS.ADMIN_USERS, label: 'Người dùng', icon: Users, staffAllowed: false },
  { to: ROUTE_PATHS.ADMIN_VOUCHERS, label: 'Voucher', icon: TicketPercent, staffAllowed: false },
  { to: ROUTE_PATHS.ADMIN_SETTINGS, label: 'Cài đặt', icon: Settings, staffAllowed: false }
]

function roleLabel(role: number | null | undefined) {
  if (role === USER_ROLE.Admin) return 'Admin'
  if (role === USER_ROLE.Staff) return 'Staff'
  return 'User'
}

export default function AdminLayout() {
  const navigate = useNavigate()
  const storedRole = getRole()
  const isStaff = storedRole === USER_ROLE.Staff

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
    toast.success('Đã đăng xuất')
    navigate(ROUTE_PATHS.AUTH_LOGIN)
  }

  const { data: profile } = useQuery({
    queryKey: ['admin-profile'],
    queryFn: async () => {
      const res = await getMeApi()
      return res.data.result as { name?: string; email?: string; role?: number }
    }
  })

  const nav = allNav.filter((item) => (isStaff ? item.staffAllowed : true))
  const displayRole = roleLabel(profile?.role ?? storedRole)
  const displayName = profile?.name || 'Quản trị viên'
  const initials = displayName.trim().charAt(0).toUpperCase()

  return (
    <div className='admin-theme min-h-screen'>
      <div className='flex min-h-screen'>
        {/* sidebar */}
        <aside className='sticky top-0 hidden h-screen w-[264px] shrink-0 flex-col border-r border-ink-200 bg-white p-4 text-ink-950 md:flex'>
          <Link to={ROUTE_PATHS.ADMIN} className='flex items-center gap-2 rounded-2xl px-2 py-2'>
            <BrandMark />
          </Link>
          <p className='mt-1 px-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-500'>Workspace</p>

          <nav aria-label='Quản trị' className='mt-6 space-y-1'>
            {nav.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  cn(
                    'flex h-11 items-center gap-3 rounded-2xl px-3.5 text-sm font-medium transition',
                    isActive ? 'bg-berry-50 text-berry-700' : 'text-ink-600 hover:bg-ink-100 hover:text-ink-950'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon size={18} className={isActive ? 'text-berry-600' : ''} aria-hidden />
                    {label}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <div className='mt-auto space-y-2'>
            <Link
              to={ROUTE_PATHS.USER_HOME}
              target='_blank'
              rel='noreferrer'
              className='flex h-11 items-center gap-3 rounded-2xl px-3.5 text-sm font-medium text-ink-600 transition hover:bg-ink-100 hover:text-ink-950'
            >
              <ExternalLink size={17} aria-hidden /> Xem cửa hàng
            </Link>
            <div className='flex items-center gap-3 rounded-3xl bg-ink-50 p-3'>
              <span className='grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-berry-100 font-display font-bold text-berry-700'>
                {initials}
              </span>
              <div className='min-w-0 flex-1 leading-tight'>
                <p className='truncate text-sm font-semibold'>{displayName}</p>
                <p className='text-xs text-berry-700'>{displayRole}</p>
              </div>
              <button
                type='button'
                onClick={handleLogout}
                aria-label='Đăng xuất'
                title='Đăng xuất'
                className='grid h-9 w-9 shrink-0 cursor-pointer place-items-center rounded-xl text-ink-600 transition hover:bg-rose-50 hover:text-rose-600'
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </aside>

        {/* workspace */}
        <div className='flex min-w-0 flex-1 flex-col'>
          <header className='sticky top-0 z-40 border-b border-ink-100 bg-white/90 backdrop-blur md:hidden'>
            <div className='flex items-center justify-between px-4 py-3'>
              <Link to={ROUTE_PATHS.ADMIN}>
                <BrandMark compact />
              </Link>
              <div className='flex items-center gap-2'>
                <span className='chip bg-ink-100 text-ink-700'>{displayRole}</span>
                <button
                  type='button'
                  onClick={handleLogout}
                  aria-label='Đăng xuất'
                  className='grid h-10 w-10 cursor-pointer place-items-center rounded-full text-rose-600 hover:bg-rose-50'
                >
                  <LogOut size={18} />
                </button>
              </div>
            </div>
            <nav aria-label='Quản trị' className='no-scrollbar flex gap-1 overflow-x-auto px-3 pb-2'>
              {nav.map(({ to, label, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    cn(
                      'chip h-9 shrink-0 transition',
                      isActive ? 'bg-berry-50 text-berry-700' : 'text-ink-600 hover:bg-ink-100'
                    )
                  }
                >
                  <Icon size={15} aria-hidden />
                  {label}
                </NavLink>
              ))}
            </nav>
          </header>

          <main className='mx-auto w-full max-w-[1320px] flex-1 px-4 py-6 md:px-8 md:py-8'>
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}
