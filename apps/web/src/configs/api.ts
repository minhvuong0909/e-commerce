import axios, { AxiosError, type AxiosRequestConfig } from 'axios'
import { ROUTE_PATHS } from '../routes/route.paths'
import { refreshTokenApi } from '../services/auths.services'

const ACCESS_TOKEN_KEY = 'access_token'
const REFRESH_TOKEN_KEY = 'refresh_token'

const api = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL_API,
  withCredentials: true
})

type RetryRequestConfig = AxiosRequestConfig & {
  _retry?: boolean
}

type RefreshQueueItem = {
  resolve: (token: string) => void
  reject: (error: unknown) => void
}

let isRefreshing = false
let failedQueue: RefreshQueueItem[] = []

const clearAuthAndRedirect = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
  window.location.href = ROUTE_PATHS.AUTH_LOGIN
}

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error)
      return
    }

    resolve(token as string)
  })
  failedQueue = []
}

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<any>) => {
    const originalRequest = error.config as RetryRequestConfig
    const isRefreshRequest = originalRequest.url?.includes('/users/refresh-token')

    if (error.response?.status === 401 && isRefreshRequest) {
      clearAuthAndRedirect()
      return Promise.reject(error)
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then((token) => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`
          }
          return api(originalRequest)
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY)
        if (!refreshToken) {
          throw new Error('No refresh token available')
        }

        const res = await refreshTokenApi(refreshToken)
        const accessToken = res.data.result.tokens.access_token
        const newRefreshToken = res.data.result.tokens.refresh_token

        localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
        localStorage.setItem(REFRESH_TOKEN_KEY, newRefreshToken)
        processQueue(null, accessToken)

        return api(originalRequest)
      } catch (err) {
        processQueue(err, null)
        clearAuthAndRedirect()
        return Promise.reject(err)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export default api
