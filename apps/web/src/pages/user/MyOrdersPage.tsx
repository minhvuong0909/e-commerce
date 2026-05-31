import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ArrowRight, PackageOpen, ReceiptText } from 'lucide-react'
import EmptyState from '../../components/ui/EmptyState'
import StatusBadge from '../../components/ui/StatusBadge'
import { TABS, VALID_STATUS } from '../../constants/order'
import type { OrderApiResponse, OrderUI, Status } from '../../models/OrderRequests'
import { getMyOrdersApi } from '../../services/orders.services'
import money from '../../utils/money'
import cn from '../../utils/cn'

export default function MyOrdersPage() {
  const location = useLocation()

  const [orders, setOrders] = useState<OrderUI[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const activeStatus = useMemo<Status>(() => {
    const statusFromQuery = new URLSearchParams(location.search).get('status')
    return VALID_STATUS.includes(statusFromQuery as Status) ? (statusFromQuery as Status) : 'all'
  }, [location.search])

  const mapStatus = (status: number): { status: Exclude<Status, 'all'>; statusLabel: string } => {
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

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })

  const createOrderCode = (id: string) => `#${id.slice(-6).toUpperCase()}`

  useEffect(() => {
    let cancelled = false

    const fetchOrders = async () => {
      try {
        setLoading(true)
        setError('')

        const res = await getMyOrdersApi()
        const rawOrders: OrderApiResponse[] = Array.isArray(res) ? res : res?.data?.result || []

        const mappedOrders: OrderUI[] = rawOrders.map((order) => {
          const statusData = mapStatus(order.status)

          return {
            id: order._id,
            code: createOrderCode(order._id),
            status: statusData.status,
            statusLabel: statusData.statusLabel,
            subtotal: order.total_price,
            shippingFee: order.shipping_fee,
            total: order.total_price + order.shipping_fee,
            items: order.items || [],
            date: formatDate(order.created_at),
            paymentMethod: order.payment_method
          }
        })

        if (cancelled) return
        setOrders(mappedOrders)
      } catch (err) {
        if (cancelled) return
        console.error(err)
        setError('Không thể tải danh sách đơn hàng. Vui lòng thử lại.')
      } finally {
        if (cancelled) return
        setLoading(false)
      }
    }

    fetchOrders()

    return () => {
      cancelled = true
    }
  }, [])

  const filtered = useMemo(() => {
    return activeStatus === 'all' ? orders : orders.filter((o) => o.status === activeStatus)
  }, [orders, activeStatus])

  return (
    <div className='mx-auto max-w-7xl px-4 py-8 md:px-6'>
      <div className='mb-6 flex flex-col gap-2'>
        <p className='text-xs font-black uppercase tracking-[0.18em] text-brand-600'>Order center</p>
        <h1 className='text-3xl font-black tracking-tight text-ink-950'>Đơn hàng của tôi</h1>
        <p className='max-w-2xl text-sm leading-6 text-slate-500'>
          Theo dõi trạng thái, phương thức thanh toán và tổng tiền cho các đơn hàng đã đặt.
        </p>
      </div>

      <div className='mb-6 flex gap-2 overflow-x-auto pb-1'>
        {TABS.map((tab) => {
          const active = activeStatus === tab.value

          return (
            <Link
              key={tab.value}
              to={`/user/orders${tab.value === 'all' ? '' : `?status=${tab.value}`}`}
              className={cn(
                'inline-flex min-h-10 shrink-0 items-center rounded-2xl border px-4 text-sm font-bold transition',
                active
                  ? 'border-ink-950 bg-ink-950 text-white shadow-card'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-ink-950'
              )}
            >
              {tab.label}
            </Link>
          )
        })}
      </div>

      <div className='min-h-[420px]'>
        {loading ? (
          <div className='space-y-3'>
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className='h-32 animate-pulse rounded-3xl bg-white shadow-sm' />
            ))}
          </div>
        ) : error ? (
          <div className='rounded-3xl border border-rose-200 bg-rose-50 px-6 py-10 text-center text-rose-900 shadow-sm'>
            <div className='text-lg font-extrabold'>Có lỗi xảy ra</div>
            <p className='mt-2 text-sm opacity-80'>{error}</p>
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<PackageOpen size={26} />}
            title='Chưa có đơn hàng'
            desc='Bạn chưa có đơn hàng nào trong mục này.'
            action={
              <Link to='/user/home' className='inline-flex h-12 items-center justify-center rounded-2xl bg-ink-950 px-5 text-sm font-black text-white'>
                Tiếp tục mua sắm
              </Link>
            }
          />
        ) : (
          <div className='space-y-4'>
            {filtered.map((order) => (
              <Link
                key={order.id}
                to={`/user/orders/${order.id}`}
                className='surface-card interactive-lift group block rounded-3xl p-5'
              >
                <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
                  <div className='min-w-0'>
                    <div className='flex flex-wrap items-center gap-2'>
                      <span className='inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-ink-950'>
                        <ReceiptText size={18} />
                      </span>
                      <span className='text-sm font-black text-ink-950'>Mã đơn {order.code}</span>
                      <StatusBadge tone={order.status}>{order.statusLabel}</StatusBadge>
                    </div>

                    <div className='mt-3 space-y-1 text-sm text-slate-500'>
                      <div>Đặt ngày {order.date}</div>
                      <div className='text-xs font-semibold'>Phương thức thanh toán: {order.paymentMethod.replaceAll('_', ' ')}</div>
                    </div>
                  </div>

                  <div className='flex items-end justify-between gap-4 md:block md:text-right'>
                    <div>
                      <div className='text-xs font-bold uppercase tracking-[0.12em] text-slate-400'>Tổng thanh toán</div>
                      <div className='mt-1 text-xl font-black text-ink-950'>{money(order.total)}</div>
                    </div>
                    <div className='inline-flex items-center gap-1 text-xs font-black text-brand-600 transition group-hover:text-brand-900'>
                      Chi tiết <ArrowRight size={14} />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
