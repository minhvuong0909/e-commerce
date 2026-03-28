import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { RefreshCw, Search, SlidersHorizontal } from 'lucide-react'
import AdminTableShell from '../../../components/ui/AdminTable'
import money from '../../../utils/money'
import { getAllProductsApi } from '../../../services/products.services'
import type { Product } from '../../../models/ProductRequests'
import { ROUTES } from '../../../routes/route.paths'

const STOCK_OPTIONS = [
  { value: 'all', label: 'Tất cả' },
  { value: 'active', label: 'Còn hàng' },
  { value: 'stock', label: 'Hết hàng' }
]

const getStockType = (q: number) => (q <= 0 ? 'stock' : 'active')

const STOCK_BADGE: Record<string, string> = {
  stock: 'bg-rose-500/12 text-rose-300 ring-rose-500/20',
  low: 'bg-amber-500/12 text-amber-300 ring-amber-500/20',
  active: 'bg-emerald-500/12 text-emerald-300 ring-emerald-500/20'
}

const STOCK_LABEL = (q: number) => (q <= 0 ? 'Hết hàng' : q <= 5 ? `Sắp hết (${q})` : `Còn ${q}`)

function StockBadge({ quantity }: { quantity: number }) {
  const type = getStockType(quantity)
  return (
    <motion.span
      whileHover={{ scale: 1.04 }}
      transition={{ type: 'spring', stiffness: 320, damping: 20 }}
      className={`inline-flex rounded-lg px-2.5 py-1 font-mono text-[11px] font-bold ring-1 ring-inset ${STOCK_BADGE[type]}`}
    >
      {STOCK_LABEL(quantity)}
    </motion.span>
  )
}

function SkeletonRow() {
  return (
    <tr className='border-b border-white/[0.05]'>
      {[70, 40, 30, 25, 20].map((w, i) => (
        <td key={i} className='p-4'>
          <div className='h-4 animate-pulse rounded-md bg-white/[0.06]' style={{ width: `${w}%` }} />
        </td>
      ))}
    </tr>
  )
}

const tbodyVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.03
    }
  }
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [stockFilter, setStockFilter] = useState('all')

  const fetchProducts = async () => {
    try {
      setLoading(true)
      setError('')
      const res = await getAllProductsApi(0, 0)
      const list = res?.data?.result
      setProducts(Array.isArray(list) ? list : [])
    } catch (err) {
      console.error(err)
      setError('Không tải được danh sách sản phẩm')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const filteredProducts = useMemo(() => {
    const kw = search.toLowerCase()
    return products.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(kw) || p.origin.toLowerCase().includes(kw) || p._id.toLowerCase().includes(kw)
      const matchStock = stockFilter === 'all' || stockFilter === getStockType(p.quantity)
      return matchSearch && matchStock
    })
  }, [products, search, stockFilter])

  return (
    <AdminTableShell title='Sản phẩm' createTo={ROUTES.ADMIN + ROUTES.CREATE_PRODUCT}>
      <motion.div
        initial='hidden'
        animate='show'
        className='min-h-screen p-5 sm:p-7'
        style={{
          background: `
            radial-gradient(ellipse 55% 35% at 85% 0%,   rgba(255,140,66,0.06) 0%, transparent 55%),
            radial-gradient(ellipse 45% 30% at 15% 100%, rgba(79,142,247,0.06) 0%, transparent 50%),
            linear-gradient(180deg, #080c18 0%, #0d1424 50%, #0f172a 100%)
          `
        }}
      >
        <div className='mx-auto max-w-[1400px] space-y-5'>
          <motion.div
            initial='hidden'
            animate='show'
            className='flex flex-col gap-3 md:flex-row md:items-center md:justify-between'
          >
            <div className='relative w-full md:max-w-sm'>
              <Search
                size={14}
                className='pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500'
              />
              <motion.input
                whileFocus={{ scale: 1.01 }}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder='Tìm theo tên, xuất xứ, ID...'
                className='h-10 w-full rounded-xl border border-white/[0.08] bg-white/[0.04] pl-9 pr-4 text-[13px] text-white placeholder:text-slate-600 outline-none transition focus:border-white/[0.15] focus:bg-white/[0.06]'
              />
            </div>

            <div className='flex items-center gap-2'>
              <motion.div whileHover={{ y: -1 }} className='relative'>
                <SlidersHorizontal
                  size={13}
                  className='pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500'
                />
                <select
                  value={stockFilter}
                  onChange={(e) => setStockFilter(e.target.value)}
                  className='h-10 cursor-pointer appearance-none rounded-xl border border-white/[0.08] bg-white/[0.04] pl-8 pr-4 text-[13px] text-white outline-none transition hover:bg-white/[0.06] focus:border-white/[0.15]'
                >
                  {STOCK_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value} className='bg-[#0d1424]'>
                      {o.label}
                    </option>
                  ))}
                </select>
              </motion.div>

              <motion.button
                whileHover={{ y: -1, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={fetchProducts}
                disabled={loading}
                className='flex h-10 items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 text-[13px] text-slate-300 transition hover:bg-white/[0.08] hover:text-white disabled:opacity-40'
              >
                <motion.span
                  animate={loading ? { rotate: 360 } : { rotate: 0 }}
                  transition={loading ? { repeat: Infinity, duration: 0.8, ease: 'linear' } : { duration: 0.2 }}
                  className='inline-flex'
                >
                  <RefreshCw size={13} />
                </motion.span>
                Reload
              </motion.button>
            </div>
          </motion.div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className='rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-300'
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            initial='hidden'
            animate='show'
            className='overflow-x-auto rounded-[20px] border border-white/[0.08] bg-white/[0.035] shadow-[0_10px_40px_rgba(0,0,0,0.18)]'
          >
            <table className='w-full text-sm'>
              <thead>
                <tr className='border-b border-white/[0.06]'>
                  {['Sản phẩm', 'Xuất xứ', 'Giá', 'Tồn kho', ''].map((h, i) => (
                    <th
                      key={i}
                      className={`px-5 py-3.5 text-[11px] font-semibold tracking-wider text-slate-500 ${i === 4 ? 'text-right' : 'text-left'}`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <motion.tbody variants={tbodyVariants} initial='hidden' animate='show'>
                {loading &&
                  Array.from({ length: 5 }).map((_, i) => (
                    <motion.tr
                      key={i}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.04 }}
                    >
                      <SkeletonRow />
                    </motion.tr>
                  ))}

                {!loading && filteredProducts.length === 0 && (
                  <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <td colSpan={5} className='px-5 py-14 text-center text-sm text-slate-600'>
                      Không tìm thấy sản phẩm nào.
                    </td>
                  </motion.tr>
                )}

                {!loading && (
                  <AnimatePresence mode='popLayout'>
                    {filteredProducts.map((p) => (
                      <motion.tr
                        key={p._id}
                        layout
                        initial='hidden'
                        animate='show'
                        exit='exit'
                        whileHover={{ backgroundColor: 'rgba(255,255,255,0.035)' }}
                        className='group border-b border-white/[0.05] transition-colors last:border-0'
                      >
                        <td className='px-5 py-4'>
                          <div className='flex items-center gap-3'>
                            <motion.div
                              whileHover={{ scale: 1.06 }}
                              transition={{ type: 'spring', stiffness: 320, damping: 20 }}
                              className='relative h-11 w-11 shrink-0 overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.04]'
                            >
                              {p.medias?.[0]?.url ? (
                                <img src={p.medias[0].url} alt={p.name} className='h-full w-full object-cover' />
                              ) : (
                                <div className='flex h-full w-full items-center justify-center text-[10px] text-slate-600'>
                                  N/A
                                </div>
                              )}
                            </motion.div>

                            <div className='min-w-0'>
                              <motion.div layout className='truncate font-semibold text-white'>
                                {p.name}
                              </motion.div>
                              <div className='mt-0.5 truncate font-mono text-[11px] text-slate-600'>
                                #{p._id.slice(-8).toUpperCase()}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className='px-5 py-4 text-[13px] text-slate-400'>{p.origin}</td>

                        <td className='px-5 py-4 font-mono text-[13px] font-semibold text-white'>{money(p.price)}</td>

                        <td className='px-5 py-4'>
                          <StockBadge quantity={p.quantity} />
                        </td>

                        <td className='px-5 py-4 text-right'>
                          <div className='flex items-center justify-end gap-2'>
                            <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }}>
                              <Link
                                to={`/admin/products/${p._id}/edit`}
                                className='rounded-lg border border-white/[0.08] bg-white/[0.05] px-3 py-1.5 text-[12px] font-medium text-slate-300 transition hover:border-white/[0.15] hover:bg-white/[0.09] hover:text-white'
                              >
                                Sửa
                              </Link>
                            </motion.div>

                            <motion.button
                              whileHover={{ y: -1, scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className='rounded-lg border border-rose-500/20 bg-rose-500/10 px-3 py-1.5 text-[12px] font-medium text-rose-300 transition hover:bg-rose-500/20'
                            >
                              Xoá
                            </motion.button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                )}
              </motion.tbody>
            </table>

            <AnimatePresence>
              {!loading && filteredProducts.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className='border-t border-white/[0.05] px-5 py-3 text-[12px] text-slate-600'
                >
                  Hiển thị {filteredProducts.length} / {products.length} sản phẩm
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </motion.div>
    </AdminTableShell>
  )
}
