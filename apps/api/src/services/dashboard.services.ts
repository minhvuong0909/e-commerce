import { ObjectId } from 'mongodb'
import { OrderStatus, PaymentMethod, PaymentStatus, USER_ROLE } from '~/constants/enums'
import databaseService from './database.service'

export const DASHBOARD_TZ = 'Asia/Ho_Chi_Minh'
export const LOW_STOCK_THRESHOLD = 5
const DAY_MS = 24 * 60 * 60 * 1000

export type StatsOrder = {
  _id: ObjectId
  status: OrderStatus
  payment_status: PaymentStatus
  payment_method: PaymentMethod | string | number
  total_price: number
  shipping_fee?: number
  refund_state?: string
  created_at: Date
}

const isCod = (o: StatsOrder) => o.payment_method === PaymentMethod.CASH_ON_DELIVERY

/**
 * Revenue is recognised when money is actually in: a non-cancelled order that is paid,
 * or a COD order that has been delivered (cash collected on delivery).
 * `total_price` already includes shipping, so it is never added again.
 */
export function isRecognized(o: StatsOrder): boolean {
  if (o.status === OrderStatus.Cancelled) return false
  if (o.payment_status === PaymentStatus.COMPLETED) return true
  return isCod(o) && o.status === OrderStatus.Delivered
}

/** Active orders whose money has not been recognised yet. */
export function isOpen(o: StatsOrder): boolean {
  return (
    !isRecognized(o) &&
    [OrderStatus.Pending, OrderStatus.Confirmed, OrderStatus.Shipped].includes(o.status) &&
    o.payment_status !== PaymentStatus.FAILED
  )
}

/** Records that need reconciliation instead of silently skewing the numbers. */
export function findAnomalies(orders: StatsOrder[]) {
  const paidButCancelled = orders.filter(
    (o) => o.status === OrderStatus.Cancelled && o.payment_status === PaymentStatus.COMPLETED && o.refund_state !== 'completed'
  )
  const deliveredUnpaidOnline = orders.filter(
    (o) => o.status === OrderStatus.Delivered && !isCod(o) && o.payment_status !== PaymentStatus.COMPLETED
  )
  const pick = (list: StatsOrder[]) => ({
    count: list.length,
    amount: list.reduce((s, o) => s + (o.total_price || 0), 0),
    order_ids: list.slice(0, 10).map((o) => String(o._id))
  })
  return { paid_but_cancelled: pick(paidButCancelled), delivered_unpaid_online: pick(deliveredUnpaidOnline) }
}

/** YYYY-MM-DD of a moment in the shop's timezone. */
export function dayKey(date: Date, tz = DASHBOARD_TZ): string {
  return date.toLocaleDateString('en-CA', { timeZone: tz })
}

/** Inclusive [from, to] calendar range (YYYY-MM-DD, shop timezone) → UTC instants. */
export function rangeBounds(from: string, to: string) {
  const start = new Date(`${from}T00:00:00+07:00`)
  const end = new Date(`${to}T23:59:59.999+07:00`)
  return { start, end, days: Math.round((end.getTime() + 1 - start.getTime()) / DAY_MS) }
}

export function summarize(orders: StatsOrder[], from: string, to: string) {
  const recognized = orders.filter(isRecognized)
  const open = orders.filter(isOpen)
  const revenue = recognized.reduce((s, o) => s + (o.total_price || 0), 0)
  const shipping = recognized.reduce((s, o) => s + (o.shipping_fee || 0), 0)

  const byStatus: Record<string, number> = { pending: 0, confirmed: 0, shipped: 0, delivered: 0, cancelled: 0 }
  const statusKey: Record<number, string> = {
    [OrderStatus.Pending]: 'pending',
    [OrderStatus.Confirmed]: 'confirmed',
    [OrderStatus.Shipped]: 'shipped',
    [OrderStatus.Delivered]: 'delivered',
    [OrderStatus.Cancelled]: 'cancelled'
  }
  for (const o of orders) if (statusKey[o.status]) byStatus[statusKey[o.status]] += 1

  // daily series across the whole range, including empty days
  const { start, days } = rangeBounds(from, to)
  const series = Array.from({ length: days }, (_, i) => ({
    date: dayKey(new Date(start.getTime() + i * DAY_MS + 12 * 60 * 60 * 1000)),
    revenue: 0,
    orders: 0
  }))
  const index = new Map(series.map((d, i) => [d.date, i]))
  for (const o of orders) {
    const i = index.get(dayKey(new Date(o.created_at)))
    if (i === undefined) continue
    series[i].orders += 1
    if (isRecognized(o)) series[i].revenue += o.total_price || 0
  }

  return {
    revenue,
    revenue_excl_shipping: revenue - shipping,
    recognized_orders: recognized.length,
    avg_order_value: recognized.length ? Math.round(revenue / recognized.length) : 0,
    open_orders: open.length,
    open_value: open.reduce((s, o) => s + (o.total_price || 0), 0),
    total_orders: orders.length,
    by_status: byStatus,
    series
  }
}

/** % change vs previous period; null when there is nothing to compare against. */
export function percentChange(current: number, previous: number): number | null {
  if (!previous) return null
  return Math.round(((current - previous) / previous) * 1000) / 10
}

const ORDER_FIELDS = {
  status: 1,
  payment_status: 1,
  payment_method: 1,
  total_price: 1,
  shipping_fee: 1,
  refund_state: 1,
  created_at: 1
} as const

class DashboardService {
  private ordersBetween(start: Date, end: Date) {
    return databaseService.orders
      .find({ created_at: { $gte: start, $lte: end } }, { projection: ORDER_FIELDS })
      .toArray() as unknown as Promise<StatsOrder[]>
  }

  async getSummary(from: string, to: string) {
    const { start, end, days } = rangeBounds(from, to)
    const prevEnd = new Date(start.getTime() - 1)
    const prevStart = new Date(start.getTime() - days * DAY_MS)

    const [orders, prevOrders, allOrders, productCount, customerCount, lowStock] = await Promise.all([
      this.ordersBetween(start, end),
      this.ordersBetween(prevStart, prevEnd),
      databaseService.orders.find({}, { projection: { ...ORDER_FIELDS } }).toArray() as unknown as Promise<StatsOrder[]>,
      databaseService.products.countDocuments({}),
      databaseService.users.countDocuments({ role: USER_ROLE.User }),
      databaseService.products
        .find({ quantity: { $lte: LOW_STOCK_THRESHOLD } }, { projection: { name: 1, quantity: 1, thumbnail: 1, status: 1 } })
        .sort({ quantity: 1 })
        .limit(8)
        .toArray()
    ])

    const current = summarize(orders, from, to)
    const previous = summarize(prevOrders, dayKey(prevStart), dayKey(prevEnd))
    const recognizedIds = orders.filter(isRecognized).map((o) => o._id)

    const topProducts = recognizedIds.length
      ? await databaseService.order_items
          .aggregate<{ _id: ObjectId; units: number; revenue: number; name?: string; thumbnail?: string }>([
            { $match: { order_id: { $in: recognizedIds } } },
            { $group: { _id: '$product_id', units: { $sum: '$quantity' }, revenue: { $sum: { $multiply: ['$price', '$quantity'] } } } },
            { $sort: { units: -1, revenue: -1 } },
            { $limit: 5 },
            { $lookup: { from: databaseService.products.collectionName, localField: '_id', foreignField: '_id', as: 'p' } },
            { $set: { name: { $first: '$p.name' }, thumbnail: { $first: '$p.thumbnail' } } },
            { $project: { p: 0 } }
          ])
          .toArray()
      : []

    return {
      range: { from, to, days, timezone: DASHBOARD_TZ },
      ...current,
      previous: { revenue: previous.revenue, recognized_orders: previous.recognized_orders, total_orders: previous.total_orders },
      change: {
        revenue: percentChange(current.revenue, previous.revenue),
        recognized_orders: percentChange(current.recognized_orders, previous.recognized_orders),
        total_orders: percentChange(current.total_orders, previous.total_orders)
      },
      top_products: topProducts.map((p) => ({ ...p, _id: String(p._id) })),
      low_stock: { threshold: LOW_STOCK_THRESHOLD, items: lowStock.map((p) => ({ ...p, _id: String(p._id) })) },
      catalog: { products: productCount, customers: customerCount },
      // anomalies are checked across all orders: an old paid-but-cancelled order still needs reconciling
      anomalies: findAnomalies(allOrders)
    }
  }
}

const dashboardService = new DashboardService()
export default dashboardService
