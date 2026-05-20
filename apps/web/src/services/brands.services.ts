import api from '../configs/api'

export const getBrandsApi = () => {
  return api.get('/brand')
}
