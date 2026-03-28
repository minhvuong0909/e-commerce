import api from '../configs/api'

export const createOrderApi = (data: Record<string, any>) => {
  return api.post('/orders/create', data)
}

export const getMyOrdersApi = () => {
  return api.get('/orders/me/my-orders')
}

export const getOrderByIdApi = (id: string) => {
  return api.get(`/orders/${id}`)
}

export const getAllOrdersApi = (limit: number, page: number) => {
  return api.get('/orders/all/all-orders', {
    params: {
      limit,
      page
    }
  })
}
