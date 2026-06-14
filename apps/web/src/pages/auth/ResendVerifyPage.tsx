import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MailCheck, MailWarning } from 'lucide-react'
import { toast } from 'sonner'
import Alert from '../../components/ui/Alert'
import Button from '../../components/ui/Button'
import { ROUTE_PATHS } from '../../routes/route.paths'
import { resendVerifyEmailApi } from '../../services/auths.services'
import { getApiErrorMessage } from '../../utils/apiError'

const COOLDOWN_SECONDS = 60

export default function ResendVerifyEmailPage() {
  const isAuthenticated = Boolean(localStorage.getItem('access_token'))
  const [loading, setLoading] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const [sentOnce, setSentOnce] = useState(false)

  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [cooldown])

  const handleResend = async () => {
    try {
      setLoading(true)
      await resendVerifyEmailApi()
      setSentOnce(true)
      setCooldown(COOLDOWN_SECONDS)
      toast.success('Đã gửi lại email xác minh.')
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Gửi lại email xác minh thất bại. Vui lòng thử lại.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <div className='flex flex-col items-center text-center'>
        <span className='grid h-16 w-16 place-items-center rounded-3xl bg-brand-50 text-brand-600'>
          {sentOnce ? <MailCheck size={30} /> : <MailWarning size={30} />}
        </span>
        <h2 className='mt-5 text-2xl font-black tracking-tight text-ink-950'>
          {sentOnce ? 'Đã gửi lại email' : 'Xác minh email'}
        </h2>
        <p className='mt-2 text-sm leading-6 text-slate-500'>
          {sentOnce
            ? 'Vui lòng kiểm tra hộp thư để hoàn tất xác minh tài khoản.'
            : 'Gửi lại link xác minh tới email đã đăng ký của bạn.'}
        </p>
      </div>

      {!isAuthenticated ? (
        <div className='mt-6'>
          <Alert
            variant='warning'
            title='Bạn cần đăng nhập'
            desc='Vui lòng đăng nhập trước để gửi lại email xác minh cho tài khoản của bạn.'
          />
          <Link
            to={ROUTE_PATHS.AUTH_LOGIN}
            className='mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-ink-950 px-5 text-sm font-bold text-white shadow-card transition hover:bg-brand-600'
          >
            Đăng nhập
          </Link>
        </div>
      ) : (
        <div className='mt-6 space-y-4'>
          <Alert variant='info' title='Lưu ý' desc='Bạn cần xác minh email để có thể thêm vào giỏ hàng và thanh toán.' />

          <Button full onClick={handleResend} loading={loading} disabled={loading || cooldown > 0}>
            {cooldown > 0 ? `Gửi lại sau ${cooldown}s` : 'Gửi lại email xác minh'}
          </Button>

          <p className='text-center text-sm text-slate-500'>
            Quay lại{' '}
            <Link to={ROUTE_PATHS.AUTH_LOGIN} className='font-black text-brand-600 hover:text-brand-900'>
              Đăng nhập
            </Link>
          </p>
        </div>
      )}
    </motion.div>
  )
}
