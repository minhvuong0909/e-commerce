import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, ArrowRight, Package2, ShoppingBag, TrendingUp, Wallet } from 'lucide-react'
import StatusBadge from './../../components/ui/AdminDashBoardStatusBadge'
import { TABS } from './../../constants/order'
import { LOW_STOCK_THRESHOLD, ORDER_LIMIT, PAGE, PRODUCT_LIMIT } from '../../configs/config'
import type { OrderApiResponse } from './../../models/OrderRequests'
import type { Product } from './../../models/ProductRequests'
import { getAllOrdersApi } from './../../services/orders.services'
import { getAllProductsApi } from './../../services/products.services'
import formatDate from './../../utils/date'
import money from './../../utils/money'

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
        .slice(0, ORDER_LIMIT),
    [orders]
  )

  const lowStock = useMemo(
    () =>
      [...products]
        .filter((product) => product.quantity <= LOW_STOCK_THRESHOLD)
        .sort((a, b) => a.quantity - b.quantity)
        .slice(0, PRODUCT_LIMIT),
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
      <section className='surface-strong animate-fade-up rounded-3xl p-6 md:p-8'>
        <div className='flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between'>
          <div>
            <div className='inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-brand-700'>
              Commerce overview
            </div>
            <h1 className='mt-4 text-3xl font-black tracking-tight text-ink-950'>Dashboard tổng quan</h1>
            <p className='mt-2 max-w-2xl text-sm leading-6 text-slate-500'>
              Theo dõi đơn hàng, doanh thu và tồn kho thấp trong cùng một không gian quản trị.
            </p>
          </div>

          <Link
            to='/admin/orders'
            className='inline-flex h-11 w-fit items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 text-sm font-black text-ink-950 shadow-sm transition hover:-translate-y-0.5 hover:shadow-card'
          >
            Xem đơn hàng <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <section className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
        {stats.map((card) => {
          const Icon = card.icon
          return (
            <div key={card.label} className='surface-card interactive-lift rounded-3xl p-5'>
              <div className='flex items-start justify-between gap-3'>
                <div>
                  <p className='text-xs font-black uppercase tracking-[0.14em] text-slate-400'>{card.label}</p>
                  <h3 className='mt-3 text-2xl font-black tracking-tight text-ink-950'>{card.value}</h3>
                  <p className='mt-2 text-xs font-semibold text-slate-500'>{card.sub}</p>
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
                const statusInfo = TABS.find((tab) => tab.key === order.status)
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
                        <StatusBadge status={statusInfo?.value ?? 'processing'} label={statusInfo?.label ?? 'Đang xử lý'} />
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
              <h2 className='text-lg font-black text-ink-950'>Sản phẩm sắp hết hàng</h2>
              <p className='mt-1 text-sm text-slate-500'>Tồn kho thấp nhất trong hệ thống</p>
            </div>
            <TrendingUp size={18} className='text-slate-400' />
          </div>

          <div className='space-y-3'>
            {lowStock.length === 0 ? (
              <div className='rounded-2xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500'>
                Không có sản phẩm sắp hết hàng.
              </div>
            ) : (
              lowStock.map((product) => {
                const isEmpty = product.quantity === 0
                const pct = Math.min((product.quantity / LOW_STOCK_THRESHOLD) * 100, 100)
                return (
                  <div key={product._id} className='rounded-3xl border border-slate-200 bg-slate-50 p-4'>
                    <div className='flex items-center justify-between gap-3'>
                      <div className='min-w-0'>
                        <div className='truncate text-sm font-black text-ink-950'>{product.name}</div>
                        <div className='mt-0.5 font-mono text-xs font-semibold text-slate-500'>
                          #{product._id.slice(-6).toUpperCase()}
                        </div>
                      </div>
                      <span className={isEmpty ? 'text-sm font-black text-rose-600' : 'text-sm font-black text-amber-700'}>
                        {isEmpty ? 'Hết hàng' : `${product.quantity} còn lại`}
                      </span>
                    </div>

                    <div className='mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white'>
                      <div className={isEmpty ? 'h-full rounded-full bg-rose-500' : 'h-full rounded-full bg-amber-500'} style={{ width: isEmpty ? '100%' : `${pct}%` }} />
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
