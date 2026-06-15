import api from '../configs/api'
import type { PaginationMeta } from '../models/Pagination'

export type Category = {
  _id?: string
  name: string
  desc: string
}

export type CategoryPayload = {
  name: string
  desc: string
}

export type CategoriesListResponse = {
  data: Category[]
  pagination?: PaginationMeta
}

export const getCategoriesApi = (page = 1, limit = 10, search?: string) => {
  const params: Record<string, string | number> = { page, limit }
  if (search?.trim()) params.search = search.trim()
  return api.get<CategoriesListResponse>('/category', { params })
}

export const getCategoryByIdApi = (id: string) => api.get<{ result: Category }>(`/category/${id}`)

export const createCategoryApi = (data: CategoryPayload) => api.post('/category/create', data)

export const updateCategoryApi = (id: string, data: CategoryPayload) => api.patch(`/category/update/${id}`, data)

export const deleteCategoryApi = (id: string) => api.delete(`/category/delete/${id}`)
