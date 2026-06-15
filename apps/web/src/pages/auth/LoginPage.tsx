import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Lock, Mail, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'
import Alert from '../../components/ui/Alert'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import { supabase } from '../../configs/config'
import { ROUTE_PATHS } from '../../routes/route.paths'
import { loginApi, getMeApi } from '../../services/auths.services'
import { getApiErrorMessage } from '../../utils/apiError'
import { getHomePathForRole, getRole, getToken, normalizeRole, setUserRole } from '../../utils/authSession'
import { persistAuthSession } from '../../utils/persistAuthSession'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const REMEMBER_KEY = 'remembered_email'

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const redirectFrom = (location.state as { from?: string } | null)?.from
  const [googleLoading, setGoogleLoading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [forms, setForms] = useState(() => ({ email: localStorage.getItem(REMEMBER_KEY) || '', password: '' }))
  const [remember, setRemember] = useState(() => Boolean(localStorage.getItem(REMEMBER_KEY)))
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
  const [formError, setFormError] = useState('')

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForms((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: undefined }))
    setFormError('')
  }

  useEffect(() => {
    const token = getToken()
    if (!token) return

    const role = getRole()
    if (role !== null) {
      navigate(getHomePathForRole(role), { replace: true })
      return
    }

    getMeApi()
      .then((res) => {
        const nextRole = normalizeRole(res.data.result?.role)
        if (nextRole !== null) setUserRole(nextRole)
        navigate(getHomePathForRole(nextRole), { replace: true })
      })
      .catch(() => {})
  }, [navigate])

  const validate = () => {
    const next: { email?: string; password?: string } = {}
    if (!forms.email.trim()) next.email = 'Vui lòng nhập email'
    else if (!EMAIL_REGEX.test(forms.email.trim())) next.email = 'Email không hợp lệ'
    if (!forms.password) next.password = 'Vui lòng nhập mật khẩu'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setFormError('')
    if (!validate()) return

    try {
      setLoading(true)
      const res = await loginApi({ email: forms.email.trim(), password: forms.password })
      const user = await persistAuthSession(
        res.data.result.tokens.access_token,
        res.data.result.tokens.refresh_token
      )
      if (remember) localStorage.setItem(REMEMBER_KEY, forms.email.trim())
      else localStorage.removeItem(REMEMBER_KEY)
      toast.success('Đăng nhập thành công!')
      const target = redirectFrom && redirectFrom.startsWith('/user') ? redirectFrom : getHomePathForRole(user?.role)
      navigate(target)
    } catch (err) {
      setFormError(getApiErrorMessage(err, 'Email hoặc mật khẩu không đúng. Vui lòng thử lại.'))
    } finally {
      setLoading(false)
    }
  }

  const handleLoginGoogle = async () => {
    if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
      toast.error('Thiếu cấu hình Supabase. Kiểm tra file apps/web/.env')
      return
    }

    try {
      setGoogleLoading(true)
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}${ROUTE_PATHS.AUTH_CALLBACK}`
        }
      })
      if (error) {
        toast.error(error.message)
        setGoogleLoading(false)
        return
      }
      if (data?.url) {
        window.location.assign(data.url)
        return
      }
      toast.error('Không lấy được link đăng nhập Google. Kiểm tra Supabase Dashboard.')
      setGoogleLoading(false)
    } catch {
      toast.error('Không thể đăng nhập với Google.')
      setGoogleLoading(false)
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <div className='mb-6'>
        <div className='mb-4 inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-xs font-black text-brand-700'>
          <ShieldCheck size={14} />
          Bảo mật tài khoản
        </div>
        <h2 className='text-2xl font-black tracking-tight text-ink-950'>Đăng nhập</h2>
        <p className='mt-2 text-sm leading-6 text-slate-500'>Chào mừng bạn quay lại. Đăng nhập để tiếp tục mua sắm.</p>
        {redirectFrom ? (
          <p className='mt-2 rounded-lg border border-amber-200/80 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-900'>
            Bạn cần đăng nhập để mở trang yêu cầu.
          </p>
        ) : null}
      </div>

      {formError ? (
        <div className='mb-4'>
          <Alert variant='error' title='Đăng nhập thất bại' desc={formError} />
        </div>
      ) : null}

      <form className='space-y-4' onSubmit={handleSubmit} noValidate>
        <Input
          label='Email'
          name='email'
          type='email'
          autoComplete='email'
          placeholder='example@email.com'
          value={forms.email}
          onChange={handleChange}
          error={errors.email}
          leftIcon={<Mail size={17} />}
        />
        <Input
          label='Mật khẩu'
          name='password'
          type='password'
          autoComplete='current-password'
          placeholder='Nhập mật khẩu của bạn'
          value={forms.password}
          onChange={handleChange}
          error={errors.password}
          leftIcon={<Lock size={17} />}
        />

        <div className='flex items-center justify-between gap-4'>
          <label className='flex cursor-pointer items-center gap-2 text-sm font-semibold text-slate-500'>
            <input
              type='checkbox'
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className='h-4 w-4 rounded border-slate-300 accent-ink-950'
            />
            Nhớ đăng nhập
          </label>

          <Link
            to={ROUTE_PATHS.AUTH_FORGOT_PASSWORD}
            className='text-sm font-black text-brand-600 hover:text-brand-900'
          >
            Quên mật khẩu?
          </Link>
        </div>

        <Button full type='submit' loading={loading} disabled={loading}>
          Đăng nhập
        </Button>

        <div className='relative py-2'>
          <div className='h-px w-full bg-slate-200' />
          <div className='absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-xs font-bold text-slate-400'>
            hoặc
          </div>
        </div>

        <Button
          full
          type='button'
          variant='outline'
          onClick={handleLoginGoogle}
          loading={googleLoading}
          disabled={googleLoading}
        >
          <GoogleIcon />
          Đăng nhập với Google
        </Button>

        <p className='pt-1 text-center text-sm text-slate-500'>
          Chưa có tài khoản?{' '}
          <Link to={ROUTE_PATHS.AUTH_REGISTER} className='font-black text-brand-600 hover:text-brand-900'>
            Đăng ký
          </Link>
        </p>
      </form>
    </motion.div>
  )
}

function GoogleIcon() {
  return (
    <svg className='h-5 w-5' viewBox='0 0 48 48' xmlns='http://www.w3.org/2000/svg' aria-hidden='true'>
      <path
        fill='#FFC107'
        d='M43.6 20.5H42V20H24v8h11.3C33.8 32.7 29.4 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C34.5 6.1 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.3-.4-3.5z'
      />
      <path
        fill='#FF3D00'
        d='M6.3 14.7l6.6 4.8C14.7 15.3 19 12 24 12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C34.5 6.1 29.5 4 24 4c-7.7 0-14.3 4.3-17.7 10.7z'
      />
      <path
        fill='#4CAF50'
        d='M24 44c5.3 0 10.2-2 13.9-5.2l-6.4-5.3C29.5 35.8 26.9 36 24 36c-5.4 0-9.9-3.3-11.6-7.9l-6.6 5.1C9.3 39.7 16.2 44 24 44z'
      />
      <path
        fill='#1976D2'
        d='M43.6 20.5H42V20H24v8h11.3c-1 2.7-3 5-5.6 6.5l.1.1 6.4 5.3C39.6 36.7 44 31.1 44 24c0-1.2-.1-2.3-.4-3.5z'
      />
    </svg>
  )
}
