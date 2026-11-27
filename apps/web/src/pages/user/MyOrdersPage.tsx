import { useMemo } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ArrowRight, ChevronRight, PackageOpen, RefreshCw } from 'lucide-react'
import EmptyState from '../../components/ui/EmptyState'
import StatusBadge from '../../components/ui/StatusBadge'
import { orderMatchesFilter, parseOrderFilterStatus, TABS } from '../../constants/order'
import type { OrderFilterStatus, OrderUI } from '../../models/OrderRequests'
import { useMyOrders } from '../../hooks/useMyOrders'
import { ROUTE_PATHS } from '../../routes/route.paths'
import money from '../../utils/money'
import cn from '../../utils/cn'

function paymentTone(status?: number) {
  switch (status) {
    case 1:
      return 'bg-emerald-100 text-emerald-800'
    case 2:
      return 'bg-rose-100 text-rose-700'
    case 3:
      return 'bg-ink-100 text-ink-700'
    default:
      return 'bg-peach-100 text-peach-700'
  }
}

const STEP_INDEX: Record<number, number> = { 0: 0, 1: 1, 2: 2, 3: 3 }

function MiniProgress({ rawStatus }: { rawStatus: number }) {
  if (rawStatus === 4) return null
  const idx = STEP_INDEX[rawStatus] ?? 0
  return (
    <div className='flex gap-1' aria-hidden>
      {[0, 1, 2, 3].map((i) => (
        <span key={i} className={cn('h-1.5 flex-1 rounded-full', i <= idx ? 'bg-ink-950' : 'bg-ink-100')} />
      ))}
    </div>
  )
}

function OrderCard({ order }: { order: OrderUI }) {
  return (
    <Link
      to={ROUTE_PATHS.USER_ORDER_DETAIL(order.id)}
      className='group block rounded-4xl bg-white p-5 ring-1 ring-ink-100 transition hover:-translate-y-0.5 hover:shadow-lift sm:p-6'
    >
      <div className='flex flex-wrap items-start justify-between gap-3'>
        <div>
          <p className='font-display text-xl font-bold'>Đơn {order.code}</p>
          <p className='mt-0.5 text-sm text-ink-500'>
            {order.date} · {order.items.length} sản phẩm · {order.paymentMethod}
          </p>
        </div>
        <p className='font-display text-2xl font-bold'>{money(order.total)}</p>
      </div>
      <div className='mt-4 flex flex-wrap items-center gap-2'>
        <StatusBadge tone={order.status}>{order.statusLabel}</StatusBadge>
        <span className={cn('chip px-2.5 py-1 text-xs font-bold', paymentTone(order.rawPaymentStatus))}>{order.paymentStatusLabel ?? '—'}</span>
        <span className='ml-auto inline-flex items-center gap-1 text-sm font-semibold text-ink-950'>
          Chi tiết <ChevronRight size={16} className='transition group-hover:translate-x-0.5' aria-hidden />
        </span>
      </div>
      <div className='mt-4'>
        <MiniProgress rawStatus={order.rawStatus} />
      </div>
    </Link>
  )
}

export default function MyOrdersPage() {
  const location = useLocation()
  const { data: orders = [], isLoading, isError, refetch, isFetching } = useMyOrders()

  const activeStatus = useMemo<OrderFilterStatus>(
    () => parseOrderFilterStatus(new URLSearchParams(location.search).get('status')),
    [location.search]
  )
  const filtered = useMemo(() => orders.filter((o) => orderMatchesFilter(o.rawStatus, activeStatus)), [orders, activeStatus])
  const counts = useMemo(() => {
    const map: Record<string, number> = { all: orders.length }
    TABS.forEach((t) => {
      if (t.value !== 'all') map[t.value] = orders.filter((o) => orderMatchesFilter(o.rawStatus, t.value)).length
    })
    return map
  }, [orders])

  return (
    <div className='mx-auto max-w-4xl px-4 py-8 md:px-6 md:py-12'>
      <h1 className='font-display text-4xl font-bold md:text-5xl'>Đơn hàng</h1>
      <p className='mt-2 text-ink-600'>Theo dõi giao hàng và thanh toán cho mọi đơn của bạn.</p>

      <nav aria-label='Lọc theo trạng thái' className='no-scrollbar -mx-4 mt-8 flex gap-2 overflow-x-auto px-4 md:mx-0 md:px-0'>
        {TABS.map((tab) => {
          const active = activeStatus === tab.value
          return (
            <Link
              key={tab.value}
              to={`${ROUTE_PATHS.USER_ORDERS}${tab.value === 'all' ? '' : `?status=${tab.value}`}`}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'chip h-10 shrink-0 border-[1.5px] px-4 transition',
                active ? 'border-ink-950 bg-ink-950 text-white' : 'border-ink-200 bg-white text-ink-700 hover:border-ink-950'
              )}
            >
              {tab.label}
              {!isLoading && counts[tab.value] ? (
                <span className={cn('rounded-full px-1.5 text-xs', active ? 'bg-white/20' : 'bg-ink-100')}>{counts[tab.value]}</span>
              ) : null}
            </Link>
          )
        })}
      </nav>

      <div className='mt-6 min-h-[320px]'>
        {isLoading ? (
          <div className='space-y-3' aria-busy='true'>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className='h-40 animate-pulse rounded-4xl bg-ink-100' />
            ))}
          </div>
        ) : isError ? (
          <EmptyState
            icon={<RefreshCw size={26} />}
            title='Không tải được đơn hàng'
            desc='Kiểm tra kết nối mạng rồi thử lại nhé.'
            action={
              <button
                type='button'
                onClick={() => refetch()}
                disabled={isFetching}
                className='inline-flex h-11 cursor-pointer items-center gap-2 rounded-full bg-ink-950 px-6 font-semibold text-white disabled:opacity-50'
              >
                <RefreshCw size={16} className={isFetching ? 'animate-spin' : ''} /> Thử lại
              </button>
            }
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<PackageOpen size={28} />}
            title={activeStatus === 'all' ? 'Chưa có đơn hàng nào' : 'Không có đơn ở trạng thái này'}
            desc='Khi bạn đặt hàng, mọi cập nhật sẽ xuất hiện tại đây.'
            action={
              <Link
                to={ROUTE_PATHS.USER_HOME}
                className='inline-flex h-12 items-center gap-2 rounded-full bg-ink-950 px-7 font-semibold text-white hover:bg-berry-600'
              >
                Khám phá sản phẩm <ArrowRight size={18} />
              </Link>
            }
          />
        ) : (
          <div className='space-y-3'>
            {filtered.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
