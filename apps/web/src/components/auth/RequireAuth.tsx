import { Navigate, useLocation } from 'react-router-dom'
import { ROUTE_PATHS } from '../../routes/route.paths'
import { AUTH_MESSAGES } from '../../utils/authNotice'
import { getToken } from '../../utils/authSession'

type RequireAuthProps = {
  children: React.ReactNode
}

export default function RequireAuth({ children }: RequireAuthProps) {
  const location = useLocation()
  const token = getToken()

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

  return children
}
