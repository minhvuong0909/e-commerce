import api from '../configs/api'

export const getCartApi = () => {
  return api.get('/carts/me')
}

export const addToCartApi = ({ product_id, quantity }: { product_id: string; quantity: number }) => {
  return api.post('/carts/create', { product_id, quantity })
}

export const updateCartItemApi = (cartItemId: string, quantity: number) => {
  return api.put(`/carts/items/update/${cartItemId}`, { quantity })
}

export const removeCartItemApi = (cartItemId: string) => {
  return api.delete(`/carts/items/delete/${cartItemId}`)
}

export const clearCartApi = () => {
  return api.delete('/carts/clear')
}
