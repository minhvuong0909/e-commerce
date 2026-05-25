import { Link, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import Alert from '../../components/ui/Alert'

export default function VerifyResultPage() {
  const [sp] = useSearchParams()
  const status = sp.get('status')

  const isSuccess = status === 'success'
  const isFailed = status === 'failed' || !status

  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <div className='mb-6'>
        <h2 className='text-2xl font-black tracking-tight text-ink-950'>Xác minh email</h2>
        <p className='mt-2 text-sm leading-6 text-slate-500'>Kết quả xác minh email của bạn.</p>
      </div>

      {isSuccess ? (
        <Alert variant='success' title='Xác minh thành công' desc='Bạn đã có thể thêm sản phẩm vào giỏ và thanh toán.' />
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
          <Link
            to='/user/home'
            className='inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-ink-950 px-5 text-sm font-bold text-white shadow-card transition hover:bg-brand-600'
          >
            Về trang chủ
          </Link>
        ) : (
          <Link
            to='/auth/resend-verify'
            className='inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-ink-950 px-5 text-sm font-bold text-white shadow-card transition hover:bg-brand-600'
          >
            Gửi lại email xác minh
          </Link>
        )}

        <Link
          to='/auth/login'
          className='inline-flex min-h-12 w-full items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-sm font-bold text-ink-950 shadow-sm transition hover:border-slate-300 hover:shadow-card'
        >
          Đăng nhập
        </Link>
      </div>
    </motion.div>
  )
}
