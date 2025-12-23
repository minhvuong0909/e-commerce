import axios, { AxiosError, type AxiosRequestConfig } from 'axios'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

const api = axios.create({
  baseURL: `${import.meta.env.VITE_BASE_URL_API}`
})
console.log('API URL:', import.meta.env.VITE_BASE_URL_API)
// request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
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

    // kiểm tra token hết hạn
    if (
      error.response?.data?.code === 401 &&
      error.response?.data?.message === 'Expired token!' &&
      !originalRequest._retry
    ) {
      if (isRefreshing) {
        // nếu refresh đang diễn ra, xếp request này vào hàng chờ
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            if (originalRequest.headers) originalRequest.headers['Authorization'] = `Bearer ${token}`
            return api(originalRequest)
          })
          .catch((err) => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const refresh_token = localStorage.getItem('refresh_token')
        if (!refresh_token) throw new Error('No refresh token found')

        // gửi request refresh token
        const res = await axios.post(`${import.meta.env.BASE_URL_API}/users/refresh-token`, {
          token: refresh_token
        })

        const { accessToken, refreshToken: newRefreshToken } = res.data.result.tokens

        // lưu lại token mới
        localStorage.setItem('token', accessToken)
        localStorage.setItem('refresh_token', newRefreshToken)

        // cập nhật header mặc định cho axios
        api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`
        processQueue(null, accessToken)

        // gửi lại request cũ
        if (originalRequest.headers) originalRequest.headers['Authorization'] = `Bearer ${accessToken}`
        return api(originalRequest)

        // nếu có lỗi thì cho đăng nhập lại
      } catch {
        const navigate = useNavigate()
        toast.error('Phiên đã hết hạn, vui lòng đăng nhập lại!')
        navigate('/users/login')
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export default api
