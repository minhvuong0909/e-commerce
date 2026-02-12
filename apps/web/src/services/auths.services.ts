import api from '../configs/api'
import type { LoginPayload } from '../models/AuthRequests'

export const loginApi = (payload: LoginPayload) => {
  return api.post('/users/login', payload)
}
