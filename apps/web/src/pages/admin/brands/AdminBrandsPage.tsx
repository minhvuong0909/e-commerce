import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { RefreshCw, Search } from 'lucide-react'
import AdminTableShell from '../../../components/ui/AdminTable'
import type { Brand } from '../../../models/BrandRequests'
import { getBrandsApi } from '../../../services/brands.services'
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
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  const fetchBrands = async () => {
    try {
      setLoading(true)
      setError('')

      const res = await getBrandsApi()
      const list = Array.isArray(res) ? res : res?.data?.data

      setBrands(Array.isArray(list) ? list : [])
    } catch (err) {
      console.error(err)
      setError('Không tải được danh sách thương hiệu')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBrands()
  }, [])

  const filteredBrands = useMemo(() => {
    const kw = search.trim().toLowerCase()
    if (!kw) return brands

    return brands.filter((brand) => {
      const brandId = brand._id || ''

      return (
        brand.name?.toLowerCase().includes(kw) ||
        brand.desc?.toLowerCase().includes(kw) ||
        brand.hotline?.toLowerCase().includes(kw) ||
        brand.address?.toLowerCase().includes(kw) ||
        brandId.toLowerCase().includes(kw)
      )
    })
  }, [brands, search])

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
              onChange={(e) => setSearch(e.target.value)}
              placeholder='Tìm theo tên, hotline, địa chỉ, ID...'
              className='premium-input pl-10'
            />
          </div>

          <button
            onClick={fetchBrands}
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
                {['Thương hiệu', 'Mô tả', 'Hotline', 'Địa chỉ', ''].map((heading, index) => (
                  <th key={heading} className={cn('px-5 py-4 text-xs font-black uppercase tracking-[0.12em] text-slate-400', index === 4 ? 'text-right' : 'text-left')}>
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {loading ? Array.from({ length: 5 }).map((_, index) => <SkeletonRow key={index} />) : null}

              {!loading && filteredBrands.length === 0 ? (
                <tr>
                  <td colSpan={5} className='px-5 py-14 text-center text-sm font-semibold text-slate-500'>
                    Không tìm thấy thương hiệu nào.
                  </td>
                </tr>
              ) : null}

              {!loading
                ? filteredBrands.map((brand) => {
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
                            <button className='rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-black text-rose-700 transition hover:bg-rose-100'>
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

          {!loading && filteredBrands.length > 0 ? (
            <div className='border-t border-slate-100 px-5 py-3 text-xs font-bold text-slate-500'>
              Hiển thị {filteredBrands.length} / {brands.length} thương hiệu
            </div>
          ) : null}
        </div>
      </div>
    </AdminTableShell>
  )
}
