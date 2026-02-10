import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Alert from '../../components/ui/Alert'

export default function RegisterPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    >
      {/* Header */}
      <div className='mb-5'>
        <h2 className='text-2xl font-extrabold text-white'>Tạo tài khoản</h2>
        <p className='mt-1 text-sm text-white/65'>Đăng ký nhanh và bắt đầu mua sắm.</p>
      </div>

      {/* Info alert */}
      <Alert
        variant='info'
        title='Lưu ý xác minh email'
        desc='Sau khi đăng ký, bạn cần xác minh email để có thể mua hàng và sử dụng đầy đủ tính năng.'
      />

      <form className='mt-4 space-y-4'>
        <Input label='Họ và tên' placeholder='Nguyễn Văn A' />
        <Input label='Email' type='email' placeholder='example@email.com' />
        <Input label='Mật khẩu' type='password' placeholder='Tối thiểu 8 ký tự' />
        <Input label='Nhập lại mật khẩu' type='password' placeholder='Nhập lại mật khẩu' />

        <p className='text-xs text-white/50'>
          Bằng cách đăng ký, bạn đồng ý với điều khoản & chính sách của chúng tôi.
        </p>

        <Button full type='submit' variant='gradient'>
          Đăng ký
        </Button>

        <p className='text-center text-sm text-white/65'>
          Đã có tài khoản?{' '}
          <Link to='/auth/login' className='font-semibold text-orange-300 hover:text-orange-200 hover:underline'>
            Đăng nhập
          </Link>
        </p>
      </form>
    </motion.div>
  )
}
