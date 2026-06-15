import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { QRCode } from 'antd'
import {
  ArrowLeft,
  Check,
  CreditCard,
  ExternalLink,
  Headphones,
  MapPin,
  Package,
  RotateCcw,
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
import { getMomoPaymentUrlApi, getPaypalPaymentUrlApi } from '../../services/payment.services'
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

const panelClass = 'rounded-lg border border-[#eaded8] bg-white'

const TIMELINE_STEPS = [
  { label: 'Ordered', labelVi: 'Đã đặt' },
  { label: 'Confirmed', labelVi: 'Xác nhận' },
  { label: 'Shipping', labelVi: 'Đang giao' },
  { label: 'Delivered', labelVi: 'Đã giao' }
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
      return 'Thẻ tín dụng'
    case 'PAYPAL':
      return 'PayPal'
    case 'MOMO':
      return 'Ví MoMo'
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
    <section className={cn(panelClass, 'p-5 md:p-6')}>
      <h2 className='text-sm font-semibold text-[#3d3330]'>Tiến trình đơn hàng</h2>
      {isCancelled ? (
        <p className='mt-2 text-xs text-rose-700'>Đơn hàng đã được hủy và sẽ không tiếp tục giao.</p>
      ) : null}

      <ol className='mt-5 flex flex-col gap-4 md:flex-row md:items-start md:justify-between md:gap-2'>
        {TIMELINE_STEPS.map((step, index) => {
          const state = getTimelineStepState(rawStatus, index)
          const isLast = index === TIMELINE_STEPS.length - 1

          return (
            <li key={step.label} className='relative flex flex-1 md:flex-col md:items-center md:text-center'>
              {!isLast ? (
                <span
                  className={cn(
                    'absolute left-[15px] top-8 hidden h-px w-[calc(100%-2rem)] md:left-[calc(50%+1rem)] md:top-4 md:block md:h-0.5 md:w-[calc(100%-2rem)]',
                    state === 'done' ? 'bg-[#b07a72]' : 'bg-[#eaded8]'
                  )}
                  aria-hidden
                />
              ) : null}

              <div className='flex items-start gap-3 md:flex-col md:items-center md:gap-2'>
                <span
                  className={cn(
                    'relative z-10 grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 text-xs font-bold',
                    state === 'done' && 'border-[#b07a72] bg-[#b07a72] text-white',
                    state === 'current' && 'border-[#b07a72] bg-[#fdf8f6] text-[#b07a72]',
                    state === 'upcoming' && 'border-[#eaded8] bg-white text-[#a89890]',
                    state === 'cancelled' && 'border-rose-200 bg-rose-50 text-rose-400'
                  )}
                >
                  {state === 'done' ? <Check size={14} strokeWidth={3} /> : index + 1}
                </span>
                <div className='min-w-0 pt-0.5 md:pt-0'>
                  <p
                    className={cn(
                      'text-sm font-semibold',
                      state === 'cancelled' ? 'text-rose-400 line-through' : 'text-[#3d3330]'
                    )}
                  >
                    {step.labelVi}
                  </p>
                  <p className='text-[10px] uppercase tracking-wider text-[#a89890]'>{step.label}</p>
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
    <li className='flex gap-3 rounded-md border border-[#f0e4de] bg-[#fdf8f6] p-3'>
      <div className='aspect-[4/5] w-16 shrink-0 overflow-hidden rounded-md bg-[#f5ebe6] sm:w-20'>
        {image ? (
          <img src={image} alt='' className='h-full w-full object-cover' />
        ) : (
          <div className='flex h-full items-center justify-center text-[#cbb8af]'>
            <Package size={20} />
          </div>
        )}
      </div>
      <div className='min-w-0 flex-1'>
        <p className='line-clamp-2 text-sm font-semibold text-[#3d3330]'>{item.product?.name || 'Sản phẩm'}</p>
        {subtitle ? <p className='mt-0.5 text-xs text-[#8a7a74]'>{subtitle}</p> : null}
        <p className='mt-1 text-xs text-[#8a7a74]'>
          {money(item.price)} × {item.quantity}
        </p>
      </div>
      <p className='shrink-0 self-center text-sm font-bold text-[#3d3330]'>{money(item.price * item.quantity)}</p>
    </li>
  )
}

function DetailSkeleton() {
  return (
    <div className='mx-auto max-w-7xl px-4 py-8 md:px-6'>
      <div className='mb-6 h-5 w-40 animate-pulse rounded bg-[#eaded8]' />
      <div className='mb-6 space-y-2'>
        <div className='h-8 w-64 animate-pulse rounded bg-[#eaded8]' />
        <div className='h-4 w-40 animate-pulse rounded bg-[#f0e4de]' />
      </div>
      <div className='grid gap-6 lg:grid-cols-[1fr_340px]'>
        <div className='space-y-4'>
          <div className={cn(panelClass, 'h-28 animate-pulse bg-[#fdf8f6]')} />
          <div className={cn(panelClass, 'h-48 animate-pulse bg-[#fdf8f6]')} />
          <div className={cn(panelClass, 'h-36 animate-pulse bg-[#fdf8f6]')} />
        </div>
        <div className={cn(panelClass, 'h-64 animate-pulse bg-[#fdf8f6]')} />
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

  if (loading) {
    return <DetailSkeleton />
  }

  if (error || !order) {
    return (
      <div className='mx-auto max-w-4xl px-4 py-8 md:px-6'>
        <div className={cn(panelClass, 'space-y-5 p-6')}>
          <Alert variant='error' title='Có lỗi xảy ra' desc={error || 'Không tìm thấy đơn hàng.'} />
          <Link
            to={ROUTE_PATHS.USER_ORDERS}
            preventScrollReset
            className='inline-flex items-center gap-2 text-sm font-semibold text-[#8a7a74] hover:text-[#3d3330]'
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
    <div className='mx-auto max-w-7xl px-4 py-8 md:px-6'>
      <Link
        to={ROUTE_PATHS.USER_ORDERS}
        preventScrollReset
        className='mb-6 inline-flex items-center gap-2 text-sm font-semibold text-[#8a7a74] transition hover:text-[#3d3330]'
      >
        <ArrowLeft size={17} />
        Quay lại đơn hàng
      </Link>

      <header className='mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
        <div>
          <p className='text-xs font-semibold uppercase tracking-[0.14em] text-[#b07a72]'>Order detail</p>
          <h1 className='mt-1 text-2xl font-semibold tracking-tight text-[#3d3330] sm:text-3xl'>Đơn {order.code}</h1>
          <p className='mt-2 text-sm text-[#8a7a74]'>Đặt ngày {order.createdAt}</p>
        </div>
        <StatusBadge tone={order.status} className={ORDER_BADGE_CLASS[order.status]}>
          {order.statusLabel}
        </StatusBadge>
      </header>

      <div className='grid gap-6 lg:grid-cols-[1fr_340px] xl:grid-cols-[1fr_380px]'>
        <div className='space-y-5'>
          <OrderTimeline rawStatus={order.rawStatus} />

          <section className={cn(panelClass, 'p-5 md:p-6')}>
            <h2 className='text-sm font-semibold text-[#3d3330]'>Sản phẩm ({lineItems.length})</h2>
            {lineItems.length > 0 ? (
              <ul className='mt-4 space-y-3'>
                {lineItems.map((item) => (
                  <OrderLineRow key={item._id ?? `${item.product?.name}-${item.price}`} item={item} />
                ))}
              </ul>
            ) : (
              <p className='mt-4 text-sm text-[#8a7a74]'>Không có dữ liệu sản phẩm.</p>
            )}
          </section>

          <section className={cn(panelClass, 'p-5 md:p-6')}>
            <div className='mb-3 flex items-center gap-2'>
              <MapPin size={17} className='text-[#b07a72]' />
              <h2 className='text-sm font-semibold text-[#3d3330]'>Địa chỉ giao hàng</h2>
            </div>
            {order.shippingAddress ? (
              <div className='rounded-md border border-[#f0e4de] bg-[#fdf8f6] p-4 text-sm leading-6 text-[#6b5f59]'>
                <p>
                  <span className='font-semibold text-[#3d3330]'>{order.shippingAddress.recipient_name}</span>
                  {' · '}
                  {order.shippingAddress.phone}
                </p>
                <p className='mt-1'>{order.shippingAddress.address_line}</p>
                {(order.shippingAddress.district || order.shippingAddress.city) && (
                  <p>{[order.shippingAddress.district, order.shippingAddress.city].filter(Boolean).join(', ')}</p>
                )}
                {order.shippingAddress.note ? (
                  <p className='mt-2 text-[#8a7a74]'>
                    <span className='font-semibold text-[#3d3330]'>Ghi chú:</span> {order.shippingAddress.note}
                  </p>
                ) : null}
                {order.shippingAddress.distance_km != null ? (
                  <p className='mt-1 text-xs text-[#8a7a74]'>Khoảng cách: {order.shippingAddress.distance_km} km</p>
                ) : null}
                {order.shippingAddress.lat != null && order.shippingAddress.lng != null ? (
                  <a
                    href={`https://www.openstreetmap.org/?mlat=${order.shippingAddress.lat}&mlon=${order.shippingAddress.lng}#map=16/${order.shippingAddress.lat}/${order.shippingAddress.lng}`}
                    target='_blank'
                    rel='noreferrer'
                    className='mt-2 inline-flex text-xs font-semibold text-[#b07a72] hover:text-[#8f5f58]'
                  >
                    Xem trên bản đồ
                  </a>
                ) : null}
              </div>
            ) : (
              <p className='text-sm text-[#8a7a74]'>Chưa có thông tin địa chỉ giao hàng.</p>
            )}
          </section>

          <section className={cn(panelClass, 'p-5 md:p-6')}>
            <div className='mb-3 flex items-center gap-2'>
              <CreditCard size={17} className='text-[#b07a72]' />
              <h2 className='text-sm font-semibold text-[#3d3330]'>Thanh toán</h2>
            </div>
            <dl className='grid gap-3 sm:grid-cols-2'>
              <div className='rounded-md border border-[#f0e4de] bg-[#fdf8f6] p-3'>
                <dt className='text-xs text-[#8a7a74]'>Phương thức</dt>
                <dd className='mt-1 text-sm font-semibold text-[#3d3330]'>{order.paymentMethod}</dd>
              </div>
              <div className='rounded-md border border-[#f0e4de] bg-[#fdf8f6] p-3'>
                <dt className='text-xs text-[#8a7a74]'>Trạng thái</dt>
                <dd className='mt-1 text-sm font-semibold text-[#3d3330]'>{order.paymentStatusLabel}</dd>
              </div>
            </dl>
          </section>

          <section className={cn(panelClass, 'flex flex-col gap-2 p-4 sm:flex-row sm:flex-wrap')}>
            <a
              href='mailto:support@vibrantmart.local?subject=Hỗ trợ đơn hàng'
              className='inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-md border border-[#eaded8] px-4 text-sm font-semibold text-[#3d3330] hover:bg-[#fdf8f6] sm:min-w-[140px] sm:flex-none'
            >
              <Headphones size={16} />
              Liên hệ hỗ trợ
            </a>
            <Link
              to={ROUTE_PATHS.USER_HOME}
              className='inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-md border border-[#eaded8] px-4 text-sm font-semibold text-[#3d3330] hover:bg-[#fdf8f6] sm:min-w-[140px] sm:flex-none'
            >
              <RotateCcw size={16} />
              Mua thêm
            </Link>
            <Link
              to={ROUTE_PATHS.USER_HOME}
              className='inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-md bg-[#3d3330] px-4 text-sm font-semibold text-white hover:bg-[#2a2421] sm:min-w-[160px] sm:flex-none'
            >
              <ShoppingBag size={16} />
              Tiếp tục mua sắm
            </Link>
          </section>
        </div>

        <div className='space-y-5'>
          <aside className={cn(panelClass, 'h-fit p-5 lg:sticky lg:top-28')}>
            <h2 className='text-sm font-semibold text-[#3d3330]'>Tóm tắt đơn hàng</h2>

            <div className='mt-4 space-y-2 text-sm'>
              <div className='flex justify-between text-[#8a7a74]'>
                <span>Tạm tính</span>
                <span className='font-semibold text-[#3d3330]'>{money(order.subtotal)}</span>
              </div>
              <div className='flex justify-between text-[#8a7a74]'>
                <span>Phí vận chuyển</span>
                <span className='font-semibold text-[#3d3330]'>{money(order.shippingFee)}</span>
              </div>
            </div>

            <div className='my-4 h-px bg-[#f0e4de]' />

            <div className='flex justify-between gap-4'>
              <span className='text-sm text-[#8a7a74]'>Tổng thanh toán</span>
              <span className='text-xl font-bold text-[#3d3330]'>{money(order.total)}</span>
            </div>

            {(canPayMomo || canPayPaypal) && (
              <div className='mt-5 rounded-md border border-amber-200/90 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900'>
                Đơn hàng chưa thanh toán. Vui lòng hoàn tất thanh toán để cửa hàng xử lý đơn.
              </div>
            )}

            {canPayMomo && !momoPayment?.qrCodeUrl && (
              <Button
                full
                className='mt-5 !rounded-md !bg-[#3d3330] hover:!bg-[#2a2421]'
                onClick={handlePayment}
                loading={paying}
                disabled={paying}
              >
                Thanh toán qua MoMo
              </Button>
            )}

            {canPayPaypal && (
              <Button
                full
                className='mt-3 !rounded-md !bg-amber-500 hover:!bg-amber-600 text-white'
                onClick={handlePayPalPayment}
                loading={paying}
                disabled={paying}
              >
                Thanh toán qua PayPal
              </Button>
            )}

            {momoPayment?.qrCodeUrl && (
              <div className='mt-5 overflow-hidden rounded-lg border border-pink-200 bg-gradient-to-b from-pink-50 to-white'>
                <div className='border-b border-pink-100 px-4 py-3 text-center'>
                  <p className='text-xs font-semibold uppercase tracking-[0.12em] text-pink-600'>Thanh toán MoMo</p>
                  <p className='mt-1 text-lg font-bold text-[#3d3330]'>{money(order.total)}</p>
                  <p className='mt-0.5 text-xs text-[#8a7a74]'>Đơn {order.code}</p>
                </div>

                <div className='px-4 py-5 text-center'>
                  <div className='mx-auto inline-flex rounded-lg border border-[#eaded8] bg-white p-3'>
                    <QRCode value={momoPayment.qrCodeUrl} size={200} bordered={false} />
                  </div>
                  <p className='mt-4 text-sm font-semibold text-[#3d3330]'>Quét mã QR bằng ứng dụng MoMo</p>
                  <p className='mt-1 text-xs leading-5 text-[#8a7a74]'>
                    Mã có thời hạn ngắn. Sau khi thanh toán, trạng thái đơn sẽ được cập nhật tự động.
                  </p>

                  <div className='mt-4 grid gap-2'>
                    {momoPayment.deeplink && (
                      <a
                        href={momoPayment.deeplink}
                        className='inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[#a50064] px-4 text-sm font-semibold text-white transition hover:bg-[#8e0056]'
                      >
                        <Smartphone size={16} />
                        Mở ứng dụng MoMo
                      </a>
                    )}
                    {momoPayment.payUrl && (
                      <a
                        href={momoPayment.payUrl}
                        target='_blank'
                        rel='noreferrer'
                        className='inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[#eaded8] bg-white px-4 text-sm font-semibold text-[#3d3330] hover:bg-[#fdf8f6]'
                      >
                        <ExternalLink size={16} />
                        Thanh toán trên trình duyệt
                      </a>
                    )}
                  </div>

                  <Button full variant='outline' className='mt-3 !rounded-md' onClick={handlePayment} loading={paying} disabled={paying}>
                    Tạo mã QR mới
                  </Button>
                </div>
              </div>
            )}
          </aside>

          {canCancel ? (
            <div className='rounded-lg border border-rose-200 bg-rose-50 p-5'>
              <p className='mb-4 text-sm leading-6 text-rose-900'>
                Bạn chỉ có thể hủy đơn khi đơn hàng đang chờ xác nhận.
              </p>
              <Button variant='danger' full className='!rounded-md' onClick={handleCancelOrder} loading={cancelling} disabled={cancelling}>
                Hủy đơn hàng
              </Button>
            </div>
          ) : (
            <Alert variant='info' title='Không thể hủy đơn hàng' desc='Đơn hàng đã được xử lý hoặc đang giao, không thể hủy.' />
          )}
        </div>
      </div>
    </div>
  )
}
