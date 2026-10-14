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
  '!rounded-xl !border-[#E7E0D8] focus:!border-[#A16207] focus:!ring-[#A16207]/20 disabled:!bg-[#FAF7F2] disabled:!opacity-70 text-xs'

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
        <div className='inline-block h-8 w-8 animate-spin rounded-full border-4 border-[#1C1917] border-t-transparent' />
        <p className='mt-2 text-xs text-[#786C60]'>Đang kiểm tra tài khoản...</p>
      </div>
    )
  }

  return (
    <div className='mx-auto max-w-xl px-4 py-8 md:px-6 md:py-10'>
      <header className='mb-6 flex items-start gap-4'>
        <span className='grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#FAF7F2] text-[#A16207] border border-[#E7E0D8]'>
          <KeyRound size={22} strokeWidth={1.75} />
        </span>
        <div>
          <h1 className='font-display text-2xl font-extrabold text-[#1C1917]'>
            {isGoogleUser ? 'Thiết lập mật khẩu' : 'Đổi mật khẩu'}
          </h1>
          <p className='mt-1 text-xs text-[#786C60]'>
            {isGoogleUser
              ? 'Tạo mật khẩu riêng cho tài khoản Google của bạn.'
              : 'Bảo mật tài khoản mua sắm cao cấp của bạn.'}
          </p>
        </div>
      </header>

      {/* Google OAuth Linked Account Dedicated View */}
      {isGoogleUser ? (
        <div className='space-y-5 rounded-3xl border border-[#E7E0D8] bg-white p-6 shadow-soft md:p-8'>
          <div className='flex items-start gap-3.5 rounded-2xl border border-[#E7E0D8] bg-[#FAF7F2] p-4'>
            <Sparkles size={20} className='mt-0.5 shrink-0 text-[#A16207]' />
            <div>
              <p className='text-xs font-bold text-[#1C1917]'>Tài khoản liên kết Google</p>
              <p className='mt-1 text-xs leading-relaxed text-[#44403C]'>
                Tài khoản <span className='font-bold text-[#1C1917]'>{userProfile?.email}</span> của bạn hiện đang được liên kết bảo mật qua Google.
              </p>
            </div>
          </div>

          {!linkSent ? (
            <div className='space-y-4 pt-2'>
              <p className='text-xs leading-relaxed text-[#44403C]'>
                Để tạo mật khẩu riêng giúp bạn có thể đăng nhập linh hoạt bằng cả 2 cách (bấm Đăng nhập Google hoặc gõ Email + Mật khẩu), hãy bấm nút bên dưới để nhận link xác thực gửi về Gmail của bạn:
              </p>

              <Button
                variant='accent'
                full
                loading={sendingLink}
                disabled={sendingLink}
                onClick={handleSendSetPasswordLink}
                className='!min-h-11 !rounded-xl'
              >
                <Mail size={16} />
                <span>Gửi link thiết lập mật khẩu về Gmail</span>
              </Button>
            </div>
          ) : (
            <div className='rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-center space-y-2 animate-in fade-in'>
              <CheckCircle2 size={32} className='mx-auto text-emerald-600' />
              <h3 className='text-sm font-bold text-emerald-900'>Đã gửi link thiết lập!</h3>
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

          <div className='border-t border-[#E7E0D8] pt-4'>
            <Link
              to={ROUTE_PATHS.USER_PROFILE}
              className='inline-flex items-center gap-1.5 text-xs font-bold text-[#786C60] hover:text-[#1C1917]'
            >
              <ArrowLeft size={14} />
              Quay lại hồ sơ
            </Link>
          </div>
        </div>
      ) : (
        /* Standard User Password Change Form */
        <>
          <div className='mb-5 flex gap-3 rounded-2xl border border-[#E7E0D8] bg-[#FAF7F2] px-4 py-3.5'>
            <ShieldCheck size={18} className='mt-0.5 shrink-0 text-[#A16207]' />
            <p className='text-xs leading-relaxed text-[#44403C]'>
              Dùng mật khẩu mạnh (chữ hoa, số, ký tự đặc biệt) để bảo vệ tài khoản cá nhân.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            noValidate
            className={cn(
              'space-y-4 rounded-3xl border border-[#E7E0D8] bg-white p-6 shadow-soft md:p-8',
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
              leftIcon={<Lock size={16} className='text-[#A16207]' />}
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
                leftIcon={<Lock size={16} className='text-[#A16207]' />}
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
              leftIcon={<Lock size={16} className='text-[#A16207]' />}
              className={inputClass}
            />

            <div className='flex flex-col-reverse gap-3 border-t border-[#E7E0D8] pt-5 sm:flex-row sm:items-center sm:justify-between'>
              <Link
                to={ROUTE_PATHS.USER_PROFILE}
                className='inline-flex items-center justify-center gap-1.5 text-xs font-bold text-[#786C60] hover:text-[#1C1917]'
              >
                <ArrowLeft size={14} />
                Quay lại hồ sơ
              </Link>
              <Button
                type='submit'
                loading={loading}
                disabled={loading}
                variant='accent'
                className='!px-6 !rounded-xl'
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
