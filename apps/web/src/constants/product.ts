export const STOCK_LABEL = (q: number) => (q <= 0 ? 'Hết hàng' : q <= 5 ? `Sắp hết (${q})` : `Còn ${q}`)

export const STOCK_BADGE: Record<string, string> = {
  stock: 'bg-rose-500/12 text-rose-300 ring-rose-500/20',
  low: 'bg-amber-500/12 text-amber-300 ring-amber-500/20',
  active: 'bg-emerald-500/12 text-emerald-300 ring-emerald-500/20'
}

export const STOCK_OPTIONS = [
  { value: 'all', label: 'Tất cả' },
  { value: 'active', label: 'Còn hàng' },
  { value: 'stock', label: 'Hết hàng' }
]
