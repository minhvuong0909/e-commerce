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
