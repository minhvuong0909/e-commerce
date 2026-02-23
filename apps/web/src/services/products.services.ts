import api from '../configs/api'

export const getProductsApi = (params?: Record<string, any>) => {
  return api.get('/products', { params })
}

export const getProductByIdApi = (id: string) => {
  return api.get(`/products/${id}`)
}
