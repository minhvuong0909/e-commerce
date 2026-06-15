import axios, { AxiosError, type AxiosRequestConfig } from 'axios'
import { toast } from 'sonner'
import { ROUTE_PATHS } from '../routes/route.paths'
import { refreshTokenApi } from '../services/auths.services'
import { parseApiError } from '../utils/apiError'
import { AUTH_MESSAGES, setAuthNotice } from '../utils/authNotice'
import { clearAuth, getRefreshToken, getToken, setAuthTokens } from '../utils/authSession'

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

const clearAuthAndRedirect = (message = AUTH_MESSAGES.sessionExpired) => {
  setAuthNotice({ kind: 'session_expired', message })
  clearAuth()
  window.location.href = ROUTE_PATHS.AUTH_LOGIN
}

const skipTokenRefresh = (error: AxiosError<{ message?: string }>) => {
  const kind = parseApiError(error).kind
  return kind === 'verify' || kind === 'banned'
}

const notifyNonRefreshAuthError = (error: AxiosError<{ message?: string }>) => {
  const parsed = parseApiError(error)
  if (parsed.kind === 'verify') {
    toast.error(parsed.message, {
      duration: 6000,
      action: {
        label: 'Xác thực email',
        onClick: () => {
          window.location.href = ROUTE_PATHS.AUTH_RESEND_VERIFY
        }
      }
    })
    return
  }
  if (parsed.kind === 'banned' || parsed.kind === 'forbidden') {
    toast.error(parsed.message)
  }
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
    const token = getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<{ message?: string }>) => {
    const originalRequest = error.config as RetryRequestConfig
    const isRefreshRequest = originalRequest.url?.includes('/users/refresh-token')

    if (error.response?.status === 401 && isRefreshRequest) {
      clearAuthAndRedirect()
      return Promise.reject(error)
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (skipTokenRefresh(error)) {
        notifyNonRefreshAuthError(error)
        return Promise.reject(error)
      }

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
        const refreshToken = getRefreshToken()
        if (!refreshToken) {
          throw new Error('No refresh token available')
        }

        const res = await refreshTokenApi(refreshToken)
        const accessToken = res.data.result.tokens.access_token
        const newRefreshToken = res.data.result.tokens.refresh_token

        setAuthTokens(accessToken, newRefreshToken)
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

    if (error.response?.status === 403) {
      toast.error(parseApiError(error).message)
    }

    return Promise.reject(error)
  }
)

export default api
