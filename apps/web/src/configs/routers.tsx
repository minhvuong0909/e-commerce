import { createBrowserRouter } from 'react-router-dom'
import { ROUTES } from '../routes/route.paths'
import { HomePage } from '../pages/HomePage'
import { LoginPage } from '../pages/auth/LoginPage'
import { SignUpPage } from '../pages/auth/SignUpPage'
import { ForgotPasswordPage } from '../pages/auth/ForgotPasswordPage'
import { SetNewPasswordPage } from '../pages/auth/SetNewPasswordPage'

export const router = createBrowserRouter([
  // ==== HOME ====
  {
    path: ROUTES.HOME,
    element: <HomePage />
  },

  // ==== LOGIN ====
  {
    path: ROUTES.LOGIN,
    element: <LoginPage />
  },

  // ==== REGISTER ====
  {
    path: ROUTES.REGISTER,
    element: <SignUpPage />
  },

  // ==== FORGOT_PASSWORD ====
  {
    path: ROUTES.FORGET_PASSWORD,
    element: <ForgotPasswordPage />
  },

  // ==== RESET_PASSWORD ====
  {
    path: ROUTES.RESET_PASSWORD,
    element: <SetNewPasswordPage />
  }
])
