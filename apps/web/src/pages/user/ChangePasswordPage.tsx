import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { KeyRound, Lock } from 'lucide-react'
import { toast } from 'sonner'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import PasswordStrength from '../../components/ui/PasswordStrength'
import { ROUTE_PATHS } from '../../routes/route.paths'
import { changePasswordApi } from '../../services/auths.services'
import { getApiErrorMessage } from '../../utils/apiError'

export default function ChangePasswordPage() {
  const [oldPassword, setOldPassword] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{
    oldPassword?: string
    password?: string
    confirmPassword?: string
  }>({})

  const validate = () => {
    const next: typeof errors = {}
    if (!oldPassword) next.oldPassword = 'Vui lòng nhập mật khẩu hiện tại'
    if (!password) next.password = 'Vui lòng nhập mật khẩu mới'
    else if (password.length < 8) next.password = 'Mật khẩu tối thiểu 8 ký tự'
    if (!confirmPassword) next.confirmPassword = 'Vui lòng nhập lại mật khẩu'
    else if (password !== confirmPassword) next.confirmPassword = 'Mật khẩu xác nhận không khớp'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!validate()) return

    try {
      setLoading(true)
      await changePasswordApi({
        old_password: oldPassword,
        password,
        confirm_password: confirmPassword
      })
      toast.success('Đổi mật khẩu thành công!')
      setOldPassword('')
      setPassword('')
      setConfirmPassword('')
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Đổi mật khẩu thất bại'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className='mx-auto max-w-xl px-4 py-8 md:px-6'
    >
      <div className='mb-6 flex items-center gap-3'>
        <span className='grid h-11 w-11 place-items-center rounded-2xl bg-brand-50 text-brand-700'>
          <KeyRound size={20} />
        </span>
        <div>
          <h1 className='text-2xl font-black text-ink-950'>Đổi mật khẩu</h1>
          <p className='mt-1 text-sm text-slate-500'>Cập nhật mật khẩu để bảo vệ tài khoản của bạn.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate className='surface-card space-y-4 rounded-3xl p-6'>
        <Input
          label='Mật khẩu hiện tại'
          name='oldPassword'
          type='password'
          value={oldPassword}
          onChange={(e) => {
            setOldPassword(e.target.value)
            setErrors((prev) => ({ ...prev, oldPassword: undefined }))
          }}
          error={errors.oldPassword}
          leftIcon={<Lock size={16} />}
        />

        <Input
          label='Mật khẩu mới'
          name='password'
          type='password'
          value={password}
          onChange={(e) => {
            setPassword(e.target.value)
            setErrors((prev) => ({ ...prev, password: undefined }))
          }}
          error={errors.password}
          leftIcon={<Lock size={16} />}
        />
        <PasswordStrength password={password} />

        <Input
          label='Xác nhận mật khẩu mới'
          name='confirmPassword'
          type='password'
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value)
            setErrors((prev) => ({ ...prev, confirmPassword: undefined }))
          }}
          error={errors.confirmPassword}
          leftIcon={<Lock size={16} />}
        />

        <div className='flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between'>
          <Link to={ROUTE_PATHS.USER_PROFILE} className='text-sm font-bold text-brand-600 hover:text-brand-900'>
            Quay lại hồ sơ
          </Link>
          <Button type='submit' loading={loading} disabled={loading}>
            Lưu mật khẩu mới
          </Button>
        </div>
      </form>
    </motion.div>
  )
}
