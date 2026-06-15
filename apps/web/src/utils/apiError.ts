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

  if (raw) return { kind: 'generic', message: raw, status }

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
