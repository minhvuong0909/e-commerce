import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { RefreshCw, Search } from 'lucide-react'
import { toast } from 'sonner'
import AdminTableShell from '../../../components/ui/AdminTable'
import PaginationBar from '../../../components/ui/PaginationBar'
import { useDebouncedValue } from '../../../hooks/useDebouncedValue'
import type { Brand } from '../../../models/BrandRequests'
import { ADMIN_LIST_LIMIT } from '../../../models/Pagination'
import { deleteBrandApi, getBrandsApi } from '../../../services/brands.services'
import { getApiErrorMessage } from '../../../utils/apiError'
import cn from '../../../utils/cn'

function SkeletonRow() {
  return (
    <tr className='border-b border-slate-100'>
      {[45, 75, 35, 65, 25].map((width, index) => (
        <td key={index} className='p-4'>
          <div className='h-4 animate-pulse rounded-md bg-slate-100' style={{ width: `${width}%` }} />
        </td>
      ))}
    </tr>
  )
}

export default function AdminBrandsPage() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const debouncedSearch = useDebouncedValue(search)

  const {
    data,
    isLoading: loading,
    isError,
    refetch,
    isFetching
  } = useQuery({
    queryKey: ['admin-brands', page, debouncedSearch],
    queryFn: async () => {
      const res = await getBrandsApi(page, ADMIN_LIST_LIMIT, debouncedSearch)
      return {
        brands: res.data.data ?? [],
        pagination: res.data.pagination
      }
    }
  })

  const brands = (data?.brands ?? []) as Brand[]
  const pagination = data?.pagination
  const error = isError ? 'Không tải được danh sách thương hiệu' : ''

  const handleDelete = async (brandId: string) => {
    if (!window.confirm('Xóa thương hiệu này? Hành động không thể hoàn tác.')) return
    try {
      setDeletingId(brandId)
      await deleteBrandApi(brandId)
      toast.success('Đã xóa thương hiệu')
      refetch()
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Không thể xóa thương hiệu'))
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <AdminTableShell
      title='Thương hiệu'
      subTitle='Quản lý danh sách thương hiệu, mô tả, hotline và địa chỉ.'
      createTo='/admin/brands/create'
      createLabel='Thêm thương hiệu'
    >
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
              placeholder='Tìm theo tên, hotline, địa chỉ, ID...'
              className='premium-input pl-10'
            />
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

        {error ? <div className='rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-900'>{error}</div> : null}

        <div className='surface-strong overflow-x-auto rounded-3xl'>
          <table className='w-full text-sm'>
            <thead>
              <tr className='border-b border-slate-200 bg-slate-50/80'>
                {['Thương hiệu', 'Mô tả', 'Hotline', 'Địa chỉ', ''].map((heading, index) => (
                  <th key={heading} className={cn('px-5 py-4 text-xs font-black uppercase tracking-[0.12em] text-slate-400', index === 4 ? 'text-right' : 'text-left')}>
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {loading ? Array.from({ length: 5 }).map((_, index) => <SkeletonRow key={index} />) : null}

              {!loading && brands.length === 0 ? (
                <tr>
                  <td colSpan={5} className='px-5 py-14 text-center text-sm font-semibold text-slate-500'>
                    Không tìm thấy thương hiệu nào.
                  </td>
                </tr>
              ) : null}

              {!loading
                ? brands.map((brand) => {
                    const brandId = brand._id
                    return (
                      <tr key={brandId} className='border-b border-slate-100 transition hover:bg-slate-50/80 last:border-0'>
                        <td className='px-5 py-4'>
                          <div className='min-w-0'>
                            <div className='truncate font-black text-ink-950'>{brand.name}</div>
                            {brandId ? (
                              <div className='mt-0.5 truncate font-mono text-xs font-semibold text-slate-400'>
                                #{brandId.slice(-8).toUpperCase()}
                              </div>
                            ) : null}
                          </div>
                        </td>
                        <td className='max-w-[360px] px-5 py-4'>
                          <p className='line-clamp-2 text-sm leading-6 text-slate-500'>{brand.desc || 'Chưa cập nhật'}</p>
                        </td>
                        <td className='px-5 py-4'>
                          <span className='rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-black text-brand-700'>
                            {brand.hotline || 'N/A'}
                          </span>
                        </td>
                        <td className='max-w-[360px] px-5 py-4'>
                          <p className='line-clamp-2 text-sm leading-6 text-slate-500'>{brand.address || 'Chưa cập nhật'}</p>
                        </td>
                        <td className='px-5 py-4 text-right'>
                          <div className='flex items-center justify-end gap-2'>
                            <Link to={`/admin/brands/${brandId}/edit`} className='rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-600 transition hover:bg-slate-100 hover:text-ink-950'>
                              Sửa
                            </Link>
                            <button
                              type='button'
                              disabled={deletingId === brandId}
                              onClick={() => brandId && handleDelete(brandId)}
                              className='rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-black text-rose-700 transition hover:bg-rose-100 disabled:opacity-50'
                            >
                              {deletingId === brandId ? 'Đang xóa...' : 'Xóa'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
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
            itemLabel='thương hiệu'
          />
        ) : null}
      </div>
    </AdminTableShell>
  )
}
