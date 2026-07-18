import { motion } from 'framer-motion'
import { Boxes, FolderTree, LayoutDashboard, LogOut, ShoppingBag, Sparkles, Tags, UserRound, Users } from 'lucide-react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { pageMotion } from '../constants/motion'
import { ROUTE_PATHS } from '../routes/route.paths'
import { getMeApi, logoutApi } from '../services/auths.services'
import { clearAuth, getRefreshToken, getRole, USER_ROLE } from '../utils/authSession'
import cn from '../utils/cn'



const allNav = [

  { to: ROUTE_PATHS.ADMIN, label: 'Tổng quan', icon: LayoutDashboard, end: true, staffAllowed: true },

  { to: ROUTE_PATHS.ADMIN_PRODUCTS, label: 'Sản phẩm', icon: Boxes, staffAllowed: false },

  { to: ROUTE_PATHS.ADMIN_BRANDS, label: 'Thương hiệu', icon: Tags, staffAllowed: false },

  { to: ROUTE_PATHS.ADMIN_CATEGORIES, label: 'Danh mục', icon: FolderTree, staffAllowed: false },

  { to: ROUTE_PATHS.ADMIN_ORDERS, label: 'Đơn hàng', icon: ShoppingBag, staffAllowed: true },

  { to: ROUTE_PATHS.ADMIN_USERS, label: 'Người dùng', icon: Users, staffAllowed: false, adminOnly: true }

]



function roleLabel(role: number | null | undefined) {

  if (role === USER_ROLE.Admin) return 'Admin'

  if (role === USER_ROLE.Staff) return 'Staff'

  return 'User'

}



export default function AdminLayout() {
  const location = useLocation()
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

  const displayEmail = profile?.email || '—'



  const navLinkClass = (isActive: boolean, compact = false) =>

    cn(

      'flex items-center gap-3 font-semibold transition',

      compact ? 'inline-flex min-h-10 shrink-0 rounded-lg px-3 text-xs' : 'min-h-11 rounded-lg px-4 text-sm',

      isActive

        ? 'bg-[#b07a72] text-white shadow-sm'

        : 'text-[#6b5f59] hover:bg-[#fdf8f6] hover:text-[#3d3330]'

    )



  return (

    <div className='admin-theme min-h-screen text-[#3d3330]'>

      <div className='flex min-h-screen'>

        <aside className='sticky top-0 hidden h-screen w-[272px] shrink-0 border-r border-[#eaded8] bg-white p-4 md:block'>

          <Link to={ROUTE_PATHS.ADMIN} className='flex items-center gap-3 rounded-lg border border-[#eaded8] bg-[#fdf8f6] p-4'>

            <span className='grid h-10 w-10 place-items-center rounded-md bg-[#b07a72] text-white'>

              <Sparkles size={18} />

            </span>

            <span>

              <span className='block text-sm font-semibold tracking-tight'>Vibrant Mart</span>

              <span className='block text-xs text-[#8a7a74]'>Skincare admin</span>

            </span>

          </Link>



          <nav className='mt-6 space-y-1'>

            {nav.map(({ to, label, icon: Icon, end }) => (

              <NavLink key={to} to={to} end={end} className={({ isActive }) => navLinkClass(isActive)}>

                <Icon size={18} />

                {label}

              </NavLink>

            ))}

          </nav>



          <div className='mt-8 rounded-lg border border-[#eaded8] bg-[#fdf8f6] p-4'>

            <div className='text-sm font-semibold text-[#3d3330]'>Gợi ý vận hành</div>

            <div className='mt-2 space-y-2 text-xs leading-5 text-[#8a7a74]'>

              {isStaff ? (

                <p>Staff chỉ quản lý đơn hàng. Liên hệ Admin để thay đổi catalog.</p>

              ) : (

                <>

                  <p>Kiểm tra tồn kho thấp trước khi chạy khuyến mãi.</p>

                  <p>Hoàn tiền chỉ áp dụng cho đơn đã thanh toán.</p>

                </>

              )}

            </div>

          </div>

        </aside>



        <div className='flex min-w-0 flex-1 flex-col'>

          <header className='sticky top-0 z-40 border-b border-[#eaded8] bg-white/95 backdrop-blur-sm'>

            <div className='mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-6'>

              <div className='flex min-w-0 items-center gap-3 md:hidden'>

                <Link to={ROUTE_PATHS.ADMIN} className='grid h-10 w-10 place-items-center rounded-md bg-[#b07a72] text-white'>

                  <Sparkles size={18} />

                </Link>

                <span className='text-sm font-semibold'>{displayRole}</span>

              </div>



              <p className='hidden text-sm text-[#8a7a74] md:block'>

                Quản lý cửa hàng mỹ phẩm — sản phẩm, đơn hàng & khách hàng

              </p>



              <div className='flex items-center gap-3'>

                <div className='hidden rounded-lg border border-[#eaded8] bg-[#fdf8f6] px-3 py-1.5 text-xs text-[#8a7a74] sm:block'>

                  Vai trò: <span className='font-semibold text-[#b07a72]'>{displayRole}</span>

                </div>

                <div className='flex items-center gap-3 rounded-lg border border-[#eaded8] bg-white px-3 py-2'>

                  <span className='grid h-9 w-9 place-items-center rounded-md bg-[#fdf8f6] text-[#b07a72]'>

                    <UserRound size={17} />

                  </span>

                  <div className='hidden leading-tight sm:block'>

                    <div className='text-sm font-semibold'>{displayName}</div>

                    <div className='text-xs text-[#8a7a74]'>{displayEmail}</div>

                  </div>

                </div>

                <button
                  type='button'
                  onClick={handleLogout}
                  title='Đăng xuất'
                  aria-label='Đăng xuất'
                  className='grid h-10 w-10 place-items-center rounded-lg border border-rose-200 bg-rose-50/50 text-rose-600 transition hover:border-rose-300 hover:bg-rose-50'
                >
                  <LogOut size={17} />
                </button>

              </div>

            </div>



            <nav className='flex gap-1 overflow-x-auto border-t border-[#f0e4de] px-3 py-2 md:hidden'>

              {nav.map(({ to, label, icon: Icon, end }) => (

                <NavLink key={to} to={to} end={end} className={({ isActive }) => navLinkClass(isActive, true)}>

                  <Icon size={15} />

                  {label}

                </NavLink>

              ))}

            </nav>

          </header>



          <main className='mx-auto w-full max-w-7xl flex-1 px-4 py-6 md:px-6'>

            <motion.div key={location.pathname} {...pageMotion}>

              <Outlet />

            </motion.div>

          </main>



          <footer className='border-t border-[#eaded8] bg-white py-4 text-center text-xs text-[#8a7a74]'>

            © {new Date().getFullYear()} Vibrant Mart · Admin

          </footer>

        </div>

      </div>

    </div>

  )

}


