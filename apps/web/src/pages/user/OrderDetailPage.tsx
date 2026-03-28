import { useEffect, useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import Button from '../../components/ui/Button'
import Alert from '../../components/ui/Alert'
import { getOrderByIdApi } from '../../services/orders.services'
import type { OrderApiResponse, OrderUI, PaymentMethod } from '../../models/OrderRequests'
import type { OrderStatus } from '../../constants/order'

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [order, setOrder] = useState<OrderUI | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const money = (n: number) =>
    n.toLocaleString('vi-VN', {
      style: 'currency',
      currency: 'VND'
    })

  const formatDateTime = (dateString: string) =>
    new Date(dateString).toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })

  const createOrderCode = (value: string) => `#${value.slice(-6).toUpperCase()}`

  const mapStatus = (status: number): { status: OrderStatus; statusLabel: string } => {
    switch (status) {
      case 0:
        return { status: 'processing', statusLabel: 'Đang xử lý' }
      case 1:
        return { status: 'shipping', statusLabel: 'Đang giao' }
      case 2:
        return { status: 'done', statusLabel: 'Hoàn tất' }
      case 3:
        return { status: 'cancel', statusLabel: 'Đã hủy' }
      default:
        return { status: 'processing', statusLabel: 'Đang xử lý' }
    }
  }

  const mapPaymentMethod = (method: PaymentMethod | string) => {
    switch (method) {
      case 'CASH_ON_DELIVERY':
        return 'Thanh toán khi nhận hàng (COD)'
      case 'CREDIT_CARD':
        return 'Thẻ tín dụng'
      case 'PAYPAL':
        return 'PayPal'
      case 'MOMO':
        return 'Ví MoMo'
      default:
        return method ? String(method).replaceAll('_', ' ') : 'Không xác định'
    }
  }

  const mapPaymentStatus = (status: number) => {
    switch (status) {
      case 0:
        return 'Chưa thanh toán'
      case 1:
        return 'Đã thanh toán'
      default:
        return 'Không xác định'
    }
  }

  const statusClass = (status: OrderStatus) => {
    switch (status) {
      case 'processing':
        return 'border-orange-500/20 bg-orange-500/10 text-orange-200'
      case 'shipping':
        return 'border-sky-500/20 bg-sky-500/10 text-sky-200'
      case 'done':
        return 'border-emerald-500/20 bg-emerald-500/10 text-emerald-200'
      case 'cancel':
        return 'border-rose-500/20 bg-rose-500/10 text-rose-200'
      default:
        return 'border-white/10 bg-white/10 text-white/70'
    }
  }

  useEffect(() => {
    const fetchOrder = async () => {
      if (!id) {
        setError('Không tìm thấy mã đơn hàng.')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError('')

        const res = await getOrderByIdApi(id)
        const rawOrder: OrderApiResponse = res?.data?.result || res?.data?.data || res

        if (!rawOrder?._id) {
          throw new Error('Order data is invalid')
        }

        const statusInfo = mapStatus(rawOrder.status)

        const mappedOrder: OrderUI = {
          id: rawOrder._id,
          code: createOrderCode(rawOrder._id),
          status: statusInfo.status,
          statusLabel: statusInfo.statusLabel,
          subtotal: rawOrder.total_price,
          shippingFee: rawOrder.shipping_fee,
          total: rawOrder.total_price + rawOrder.shipping_fee,
          items: 0,
          paymentMethod: mapPaymentMethod(rawOrder.payment_method),
          createdAt: formatDateTime(rawOrder.created_at),
          updatedAt: formatDateTime(rawOrder.updated_at),
          paymentStatusLabel: mapPaymentStatus(rawOrder.payment_status),
          deliveryMethodId: rawOrder.delivery_method_id
        }

        setOrder(mappedOrder)
      } catch (err) {
        console.error(err)
        setError('Không thể tải chi tiết đơn hàng. Vui lòng thử lại.')
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [id])

  const canCancel = useMemo(() => order?.status === 'processing', [order])

  if (loading) {
    return (
      <div className='space-y-4'>
        <div className='h-8 w-56 animate-pulse rounded bg-white/10' />
        <div className='h-28 animate-pulse rounded-3xl bg-white/10' />
        <div className='h-28 animate-pulse rounded-3xl bg-white/10' />
        <div className='h-40 animate-pulse rounded-3xl bg-white/10' />
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className='space-y-5'>
        <div className='rounded-3xl border border-red-500/20 bg-red-500/10 p-6 text-center text-red-200 backdrop-blur'>
          <div className='text-lg font-extrabold'>Có lỗi xảy ra</div>
          <p className='mt-2 text-sm'>{error || 'Không tìm thấy đơn hàng.'}</p>
        </div>

        <Link
          to='/user/orders'
          preventScrollReset
          className='inline-block text-sm font-semibold text-white/60 transition hover:text-white'
        >
          ← Quay lại danh sách đơn hàng
        </Link>
      </div>
    )
  }

  return (
    <div className='space-y-5'>
      <div className='flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between'>
        <div>
          <h1 className='text-2xl font-black text-white'>Chi tiết đơn hàng {order.code}</h1>
          <p className='mt-1 text-sm text-white/60'>Đặt lúc {order.createdAt}</p>
        </div>

        <span
          className={[
            'inline-flex w-fit rounded-full border px-4 py-2 text-sm font-extrabold',
            statusClass(order.status)
          ].join(' ')}
        >
          {order.statusLabel}
        </span>
      </div>

      <div className='grid gap-5 lg:grid-cols-[1.4fr_1fr]'>
        <div className='space-y-5'>
          <div className='rounded-3xl border border-white/10 bg-black/50 p-5 backdrop-blur-xl'>
            <div className='mb-4 text-base font-extrabold text-white'>Thông tin đơn hàng</div>

            <div className='grid gap-3 sm:grid-cols-2'>
              <div>
                <div className='text-xs text-white/45'>Mã đơn hàng</div>
                <div className='mt-1 text-sm font-semibold text-white'>{order.code}</div>
              </div>

              <div>
                <div className='text-xs text-white/45'>Phương thức thanh toán</div>
                <div className='mt-1 text-sm font-semibold text-white'>{order.paymentMethod}</div>
              </div>

              <div>
                <div className='text-xs text-white/45'>Trạng thái thanh toán</div>
                <div className='mt-1 text-sm font-semibold text-white'>{order.paymentStatusLabel}</div>
              </div>

              <div>
                <div className='text-xs text-white/45'>Mã phương thức giao hàng</div>
                <div className='mt-1 break-all text-sm font-semibold text-white'>{order.deliveryMethodId}</div>
              </div>

              <div>
                <div className='text-xs text-white/45'>Ngày tạo</div>
                <div className='mt-1 text-sm font-semibold text-white'>{order.createdAt}</div>
              </div>

              <div>
                <div className='text-xs text-white/45'>Cập nhật lần cuối</div>
                <div className='mt-1 text-sm font-semibold text-white'>{order.updatedAt}</div>
              </div>
            </div>
          </div>

          <div className='rounded-3xl border border-white/10 bg-black/50 p-5 backdrop-blur-xl'>
            <div className='mb-3 text-base font-extrabold text-white'>Thông tin nhận hàng</div>
            <div className='rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-4 text-sm text-white/60'>
              Backend hiện chưa trả tên người nhận, số điện thoại và địa chỉ cho đơn hàng này.
            </div>
          </div>

          <div className='rounded-3xl border border-white/10 bg-black/50 p-5 backdrop-blur-xl'>
            <div className='mb-3 text-base font-extrabold text-white'>Sản phẩm trong đơn</div>
            <div className='rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-4 text-sm text-white/60'>
              Backend hiện chưa trả danh sách sản phẩm của đơn hàng này.
            </div>
          </div>
        </div>

        <div className='space-y-5'>
          <div className='rounded-3xl border border-white/10 bg-black/60 p-5 backdrop-blur-xl lg:sticky lg:top-24'>
            <div className='mb-4 text-base font-extrabold text-white'>Tóm tắt thanh toán</div>

            <div className='space-y-3'>
              <div className='flex justify-between text-sm text-white/70'>
                <span>Tạm tính</span>
                <span className='font-semibold text-white'>{money(order.subtotal)}</span>
              </div>

              <div className='flex justify-between text-sm text-white/70'>
                <span>Phí vận chuyển</span>
                <span className='font-semibold text-white'>
                  {order.shippingFee === 0 ? 'Miễn phí' : money(order.shippingFee)}
                </span>
              </div>

              <div className='h-px bg-white/10' />

              <div className='flex justify-between'>
                <span className='text-white/70'>Tổng thanh toán</span>
                <span className='text-xl font-black text-orange-300'>{money(order.total)}</span>
              </div>
            </div>
          </div>

          {canCancel ? (
            <div className='rounded-3xl border border-rose-500/25 bg-rose-500/10 p-5'>
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
        </div>
      </div>

      <Link
        to='/user/orders'
        preventScrollReset
        className='inline-block text-sm font-semibold text-white/60 transition hover:text-white'
      >
        ← Quay lại danh sách đơn hàng
      </Link>
    </div>
  )
}
