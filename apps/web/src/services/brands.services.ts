import api from '../configs/api'
import type { Brand } from '../models/BrandRequests'
import type { PaginationMeta } from '../models/Pagination'

export type BrandPayload = {
  name: string
  hotline: string
  address: string
  desc: string
}

export type BrandsListResponse = {
  data: Brand[]
  pagination?: PaginationMeta
}

export const getBrandsApi = (page = 1, limit = 10, search?: string) => {
  const params: Record<string, string | number> = { page, limit }
  if (search?.trim()) params.search = search.trim()
  return api.get<BrandsListResponse>('/brand', { params })
}

export const getBrandByIdApi = (id: string) => api.get<{ result: Brand }>(`/brand/${id}`)

export const createBrandApi = (data: BrandPayload) => api.post('/brand/create', data)

export const updateBrandApi = (id: string, data: BrandPayload) => api.patch(`/brand/update/${id}`, data)

export const deleteBrandApi = (id: string) => api.delete(`/brand/delete/${id}`)
