import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { ROUTE_PATHS } from '../routes/route.paths'
import { consumeAuthNotice, type AuthNotice } from '../utils/authNotice'

type LocationState = {
  authNotice?: AuthNotice
  from?: string
}

function showAuthNotice(notice: AuthNotice, navigate: ReturnType<typeof useNavigate>) {
  const verifyAction = {
    label: 'Xác thực email',
    onClick: () => navigate(ROUTE_PATHS.AUTH_RESEND_VERIFY)
  }

  switch (notice.kind) {
    case 'verify':
      toast.error(notice.message, { duration: 6000, action: verifyAction })
      break
    case 'banned':
      toast.error(notice.message, { duration: 6000 })
      break
    case 'forbidden':
      toast.error(notice.message)
      break
    case 'session_expired':
      toast.info(notice.message)
      break
    case 'login':
    default:
      toast.info(notice.message)
      break
  }
}

/** Lắng nghe thông báo auth từ redirect hoặc sessionStorage — gắn một lần ở App. */
export function useAuthNotice() {
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const state = location.state as LocationState | null
    const notice = state?.authNotice ?? consumeAuthNotice()
    if (!notice) return

    showAuthNotice(notice, navigate)

    if (state?.authNotice) {
      navigate(location.pathname + location.search, { replace: true, state: {} })
    }
  }, [location.pathname, location.search, location.state, navigate])
}
