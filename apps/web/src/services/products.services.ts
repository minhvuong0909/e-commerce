import api from '../configs/api'

export const getProductsApi = (params?: Record<string, any>) => {
  return api.get('/products', { params })
}

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

export const createProductApi = (data: Record<string, any>) => {
  return api.post('/products/create', data)
}
