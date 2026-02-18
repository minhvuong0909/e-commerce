import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { toast } from 'sonner'

import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Alert from '../../components/ui/Alert'
import { forgotPasswordApi } from '../../services/auths.services'
import { ROUTES } from '../../routes/route.paths'

export default function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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
    } catch (error) {
      toast.error('Gửi email đặt lại mật khẩu thất bại. Vui lòng thử lại.')
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
        <h2 className='text-2xl font-extrabold text-white'>Quên mật khẩu</h2>
        <p className='mt-1 text-sm text-white/65'>Nhập email để nhận link đặt lại mật khẩu.</p>
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

        <Button full type='submit' variant='gradient' loading={loading} disabled={loading}>
          Gửi email đặt lại
        </Button>

        <Alert
          variant='info'
          title='Tip'
          desc='Nếu không thấy email, hãy kiểm tra Spam / Junk hoặc thử gửi lại sau 1–2 phút.'
        />

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
