import { useEffect, lazy, Suspense } from 'react'
import { Routes, Route, Navigate, BrowserRouter, useLocation } from 'react-router-dom'
import { Toaster } from 'sonner'
import AuthLayout from './layouts/AuthLayout'
import UserLayout from './layouts/UserLayout'
import HomePage from './pages/user/HomePage'

// Lazy loaded Auth Pages
const LoginPage = lazy(() => import('./pages/auth/LoginPage'))
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage'))
const ResetPasswordPage = lazy(() => import('./pages/auth/ResetPasswordPage'))
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'))
const VerifyResultPage = lazy(() => import('./pages/auth/VerifyResultPage'))
const ResendVerifyEmailPage = lazy(() => import('./pages/auth/ResendVerifyPage'))
const AuthCallbackPage = lazy(() => import('./pages/auth/AuthCallBackPage'))

// Lazy loaded User Pages
const ProductDetailPage = lazy(() => import('./pages/user/ProductDetailPage'))
const CartPage = lazy(() => import('./pages/user/CartPage'))
const CheckoutPage = lazy(() => import('./pages/user/CheckoutPage'))
const MyOrdersPage = lazy(() => import('./pages/user/MyOrdersPage'))
const OrderDetailPage = lazy(() => import('./pages/user/OrderDetailPage'))
const OrderResultPage = lazy(() => import('./pages/user/OrderResultPage'))
const ProfilePage = lazy(() => import('./pages/user/GetProfile'))
const ChangePasswordPage = lazy(() => import('./pages/user/ChangePasswordPage'))

// Lazy loaded Admin Layout & Pages
const AdminLayout = lazy(() => import('./layouts/AdminLayout'))
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage'))
const AdminProductsPage = lazy(() => import('./pages/admin/products/AdminProductsPage'))
const AdminProductCreatePage = lazy(() => import('./pages/admin/products/AdminProductCreatePage'))
const AdminProductEditPage = lazy(() => import('./pages/admin/products/AdminProductUpdatePage'))
const AdminBrandsPage = lazy(() => import('./pages/admin/brands/AdminBrandsPage'))
const AdminBrandCreatePage = lazy(() => import('./pages/admin/brands/AdminBrandCreatePage'))
const AdminBrandEditPage = lazy(() => import('./pages/admin/brands/AdminBrandUpdatePage'))
const AdminCategoriesPage = lazy(() => import('./pages/admin/categories/AdminCategoriesPage'))
const AdminCategoryCreatePage = lazy(() => import('./pages/admin/categories/AdminCategoryCreatePage'))
const AdminCategoryEditPage = lazy(() => import('./pages/admin/categories/AdminCategoryUpdatePage'))
const AdminOrdersPage = lazy(() => import('./pages/admin/orders/AdminOrdersPage'))
const AdminOrderDetailPage = lazy(() => import('./pages/admin/orders/AdminOrderDetailPage'))
const AdminUsersPage = lazy(() => import('./pages/admin/users/AdminUsersPage'))
const AdminSettingsPage = lazy(() => import('./pages/admin/AdminSettingsPage'))

import RequireAuth from './components/auth/RequireAuth'
import RequireRole from './components/auth/RequireRole'
import { getRole, getToken, normalizeRole, setUserRole, USER_ROLE } from './utils/authSession'
import { getMeApi } from './services/auths.services'
import { ROUTE_PATHS, ROUTE_SEGMENTS } from './routes/route.paths'
import { useAuthNotice } from './hooks/useAuthNotice'

function AuthBootstrap() {
  useEffect(() => {
    if (!getToken() || getRole() !== null) return
    getMeApi()
      .then((res) => {
        const role = normalizeRole(res.data.result?.role)
        if (role !== null) setUserRole(role)
      })
      .catch(() => {
        // token hết hạn sẽ được xử lý bởi api interceptor
      })
  }, [])
  return null
}

function AuthNoticeListener() {
  useAuthNotice()
  return null
}

function AdminOnly({ children }: { children: React.ReactNode }) {
  return (
    <RequireRole roles={[USER_ROLE.Admin]} fallback={ROUTE_PATHS.ADMIN_ORDERS}>
      {children}
    </RequireRole>
  )
}

function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as unknown as ScrollBehavior })
  }, [pathname])

  return null
}

function PageLoadingFallback() {
  return (
    <div className='flex min-h-[50vh] flex-col items-center justify-center space-y-3 py-16 text-[#b07a72]'>
      <div className='h-9 w-9 animate-spin rounded-full border-3 border-current border-t-transparent' />
      <p className='text-xs font-medium tracking-wide text-[#786452] animate-pulse'>Đang tải nội dung...</p>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AuthBootstrap />
      <AuthNoticeListener />
      <Toaster richColors position='top-right' />
      <Suspense fallback={<PageLoadingFallback />}>
        <Routes>
          <Route path={ROUTE_PATHS.AUTH_CALLBACK} element={<AuthCallbackPage />} />
          {/* auth layouts */}
          <Route path={ROUTE_PATHS.AUTH} element={<AuthLayout />}>
            <Route index element={<Navigate to={ROUTE_SEGMENTS.LOGIN} replace />} />
            <Route path={ROUTE_SEGMENTS.LOGIN} element={<LoginPage />} />
            <Route path={ROUTE_SEGMENTS.REGISTER} element={<RegisterPage />} />
            <Route path={ROUTE_SEGMENTS.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
            <Route path={ROUTE_SEGMENTS.RESET_PASSWORD} element={<ResetPasswordPage />} />
            <Route path={ROUTE_SEGMENTS.VERIFY_RESULT} element={<VerifyResultPage />} />
            <Route path={ROUTE_SEGMENTS.RESEND_VERIFY} element={<ResendVerifyEmailPage />} />
          </Route>

          {/* ================= USER ================= */}
          <Route path={ROUTE_PATHS.USER} element={<UserLayout />}>
            <Route index element={<HomePage />} />
            <Route path={ROUTE_SEGMENTS.USER_HOME} element={<HomePage />} />
            <Route path={`${ROUTE_SEGMENTS.USER_PRODUCTS}/${ROUTE_SEGMENTS.ID}`} element={<ProductDetailPage />} />
            <Route
              path={ROUTE_SEGMENTS.USER_CART}
              element={
                <RequireAuth>
                  <CartPage />
                </RequireAuth>
              }
            />
            <Route
              path={ROUTE_SEGMENTS.USER_CHECKOUT}
              element={<CheckoutPage />}
            />
            <Route
              path={ROUTE_SEGMENTS.USER_ORDERS}
              element={
                <RequireAuth>
                  <MyOrdersPage />
                </RequireAuth>
              }
            />
            <Route
              path={`${ROUTE_SEGMENTS.USER_ORDERS}/${ROUTE_SEGMENTS.ID}`}
              element={
                <RequireAuth>
                  <OrderDetailPage />
                </RequireAuth>
              }
            />
            <Route
              path={ROUTE_SEGMENTS.USER_ORDER_RESULT}
              element={
                <RequireAuth>
                  <OrderResultPage />
                </RequireAuth>
              }
            />
            <Route
              path={ROUTE_SEGMENTS.USER_PROFILE}
              element={
                <RequireAuth>
                  <ProfilePage />
                </RequireAuth>
              }
            />
            <Route
              path={ROUTE_SEGMENTS.USER_CHANGE_PASSWORD}
              element={
                <RequireAuth>
                  <ChangePasswordPage />
                </RequireAuth>
              }
            />
          </Route>

          {/* ================= ADMIN ================= */}
          <Route
            path={ROUTE_PATHS.ADMIN}
            element={
              <RequireRole roles={[USER_ROLE.Admin, USER_ROLE.Staff]}>
                <AdminLayout />
              </RequireRole>
            }
          >
            <Route index element={<AdminDashboardPage />} />

            {/* products — Admin only */}
            <Route
              path={ROUTE_SEGMENTS.ADMIN_PRODUCTS}
              element={
                <AdminOnly>
                  <AdminProductsPage />
                </AdminOnly>
              }
            />
            <Route
              path={`${ROUTE_SEGMENTS.ADMIN_PRODUCTS}/${ROUTE_SEGMENTS.CREATE}`}
              element={
                <AdminOnly>
                  <AdminProductCreatePage />
                </AdminOnly>
              }
            />
            <Route
              path={`${ROUTE_SEGMENTS.ADMIN_PRODUCTS}/${ROUTE_SEGMENTS.ID}/${ROUTE_SEGMENTS.EDIT}`}
              element={
                <AdminOnly>
                  <AdminProductEditPage />
                </AdminOnly>
              }
            />

            {/* brands — Admin only */}
            <Route
              path={ROUTE_SEGMENTS.ADMIN_BRANDS}
              element={
                <AdminOnly>
                  <AdminBrandsPage />
                </AdminOnly>
              }
            />
            <Route
              path={`${ROUTE_SEGMENTS.ADMIN_BRANDS}/${ROUTE_SEGMENTS.CREATE}`}
              element={
                <AdminOnly>
                  <AdminBrandCreatePage />
                </AdminOnly>
              }
            />
            <Route
              path={`${ROUTE_SEGMENTS.ADMIN_BRANDS}/${ROUTE_SEGMENTS.ID}/${ROUTE_SEGMENTS.EDIT}`}
              element={
                <AdminOnly>
                  <AdminBrandEditPage />
                </AdminOnly>
              }
            />

            {/* categories — Admin only */}
            <Route
              path={ROUTE_SEGMENTS.ADMIN_CATEGORIES}
              element={
                <AdminOnly>
                  <AdminCategoriesPage />
                </AdminOnly>
              }
            />
            <Route
              path={`${ROUTE_SEGMENTS.ADMIN_CATEGORIES}/${ROUTE_SEGMENTS.CREATE}`}
              element={
                <AdminOnly>
                  <AdminCategoryCreatePage />
                </AdminOnly>
              }
            />
            <Route
              path={`${ROUTE_SEGMENTS.ADMIN_CATEGORIES}/${ROUTE_SEGMENTS.ID}/${ROUTE_SEGMENTS.EDIT}`}
              element={
                <AdminOnly>
                  <AdminCategoryEditPage />
                </AdminOnly>
              }
            />

            {/* orders — Staff + Admin */}
            <Route path={ROUTE_SEGMENTS.ADMIN_ORDERS} element={<AdminOrdersPage />} />
            <Route path={`${ROUTE_SEGMENTS.ADMIN_ORDERS}/${ROUTE_SEGMENTS.ID}`} element={<AdminOrderDetailPage />} />

            {/* users — Admin only */}
            <Route
              path={ROUTE_SEGMENTS.ADMIN_USERS}
              element={
                <AdminOnly>
                  <AdminUsersPage />
                </AdminOnly>
              }
            />
            <Route
              path={ROUTE_SEGMENTS.ADMIN_SETTINGS}
              element={
                <AdminOnly>
                  <AdminSettingsPage />
                </AdminOnly>
              }
            />
          </Route>

          <Route path='/' element={<Navigate to={ROUTE_PATHS.AUTH_LOGIN} replace />} />
          <Route path='*' element={<Navigate to={ROUTE_PATHS.USER} replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

// Touch comment to trigger reload
