import { Navigate } from 'react-router-dom'
import { ROUTE_PATHS } from '../../routes/route.paths'
import { getRole, getToken, type UserRole } from '../../utils/authSession'

type RequireRoleProps = {
  roles: UserRole[]
  children: React.ReactNode
  fallback?: string
}

export default function RequireRole({ roles, children, fallback = ROUTE_PATHS.USER_HOME }: RequireRoleProps) {
  const token = getToken()
  const role = getRole()

  if (!token) {
    return <Navigate to={ROUTE_PATHS.AUTH_LOGIN} replace />
  }

  if (role === null || !roles.includes(role)) {
    return <Navigate to={fallback} replace />
  }

  return children
}
