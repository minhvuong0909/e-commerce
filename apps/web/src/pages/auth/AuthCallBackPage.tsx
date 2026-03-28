// AuthCallbackPage.tsx
import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { supabase } from '../../configs/config'
import { loginWithGoogleApi } from '../../services/auths.services'

export default function AuthCallbackPage() {
  const navigate = useNavigate()
  const handled = useRef(false)

  useEffect(() => {
    if (handled.current) return
    handled.current = true

    const handleCallback = async () => {
      try {
        console.log('1. URL:', window.location.href)

        const code = new URL(window.location.href).searchParams.get('code')
        console.log('2. code:', code)

        if (!code) {
          toast.error('Không tìm thấy auth code.')
          navigate('/auth/login', { replace: true })
          return
        }

        // ✅ Xóa code khỏi URL ngay để tránh dùng lại
        window.history.replaceState({}, '', '/auth/callback')

        const { data, error } = await supabase.auth.exchangeCodeForSession(code)
        console.log('3. session:', data?.session)
        console.log('3. error:', error)

        if (error || !data.session) {
          toast.error(error?.message || 'Lấy session thất bại.')
          navigate('/auth/login', { replace: true })
          return
        }

        const res = await loginWithGoogleApi(data.session.access_token)
        const { access_token, refresh_token } = res.data.result.tokens

        localStorage.setItem('access_token', access_token)
        localStorage.setItem('refresh_token', refresh_token)

        toast.success('Đăng nhập Google thành công!')
        navigate('/user/home', { replace: true })
      } catch (err) {
        console.log('CATCH:', err)
        toast.error('Xác thực với server thất bại.')
        navigate('/auth/login', { replace: true })
      }
    }

    handleCallback()
  }, [navigate])

  return <div className='flex min-h-screen items-center justify-center text-white'>Đang xử lý đăng nhập...</div>
}
