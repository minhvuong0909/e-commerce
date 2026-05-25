import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import Alert from '../../components/ui/Alert'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import { ROUTES } from '../../routes/route.paths'
import { forgotPasswordApi } from '../../services/auths.services'

export default function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!email.trim()) {
      toast.error('Vui lòng nhập email')
      return
    }

    try {
      setLoading(true)
      await forgotPasswordApi(email.trim())
      toast.success('Kiểm tra email của bạn, chúng tôi đã gửi link đặt lại mật khẩu.')
      navigate(`${ROUTES.AUTH + ROUTES.RESET_PASSWORD}`)
      setEmail('')
    } catch {
      toast.error('Gửi email đặt lại mật khẩu thất bại. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <div className='mb-6'>
        <h2 className='text-2xl font-black tracking-tight text-ink-950'>Quên mật khẩu</h2>
        <p className='mt-2 text-sm leading-6 text-slate-500'>Nhập email để nhận link đặt lại mật khẩu.</p>
      </div>

      <form className='space-y-4' onSubmit={handleSubmit}>
        <Input
          label='Email'
          type='email'
          name='email'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder='example@email.com'
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
