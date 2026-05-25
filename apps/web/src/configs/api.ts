import axios, { AxiosError, type AxiosRequestConfig } from 'axios'
import { refreshTokenApi } from '../services/auths.services'

const api = axios.create({
  baseURL: `${import.meta.env.VITE_BASE_URL_API}`,
  withCredentials: true
})
console.log('API URL:', import.meta.env.VITE_BASE_URL_API)
// request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)
// xử lý refresh token chỉ cần gửi lên 1 request refresh token
let isRefreshing = false
let failedQueue: any[] = []
const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error)
    else prom.resolve(token)
  })
  failedQueue = []
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<any>) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then((token) => {
          if (originalRequest.headers) originalRequest.headers['Authorization'] = `Bearer ${token}`
          return api(originalRequest)
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const refresh_token = localStorage.getItem('refresh_token')
        if (!refresh_token) {
          throw new Error('No refresh token available')
        }
        const res = await refreshTokenApi(refresh_token)

        const accessToken = res.data.result.tokens.access_token
        const newRefreshToken = res.data.result.tokens.refresh_token

        // lưu access token và refresh token mới
        localStorage.setItem('access_token', accessToken)
        localStorage.setItem('refresh_token', newRefreshToken)

        processQueue(null, accessToken)

        return api(originalRequest)
      } catch (err) {
        processQueue(err, null)
        localStorage.removeItem('access_token')
        window.location.href = '/auth/login'
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)



export default api
