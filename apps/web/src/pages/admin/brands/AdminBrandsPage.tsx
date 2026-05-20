import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { RefreshCw, Search } from 'lucide-react'
import AdminTableShell from '../../../components/ui/AdminTable'
import { getBrandsApi } from '../../../services/brands.services'
import type { Brand } from '../../../models/BrandRequests'

function SkeletonRow() {
  return (
    <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} className='border-b border-white/[0.05]'>
      {[45, 75, 35, 65, 25].map((w, i) => (
        <td key={i} className='p-4'>
          <div className='h-4 animate-pulse rounded-md bg-white/[0.06]' style={{ width: `${w}%` }} />
        </td>
      ))}
    </motion.tr>
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

const rowVariants = {
  hidden: {
    opacity: 0,
    y: 8
  },
  show: {
    opacity: 1,
    y: 0
  },
  exit: {
    opacity: 0,
    y: -8
  }
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

    return brands.filter((b) => {
      const brandId = b._id || ''

      return (
        b.name?.toLowerCase().includes(kw) ||
        b.desc?.toLowerCase().includes(kw) ||
        b.hotline?.toLowerCase().includes(kw) ||
        b.address?.toLowerCase().includes(kw) ||
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
          {/* FILTER BAR */}
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
                placeholder='Tìm theo tên, hotline, địa chỉ, ID...'
                className='h-10 w-full rounded-xl border border-white/[0.08] bg-white/[0.04] pl-9 pr-4 text-[13px] text-white placeholder:text-slate-600 outline-none transition focus:border-white/[0.15] focus:bg-white/[0.06]'
              />
            </div>

            <motion.button
              whileHover={{ y: -1, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={fetchBrands}
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
          </motion.div>

          {/* ERROR */}
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

          {/* TABLE */}
          <motion.div
            initial='hidden'
            animate='show'
            className='overflow-x-auto rounded-[20px] border border-white/[0.08] bg-white/[0.035] shadow-[0_10px_40px_rgba(0,0,0,0.18)]'
          >
            <table className='w-full text-sm'>
              <thead>
                <tr className='border-b border-white/[0.06]'>
                  {['Thương hiệu', 'Mô tả', 'Hotline', 'Địa chỉ', ''].map((h, i) => (
                    <th
                      key={i}
                      className={`px-5 py-3.5 text-[11px] font-semibold tracking-wider text-slate-500 ${
                        i === 4 ? 'text-right' : 'text-left'
                      }`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <motion.tbody variants={tbodyVariants} initial='hidden' animate='show'>
                {loading && Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}

                {!loading && filteredBrands.length === 0 && (
                  <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <td colSpan={5} className='px-5 py-14 text-center text-sm text-slate-600'>
                      Không tìm thấy thương hiệu nào.
                    </td>
                  </motion.tr>
                )}

                {!loading && (
                  <AnimatePresence mode='popLayout'>
                    {filteredBrands.map((b) => {
                      const brandId = b._id

                      return (
                        <motion.tr
                          key={brandId}
                          layout
                          variants={rowVariants}
                          initial='hidden'
                          animate='show'
                          exit='exit'
                          whileHover={{ backgroundColor: 'rgba(255,255,255,0.035)' }}
                          className='group border-b border-white/[0.05] transition-colors last:border-0'
                        >
                          {/* NAME */}
                          <td className='px-5 py-4'>
                            <div className='min-w-0'>
                              <motion.div layout className='truncate font-semibold text-white'>
                                {b.name}
                              </motion.div>

                              {brandId && (
                                <div className='mt-0.5 truncate font-mono text-[11px] text-slate-600'>
                                  #{brandId.slice(-8).toUpperCase()}
                                </div>
                              )}
                            </div>
                          </td>

                          {/* DESC */}
                          <td className='max-w-[360px] px-5 py-4'>
                            <p className='line-clamp-2 text-[13px] leading-5 text-slate-400'>
                              {b.desc || 'Chưa cập nhật'}
                            </p>
                          </td>

                          {/* HOTLINE */}
                          <td className='px-5 py-4'>
                            <span className='rounded-lg border border-orange-500/20 bg-orange-500/10 px-2.5 py-1 font-mono text-[12px] font-semibold text-orange-300'>
                              {b.hotline || 'N/A'}
                            </span>
                          </td>

                          {/* ADDRESS */}
                          <td className='max-w-[360px] px-5 py-4'>
                            <p className='line-clamp-2 text-[13px] leading-5 text-slate-400'>
                              {b.address || 'Chưa cập nhật'}
                            </p>
                          </td>

                          {/* ACTION */}
                          <td className='px-5 py-4 text-right'>
                            <div className='flex items-center justify-end gap-2'>
                              <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }}>
                                <Link
                                  to={`/admin/brands/${brandId}/edit`}
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
                      )
                    })}
                  </AnimatePresence>
                )}
              </motion.tbody>
            </table>

            {/* FOOTER */}
            <AnimatePresence>
              {!loading && filteredBrands.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className='border-t border-white/[0.05] px-5 py-3 text-[12px] text-slate-600'
                >
                  Hiển thị {filteredBrands.length} / {brands.length} thương hiệu
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </motion.div>
    </AdminTableShell>
  )
}
