import api from '../configs/api'

export const getCategoriesApi = () => {
  return api.get('/category')
}
