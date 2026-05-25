import { Link } from 'react-router-dom'
import Alert from '../../components/ui/Alert'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import { ROUTE_PATHS } from '../../routes/route.paths'

export default function ResendVerifyEmailPage() {
  return (
    <div>
      <div className='mb-6'>
        <h2 className='text-2xl font-black tracking-tight text-ink-950'>Gửi lại email xác minh</h2>
        <p className='mt-2 text-sm leading-6 text-slate-500'>Nhập email để nhận lại link xác minh.</p>
      </div>

      <form className='space-y-4'>
        <Input label='Email' type='email' placeholder='example@email.com' />
        <Button full type='submit'>
          Gửi lại email
        </Button>

        <Alert variant='info' title='Lưu ý' desc='Bạn cần xác minh email để có thể thêm vào giỏ hàng và thanh toán.' />

        <p className='text-center text-sm text-slate-500'>
          Quay lại{' '}
          <Link to={ROUTE_PATHS.AUTH_LOGIN} className='font-black text-brand-600 hover:text-brand-900'>
            Đăng nhập
          </Link>
        </p>
      </form>
    </div>
  )
}
