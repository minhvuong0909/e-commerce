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
import AdminMediaPage from './pages/admin/medias/AdminMediaPage'
import ProfilePage from './pages/user/GetProfile'
import AuthCallbackPage from './pages/auth/AuthCallBackPage'
export default function App() {
  return (
    <BrowserRouter>
      <Toaster richColors position='top-right' />
      <Routes>
        {/* <Route path='/' element={<Navigate to='/user/home' replace />} /> */}
        <Route path='/auth/callback' element={<AuthCallbackPage />} />
        {/* auth layouts */}
        <Route path='/auth' element={<AuthLayout />}>
          <Route element={<Navigate to='login' replace />} />
          <Route path='login' element={<LoginPage />} />
          {/* <Route path='callback' element={<AuthCallbackPage />} /> */}
          <Route path='register' element={<RegisterPage />} />
          <Route path='forgot-password' element={<ForgotPasswordPage />} />
          <Route path='reset-password' element={<ResetPasswordPage />} />
          <Route path='verify-result' element={<VerifyResultPage />} />
          <Route path='resend-verify' element={<ResendVerifyEmailPage />} />
        </Route>

        {/* ================= USER ================= */}
        <Route path='/user' element={<UserLayout />}>
          <Route index element={<HomePage />} />
          <Route path='products/:id' element={<ProductDetailPage />} />
          <Route path='cart' element={<CartPage />} />
          <Route path='checkout' element={<CheckoutPage />} />
          <Route path='orders' element={<MyOrdersPage />} />
          <Route path='orders/:id' element={<OrderDetailPage />} />
          <Route path='me' element={<ProfilePage />} />
        </Route>

        <Route path='*' element={<Navigate to='/user' replace />} />
        {/* <Route path='*' element={<Navigate to='/auth/login' replace />} /> */}
        {/* ================= ADMIN ================= */}
        <Route path='/admin' element={<AdminLayout />}>
          <Route index element={<AdminDashboardPage />} />

          {/* products */}
          <Route path='products' element={<AdminProductsPage />} />
          <Route path='products/create' element={<AdminProductCreatePage />} />
          <Route path='products/:id/edit' element={<AdminProductEditPage />} />

          {/* brands */}
          <Route path='brands' element={<AdminBrandsPage />} />
          <Route path='brands/create' element={<AdminBrandCreatePage />} />
          <Route path='brands/:id/edit' element={<AdminBrandEditPage />} />

          {/* categories */}
          <Route path='categories' element={<AdminCategoriesPage />} />
          <Route path='categories/create' element={<AdminCategoryCreatePage />} />
          <Route path='categories/:id/edit' element={<AdminCategoryEditPage />} />

          {/* orders */}
          <Route path='orders' element={<AdminOrdersPage />} />
          <Route path='orders/:id' element={<AdminOrderDetailPage />} />

          {/* media */}
          <Route path='media' element={<AdminMediaPage />} />
        </Route>

        <Route path='/' element={<Navigate to='/auth/login' replace />} />
      </Routes>
    </BrowserRouter>
  )
}
