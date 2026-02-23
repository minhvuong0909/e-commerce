import api from '../configs/api'

export const getCartApi = () => {
  return api.get('/carts/me')
}
