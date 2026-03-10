import api from '../configs/api'
import type { LoginPayload, RegisterPayload, ResetPasswordPayload, UpdateUserPayload } from '../models/AuthRequests'

export const loginApi = (payload: LoginPayload) => {
  return api.post('/users/login', payload, { withCredentials: true })
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

export const logoutApi = (refresh_token: string) => {
  return api.post('/users/logout', { refresh_token })
}

// update me
export const updateMeApi = (payload: UpdateUserPayload) => {
  return api.patch('/users/me', payload)
}

// refresh token
export const refreshTokenApi = (refresh_token: string) => {
  return api.post('/users/refresh-token', { refresh_token })
}
