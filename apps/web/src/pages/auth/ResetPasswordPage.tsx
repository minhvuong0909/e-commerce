import { useSearchParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Alert from '../../components/ui/Alert'

export default function ResetPasswordPage() {
  const [sp] = useSearchParams()
  const token = sp.get('token')

  const hasToken = Boolean(token)

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    >
      <div className='mb-6'>
        <h2 className='text-2xl font-extrabold text-white'>Đặt lại mật khẩu</h2>
        <p className='mt-1 text-sm text-white/65'>Tạo mật khẩu mới cho tài khoản của bạn.</p>
      </div>

      {!hasToken ? (
        <Alert variant='error' title='Thiếu token' desc='Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.' />
      ) : (
        <Alert
          variant='info'
          title='Tạo mật khẩu mới'
          desc='Hãy nhập mật khẩu mới (tối thiểu 8 ký tự) để bảo vệ tài khoản.'
          className='mb-4'
        />
      )}

      <form className='mt-4 space-y-4'>
        <Input label='Mật khẩu mới' type='password' placeholder='Tối thiểu 8 ký tự' disabled={!hasToken} />

        <Input label='Xác nhận mật khẩu' type='password' placeholder='Nhập lại mật khẩu' disabled={!hasToken} />

        <Button full type='submit' variant='gradient' disabled={!hasToken}>
          Đặt mật khẩu
        </Button>

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
