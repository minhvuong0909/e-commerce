import { useState, useEffect, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, KeyRound, Lock, Mail, ShieldCheck, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import PasswordStrength from '../../components/ui/PasswordStrength'
import { ROUTE_PATHS } from '../../routes/route.paths'
import { changePasswordApi, forgotPasswordApi, getMeApi } from '../../services/auths.services'
import { getApiErrorMessage } from '../../utils/apiError'
import cn from '../../utils/cn'

const inputClass =
  '!rounded-md !border-[#eaded8] focus:!border-[#cbb8af] focus:!ring-[#f5d5cf]/40 disabled:!bg-[#fdf8f6] disabled:!opacity-70'

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
      <div className='mx-auto max-w-xl px-4 py-10 text-center'>
        <div className='inline-block h-8 w-8 animate-spin rounded-full border-4 border-[#3d3330] border-t-transparent' />
        <p className='mt-2 text-sm text-[#8a7a74]'>Đang kiểm tra tài khoản...</p>
      </div>
    )
  }

  return (
    <div className='mx-auto max-w-xl px-4 py-8 md:px-6 md:py-10'>
      <header className='mb-6 flex items-start gap-4'>
        <span className='grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#fdf2f0] text-[#c65f4a]'>
          <KeyRound size={22} strokeWidth={1.75} />
        </span>
        <div>
          <h1 className='text-2xl font-bold text-[#3d3330]'>
            {isGoogleUser ? 'Thiết lập mật khẩu' : 'Đổi mật khẩu'}
          </h1>
          <p className='mt-1 text-sm text-[#8a7a74]'>
            {isGoogleUser
              ? 'Tạo mật khẩu riêng cho tài khoản Google của bạn.'
              : 'Bảo mật tài khoản beauty của bạn.'}
          </p>
        </div>
      </header>

      {/* Google OAuth Linked Account Dedicated View */}
      {isGoogleUser ? (
        <div className='space-y-5 rounded-3xl border border-[#eaded8] bg-white p-6 shadow-sm md:p-8'>
          <div className='flex items-start gap-3.5 rounded-2xl border border-[#eaded8] bg-[#fdf8f6] p-4'>
            <Sparkles size={20} className='mt-0.5 shrink-0 text-[#c65f4a]' />
            <div>
              <p className='text-sm font-bold text-[#3d3330]'>Tài khoản liên kết Google</p>
              <p className='mt-1 text-xs leading-relaxed text-[#6b5f59]'>
                Tài khoản <span className='font-bold text-[#3d3330]'>{userProfile?.email}</span> của bạn hiện đang được liên kết bảo mật qua Google.
              </p>
            </div>
          </div>

          {!linkSent ? (
            <div className='space-y-4 pt-2'>
              <p className='text-sm leading-relaxed text-[#5c504a]'>
                Để tạo mật khẩu riêng giúp bạn có thể đăng nhập linh hoạt bằng cả 2 cách (bấm Đăng nhập Google hoặc gõ Email + Mật khẩu), hãy bấm nút bên dưới để nhận link xác thực gửi về Gmail của bạn:
              </p>

              <Button
                variant='gradient'
                full
                loading={sendingLink}
                disabled={sendingLink}
                onClick={handleSendSetPasswordLink}
                className='!min-h-12'
              >
                <Mail size={18} />
                <span>Gửi link thiết lập mật khẩu về Gmail</span>
              </Button>
            </div>
          ) : (
            <div className='rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-center space-y-2 animate-in fade-in'>
              <CheckCircle2 size={32} className='mx-auto text-emerald-600' />
              <h3 className='text-base font-bold text-emerald-900'>Đã gửi link thiết lập!</h3>
              <p className='text-xs leading-relaxed text-emerald-800 max-w-md mx-auto'>
                Chúng tôi đã gửi đường dẫn thiết lập mật khẩu tới Gmail <span className='font-bold'>{userProfile?.email}</span>. Vui lòng mở hộp thư và bấm nút xác thực để tạo mật khẩu mới.
              </p>
              <button
                type='button'
                onClick={handleSendSetPasswordLink}
                disabled={sendingLink}
                className='mt-2 text-xs font-bold text-emerald-700 underline hover:text-emerald-900'
              >
                Gửi lại email nếu chưa nhận được
              </button>
            </div>
          )}

          <div className='border-t border-[#f0e4de] pt-4'>
            <Link
              to={ROUTE_PATHS.USER_PROFILE}
              className='inline-flex items-center gap-1.5 text-sm font-semibold text-[#8a7a74] hover:text-[#3d3330]'
            >
              <ArrowLeft size={15} />
              Quay lại hồ sơ
            </Link>
          </div>
        </div>
      ) : (
        /* Standard User Password Change Form */
        <>
          <div className='mb-5 flex gap-3 rounded-2xl border border-[#eaded8] bg-[#fdf8f6] px-4 py-3.5'>
            <ShieldCheck size={18} className='mt-0.5 shrink-0 text-[#b07a72]' />
            <p className='text-sm leading-6 text-[#6b5f59]'>
              Dùng mật khẩu mạnh để bảo vệ tài khoản beauty của bạn.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            noValidate
            className={cn(
              'space-y-4 rounded-3xl border border-[#eaded8] bg-white p-6 shadow-sm md:p-8',
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
                variant='gradient'
                className='!px-6'
              >
                Lưu mật khẩu mới
              </Button>
            </div>
          </form>
        </>
      )}
    </div>
  )
}
