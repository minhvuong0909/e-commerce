import { useEffect } from 'react'
import { Routes, Route, Navigate, BrowserRouter, useLocation } from 'react-router-dom'
import { Toaster } from 'sonner'
import AuthLayout from './layouts/AuthLayout'
import LoginPage from './pages/auth/LoginPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'
import ResetPasswordPage from './pages/auth/ResetPasswordPage'
import RegisterPage from './pages/auth/RegisterPage'
import VerifyResultPage from './pages/auth/VerifyResultPage'
import ResendVerifyEmailPage from './pages/auth/ResendVerifyPage'
import ProductDetailPage from './pages/user/ProductDetailPage'
import CartPage from './pages/user/CartPage'
import CheckoutPage from './pages/user/CheckoutPage'
import MyOrdersPage from './pages/user/MyOrdersPage'
import OrderDetailPage from './pages/user/OrderDetailPage'
import OrderResultPage from './pages/user/OrderResultPage'
import UserLayout from './layouts/UserLayout'
import HomePage from './pages/user/HomePage'
import AdminLayout from './layouts/AdminLayout'
import AdminDashboardPage from './pages/admin/AdminDashboardPage'
import AdminProductsPage from './pages/admin/products/AdminProductsPage'
import AdminProductCreatePage from './pages/admin/products/AdminProductCreatePage'
import AdminProductEditPage from './pages/admin/products/AdminProductUpdatePage'
import AdminBrandsPage from './pages/admin/brands/AdminBrandsPage'
import AdminBrandCreatePage from './pages/admin/brands/AdminBrandCreatePage'
import AdminBrandEditPage from './pages/admin/brands/AdminBrandUpdatePage'
import AdminCategoriesPage from './pages/admin/categories/AdminCategoriesPage'
import AdminCategoryCreatePage from './pages/admin/categories/AdminCategoryCreatePage'
import AdminCategoryEditPage from './pages/admin/categories/AdminCategoryUpdatePage'
import AdminOrdersPage from './pages/admin/orders/AdminOrdersPage'
import AdminOrderDetailPage from './pages/admin/orders/AdminOrderDetailPage'
import AdminUsersPage from './pages/admin/users/AdminUsersPage'
import ProfilePage from './pages/user/GetProfile'
import ChangePasswordPage from './pages/user/ChangePasswordPage'
import AuthCallbackPage from './pages/auth/AuthCallBackPage'
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

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AuthBootstrap />
      <AuthNoticeListener />
      <Toaster richColors position='top-right' />
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
            element={
              <RequireAuth>
                <CheckoutPage />
              </RequireAuth>
            }
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
        </Route>

        <Route path='/' element={<Navigate to={ROUTE_PATHS.AUTH_LOGIN} replace />} />
        <Route path='*' element={<Navigate to={ROUTE_PATHS.USER} replace />} />
      </Routes>
    </BrowserRouter>
  )
}

// Touch comment to trigger reload
