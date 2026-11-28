import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Boxes,
  ChevronRight,
  Clock,
  Minus,
  Package,
  RefreshCw,
  ShoppingBag,
  Users,
  Wallet
} from 'lucide-react'
import StatusBadge from '../../components/ui/StatusBadge'
import { getOrderStatusMeta } from '../../constants/order'
import { getAllOrdersApi, getDashboardSummaryApi, type DashboardSummary } from '../../services/orders.services'
import type { OrderApiResponse } from '../../models/OrderRequests'
import { ROUTE_PATHS } from '../../routes/route.paths'
import { formatImageUrl } from '../../utils/formatImageUrl'
import formatDate from '../../utils/date'
import money from '../../utils/money'
import cn from '../../utils/cn'

const TZ = 'Asia/Ho_Chi_Minh'
const DAY_MS = 86_400_000
const vnDay = (d: Date) => d.toLocaleDateString('en-CA', { timeZone: TZ })
const vnDate = (ymd: string) => new Date(`${ymd}T12:00:00+07:00`).toLocaleDateString('vi-VN', { timeZone: TZ })

type Preset = { id: string; label: string; range: () => { from: string; to: string } }

const daysBack = (n: number) => () => {
  const to = new Date()
  return { from: vnDay(new Date(to.getTime() - (n - 1) * DAY_MS)), to: vnDay(to) }
}

const PRESETS: Preset[] = [
  { id: '7d', label: '7 ngày', range: daysBack(7) },
  { id: '30d', label: '30 ngày', range: daysBack(30) },
  { id: '90d', label: '90 ngày', range: daysBack(90) },
  { id: '365d', label: '12 tháng', range: daysBack(365) }
]

const STATUS_META: Array<{ key: keyof DashboardSummary['by_status']; label: string; color: string }> = [
  { key: 'pending', label: 'Chờ xác nhận', color: 'bg-peach-300' },
  { key: 'confirmed', label: 'Đang xử lý', color: 'bg-lilac-300' },
  { key: 'shipped', label: 'Đang giao', color: 'bg-berry-300' },
  { key: 'delivered', label: 'Đã giao', color: 'bg-lime-300' },
  { key: 'cancelled', label: 'Đã hủy', color: 'bg-ink-300' }
]

const compactMoney = (n: number) =>
  n >= 1_000_000_000
    ? `${(n / 1_000_000_000).toFixed(1).replace('.0', '')} tỷ`
    : n >= 1_000_000
      ? `${(n / 1_000_000).toFixed(1).replace('.0', '')} tr`
      : n >= 1_000
        ? `${Math.round(n / 1_000)}k`
        : String(n)

/** Bucket long ranges so the chart stays readable: daily ≤ 45 days, weekly ≤ 180, otherwise monthly. */
function bucketSeries(series: DashboardSummary['series']) {
  const size = series.length <= 45 ? 1 : series.length <= 180 ? 7 : 30
  const label = size === 1 ? 'ngày' : size === 7 ? 'tuần' : 'tháng'
  const buckets: Array<{ label: string; title: string; revenue: number; orders: number }> = []
  for (let i = 0; i < series.length; i += size) {
    const chunk = series.slice(i, i + size)
    const first = chunk[0].date.slice(5).split('-').reverse().join('/')
    const last = chunk[chunk.length - 1].date.slice(5).split('-').reverse().join('/')
    buckets.push({
      label: first,
      title: size === 1 ? first : `${first} – ${last}`,
      revenue: chunk.reduce((s, d) => s + d.revenue, 0),
      orders: chunk.reduce((s, d) => s + d.orders, 0)
    })
  }
  return { buckets, unit: label }
}

function Change({ value }: { value: number | null }) {
  if (value === null)
    return (
      <span className='inline-flex items-center gap-1 text-xs text-ink-400' title='Kỳ trước không có dữ liệu để so sánh'>
        <Minus size={13} aria-hidden /> chưa có kỳ trước
      </span>
    )
  const up = value >= 0
  const Icon = up ? ArrowUpRight : ArrowDownRight
  return (
    <span className={cn('inline-flex items-center gap-0.5 text-xs font-semibold', up ? 'text-emerald-700' : 'text-rose-600')}>
      <Icon size={14} aria-hidden />
      {up ? '+' : ''}
      {value}% so với kỳ trước
    </span>
  )
}

function Kpi({
  icon: Icon,
  label,
  value,
  hint,
  tone,
  children
}: {
  icon: typeof Wallet
  label: string
  value: string
  hint?: string
  tone: string
  children?: React.ReactNode
}) {
  return (
    <div className='rounded-3xl bg-white p-5 ring-1 ring-ink-100'>
      <div className='flex items-center gap-2 text-sm text-ink-500'>
        <span className={cn('grid h-8 w-8 place-items-center rounded-xl', tone)}>
          <Icon size={16} aria-hidden />
        </span>
        {label}
      </div>
      <p className='mt-3 font-display text-[1.75rem] font-bold leading-none text-ink-950'>{value}</p>
      {hint ? <p className='mt-1.5 text-xs text-ink-500'>{hint}</p> : null}
      {children ? <div className='mt-2'>{children}</div> : null}
    </div>
  )
}

export default function AdminDashboardPage() {
  const [presetId, setPresetId] = useState('30d')
  const range = useMemo(() => PRESETS.find((p) => p.id === presetId)!.range(), [presetId])

  const summary = useQuery({
    queryKey: ['admin-dashboard-summary', range.from, range.to],
    queryFn: async () => (await getDashboardSummaryApi(range.from, range.to)).data.result,
    placeholderData: (prev) => prev
  })
  const recent = useQuery({
    queryKey: ['admin-dashboard-recent'],
    queryFn: async () => ((await getAllOrdersApi(8, 1)).data.result ?? []) as OrderApiResponse[]
  })

  const s = summary.data
  const chart = useMemo(() => (s ? bucketSeries(s.series) : null), [s])
  const maxRevenue = chart ? Math.max(...chart.buckets.map((b) => b.revenue), 1) : 1
  const statusTotal = s ? Object.values(s.by_status).reduce((a, b) => a + b, 0) : 0
  const anomalyCount = s ? s.anomalies.paid_but_cancelled.count + s.anomalies.delivered_unpaid_online.count : 0

  if (summary.isError && !s) {
    return (
      <div className='flex flex-col items-start gap-4 rounded-3xl bg-rose-50 p-6 text-rose-800 ring-1 ring-rose-200 sm:flex-row sm:items-center sm:justify-between'>
        <div className='flex items-center gap-3'>
          <AlertTriangle size={22} aria-hidden />
          <span className='font-semibold'>Không tải được số liệu dashboard. Kiểm tra kết nối server.</span>
        </div>
        <button
          type='button'
          onClick={() => void summary.refetch()}
          className='inline-flex h-10 cursor-pointer items-center gap-2 rounded-lg bg-rose-600 px-5 text-sm font-semibold text-white hover:bg-rose-700'
        >
          <RefreshCw size={15} /> Thử lại
        </button>
      </div>
    )
  }

  return (
    <div className='space-y-6 pb-10'>
      {/* header */}
      <div className='flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between'>
        <div>
          <h1 className='font-display text-[1.75rem] font-bold leading-tight text-ink-950'>Tổng quan</h1>
          <p className='mt-1 text-sm text-ink-500'>
            {s ? `${vnDate(s.range.from)} – ${vnDate(s.range.to)} · giờ Việt Nam` : 'Đang tải…'}
          </p>
        </div>
        <div className='flex flex-wrap items-center gap-2'>
          <div role='tablist' aria-label='Khoảng thời gian' className='inline-flex rounded-full bg-white p-1 ring-1 ring-ink-100'>
            {PRESETS.map((p) => (
              <button
                key={p.id}
                type='button'
                role='tab'
                aria-selected={presetId === p.id}
                onClick={() => setPresetId(p.id)}
                className={cn(
                  'h-9 cursor-pointer rounded-lg px-4 text-sm font-semibold transition',
                  presetId === p.id ? 'bg-berry-50 text-berry-700' : 'text-ink-600 hover:text-ink-950'
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
          <button
            type='button'
            onClick={() => {
              void summary.refetch()
              void recent.refetch()
            }}
            aria-label='Làm mới số liệu'
            className='grid h-11 w-11 cursor-pointer place-items-center rounded-full bg-white text-ink-700 ring-1 ring-ink-100 hover:text-ink-950'
          >
            <RefreshCw size={17} className={cn(summary.isFetching && 'animate-spin')} />
          </button>
        </div>
      </div>

      {/* reconciliation */}
      {s && anomalyCount > 0 ? (
        <div className='rounded-3xl bg-peach-50 p-5 ring-1 ring-peach-200'>
          <div className='flex items-start gap-3'>
            <AlertTriangle size={20} className='mt-0.5 shrink-0 text-peach-700' aria-hidden />
            <div className='min-w-0 flex-1'>
              <p className='font-semibold text-ink-950'>{anomalyCount} đơn cần đối soát thanh toán</p>
              <p className='mt-0.5 text-sm text-ink-600'>Các đơn này không được tính vào doanh thu cho tới khi được xử lý.</p>
              <ul className='mt-3 space-y-2 text-sm'>
                {s.anomalies.paid_but_cancelled.count ? (
                  <li>
                    <span className='font-semibold'>{s.anomalies.paid_but_cancelled.count} đơn đã hủy nhưng đã thu tiền</span> (
                    {money(s.anomalies.paid_but_cancelled.amount)}) — cần hoàn tiền hoặc xác nhận lại.{' '}
                    {s.anomalies.paid_but_cancelled.order_ids.map((id) => (
                      <Link key={id} to={ROUTE_PATHS.ADMIN_ORDER_DETAIL(id)} className='mr-2 font-mono text-xs text-berry-700 underline'>
                        #{id.slice(-6).toUpperCase()}
                      </Link>
                    ))}
                  </li>
                ) : null}
                {s.anomalies.delivered_unpaid_online.count ? (
                  <li>
                    <span className='font-semibold'>{s.anomalies.delivered_unpaid_online.count} đơn đã giao nhưng thanh toán online chưa ghi nhận</span>{' '}
                    ({money(s.anomalies.delivered_unpaid_online.amount)}) — kiểm tra với cổng thanh toán.{' '}
                    {s.anomalies.delivered_unpaid_online.order_ids.map((id) => (
                      <Link key={id} to={ROUTE_PATHS.ADMIN_ORDER_DETAIL(id)} className='mr-2 font-mono text-xs text-berry-700 underline'>
                        #{id.slice(-6).toUpperCase()}
                      </Link>
                    ))}
                  </li>
                ) : null}
              </ul>
            </div>
          </div>
        </div>
      ) : null}

      {/* KPIs */}
      {!s ? (
        <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4' aria-busy='true'>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className='h-36 animate-pulse rounded-3xl bg-ink-100' />
          ))}
        </div>
      ) : (
        <div className={cn('grid gap-4 sm:grid-cols-2 xl:grid-cols-4 transition-opacity', summary.isFetching && 'opacity-60')}>
          <Kpi icon={Wallet} label='Doanh thu ghi nhận' value={money(s.revenue)} tone='bg-lime-200 text-lime-700' hint={`Chưa gồm ship: ${money(s.revenue_excl_shipping)}`}>
            <Change value={s.change.revenue} />
          </Kpi>
          <Kpi
            icon={ShoppingBag}
            label='Đơn đã thu tiền'
            value={`${s.recognized_orders}`}
            tone='bg-berry-100 text-berry-700'
            hint={`Giá trị TB: ${money(s.avg_order_value)} · ${s.total_orders} đơn tạo mới`}
          >
            <Change value={s.change.recognized_orders} />
          </Kpi>
          <Kpi
            icon={Clock}
            label='Đơn chờ thu tiền'
            value={`${s.open_orders}`}
            tone='bg-peach-100 text-peach-700'
            hint={`Giá trị: ${money(s.open_value)} · chưa tính vào doanh thu`}
          />
          <Kpi
            icon={Users}
            label='Khách hàng · Sản phẩm'
            value={`${s.catalog.customers} · ${s.catalog.products}`}
            tone='bg-lilac-100 text-lilac-700'
            hint='Tổng tài khoản khách và sản phẩm trong hệ thống'
          />
        </div>
      )}

      {s ? (
        <div className='grid gap-4 xl:grid-cols-[1.6fr_1fr]'>
          {/* revenue chart */}
          <section className='rounded-3xl bg-white p-5 ring-1 ring-ink-100 sm:p-6'>
            <div className='flex flex-wrap items-end justify-between gap-2'>
              <div>
                <h2 className='font-display text-lg font-bold'>Doanh thu theo {chart?.unit}</h2>
                <p className='text-sm text-ink-500'>Chỉ tính đơn đã thu tiền, theo ngày tạo đơn</p>
              </div>
              <p className='font-display text-xl font-bold'>{money(s.revenue)}</p>
            </div>
            {s.total_orders === 0 ? (
              <div className='mt-6 grid h-56 place-items-center rounded-2xl border border-dashed border-ink-200 text-sm text-ink-500'>
                Không có đơn hàng nào trong khoảng thời gian này.
              </div>
            ) : (
              <div className='mt-6 flex h-56 items-end gap-[3px]' role='img' aria-label={`Biểu đồ doanh thu theo ${chart?.unit}`}>
                {chart!.buckets.map((b) => (
                  <div key={b.title} className='group relative flex h-full flex-1 flex-col justify-end'>
                    <div
                      className={cn('w-full rounded-t-md transition', b.revenue ? 'bg-berry-500 group-hover:bg-berry-600' : 'bg-ink-100')}
                      style={{ height: `${b.revenue ? Math.max(4, (b.revenue / maxRevenue) * 100) : 2}%` }}
                    />
                    {b.orders ? <span className='absolute -top-1 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-berry-700' aria-hidden /> : null}
                    <div className='pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-xl bg-ink-950 px-3 py-2 text-xs text-white group-hover:block'>
                      <p className='font-semibold'>{b.title}</p>
                      <p>{money(b.revenue)}</p>
                      <p className='text-ink-300'>{b.orders} đơn tạo</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {chart && chart.buckets.length > 1 ? (
              <div className='mt-2 flex justify-between text-[11px] text-ink-400'>
                <span>{chart.buckets[0].label}</span>
                <span>{compactMoney(maxRevenue)} cao nhất</span>
                <span>{chart.buckets[chart.buckets.length - 1].label}</span>
              </div>
            ) : null}
          </section>

          {/* status mix */}
          <section className='rounded-3xl bg-white p-5 ring-1 ring-ink-100 sm:p-6'>
            <h2 className='font-display text-lg font-bold'>Trạng thái đơn</h2>
            <p className='text-sm text-ink-500'>{statusTotal} đơn tạo trong kỳ</p>
            {statusTotal ? (
              <div className='mt-5 flex h-3 overflow-hidden rounded-full bg-ink-100'>
                {STATUS_META.map((m) =>
                  s.by_status[m.key] ? (
                    <div key={m.key} className={m.color} style={{ width: `${(s.by_status[m.key] / statusTotal) * 100}%` }} />
                  ) : null
                )}
              </div>
            ) : null}
            <ul className='mt-5 space-y-2.5'>
              {STATUS_META.map((m) => (
                <li key={m.key} className='flex items-center justify-between text-sm'>
                  <span className='flex items-center gap-2 text-ink-700'>
                    <span className={cn('h-2.5 w-2.5 rounded-full', m.color)} aria-hidden />
                    {m.label}
                  </span>
                  <span className='font-semibold'>{s.by_status[m.key]}</span>
                </li>
              ))}
            </ul>
            <Link
              to={ROUTE_PATHS.ADMIN_ORDERS}
              className='mt-5 inline-flex items-center gap-1 text-sm font-semibold text-berry-600 hover:underline'
            >
              Quản lý đơn hàng <ChevronRight size={15} />
            </Link>
          </section>
        </div>
      ) : null}

      {s ? (
        <div className='grid gap-4 lg:grid-cols-2'>
          {/* top products */}
          <section className='rounded-3xl bg-white p-5 ring-1 ring-ink-100 sm:p-6'>
            <h2 className='font-display text-lg font-bold'>Bán chạy trong kỳ</h2>
            <p className='text-sm text-ink-500'>Theo số lượng trong các đơn đã thu tiền</p>
            {s.top_products.length === 0 ? (
              <p className='mt-6 text-sm text-ink-500'>Chưa có đơn đã thu tiền trong kỳ.</p>
            ) : (
              <ol className='mt-4 divide-y divide-ink-100'>
                {s.top_products.map((p, i) => {
                  const img = formatImageUrl(p.thumbnail)
                  return (
                    <li key={p._id} className='flex items-center gap-3 py-3'>
                      <span className='w-5 text-sm font-semibold text-ink-400'>{i + 1}</span>
                      <span className='h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-berry-50'>
                        {img ? <img src={img} alt='' className='h-full w-full object-cover' /> : null}
                      </span>
                      <span className='min-w-0 flex-1'>
                        <span className={cn('block truncate text-sm font-semibold', !p.name && 'italic text-ink-400')}>
                          {p.name || 'Sản phẩm đã bị xóa'}
                        </span>
                        <span className='text-xs text-ink-500'>{p.units} đã bán</span>
                      </span>
                      <span className='text-sm font-semibold'>{money(p.revenue)}</span>
                    </li>
                  )
                })}
              </ol>
            )}
          </section>

          {/* low stock */}
          <section className='rounded-3xl bg-white p-5 ring-1 ring-ink-100 sm:p-6'>
            <h2 className='flex items-center gap-2 font-display text-lg font-bold'>
              <Boxes size={18} className='text-berry-600' aria-hidden /> Sắp hết hàng
            </h2>
            <p className='text-sm text-ink-500'>Tồn kho ≤ {s.low_stock.threshold}</p>
            {s.low_stock.items.length === 0 ? (
              <div className='mt-6 flex items-center gap-3 rounded-2xl bg-lime-100 p-4 text-sm text-lime-700'>
                <Package size={18} aria-hidden /> Tồn kho an toàn — không có sản phẩm nào sắp hết.
              </div>
            ) : (
              <ul className='mt-4 divide-y divide-ink-100'>
                {s.low_stock.items.map((p) => (
                  <li key={p._id} className='flex items-center justify-between gap-3 py-3'>
                    <span className='truncate text-sm font-semibold'>{p.name}</span>
                    <span className='flex items-center gap-3'>
                      <span className={cn('chip px-2.5 py-0.5 text-xs', p.quantity <= 0 ? 'bg-rose-100 text-rose-700' : 'bg-peach-100 text-peach-700')}>
                        {p.quantity <= 0 ? 'Hết hàng' : `Còn ${p.quantity}`}
                      </span>
                      <Link to={ROUTE_PATHS.ADMIN_PRODUCT_EDIT(p._id)} className='text-sm font-semibold text-berry-600 hover:underline'>
                        Nhập thêm
                      </Link>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      ) : null}

      {/* recent orders */}
      <section className='rounded-3xl bg-white p-5 ring-1 ring-ink-100 sm:p-6'>
        <div className='flex items-center justify-between'>
          <h2 className='font-display text-lg font-bold'>Đơn mới nhất</h2>
          <Link to={ROUTE_PATHS.ADMIN_ORDERS} className='text-sm font-semibold text-berry-600 hover:underline'>
            Xem tất cả
          </Link>
        </div>
        {recent.isLoading ? (
          <div className='mt-4 h-40 animate-pulse rounded-2xl bg-ink-100' />
        ) : (recent.data ?? []).length === 0 ? (
          <p className='mt-4 text-sm text-ink-500'>Chưa có đơn hàng.</p>
        ) : (
          <div className='mt-4 overflow-x-auto'>
            <table className='w-full min-w-[560px] text-left text-sm'>
              <thead>
                <tr className='text-xs uppercase tracking-wider text-ink-400'>
                  <th className='pb-2 font-semibold'>Mã đơn</th>
                  <th className='pb-2 font-semibold'>Ngày tạo</th>
                  <th className='pb-2 font-semibold'>Trạng thái</th>
                  <th className='pb-2 text-right font-semibold'>Tổng tiền</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-ink-100'>
                {(recent.data ?? []).map((o) => {
                  const meta = getOrderStatusMeta(o.status)
                  return (
                    <tr key={o._id} className='hover:bg-ink-50'>
                      <td className='py-3'>
                        <Link to={ROUTE_PATHS.ADMIN_ORDER_DETAIL(o._id)} className='font-mono font-semibold text-ink-950 hover:text-berry-600'>
                          #{o._id.slice(-6).toUpperCase()}
                        </Link>
                      </td>
                      <td className='py-3 text-ink-600'>{formatDate(o.created_at)}</td>
                      <td className='py-3'>
                        <StatusBadge tone={meta.tone}>{meta.label}</StatusBadge>
                      </td>
                      <td className='py-3 text-right font-semibold'>{money(o.total_price)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
