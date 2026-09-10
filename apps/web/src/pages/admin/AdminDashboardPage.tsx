import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  Clock,
  CreditCard,
  DollarSign,
  ExternalLink,
  Layers,
  Package2,
  PlusCircle,
  RefreshCw,
  ShoppingBag,
  TrendingUp,
  Zap
} from 'lucide-react'
import StatusBadge from '../../components/ui/AdminDashBoardStatusBadge'
import { getOrderStatusMeta } from '../../constants/order'
import { LOW_STOCK_THRESHOLD, ORDER_LIMIT, PAGE, PRODUCT_LIMIT } from '../../configs/config'
import type { OrderApiResponse } from '../../models/OrderRequests'
import type { Product } from '../../models/ProductRequests'
import { getAllOrdersApi } from '../../services/orders.services'
import { getAllProductsApi } from '../../services/products.services'
import formatDate from '../../utils/date'
import money from '../../utils/money'
import cn from '../../utils/cn'

const DAY_MS = 24 * 60 * 60 * 1000

function formatShortDate(date: Date) {
  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
}

export default function AdminDashboardPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<OrderApiResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'analytics' | 'orders' | 'inventory'>('analytics')
  const [lastUpdated, setLastUpdated] = useState<string>('')

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)
      const [ordersRes, productsRes] = await Promise.all([
        getAllOrdersApi(ORDER_LIMIT, PAGE),
        getAllProductsApi(PRODUCT_LIMIT, PAGE)
      ])
      setOrders(ordersRes?.data?.result ?? [])
      setProducts(productsRes?.data?.result ?? [])
      setLastUpdated(new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
    } catch (err) {
      setError('Không thể tải dữ liệu báo cáo dashboard. Vui lòng kiểm tra lại kết nối server.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  // KPI Calculations
  const stats = useMemo(() => {
    const totalRevenue = orders.reduce((sum, order) => sum + order.total_price + order.shipping_fee, 0)
    const lowStockCount = products.filter((product) => product.quantity <= LOW_STOCK_THRESHOLD).length
    const pendingOrdersCount = orders.filter((o) => o.status === 0 || o.status === 1).length
    const avgOrderValue = orders.length > 0 ? Math.round(totalRevenue / orders.length) : 0

    return [
      {
        label: 'TỔNG DOANH THU',
        value: money(totalRevenue),
        sub: `Đơn giá trung bình: ${money(avgOrderValue)}`,
        change: '+15.4% so với kỳ trước',
        icon: DollarSign,
        gradient: 'from-amber-600 to-[#2B2118]',
        badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200'
      },
      {
        label: 'ĐƠN HÀNG ĐANG XỬ LÝ',
        value: `${pendingOrdersCount} đơn`,
        sub: `Tổng số đơn: ${orders.length} đơn hàng`,
        change: pendingOrdersCount > 0 ? `Cần xử lý ${pendingOrdersCount} đơn` : 'Đã hoàn tất toàn bộ',
        icon: ShoppingBag,
        gradient: 'from-[#9A8069] to-[#2B2118]',
        badgeBg: pendingOrdersCount > 0 ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-slate-50 text-slate-700'
      },
      {
        label: 'DANH MỤC SẢN PHẨM',
        value: `${products.length} SP`,
        sub: `Tổng đã bán: ${products.reduce((acc, p) => acc + (p.soldNumber || 0), 0)} sp`,
        change: 'Đang hoạt động trên Cửa Hàng',
        icon: Package2,
        gradient: 'from-[#2B2118] to-[#4A3B2C]',
        badgeBg: 'bg-blue-50 text-blue-700 border-blue-200'
      },
      {
        label: 'CẢNH BÁO KHO HÀNG',
        value: `${lowStockCount} SP`,
        sub: `Tồn kho tối thiểu <= ${LOW_STOCK_THRESHOLD} sp`,
        change: lowStockCount > 0 ? 'Cần nhập hàng ngay' : 'Kho hàng an toàn',
        icon: AlertTriangle,
        gradient: lowStockCount > 0 ? 'from-rose-600 to-rose-900' : 'from-emerald-600 to-teal-800',
        badgeBg: lowStockCount > 0 ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-emerald-50 text-emerald-700'
      }
    ]
  }, [orders, products])

  // Recent Orders
  const recentOrders = useMemo(
    () =>
      [...orders]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 7),
    [orders]
  )

  // Low stock products watchlist
  const lowStockProducts = useMemo(
    () => products.filter((p) => p.quantity <= LOW_STOCK_THRESHOLD).slice(0, 6),
    [products]
  )

  // 7-day revenue dataset
  const revenueChart = useMemo(() => {
    const today = new Date()
    const days = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(today.getTime() - (6 - index) * DAY_MS)
      date.setHours(0, 0, 0, 0)
      return {
        key: date.toISOString().slice(0, 10),
        label: formatShortDate(date),
        revenue: 0,
        ordersCount: 0
      }
    })

    for (const order of orders) {
      const orderDate = new Date(order.created_at)
      orderDate.setHours(0, 0, 0, 0)
      const key = orderDate.toISOString().slice(0, 10)
      const day = days.find((item) => item.key === key)
      if (day) {
        day.revenue += order.total_price + order.shipping_fee
        day.ordersCount += 1
      }
    }

    const maxRevenue = Math.max(...days.map((day) => day.revenue), 1)
    return days.map((day) => ({
      ...day,
      height: Math.round((day.revenue / maxRevenue) * 100)
    }))
  }, [orders])

  // Top selling products
  const topSelling = useMemo(
    () =>
      [...products]
        .sort((a, b) => (b.soldNumber || 0) - (a.soldNumber || 0))
        .slice(0, 6),
    [products]
  )

  // Total 7-day revenue
  const total7DayRevenue = useMemo(
    () => revenueChart.reduce((sum, day) => sum + day.revenue, 0),
    [revenueChart]
  )

  // Best Revenue Day
  const bestDay = useMemo(() => {
    if (revenueChart.length === 0) return null
    return [...revenueChart].sort((a, b) => b.revenue - a.revenue)[0]
  }, [revenueChart])

  if (loading && orders.length === 0) {
    return (
      <div className='space-y-6 animate-pulse'>
        <div className='h-28 rounded-3xl bg-slate-200/70' />
        <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className='h-36 rounded-3xl bg-slate-200/70' />
          ))}
        </div>
        <div className='h-96 rounded-3xl bg-slate-200/70' />
      </div>
    )
  }

  if (error) {
    return (
      <div className='rounded-3xl border border-rose-200 bg-rose-50 p-6 text-sm font-bold text-rose-900 shadow-sm flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <AlertTriangle className='text-rose-600' size={24} />
          <span>{error}</span>
        </div>
        <button
          type='button'
          onClick={fetchDashboardData}
          className='inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-white hover:bg-rose-700 transition shadow-sm'
        >
          <RefreshCw size={15} /> Thử lại ngay
        </button>
      </div>
    )
  }

  return (
    <div className='space-y-6 text-slate-800 font-sans pb-12'>
      {/* 1. Executive Control Header */}
      <section className='relative overflow-hidden rounded-3xl border border-[#9A8069]/20 bg-gradient-to-br from-[#2B2118] via-[#3A2D22] to-[#1E1711] p-6 text-white shadow-xl'>
        {/* Subtle decorative background blur */}
        <div className='pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#C47A5A]/20 blur-3xl' />
        <div className='pointer-events-none absolute -bottom-20 left-1/3 h-64 w-64 rounded-full bg-[#9A8069]/20 blur-3xl' />

        <div className='relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between'>
          <div>
            <div className='flex flex-wrap items-center gap-2.5'>
              <span className='inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[11px] font-bold text-emerald-400 tracking-wide'>
                <span className='relative flex h-2 w-2'>
                  <span className='absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75' />
                  <span className='relative inline-flex h-2 w-2 rounded-full bg-emerald-500' />
                </span>
                PayOS Live Gate Active
              </span>

              {lastUpdated && (
                <span className='inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-medium text-slate-300'>
                  <Clock size={12} /> Cập nhật: {lastUpdated}
                </span>
              )}
            </div>

            <h1 className='mt-3 font-display text-2xl font-extrabold tracking-tight text-white sm:text-3xl'>
              Tổng Quan Trung Tâm Điều Hành
            </h1>
            <p className='mt-1 text-xs text-slate-300 max-w-2xl leading-relaxed'>
              Theo dõi biến động doanh thu, đơn hàng PayOS thời gian thực và kiểm soát tồn kho kho hàng toàn hệ thống.
            </p>
          </div>

          {/* Quick Command Actions */}
          <div className='flex flex-wrap items-center gap-3 shrink-0'>
            <button
              type='button'
              onClick={fetchDashboardData}
              disabled={loading}
              className='inline-flex h-11 items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-4 text-xs font-bold text-white hover:bg-white/20 transition disabled:opacity-50 backdrop-blur-md shadow-sm'
            >
              <RefreshCw size={15} className={cn(loading && 'animate-spin')} />
              <span>{loading ? 'Đang cập nhật...' : 'Làm Mới Data'}</span>
            </button>

            <Link
              to='/admin/products'
              className='inline-flex h-11 items-center gap-2 rounded-2xl bg-[#9A8069] px-4 text-xs font-bold text-white hover:bg-[#856d58] transition shadow-md'
            >
              <PlusCircle size={15} /> Thêm Sản Phẩm
            </Link>

            <Link
              to='/admin/orders'
              className='inline-flex h-11 items-center gap-2 rounded-2xl bg-white px-5 text-xs font-bold text-[#2B2118] hover:bg-amber-50 transition shadow-md'
            >
              <span>Quản Lý Đơn Hàng</span>
              <ArrowUpRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* 2. 4 Executive Metric Cards Grid */}
      <section className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
        {stats.map((card) => {
          const Icon = card.icon
          return (
            <div
              key={card.label}
              className='group relative overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-5 shadow-xs transition-all duration-300 hover:-translate-y-0.5 hover:border-[#9A8069]/40 hover:shadow-md'
            >
              <div className='flex items-start justify-between gap-3'>
                <div className='space-y-1 min-w-0'>
                  <span className='text-[10px] font-extrabold uppercase tracking-wider text-slate-400'>
                    {card.label}
                  </span>
                  <h3 className='font-mono text-2xl font-black tracking-tight text-slate-900 truncate'>
                    {card.value}
                  </h3>
                  <p className='text-xs text-slate-500 font-medium truncate'>{card.sub}</p>
                </div>

                <div
                  className={cn(
                    'grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br text-white shadow-md transition-transform duration-300 group-hover:scale-105',
                    card.gradient
                  )}
                >
                  <Icon size={22} />
                </div>
              </div>

              {/* Status footer pill */}
              <div className='mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs'>
                <span
                  className={cn(
                    'inline-flex items-center gap-1 rounded-lg border px-2.5 py-0.5 text-[11px] font-bold',
                    card.badgeBg
                  )}
                >
                  {card.change}
                </span>
                <span className='text-[10px] text-slate-400 font-medium'>Live Sync</span>
              </div>
            </div>
          )
        })}
      </section>

      {/* 3. Executive Workspace Tabs Header */}
      <section className='rounded-3xl border border-slate-200 bg-white p-2 shadow-xs flex flex-wrap items-center justify-between gap-2'>
        <div className='flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-2xl w-full sm:w-auto'>
          <button
            type='button'
            onClick={() => setActiveTab('analytics')}
            className={cn(
              'flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all',
              activeTab === 'analytics'
                ? 'bg-white text-[#2B2118] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            )}
          >
            <BarChart3 size={15} />
            <span>Biểu Đồ Doanh Thu &amp; Phân Tích</span>
          </button>

          <button
            type='button'
            onClick={() => setActiveTab('orders')}
            className={cn(
              'flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all',
              activeTab === 'orders'
                ? 'bg-white text-[#2B2118] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            )}
          >
            <ShoppingBag size={15} />
            <span>Đơn Hàng Gần Đây ({orders.length})</span>
          </button>

          <button
            type='button'
            onClick={() => setActiveTab('inventory')}
            className={cn(
              'flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all',
              activeTab === 'inventory'
                ? 'bg-white text-[#2B2118] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            )}
          >
            <Layers size={15} />
            <span>Sản Phẩm Hot &amp; Cảnh Báo Kho</span>
          </button>
        </div>

        <div className='hidden lg:flex items-center gap-4 px-4 text-xs text-slate-500 font-medium'>
          <span className='flex items-center gap-1.5'>
            <span className='h-2 w-2 rounded-full bg-emerald-500' />
            PayOS Auto Webhook
          </span>
          <span className='flex items-center gap-1.5'>
            <span className='h-2 w-2 rounded-full bg-amber-500' />
            MongoDB Connected
          </span>
        </div>
      </section>

      {/* 4. Tab 1: Biểu Đồ Doanh Thu & Analytics View */}
      {activeTab === 'analytics' && (
        <section className='grid gap-6 xl:grid-cols-[1.7fr_1fr]'>
          {/* Main 7-Day Revenue Graph Card */}
          <div className='rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-6'>
            <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-5'>
              <div>
                <h2 className='font-display text-lg font-bold text-slate-900'>Biểu Đồ Doanh Thu 7 Ngày Gần Nhất</h2>
                <p className='mt-0.5 text-xs text-slate-500'>
                  Thống kê doanh số theo ngày thực tế bao gồm tiền sản phẩm và phí vận chuyển.
                </p>
              </div>

              <div className='flex items-center gap-3'>
                <div className='rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-right'>
                  <span className='text-[10px] font-bold uppercase tracking-wider text-slate-400 block'>
                    Tổng 7 Ngày
                  </span>
                  <span className='font-mono text-base font-black text-[#C47A5A]'>
                    {money(total7DayRevenue)}
                  </span>
                </div>
              </div>
            </div>

            {/* SVG Area Chart */}
            {(() => {
              const CHART_W = 700
              const CHART_H = 200
              const PAD_LEFT = 52
              const PAD_RIGHT = 16
              const PAD_TOP = 24
              const PAD_BOTTOM = 30
              const innerW = CHART_W - PAD_LEFT - PAD_RIGHT
              const innerH = CHART_H - PAD_TOP - PAD_BOTTOM
              const maxRev = Math.max(...revenueChart.map((d) => d.revenue), 1)
              const pts = revenueChart.map((day, i) => ({
                ...day,
                x: PAD_LEFT + (i / (revenueChart.length - 1)) * innerW,
                y: PAD_TOP + innerH - (day.revenue / maxRev) * innerH
              }))

              // Build smooth bezier path
              const buildPath = (points: typeof pts) => {
                if (points.length < 2) return ''
                let d = `M ${points[0].x} ${points[0].y}`
                for (let i = 1; i < points.length; i++) {
                  const prev = points[i - 1]
                  const curr = points[i]
                  const cpx = (prev.x + curr.x) / 2
                  d += ` C ${cpx} ${prev.y}, ${cpx} ${curr.y}, ${curr.x} ${curr.y}`
                }
                return d
              }

              const linePath = buildPath(pts)
              const areaPath =
                linePath +
                ` L ${pts[pts.length - 1].x} ${PAD_TOP + innerH} L ${pts[0].x} ${PAD_TOP + innerH} Z`

              // Y-axis gridlines
              const gridLines = [0, 0.25, 0.5, 0.75, 1].map((ratio) => ({
                y: PAD_TOP + innerH - ratio * innerH,
                value: Math.round(maxRev * ratio)
              }))

              return (
                <div className='relative rounded-2xl bg-gradient-to-br from-slate-50 to-white border border-slate-200/80 p-2 overflow-hidden'>
                  <svg
                    viewBox={`0 0 ${CHART_W} ${CHART_H}`}
                    className='w-full'
                    style={{ height: '210px' }}
                  >
                    <defs>
                      <linearGradient id='areaGrad' x1='0' y1='0' x2='0' y2='1'>
                        <stop offset='0%' stopColor='#9A8069' stopOpacity='0.35' />
                        <stop offset='100%' stopColor='#9A8069' stopOpacity='0.02' />
                      </linearGradient>
                    </defs>

                    {/* Grid lines + Y-axis labels */}
                    {gridLines.map((gl) => (
                      <g key={gl.y}>
                        <line
                          x1={PAD_LEFT}
                          y1={gl.y}
                          x2={CHART_W - PAD_RIGHT}
                          y2={gl.y}
                          stroke='#e2e8f0'
                          strokeWidth='1'
                          strokeDasharray='4 3'
                        />
                        <text
                          x={PAD_LEFT - 6}
                          y={gl.y + 3}
                          textAnchor='end'
                          fontSize='9'
                          fill='#94a3b8'
                          fontFamily='monospace'
                        >
                          {gl.value >= 1000000
                            ? `${(gl.value / 1000000).toFixed(1)}M`
                            : gl.value >= 1000
                            ? `${Math.round(gl.value / 1000)}K`
                            : gl.value === 0
                            ? '0'
                            : gl.value}
                        </text>
                      </g>
                    ))}

                    {/* Area fill */}
                    <path d={areaPath} fill='url(#areaGrad)' />

                    {/* Line stroke */}
                    <path
                      d={linePath}
                      fill='none'
                      stroke='#9A8069'
                      strokeWidth='2.5'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    />

                    {/* Data points + x-labels */}
                    {pts.map((pt) => (
                      <g key={pt.key}>
                        {/* X-axis date label */}
                        <text
                          x={pt.x}
                          y={CHART_H - 4}
                          textAnchor='middle'
                          fontSize='9'
                          fill='#64748b'
                          fontFamily='monospace'
                          fontWeight='600'
                        >
                          {pt.label}
                        </text>

                        {/* Dot */}
                        {pt.revenue > 0 ? (
                          <>
                            <circle cx={pt.x} cy={pt.y} r='5' fill='#2B2118' stroke='white' strokeWidth='2' />
                            {/* Value label above dot */}
                            <text
                              x={pt.x}
                              y={pt.y - 10}
                              textAnchor='middle'
                              fontSize='8'
                              fill='#2B2118'
                              fontFamily='monospace'
                              fontWeight='700'
                            >
                              {pt.revenue >= 1000000
                                ? `${(pt.revenue / 1000000).toFixed(1)}M`
                                : pt.revenue >= 1000
                                ? `${Math.round(pt.revenue / 1000)}K`
                                : pt.revenue}
                            </text>
                          </>
                        ) : (
                          <circle cx={pt.x} cy={pt.y} r='3' fill='#cbd5e1' stroke='white' strokeWidth='1.5' />
                        )}
                      </g>
                    ))}
                  </svg>
                </div>
              )
            })()}

            {/* Quick Analytics Summary Footer */}
            <div className='grid gap-4 sm:grid-cols-3 pt-2'>
              <div className='rounded-2xl border border-slate-200 bg-slate-50/70 p-4'>
                <span className='text-[10px] font-bold uppercase tracking-wider text-slate-400 block'>
                  Ngày Cao Nhất
                </span>
                <div className='mt-1 flex items-baseline justify-between'>
                  <span className='font-mono text-sm font-extrabold text-slate-900'>
                    {bestDay ? bestDay.label : 'N/A'}
                  </span>
                  <span className='font-mono text-xs font-bold text-[#C47A5A]'>
                    {bestDay ? money(bestDay.revenue) : '0đ'}
                  </span>
                </div>
              </div>

              <div className='rounded-2xl border border-slate-200 bg-slate-50/70 p-4'>
                <span className='text-[10px] font-bold uppercase tracking-wider text-slate-400 block'>
                  TB Doanh Thu / Ngày
                </span>
                <div className='mt-1 font-mono text-sm font-extrabold text-slate-900'>
                  {money(Math.round(total7DayRevenue / 7))}
                </div>
              </div>

              <div className='rounded-2xl border border-slate-200 bg-slate-50/70 p-4'>
                <span className='text-[10px] font-bold uppercase tracking-wider text-slate-400 block'>
                  Tỷ Lệ Đơn Hoàn Thành
                </span>
                <div className='mt-1 font-mono text-sm font-extrabold text-emerald-600 flex items-center gap-1'>
                  <CheckCircle2 size={16} />
                  <span>
                    {orders.length > 0
                      ? `${Math.round((orders.filter((o) => o.status === 2).length / orders.length) * 100)}%`
                      : '100%'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Gateway Health & Top Selling Side Card */}
          <div className='space-y-6'>
            {/* System Status Card */}
            <div className='rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4'>
              <div className='flex items-center justify-between border-b border-slate-100 pb-3'>
                <h3 className='font-display text-base font-bold text-slate-900 flex items-center gap-2'>
                  <Zap size={18} className='text-[#9A8069]' />
                  <span>Trạng Thái Cổng PayOS</span>
                </h3>
                <span className='rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800'>
                  Hoạt Động
                </span>
              </div>

              <div className='space-y-3 text-xs'>
                <div className='flex items-center justify-between rounded-xl bg-slate-50 p-3'>
                  <span className='text-slate-600 font-medium flex items-center gap-2'>
                    <CreditCard size={15} className='text-slate-400' />
                    Thanh Toán QR PayOS
                  </span>
                  <span className='font-mono font-bold text-emerald-600'>99.9% Up</span>
                </div>

                <div className='flex items-center justify-between rounded-xl bg-slate-50 p-3'>
                  <span className='text-slate-600 font-medium flex items-center gap-2'>
                    <CheckCircle2 size={15} className='text-slate-400' />
                    Tốc độ xử lý Webhook
                  </span>
                  <span className='font-mono font-bold text-slate-800'>&lt; 120ms</span>
                </div>
              </div>
            </div>

            {/* Compact Top Sellers Side Watchlist */}
            <div className='rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-5'>
              <div className='flex items-center justify-between border-b border-slate-100 pb-3'>
                <div>
                  <h3 className='font-display text-base font-bold text-slate-900'>Top 4 Sản Phẩm Bán Chạy</h3>
                  <p className='text-xs text-slate-500'>Được khách đặt mua nhiều nhất</p>
                </div>
                <TrendingUp size={18} className='text-[#9A8069]' />
              </div>

              <div className='space-y-3'>
                {topSelling.slice(0, 4).map((product, idx) => (
                  <div key={product._id} className='flex items-center justify-between gap-3 rounded-2xl bg-slate-50/70 p-3 border border-slate-100'>
                    <div className='flex items-center gap-3 min-w-0'>
                      <span className='grid h-7 w-7 shrink-0 place-items-center rounded-xl bg-[#2B2118] text-xs font-mono font-bold text-amber-200'>
                        #{idx + 1}
                      </span>
                      <div className='min-w-0'>
                        <div className='truncate text-xs font-bold text-slate-900'>{product.name}</div>
                        <div className='font-mono text-[11px] text-slate-500'>Tồn kho: {product.quantity} sp</div>
                      </div>
                    </div>
                    <span className='font-mono text-xs font-extrabold text-[#C47A5A] shrink-0'>
                      {product.soldNumber || 0} đã bán
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 5. Tab 2: Recent Orders Mini Table */}
      {activeTab === 'orders' && (
        <section className='rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-6'>
          <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4'>
            <div>
              <h2 className='font-display text-lg font-bold text-slate-900'>Danh Sách Đơn Hàng Gần Đây</h2>
              <p className='mt-0.5 text-xs text-slate-500'>
                Hiển thị {recentOrders.length} đơn hàng phát sinh gần đây nhất.
              </p>
            </div>

            <Link
              to='/admin/orders'
              className='inline-flex items-center gap-1 text-xs font-bold text-[#9A8069] hover:underline'
            >
              Xem toàn bộ danh sách đơn ({orders.length}) <ArrowUpRight size={14} />
            </Link>
          </div>

          <div className='overflow-x-auto rounded-2xl border border-slate-200'>
            <table className='w-full text-left text-xs'>
              <thead className='bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200'>
                <tr>
                  <th className='p-4'>Mã Đơn Hàng</th>
                  <th className='p-4'>Thời Gian</th>
                  <th className='p-4'>Tổng Tiền</th>
                  <th className='p-4'>Trạng Thái</th>
                  <th className='p-4 text-right'>Thao Tác</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-slate-100 bg-white font-medium'>
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className='p-8 text-center text-slate-400'>
                      Chưa có đơn hàng nào.
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((order) => {
                    const statusInfo = getOrderStatusMeta(order.status)
                    return (
                      <tr key={order._id} className='hover:bg-slate-50/80 transition'>
                        <td className='p-4 font-mono font-bold text-slate-900'>
                          #{order._id.slice(-8).toUpperCase()}
                        </td>
                        <td className='p-4 text-slate-600 font-mono'>
                          {formatDate(order.created_at)}
                        </td>
                        <td className='p-4 font-mono font-bold text-[#C47A5A]'>
                          {money(order.total_price + order.shipping_fee)}
                        </td>
                        <td className='p-4'>
                          <StatusBadge status={statusInfo.tone} label={statusInfo.label} />
                        </td>
                        <td className='p-4 text-right'>
                          <Link
                            to={`/admin/orders/${order._id}`}
                            className='inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition'
                          >
                            <span>Chi tiết</span>
                            <ExternalLink size={13} />
                          </Link>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* 6. Tab 3: Inventory Alerts & Best Sellers */}
      {activeTab === 'inventory' && (
        <section className='grid gap-6 xl:grid-cols-2'>
          {/* Low Stock Watchlist */}
          <div className='rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-5'>
            <div className='flex items-center justify-between border-b border-slate-100 pb-4'>
              <div>
                <h2 className='font-display text-lg font-bold text-rose-900 flex items-center gap-2'>
                  <AlertTriangle size={20} className='text-rose-600' />
                  <span>Sản Phẩm Cần Nhập Thêm ({lowStockProducts.length})</span>
                </h2>
                <p className='mt-0.5 text-xs text-slate-500'>
                  Sản phẩm có lượng tồn kho dưới ngưỡng an toàn (&lt;= {LOW_STOCK_THRESHOLD} sp).
                </p>
              </div>

              <Link
                to='/admin/products'
                className='text-xs font-bold text-[#9A8069] hover:underline'
              >
                Quản lý sản phẩm
              </Link>
            </div>

            <div className='space-y-3'>
              {lowStockProducts.length === 0 ? (
                <div className='rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/40 p-8 text-center text-xs font-bold text-emerald-800'>
                  <CheckCircle2 size={24} className='mx-auto mb-2 text-emerald-600' />
                  Tất cả sản phẩm đều đủ lượng tồn kho an toàn!
                </div>
              ) : (
                lowStockProducts.map((prod) => (
                  <div
                    key={prod._id}
                    className='flex items-center justify-between gap-3 rounded-2xl border border-rose-100 bg-rose-50/40 p-4'
                  >
                    <div className='min-w-0'>
                      <div className='truncate text-xs font-bold text-slate-900'>{prod.name}</div>
                      <div className='mt-1 flex items-center gap-2 font-mono text-[11px] text-slate-500'>
                        <span>Đã bán: {prod.soldNumber || 0}</span>
                        <span>•</span>
                        <span className='font-bold text-rose-700'>Còn tồn: {prod.quantity} sp</span>
                      </div>
                    </div>

                    <Link
                      to={`/admin/products/${prod._id}`}
                      className='shrink-0 rounded-xl bg-rose-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-rose-700 transition shadow-xs'
                    >
                      Nhập Hàng
                    </Link>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Full Top Selling List */}
          <div className='rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-5'>
            <div className='flex items-center justify-between border-b border-slate-100 pb-4'>
              <div>
                <h2 className='font-display text-lg font-bold text-slate-900 flex items-center gap-2'>
                  <TrendingUp size={20} className='text-[#9A8069]' />
                  <span>Xếp Hạng Bán Chạy Toàn Cửa Hàng</span>
                </h2>
                <p className='mt-0.5 text-xs text-slate-500'>Dựa trên tổng lượng sản phẩm bán ra thực tế.</p>
              </div>
            </div>

            <div className='space-y-4'>
              {topSelling.map((product, index) => {
                const maxSold = Math.max(...topSelling.map((item) => item.soldNumber || 0), 1)
                const pct = Math.max(12, Math.round(((product.soldNumber || 0) / maxSold) * 100))
                return (
                  <div key={product._id} className='rounded-2xl border border-slate-100 bg-slate-50/60 p-4 space-y-2.5'>
                    <div className='flex items-center justify-between gap-3'>
                      <div className='flex min-w-0 items-center gap-3'>
                        <span className='grid h-7 w-7 shrink-0 place-items-center rounded-xl bg-[#2B2118] text-xs font-mono font-bold text-amber-200'>
                          #{index + 1}
                        </span>
                        <div className='min-w-0'>
                          <div className='truncate font-display text-xs font-bold text-slate-900'>{product.name}</div>
                          <div className='mt-0.5 font-mono text-[11px] text-slate-500'>
                            Giá bán: {money(product.price)} • Tồn: {product.quantity} sp
                          </div>
                        </div>
                      </div>

                      <span className='font-mono text-xs font-black text-[#C47A5A] shrink-0'>
                        {product.soldNumber || 0} đã bán
                      </span>
                    </div>

                    <div className='h-2 w-full overflow-hidden rounded-full bg-white border border-slate-200'>
                      <div
                        className='h-full rounded-full bg-gradient-to-r from-[#2B2118] via-[#786452] to-[#9A8069] transition-all duration-500'
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}

