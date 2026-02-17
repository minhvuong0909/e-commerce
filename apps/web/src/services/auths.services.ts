import api from '../configs/api'
import type { LoginPayload, RegisterPayload } from '../models/AuthRequests'

export const loginApi = (payload: LoginPayload) => {
  return api.post('/users/login', payload)
}

export const registerApi = (payload: RegisterPayload) => {
  return api.post('/users/register', payload)
}
