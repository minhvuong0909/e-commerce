import { Boxes, ExternalLink, FolderTree, LayoutDashboard, LogOut, Settings, ShoppingBag, Sparkles, Tags, UserRound, Users } from 'lucide-react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ROUTE_PATHS } from '../routes/route.paths'
import { getMeApi, logoutApi } from '../services/auths.services'
import { clearAuth, getRefreshToken, getRole, USER_ROLE } from '../utils/authSession'
import cn from '../utils/cn'

const allNav = [
  { to: ROUTE_PATHS.ADMIN, label: 'Tổng Quan Dashboard', icon: LayoutDashboard, end: true, staffAllowed: true },
  { to: ROUTE_PATHS.ADMIN_PRODUCTS, label: 'Quản Lý Sản Phẩm', icon: Boxes, staffAllowed: false },
  { to: ROUTE_PATHS.ADMIN_ORDERS, label: 'Quản Lý Đơn Hàng', icon: ShoppingBag, staffAllowed: true },
  { to: ROUTE_PATHS.ADMIN_CATEGORIES, label: 'Quản Lý Danh Mục', icon: FolderTree, staffAllowed: false },
  { to: ROUTE_PATHS.ADMIN_BRANDS, label: 'Quản Lý Thương Hiệu', icon: Tags, staffAllowed: false },
  { to: ROUTE_PATHS.ADMIN_USERS, label: 'Quản Lý Người Dùng', icon: Users, staffAllowed: false, adminOnly: true },
  { to: ROUTE_PATHS.ADMIN_SETTINGS, label: 'Cài Đặt Cửa Hàng', icon: Settings, staffAllowed: false, adminOnly: true }
]

function roleLabel(role: number | null | undefined) {
  if (role === USER_ROLE.Admin) return 'Quản Trị Viên (Admin)'
  if (role === USER_ROLE.Staff) return 'Nhân Viên (Staff)'
  return 'Người Dùng'
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
        // ignore
      }
    }
    clearAuth()
    toast.success('Đăng xuất thành công!')
    navigate(ROUTE_PATHS.AUTH_LOGIN)
  }

  const { data: profile } = useQuery({
    queryKey: ['admin-profile'],
    queryFn: async () => {
      const res = await getMeApi()
      return res.data.result as { name?: string; email?: string; role?: number }
    }
  })

  const nav = allNav.filter((item) => {
    if (isStaff) return item.staffAllowed
    return true
  })

  const displayRole = roleLabel(profile?.role ?? storedRole)
  const displayName = profile?.name || 'Quản trị viên'
  const displayEmail = profile?.email || 'admin@vibrantmart.com'

  const navLinkClass = (isActive: boolean, compact = false) =>
    cn(
      'flex items-center gap-3 font-semibold transition-all duration-200',
      compact ? 'inline-flex min-h-10 shrink-0 rounded-xl px-3 text-xs' : 'min-h-11 rounded-xl px-4 text-sm',
      isActive
        ? 'bg-gradient-to-r from-[#9A8069] to-[#786452] text-white shadow-md shadow-[#9A8069]/20 font-bold'
        : compact
          ? 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          : 'text-slate-300 hover:bg-white/10 hover:text-white'
    )

  return (
    <div className='admin-theme min-h-screen bg-[#0F1117] text-slate-100 selection:bg-[#9A8069]/30'>
      <div className='flex min-h-screen'>
        {/* Sidebar */}
        <aside className='sticky top-0 hidden h-screen w-[270px] shrink-0 flex-col border-r border-white/10 bg-[#141721] p-5 text-white md:flex justify-between'>
          <div>
            {/* Admin Brand Logo Header */}
            <Link to={ROUTE_PATHS.ADMIN} className='flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 shadow-sm group hover:border-[#9A8069]/40 transition-colors'>
              <span className='grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-[#9A8069] to-[#2B2118] text-white shadow-md'>
                <Sparkles size={20} className='text-amber-200' />
              </span>
              <span className='leading-tight'>
                <span className='block font-display text-base font-bold tracking-tight text-white'>Vibrant Admin</span>
                <span className='block text-[10px] font-mono font-bold uppercase tracking-widest text-[#9A8069]'>Commercial Hub</span>
              </span>
            </Link>

            {/* Nav List */}
            <nav className='mt-6 space-y-1.5'>
              {nav.map(({ to, label, icon: Icon, end }) => (
                <NavLink key={to} to={to} end={end} className={({ isActive }) => navLinkClass(isActive)}>
                  <Icon size={18} />
                  <span>{label}</span>
                </NavLink>
              ))}
            </nav>
          </div>

          {/* Bottom Sidebar Action & Storefront Link */}
          <div className='space-y-3 pt-4 border-t border-white/10'>
            <Link
              to={ROUTE_PATHS.USER_HOME}
              target='_blank'
              className='flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs font-bold text-slate-300 hover:bg-white/10 hover:text-white transition-all'
            >
              <span className='flex items-center gap-2'>
                <ExternalLink size={14} className='text-[#9A8069]' />
                Xem Cửa Hàng User
              </span>
              <span className='rounded bg-emerald-500/20 px-1.5 py-0.5 text-[9px] font-bold text-emerald-400'>LIVE</span>
            </Link>

            <div className='rounded-2xl border border-white/10 bg-white/5 p-3.5'>
              <div className='text-xs font-bold text-white flex items-center justify-between'>
                <span>Hỗ Trợ Vận Hành</span>
                <span className='h-2 w-2 rounded-full bg-emerald-400 animate-pulse' />
              </div>
              <p className='mt-1.5 text-[11px] text-slate-400 leading-relaxed'>
                Cập nhật đơn hàng mới, tra cứu PayOS &amp; điều chỉnh tồn kho thời gian thực.
              </p>
            </div>
          </div>
        </aside>

        {/* Main Content Workspace */}
        <div className='flex min-w-0 flex-1 flex-col bg-[#F7F7F8] text-[#27272A]'>
          {/* Header Bar */}
          <header className='sticky top-0 z-40 border-b border-[#E4E4E7] bg-white/95 backdrop-blur-md shadow-xs'>
            <div className='mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3.5 md:px-6'>
              <div className='flex min-w-0 items-center gap-3 md:hidden'>
                <Link to={ROUTE_PATHS.ADMIN} className='grid h-10 w-10 place-items-center rounded-xl bg-[#2B2118] text-white shadow-sm'>
                  <Sparkles size={18} className='text-[#9A8069]' />
                </Link>
                <div>
                  <span className='block text-xs font-bold text-slate-900'>Maison Admin</span>
                  <span className='block text-[10px] font-mono text-[#9A8069]'>{displayRole}</span>
                </div>
              </div>

              <div className='hidden items-center gap-3 md:flex'>
                <span className='font-display text-sm font-bold text-slate-800'>Hệ Thống Quản Trị Thương Mại Điện Tử</span>
                <span className='h-3 w-px bg-slate-200' />
                <span className='text-xs text-slate-500 font-medium'>Đồng bộ PayOS, MoMo &amp; Tồn kho tự động</span>
              </div>

              <div className='flex items-center gap-3'>
                <div className='hidden rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-xs font-semibold text-slate-600 sm:block'>
                  Vai trò: <strong className='text-[#9A8069]'>{displayRole}</strong>
                </div>

                <div className='flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3.5 py-2 shadow-xs'>
                  <span className='grid h-9 w-9 place-items-center rounded-lg bg-slate-100 text-[#2B2118] border border-slate-200'>
                    <UserRound size={17} />
                  </span>
                  <div className='hidden leading-tight sm:block'>
                    <div className='text-xs font-bold text-slate-900'>{displayName}</div>
                    <div className='text-[11px] text-slate-500 font-mono'>{displayEmail}</div>
                  </div>
                </div>

                <button
                  type='button'
                  onClick={handleLogout}
                  title='Đăng xuất tài khoản'
                  aria-label='Đăng xuất'
                  className='grid h-10 w-10 place-items-center rounded-xl border border-rose-200 bg-rose-50 text-rose-600 transition hover:bg-rose-100'
                >
                  <LogOut size={17} />
                </button>
              </div>
            </div>

            {/* Mobile Nav Tabs */}
            <nav className='flex gap-1 overflow-x-auto border-t border-slate-200 px-3 py-2 md:hidden'>
              {nav.map(({ to, label, icon: Icon, end }) => (
                <NavLink key={to} to={to} end={end} className={({ isActive }) => navLinkClass(isActive, true)}>
                  <Icon size={15} />
                  {label}
                </NavLink>
              ))}
            </nav>
          </header>

          <main className='mx-auto w-full max-w-7xl flex-1 px-4 py-6 md:px-6'>
            <Outlet />
          </main>

          <footer className='border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500 font-medium'>
            © {new Date().getFullYear()} Vibrant Mart Enterprise · Powered by Commercial Engine &amp; PayOS Gateway
          </footer>
        </div>
      </div>
    </div>
  )
}
