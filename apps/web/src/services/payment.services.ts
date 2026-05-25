import api from '../configs/api'

export const getMomoPaymentUrlApi = (orderId: string) => {
  return api.post(`/payment/momo/${orderId}`)
}

export const getPaypalPaymentUrlApi = (orderId: string) => {
  return api.post(`/payment/paypal/create/${orderId}`)
}

export const mockMomoPaymentSuccessApi = (orderId: string) => {
  return api.post(`/payment/momo/mock-success/${orderId}`)
}
