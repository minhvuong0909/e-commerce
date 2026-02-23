import api from '../configs/api'
import type { LoginPayload, RegisterPayload, ResetPasswordPayload } from '../models/AuthRequests'

export const loginApi = (payload: LoginPayload) => {
  return api.post('/users/login', payload)
}

export const registerApi = (payload: RegisterPayload) => {
  return api.post('/users/register', payload)
}

export const forgotPasswordApi = (email: string) => {
  return api.post('/users/forgot-password', { email })
}

export const resetPasswordApi = (payload: ResetPasswordPayload) => {
  return api.post('/users/reset-password', payload)
}

export const getMeApi = () => {
  return api.post('/users/me')
}
