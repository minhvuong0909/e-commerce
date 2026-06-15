import api from '../configs/api'
import type { CreateProductRequest } from '../models/ProductRequests'

export const getProductByIdApi = (id: string) => {
  return api.get(`/products/${id}`)
}

export interface ProductFilters {
  search?: string
  sort?: 'newest' | 'price_asc' | 'price_desc' | 'best_selling'
  category_id?: string
  brand_id?: string
  minPrice?: number
  maxPrice?: number
  status?: number
}

export const getAllProductsApi = (limit: number, page: number, filters: ProductFilters = {}) => {
  const params: Record<string, string | number> = { limit, page }
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== '') params[key] = value as string | number
  }
  return api.get('/products', { params })
}

export const createProductApi = (data: CreateProductRequest) => {
  return api.post('/products/create', data)
}

export const updateProductApi = (id: string, data: Record<string, unknown>) => {
  return api.patch(`/products/update/${id}`, data)
}

export const deleteProductApi = (id: string) => {
  return api.delete(`/products/delete/${id}`)
}
