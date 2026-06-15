import api from '../configs/api'

export type AdminUser = {
  _id: string
  name: string
  username?: string
  email: string
  avatar?: string
  location?: string
  role: number
  verify_status?: number
  created_at?: string
}

export type UsersListResponse = {
  message: string
  data: AdminUser[]
  pagination: {
    page: number
    limit: number
    totalItems: number
    totalPages: number
  }
}

export const getUsersApi = (page = 1, limit = 10, search?: string) =>
  api.get<UsersListResponse>('/users', {
    params: {
      page,
      limit,
      search: search?.trim() || undefined
    }
  })

export const banUserApi = (userId: string) => api.patch(`/users/${userId}/ban`)

export const unbanUserApi = (userId: string) => api.patch(`/users/${userId}/unban`)
