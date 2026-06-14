import { getMeApi } from '../services/auths.services'
import { normalizeRole, setAuthTokens, setUserRole } from './authSession'

export async function persistAuthSession(accessToken: string, refreshToken: string) {
  setAuthTokens(accessToken, refreshToken)
  const res = await getMeApi()
  const role = normalizeRole(res.data.result?.role)
  if (role !== null) {
    setUserRole(role)
  }
  return res.data.result
}
