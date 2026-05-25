import { Routes, Route, Navigate, BrowserRouter } from 'react-router-dom'
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
import ProfilePage from './pages/user/GetProfile'
import AuthCallbackPage from './pages/auth/AuthCallBackPage'
import { ROUTE_PATHS, ROUTE_SEGMENTS } from './routes/route.paths'

export default function App() {
  return (
    <BrowserRouter>
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
          <Route path={ROUTE_SEGMENTS.USER_CART} element={<CartPage />} />
          <Route path={ROUTE_SEGMENTS.USER_CHECKOUT} element={<CheckoutPage />} />
          <Route path={ROUTE_SEGMENTS.USER_ORDERS} element={<MyOrdersPage />} />
          <Route path={`${ROUTE_SEGMENTS.USER_ORDERS}/${ROUTE_SEGMENTS.ID}`} element={<OrderDetailPage />} />
          <Route path={ROUTE_SEGMENTS.USER_ORDER_RESULT} element={<OrderResultPage />} />
          <Route path={ROUTE_SEGMENTS.USER_PROFILE} element={<ProfilePage />} />
        </Route>

        {/* ================= ADMIN ================= */}
        <Route path={ROUTE_PATHS.ADMIN} element={<AdminLayout />}>
          <Route index element={<AdminDashboardPage />} />

          {/* products */}
          <Route path={ROUTE_SEGMENTS.ADMIN_PRODUCTS} element={<AdminProductsPage />} />
          <Route
            path={`${ROUTE_SEGMENTS.ADMIN_PRODUCTS}/${ROUTE_SEGMENTS.CREATE}`}
            element={<AdminProductCreatePage />}
          />
          <Route
            path={`${ROUTE_SEGMENTS.ADMIN_PRODUCTS}/${ROUTE_SEGMENTS.ID}/${ROUTE_SEGMENTS.EDIT}`}
            element={<AdminProductEditPage />}
          />

          {/* brands */}
          <Route path={ROUTE_SEGMENTS.ADMIN_BRANDS} element={<AdminBrandsPage />} />
          <Route path={`${ROUTE_SEGMENTS.ADMIN_BRANDS}/${ROUTE_SEGMENTS.CREATE}`} element={<AdminBrandCreatePage />} />
          <Route
            path={`${ROUTE_SEGMENTS.ADMIN_BRANDS}/${ROUTE_SEGMENTS.ID}/${ROUTE_SEGMENTS.EDIT}`}
            element={<AdminBrandEditPage />}
          />

          {/* categories */}
          <Route path={ROUTE_SEGMENTS.ADMIN_CATEGORIES} element={<AdminCategoriesPage />} />
          <Route
            path={`${ROUTE_SEGMENTS.ADMIN_CATEGORIES}/${ROUTE_SEGMENTS.CREATE}`}
            element={<AdminCategoryCreatePage />}
          />
          <Route
            path={`${ROUTE_SEGMENTS.ADMIN_CATEGORIES}/${ROUTE_SEGMENTS.ID}/${ROUTE_SEGMENTS.EDIT}`}
            element={<AdminCategoryEditPage />}
          />

          {/* orders */}
          <Route path={ROUTE_SEGMENTS.ADMIN_ORDERS} element={<AdminOrdersPage />} />
          <Route path={`${ROUTE_SEGMENTS.ADMIN_ORDERS}/${ROUTE_SEGMENTS.ID}`} element={<AdminOrderDetailPage />} />
        </Route>

        <Route path='/' element={<Navigate to={ROUTE_PATHS.AUTH_LOGIN} replace />} />
        <Route path='*' element={<Navigate to={ROUTE_PATHS.USER} replace />} />
      </Routes>
    </BrowserRouter>
  )
}
