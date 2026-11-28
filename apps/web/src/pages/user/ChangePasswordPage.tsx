import { useState, useEffect, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, KeyRound, Lock, Mail } from 'lucide-react'
import { toast } from 'sonner'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import PasswordStrength from '../../components/ui/PasswordStrength'
import { ROUTE_PATHS } from '../../routes/route.paths'
import { changePasswordApi, forgotPasswordApi, getMeApi } from '../../services/auths.services'
import { getApiErrorMessage } from '../../utils/apiError'
import cn from '../../utils/cn'

export default function ChangePasswordPage() {
  const [userProfile, setUserProfile] = useState<{ email?: string; supabase_user_id?: string } | null>(null)
  const [profileLoading, setProfileLoading] = useState(true)

  const [oldPassword, setOldPassword] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)

  // Google setup states
  const [linkSent, setLinkSent] = useState(false)
  const [sendingLink, setSendingLink] = useState(false)

  const [errors, setErrors] = useState<{
    oldPassword?: string
    password?: string
    confirmPassword?: string
  }>({})

  useEffect(() => {
    getMeApi()
      .then((res) => {
        setUserProfile(res.data.result)
      })
      .catch(() => {
        setUserProfile(null)
      })
      .finally(() => {
        setProfileLoading(false)
      })
  }, [])

  const isGoogleUser = Boolean(userProfile?.supabase_user_id)

  const handleSendSetPasswordLink = async () => {
    if (!userProfile?.email) return
    try {
      setSendingLink(true)
      await forgotPasswordApi(userProfile.email)
      setLinkSent(true)
      toast.success(`Đã gửi link thiết lập mật khẩu tới ${userProfile.email}`)
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Không thể gửi email xác thực'))
    } finally {
      setSendingLink(false)
    }
  }

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

  if (profileLoading) {
    return (
      <div className='mx-auto max-w-xl px-4 py-16 text-center' aria-busy='true'>
        <span className='inline-block h-8 w-8 animate-spin rounded-full border-[3px] border-berry-500 border-t-transparent' />
        <p className='mt-3 text-sm text-ink-500'>Đang kiểm tra tài khoản…</p>
      </div>
    )
  }

  return (
    <div className='mx-auto max-w-xl px-4 py-8 md:py-12'>
      <Link to={ROUTE_PATHS.USER_PROFILE} className='inline-flex items-center gap-1.5 text-sm font-medium text-ink-600 hover:text-ink-950'>
        <ArrowLeft size={16} /> Hồ sơ
      </Link>
      <div className='mt-4 flex items-center gap-4'>
        <span className='grid h-14 w-14 shrink-0 rotate-[-6deg] place-items-center rounded-3xl bg-lilac-100 text-lilac-700'>
          <KeyRound size={24} aria-hidden />
        </span>
        <div>
          <h1 className='font-display text-3xl font-bold md:text-4xl'>{isGoogleUser ? 'Thiết lập mật khẩu' : 'Đổi mật khẩu'}</h1>
          <p className='text-ink-500'>
            {isGoogleUser ? 'Tạo mật khẩu riêng cho tài khoản Google.' : 'Dùng mật khẩu mạnh để bảo vệ tài khoản.'}
          </p>
        </div>
      </div>

      {isGoogleUser ? (
        <div className='mt-8 space-y-5 rounded-4xl bg-white p-6 ring-1 ring-ink-100 sm:p-8'>
          <p className='text-sm leading-relaxed text-ink-700'>
            Tài khoản <span className='font-semibold text-ink-950'>{userProfile?.email}</span> đang đăng nhập qua Google. Tạo thêm mật khẩu để
            có thể đăng nhập bằng email + mật khẩu.
          </p>
          {!linkSent ? (
            <Button variant='accent' size='lg' full loading={sendingLink} onClick={handleSendSetPasswordLink}>
              <Mail size={18} /> Gửi link thiết lập qua email
            </Button>
          ) : (
            <div className='rounded-3xl bg-emerald-50 p-6 text-center' role='status'>
              <CheckCircle2 size={32} className='mx-auto text-emerald-600' aria-hidden />
              <p className='mt-2 font-semibold text-emerald-900'>Đã gửi link!</p>
              <p className='mt-1 text-sm text-emerald-800'>Mở hộp thư {userProfile?.email} và làm theo hướng dẫn.</p>
              <button
                type='button'
                onClick={handleSendSetPasswordLink}
                disabled={sendingLink}
                className='mt-3 cursor-pointer text-sm font-semibold text-emerald-700 underline'
              >
                Gửi lại
              </button>
            </div>
          )}
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          noValidate
          className={cn('mt-8 space-y-5 rounded-4xl bg-white p-6 ring-1 ring-ink-100 sm:p-8', loading && 'pointer-events-none opacity-80')}
        >
          <Input
            label='Mật khẩu hiện tại'
            name='oldPassword'
            type='password'
            autoComplete='current-password'
            value={oldPassword}
            disabled={loading}
            onChange={(e) => {
              setOldPassword(e.target.value)
              setErrors((prev) => ({ ...prev, oldPassword: undefined }))
            }}
            error={errors.oldPassword}
            leftIcon={<Lock size={17} />}
          />
          <div className='space-y-2'>
            <Input
              label='Mật khẩu mới'
              name='password'
              type='password'
              autoComplete='new-password'
              value={password}
              disabled={loading}
              onChange={(e) => {
                setPassword(e.target.value)
                setErrors((prev) => ({ ...prev, password: undefined }))
              }}
              error={errors.password}
              helperText={!errors.password ? 'Tối thiểu 8 ký tự' : undefined}
              leftIcon={<Lock size={17} />}
            />
            <PasswordStrength password={password} />
          </div>
          <Input
            label='Nhập lại mật khẩu mới'
            name='confirmPassword'
            type='password'
            autoComplete='new-password'
            value={confirmPassword}
            disabled={loading}
            onChange={(e) => {
              setConfirmPassword(e.target.value)
              setErrors((prev) => ({ ...prev, confirmPassword: undefined }))
            }}
            error={errors.confirmPassword}
            leftIcon={<Lock size={17} />}
          />
          <Button type='submit' loading={loading} variant='accent' size='lg' full>
            Lưu mật khẩu mới
          </Button>
        </form>
      )}
    </div>
  )
}
