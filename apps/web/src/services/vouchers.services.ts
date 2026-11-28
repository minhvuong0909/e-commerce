import api from '../configs/api'

export type VoucherValidationResult = {
  discount: number
  final_subtotal: number
  voucher: {
    _id: string
    code: string
    discount_type: 'percent' | 'fixed'
    discount_value: number
  }
}

export const validateVoucherApi = (code: string, subtotal: number) =>
  api.post<{ result: VoucherValidationResult }>('/vouchers/validate', { code, subtotal })

export type Voucher = {
  _id: string
  code: string
  discount_type: 'percent' | 'fixed'
  discount_value: number
  max_discount_value: number | null
  min_order_value: number
  usage_limit: number
  used_count: number
  starts_at?: string | null
  ends_at?: string | null
  active: boolean
  created_at: string
  updated_at: string
}

export type VoucherPayload = {
  code: string
  discount_type: 'percent' | 'fixed'
  discount_value: number
  max_discount_value: number | null
  min_order_value: number
  usage_limit: number
  starts_at: string | null
  ends_at: string | null
  active: boolean
}

/** [Admin] */
export const getVouchersApi = () => api.get<{ result: Voucher[] }>('/vouchers')
export const createVoucherApi = (data: VoucherPayload) => api.post<{ result: Voucher }>('/vouchers', data)
export const updateVoucherApi = (id: string, data: Partial<VoucherPayload>) => api.patch<{ result: Voucher }>(`/vouchers/${id}`, data)
export const deleteVoucherApi = (id: string) => api.delete(`/vouchers/${id}`)
