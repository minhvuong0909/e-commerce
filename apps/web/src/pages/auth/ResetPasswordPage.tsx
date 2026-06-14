import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import Alert from '../../components/ui/Alert'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import PasswordStrength from '../../components/ui/PasswordStrength'
import { ROUTES } from '../../routes/route.paths'
import { resetPasswordApi } from '../../services/auths.services'
import { getApiErrorMessage } from '../../utils/apiError'

export default function ResetPasswordPage() {
  const [sp] = useSearchParams()
  const navigate = useNavigate()

  const token = sp.get('forgot_password_token')
  const hasToken = Boolean(token)

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string }>({})

  const validate = () => {
    const next: { password?: string; confirmPassword?: string } = {}
    if (!password) next.password = 'Vui lòng nhập mật khẩu mới'
    else if (password.length < 8) next.password = 'Mật khẩu tối thiểu 8 ký tự'
    if (!confirmPassword) next.confirmPassword = 'Vui lòng nhập lại mật khẩu'
    else if (password !== confirmPassword) next.confirmPassword = 'Mật khẩu xác nhận không khớp'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!token) {
      toast.error('Token không hợp lệ hoặc đã hết hạn.')
      return
    }
    if (!validate()) return

    try {
      setLoading(true)

      await resetPasswordApi({
        password,
        confirm_password: confirmPassword,
        forgot_password_token: token
      })

      toast.success('Đặt lại mật khẩu thành công!')
      navigate(ROUTES.AUTH + ROUTES.LOGIN)
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Token không hợp lệ hoặc đã hết hạn.'))
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

      <form className='mt-4 space-y-4' onSubmit={handleSubmit} noValidate>
        <div className='space-y-2'>
          <Input
            label='Mật khẩu mới'
            type='password'
            autoComplete='new-password'
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              setErrors((prev) => ({ ...prev, password: undefined }))
            }}
            placeholder='Tối thiểu 8 ký tự'
            disabled={!hasToken}
            error={errors.password}
          />
          <PasswordStrength password={password} />
        </div>

        <Input
          label='Xác nhận mật khẩu'
          type='password'
          autoComplete='new-password'
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value)
            setErrors((prev) => ({ ...prev, confirmPassword: undefined }))
          }}
          placeholder='Nhập lại mật khẩu'
          disabled={!hasToken}
          error={errors.confirmPassword}
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
