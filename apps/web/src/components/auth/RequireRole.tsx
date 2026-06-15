import { Navigate, useLocation } from 'react-router-dom'
import { ROUTE_PATHS } from '../../routes/route.paths'
import { AUTH_MESSAGES } from '../../utils/authNotice'
import { getRole, getToken, type UserRole } from '../../utils/authSession'

type RequireRoleProps = {
  roles: UserRole[]
  children: React.ReactNode
  fallback?: string
}

export default function RequireRole({ roles, children, fallback = ROUTE_PATHS.USER_HOME }: RequireRoleProps) {
  const location = useLocation()
  const token = getToken()
  const role = getRole()

  if (!token) {
    return (
      <Navigate
        to={ROUTE_PATHS.AUTH_LOGIN}
        replace
        state={{
          from: location.pathname,
          authNotice: { kind: 'login', message: AUTH_MESSAGES.loginRequired }
        }}
      />
    )
  }

  if (role === null || !roles.includes(role)) {
    return (
      <Navigate
        to={fallback}
        replace
        state={{
          authNotice: { kind: 'forbidden', message: AUTH_MESSAGES.forbidden }
        }}
      />
    )
  }

  return children
}
