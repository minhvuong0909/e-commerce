import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Alert from '../../components/ui/Alert'

export default function ForgotPasswordPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    >
      {/* Header */}
      <div className='mb-6'>
        <h2 className='text-2xl font-extrabold text-white'>Quên mật khẩu</h2>
        <p className='mt-1 text-sm text-white/65'>Nhập email để nhận link đặt lại mật khẩu.</p>
      </div>

      <form className='space-y-4'>
        <Input
          label='Email'
          type='email'
          placeholder='example@email.com'
          helperText='Chúng tôi sẽ gửi link đặt lại mật khẩu qua email này.'
        />

        <Button full type='submit' variant='gradient'>
          Gửi email đặt lại
        </Button>

        <Alert
          variant='info'
          title='Tip'
          desc='Nếu không thấy email, hãy kiểm tra Spam / Junk hoặc thử gửi lại sau 1–2 phút.'
        />

        <p className='text-center text-sm text-white/65'>
          Quay lại{' '}
          <Link to='/auth/login' className='font-semibold text-orange-300 hover:text-orange-200 hover:underline'>
            Đăng nhập
          </Link>
        </p>
      </form>
    </motion.div>
  )
}
