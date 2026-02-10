import { Link } from 'react-router-dom'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Alert from '../../components/ui/Alert'   
export default function ResendVerifyEmailPage() {
  return (
    <div>
      <div className='mb-6'>
        <h2 className='text-2xl font-extrabold text-gray-900'>Gửi lại email xác minh</h2>
        <p className='mt-1 text-sm text-gray-600'>Nhập email để nhận lại link xác minh.</p>
      </div>

      <form className='space-y-4'>
        <Input label='Email' type='email' placeholder='example@email.com' />
        <Button full type='submit'>
          Gửi lại email
        </Button>

        <Alert variant='info' title='Lưu ý' desc='Bạn cần xác minh email để có thể Add to cart / Checkout.' />

        <p className='text-center text-sm text-gray-600'>
          Quay lại{' '}
          <Link to='/auth/login' className='font-semibold text-orange-600 hover:underline'>
            Đăng nhập
          </Link>
        </p>
      </form>
    </div>
  )
}
