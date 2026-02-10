import { Routes, Route, Navigate, BrowserRouter } from 'react-router-dom'
import AuthLayout from './layouts/AuthLayout'
import LoginPage from './pages/auth/LoginPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'
import ResetPasswordPage from './pages/auth/ResetPasswordPage'
import RegisterPage from './pages/auth/RegisterPage'
import VerifyResultPage from './pages/auth/VerifyResultPage'
import ResendVerifyEmailPage from './pages/auth/ResendVerifyPage'
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Navigate to='/auth/login' replace />} />

        <Route path='/auth' element={<AuthLayout />}>
          <Route index element={<Navigate to='login' replace />} />
          <Route path='login' element={<LoginPage />} />
          <Route path='register' element={<RegisterPage />} />
          <Route path='forgot-password' element={<ForgotPasswordPage />} />
          <Route path='reset-password' element={<ResetPasswordPage />} />
          <Route path='verify-result' element={<VerifyResultPage />} />
          <Route path='resend-verify' element={<ResendVerifyEmailPage />} />
        </Route>

        <Route path='*' element={<Navigate to='/auth/login' replace />} />
      </Routes>
    </BrowserRouter>
  )
}
