import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { ROUTE_PATHS } from '../routes/route.paths'
import { getApiErrorMessage, isVerifyRequiredError, parseApiError } from '../utils/apiError'

/** Toast + redirect phù hợp khi API báo cần đăng nhập / xác thực. */
export function handleApiAuthFeedback(error: unknown, fallback: string, navigate?: ReturnType<typeof useNavigate>) {
  const parsed = parseApiError(error, fallback)
  const message = getApiErrorMessage(error, fallback)

  if (parsed.kind === 'verify') {
    toast.error(message, {
      duration: 6000,
      action: {
        label: 'Xác thực email',
        onClick: () => (navigate ? navigate(ROUTE_PATHS.AUTH_RESEND_VERIFY) : (window.location.href = ROUTE_PATHS.AUTH_RESEND_VERIFY))
      }
    })
    return parsed
  }

  if (parsed.kind === 'login' || parsed.kind === 'session_expired') {
    toast.error(message)
    return parsed
  }

  if (parsed.kind === 'banned' || parsed.kind === 'forbidden') {
    toast.error(message)
    return parsed
  }

  toast.error(message)
  return parsed
}

export { isVerifyRequiredError }
