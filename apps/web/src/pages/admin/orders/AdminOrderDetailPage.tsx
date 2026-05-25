import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Printer, RefreshCw, ChevronLeft, CalendarClock, ReceiptText, User, CreditCard } from 'lucide-react'
import Button from '../../../components/ui/Button'
import StatusBadge from '../../../components/ui/StatusBadge'
import { getOrderByIdApi, updateOrderStatusApi } from '../../../services/orders.services'
import money from '../../../utils/money'
import { toast } from 'react-toastify'

type Product = {
  name: string
  price: number
  images?: string[]
}

type OrderItem = {
  product_id: string
  quantity: number
  price: number
  product?: Product
}

type OrderUI = {
  _id: string
  user_id: string
  delivery_method_id?: string
  payment_method: number
  payment_status: number
  total_price: number
  shipping_fee: number
  status: number
  created_at: string
  updated_at: string
  customer?: {
    name: string
    email: string
  }
  items: OrderItem[]
}

function mapStatus(status: number) {
  switch (status) {
    case 0:
      return { tone: 'processing' as const, label: 'Đang xử lý' }
    case 1:
      return { tone: 'shipping' as const, label: 'Đã xác nhận' }
    case 2:
      return { tone: 'done' as const, label: 'Đang giao hàng' }
    case 3:
      return { tone: 'done' as const, label: 'Đã nhận hàng' }
    case 4:
      return { tone: 'cancel' as const, label: 'Đã hủy' }
    default:
      return { tone: 'info' as const, label: 'Không rõ' }
  }
}

function getPaymentStatusLabel(status: number) {
  switch (status) {
    case 0:
      return 'Chờ thanh toán'
    case 1:
      return 'Đã thanh toán'
    case 2:
      return 'Thất bại'
    case 3:
      return 'Đã hoàn tiền'
    default:
      return 'Không xác định'
  }
}

export default function AdminOrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [order, setOrder] = useState<OrderUI | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState('')

  const fetchOrder = async () => {
    if (!id) return
    try {
      setLoading(true)
      setError('')
      const res = await getOrderByIdApi(id)
      const data = res?.data?.result
      setOrder(data)
    } catch (err: any) {
      console.error(err)
      setError(err.response?.data?.message || 'Không tải được chi tiết đơn hàng.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrder()
  }, [id])

  const handleUpdateStatus = async (status: string) => {
    if (!id) return
    try {
      setUpdating(true)
      await updateOrderStatusApi(id, status)
      toast.success('Cập nhật trạng thái thành công!')
      fetchOrder()
    } catch (err: any) {
      console.error(err)
      toast.error(err.response?.data?.message || 'Cập nhật trạng thái thất bại.')
    } finally {
      setUpdating(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  if (loading) {
    return (
      <div className='flex min-h-[300px] flex-col items-center justify-center gap-3'>
        <RefreshCw className='h-8 w-8 animate-spin text-brand-600' />
        <p className='text-sm text-slate-500 font-semibold'>Đang tải thông tin đơn hàng...</p>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className='rounded-3xl border border-rose-200 bg-rose-50 p-6 text-center'>
        <p className='font-bold text-rose-900'>{error || 'Không tìm thấy đơn hàng'}</p>
        <Link to='/admin/orders' className='mt-4 inline-flex text-sm font-black text-brand-600 hover:underline'>
          Quay lại danh sách đơn hàng
        </Link>
      </div>
    )
  }

  const statusInfo = mapStatus(order.status)
  const totalItemsPrice = order.items.reduce((sum, item) => sum + item.quantity * item.price, 0)

  return (
    <div className='space-y-6'>
      <div className='flex flex-col gap-3 md:flex-row md:items-center md:justify-between'>
        <div>
          <div className='flex items-center gap-2'>
            <Link to='/admin/orders' className='text-slate-400 hover:text-ink-950 transition'>
              <ChevronLeft size={20} />
            </Link>
            <p className='text-xs font-black uppercase tracking-[0.18em] text-brand-600'>Order detail</p>
          </div>
          <h1 className='mt-1 text-3xl font-black tracking-tight text-ink-950'>
            Đơn hàng #{order._id.slice(-8).toUpperCase()}
          </h1>
          <p className='mt-2 text-sm text-slate-500'>
            Đặt lúc: {new Date(order.created_at).toLocaleString('vi-VN')}
          </p>
        </div>
        <Link to='/admin/orders' className='text-sm font-black text-brand-600 hover:text-brand-900'>
          Quay lại
        </Link>
      </div>

      <div className='grid gap-6 md:grid-cols-3'>
        <div className='space-y-6 md:col-span-2'>
          <section className='surface-strong rounded-3xl p-6'>
            <div className='mb-4 flex items-center gap-3'>
              <span className='grid h-10 w-10 place-items-center rounded-2xl bg-slate-100 text-ink-950'>
                <CalendarClock size={18} />
              </span>
              <h2 className='text-lg font-black text-ink-950'>Sản phẩm trong đơn ({order.items.length})</h2>
            </div>

            <div className='mt-4 space-y-3'>
              {order.items.length === 0 ? (
                <div className='rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500'>
                  Không có sản phẩm nào trong đơn hàng này.
                </div>
              ) : (
                order.items.map((item, idx) => (
                  <div
                    key={idx}
                    className='flex items-center justify-between rounded-3xl border border-slate-200 bg-slate-50 p-4'
                  >
                    <div className='flex items-center gap-3'>
                      <div className='grid h-12 w-12 place-items-center rounded-xl bg-slate-200 text-xs font-black text-slate-500 overflow-hidden'>
                        {item.product?.images?.[0] ? (
                          <img
                            src={item.product.images[0]}
                            alt={item.product.name}
                            className='h-full w-full object-cover'
                          />
                        ) : (
                          'SKU'
                        )}
                      </div>
                      <div>
                        <div className='font-black text-ink-950'>{item.product?.name || 'Sản phẩm không tồn tại'}</div>
                        <div className='text-sm font-semibold text-slate-500'>
                          Số lượng: {item.quantity} × {money(item.price)}
                        </div>
                      </div>
                    </div>
                    <div className='font-black text-ink-950'>{money(item.quantity * item.price)}</div>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className='surface-strong rounded-3xl p-6'>
            <div className='mb-4 flex items-center gap-3'>
              <span className='grid h-10 w-10 place-items-center rounded-2xl bg-slate-100 text-ink-950'>
                <ReceiptText size={18} />
              </span>
              <h2 className='text-lg font-black text-ink-950'>Thông tin chi tiết đơn hàng</h2>
            </div>
            <div className='grid gap-4 sm:grid-cols-2'>
              <InfoItem label='Mã đơn hàng đầy đủ' value={order._id} />
              <InfoItem label='Thời gian cập nhật' value={new Date(order.updated_at).toLocaleString('vi-VN')} />
              <InfoItem label='Mã phương thức giao hàng' value={order.delivery_method_id || 'Tiêu chuẩn'} />
              <InfoItem label='Mã khách hàng' value={order.user_id} />
            </div>
          </section>
        </div>

        <aside className='space-y-6'>
          <section className='surface-card rounded-3xl p-6'>
            <div className='mb-5 flex items-center gap-3'>
              <span className='grid h-10 w-10 place-items-center rounded-2xl bg-slate-100 text-ink-950'>
                <User size={18} />
              </span>
              <h2 className='text-lg font-black text-ink-950'>Khách hàng</h2>
            </div>
            <div className='space-y-3 text-sm'>
              <SummaryRow label='Tên khách hàng' value={order.customer?.name || 'Chưa cập nhật'} />
              <SummaryRow label='Email' value={order.customer?.email || 'Chưa cập nhật'} />
            </div>
          </section>

          <section className='surface-card rounded-3xl p-6'>
            <div className='mb-5 flex items-center gap-3'>
              <span className='grid h-10 w-10 place-items-center rounded-2xl bg-slate-100 text-ink-950'>
                <CreditCard size={18} />
              </span>
              <h2 className='text-lg font-black text-ink-950'>Thanh toán & Giao nhận</h2>
            </div>

            <div className='space-y-3 text-sm'>
              <SummaryRow label='Phương thức' value={`${order.payment_method}`} />
              <SummaryRow label='Trạng thái thanh toán' value={getPaymentStatusLabel(order.payment_status)} />
              <div className='flex items-center justify-between gap-3'>
                <span className='text-slate-500 font-medium'>Trạng thái đơn hàng</span>
                <StatusBadge tone={statusInfo.tone}>{statusInfo.label}</StatusBadge>
              </div>

              <div className='border-t border-slate-200 pt-3 space-y-3'>
                <SummaryRow label='Tạm tính' value={money(totalItemsPrice)} />
                <SummaryRow label='Phí vận chuyển' value={order.shipping_fee === 0 ? 'Miễn phí' : money(order.shipping_fee)} />
                <SummaryRow label='Tổng thanh toán' value={money(order.total_price)} strong />
              </div>
            </div>

            <div className='mt-6 border-t border-slate-200 pt-5 space-y-4'>
              <div className='grid gap-2'>
                {order.status === 0 && (
                  <>
                    <Button full onClick={() => handleUpdateStatus('1')} loading={updating} disabled={updating}>
                      <RefreshCw size={16} className={updating ? 'animate-spin' : ''} />
                      Xác nhận đơn hàng
                    </Button>
                    <Button full variant='danger' onClick={() => handleUpdateStatus('4')} loading={updating} disabled={updating}>
                      Hủy đơn hàng
                    </Button>
                  </>
                )}
                {order.status === 1 && (
                  <Button full onClick={() => handleUpdateStatus('2')} loading={updating} disabled={updating}>
                    <RefreshCw size={16} className={updating ? 'animate-spin' : ''} />
                    Giao cho vận chuyển
                  </Button>
                )}
                {order.status === 2 && (
                  <Button full onClick={() => handleUpdateStatus('3')} loading={updating} disabled={updating}>
                    <RefreshCw size={16} className={updating ? 'animate-spin' : ''} />
                    Đã giao thành công
                  </Button>
                )}
                <Button full variant='secondary' onClick={handlePrint}>
                  <Printer size={16} />
                  In hóa đơn
                </Button>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </div>
  )
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className='rounded-2xl border border-slate-100 bg-slate-50/50 p-4'>
      <div className='text-xs font-black uppercase tracking-wider text-slate-400'>{label}</div>
      <div className='mt-1 font-mono text-sm font-black text-ink-950 break-all'>{value}</div>
    </div>
  )
}

function SummaryRow({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className='flex justify-between gap-3'>
      <span className='text-slate-500 font-medium'>{label}</span>
      <span className={strong ? 'font-black text-brand-700 text-base' : 'font-semibold text-ink-950'}>{value}</span>
    </div>
  )
}
