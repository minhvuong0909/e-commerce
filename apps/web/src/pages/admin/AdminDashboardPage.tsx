import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, ArrowRight, Package2, ShoppingBag, TrendingUp, Wallet } from 'lucide-react'
import StatusBadge from './../../components/ui/AdminDashBoardStatusBadge'
import { getOrderStatusMeta } from './../../constants/order'
import { LOW_STOCK_THRESHOLD, ORDER_LIMIT, PAGE, PRODUCT_LIMIT } from '../../configs/config'
import type { OrderApiResponse } from './../../models/OrderRequests'
import type { Product } from './../../models/ProductRequests'
import { getAllOrdersApi } from './../../services/orders.services'
import { getAllProductsApi } from './../../services/products.services'
import formatDate from './../../utils/date'
import money from './../../utils/money'
import cn from './../../utils/cn'

const DAY_MS = 24 * 60 * 60 * 1000

function formatShortDate(date: Date) {
  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
}

export default function AdminDashboardPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<OrderApiResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        setError(null)
        const [ordersRes, productsRes] = await Promise.all([
          getAllOrdersApi(ORDER_LIMIT, PAGE),
          getAllProductsApi(PRODUCT_LIMIT, PAGE)
        ])
        if (!isMounted) return
        setOrders(ordersRes?.data?.result ?? [])
        setProducts(productsRes?.data?.result ?? [])
      } catch (err) {
        if (!isMounted) return
        setError('Không tải được dữ liệu dashboard')
        console.error(err)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchDashboardData()
    return () => {
      isMounted = false
    }
  }, [])

  const stats = useMemo(() => {
    const totalRevenue = orders.reduce((sum, order) => sum + order.total_price + order.shipping_fee, 0)
    const lowStockCount = products.filter((product) => product.quantity <= LOW_STOCK_THRESHOLD).length
    return [
      { label: 'Đơn hàng', value: String(orders.length), sub: `Top ${ORDER_LIMIT} đơn mới nhất`, icon: ShoppingBag },
      { label: 'Doanh thu', value: money(totalRevenue), sub: 'Theo dữ liệu đang hiển thị', icon: Wallet },
      { label: 'Sản phẩm', value: String(products.length), sub: `Top ${PRODUCT_LIMIT} sản phẩm`, icon: Package2 },
      {
        label: 'Sắp hết hàng',
        value: String(lowStockCount),
        sub: `Tồn kho <= ${LOW_STOCK_THRESHOLD}`,
        icon: AlertTriangle
      }
    ]
  }, [orders, products])

  const recentOrders = useMemo(
    () =>
      [...orders]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5),
    [orders]
  )

  const revenueChart = useMemo(() => {
    const today = new Date()
    const days = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(today.getTime() - (6 - index) * DAY_MS)
      date.setHours(0, 0, 0, 0)
      return {
        key: date.toISOString().slice(0, 10),
        label: formatShortDate(date),
        revenue: 0,
        orders: 0
      }
    })

    for (const order of orders) {
      const orderDate = new Date(order.created_at)
      orderDate.setHours(0, 0, 0, 0)
      const key = orderDate.toISOString().slice(0, 10)
      const day = days.find((item) => item.key === key)
      if (day) {
        day.revenue += order.total_price + order.shipping_fee
        day.orders += 1
      }
    }

    const maxRevenue = Math.max(...days.map((day) => day.revenue), 1)
    return days.map((day) => ({
      ...day,
      height: Math.round((day.revenue / maxRevenue) * 100)
    }))
  }, [orders])

  const topSelling = useMemo(
    () =>
      [...products]
        .sort((a, b) => (b.soldNumber || 0) - (a.soldNumber || 0))
        .slice(0, 5),
    [products]
  )

  if (loading) {
    return (
      <div className='space-y-5'>
        <div className='h-36 animate-pulse rounded-3xl bg-white shadow-sm' />
        <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className='h-32 animate-pulse rounded-3xl bg-white shadow-sm' />
          ))}
        </div>
        <div className='grid gap-4 xl:grid-cols-[1.55fr_1fr]'>
          <div className='h-96 animate-pulse rounded-3xl bg-white shadow-sm' />
          <div className='h-96 animate-pulse rounded-3xl bg-white shadow-sm' />
        </div>
      </div>
    )
  }

  if (error) {
    return <div className='rounded-3xl border border-rose-200 bg-rose-50 px-6 py-5 text-sm font-bold text-rose-900'>{error}</div>
  }

  return (
    <div className='space-y-6'>
      <section className='animate-fade-up py-2'>
        <div className='flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between'>
          <div>
            <div className='inline-flex items-center gap-2 rounded-full border border-[#e4e4e7] bg-[#fafafa] px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-[#52525b]'>
              Tổng quan cửa hàng
            </div>
            <h1 className='mt-4 text-3xl font-semibold tracking-tight text-[#3d3330]'>Dashboard</h1>
            <p className='mt-2 max-w-2xl text-sm leading-6 text-slate-500'>
              Theo dõi đơn hàng, doanh thu và tồn kho thấp trong cùng một không gian quản trị.
            </p>
          </div>

          <Link
            to='/admin/orders'
            className='inline-flex h-10 w-fit items-center justify-center gap-2 rounded-lg border border-[#e4e4e7] bg-white px-5 text-sm font-semibold text-[#3d3330] transition hover:border-[#cbb8af] hover:bg-[#fafafa]'
          >
            Xem đơn hàng <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <section className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
        {stats.map((card) => {
          const Icon = card.icon
          return (
            <div key={card.label} className='surface-card rounded-2xl p-4'>
              <div className='flex items-start justify-between gap-3'>
                <div>
                  <p className='text-xs font-black uppercase tracking-[0.14em] text-slate-400'>{card.label}</p>
                  <h3 className='mt-2 text-2xl font-semibold tracking-tight text-ink-950'>{card.value}</h3>
                  <p className='mt-1 text-xs font-medium text-slate-500'>{card.sub}</p>
                </div>
                <span className='grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-slate-100 text-ink-950'>
                  <Icon size={19} />
                </span>
              </div>
            </div>
          )
        })}
      </section>

      <section className='grid gap-4 xl:grid-cols-[1.55fr_1fr]'>
        <div className='surface-card rounded-3xl p-5 md:p-6'>
          <div className='mb-6 rounded-3xl border border-[#eaded8] bg-white p-5 shadow-xs'>
            <div className='flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between border-b border-[#f2e7e1] pb-4'>
              <div>
                <h2 className='text-lg font-bold text-[#3d3330]'>Doanh thu 7 ngày gần nhất</h2>
                <p className='mt-1 text-xs text-[#8a7a74]'>Thống kê chi tiết doanh thu thực tế và số đơn phát sinh theo ngày.</p>
              </div>
              <div className='flex items-center gap-3'>
                <div className='rounded-2xl border border-[#eaded8] bg-[#fdf8f6] px-4 py-2 text-right shadow-xs'>
                  <p className='text-[10px] font-bold uppercase tracking-wider text-[#8a7a74]'>Tổng 7 ngày</p>
                  <p className='mt-0.5 text-sm font-black text-[#c65f4a]'>
                    {money(revenueChart.reduce((sum, day) => sum + day.revenue, 0))}
                  </p>
                </div>
              </div>
            </div>

            <div className='mt-6 flex h-64 items-end gap-2.5 sm:gap-4 rounded-2xl bg-[#faf5f3] p-4 sm:p-6 border border-[#eaded8]/60'>
              {revenueChart.map((day) => {
                const hasRevenue = day.revenue > 0
                const barHeight = Math.max(day.height, hasRevenue ? 12 : 4)

                return (
                  <div key={day.key} className='flex h-full min-w-0 flex-1 flex-col justify-end gap-2'>
                    {/* Amount tag on top of active bar */}
                    <div className='text-center min-h-6 flex items-center justify-center'>
                      {hasRevenue ? (
                        <span className='rounded-full bg-[#c65f4a] px-2 py-0.5 text-[10px] font-bold text-white shadow-xs animate-in fade-in'>
                          {money(day.revenue)}
                        </span>
                      ) : (
                        <span className='text-[10px] font-semibold text-[#a89890]'>0đ</span>
                      )}
                    </div>

                    {/* Chart Bar track container */}
                    <div className='group relative flex flex-1 items-end justify-center rounded-2xl bg-white border border-[#eaded8] p-1 shadow-inner overflow-visible'>
                      <div
                        className={cn(
                          'w-full max-w-10 rounded-xl transition-all duration-500 group-hover:brightness-110',
                          hasRevenue
                            ? 'bg-gradient-to-t from-[#3d3330] via-[#594944] to-[#c65f4a] shadow-md shadow-[#c65f4a]/20'
                            : 'bg-[#eaded8]/50'
                        )}
                        style={{ height: `${barHeight}%` }}
                      />

                      {/* Tooltip on Hover */}
                      <div className='pointer-events-none absolute bottom-[calc(100%+6px)] z-20 hidden rounded-xl bg-[#3d3330] px-3 py-2 text-center text-xs font-bold text-white shadow-xl group-hover:block'>
                        <div className='text-[#f0b3a4]'>{day.label}</div>
                        <div>{money(day.revenue)}</div>
                        <div className='mt-0.5 text-[10px] font-normal text-white/80'>{day.orders} đơn hàng</div>
                      </div>
                    </div>

                    {/* Date label */}
                    <div className='text-center text-[11px] font-bold text-[#5c504a]'>{day.label}</div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className='mb-5 flex items-start justify-between gap-3'>
            <div>
              <h2 className='text-lg font-black text-ink-950'>Đơn hàng gần đây</h2>
              <p className='mt-1 text-sm text-slate-500'>Hiển thị {ORDER_LIMIT} đơn mới nhất</p>
            </div>
            <Link to='/admin/orders' className='inline-flex items-center gap-1 text-xs font-black text-brand-600 hover:text-brand-900'>
              Xem tất cả <ArrowRight size={13} />
            </Link>
          </div>

          <div className='space-y-3'>
            {recentOrders.length === 0 ? (
              <div className='rounded-2xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500'>
                Chưa có đơn hàng nào.
              </div>
            ) : (
              recentOrders.map((order) => {
                const statusInfo = getOrderStatusMeta(order.status)
                return (
                  <div
                    key={order._id}
                    className='flex flex-col gap-3 rounded-3xl border border-slate-200 bg-slate-50 p-4 md:flex-row md:items-center md:justify-between'
                  >
                    <div className='space-y-2'>
                      <div className='flex items-center gap-2.5'>
                        <span className='font-mono text-sm font-black tracking-widest text-ink-950'>
                          #{order._id.slice(-6).toUpperCase()}
                        </span>
                        <StatusBadge status={statusInfo.tone} label={statusInfo.label} />
                      </div>
                      <p className='font-mono text-xs font-semibold text-slate-500'>{formatDate(order.created_at)}</p>
                    </div>

                    <div className='text-left md:text-right'>
                      <div className='text-xs font-bold uppercase tracking-[0.12em] text-slate-400'>Tổng thanh toán</div>
                      <div className='mt-1 font-mono text-sm font-black text-ink-950'>
                        {money(order.total_price + order.shipping_fee)}
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        <div className='surface-card rounded-3xl p-5 md:p-6'>
          <div className='mb-5 flex items-start justify-between gap-3'>
            <div>
              <h2 className='text-lg font-black text-ink-950'>Top 5 sản phẩm bán chạy</h2>
              <p className='mt-1 text-sm text-slate-500'>Dùng để demo mặt hàng chủ lực cho chủ shop</p>
            </div>
            <TrendingUp size={18} className='text-slate-400' />
          </div>

          <div className='space-y-3'>
            {topSelling.length === 0 ? (
              <div className='rounded-2xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500'>
                Chưa có dữ liệu sản phẩm.
              </div>
            ) : (
              topSelling.map((product, index) => {
                const maxSold = Math.max(...topSelling.map((item) => item.soldNumber || 0), 1)
                const pct = Math.max(8, Math.round(((product.soldNumber || 0) / maxSold) * 100))
                return (
                  <div key={product._id} className='rounded-3xl border border-slate-200 bg-slate-50 p-4'>
                    <div className='flex items-center justify-between gap-3'>
                      <div className='flex min-w-0 items-center gap-3'>
                        <span className='grid h-8 w-8 shrink-0 place-items-center rounded-2xl bg-[#3d3330] text-xs font-black text-white'>
                          #{index + 1}
                        </span>
                        <div className='min-w-0'>
                        <div className='truncate text-sm font-black text-ink-950'>{product.name}</div>
                        <div className='mt-0.5 font-mono text-xs font-semibold text-slate-500'>
                          Tồn kho: {product.quantity}
                        </div>
                        </div>
                      </div>
                      <span className='text-sm font-black text-[#c65f4a]'>
                        {product.soldNumber || 0} bán
                      </span>
                    </div>

                    <div className='mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white'>
                      <div className='h-full rounded-full bg-[#c65f4a]' style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
