/** Lấy message lỗi từ response của axios một cách an toàn, không dùng `any`. */
export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === 'object' && 'response' in error) {
    const response = (error as { response?: { data?: { message?: unknown } } }).response
    const message = response?.data?.message
    if (typeof message === 'string' && message.trim()) return message
  }
  return fallback
}
