import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { RefreshCw, Search } from 'lucide-react'
import AdminTableShell from '../../../components/ui/AdminTable'
import { getCategoriesApi } from '../../../services/categories.services'

type Category = {
  _id?: string
  id?: string | number
  name?: string
  title?: string
  desc?: string
  description?: string
  productsCount?: number
}

function extractList(response: unknown): Category[] {
  if (Array.isArray(response)) return response as Category[]
  if (!response || typeof response !== 'object') return []

  const obj = response as Record<string, unknown>
  const candidates = [obj.data, obj.result, obj.items, obj.categories]

  for (const candidate of candidates) {
    const list = extractList(candidate)
    if (list.length) return list
  }

  return []
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  const fetchCategories = async () => {
    try {
      setLoading(true)
      setError('')
      const res = await getCategoriesApi()
      setCategories(extractList(res))
    } catch (err) {
      console.error(err)
      setError('Không tải được danh sách danh mục')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const filteredCategories = useMemo(() => {
    const kw = search.trim().toLowerCase()
    if (!kw) return categories

    return categories.filter((category) => {
      const id = String(category._id || category.id || '')
      const name = category.name || category.title || ''
      const desc = category.desc || category.description || ''
      return id.toLowerCase().includes(kw) || name.toLowerCase().includes(kw) || desc.toLowerCase().includes(kw)
    })
  }, [categories, search])

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
              onChange={(e) => setSearch(e.target.value)}
              placeholder='Tìm theo tên danh mục, mô tả, ID...'
              className='premium-input pl-10'
            />
          </div>

          <button
            onClick={fetchCategories}
            disabled={loading}
            className='inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50'
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
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

              {!loading && filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={4} className='px-5 py-14 text-center text-sm font-semibold text-slate-500'>
                    Không tìm thấy danh mục nào.
                  </td>
                </tr>
              ) : null}

              {!loading
                ? filteredCategories.map((category) => {
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
                              disabled={productCount > 0}
                              className='rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-black text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-45'
                            >
                              Xóa
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
      </div>
    </AdminTableShell>
  )
}
