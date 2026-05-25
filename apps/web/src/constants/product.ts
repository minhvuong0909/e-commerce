export const STOCK_LABEL = (q: number) => (q <= 0 ? 'Hết hàng' : q <= 5 ? `Sắp hết (${q})` : `Còn ${q}`)

export const STOCK_BADGE: Record<string, string> = {
  stock: 'border-rose-200 bg-rose-50 text-rose-700',
  low: 'border-amber-200 bg-amber-50 text-amber-700',
  active: 'border-emerald-200 bg-emerald-50 text-emerald-700'
}

export const STOCK_OPTIONS = [
  { value: 'all', label: 'Tất cả' },
  { value: 'active', label: 'Còn hàng' },
  { value: 'stock', label: 'Hết hàng' }
]
