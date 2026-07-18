import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { RefreshCw, Search, SlidersHorizontal } from 'lucide-react'
import { toast } from 'sonner'
import AdminTableShell from '../../../components/ui/AdminTable'
import PaginationBar from '../../../components/ui/PaginationBar'
import { STOCK_BADGE, STOCK_LABEL, STOCK_OPTIONS } from '../../../constants/product'
import { useDebouncedValue } from '../../../hooks/useDebouncedValue'
import type { Product } from '../../../models/ProductRequests'
import { ADMIN_LIST_LIMIT } from '../../../models/Pagination'
import { ROUTES } from '../../../routes/route.paths'
import { deleteProductApi, getAllProductsApi, type ProductFilters } from '../../../services/products.services'
import { getApiErrorMessage } from '../../../utils/apiError'
import cn from '../../../utils/cn'
import money from '../../../utils/money'

const getStockType = (q: number) => (q <= 0 ? 'stock' : q <= 5 ? 'low' : 'active')

function StockBadge({ quantity }: { quantity: number }) {
  const type = getStockType(quantity)
  return (
    <span className={cn('inline-flex rounded-full border px-3 py-1 text-xs font-black', STOCK_BADGE[type])}>
      {STOCK_LABEL(quantity)}
    </span>
  )
}

function SkeletonRow() {
  return (
    <tr className='border-b border-slate-100'>
      {[70, 40, 30, 25, 20].map((width, index) => (
        <td key={index} className='p-4'>
          <div className='h-4 animate-pulse rounded-md bg-slate-100' style={{ width: `${width}%` }} />
        </td>
      ))}
    </tr>
  )
}

export default function AdminProductsPage() {
  const [search, setSearch] = useState('')
  const [stockFilter, setStockFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const debouncedSearch = useDebouncedValue(search)

  const filters = useMemo<ProductFilters>(() => {
    const next: ProductFilters = {}
    if (debouncedSearch.trim()) next.search = debouncedSearch.trim()
    if (stockFilter === 'active') next.status = 0
    if (stockFilter === 'stock') next.status = 1
    return next
  }, [debouncedSearch, stockFilter])

  const {
    data,
    isLoading: loading,
    isError,
    refetch,
    isFetching
  } = useQuery({
    queryKey: ['admin-products', page, filters],
    queryFn: async () => {
      const res = await getAllProductsApi(ADMIN_LIST_LIMIT, page, filters)
      return {
        products: (res.data.result ?? []) as Product[],
        pagination: res.data.pagination
      }
    }
  })

  const products = data?.products ?? []
  const pagination = data?.pagination
  const error = isError ? 'Không tải được danh sách sản phẩm' : ''

  const handleDelete = async (productId: string) => {
    if (!window.confirm('Xóa sản phẩm này? Hành động không thể hoàn tác.')) return
    try {
      setDeletingId(productId)
      await deleteProductApi(productId)
      toast.success('Đã xóa sản phẩm')
      refetch()
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Không thể xóa sản phẩm'))
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <AdminTableShell title='Sản phẩm' createTo={ROUTES.ADMIN + ROUTES.CREATE_PRODUCT}>
      <div className='space-y-5'>
        <div className='surface-card flex flex-col gap-3 rounded-3xl p-4 md:flex-row md:items-center md:justify-between'>
          <div className='relative w-full md:max-w-sm'>
            <Search size={16} className='pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400' />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              placeholder='Tìm theo tên sản phẩm...'
              className='premium-input pl-10'
            />
          </div>

          <div className='flex flex-col gap-2 sm:flex-row sm:items-center'>
            <div className='relative'>
              <SlidersHorizontal size={15} className='pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400' />
              <select
                value={stockFilter}
                onChange={(e) => {
                  setStockFilter(e.target.value)
                  setPage(1)
                }}
                className='premium-input cursor-pointer pl-10 pr-8'
              >
                {STOCK_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className='inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50'
            >
              <RefreshCw size={15} className={isFetching ? 'animate-spin' : ''} />
              Làm mới
            </button>
          </div>
        </div>

        {error ? <div className='rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-900'>{error}</div> : null}

        <div className='surface-strong overflow-x-auto rounded-3xl'>
          <table className='w-full text-sm'>
            <thead>
              <tr className='border-b border-slate-200 bg-slate-50/80'>
                {['Sản phẩm', 'Xuất xứ', 'Giá', 'Tồn kho', ''].map((heading, index) => (
                  <th key={heading} className={cn('px-5 py-4 text-xs font-black uppercase tracking-[0.12em] text-slate-400', index === 4 ? 'text-right' : 'text-left')}>
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {loading ? Array.from({ length: 5 }).map((_, index) => <SkeletonRow key={index} />) : null}

              {!loading && products.length === 0 ? (
                <tr>
                  <td colSpan={5} className='px-5 py-14 text-center text-sm font-semibold text-slate-500'>
                    Không tìm thấy sản phẩm nào.
                  </td>
                </tr>
              ) : null}

              {!loading
                ? products.map((product) => (
                    <tr key={product._id} className='border-b border-slate-100 transition hover:bg-slate-50/80 last:border-0'>
                      <td className='px-5 py-4'>
                        <div className='flex items-center gap-3'>
                          <div className='h-12 w-12 shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100'>
                            {product.medias?.[0]?.url ? (
                              <img src={product.medias[0].url} alt={product.name} className='h-full w-full object-cover' />
                            ) : (
                              <div className='flex h-full w-full items-center justify-center text-[10px] font-bold text-slate-400'>N/A</div>
                            )}
                          </div>

                          <div className='min-w-0'>
                            <div className='truncate font-black text-ink-950'>{product.name}</div>
                            <div className='mt-0.5 truncate font-mono text-xs font-semibold text-slate-400'>
                              #{product._id.slice(-8).toUpperCase()}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className='px-5 py-4 font-semibold text-slate-500'>{product.origin}</td>
                      <td className='px-5 py-4 font-mono font-black text-ink-950'>{money(product.price)}</td>
                      <td className='px-5 py-4'>
                        <StockBadge quantity={product.quantity} />
                      </td>

                      <td className='px-5 py-4 text-right'>
                        <div className='flex items-center justify-end gap-2'>
                          <Link to={`/admin/products/${product._id}/edit`} className='rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-600 transition hover:bg-slate-100 hover:text-ink-950'>
                            Sửa
                          </Link>
                          <button
                            type='button'
                            disabled={deletingId === product._id}
                            onClick={() => handleDelete(product._id)}
                            className='rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-black text-rose-700 transition hover:bg-rose-100 disabled:opacity-50'
                          >
                            {deletingId === product._id ? 'Đang xóa...' : 'Xóa'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                : null}
            </tbody>
          </table>
        </div>

        {pagination ? (
          <PaginationBar
            pagination={pagination}
            page={page}
            onPageChange={setPage}
            isLoading={isFetching}
            itemLabel='sản phẩm'
          />
        ) : null}
      </div>
    </AdminTableShell>
  )
}
