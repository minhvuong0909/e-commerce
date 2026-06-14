import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MailCheck } from 'lucide-react'
import { toast } from 'sonner'
import Alert from '../../components/ui/Alert'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import { ROUTES } from '../../routes/route.paths'
import { forgotPasswordApi } from '../../services/auths.services'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)

  const submit = async () => {
    try {
      setLoading(true)
      await forgotPasswordApi(email.trim())
      setSent(true)
    } catch {
      toast.error('Gửi email đặt lại mật khẩu thất bại. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const trimmed = email.trim()
    if (!trimmed) {
      setError('Vui lòng nhập email')
      return
    }
    if (!EMAIL_REGEX.test(trimmed)) {
      setError('Email không hợp lệ')
      return
    }
    setError('')
    await submit()
  }

  if (sent) {
    return (
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <div className='flex flex-col items-center text-center'>
          <span className='grid h-16 w-16 place-items-center rounded-3xl bg-emerald-50 text-emerald-600'>
            <MailCheck size={30} />
          </span>
          <h2 className='mt-5 text-2xl font-black tracking-tight text-ink-950'>Kiểm tra email của bạn</h2>
          <p className='mt-2 text-sm leading-6 text-slate-500'>
            Chúng tôi đã gửi link đặt lại mật khẩu tới <span className='font-black text-ink-900'>{email.trim()}</span>.
            Link có hiệu lực trong thời gian giới hạn.
          </p>
        </div>

        <div className='mt-6'>
          <Alert variant='info' title='Không nhận được email?' desc='Hãy kiểm tra mục Spam / Junk hoặc gửi lại sau vài phút.' />
        </div>

        <div className='mt-5 grid gap-3'>
          <Button full variant='secondary' onClick={submit} loading={loading} disabled={loading}>
            Gửi lại email
          </Button>
          <Link
            to={ROUTES.AUTH + ROUTES.LOGIN}
            className='inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-ink-950 px-5 text-sm font-bold text-white shadow-card transition hover:bg-brand-600'
          >
            Quay lại đăng nhập
          </Link>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <div className='mb-6'>
        <h2 className='text-2xl font-black tracking-tight text-ink-950'>Quên mật khẩu</h2>
        <p className='mt-2 text-sm leading-6 text-slate-500'>Nhập email để nhận link đặt lại mật khẩu.</p>
      </div>

      <form className='space-y-4' onSubmit={handleSubmit} noValidate>
        <Input
          label='Email'
          type='email'
          name='email'
          autoComplete='email'
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            setError('')
          }}
          placeholder='example@email.com'
          error={error}
          helperText='Chúng tôi sẽ gửi link đặt lại mật khẩu qua email này.'
        />

        <Button full type='submit' loading={loading} disabled={loading}>
          Gửi email đặt lại
        </Button>

        <Alert variant='info' title='Tip' desc='Nếu không thấy email, hãy kiểm tra Spam / Junk hoặc thử gửi lại sau vài phút.' />

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
