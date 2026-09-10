import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { QRCode } from 'antd'
import {
  ArrowLeft,
  Check,
  CreditCard,
  Headphones,
  MapPin,
  Package,
  ShoppingBag,
  Smartphone
} from 'lucide-react'
import { toast } from 'sonner'
import Alert from '../../components/ui/Alert'
import Button from '../../components/ui/Button'
import StatusBadge from '../../components/ui/StatusBadge'
import { getOrderStatusMeta, mapPaymentStatus, ORDER_BADGE_CLASS, ORDER_STATUS_CODE } from '../../constants/order'
import type { OrderApiResponse, OrderUI, PaymentMethod } from '../../models/OrderRequests'
import { ROUTE_PATHS } from '../../routes/route.paths'
import { cancelOrderApi, getOrderByIdApi } from '../../services/orders.services'
import { getMomoPaymentUrlApi, getPaypalPaymentUrlApi, getPayosPaymentUrlApi } from '../../services/payment.services'
import formatDate from '../../utils/date'
import money from '../../utils/money'
import { getApiErrorMessage } from '../../utils/apiError'
import cn from '../../utils/cn'

type MomoPayment = {
  payUrl?: string
  qrCodeUrl?: string
  deeplink?: string
}

type OrderLineProduct = {
  name?: string
  thumbnail?: string
  origin?: string
  volume?: number
  medias?: { url: string }[]
}

type OrderLineItem = {
  _id?: string
  price: number
  quantity: number
  product?: OrderLineProduct
}

const panelClass = 'rounded-3xl border border-[#EFECE6] bg-white p-6 shadow-soft md:p-8'

const TIMELINE_STEPS = [
  { label: 'Ordered', labelVi: 'Đã Đặt Hàng' },
  { label: 'Confirmed', labelVi: 'Đã Xác Nhận' },
  { label: 'Shipping', labelVi: 'Đang Vận Chuyển' },
  { label: 'Delivered', labelVi: 'Giao Thành Công' }
] as const

type StepState = 'done' | 'current' | 'upcoming' | 'cancelled'

function getTimelineStepState(rawStatus: number, index: number): StepState {
  if (rawStatus === ORDER_STATUS_CODE.CANCELLED) {
    return index === 0 ? 'done' : 'cancelled'
  }
  if (rawStatus >= ORDER_STATUS_CODE.DELIVERED) return 'done'

  const activeIndex = rawStatus === 0 ? 1 : rawStatus === 1 ? 2 : rawStatus === 2 ? 3 : 3
  if (index < activeIndex) return 'done'
  if (index === activeIndex) return 'current'
  return 'upcoming'
}

function mapPaymentMethodLabel(method: PaymentMethod | string) {
  switch (method) {
    case 'CASH_ON_DELIVERY':
      return 'Thanh toán khi nhận hàng (COD)'
    case 'CREDIT_CARD':
      return 'Thẻ tín dụng / Visa'
    case 'PAYPAL':
      return 'PayPal'
    case 'MOMO':
      return 'Ví MoMo'
    case 'PAYOS':
      return 'Chuyển Khoản QR Code (PayOS)'
    default:
      return method ? String(method).replaceAll('_', ' ') : 'Không xác định'
  }
}

function createOrderCode(value: string) {
  return `#${value.slice(-6).toUpperCase()}`
}

function getProductImage(product?: OrderLineProduct) {
  if (product?.thumbnail) return product.thumbnail
  if (product?.medias?.[0]?.url) return product.medias[0].url
  return null
}

function productSubtitle(product?: OrderLineProduct) {
  const parts: string[] = []
  if (product?.origin) parts.push(product.origin)
  if (product?.volume != null) parts.push(`${product.volume}ml`)
  return parts.join(' · ')
}

function OrderTimeline({ rawStatus }: { rawStatus: number }) {
  const isCancelled = rawStatus === ORDER_STATUS_CODE.CANCELLED

  return (
    <section className={panelClass}>
      <h2 className='font-display text-base font-bold text-[#2B2118]'>Tiến Trình Xử Lý Đơn Hàng</h2>
      {isCancelled ? (
        <p className='mt-2 text-xs font-bold text-rose-600'>Đơn hàng đã được hủy và ngừng giao dịch.</p>
      ) : null}

      <ol className='mt-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between md:gap-2'>
        {TIMELINE_STEPS.map((step, index) => {
          const state = getTimelineStepState(rawStatus, index)
          const isLast = index === TIMELINE_STEPS.length - 1

          return (
            <li key={step.label} className='relative flex flex-1 md:flex-col md:items-center md:text-center'>
              {!isLast ? (
                <span
                  className={cn(
                    'absolute left-[15px] top-8 hidden h-px w-[calc(100%-2rem)] md:left-[calc(50%+1rem)] md:top-4 md:block md:h-0.5 md:w-[calc(100%-2rem)]',
                    state === 'done' ? 'bg-[#9A8069]' : 'bg-[#EFECE6]'
                  )}
                  aria-hidden
                />
              ) : null}

              <div className='flex items-start gap-3 md:flex-col md:items-center md:gap-2'>
                <span
                  className={cn(
                    'relative z-10 grid h-9 w-9 shrink-0 place-items-center rounded-full border-2 text-xs font-bold transition-all',
                    state === 'done' && 'border-[#9A8069] bg-[#2B2118] text-[#FAF7F2] shadow-sm',
                    state === 'current' && 'border-[#9A8069] bg-[#FAF7F2] text-[#9A8069]',
                    state === 'upcoming' && 'border-[#EFECE6] bg-white text-[#8C7D70]',
                    state === 'cancelled' && 'border-rose-200 bg-rose-50 text-rose-400'
                  )}
                >
                  {state === 'done' ? <Check size={14} strokeWidth={3} /> : index + 1}
                </span>
                <div className='min-w-0 pt-0.5 md:pt-0'>
                  <p
                    className={cn(
                      'font-display text-xs font-bold',
                      state === 'cancelled' ? 'text-rose-400 line-through' : 'text-[#2B2118]'
                    )}
                  >
                    {step.labelVi}
                  </p>
                  <p className='text-[10px] uppercase tracking-wider text-[#8C7D70]'>{step.label}</p>
                </div>
              </div>
            </li>
          )
        })}
      </ol>
    </section>
  )
}

function OrderLineRow({ item }: { item: OrderLineItem }) {
  const image = getProductImage(item.product)
  const subtitle = productSubtitle(item.product)

  return (
    <li className='flex gap-3.5 rounded-2xl border border-[#EFECE6] bg-[#FAF7F2] p-4'>
      <div className='aspect-square w-16 shrink-0 overflow-hidden rounded-xl bg-white border border-[#EFECE6] sm:w-20'>
        {image ? (
          <img src={image} alt='' className='h-full w-full object-cover' />
        ) : (
          <div className='flex h-full items-center justify-center text-[#8C7D70]'>
            <Package size={20} />
          </div>
        )}
      </div>
      <div className='min-w-0 flex-1'>
        <p className='line-clamp-2 font-display text-xs font-bold text-[#2B2118]'>{item.product?.name || 'Sản phẩm'}</p>
        {subtitle ? <p className='mt-0.5 text-xs text-[#8C7D70]'>{subtitle}</p> : null}
        <p className='mt-1 text-xs text-[#8C7D70]'>
          {money(item.price)} × {item.quantity}
        </p>
      </div>
      <p className='shrink-0 self-center text-sm font-extrabold text-[#C47A5A]'>{money(item.price * item.quantity)}</p>
    </li>
  )
}

function DetailSkeleton() {
  return (
    <div className='mx-auto max-w-7xl px-4 py-8 md:px-6 bg-[#FAF7F2] min-h-screen'>
      <div className='mb-6 h-5 w-40 animate-pulse rounded bg-[#EFECE6]' />
      <div className='mb-6 space-y-2'>
        <div className='h-8 w-64 animate-pulse rounded bg-[#EFECE6]' />
        <div className='h-4 w-40 animate-pulse rounded bg-[#EFECE6]' />
      </div>
      <div className='grid gap-6 lg:grid-cols-[1fr_340px]'>
        <div className='space-y-4'>
          <div className={cn(panelClass, 'h-28 animate-pulse bg-white')} />
          <div className={cn(panelClass, 'h-48 animate-pulse bg-white')} />
          <div className={cn(panelClass, 'h-36 animate-pulse bg-white')} />
        </div>
        <div className={cn(panelClass, 'h-64 animate-pulse bg-white')} />
      </div>
    </div>
  )
}

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [order, setOrder] = useState<OrderUI | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [paying, setPaying] = useState(false)
  const [cancelling, setCancelling] = useState(false)
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
        toast.success('Đã tạo mã QR MoMo.')
        return
      }
      if (payUrl) {
        toast.success('Đang mở trang thanh toán MoMo...')
        window.location.href = payUrl
      } else {
        toast.error('Không thể tạo mã QR thanh toán.')
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Có lỗi xảy ra khi tạo thanh toán.'))
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
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Có lỗi xảy ra khi tạo thanh toán PayPal.'))
    } finally {
      setPaying(false)
    }
  }

  const handlePayosPayment = async () => {
    if (!order?.id) return
    try {
      setPaying(true)
      const res = await getPayosPaymentUrlApi(order.id)
      const payosResult = res.data?.result || res.data?.data || res.data
      const payUrl = payosResult?.payUrl
      if (payUrl) {
        toast.success('Đang chuyển hướng tới cổng thanh toán PayOS...')
        window.location.href = payUrl
      } else {
        toast.error('Không thể tạo liên kết thanh toán PayOS.')
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Có lỗi xảy ra khi tạo thanh toán PayOS.'))
    } finally {
      setPaying(false)
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
        const statusInfo = getOrderStatusMeta(rawOrder.status)

        const mappedOrder: OrderUI = {
          id: rawOrder._id,
          code: createOrderCode(rawOrder._id),
          status: statusInfo.tone,
          statusLabel: statusInfo.label,
          rawStatus: rawOrder.status,
          subtotal: rawOrder.total_price - rawOrder.shipping_fee,
          shippingFee: rawOrder.shipping_fee,
          shippingAddress: rawOrder.shipping_address,
          total: rawOrder.total_price,
          items: rawOrder.items || [],
          paymentMethod: mapPaymentMethodLabel(rawOrder.payment_method),
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

  const canCancel = useMemo(() => order?.rawStatus === ORDER_STATUS_CODE.PENDING, [order])

  const handleCancelOrder = async () => {
    if (!order?.id) return
    const confirmed = window.confirm('Bạn có chắc muốn hủy đơn hàng này? Hành động không thể hoàn tác.')
    if (!confirmed) return
    try {
      setCancelling(true)
      await cancelOrderApi(order.id)
      toast.success('Đã hủy đơn hàng.')
      navigate(ROUTE_PATHS.USER_ORDERS)
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Không thể hủy đơn hàng. Vui lòng thử lại.'))
    } finally {
      setCancelling(false)
    }
  }

  const canPayMomo = useMemo(
    () =>
      order?.rawStatus === ORDER_STATUS_CODE.PENDING &&
      order?.rawPaymentStatus === 0 &&
      (order?.rawPaymentMethod === 'MOMO' || order?.rawPaymentMethod === '2'),
    [order]
  )

  const canPayPaypal = useMemo(
    () =>
      order?.rawStatus === ORDER_STATUS_CODE.PENDING &&
      order?.rawPaymentStatus === 0 &&
      (order?.rawPaymentMethod === 'PAYPAL' || order?.rawPaymentMethod === '1'),
    [order]
  )

  const canPayPayos = useMemo(
    () =>
      order?.rawStatus === ORDER_STATUS_CODE.PENDING &&
      order?.rawPaymentStatus === 0 &&
      order?.rawPaymentMethod === 'PAYOS',
    [order]
  )

  if (loading) {
    return <DetailSkeleton />
  }

  if (error || !order) {
    return (
      <div className='mx-auto max-w-4xl px-4 py-8 md:px-6 bg-[#FAF7F2] min-h-screen'>
        <div className={cn(panelClass, 'space-y-5 p-6')}>
          <Alert variant='error' title='Có lỗi xảy ra' desc={error || 'Không tìm thấy đơn hàng.'} />
          <Link
            to={ROUTE_PATHS.USER_ORDERS}
            preventScrollReset
            className='inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#8C7D70] hover:text-[#2B2118]'
          >
            <ArrowLeft size={16} />
            Quay lại danh sách đơn hàng
          </Link>
        </div>
      </div>
    )
  }

  const lineItems = order.items as OrderLineItem[]

  return (
    <div className='mx-auto max-w-7xl px-4 py-8 md:px-6 bg-[#FAF7F2] text-[#2B2118] min-h-screen'>
      <Link
        to={ROUTE_PATHS.USER_ORDERS}
        preventScrollReset
        className='mb-6 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#8C7D70] transition hover:text-[#2B2118]'
      >
        <ArrowLeft size={17} />
        Quay lại đơn hàng của tôi
      </Link>

      <header className='mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
        <div>
          <p className='text-xs font-bold uppercase tracking-[0.2em] text-[#9A8069]'>Chi Tiết Đơn Hàng Mua Sắm</p>
          <h1 className='mt-1 font-display text-2xl font-extrabold tracking-tight text-[#2B2118] sm:text-3xl'>Đơn hàng {order.code}</h1>
          <p className='mt-1 text-xs text-[#8C7D70]'>Khởi tạo ngày {order.createdAt}</p>
        </div>
        <StatusBadge tone={order.status} className={ORDER_BADGE_CLASS[order.status]}>
          {order.statusLabel}
        </StatusBadge>
      </header>

      <div className='grid gap-6 lg:grid-cols-[1fr_340px] xl:grid-cols-[1fr_380px]'>
        <div className='space-y-6'>
          <OrderTimeline rawStatus={order.rawStatus} />

          <section className={panelClass}>
            <h2 className='font-display text-base font-bold text-[#2B2118] mb-4'>Danh Sách Sản Phẩm ({lineItems.length})</h2>
            {lineItems.length > 0 ? (
              <ul className='space-y-3'>
                {lineItems.map((item) => (
                  <OrderLineRow key={item._id ?? `${item.product?.name}-${item.price}`} item={item} />
                ))}
              </ul>
            ) : (
              <p className='text-xs text-[#8C7D70]'>Không có dữ liệu chi tiết sản phẩm.</p>
            )}
          </section>

          <section className={panelClass}>
            <div className='mb-3 flex items-center gap-2'>
              <MapPin size={18} className='text-[#9A8069]' />
              <h2 className='font-display text-base font-bold text-[#2B2118]'>Địa Chỉ Nhận Hàng</h2>
            </div>
            {order.shippingAddress ? (
              <div className='rounded-2xl border border-[#EFECE6] bg-[#FAF7F2] p-4 text-xs leading-relaxed text-[#594D42]'>
                <p>
                  <span className='font-bold text-[#2B2118]'>{order.shippingAddress.recipient_name}</span>
                  {' · '}
                  <span className='font-mono font-bold'>{order.shippingAddress.phone}</span>
                </p>
                <p className='mt-1'>{order.shippingAddress.address_line}</p>
                {(order.shippingAddress.district || order.shippingAddress.city) && (
                  <p>{[order.shippingAddress.district, order.shippingAddress.city].filter(Boolean).join(', ')}</p>
                )}
                {order.shippingAddress.note ? (
                  <p className='mt-2 text-[#8C7D70]'>
                    <span className='font-bold text-[#2B2118]'>Ghi chú shipper:</span> {order.shippingAddress.note}
                  </p>
                ) : null}
              </div>
            ) : (
              <p className='text-xs text-[#8C7D70]'>Chưa có thông tin địa chỉ giao hàng.</p>
            )}
          </section>

          <section className={panelClass}>
            <div className='mb-3 flex items-center gap-2'>
              <CreditCard size={18} className='text-[#9A8069]' />
              <h2 className='font-display text-base font-bold text-[#2B2118]'>Hình Thức Thanh Toán</h2>
            </div>
            <dl className='grid gap-3 sm:grid-cols-2'>
              <div className='rounded-2xl border border-[#EFECE6] bg-[#FAF7F2] p-3.5'>
                <dt className='text-[10px] font-bold uppercase tracking-wider text-[#8C7D70]'>Phương Thức</dt>
                <dd className='mt-1 text-xs font-bold text-[#2B2118]'>{order.paymentMethod}</dd>
              </div>
              <div className='rounded-2xl border border-[#EFECE6] bg-[#FAF7F2] p-3.5'>
                <dt className='text-[10px] font-bold uppercase tracking-wider text-[#8C7D70]'>Trạng Thái Thanh Toán</dt>
                <dd className='mt-1 text-xs font-bold text-[#2B2118]'>{order.paymentStatusLabel}</dd>
              </div>
            </dl>
          </section>

          <section className={cn(panelClass, 'flex flex-col gap-3 sm:flex-row sm:flex-wrap')}>
            <a
              href='mailto:support@vibrantmart.com?subject=Hỗ trợ đơn hàng'
              className='inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full border border-[#EFECE6] bg-white px-5 text-xs font-bold text-[#2B2118] hover:bg-[#FAF7F2] sm:min-w-[150px] sm:flex-none'
            >
              <Headphones size={16} />
              Liên Hệ Hỗ Trợ
            </a>
            <Link
              to={ROUTE_PATHS.USER_HOME}
              className='inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-[#2B2118] px-6 text-xs font-bold uppercase tracking-widest text-white hover:bg-[#9A8069] transition-colors sm:min-w-[180px] sm:flex-none'
            >
              <ShoppingBag size={16} />
              Tiếp Tục Mua Sắm
            </Link>
          </section>
        </div>

        <div className='space-y-6'>
          <aside className={cn(panelClass, 'h-fit p-6 lg:sticky lg:top-28')}>
            <h2 className='font-display text-base font-bold text-[#2B2118] border-b border-[#EFECE6] pb-3'>Tóm Tắt Thanh Toán</h2>

            <div className='mt-4 space-y-2 text-xs font-medium text-[#594D42]'>
              <div className='flex justify-between'>
                <span>Tạm tính</span>
                <span className='font-bold text-[#2B2118]'>{money(order.subtotal)}</span>
              </div>
              <div className='flex justify-between'>
                <span>Cước vận chuyển</span>
                <span className='font-bold text-[#9A8069]'>{money(order.shippingFee)}</span>
              </div>
            </div>

            <div className='my-4 h-px bg-[#EFECE6]' />

            <div className='flex justify-between items-end gap-4'>
              <span className='text-xs font-bold uppercase tracking-wider text-[#8C7D70]'>Tổng Giá Trị Đơn</span>
              <span className='text-2xl font-extrabold text-[#C47A5A]'>{money(order.total)}</span>
            </div>

            {(canPayMomo || canPayPaypal || canPayPayos) && (
              <div className='mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs leading-relaxed text-amber-900 font-semibold'>
                ⚡ Đơn hàng chưa hoàn tất thanh toán. Vui lòng nhấn nút bên dưới để thanh toán tức thì qua cổng PayOS / QR Code.
              </div>
            )}

            {canPayPayos && (
              <Button
                full
                className='mt-4 !rounded-full !bg-[#2B2118] !py-3.5 !text-xs !font-bold !uppercase !tracking-widest !text-[#FAF7F2] shadow-md hover:!bg-[#9A8069] transition-all'
                onClick={handlePayosPayment}
                loading={paying}
                disabled={paying}
              >
                Thanh Toán Ngay Qua PayOS
              </Button>
            )}

            {canPayMomo && !momoPayment?.qrCodeUrl && (
              <Button
                full
                className='mt-3 !rounded-full !bg-[#A50064] hover:!bg-[#8E0056] text-white !py-3.5 !text-xs !font-bold !uppercase'
                onClick={handlePayment}
                loading={paying}
                disabled={paying}
              >
                Thanh Toán Qua MoMo
              </Button>
            )}

            {canPayPaypal && (
              <Button
                full
                className='mt-3 !rounded-full !bg-amber-500 hover:!bg-amber-600 text-white !py-3.5 !text-xs !font-bold !uppercase'
                onClick={handlePayPalPayment}
                loading={paying}
                disabled={paying}
              >
                Thanh Toán Qua PayPal
              </Button>
            )}

            {momoPayment?.qrCodeUrl && (
              <div className='mt-5 overflow-hidden rounded-2xl border border-pink-200 bg-gradient-to-b from-pink-50 to-white p-4 text-center'>
                <p className='text-xs font-bold uppercase tracking-wider text-pink-600'>Quét Mã QR MoMo</p>
                <p className='mt-1 font-mono text-xl font-extrabold text-[#2B2118]'>{money(order.total)}</p>
                <div className='mt-3 mx-auto inline-flex rounded-2xl border border-[#EFECE6] bg-white p-3 shadow-xs'>
                  <QRCode value={momoPayment.qrCodeUrl} size={180} bordered={false} />
                </div>
                <div className='mt-3 grid gap-2'>
                  {momoPayment.deeplink && (
                    <a
                      href={momoPayment.deeplink}
                      className='inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-[#A50064] px-4 text-xs font-bold text-white shadow-sm'
                    >
                      <Smartphone size={15} /> Mở App MoMo
                    </a>
                  )}
                </div>
              </div>
            )}
          </aside>

          {canCancel ? (
            <div className='rounded-3xl border border-rose-200 bg-rose-50 p-6 shadow-xs'>
              <p className='mb-4 text-xs leading-relaxed font-semibold text-rose-900'>
                Bạn có thể tự hủy đơn khi trạng thái vẫn đang chờ xác nhận.
              </p>
              <Button variant='danger' full className='!rounded-full !py-3 !text-xs !font-bold !uppercase' onClick={handleCancelOrder} loading={cancelling} disabled={cancelling}>
                Hủy Đơn Hàng Này
              </Button>
            </div>
          ) : (
            <Alert variant='info' title='Đơn hàng đang xử lý' desc='Đơn hàng đã qua bước xác nhận nên không thể hủy trực tuyến.' />
          )}
        </div>
      </div>
    </div>
  )
}
