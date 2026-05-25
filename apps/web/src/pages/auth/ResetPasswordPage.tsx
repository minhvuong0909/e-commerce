import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import Alert from '../../components/ui/Alert'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import { ROUTES } from '../../routes/route.paths'
import { resetPasswordApi } from '../../services/auths.services'

export default function ResetPasswordPage() {
  const [sp] = useSearchParams()
  const navigate = useNavigate()

  const token = sp.get('forgot_password_token')
  const hasToken = Boolean(token)

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!token) {
      toast.error('Token không hợp lệ hoặc đã hết hạn.')
      return
    }

    if (!password || !confirmPassword) {
      toast.error('Vui lòng nhập đầy đủ thông tin.')
      return
    }

    if (password !== confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp.')
      return
    }

    try {
      setLoading(true)

      await resetPasswordApi({
        password,
        confirm_password: confirmPassword,
        forgot_password_token: token
      })

      toast.success('Đặt lại mật khẩu thành công!')
      navigate(ROUTES.AUTH + ROUTES.LOGIN)
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Token không hợp lệ hoặc đã hết hạn.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <div className='mb-6'>
        <h2 className='text-2xl font-black tracking-tight text-ink-950'>Đặt lại mật khẩu</h2>
        <p className='mt-2 text-sm leading-6 text-slate-500'>Tạo mật khẩu mới cho tài khoản của bạn.</p>
      </div>

      {!hasToken ? (
        <Alert variant='error' title='Thiếu token' desc='Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.' />
      ) : (
        <Alert
          variant='info'
          title='Tạo mật khẩu mới'
          desc='Hãy nhập mật khẩu mới để bảo vệ tài khoản.'
          className='mb-4'
        />
      )}

      <form className='mt-4 space-y-4' onSubmit={handleSubmit}>
        <Input
          label='Mật khẩu mới'
          type='password'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder='Tối thiểu 8 ký tự'
          disabled={!hasToken}
        />

        <Input
          label='Xác nhận mật khẩu'
          type='password'
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder='Nhập lại mật khẩu'
          disabled={!hasToken}
        />

        <Button full type='submit' loading={loading} disabled={!hasToken || loading}>
          Đặt mật khẩu
        </Button>

        <p className='text-center text-sm text-slate-500'>
          Quay lại{' '}
          <Link to={ROUTES.AUTH + ROUTES.LOGIN} className='font-black text-brand-600 hover:text-brand-900'>
            Đăng nhập
          </Link>
        </p>
      </form>
    </motion.div>
  )
}
