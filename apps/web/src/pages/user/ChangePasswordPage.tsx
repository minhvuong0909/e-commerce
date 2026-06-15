import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, KeyRound, Lock, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import PasswordStrength from '../../components/ui/PasswordStrength'
import { ROUTE_PATHS } from '../../routes/route.paths'
import { changePasswordApi } from '../../services/auths.services'
import { getApiErrorMessage } from '../../utils/apiError'
import cn from '../../utils/cn'

const inputClass =
  '!rounded-md !border-[#eaded8] focus:!border-[#cbb8af] focus:!ring-[#f5d5cf]/40 disabled:!bg-[#fdf8f6] disabled:!opacity-70'

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
    <div className='mx-auto max-w-xl px-4 py-8 md:px-6 md:py-10'>
      <header className='mb-6 flex items-start gap-4'>
        <span className='grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-[#b07a72]/15 text-[#b07a72]'>
          <KeyRound size={22} strokeWidth={1.75} />
        </span>
        <div>
          <h1 className='text-2xl font-semibold text-[#3d3330]'>Đổi mật khẩu</h1>
          <p className='mt-1 text-sm text-[#8a7a74]'>Bảo mật tài khoản beauty của bạn.</p>
        </div>
      </header>

      <div className='mb-5 flex gap-3 rounded-lg border border-[#eaded8] bg-[#fdf8f6] px-4 py-3.5'>
        <ShieldCheck size={18} className='mt-0.5 shrink-0 text-[#b07a72]' />
        <p className='text-sm leading-6 text-[#6b5f59]'>
          Dùng mật khẩu mạnh để bảo vệ tài khoản beauty của bạn.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        noValidate
        className={cn(
          'space-y-4 rounded-lg border border-[#eaded8] bg-white p-6 md:p-7',
          loading && 'pointer-events-none opacity-80'
        )}
      >
        <Input
          label='Mật khẩu hiện tại'
          name='oldPassword'
          type='password'
          value={oldPassword}
          disabled={loading}
          onChange={(e) => {
            setOldPassword(e.target.value)
            setErrors((prev) => ({ ...prev, oldPassword: undefined }))
          }}
          error={errors.oldPassword}
          leftIcon={<Lock size={16} className='text-[#b07a72]' />}
          className={inputClass}
        />

        <div className='space-y-2'>
          <Input
            label='Mật khẩu mới'
            name='password'
            type='password'
            value={password}
            disabled={loading}
            onChange={(e) => {
              setPassword(e.target.value)
              setErrors((prev) => ({ ...prev, password: undefined }))
            }}
            error={errors.password}
            helperText={!errors.password ? 'Tối thiểu 8 ký tự' : undefined}
            leftIcon={<Lock size={16} className='text-[#b07a72]' />}
            className={inputClass}
          />
          <PasswordStrength password={password} variant='cosmetics' />
        </div>

        <Input
          label='Xác nhận mật khẩu mới'
          name='confirmPassword'
          type='password'
          value={confirmPassword}
          disabled={loading}
          onChange={(e) => {
            setConfirmPassword(e.target.value)
            setErrors((prev) => ({ ...prev, confirmPassword: undefined }))
          }}
          error={errors.confirmPassword}
          leftIcon={<Lock size={16} className='text-[#b07a72]' />}
          className={inputClass}
        />

        <div className='flex flex-col-reverse gap-3 border-t border-[#f0e4de] pt-5 sm:flex-row sm:items-center sm:justify-between'>
          <Link
            to={ROUTE_PATHS.USER_PROFILE}
            className='inline-flex items-center justify-center gap-1.5 text-sm font-semibold text-[#b07a72] hover:text-[#8f5f58]'
          >
            <ArrowLeft size={15} />
            Quay lại hồ sơ
          </Link>
          <Button
            type='submit'
            loading={loading}
            disabled={loading}
            className='!h-11 !rounded-md !bg-[#3d3330] !px-6 hover:!bg-[#2a2421]'
          >
            Lưu mật khẩu mới
          </Button>
        </div>
      </form>
    </div>
  )
}
