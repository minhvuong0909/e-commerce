import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { QRCode } from 'antd'
import { ArrowLeft, CalendarClock, CreditCard, ExternalLink, MapPin, ReceiptText, Smartphone } from 'lucide-react'
import { toast } from 'sonner'
import Alert from '../../components/ui/Alert'
import Button from '../../components/ui/Button'
import StatusBadge from '../../components/ui/StatusBadge'
import type { OrderStatus } from '../../constants/order'
import type { OrderApiResponse, OrderUI, PaymentMethod } from '../../models/OrderRequests'
import { ROUTE_PATHS } from '../../routes/route.paths'
import { getOrderByIdApi } from '../../services/orders.services'
import {
  getMomoPaymentUrlApi,
  getPaypalPaymentUrlApi,
} from '../../services/payment.services'
import formatDate from '../../utils/date'
import money from '../../utils/money'

type MomoPayment = {
  payUrl?: string
  qrCodeUrl?: string
  deeplink?: string
}

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [order, setOrder] = useState<OrderUI | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [paying, setPaying] = useState(false)
  const [mocking] = useState(false)
  const [momoPayment, setMomoPayment] = useState<MomoPayment | null>(null)


  const handlePayment = async () => {
    if (!order?.id) return
    try {
      setPaying(true)
      setMomoPayment(null)
      const res = await getMomoPaymentUrlApi(order.id)
      const momoResult = res.data?.result || res.data?.data || res.data
      const payUrl = momoResult?.payUrl
      const qrCodeUrl = momoResult?.qrCodeUrl
      const deeplink = momoResult?.deeplink
      if (qrCodeUrl) {
        setMomoPayment({ payUrl, qrCodeUrl, deeplink })
        toast.success('Đã tạo mã QR MoMo sandbox.')
        return
      }
      if (payUrl) {
        toast.success('Đang mở trang thanh toán MoMo...')
        window.location.href = payUrl
      } else {
        toast.error('Không thể tạo mã QR thanh toán.')
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Có lỗi xảy ra khi tạo thanh toán.'
      toast.error(errMsg)
      console.error(err)
    } finally {
      setPaying(false)
    }
  }

  const handlePayPalPayment = async () => {
    if (!order?.id) return
    try {
      setPaying(true)
      const res = await getPaypalPaymentUrlApi(order.id)
      const paypalResult = res.data?.result || res.data?.data || res.data
      const payUrl = paypalResult?.payUrl
      if (payUrl) {
        toast.success('Đang mở trang thanh toán PayPal...')
        window.location.href = payUrl
      } else {
        toast.error('Không thể tạo liên kết thanh toán PayPal.')
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Có lỗi xảy ra khi tạo thanh toán PayPal.'
      toast.error(errMsg)
      console.error(err)
    } finally {
      setPaying(false)
    }
  }

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

        setMomoPayment(null)
        const statusInfo = mapStatus(rawOrder.status)

        const mappedOrder: OrderUI = {
          id: rawOrder._id,
          code: createOrderCode(rawOrder._id),
          status: statusInfo.status,
          statusLabel: statusInfo.statusLabel,
          subtotal: rawOrder.total_price - rawOrder.shipping_fee,
          shippingFee: rawOrder.shipping_fee,
          total: rawOrder.total_price,
          items: rawOrder.items || [],
          paymentMethod: mapPaymentMethod(rawOrder.payment_method),
          rawPaymentMethod: String(rawOrder.payment_method),
          rawPaymentStatus: rawOrder.payment_status,
          createdAt: formatDate(rawOrder.created_at),
          updatedAt: formatDate(rawOrder.updated_at),
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

  const canPayMomo = useMemo(
    () =>
      order?.status === 'shipping' &&
      order?.rawPaymentStatus === 0 &&
      (order?.rawPaymentMethod === 'MOMO' || order?.rawPaymentMethod === '2'),
    [order]
  )

  const canPayPaypal = useMemo(
    () =>
      order?.status === 'shipping' &&
      order?.rawPaymentStatus === 0 &&
      (order?.rawPaymentMethod === 'PAYPAL' || order?.rawPaymentMethod === '1'),
    [order]
  )

  if (loading) {
    return (
      <div className='mx-auto max-w-7xl px-4 py-8 md:px-6'>
        <div className='space-y-4'>
          <div className='h-8 w-56 animate-pulse rounded bg-slate-200' />
          <div className='h-28 animate-pulse rounded-3xl bg-white shadow-sm' />
          <div className='h-28 animate-pulse rounded-3xl bg-white shadow-sm' />
          <div className='h-40 animate-pulse rounded-3xl bg-white shadow-sm' />
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className='mx-auto max-w-4xl px-4 py-8 md:px-6'>
        <div className='space-y-5'>
          <Alert variant='error' title='Có lỗi xảy ra' desc={error || 'Không tìm thấy đơn hàng.'} />

          <Link
            to={ROUTE_PATHS.USER_ORDERS}
            preventScrollReset
            className='inline-flex items-center gap-2 text-sm font-bold text-slate-500 transition hover:text-ink-950'
          >
            <ArrowLeft size={16} />
            Quay lại danh sách đơn hàng
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className='mx-auto max-w-7xl px-4 py-8 md:px-6'>
      <Link
        to={ROUTE_PATHS.USER_ORDERS}
        preventScrollReset
        className='mb-6 inline-flex items-center gap-2 text-sm font-black text-slate-500 transition hover:text-ink-950'
      >
        <ArrowLeft size={17} />
        Quay lại danh sách đơn hàng
      </Link>

      <div className='mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between'>
        <div>
          <p className='text-xs font-black uppercase tracking-[0.18em] text-brand-600'>Order detail</p>
          <h1 className='mt-1 text-3xl font-black tracking-tight text-ink-950'>Chi tiết đơn hàng {order.code}</h1>
          <p className='mt-2 text-sm text-slate-500'>Đặt lúc {order.createdAt}</p>
        </div>

        <StatusBadge tone={order.status} className='mt-1'>
          {order.statusLabel}
        </StatusBadge>
      </div>

      <div className='grid gap-6 lg:grid-cols-[1.45fr_0.9fr]'>
        <div className='space-y-6'>
          <section className='surface-card rounded-3xl p-5 md:p-6'>
            <div className='mb-5 flex items-center gap-3'>
              <span className='grid h-10 w-10 place-items-center rounded-2xl bg-slate-100 text-ink-950'>
                <ReceiptText size={18} />
              </span>
              <h2 className='text-lg font-black text-ink-950'>Thông tin đơn hàng</h2>
            </div>

            <div className='grid gap-4 sm:grid-cols-2'>
              <InfoItem label='Mã đơn hàng' value={order.code} />
              <InfoItem label='Phương thức thanh toán' value={order.paymentMethod} />
              <InfoItem label='Trạng thái thanh toán' value={order.paymentStatusLabel || 'Không xác định'} />
              <InfoItem label='Mã phương thức giao hàng' value={order.deliveryMethodId || 'Không xác định'} />
              <InfoItem label='Ngày tạo' value={order.createdAt || ''} />
              <InfoItem label='Cập nhật lần cuối' value={order.updatedAt || ''} />
            </div>
          </section>

          <section className='surface-card rounded-3xl p-5 md:p-6'>
            <div className='mb-4 flex items-center gap-3'>
              <span className='grid h-10 w-10 place-items-center rounded-2xl bg-brand-50 text-brand-700'>
                <MapPin size={18} />
              </span>
              <h2 className='text-lg font-black text-ink-950'>Thông tin nhận hàng</h2>
            </div>
            <div className='rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-500'>
              Backend hiện chưa trả tên người nhận, số điện thoại và địa chỉ cho đơn hàng này.
            </div>
          </section>

          <section className='surface-card rounded-3xl p-5 md:p-6'>
            <div className='mb-4 flex items-center gap-3'>
              <span className='grid h-10 w-10 place-items-center rounded-2xl bg-slate-100 text-ink-950'>
                <CalendarClock size={18} />
              </span>
              <h2 className='text-lg font-black text-ink-950'>Sản phẩm trong đơn</h2>
            </div>
            <div className='rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-500'>
              {order.items?.length > 0 ? (
                <ul className='list-inside list-disc space-y-1'>
                  {order.items.map((item: any) => (
                    <li key={item._id}>
                      <span className='font-bold text-ink-950'>{item.product?.name || 'Sản phẩm'}</span>
                      <span className='text-slate-500'> (x{item.quantity})</span>
                    </li>
                  ))}
                </ul>
              ) : (
                'Không có dữ liệu sản phẩm.'
              )}
            </div>
          </section>
        </div>

        <div className='space-y-6'>
          <aside className='surface-strong rounded-3xl p-5 lg:sticky lg:top-28'>
            <div className='mb-5 flex items-center gap-3'>
              <span className='grid h-10 w-10 place-items-center rounded-2xl bg-slate-100 text-ink-950'>
                <CreditCard size={18} />
              </span>
              <h2 className='text-lg font-black text-ink-950'>Tóm tắt thanh toán</h2>
            </div>

            <div className='space-y-3'>
              <div className='flex justify-between text-sm text-slate-500'>
                <span>Tạm tính</span>
                <span className='font-bold text-ink-950'>{money(order.subtotal)}</span>
              </div>

              <div className='flex justify-between text-sm text-slate-500'>
                <span>Phí vận chuyển</span>
                <span className='font-bold text-ink-950'>
                  {order.shippingFee === 0 ? 'Miễn phí' : money(order.shippingFee)}
                </span>
              </div>

              <div className='h-px bg-slate-200' />

              <div className='flex justify-between gap-4'>
                <span className='text-sm font-bold text-slate-500'>Tổng thanh toán</span>
                <span className='text-xl font-black text-ink-950'>{money(order.total)}</span>
              </div>
            </div>

            {canPayMomo && (
              <Button full className='mt-6' onClick={handlePayment} loading={paying} disabled={paying || mocking}>
                Thanh toán qua MoMo
              </Button>
            )}

            {canPayPaypal && (
              <Button
                full
                className='mt-6 !bg-amber-500 hover:!bg-amber-600 text-white'
                onClick={handlePayPalPayment}
                loading={paying}
                disabled={paying || mocking}
              >
                Thanh toán qua PayPal
              </Button>
            )}

            {/* {(canPayMomo || canPayPaypal) && (
              <Button
                full
                variant='secondary'
                className='mt-3'
                onClick={handleMockPayment}
                loading={mocking}
                disabled={paying || mocking}
              >
                Giả lập thanh toán thành công (Test Free)
              </Button>
            )} */}

            {momoPayment?.qrCodeUrl && (
              <div className='mt-4 rounded-2xl border border-slate-200 bg-white p-4 text-center'>
                <div className='mx-auto inline-flex rounded-xl bg-white p-2 shadow-sm'>
                  <QRCode value={momoPayment.qrCodeUrl} size={220} bordered={false} />
                </div>
                <p className='mt-3 text-sm font-black text-ink-950'>Quét mã bằng MoMo Test app</p>
                <p className='mt-1 text-xs leading-5 text-slate-500'>
                  QR sandbox cho đơn {order.code}. Nếu app báo hết hạn, bấm thanh toán để tạo mã mới.
                </p>

                <div className='mt-4 grid gap-2'>
                  {momoPayment.deeplink && (
                    <a
                      href={momoPayment.deeplink}
                      className='inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-ink-950 px-4 text-sm font-bold text-white transition hover:bg-brand-600'
                    >
                      <Smartphone size={16} />
                      Mở app MoMo
                    </a>
                  )}
                  {momoPayment.payUrl && (
                    <a
                      href={momoPayment.payUrl}
                      target='_blank'
                      rel='noreferrer'
                      className='inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold text-ink-950 transition hover:border-slate-300 hover:bg-slate-50'
                    >
                      <ExternalLink size={16} />
                      Mở trang thanh toán
                    </a>
                  )}
                </div>
              </div>
            )}
          </aside>

          {canCancel ? (
            <div className='rounded-3xl border border-rose-200 bg-rose-50 p-5'>
              <p className='mb-4 text-sm leading-6 text-rose-900'>
                Bạn chỉ có thể hủy đơn khi đơn hàng đang ở trạng thái xử lý.
              </p>
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
    </div>
  )
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className='rounded-2xl border border-slate-200 bg-slate-50 p-4'>
      <div className='text-xs font-bold uppercase tracking-[0.12em] text-slate-400'>{label}</div>
      <div className='mt-2 break-words text-sm font-black text-ink-950'>{value}</div>
    </div>
  )
}
