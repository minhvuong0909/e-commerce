export interface PasswordStrengthResult {
  /** 0 = trống, 1 = yếu … 4 = mạnh */
  score: 0 | 1 | 2 | 3 | 4
  label: string
}

/** Tính độ mạnh mật khẩu dựa trên độ dài và sự đa dạng ký tự. Hàm thuần, dễ test. */
export function evaluatePasswordStrength(password: string): PasswordStrengthResult {
  if (!password) return { score: 0, label: 'Chưa nhập' }

  let points = 0
  if (password.length >= 8) points++
  if (password.length >= 12) points++
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) points++
  if (/\d/.test(password)) points++
  if (/[^A-Za-z0-9]/.test(password)) points++

  const score = Math.min(4, points) as PasswordStrengthResult['score']
  const labels = ['Rất yếu', 'Yếu', 'Trung bình', 'Khá', 'Mạnh'] as const
  return { score: score === 0 ? 1 : score, label: labels[score] }
}
