import { useParams, Link } from 'react-router-dom'
import Button from '../../components/ui/Button'
import Alert from '../../components/ui/Alert'

type OrderStatus = 'PENDING' | 'SHIPPING' | 'DONE' | 'CANCELLED'

export default function OrderDetailPage() {
  const { id } = useParams()

  // MOCK DATA
  const order = {
    id,
    status: 'PENDING' as OrderStatus,
    statusLabel: 'Đang xử lý',
    createdAt: '11/02/2026',
    paymentMethod: 'Thanh toán khi nhận hàng (COD)',
    receiver: {
      name: 'Nguyễn Văn A',
      phone: '0900 000 000',
      address: '123 Nguyễn Trãi, Quận 1, TP.HCM'
    },
    items: [
      { id: 1, name: 'Sản phẩm A', price: 199000, qty: 1 },
      { id: 2, name: 'Sản phẩm B', price: 100000, qty: 1 }
    ],
    shippingFee: 25000
  }

  const money = (n: number) => n.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })

  const subtotal = order.items.reduce((s, x) => s + x.price * x.qty, 0)
  const total = subtotal + order.shippingFee

  const canCancel = order.status === 'PENDING'

  const statusColor = () => {
    if (order.status === 'PENDING') return 'text-orange-300'
    if (order.status === 'SHIPPING') return 'text-sky-300'
    if (order.status === 'DONE') return 'text-emerald-300'
    return 'text-rose-300'
  }

  return (
    <div className='space-y-5'>
      {/* HEADER */}
      <div className='flex items-start justify-between gap-4'>
        <div>
          <h1 className='text-xl font-extrabold'>Chi tiết đơn hàng #{order.id}</h1>
          <p className='mt-1 text-sm text-white/60'>Đặt ngày {order.createdAt}</p>
        </div>

        <span className={`rounded-full bg-white/10 px-4 py-2 text-sm font-extrabold ${statusColor()}`}>
          {order.statusLabel}
        </span>
      </div>

      {/* SHIPPING INFO */}
      <div className='rounded-3xl border border-white/10 bg-black/25 p-4 backdrop-blur'>
        <div className='font-extrabold mb-2'>Thông tin nhận hàng</div>
        <p className='text-sm text-white/70'>{order.receiver.name}</p>
        <p className='text-sm text-white/70'>{order.receiver.phone}</p>
        <p className='text-sm text-white/70'>{order.receiver.address}</p>
      </div>

      {/* PAYMENT */}
      <div className='rounded-3xl border border-white/10 bg-black/25 p-4 backdrop-blur'>
        <div className='font-extrabold mb-2'>Thanh toán</div>
        <p className='text-sm text-white/70'>{order.paymentMethod}</p>
      </div>

      {/* ITEMS */}
      <div className='rounded-3xl border border-white/10 bg-black/25 backdrop-blur divide-y divide-white/10'>
        {order.items.map((x) => (
          <div key={x.id} className='flex items-center justify-between p-4'>
            <div>
              <div className='text-sm font-bold'>{x.name}</div>
              <div className='mt-1 text-xs text-white/55'>
                {money(x.price)} × {x.qty}
              </div>
            </div>

            <div className='text-sm font-extrabold'>{money(x.price * x.qty)}</div>
          </div>
        ))}
      </div>

      {/* SUMMARY */}
      <div className='rounded-3xl border border-white/10 bg-black/25 p-4 backdrop-blur space-y-2'>
        <div className='flex justify-between text-sm text-white/70'>
          <span>Tạm tính</span>
          <span className='font-semibold text-white'>{money(subtotal)}</span>
        </div>

        <div className='flex justify-between text-sm text-white/70'>
          <span>Phí vận chuyển</span>
          <span className='font-semibold text-white'>
            {order.shippingFee === 0 ? 'Miễn phí' : money(order.shippingFee)}
          </span>
        </div>

        <div className='my-2 h-px bg-white/10' />

        <div className='flex justify-between'>
          <span className='text-white/70'>Tổng thanh toán</span>
          <span className='text-lg font-black'>{money(total)}</span>
        </div>
      </div>

      {/* ACTION */}
      {canCancel ? (
        <div className='rounded-3xl border border-rose-500/25 bg-rose-500/10 p-4'>
          <p className='mb-3 text-sm text-rose-100'>Bạn chỉ có thể hủy đơn khi đơn hàng đang ở trạng thái xử lý.</p>
          <Button variant='danger'>Hủy đơn hàng</Button>
        </div>
      ) : (
        <Alert
          variant='info'
          title='Không thể hủy đơn hàng'
          desc='Đơn hàng đã được xử lý hoặc đang giao, không thể hủy.'
        />
      )}

      {/* BACK */}
      <Link to='/user/orders' className='inline-block text-sm font-semibold text-white/60 hover:text-white'>
        ← Quay lại danh sách đơn hàng
      </Link>
    </div>
  )
}
