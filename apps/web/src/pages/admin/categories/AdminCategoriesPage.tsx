import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { RefreshCw, Search } from 'lucide-react'
import { toast } from 'sonner'
import AdminTableShell from '../../../components/ui/AdminTable'
import PaginationBar from '../../../components/ui/PaginationBar'
import { useDebouncedValue } from '../../../hooks/useDebouncedValue'
import { ADMIN_LIST_LIMIT } from '../../../models/Pagination'
import { deleteCategoryApi, getCategoriesApi } from '../../../services/categories.services'
import { getApiErrorMessage } from '../../../utils/apiError'

type Category = {
  _id?: string
  id?: string | number
  name?: string
  title?: string
  desc?: string
  description?: string
  productsCount?: number
}

export default function AdminCategoriesPage() {
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
    queryKey: ['admin-categories', page, debouncedSearch],
    queryFn: async () => {
      const res = await getCategoriesApi(page, ADMIN_LIST_LIMIT, debouncedSearch)
      return {
        categories: (res.data.data ?? []) as Category[],
        pagination: res.data.pagination
      }
    }
  })

  const categories = data?.categories ?? []
  const pagination = data?.pagination
  const error = isError ? 'Không tải được danh sách danh mục' : ''

  const handleDelete = async (categoryId: string) => {
    if (!window.confirm('Xóa danh mục này? Hành động không thể hoàn tác.')) return
    try {
      setDeletingId(categoryId)
      await deleteCategoryApi(categoryId)
      toast.success('Đã xóa danh mục')
      refetch()
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Không thể xóa danh mục'))
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <AdminTableShell
      title='Danh mục'
      subTitle='Tổ chức danh mục sản phẩm để bộ lọc và trải nghiệm mua sắm rõ ràng hơn.'
      createTo='/admin/categories/create'
      createLabel='Thêm danh mục'
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
              placeholder='Tìm theo tên danh mục, mô tả, ID...'
              className='premium-input pl-10'
            />
          </div>

          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className='inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50'
          >
            <RefreshCw size={15} className={isFetching ? 'animate-spin' : ''} />
            Reload
          </button>
        </div>

        {error ? <div className='rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-900'>{error}</div> : null}

        <div className='surface-strong overflow-x-auto rounded-3xl'>
          <table className='w-full text-sm'>
            <thead>
              <tr className='border-b border-slate-200 bg-slate-50/80'>
                <th className='px-5 py-4 text-left text-xs font-black uppercase tracking-[0.12em] text-slate-400'>Danh mục</th>
                <th className='px-5 py-4 text-left text-xs font-black uppercase tracking-[0.12em] text-slate-400'>Mô tả</th>
                <th className='px-5 py-4 text-left text-xs font-black uppercase tracking-[0.12em] text-slate-400'>Sản phẩm</th>
                <th className='px-5 py-4 text-right text-xs font-black uppercase tracking-[0.12em] text-slate-400'>Thao tác</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                Array.from({ length: 4 }).map((_, index) => (
                  <tr key={index} className='border-b border-slate-100'>
                    <td className='p-4'><div className='h-4 w-48 animate-pulse rounded bg-slate-100' /></td>
                    <td className='p-4'><div className='h-4 w-72 animate-pulse rounded bg-slate-100' /></td>
                    <td className='p-4'><div className='h-4 w-16 animate-pulse rounded bg-slate-100' /></td>
                    <td className='p-4'><div className='ml-auto h-4 w-24 animate-pulse rounded bg-slate-100' /></td>
                  </tr>
                ))
              ) : null}

              {!loading && categories.length === 0 ? (
                <tr>
                  <td colSpan={4} className='px-5 py-14 text-center text-sm font-semibold text-slate-500'>
                    Không tìm thấy danh mục nào.
                  </td>
                </tr>
              ) : null}

              {!loading
                ? categories.map((category) => {
                    const id = String(category._id || category.id || '')
                    const productCount = Number(category.productsCount || 0)

                    return (
                      <tr key={id || category.name} className='border-b border-slate-100 transition hover:bg-slate-50/80 last:border-0'>
                        <td className='px-5 py-4'>
                          <div className='font-black text-ink-950'>{category.name || category.title || 'Không tên'}</div>
                          {id ? <div className='mt-0.5 font-mono text-xs font-semibold text-slate-400'>#{id.slice(-8).toUpperCase()}</div> : null}
                        </td>
                        <td className='max-w-[420px] px-5 py-4 text-sm leading-6 text-slate-500'>
                          {category.desc || category.description || 'Chưa cập nhật'}
                        </td>
                        <td className='px-5 py-4'>
                          <span className='rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-black text-slate-700'>
                            {productCount}
                          </span>
                        </td>
                        <td className='px-5 py-4 text-right'>
                          <div className='flex items-center justify-end gap-2'>
                            <Link to={`/admin/categories/${id}/edit`} className='rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-600 transition hover:bg-slate-100 hover:text-ink-950'>
                              Sửa
                            </Link>
                            <button
                              type='button'
                              disabled={productCount > 0 || !id || deletingId === id}
                              onClick={() => id && handleDelete(id)}
                              className='rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-black text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-45'
                            >
                              {deletingId === id ? 'Đang xóa...' : 'Xóa'}
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
            itemLabel='danh mục'
          />
        ) : null}
      </div>
    </AdminTableShell>
  )
}
