import { Navigate, useLocation } from 'react-router-dom'
import { ROUTE_PATHS } from '../../routes/route.paths'
import { getToken } from '../../utils/authSession'

type RequireAuthProps = {
  children: React.ReactNode
}

export default function RequireAuth({ children }: RequireAuthProps) {
  const location = useLocation()
  const token = getToken()

  if (!token) {
    return <Navigate to={ROUTE_PATHS.AUTH_LOGIN} state={{ from: location.pathname }} replace />
  }

  return children
}
