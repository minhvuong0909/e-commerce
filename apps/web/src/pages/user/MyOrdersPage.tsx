import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { getMyOrdersApi } from '../../services/orders.services'
import type { OrderApiResponse, OrderUI, Status } from '../../models/OrderRequests'
import { TABS, VALID_STATUS } from '../../constants/order'

export default function MyOrdersPage() {
  const location = useLocation()

  const [orders, setOrders] = useState<OrderUI[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const money = (n: number) =>
    n.toLocaleString('vi-VN', {
      style: 'currency',
      currency: 'VND'
    })

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

  const badgeClass = (status: OrderUI['status']) => {
    switch (status) {
      case 'processing':
        return 'border-orange-400/20 bg-orange-500/10 text-orange-200'
      case 'shipping':
        return 'border-sky-400/20 bg-sky-500/10 text-sky-200'
      case 'done':
        return 'border-emerald-400/20 bg-emerald-500/10 text-emerald-200'
      case 'cancel':
        return 'border-red-400/20 bg-red-500/10 text-red-200'
      default:
        return 'border-white/10 bg-white/10 text-white/70'
    }
  }

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
            items: 0,
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

  const loadingUI = (
    <div className='space-y-3'>
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className='rounded-3xl border border-white/10 bg-black/25 p-4 backdrop-blur'>
          <div className='flex items-start justify-between gap-4'>
            <div className='min-w-0 flex-1'>
              <div className='flex flex-wrap items-center gap-2'>
                <div className='h-4 w-32 animate-pulse rounded bg-white/10' />
                <div className='h-6 w-24 animate-pulse rounded-full bg-white/10' />
              </div>

              <div className='mt-2 space-y-2'>
                <div className='h-4 w-40 animate-pulse rounded bg-white/10' />
                <div className='h-3 w-44 animate-pulse rounded bg-white/10' />
              </div>
            </div>

            <div className='w-32 shrink-0 text-right'>
              <div className='ml-auto h-3 w-20 animate-pulse rounded bg-white/10' />
              <div className='mt-2 ml-auto h-6 w-28 animate-pulse rounded bg-white/10' />
              <div className='mt-3 ml-auto h-3 w-16 animate-pulse rounded bg-white/10' />
            </div>
          </div>
        </div>
      ))}
    </div>
  )

  const emptyUI = (
    <div className='rounded-3xl border border-white/10 bg-black/25 px-6 py-12 text-center backdrop-blur'>
      <div className='text-lg font-extrabold text-white'>Chưa có đơn hàng</div>
      <p className='mt-2 text-sm text-white/60'>Bạn chưa có đơn hàng nào trong mục này.</p>

      <div className='mt-6'>
        <Link
          to='/user/home'
          className='inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-orange-500 to-pink-500 px-6 py-3 text-sm font-extrabold text-white shadow-lg shadow-orange-500/20 transition hover:opacity-90'
        >
          Tiếp tục mua sắm
        </Link>
      </div>
    </div>
  )

  const errorUI = (
    <div className='rounded-3xl border border-red-500/20 bg-red-500/10 px-6 py-10 text-center backdrop-blur'>
      <div className='text-lg font-extrabold text-red-200'>Có lỗi xảy ra</div>
      <p className='mt-2 text-sm text-red-100/80'>{error}</p>
    </div>
  )

  return (
    <div className='space-y-5'>
      <div className='flex flex-col gap-1'>
        <h1 className='text-2xl font-black tracking-tight text-white'>Đơn hàng của tôi</h1>
        <p className='text-sm text-white/60'>Theo dõi trạng thái và xem chi tiết các đơn hàng bạn đã đặt.</p>
      </div>

      <div className='flex flex-wrap gap-2'>
        {TABS.map((tab) => {
          const active = activeStatus === tab.value

          return (
            <Link
              key={tab.value}
              to={`/user/orders${tab.value === 'all' ? '' : `?status=${tab.value}`}`}
              className={[
                'rounded-2xl border px-4 py-2 text-sm font-semibold transition',
                active
                  ? 'border-white/15 bg-white/12 text-white shadow-sm'
                  : 'border-white/8 bg-white/5 text-white/60 hover:border-white/12 hover:bg-white/10 hover:text-white'
              ].join(' ')}
            >
              {tab.label}
            </Link>
          )
        })}
      </div>

      <div className='min-h-[420px]'>
        {loading ? (
          loadingUI
        ) : error ? (
          errorUI
        ) : filtered.length === 0 ? (
          emptyUI
        ) : (
          <div className='space-y-4'>
            {filtered.map((o) => (
              <Link
                key={o.id}
                to={`/user/orders/${o.id}`}
                className='group block border-b border-white/6 p-4 transition hover:bg-white/5 last:border-b-0'
              >
                <div className='flex items-start justify-between gap-4'>
                  <div className='min-w-0 flex-1'>
                    <div className='flex flex-wrap items-center gap-2'>
                      <span className='text-sm font-extrabold text-white'>Mã đơn {o.code}</span>
                      <span
                        className={['rounded-full border px-3 py-1 text-xs font-extrabold', badgeClass(o.status)].join(
                          ' '
                        )}
                      >
                        {o.statusLabel}
                      </span>
                    </div>

                    <div className='mt-2 space-y-1 text-sm text-white/65'>
                      <div>Đặt ngày {o.date}</div>
                      <div className='text-xs text-white/45'>
                        Phương thức thanh toán: {o.paymentMethod.replaceAll('_', ' ')}
                      </div>
                    </div>
                  </div>

                  <div className='shrink-0 text-right'>
                    <div className='text-xs text-white/50'>Tổng thanh toán</div>
                    <div className='mt-1 text-lg font-black text-orange-300'>{money(o.total)}</div>
                    <div className='mt-2 text-xs font-semibold text-white/45 transition group-hover:text-white/70'>
                      Xem chi tiết →
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
