import api from '../configs/api'

export const getDeliveryMethodsApi = () => {
  return api.get('/delivery-methods')
}
