import { useSearchParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { toast } from 'sonner'

import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Alert from '../../components/ui/Alert'
import { resetPasswordApi } from '../../services/auths.services'
import { ROUTES } from '../../routes/route.paths'

export default function ResetPasswordPage() {
  const [sp] = useSearchParams()
  const navigate = useNavigate()

  const token = sp.get('forgot_password_token')
  const hasToken = Boolean(token)

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    >
      <div className='mb-6'>
        <h2 className='text-2xl font-extrabold text-white'>Đặt lại mật khẩu</h2>
        <p className='mt-1 text-sm text-white/65'>Tạo mật khẩu mới cho tài khoản của bạn.</p>
      </div>

      {!hasToken ? (
        <Alert variant='error' title='Thiếu token' desc='Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.' />
      ) : (
        <Alert
          variant='info'
          title='Tạo mật khẩu mới'
          desc='Hãy nhập mật khẩu mới (tối thiểu 8 ký tự) để bảo vệ tài khoản.'
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

        <Button full type='submit' variant='gradient' loading={loading} disabled={!hasToken || loading}>
          Đặt mật khẩu
        </Button>

        <p className='text-center text-sm text-white/65'>
          Quay lại{' '}
          <Link
            to={ROUTES.AUTH + ROUTES.LOGIN}
            className='font-semibold text-orange-300 hover:text-orange-200 hover:underline'
          >
            Đăng nhập
          </Link>
        </p>
      </form>
    </motion.div>
  )
}
