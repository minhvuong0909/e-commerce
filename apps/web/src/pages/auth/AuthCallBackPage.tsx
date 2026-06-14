// AuthCallbackPage.tsx
import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { supabase } from '../../configs/config'
import { ROUTE_PATHS } from '../../routes/route.paths'
import { loginWithGoogleApi } from '../../services/auths.services'
import { persistAuthSession } from '../../utils/persistAuthSession'
import { getHomePathForRole } from '../../utils/authSession'

export default function AuthCallbackPage() {
  const navigate = useNavigate()
  const handled = useRef(false)

  useEffect(() => {
    if (handled.current) return
    handled.current = true

    const handleCallback = async () => {
      try {
        const code = new URL(window.location.href).searchParams.get('code')

        if (!code) {
          toast.error('Không tìm thấy auth code.')
          navigate(ROUTE_PATHS.AUTH_LOGIN, { replace: true })
          return
        }

        // ✅ Xóa code khỏi URL ngay để tránh dùng lại
        window.history.replaceState({}, '', ROUTE_PATHS.AUTH_CALLBACK)

        const { data, error } = await supabase.auth.exchangeCodeForSession(code)

        if (error || !data.session) {
          toast.error(error?.message || 'Lấy session thất bại.')
          navigate(ROUTE_PATHS.AUTH_LOGIN, { replace: true })
          return
        }

        const res = await loginWithGoogleApi(data.session.access_token)
        const { access_token, refresh_token } = res.data.result.tokens

        const user = await persistAuthSession(access_token, refresh_token)

        toast.success('Đăng nhập Google thành công!')
        navigate(getHomePathForRole(user?.role), { replace: true })
      } catch (err: unknown) {
        const message =
          (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          'Xác thực với server thất bại.'
        toast.error(message)
        navigate(ROUTE_PATHS.AUTH_LOGIN, { replace: true })
      }
    }

    handleCallback()
  }, [navigate])

  return (
    <div className='flex min-h-screen items-center justify-center bg-[var(--page-bg)] text-ink-950'>
      <div className='rounded-3xl border border-slate-200 bg-white px-6 py-5 text-sm font-bold shadow-card'>
        Đang xử lý đăng nhập...
      </div>
    </div>
  )
}
