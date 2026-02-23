import api from '../configs/api'

export const createOrderApi = (data: Record<string, any>) => {
  return api.post('/orders/create', data)
}

export const getMyOrdersApi = () => {
  return api.get('/orders/me')
}
