import { ROUTE_PATHS } from '../routes/route.paths'

const ACCESS_TOKEN_KEY = 'access_token'
const REFRESH_TOKEN_KEY = 'refresh_token'
const USER_ROLE_KEY = 'user_role'

export const USER_ROLE = {
  Admin: 0,
  Staff: 1,
  User: 2
} as const

export type UserRole = (typeof USER_ROLE)[keyof typeof USER_ROLE]

export function normalizeRole(role: unknown): UserRole | null {
  if (role === null || role === undefined || role === '') return null
  const value = Number(role)
  if (value === USER_ROLE.Admin || value === USER_ROLE.Staff || value === USER_ROLE.User) {
    return value as UserRole
  }
  return null
}

export function getHomePathForRole(role: unknown) {
  const normalized = normalizeRole(role)
  if (normalized === USER_ROLE.Admin || normalized === USER_ROLE.Staff) {
    return ROUTE_PATHS.ADMIN
  }
  return ROUTE_PATHS.USER_HOME
}

export function getToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN_KEY)
}

export function getRole(): UserRole | null {
  return normalizeRole(localStorage.getItem(USER_ROLE_KEY))
}

export function setAuthTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
}

export function setUserRole(role: number) {
  localStorage.setItem(USER_ROLE_KEY, String(role))
}

export function clearAuth() {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
  localStorage.removeItem(USER_ROLE_KEY)
}
