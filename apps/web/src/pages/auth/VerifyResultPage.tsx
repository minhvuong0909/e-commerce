import { Link, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import Button from '../../components/ui/Button'
import Alert from '../../components/ui/Alert'

export default function VerifyResultPage() {
  const [sp] = useSearchParams()
  const status = sp.get('status') // success | failed

  const isSuccess = status === 'success'
  const isFailed = status === 'failed' || !status

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    >
      <div className='mb-6'>
        <h2 className='text-2xl font-extrabold text-white'>Xác minh email</h2>
        <p className='mt-1 text-sm text-white/65'>Kết quả xác minh email của bạn.</p>
      </div>

      {isSuccess ? (
        <Alert variant='success' title='Xác minh thành công 🎉' desc='Bạn đã có thể Add to cart và Checkout.' />
      ) : null}

      {isFailed ? (
        <Alert
          variant='error'
          title='Xác minh thất bại'
          desc='Link không hợp lệ hoặc đã hết hạn. Bạn có thể gửi lại email xác minh.'
        />
      ) : null}

      <div className='mt-5 grid gap-3'>
        {isSuccess ? (
          <Link to='/'>
            <Button full variant='gradient'>
              Về trang chủ
            </Button>
          </Link>
        ) : (
          <Link to='/auth/resend-verify'>
            <Button full variant='gradient'>
              Gửi lại email xác minh
            </Button>
          </Link>
        )}

        <Link to='/auth/login'>
          <Button full variant='secondary'>
            Đăng nhập
          </Button>
        </Link>
      </div>
    </motion.div>
  )
}
