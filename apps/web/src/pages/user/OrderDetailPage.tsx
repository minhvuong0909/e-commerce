import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { QRCode } from 'antd'
import { ArrowLeft, CalendarClock, CreditCard, ExternalLink, MapPin, ReceiptText, Smartphone } from 'lucide-react'
import { toast } from 'sonner'
import Alert from '../../components/ui/Alert'
import Button from '../../components/ui/Button'
import StatusBadge from '../../components/ui/StatusBadge'
import { getOrderStatusMeta, ORDER_STATUS_CODE } from '../../constants/order'
import type { OrderApiResponse, OrderUI, PaymentMethod } from '../../models/OrderRequests'
import { ROUTE_PATHS } from '../../routes/route.paths'
import { cancelOrderApi, getOrderByIdApi } from '../../services/orders.services'
import {
  getMomoPaymentUrlApi,
  getPaypalPaymentUrlApi
} from '../../services/payment.services'
import formatDate from '../../utils/date'
import money from '../../utils/money'
import { getApiErrorMessage } from '../../utils/apiError'

type MomoPayment = {
  payUrl?: string
  qrCodeUrl?: string
  deeplink?: string
}

type OrderLineItem = {
  _id?: string
  price: number
  quantity: number
  product?: { name?: string; thumbnail?: string }
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

  const createOrderCode = (value: string) => `#${value.slice(-6).toUpperCase()}`

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
      case 2:
        return 'Thanh toán thất bại'
      case 3:
        return 'Đã hoàn tiền'
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
            <div className='rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700'>
              {order.shippingAddress ? (
                <div className='space-y-2'>
                  <p>
                    <span className='font-bold text-ink-950'>{order.shippingAddress.recipient_name}</span>
                    {' · '}
                    {order.shippingAddress.phone}
                  </p>
                  <p>{order.shippingAddress.address_line}</p>
                  {(order.shippingAddress.district || order.shippingAddress.city) && (
                    <p>
                      {[order.shippingAddress.district, order.shippingAddress.city].filter(Boolean).join(', ')}
                    </p>
                  )}
                  {order.shippingAddress.note ? (
                    <p className='text-slate-600'>
                      <span className='font-bold text-ink-900'>Ghi chú:</span> {order.shippingAddress.note}
                    </p>
                  ) : null}
                  {order.shippingAddress.distance_km != null ? (
                    <p className='text-slate-600'>Khoảng cách giao hàng: {order.shippingAddress.distance_km} km</p>
                  ) : null}
                  {order.shippingAddress.lat != null && order.shippingAddress.lng != null ? (
                    <a
                      href={`https://www.openstreetmap.org/?mlat=${order.shippingAddress.lat}&mlon=${order.shippingAddress.lng}#map=16/${order.shippingAddress.lat}/${order.shippingAddress.lng}`}
                      target='_blank'
                      rel='noreferrer'
                      className='inline-flex text-sm font-bold text-brand-600 hover:text-brand-900'
                    >
                      Xem vị trí trên bản đồ
                    </a>
                  ) : null}
                </div>
              ) : (
                <p className='text-slate-500'>Đơn hàng này chưa có thông tin địa chỉ giao hàng.</p>
              )}
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
                <ul className='space-y-3'>
                  {(order.items as OrderLineItem[]).map((item) => (
                    <li
                      key={item._id}
                      className='flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3'
                    >
                      {item.product?.thumbnail ? (
                        <img
                          src={item.product.thumbnail}
                          alt={item.product?.name || 'Sản phẩm'}
                          className='h-14 w-14 shrink-0 rounded-xl border border-slate-200 object-cover'
                        />
                      ) : (
                        <div className='grid h-14 w-14 shrink-0 place-items-center rounded-xl border border-slate-200 bg-slate-100 text-slate-400'>
                          <ReceiptText size={18} />
                        </div>
                      )}
                      <div className='min-w-0 flex-1'>
                        <div className='truncate font-bold text-ink-950'>{item.product?.name || 'Sản phẩm'}</div>
                        <div className='text-xs text-slate-500'>
                          {money(item.price)} × {item.quantity}
                        </div>
                      </div>
                      <div className='shrink-0 text-sm font-black text-ink-950'>
                        {money(item.price * item.quantity)}
                      </div>
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

            {(canPayMomo || canPayPaypal) && (
              <div className='mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900'>
                Đơn hàng chưa thanh toán. Vui lòng hoàn tất thanh toán để cửa hàng xử lý đơn.
              </div>
            )}

            {canPayMomo && !momoPayment?.qrCodeUrl && (
              <Button full className='mt-5' onClick={handlePayment} loading={paying} disabled={paying}>
                Thanh toán qua MoMo
              </Button>
            )}

            {canPayPaypal && (
              <Button
                full
                className='mt-3 !bg-amber-500 hover:!bg-amber-600 text-white'
                onClick={handlePayPalPayment}
                loading={paying}
                disabled={paying}
              >
                Thanh toán qua PayPal
              </Button>
            )}

            {momoPayment?.qrCodeUrl && (
              <div className='mt-5 overflow-hidden rounded-2xl border border-pink-200 bg-gradient-to-b from-pink-50 to-white'>
                <div className='border-b border-pink-100 px-4 py-3 text-center'>
                  <p className='text-xs font-bold uppercase tracking-[0.14em] text-pink-600'>Thanh toán MoMo</p>
                  <p className='mt-1 text-lg font-black text-ink-950'>{money(order.total)}</p>
                  <p className='mt-0.5 text-xs text-slate-500'>Đơn {order.code}</p>
                </div>

                <div className='px-4 py-5 text-center'>
                  <div className='mx-auto inline-flex rounded-2xl border border-slate-200 bg-white p-3 shadow-sm'>
                    <QRCode value={momoPayment.qrCodeUrl} size={200} bordered={false} />
                  </div>
                  <p className='mt-4 text-sm font-bold text-ink-950'>Quét mã QR bằng ứng dụng MoMo</p>
                  <p className='mt-1 text-xs leading-5 text-slate-500'>
                    Mã có thời hạn ngắn. Sau khi thanh toán, trạng thái đơn sẽ được cập nhật tự động.
                  </p>

                  <div className='mt-4 grid gap-2'>
                    {momoPayment.deeplink && (
                      <a
                        href={momoPayment.deeplink}
                        className='inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-[#a50064] px-4 text-sm font-bold text-white transition hover:bg-[#8e0056]'
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
                        className='inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold text-ink-950 transition hover:border-slate-300 hover:bg-slate-50'
                      >
                        <ExternalLink size={16} />
                        Thanh toán trên trình duyệt
                      </a>
                    )}
                  </div>

                  <Button
                    full
                    variant='outline'
                    className='mt-3'
                    onClick={handlePayment}
                    loading={paying}
                    disabled={paying}
                  >
                    Tạo mã QR mới
                  </Button>
                </div>
              </div>
            )}
          </aside>

          {canCancel ? (
            <div className='rounded-3xl border border-rose-200 bg-rose-50 p-5'>
              <p className='mb-4 text-sm leading-6 text-rose-900'>
                Bạn chỉ có thể hủy đơn khi đơn hàng đang ở trạng thái xử lý.
              </p>
              <Button variant='danger' full onClick={handleCancelOrder} loading={cancelling} disabled={cancelling}>
                Hủy đơn hàng
              </Button>
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
