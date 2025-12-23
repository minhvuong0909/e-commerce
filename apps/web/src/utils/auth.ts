import type { TokenPairResponse } from '../models/auth/auths.request'
import api from '../configs/api'

// set token vào local storage
export const saveAuth = ({ access_token, refresh_token }: TokenPairResponse) => {
  localStorage.setItem('token', access_token)
  localStorage.setItem('refresh_token', refresh_token)
  api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`
}

// clear token
export const clearAuth = () => {
  localStorage.clear()
  delete api.defaults.headers.common['Authorization']
}
