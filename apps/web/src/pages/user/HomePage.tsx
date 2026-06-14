import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, BadgeCheck, ChevronLeft, ChevronRight, PackageCheck, Search, ShieldCheck, Sparkles, Truck } from 'lucide-react'
import ProductCard from '../../components/ui/ProductCard'
import SectionHeader from '../../components/ui/SectionHeader'
import Button from '../../components/ui/Button'
import { fadeUpItem, hoverLift, panelMotion, staggerContainer } from '../../constants/motion'
import { useProducts } from '../../hooks/useProducts'
import type { ProductFilters } from '../../services/products.services'
import { getBrandsApi } from '../../services/brands.services'
import { getCategoriesApi } from '../../services/categories.services'

const LIMIT = 12

const SORT_OPTIONS: { value: NonNullable<ProductFilters['sort']>; label: string }[] = [
  { value: 'newest', label: 'Mới nhất' },
  { value: 'price_asc', label: 'Giá tăng dần' },
  { value: 'price_desc', label: 'Giá giảm dần' },
  { value: 'best_selling', label: 'Bán chạy' }
]

type FilterOption = { id: string; name: string }

function extractList(res: { data?: unknown }): FilterOption[] {
  const findArray = (value: unknown): unknown[] => {
    if (Array.isArray(value)) return value
    if (!value || typeof value !== 'object') return []
    const obj = value as Record<string, unknown>
    for (const key of ['data', 'result', 'items', 'brands', 'categories']) {
      const nested = obj[key]
      if (Array.isArray(nested)) return nested
      if (nested && typeof nested === 'object') {
        const inner = findArray(nested)
        if (inner.length) return inner
      }
    }
    return []
  }

  return findArray(res.data)
    .map((item) => {
      const row = item as { _id?: string; id?: string; name?: string; title?: string }
      const id = row._id || row.id
      const name = row.name || row.title
      if (!id || !name) return null
      return { id, name }
    })
    .filter((item): item is FilterOption => Boolean(item))
}

export default function HomePage() {
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<NonNullable<ProductFilters['sort']>>('newest')
  const [page, setPage] = useState(1)
  const [categoryId, setCategoryId] = useState('')
  const [brandId, setBrandId] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [categories, setCategories] = useState<FilterOption[]>([])
  const [brands, setBrands] = useState<FilterOption[]>([])

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim())
      setPage(1)
    }, 400)
    return () => clearTimeout(timer)
  }, [searchInput])

  useEffect(() => {
    const loadFilters = async () => {
      try {
        const [categoriesRes, brandsRes] = await Promise.all([getCategoriesApi(), getBrandsApi()])
        setCategories(extractList(categoriesRes))
        setBrands(extractList(brandsRes))
      } catch {
        // catalog vẫn hoạt động nếu filter metadata lỗi
      }
    }
    loadFilters()
  }, [])

  const filters = useMemo<ProductFilters>(
    () => ({
      search: search || undefined,
      sort,
      category_id: categoryId || undefined,
      brand_id: brandId || undefined,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined
    }),
    [search, sort, categoryId, brandId, minPrice, maxPrice]
  )

  const { data, isLoading: loading } = useProducts(page, LIMIT, filters)
  const products = data?.products ?? []
  const pagination = data?.pagination
  const isFiltering =
    search !== '' ||
    sort !== 'newest' ||
    Boolean(categoryId) ||
    Boolean(brandId) ||
    Boolean(minPrice) ||
    Boolean(maxPrice)

  const catalogProducts = products

  const handleFilterChange = () => setPage(1)

  return (
    <div className='pb-12'>
      <section className='mx-auto max-w-7xl px-4 pt-6 md:px-6'>
        <div className='relative overflow-hidden rounded-3xl border border-brand-100 bg-brand-50 text-ink-900 shadow-lift'>
          <div className='absolute inset-0 bg-[linear-gradient(90deg,rgba(253,250,246,0.96),rgba(253,250,246,0.82),rgba(226,240,229,0.4))]' />

          <div className='relative px-5 py-10 md:px-10 md:py-14'>
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className='max-w-3xl'>
              <div className='inline-flex items-center gap-2 rounded-full border border-mint-500/30 bg-mint-50/60 px-4 py-2 text-sm font-bold text-mint-600 backdrop-blur-md shadow-sm'>
                <BadgeCheck size={16} className='text-mint-500' />
                Chiết xuất thiên nhiên, an toàn tuyệt đối
              </div>

              <h1 className='mt-6 text-4xl font-bold leading-tight tracking-tight text-ink-900 md:text-5xl'>
                Vẻ đẹp tinh khiết từ tự nhiên.
              </h1>

              <p className='mt-4 max-w-2xl text-base leading-7 text-ink-500 md:text-lg'>
                Khám phá bộ sưu tập chăm sóc da organic lành tính, được chiết xuất từ thiên nhiên giúp nuôi dưỡng làn da khỏe mạnh từ sâu bên trong.
              </p>

              <div className='mt-8 flex flex-col gap-3 sm:flex-row'>
                <a
                  href='#featured-products'
                  className='inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-brand-600 px-6 text-sm font-bold text-white shadow-xl transition hover:-translate-y-0.5 hover:bg-brand-900'
                >
                  Khám phá ngay <ArrowRight size={18} />
                </a>
                <Link
                  to='/user/orders'
                  className='inline-flex h-12 items-center justify-center rounded-2xl border border-ink-200 bg-white/50 px-6 text-sm font-bold text-ink-700 backdrop-blur transition hover:-translate-y-0.5 hover:bg-white'
                >
                  Đơn hàng của bạn
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className='mx-auto grid max-w-7xl gap-3 px-4 py-6 md:grid-cols-3 md:px-6'>
        {[
          { icon: Truck, title: 'Giao nhanh', desc: 'Tối ưu vận chuyển cho từng đơn hàng.' },
          { icon: ShieldCheck, title: 'Bảo hành rõ ràng', desc: 'Chính sách minh bạch, dễ tra cứu.' },
          { icon: PackageCheck, title: 'Sản phẩm chọn lọc', desc: 'Danh mục được kiểm soát chất lượng.' }
        ].map(({ icon: Icon, title, desc }) => (
          <motion.div
            key={title}
            whileHover={hoverLift}
            className='premium-panel interactive-lift flex items-start gap-4 rounded-3xl p-5'
          >
            <span className='grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-brand-100 text-brand-600'>
              <Icon size={20} />
            </span>
            <span>
              <span className='block font-bold text-ink-900'>{title}</span>
              <span className='mt-1 block text-sm leading-6 text-ink-500'>{desc}</span>
            </span>
          </motion.div>
        ))}
      </section>

      <section id='featured-products' className='mx-auto max-w-7xl px-4 py-6 md:px-6'>
        <SectionHeader
          eyebrow='Nổi bật'
          title={isFiltering ? 'Kết quả tìm kiếm' : 'Best Sellers'}
          desc={
            isFiltering
              ? 'Danh sách sản phẩm theo bộ lọc bạn chọn.'
              : 'Khám phá những sản phẩm chăm sóc da được yêu thích nhất từ thiên nhiên.'
          }
          action={
            <Link to='/user/home' className='inline-flex items-center gap-2 text-sm font-bold text-brand-600 hover:text-brand-900'>
              Xem bộ sưu tập <ArrowRight size={16} />
            </Link>
          }
        />

        <div className='mt-6 grid gap-3 lg:grid-cols-[1.4fr_1fr_1fr_1fr]'>
          <div className='relative lg:col-span-1'>
            <Search className='pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400' size={18} />
            <input
              type='search'
              aria-label='Tìm sản phẩm theo tên'
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder='Tìm sản phẩm theo tên...'
              className='h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm font-semibold text-slate-800 outline-none transition focus:border-brand-500/50 focus:ring-4 focus:ring-brand-500/10'
            />
          </div>
          <select
            aria-label='Danh mục'
            value={categoryId}
            onChange={(e) => {
              setCategoryId(e.target.value)
              handleFilterChange()
            }}
            className='h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-800 outline-none transition focus:border-brand-500/50 focus:ring-4 focus:ring-brand-500/10'
          >
            <option value=''>Tất cả danh mục</option>
            {categories.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
          <select
            aria-label='Thương hiệu'
            value={brandId}
            onChange={(e) => {
              setBrandId(e.target.value)
              handleFilterChange()
            }}
            className='h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-800 outline-none transition focus:border-brand-500/50 focus:ring-4 focus:ring-brand-500/10'
          >
            <option value=''>Tất cả thương hiệu</option>
            {brands.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
          <select
            aria-label='Sắp xếp sản phẩm'
            value={sort}
            onChange={(e) => {
              setSort(e.target.value as NonNullable<ProductFilters['sort']>)
              handleFilterChange()
            }}
            className='h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-800 outline-none transition focus:border-brand-500/50 focus:ring-4 focus:ring-brand-500/10'
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className='mt-3 grid gap-3 sm:grid-cols-2'>
          <input
            type='number'
            min={0}
            aria-label='Giá tối thiểu'
            value={minPrice}
            onChange={(e) => {
              setMinPrice(e.target.value)
              handleFilterChange()
            }}
            placeholder='Giá từ (VNĐ)'
            className='h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 outline-none transition focus:border-brand-500/50 focus:ring-4 focus:ring-brand-500/10'
          />
          <input
            type='number'
            min={0}
            aria-label='Giá tối đa'
            value={maxPrice}
            onChange={(e) => {
              setMaxPrice(e.target.value)
              handleFilterChange()
            }}
            placeholder='Giá đến (VNĐ)'
            className='h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 outline-none transition focus:border-brand-500/50 focus:ring-4 focus:ring-brand-500/10'
          />
        </div>

        <div className='mt-6'>
          {loading ? (
            <div className='grid grid-cols-2 gap-4 lg:grid-cols-4'>
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className='h-80 animate-pulse rounded-3xl border border-slate-200 bg-white p-3 shadow-sm'>
                  <div className='h-44 rounded-2xl bg-slate-100' />
                  <div className='mt-4 h-4 w-3/4 rounded bg-slate-100' />
                  <div className='mt-3 h-4 w-1/2 rounded bg-slate-100' />
                </div>
              ))}
            </div>
          ) : catalogProducts.length === 0 ? (
            <div className='rounded-3xl border border-dashed border-slate-200 bg-white p-10 text-center text-sm font-semibold text-slate-500'>
              Không tìm thấy sản phẩm phù hợp{search ? ` với "${search}"` : ''}.
            </div>
          ) : (
            <motion.div variants={staggerContainer} initial='hidden' animate='show' className='grid grid-cols-2 gap-4 lg:grid-cols-4'>
              {catalogProducts.map((product) => (
                <motion.div key={product._id} variants={fadeUpItem}>
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>

        {pagination && pagination.totalPages > 1 ? (
          <div className='mt-6 flex flex-col items-center justify-between gap-3 sm:flex-row'>
            <p className='text-sm font-semibold text-slate-500'>
              Trang {pagination.page} / {pagination.totalPages} · {pagination.totalItems} sản phẩm
            </p>
            <div className='flex items-center gap-2'>
              <Button
                variant='secondary'
                disabled={page <= 1 || loading}
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              >
                <ChevronLeft size={16} />
                Trước
              </Button>
              <Button
                variant='secondary'
                disabled={page >= pagination.totalPages || loading}
                onClick={() => setPage((prev) => prev + 1)}
              >
                Sau
                <ChevronRight size={16} />
              </Button>
            </div>
          </div>
        ) : null}

        <motion.div {...panelMotion} className='surface-card mt-8 rounded-3xl p-5 md:p-6'>
          <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
            <div className='flex items-start gap-3'>
              <span className='grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-brand-50 text-brand-600 shadow-sm'>
                <Sparkles size={20} />
              </span>
              <div>
                <div className='font-bold text-ink-900'>Bí quyết chăm sóc da dành riêng cho bạn</div>
                <p className='mt-1 text-sm leading-6 text-ink-500'>
                  Đăng nhập để nhận lộ trình chăm sóc da cá nhân hóa và các ưu đãi đặc quyền.
                </p>
              </div>
            </div>
            <Link
              to='/auth/login'
              className='inline-flex h-11 shrink-0 items-center justify-center rounded-2xl bg-brand-600 px-5 text-sm font-bold text-white shadow-md transition hover:bg-brand-900'
            >
              Đăng nhập
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  )
}
