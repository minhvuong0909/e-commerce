import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { loginApi } from '../../services/auths.services'
import { toast } from 'sonner'
import { ROUTES } from '../../routes/route.paths'
export default function LoginPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [forms, setForms] = useState({
    email: '',
    password: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForms({
      ...forms,
      [e.target.name]: e.target.value
    })
  }
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    // Call api login
    try {
      setLoading(true)
      const res = await loginApi(forms)
      localStorage.setItem('access_token', res.data.result.tokens.access_token)
      localStorage.setItem('refresh_token', res.data.result.tokens.refresh_token)
      toast.success('Đăng nhập thành công!')
      navigate('/user/home')
    } catch (error) {
      toast.error('Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.')
    } finally {
      setLoading(false)
    }
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    >
      {/* Header */}
      <div className='mb-6'>
        <h2 className='text-2xl font-extrabold text-white'>Đăng nhập</h2>
        <p className='mt-1 text-sm text-white/65'>Chào mừng bạn quay lại. Hãy đăng nhập để tiếp tục mua sắm.</p>
      </div>

      {/* Form */}
      <form className='space-y-4' onSubmit={handleSubmit}>
        <Input
          label='Email'
          name='email'
          type='email'
          placeholder='example@email.com'
          value={forms.email}
          onChange={handleChange}
        />
        <Input
          label='Mật khẩu'
          name='password'
          type='password'
          placeholder='••••••••'
          value={forms.password}
          onChange={handleChange}
        />

        <div className='flex items-center justify-between'>
          <label className='flex items-center gap-2 text-sm text-white/65'>
            <input type='checkbox' className='h-4 w-4 rounded border-white/20 bg-white/10 accent-orange-500' />
            Nhớ đăng nhập
          </label>

          <Link
            to={ROUTES.AUTH + ROUTES.FORGET_PASSWORD}
            className='text-sm font-semibold text-orange-300 hover:text-orange-200 hover:underline'
          >
            Quên mật khẩu?
          </Link>
        </div>

        {/* Primary */}
        <Button full type='submit' disabled={loading}>
          {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </Button>

        {/* Divider */}
        <div className='relative py-2'>
          <div className='h-px w-full bg-white/10' />
          <div className='absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black/60 px-3 text-xs text-white/50'>
            hoặc
          </div>
        </div>

        {/* Social */}
        <Button full type='button'>
          <GoogleIcon />
          Đăng nhập với Google
        </Button>

        {/* Footer */}
        <p className='pt-1 text-center text-sm text-white/65'>
          Chưa có tài khoản?
          <Link to='/auth/register' className='font-semibold text-orange-300 hover:text-orange-200 hover:underline'>
            Đăng ký
          </Link>
        </p>
      </form>
    </motion.div>
  )
}

function GoogleIcon() {
  return (
    <svg className='mr-2 h-5 w-5' viewBox='0 0 48 48' xmlns='http://www.w3.org/2000/svg'>
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
