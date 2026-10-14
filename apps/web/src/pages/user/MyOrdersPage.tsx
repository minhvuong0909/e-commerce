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

const panelClass = 'rounded-2xl border border-[#E7E0D8] bg-white shadow-soft'

function paymentPillClass(status?: number) {
  switch (status) {
    case 1:
      return 'border-emerald-200/90 bg-emerald-50 text-emerald-800'
    case 2:
      return 'border-rose-200/90 bg-rose-50 text-rose-800'
    case 3:
      return 'border-stone-200 bg-stone-50 text-stone-700'
    default:
      return 'border-amber-200/90 bg-amber-50 text-amber-900'
  }
}

function OrderListSkeleton() {
  return (
    <div className='space-y-3' aria-busy='true' aria-label='Đang tải đơn hàng'>
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className={cn(panelClass, 'h-28 animate-pulse bg-[#FAF7F2] md:h-20')} />
      ))}
    </div>
  )
}

function OrderRow({ order }: { order: OrderUI }) {
  return (
    <article className={cn(panelClass, 'p-4 transition hover:border-[#A16207] hover:shadow-md md:p-0')}>
      <div className='hidden grid-cols-[minmax(140px,1.1fr)_minmax(100px,0.9fr)_minmax(120px,1fr)_minmax(120px,1fr)_minmax(100px,0.8fr)_auto] items-center gap-3 px-5 py-4 text-sm md:grid'>
        <div>
          <p className='font-bold text-[#1C1917]'>{order.code}</p>
          <p className='mt-0.5 text-xs text-[#786C60]'>{order.paymentMethod}</p>
        </div>
        <p className='text-[#44403C] text-xs font-medium'>{order.date}</p>
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
        <p className='font-extrabold text-[#B45309]'>{money(order.total)}</p>
        <Link
          to={`/user/orders/${order.id}`}
          className='inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-[#1C1917] px-3.5 text-xs font-bold text-[#1C1917] transition hover:bg-[#1C1917] hover:text-white focus-visible:ring-2 focus-visible:ring-[#A16207]'
        >
          Chi tiết
          <ArrowRight size={13} />
        </Link>
      </div>

      <div className='space-y-3 md:hidden'>
        <div className='flex items-start justify-between gap-3'>
          <div>
            <p className='text-xs font-bold uppercase tracking-wider text-[#A16207]'>Mã đơn</p>
            <p className='mt-0.5 font-bold text-[#1C1917]'>{order.code}</p>
            <p className='mt-1 text-xs text-[#786C60]'>{order.date}</p>
          </div>
          <p className='text-right text-base font-extrabold text-[#B45309]'>{money(order.total)}</p>
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

        <div className='flex items-center justify-between gap-3 border-t border-[#E7E0D8] pt-3'>
          <p className='text-xs text-[#786C60]'>
            Giao hàng: <span className='font-semibold text-[#44403C]'>{order.statusLabel}</span>
          </p>
          <Link
            to={`/user/orders/${order.id}`}
            className='inline-flex h-9 items-center gap-1.5 rounded-xl bg-[#1C1917] px-4 text-xs font-bold text-white transition hover:bg-[#A16207]'
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
        <p className='text-xs font-bold uppercase tracking-[0.2em] text-[#A16207]'>Order center</p>
        <h1 className='font-display text-3xl font-extrabold tracking-tight text-[#1C1917]'>Đơn hàng của tôi</h1>
        <p className='max-w-2xl text-xs md:text-sm leading-relaxed text-[#786C60]'>
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
                'inline-flex min-h-9 shrink-0 items-center rounded-full border px-4 text-xs font-bold transition-all',
                active
                  ? 'border-[#1C1917] bg-[#1C1917] text-white shadow-xs'
                  : 'border-[#E7E0D8] bg-white text-[#786C60] hover:border-[#A16207] hover:text-[#1C1917]'
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
          <div className={cn(panelClass, 'px-6 py-12 text-center')}>
            <p className='text-base font-bold text-rose-700'>Không tải được đơn hàng</p>
            <p className='mt-2 text-xs text-[#786C60]'>Vui lòng kiểm tra kết nối mạng và thử lại.</p>
            <button
              type='button'
              onClick={() => refetch()}
              disabled={isFetching}
              className='mt-5 inline-flex h-10 items-center gap-2 rounded-xl border border-[#1C1917] px-4 text-xs font-bold text-[#1C1917] hover:bg-[#FAF7F2] transition disabled:opacity-50'
            >
              <RefreshCw size={14} className={isFetching ? 'animate-spin' : ''} />
              Thử lại
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<PackageOpen size={28} className='text-[#A16207]' />}
            title='Chưa có đơn hàng nào'
            desc='Routine chăm sóc sắc đẹp cao cấp bắt đầu từ đây — hãy khám phá các bộ sưu tập tinh hoa của chúng tôi.'
            action={
              <Link
                to='/user/home'
                className='inline-flex h-10 items-center justify-center rounded-xl bg-[#1C1917] px-6 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#A16207] transition-all shadow-sm'
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
                'hidden grid-cols-[minmax(140px,1.1fr)_minmax(100px,0.9fr)_minmax(120px,1fr)_minmax(120px,1fr)_minmax(100px,0.8fr)_auto] gap-3 bg-[#FAF7F2] px-5 py-3 text-xs font-bold uppercase tracking-wider text-[#786C60] md:grid'
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
        <p className='mt-8 flex items-center justify-center gap-1.5 text-center text-xs font-medium text-[#786C60]'>
          <Sparkles size={14} className='text-[#A16207]' />
          Cảm ơn bạn đã tin tưởng Vibrant Mart
        </p>
      ) : null}
    </div>
  )
}
