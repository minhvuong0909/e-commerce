import api from '../configs/api'

export const getCartApi = () => {
  return api.get('/carts/me')
}

export const addToCartApi = ({ product_id, quantity }: { product_id: string; quantity: number }) => {
  return api.post('/carts/create', { product_id, quantity })
}
