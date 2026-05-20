import api from '../configs/api'
import type { CreateProductRequest } from '../models/ProductRequests'

export const getProductByIdApi = (id: string) => {
  return api.get(`/products/${id}`)
}

export const getAllProductsApi = (limit: number, page: number) => {
  return api.get('/products', {
    params: {
      limit,
      page
    }
  })
}

export const createProductApi = (data: CreateProductRequest) => {
  return api.post('/products/create', data)
}

export const updateProductApi = (id: string, data: Record<string, any>) => {
  return api.put(`/products/update/${id}`, data)
}

export const deleteProductApi = (id: string) => {
  return api.delete(`/products/delete/${id}`)
}
