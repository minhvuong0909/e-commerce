import { useMemo } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ArrowRight, PackageOpen, RefreshCw, Sparkles } from 'lucide-react'
import EmptyState from '../../components/ui/EmptyState'
import StatusBadge from '../../components/ui/StatusBadge'
import { orderMatchesFilter, ORDER_BADGE_CLASS, parseOrderFilterStatus, TABS } from '../../constants/order'
import type { OrderFilterStatus, OrderUI } from '../../models/OrderRequests'
import { useMyOrders } from '../../hooks/useMyOrders'
import money from '../../utils/money'
import cn from '../../utils/cn'

const panelClass = 'rounded-lg border border-[#eaded8] bg-white'

function paymentPillClass(status?: number) {
  switch (status) {
    case 1:
      return 'border-emerald-200/90 bg-emerald-50 text-emerald-800'
    case 2:
      return 'border-rose-200/90 bg-rose-50 text-rose-800'
    case 3:
      return 'border-slate-200 bg-slate-50 text-slate-700'
    default:
      return 'border-amber-200/90 bg-amber-50 text-amber-900'
  }
}

function OrderListSkeleton() {
  return (
    <div className='space-y-3' aria-busy='true' aria-label='Đang tải đơn hàng'>
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className={cn(panelClass, 'h-28 animate-pulse bg-[#fdf8f6] md:h-20')} />
      ))}
    </div>
  )
}

function OrderRow({ order }: { order: OrderUI }) {
  return (
    <article className={cn(panelClass, 'p-4 transition hover:border-[#cbb8af] md:p-0')}>
      <div className='hidden grid-cols-[minmax(140px,1.1fr)_minmax(100px,0.9fr)_minmax(120px,1fr)_minmax(120px,1fr)_minmax(100px,0.8fr)_auto] items-center gap-3 px-4 py-3 text-sm md:grid'>
        <div>
          <p className='font-semibold text-[#3d3330]'>{order.code}</p>
          <p className='mt-0.5 text-xs text-[#8a7a74]'>{order.paymentMethod}</p>
        </div>
        <p className='text-[#6b5f59]'>{order.date}</p>
        <StatusBadge tone={order.status} className={ORDER_BADGE_CLASS[order.status]}>
          {order.statusLabel}
        </StatusBadge>
        <span
          className={cn(
            'inline-flex w-fit rounded-full border px-2.5 py-1 text-xs font-semibold',
            paymentPillClass(order.rawPaymentStatus)
          )}
        >
          {order.paymentStatusLabel ?? '—'}
        </span>
        <p className='font-bold text-[#3d3330]'>{money(order.total)}</p>
        <Link
          to={`/user/orders/${order.id}`}
          className='inline-flex h-9 items-center justify-center gap-1 rounded-md border border-[#3d3330] px-3 text-xs font-semibold text-[#3d3330] transition hover:bg-[#3d3330] hover:text-white'
        >
          Chi tiết
          <ArrowRight size={13} />
        </Link>
      </div>

      <div className='space-y-3 md:hidden'>
        <div className='flex items-start justify-between gap-3'>
          <div>
            <p className='text-xs font-semibold uppercase tracking-wider text-[#b07a72]'>Mã đơn</p>
            <p className='mt-0.5 font-semibold text-[#3d3330]'>{order.code}</p>
            <p className='mt-1 text-xs text-[#8a7a74]'>{order.date}</p>
          </div>
          <p className='text-right text-lg font-bold text-[#3d3330]'>{money(order.total)}</p>
        </div>

        <div className='flex flex-wrap gap-2'>
          <StatusBadge tone={order.status} className={ORDER_BADGE_CLASS[order.status]}>
            {order.statusLabel}
          </StatusBadge>
          <span
            className={cn(
              'inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold',
              paymentPillClass(order.rawPaymentStatus)
            )}
          >
            {order.paymentStatusLabel}
          </span>
        </div>

        <div className='flex items-center justify-between gap-3 border-t border-[#f0e4de] pt-3'>
          <p className='text-xs text-[#8a7a74]'>
            Giao hàng: <span className='font-semibold text-[#6b5f59]'>{order.statusLabel}</span>
          </p>
          <Link
            to={`/user/orders/${order.id}`}
            className='inline-flex h-9 items-center gap-1 rounded-md bg-[#3d3330] px-4 text-xs font-semibold text-white'
          >
            Chi tiết
            <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    </article>
  )
}

export default function MyOrdersPage() {
  const location = useLocation()
  const { data: orders = [], isLoading, isError, refetch, isFetching } = useMyOrders()

  const activeStatus = useMemo<OrderFilterStatus>(() => {
    const statusFromQuery = new URLSearchParams(location.search).get('status')
    return parseOrderFilterStatus(statusFromQuery)
  }, [location.search])

  const filtered = useMemo(
    () => orders.filter((o) => orderMatchesFilter(o.rawStatus, activeStatus)),
    [orders, activeStatus]
  )

  return (
    <div className='mx-auto max-w-7xl px-4 py-8 md:px-6'>
      <div className='mb-6 flex flex-col gap-2'>
        <p className='text-xs font-semibold uppercase tracking-[0.14em] text-[#b07a72]'>Order center</p>
        <h1 className='text-3xl font-semibold tracking-tight text-[#3d3330]'>Đơn hàng của tôi</h1>
        <p className='max-w-2xl text-sm leading-6 text-[#8a7a74]'>
          Theo dõi trạng thái giao hàng, thanh toán và tổng tiền cho mọi đơn mỹ phẩm của bạn.
        </p>
      </div>

      <div className='mb-6 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'>
        {TABS.map((tab) => {
          const active = activeStatus === tab.value
          return (
            <Link
              key={tab.value}
              to={`/user/orders${tab.value === 'all' ? '' : `?status=${tab.value}`}`}
              className={cn(
                'inline-flex min-h-9 shrink-0 items-center rounded-full border px-4 text-sm font-semibold transition',
                active
                  ? 'border-[#3d3330] bg-[#3d3330] text-white'
                  : 'border-[#eaded8] bg-white text-[#6b5f59] hover:border-[#cbb8af]'
              )}
            >
              {tab.label}
            </Link>
          )
        })}
      </div>

      <div className='min-h-[320px]'>
        {isLoading ? (
          <OrderListSkeleton />
        ) : isError ? (
          <div className={cn(panelClass, 'px-6 py-10 text-center')}>
            <p className='text-lg font-semibold text-rose-800'>Không tải được đơn hàng</p>
            <p className='mt-2 text-sm text-[#8a7a74]'>Vui lòng kiểm tra kết nối và thử lại.</p>
            <button
              type='button'
              onClick={() => refetch()}
              disabled={isFetching}
              className='mt-5 inline-flex h-10 items-center gap-2 rounded-md border border-[#3d3330] px-4 text-sm font-semibold text-[#3d3330] hover:bg-[#fdf8f6] disabled:opacity-50'
            >
              <RefreshCw size={15} className={isFetching ? 'animate-spin' : ''} />
              Thử lại
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<PackageOpen size={26} />}
            title='No beauty orders yet'
            desc='Routine làm đẹp của bạn bắt đầu từ đây — khám phá sản phẩm và đặt hàng đầu tiên nhé.'
            action={
              <Link
                to='/user/home'
                className='inline-flex h-11 items-center justify-center rounded-md bg-[#3d3330] px-5 text-sm font-semibold text-white hover:bg-[#2a2421]'
              >
                Khám phá sản phẩm
              </Link>
            }
          />
        ) : (
          <div className='space-y-3'>
            <div
              className={cn(
                panelClass,
                'hidden grid-cols-[minmax(140px,1.1fr)_minmax(100px,0.9fr)_minmax(120px,1fr)_minmax(120px,1fr)_minmax(100px,0.8fr)_auto] gap-3 bg-[#fdf8f6] px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-[#8a7a74] md:grid'
              )}
            >
              <span>Mã đơn</span>
              <span>Ngày đặt</span>
              <span>Trạng thái</span>
              <span>Thanh toán</span>
              <span>Tổng tiền</span>
              <span className='text-right'> </span>
            </div>

            {filtered.map((order) => (
              <OrderRow key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>

      {!isLoading && !isError && filtered.length > 0 ? (
        <p className='mt-6 flex items-center justify-center gap-1.5 text-center text-xs text-[#8a7a74]'>
          <Sparkles size={13} className='text-[#b07a72]' />
          Cảm ơn bạn đã tin tưởng Vibrant Mart
        </p>
      ) : null}
    </div>
  )
}
