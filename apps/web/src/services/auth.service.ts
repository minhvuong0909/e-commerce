import api from '../configs/api'
import type {
  ForgotPasswordPayload,
  LoginPayload,
  RegisterPayload,
  ResetPasswordPayload
} from '../models/auth/auths.request'

export const login = (data: LoginPayload) => {
  return api.post('/users/login', data)
}

export const register = (payload: RegisterPayload) => {
  return api.post('/users/register', payload)
}

export const refreshToken = (refreshToken: string) => {
  return api.post('/users/refresh-token', refreshToken)
}

export const logout = (refreshToken: string) => {
  return api.post('/users/logout', refreshToken)
}

export const forgotPassword = (email: ForgotPasswordPayload) => {
  return api.post('/users/forgot-password', email)
}

export const resetPassword = (payload: ResetPasswordPayload) => {
  return api.post('/users/reset-password', payload)
}
