import { AUTH_MESSAGES, type AuthNoticeKind } from './authNotice'

export type ApiErrorKind = AuthNoticeKind | 'generic'

export type ParsedApiError = {
  kind: ApiErrorKind
  message: string
  status?: number
}

type AxiosLikeError = {
  response?: {
    status?: number
    data?: { message?: unknown }
  }
}

function getRawMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'response' in error) {
    const message = (error as AxiosLikeError).response?.data?.message
    if (typeof message === 'string') return message.trim()
  }
  if (error instanceof Error && error.message.trim()) return error.message.trim()
  return ''
}

function getFriendlyBackendErrorMessage(raw: string): string | null {
  const lower = raw.toLowerCase()
  if (lower.includes('email already exists')) {
    return 'Email này đã được đăng ký sử dụng.'
  }
  if (lower.includes('username already exists')) {
    return 'Tên người dùng đã được đăng ký sử dụng.'
  }
  if (lower.includes('insufficient product stock')) {
    return 'Số lượng sản phẩm trong kho không đủ để đáp ứng yêu cầu.'
  }
  if (lower.includes('product not found')) {
    return 'Không tìm thấy sản phẩm.'
  }
  if (lower.includes('payment has already been completed')) {
    return 'Thanh toán này đã được hoàn tất trước đó.'
  }
  if (lower.includes('out of delivery zone') || lower.includes('within 25 km')) {
    return 'Chúng tôi chỉ giao hàng trong bán kính 25 km từ cửa hàng.'
  }
  if (lower.includes('address not found') || lower.includes('locate this address')) {
    return 'Không thể định vị địa chỉ này. Vui lòng chọn vị trí trên bản đồ.'
  }
  if (lower.includes('cannot change order to this status')) {
    return 'Không thể thay đổi trạng thái đơn hàng ở thời điểm này.'
  }
  if (lower.includes('order not found')) {
    return 'Không tìm thấy thông tin đơn hàng.'
  }
  if (lower.includes('invalid momo webhook signature') || lower.includes('invalid signature')) {
    return 'Xác thực chữ ký giao dịch thất bại.'
  }
  if (lower.includes('order not refundable')) {
    return 'Đơn hàng này không đủ điều kiện để hoàn tiền.'
  }
  return null
}

function includesAny(text: string, needles: string[]) {
  const lower = text.toLowerCase()
  return needles.some((needle) => lower.includes(needle.toLowerCase()))
}

/** Phân loại lỗi API — ưu tiên message backend, fallback tiếng Việt thân thiện. */
export function parseApiError(error: unknown, fallback = 'Đã xảy ra lỗi. Vui lòng thử lại.'): ParsedApiError {
  const status = (error as AxiosLikeError)?.response?.status
  const raw = getRawMessage(error)

  if (includesAny(raw, ['banned', 'has been banned', 'bị khóa'])) {
    return { kind: 'banned', message: AUTH_MESSAGES.banned, status }
  }

  if (
    includesAny(raw, [
      'unverified',
      'email has been unverified',
      'user not verified',
      'xác thực email',
      'verify email'
    ])
  ) {
    return { kind: 'verify', message: AUTH_MESSAGES.verifyRequired, status }
  }

  if (status === 403 || includesAny(raw, ['permission denied', 'not admin', 'users is not admin'])) {
    return { kind: 'forbidden', message: AUTH_MESSAGES.forbidden, status }
  }

  if (
    status === 401 &&
    includesAny(raw, [
      'access_token is required',
      'jwt expired',
      'invalid token',
      'invalid signature',
      'refresh_token is invalid',
      'email or password is incorrect'
    ])
  ) {
    if (includesAny(raw, ['email or password'])) {
      return { kind: 'generic', message: 'Email hoặc mật khẩu không đúng.', status }
    }
    return { kind: 'login', message: AUTH_MESSAGES.sessionExpired, status }
  }

  if (status === 401) {
    return { kind: 'login', message: AUTH_MESSAGES.loginRequired, status }
  }

  if (raw) {
    const friendlyMessage = getFriendlyBackendErrorMessage(raw)
    return { kind: 'generic', message: friendlyMessage || fallback, status }
  }

  return { kind: 'generic', message: fallback, status }
}

/** Lấy message hiển thị — dùng parseApiError để map auth/verify/forbidden. */
export function getApiErrorMessage(error: unknown, fallback: string): string {
  return parseApiError(error, fallback).message
}

export function isVerifyRequiredError(error: unknown): boolean {
  return parseApiError(error).kind === 'verify'
}

export function isLoginRequiredError(error: unknown): boolean {
  const kind = parseApiError(error).kind
  return kind === 'login' || kind === 'session_expired'
}
