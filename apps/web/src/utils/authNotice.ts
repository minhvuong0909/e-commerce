export type AuthNoticeKind = 'login' | 'verify' | 'forbidden' | 'banned' | 'session_expired'

export type AuthNotice = {
  kind: AuthNoticeKind
  message: string
}

const STORAGE_KEY = 'auth_notice'

export function setAuthNotice(notice: AuthNotice) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(notice))
}

export function consumeAuthNotice(): AuthNotice | null {
  const raw = sessionStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  sessionStorage.removeItem(STORAGE_KEY)
  try {
    return JSON.parse(raw) as AuthNotice
  } catch {
    return null
  }
}

export const AUTH_MESSAGES = {
  loginRequired: 'Vui lòng đăng nhập để tiếp tục.',
  verifyRequired: 'Vui lòng xác thực email để sử dụng tính năng này.',
  sessionExpired: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
  forbidden: 'Bạn không có quyền truy cập trang này.',
  banned: 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ hỗ trợ.'
} as const
