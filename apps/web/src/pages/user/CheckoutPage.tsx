import { useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button'

export default function CheckoutPage() {
  const nav = useNavigate()

  return (
    <div className='grid gap-6 md:grid-cols-3'>
      <div className='md:col-span-2 rounded-3xl border border-white/10 bg-black/25 p-4 backdrop-blur'>
        <h2 className='mb-4 text-lg font-extrabold'>Thông tin thanh toán</h2>

        <label className='block mb-4'>
          <span className='text-sm text-white/70'>Phương thức giao hàng</span>
          <select className='mt-1 h-11 w-full rounded-2xl border border-white/10 bg-white/5 px-3'>
            <option>Giao hàng tiêu chuẩn</option>
            <option>Giao hàng nhanh</option>
          </select>
        </label>

        <label className='block'>
          <span className='text-sm text-white/70'>Phương thức thanh toán</span>
          <select className='mt-1 h-11 w-full rounded-2xl border border-white/10 bg-white/5 px-3'>
            <option>Thanh toán khi nhận hàng (COD)</option>
            <option>Thanh toán qua VNPAY</option>
          </select>
        </label>
      </div>

      <div className='h-fit rounded-3xl border border-white/10 bg-black/25 p-4 backdrop-blur'>
        <p className='text-sm text-white/70'>Tổng thanh toán</p>
        <p className='text-lg font-black mt-1'>299.000 ₫</p>

        <Button full variant='gradient' className='mt-4' onClick={() => nav('/user/orders')}>
          Xác nhận đặt hàng
        </Button>
      </div>
    </div>
  )
}
