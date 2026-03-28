import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, AlertTriangle, Package2, ShoppingBag, Wallet, TrendingUp } from 'lucide-react'
import { getAllOrdersApi } from './../../services/orders.services'
import { getAllProductsApi } from './../../services/products.services'
import money from './../../utils/money'
import type { OrderApiResponse } from './../../models/OrderRequests'
import type { Product } from './../../models/ProductRequests'
import formatDate from './../../utils/date'
import StatusBadge from './../../components/ui/AdminDashBoardStatusBadge'
import { TABS } from './../../constants/order'
import { LOW_STOCK_THRESHOLD, ORDER_LIMIT, PAGE, PRODUCT_LIMIT } from '../../configs/config'

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } }
}

/* ─── config ─── */
const STAT_ACCENTS = [
  {
    gradient: 'from-orange-500/20 via-orange-400/5 to-transparent',
    icon: 'bg-orange-500/15 text-orange-400 ring-orange-400/20',
    glow: 'shadow-orange-500/10',
    border: 'hover:border-orange-400/25',
    line: 'from-transparent via-orange-400/50 to-transparent'
  },
  {
    gradient: 'from-blue-500/20 via-blue-400/5 to-transparent',
    icon: 'bg-blue-500/15 text-blue-400 ring-blue-400/20',
    glow: 'shadow-blue-500/10',
    border: 'hover:border-blue-400/25',
    line: 'from-transparent via-blue-400/50 to-transparent'
  },
  {
    gradient: 'from-teal-500/20 via-teal-400/5 to-transparent',
    icon: 'bg-teal-500/15 text-teal-400 ring-teal-400/20',
    glow: 'shadow-teal-500/10',
    border: 'hover:border-teal-400/25',
    line: 'from-transparent via-teal-400/50 to-transparent'
  },
  {
    gradient: 'from-rose-500/20 via-rose-400/5 to-transparent',
    icon: 'bg-rose-500/15 text-rose-400 ring-rose-400/20',
    glow: 'shadow-rose-500/10',
    border: 'hover:border-rose-400/25',
    line: 'from-transparent via-rose-400/50 to-transparent'
  }
]

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
          getAllOrdersApi(PAGE, ORDER_LIMIT),
          getAllProductsApi(PAGE, PRODUCT_LIMIT)
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
    const totalRevenue = orders.reduce((sum, o) => sum + o.total_price + o.shipping_fee, 0)
    const lowStockCount = products.filter((p) => p.quantity <= LOW_STOCK_THRESHOLD).length
    return [
      { label: 'Đơn hàng', value: String(orders.length), sub: `Top ${ORDER_LIMIT} đơn mới nhất`, icon: ShoppingBag },
      { label: 'Doanh thu', value: money(totalRevenue), sub: 'Theo dữ liệu đang hiển thị', icon: Wallet },
      { label: 'Sản phẩm', value: String(products.length), sub: `Top ${PRODUCT_LIMIT} sản phẩm`, icon: Package2 },
      {
        label: 'Sắp hết hàng',
        value: String(lowStockCount),
        sub: `Tồn kho ≤ ${LOW_STOCK_THRESHOLD}`,
        icon: AlertTriangle
      }
    ]
  }, [orders, products])

  const recentOrders = useMemo(
    () =>
      [...orders]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, ORDER_LIMIT),
    [orders]
  )

  const lowStock = useMemo(
    () =>
      [...products]
        .filter((p) => p.quantity <= LOW_STOCK_THRESHOLD)
        .sort((a, b) => a.quantity - b.quantity)
        .slice(0, PRODUCT_LIMIT),
    [products]
  )

  /* ── Loading state ── */
  if (loading) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-[#080c18]'>
        <div className='flex flex-col items-center gap-4'>
          <div className='h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-orange-400' />
          <p className='text-sm text-slate-500'>Đang tải dashboard...</p>
        </div>
      </div>
    )
  }

  /* ── Error state ── */
  if (error) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-[#080c18]'>
        <div className='rounded-2xl border border-rose-500/20 bg-rose-500/10 px-8 py-6 text-sm text-rose-300'>
          {error}
        </div>
      </div>
    )
  }

  return (
    <motion.div
      variants={container}
      initial='hidden'
      animate='show'
      className='min-h-screen p-5 sm:p-7'
      style={{
        background: `
          radial-gradient(ellipse 55% 35% at 85% 0%,   rgba(255,140,66,0.07) 0%, transparent 55%),
          radial-gradient(ellipse 45% 30% at 15% 100%, rgba(79,142,247,0.07) 0%, transparent 50%),
          linear-gradient(180deg, #080c18 0%, #0d1424 50%, #0f172a 100%)
        `
      }}
    >
      <div className='mx-auto max-w-[1400px] space-y-5'>
        {/* ══ HERO BANNER ══ */}
        <motion.div className='relative overflow-hidden rounded-[22px] border border-white/[0.08] bg-white/[0.035] p-6 sm:p-8 xl:flex xl:items-center xl:justify-between'>
          {/* shimmer top border */}
          <div className='pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-400/40 to-transparent' />
          {/* ambient fill */}
          <div className='pointer-events-none absolute inset-0 bg-gradient-to-br from-orange-400/[0.04] via-transparent to-blue-400/[0.03]' />

          <div className='relative'>
            <div className='mb-4 inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1'>
              <span className='h-1.5 w-1.5 animate-pulse rounded-full bg-amber-400' />
              <span className='text-[11px] font-semibold tracking-wide text-amber-300'>Dashboard tổng quan</span>
            </div>

            <p className='mt-2 max-w-lg text-sm leading-relaxed text-slate-400'>
              Theo dõi đơn hàng, doanh thu và tình trạng tồn kho trong thời gian thực.
            </p>
          </div>

          <div className='relative mt-5 flex flex-wrap gap-2.5 xl:mt-0'>
            <button className='flex items-center gap-2 rounded-xl border border-white/[0.09] bg-white/[0.05] px-5 py-2.5 text-sm font-medium text-slate-200 transition-all hover:border-white/[0.15] hover:bg-white/[0.09]'>
              <TrendingUp size={15} className='opacity-70' />
              Xuất báo cáo
            </button>
          </div>
        </motion.div>

        {/* ══ STAT CARDS ══ */}
        <motion.div className='grid gap-3.5 sm:grid-cols-2 xl:grid-cols-4'>
          {stats.map((card, i) => {
            const Icon = card.icon
            const accent = STAT_ACCENTS[i]
            return (
              <motion.div
                key={card.label}
                whileHover={{ y: -3, scale: 1.01 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className={`group relative overflow-hidden rounded-[18px] border border-white/[0.08] bg-white/[0.04] p-5 shadow-lg ${accent.glow} ${accent.border} transition-all duration-300`}
              >
                {/* tinted gradient overlay */}
                <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${accent.gradient}`} />
                {/* bottom glow on hover */}
                <div
                  className={`pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r ${accent.line} opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
                />

                <div className='relative flex items-start justify-between gap-3'>
                  <div>
                    <p className='text-xs font-medium tracking-wide text-slate-400'>{card.label}</p>
                    <h3 className='mt-3 text-[26px] font-bold leading-none tracking-tight text-white'>{card.value}</h3>
                    <p className='mt-2 text-[11.5px] text-slate-500'>{card.sub}</p>
                  </div>
                  <div className={`shrink-0 rounded-xl p-2.5 ring-1 ${accent.icon}`}>
                    <Icon size={18} />
                  </div>
                </div>
              </motion.div>
            )
          })}
        </motion.div>

        {/* ══ PANELS ══ */}
        <div className='grid gap-3.5 xl:grid-cols-[1.6fr_1fr]'>
          {/* Recent orders */}
          <motion.div className='rounded-[20px] border border-white/[0.08] bg-white/[0.035] p-6'>
            <div className='mb-5 flex items-start justify-between gap-3'>
              <div>
                <h2 className='text-[15px] font-semibold tracking-tight text-white'>Đơn hàng gần đây</h2>
                <p className='mt-1 text-xs text-slate-500'>Hiển thị {ORDER_LIMIT} đơn mới nhất</p>
              </div>
              <button className='flex shrink-0 items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-400 transition hover:bg-white/[0.07] hover:text-white'>
                Xem tất cả <ArrowRight size={13} />
              </button>
            </div>

            <div className='space-y-2.5'>
              {recentOrders.length === 0 ? (
                <div className='rounded-2xl border border-dashed border-white/[0.08] px-4 py-8 text-center text-sm text-slate-500'>
                  Chưa có đơn hàng nào.
                </div>
              ) : (
                recentOrders.map((order) => {
                  const statusInfo = TABS.find((t) => t.key === order.status)
                  return (
                    <div
                      key={order._id}
                      className='flex flex-col gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4 transition-all hover:border-white/[0.12] hover:bg-white/[0.05] md:flex-row md:items-center md:justify-between'
                    >
                      <div className='space-y-1.5'>
                        <div className='flex items-center gap-2.5'>
                          <span className='font-mono text-[12.5px] font-semibold tracking-widest text-white'>
                            #{order._id.slice(-6).toUpperCase()}
                          </span>
                          <StatusBadge
                            status={statusInfo?.value ?? 'processing'}
                            label={statusInfo?.label ?? 'Đang xử lý'}
                          />
                        </div>
                        <p className='font-mono text-[11px] text-slate-500'>{formatDate(order.created_at)}</p>
                      </div>

                      <div className='text-left md:text-right'>
                        <div className='text-[11px] text-slate-500'>Tổng thanh toán</div>
                        <div className='mt-0.5 font-mono text-[13.5px] font-bold text-white'>
                          {money(order.total_price + order.shipping_fee)}
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </motion.div>

          {/* Low stock */}
          <motion.div className='rounded-[20px] border border-white/[0.08] bg-white/[0.035] p-6'>
            <div className='mb-5 flex items-start justify-between gap-3'>
              <div>
                <h2 className='text-[15px] font-semibold tracking-tight text-white'>Sản phẩm sắp hết hàng</h2>
                <p className='mt-1 text-xs text-slate-500'>Hiển thị {PRODUCT_LIMIT} sản phẩm tồn kho thấp nhất</p>
              </div>
              <button className='flex shrink-0 items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-400 transition hover:bg-white/[0.07] hover:text-white'>
                Quản lý kho <ArrowRight size={13} />
              </button>
            </div>

            <div className='space-y-2.5'>
              {lowStock.length === 0 ? (
                <div className='rounded-2xl border border-dashed border-white/[0.08] px-4 py-8 text-center text-sm text-slate-500'>
                  Không có sản phẩm sắp hết hàng.
                </div>
              ) : (
                lowStock.map((product) => {
                  const isEmpty = product.quantity === 0
                  const pct = Math.min((product.quantity / LOW_STOCK_THRESHOLD) * 100, 100)
                  return (
                    <div
                      key={product._id}
                      className='rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4 transition-all hover:border-white/[0.12] hover:bg-white/[0.05]'
                    >
                      <div className='flex items-center justify-between gap-3'>
                        <div className='min-w-0'>
                          <div className='truncate text-[13px] font-medium text-white'>{product.name}</div>
                          <div className='mt-0.5 font-mono text-[11px] text-slate-500'>
                            #{product._id.slice(-6).toUpperCase()}
                          </div>
                        </div>
                        <span
                          className={`shrink-0 rounded-lg px-3 py-1 font-mono text-[11px] font-bold ring-1 ring-inset ${
                            isEmpty
                              ? 'bg-rose-500/10 text-rose-300 ring-rose-400/20'
                              : 'bg-amber-400/10 text-amber-300 ring-amber-400/20'
                          }`}
                        >
                          {isEmpty ? 'Hết hàng' : `${product.quantity} còn lại`}
                        </span>
                      </div>

                      {/* mini progress bar */}
                      <div className='mt-3 h-[3px] w-full overflow-hidden rounded-full bg-white/[0.06]'>
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isEmpty ? 'w-full bg-rose-500/40' : 'bg-gradient-to-r from-amber-500 to-orange-400'
                          }`}
                          style={{ width: isEmpty ? '100%' : `${pct}%` }}
                        />
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}
