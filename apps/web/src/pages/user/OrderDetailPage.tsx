import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { QRCode } from 'antd'
import { ArrowLeft, Check, ClipboardCheck, MapPin, Package, PackageCheck, ShoppingBag, Smartphone, Truck, Wallet, X } from 'lucide-react'
import { toast } from 'sonner'
import Alert from '../../components/ui/Alert'
import Button from '../../components/ui/Button'
import StatusBadge from '../../components/ui/StatusBadge'
import { getOrderStatusMeta, mapPaymentStatus, ORDER_STATUS_CODE } from '../../constants/order'
import type { OrderApiResponse, OrderUI, PaymentMethod } from '../../models/OrderRequests'
import { ROUTE_PATHS } from '../../routes/route.paths'
import { cancelOrderApi, getOrderByIdApi } from '../../services/orders.services'
import { getMomoPaymentUrlApi, getPaypalPaymentUrlApi, getPayosPaymentUrlApi } from '../../services/payment.services'
import formatDate from '../../utils/date'
import money from '../../utils/money'
import { getApiErrorMessage } from '../../utils/apiError'
import { formatImageUrl } from '../../utils/formatImageUrl'
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

const card = 'rounded-4xl bg-white p-5 ring-1 ring-ink-100 sm:p-7'

const TIMELINE_STEPS = [
  { label: 'Đã đặt', icon: ClipboardCheck },
  { label: 'Đã xác nhận', icon: PackageCheck },
  { label: 'Đang giao', icon: Truck },
  { label: 'Đã nhận', icon: Check }
] as const

type StepState = 'done' | 'current' | 'upcoming' | 'cancelled'

function getTimelineStepState(rawStatus: number, index: number): StepState {
  if (rawStatus === ORDER_STATUS_CODE.CANCELLED) return index === 0 ? 'done' : 'cancelled'
  if (rawStatus >= ORDER_STATUS_CODE.DELIVERED) return 'done'
  const activeIndex = rawStatus === 0 ? 1 : rawStatus === 1 ? 2 : 3
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
    case 'PAYOS':
      return 'Chuyển khoản QR (PayOS)'
    default:
      return method ? String(method).replaceAll('_', ' ') : 'Không xác định'
  }
}

function createOrderCode(value: string) {
  return `#${value.slice(-6).toUpperCase()}`
}

function getProductImage(product?: OrderLineProduct) {
  return formatImageUrl(product?.thumbnail || product?.medias?.[0]?.url) || null
}

function OrderTimeline({ rawStatus }: { rawStatus: number }) {
  const isCancelled = rawStatus === ORDER_STATUS_CODE.CANCELLED
  return (
    <section className={card} aria-label='Tiến trình đơn hàng'>
      {isCancelled ? (
        <div className='mb-5 flex items-center gap-2 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700'>
          <X size={16} aria-hidden /> Đơn hàng đã bị hủy.
        </div>
      ) : null}
      <ol className='grid grid-cols-4 gap-2'>
        {TIMELINE_STEPS.map((step, index) => {
          const state = getTimelineStepState(rawStatus, index)
          const Icon = step.icon
          return (
            <li key={step.label} className='relative flex flex-col items-center text-center'>
              {index < TIMELINE_STEPS.length - 1 ? (
                <span
                  aria-hidden
                  className={cn(
                    'absolute left-[calc(50%+1.75rem)] right-[calc(-50%+1.75rem)] top-6 h-[3px] rounded-full',
                    state === 'done' ? 'bg-ink-950' : 'bg-ink-100'
                  )}
                />
              ) : null}
              <span
                className={cn(
                  'relative z-10 grid h-12 w-12 place-items-center rounded-2xl transition',
                  state === 'done' && 'bg-ink-950 text-lime-300',
                  state === 'current' && 'bg-berry-100 text-berry-700 ring-4 ring-berry-50',
                  state === 'upcoming' && 'bg-ink-50 text-ink-400',
                  state === 'cancelled' && 'bg-ink-50 text-ink-300'
                )}
              >
                <Icon size={20} aria-hidden />
              </span>
              <span
                className={cn(
                  'mt-2 text-xs font-semibold sm:text-sm',
                  state === 'cancelled' ? 'text-ink-300 line-through' : state === 'upcoming' ? 'text-ink-500' : 'text-ink-950'
                )}
              >
                {step.label}
              </span>
              {state === 'current' ? <span className='sr-only'>(bước hiện tại)</span> : null}
            </li>
          )
        })}
      </ol>
    </section>
  )
}

function DetailSkeleton() {
  return (
    <div className='mx-auto max-w-[1200px] px-4 py-10 md:px-6'>
      <div className='h-10 w-64 animate-pulse rounded-2xl bg-ink-100' />
      <div className='mt-8 grid gap-6 lg:grid-cols-[1fr_380px]'>
        <div className='space-y-4'>
          <div className='h-36 animate-pulse rounded-4xl bg-ink-100' />
          <div className='h-56 animate-pulse rounded-4xl bg-ink-100' />
        </div>
        <div className='h-72 animate-pulse rounded-4xl bg-ink-100' />
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

  if (loading) return <DetailSkeleton />

  if (error || !order) {
    return (
      <div className='mx-auto max-w-2xl px-4 py-16'>
        <Alert variant='error' title='Có lỗi xảy ra' desc={error || 'Không tìm thấy đơn hàng.'} />
        <Link to={ROUTE_PATHS.USER_ORDERS} className='mt-6 inline-flex items-center gap-2 font-semibold text-berry-600 hover:underline'>
          <ArrowLeft size={16} /> Danh sách đơn hàng
        </Link>
      </div>
    )
  }

  const lineItems = order.items as OrderLineItem[]
  const needsPayment = canPayMomo || canPayPaypal || canPayPayos

  return (
    <div className='mx-auto max-w-[1200px] px-4 py-8 md:px-6 md:py-12'>
      <Link
        to={ROUTE_PATHS.USER_ORDERS}
        preventScrollReset
        className='inline-flex items-center gap-1.5 text-sm font-medium text-ink-600 hover:text-ink-950'
      >
        <ArrowLeft size={16} /> Đơn hàng của tôi
      </Link>

      <header className='mt-3 flex flex-wrap items-end justify-between gap-4'>
        <div>
          <h1 className='font-display text-4xl font-bold md:text-5xl'>Đơn {order.code}</h1>
          <p className='mt-1 text-ink-500'>Đặt ngày {order.createdAt}</p>
        </div>
        <StatusBadge tone={order.status} className='px-3.5 py-1.5 text-sm'>
          {order.statusLabel}
        </StatusBadge>
      </header>

      {needsPayment ? (
        <div className='mt-6 flex flex-col gap-3 rounded-4xl bg-peach-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6'>
          <div className='flex items-start gap-3'>
            <span className='grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white text-peach-700'>
              <Wallet size={20} aria-hidden />
            </span>
            <div>
              <p className='font-semibold'>Đơn hàng chưa được thanh toán</p>
              <p className='text-sm text-ink-700'>Hoàn tất thanh toán để shop bắt đầu chuẩn bị hàng.</p>
            </div>
          </div>
          <a href='#pay' className='inline-flex h-11 shrink-0 items-center justify-center rounded-full bg-ink-950 px-6 text-sm font-semibold text-white hover:bg-ink-800'>
            Thanh toán ngay
          </a>
        </div>
      ) : null}

      <div className='mt-6 grid gap-4 lg:grid-cols-[1fr_380px] lg:gap-6'>
        <div className='space-y-4'>
          <OrderTimeline rawStatus={order.rawStatus} />

          <section className={card}>
            <h2 className='font-display text-xl font-bold'>Sản phẩm ({lineItems.length})</h2>
            {lineItems.length > 0 ? (
              <ul className='mt-4 divide-y divide-ink-100'>
                {lineItems.map((item) => {
                  const image = getProductImage(item.product)
                  const sub = [item.product?.origin, item.product?.volume != null ? `${item.product.volume}ml` : null].filter(Boolean).join(' · ')
                  return (
                    <li key={item._id ?? `${item.product?.name}-${item.price}`} className='flex items-center gap-4 py-4'>
                      <span className='h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-berry-50 sm:h-20 sm:w-20'>
                        {image ? (
                          <img src={image} alt='' className='h-full w-full object-contain p-1 mix-blend-multiply' />
                        ) : (
                          <span className='grid h-full place-items-center text-ink-300'>
                            <Package size={20} aria-hidden />
                          </span>
                        )}
                      </span>
                      <div className='min-w-0 flex-1'>
                        <p className='line-clamp-2 font-semibold'>{item.product?.name || 'Sản phẩm'}</p>
                        {sub ? <p className='text-sm text-ink-500'>{sub}</p> : null}
                        <p className='text-sm text-ink-500'>
                          {money(item.price)} × {item.quantity}
                        </p>
                      </div>
                      <p className='shrink-0 font-semibold'>{money(item.price * item.quantity)}</p>
                    </li>
                  )
                })}
              </ul>
            ) : (
              <p className='mt-3 text-sm text-ink-500'>Không có dữ liệu chi tiết sản phẩm.</p>
            )}
          </section>

          <div className='grid gap-4 md:grid-cols-2'>
            <section className={card}>
              <h2 className='flex items-center gap-2 font-display text-lg font-bold'>
                <MapPin size={18} className='text-berry-600' aria-hidden /> Giao đến
              </h2>
              {order.shippingAddress ? (
                <div className='mt-3 space-y-1 text-sm leading-relaxed text-ink-700'>
                  <p className='font-semibold text-ink-950'>
                    {order.shippingAddress.recipient_name} · {order.shippingAddress.phone}
                  </p>
                  <p>{order.shippingAddress.address_line}</p>
                  {order.shippingAddress.district || order.shippingAddress.city ? (
                    <p>{[order.shippingAddress.district, order.shippingAddress.city].filter(Boolean).join(', ')}</p>
                  ) : null}
                  {order.shippingAddress.note ? <p className='pt-1 text-ink-500'>Ghi chú: {order.shippingAddress.note}</p> : null}
                </div>
              ) : (
                <p className='mt-3 text-sm text-ink-500'>Chưa có thông tin địa chỉ.</p>
              )}
            </section>
            <section className={card}>
              <h2 className='flex items-center gap-2 font-display text-lg font-bold'>
                <Wallet size={18} className='text-berry-600' aria-hidden /> Thanh toán
              </h2>
              <dl className='mt-3 space-y-2 text-sm'>
                <div>
                  <dt className='text-ink-500'>Phương thức</dt>
                  <dd className='font-semibold'>{order.paymentMethod}</dd>
                </div>
                <div>
                  <dt className='text-ink-500'>Trạng thái</dt>
                  <dd className='font-semibold'>{order.paymentStatusLabel}</dd>
                </div>
              </dl>
            </section>
          </div>
        </div>

        <div className='space-y-4'>
          <aside id='pay' className='scroll-mt-36 rounded-4xl bg-ink-950 p-6 text-white lg:sticky lg:top-36 sm:p-7'>
            <h2 className='font-display text-xl font-bold'>Tổng thanh toán</h2>
            <dl className='mt-5 space-y-2.5 text-sm'>
              <div className='flex justify-between'>
                <dt className='text-ink-300'>Tạm tính</dt>
                <dd className='font-semibold'>{money(order.subtotal)}</dd>
              </div>
              <div className='flex justify-between'>
                <dt className='text-ink-300'>Vận chuyển</dt>
                <dd className='font-semibold'>{money(order.shippingFee)}</dd>
              </div>
            </dl>
            <div className='mt-5 flex items-end justify-between border-t border-white/10 pt-5'>
              <span className='text-ink-300'>Tổng</span>
              <span className='font-display text-3xl font-bold'>{money(order.total)}</span>
            </div>

            <div className='mt-6 grid gap-2'>
              {canPayPayos ? (
                <Button full variant='accent' size='lg' onClick={handlePayosPayment} loading={paying}>
                  Thanh toán qua PayOS
                </Button>
              ) : null}
              {canPayMomo && !momoPayment?.qrCodeUrl ? (
                <Button full size='lg' className='!bg-[#A50064] hover:!bg-[#8E0056]' onClick={handlePayment} loading={paying}>
                  Thanh toán qua MoMo
                </Button>
              ) : null}
              {canPayPaypal ? (
                <Button full size='lg' className='!bg-white !text-ink-950 hover:!bg-lime-300' onClick={handlePayPalPayment} loading={paying}>
                  Thanh toán qua PayPal
                </Button>
              ) : null}
            </div>

            {momoPayment?.qrCodeUrl ? (
              <div className='mt-5 rounded-3xl bg-white p-5 text-center text-ink-950'>
                <p className='text-sm font-semibold text-[#A50064]'>Quét mã bằng ứng dụng MoMo</p>
                <p className='mt-1 font-display text-2xl font-bold'>{money(order.total)}</p>
                <div className='mx-auto mt-3 inline-flex rounded-2xl p-2 ring-1 ring-ink-100'>
                  <QRCode value={momoPayment.qrCodeUrl} size={180} bordered={false} />
                </div>
                {momoPayment.deeplink ? (
                  <a
                    href={momoPayment.deeplink}
                    className='mt-3 flex h-11 items-center justify-center gap-2 rounded-full bg-[#A50064] text-sm font-semibold text-white'
                  >
                    <Smartphone size={16} /> Mở ứng dụng MoMo
                  </a>
                ) : null}
              </div>
            ) : null}

            <Link
              to={ROUTE_PATHS.USER_HOME}
              className='mt-4 flex h-11 items-center justify-center gap-2 rounded-full border-[1.5px] border-white/20 text-sm font-semibold hover:border-white'
            >
              <ShoppingBag size={16} /> Tiếp tục mua sắm
            </Link>
          </aside>

          {canCancel ? (
            <div className='rounded-4xl p-5 ring-1 ring-rose-200'>
              <p className='text-sm text-ink-700'>Đơn đang chờ xác nhận — bạn vẫn có thể hủy.</p>
              <Button variant='ghost' full className='mt-3 !text-rose-600 hover:!bg-rose-50' onClick={handleCancelOrder} loading={cancelling}>
                Hủy đơn hàng
              </Button>
            </div>
          ) : order.rawStatus !== ORDER_STATUS_CODE.CANCELLED ? (
            <p className='px-2 text-center text-xs text-ink-500'>Đơn đã được xác nhận nên không thể hủy trực tuyến.</p>
          ) : null}
        </div>
      </div>
    </div>
  )
}
