import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  Droplets,
  Flower2,
  Heart,
  Leaf,
  MapPin,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Sun
} from 'lucide-react'
import ProductCard from '../../components/ui/ProductCard'
import SectionHeader from '../../components/ui/SectionHeader'
import PaginationBar from '../../components/ui/PaginationBar'
import { fadeUpItem, staggerContainer } from '../../constants/motion'
import { useProducts } from '../../hooks/useProducts'
import type { ProductFilters } from '../../services/products.services'
import { getCategoriesApi } from '../../services/categories.services'
import { getToken } from '../../utils/authSession'
import cn from '../../utils/cn'

const GRID_LIMIT = 10
const SEARCH_LIMIT = 12

type FilterOption = { id: string; slug: string; name: string }

function toSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

const COSMETIC_CHIP_HINTS = [
  'Skincare',
  'Makeup',
  'Cleansing',
  'Sunscreen',
  'Serum',
  'Lip Care',
  'Body Care'
]

function extractCategories(res: { data?: unknown }): FilterOption[] {
  const findArray = (value: unknown): unknown[] => {
    if (Array.isArray(value)) return value
    if (!value || typeof value !== 'object') return []
    const obj = value as Record<string, unknown>
    for (const key of ['data', 'result', 'items', 'categories']) {
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
      const row = item as { _id?: string; id?: string; slug?: string; name?: string; title?: string }
      const id = row._id || row.id
      const name = row.name || row.title
      if (!id || !name) return null
      const slug = row.slug || toSlug(name)
      return { id, slug, name }
    })
    .filter((item): item is FilterOption => Boolean(item))
}

function orderCategoriesForChips(categories: FilterOption[]): FilterOption[] {
  if (categories.length === 0) return []

  const ranked = [...categories].sort((a, b) => {
    const ai = COSMETIC_CHIP_HINTS.findIndex((hint) => a.name.toLowerCase().includes(hint.toLowerCase()))
    const bi = COSMETIC_CHIP_HINTS.findIndex((hint) => b.name.toLowerCase().includes(hint.toLowerCase()))
    const aRank = ai === -1 ? 99 : ai
    const bRank = bi === -1 ? 99 : bi
    return aRank - bRank
  })

  return ranked.slice(0, 8)
}

function ProductGridSkeleton() {
  return (
    <div className='grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4'>
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className='h-72 animate-pulse rounded-lg border border-[#eaded8] bg-white/80 p-3'>
          <div className='h-40 rounded-md bg-[#f5ebe6]' />
          <div className='mt-3 h-3 w-3/4 rounded bg-[#f0e4de]' />
          <div className='mt-2 h-3 w-1/2 rounded bg-[#f0e4de]' />
        </div>
      ))}
    </div>
  )
}

export default function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const urlSearch = searchParams.get('search') ?? ''
  const categoryId = searchParams.get('category') ?? ''
  const [categories, setCategories] = useState<FilterOption[]>([])

  const setCategoryId = (id: string) => {
    const next = new URLSearchParams(searchParams)
    if (id) next.set('category', id)
    else next.delete('category')
    setSearchParams(next, { replace: true })
  }

  useEffect(() => {
    getCategoriesApi(1, 100)
      .then((res) => setCategories(orderCategoriesForChips(extractCategories(res))))
      .catch(() => setCategories([]))
  }, [])

  return (
    <div className='home-cosmetics pb-14 [--home-blush:#fdf2f0]'>
      <HomeHero />
      <CategoryChips categories={categories} selectedId={categoryId} onSelect={setCategoryId} />
      {urlSearch ? (
        <SearchResultsSection key={`${urlSearch}-${categoryId}`} initialSearch={urlSearch} categoryId={categoryId} />
      ) : null}
      <ProductShowcase
        key={categoryId || 'all'}
        id='new-arrivals'
        eyebrow='Mới về'
        title='Sản phẩm mới'
        desc='Công thức mới, texture mềm mại — cập nhật routine làm đẹp của bạn.'
        sort='newest'
        categoryId={categoryId}
      />
      <BrandStory />
      <PromoStrip />
    </div>
  )
}

function HomeHero() {
  return (
    <section className='mx-auto max-w-7xl px-4 pt-5 md:px-6 md:pt-8'>
      <div className='relative overflow-hidden rounded-lg border border-[#eaded8]'>
        <div className='absolute inset-0 bg-[linear-gradient(125deg,#fff9f7_0%,#fdf2f0_42%,#faf6f1_100%)]' />
        <div className='absolute -right-16 top-8 h-56 w-56 rounded-full bg-[#f5d5cf]/30 blur-3xl' />
        <div className='absolute -left-10 bottom-0 h-40 w-40 rounded-full bg-[#e8f0ea]/40 blur-2xl' />

        <div className='relative grid gap-8 px-5 py-10 md:grid-cols-[1.1fr_0.9fr] md:items-center md:px-10 md:py-14'>
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <p className='inline-flex items-center gap-2 rounded-full border border-[#e8c4bc]/60 bg-white/70 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-[#a66b62]'>
              <Sparkles size={14} />
              Skincare &amp; Cosmetics
            </p>
            <h1 className='mt-5 text-3xl font-semibold leading-[1.15] tracking-tight text-[#3d3330] md:text-5xl'>
              Làn da dịu nhẹ,
              <span className='block text-[#b07a72]'>vẻ đẹp tự nhiên.</span>
            </h1>
            <p className='mt-4 max-w-lg text-sm leading-7 text-[#6b5f59] md:text-base'>
              Công thức lành tính lấy cảm hứng từ thiên nhiên — serum, sữa rửa mặt và makeup nhẹ nhàng cho mọi routine.
            </p>
            <div className='mt-7 flex flex-wrap gap-3'>
              <a
                href='#new-arrivals'
                className='inline-flex h-11 items-center gap-2 rounded-md bg-[#3d3330] px-5 text-sm font-semibold text-white transition hover:bg-[#2a2421]'
              >
                Khám phá sản phẩm <ArrowRight size={16} />
              </a>
              <a
                href='#new-arrivals'
                className='inline-flex h-11 items-center rounded-md border border-[#dccbc4] bg-white/80 px-5 text-sm font-semibold text-[#4a403c] transition hover:bg-white'
              >
                Xem hàng mới
              </a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.45, delay: 0.08 }}
            className='relative mx-auto w-full max-w-md rounded-lg border border-[#eaded8] bg-white/75 p-5 md:max-w-none'
          >
            <div className='grid grid-cols-2 gap-3'>
              {[
                { label: 'Serum', tone: 'bg-[#fdf2f0]', image: '/images/serum-routine-essentials.png' },
                { label: 'Cleanser', tone: 'bg-[#f7f3ee]', image: '/images/cleanser-routine-essentials.jpg' },
                { label: 'SPF', tone: 'bg-[#eef4ef]', image: '/images/spf-routine-essentials.png' },
                { label: 'Lip', tone: 'bg-[#faf0ee]', image: '/images/lip-routine-essentials.png' }
              ].map(({ label, tone, image }) => (
                <div
                  key={label}
                  className={cn(
                    'group relative flex aspect-square flex-col justify-end overflow-hidden rounded-md p-3',
                    tone
                  )}
                >
                  {image ? (
                    <img
                      src={image}
                      alt={label}
                      referrerPolicy='no-referrer'
                      className='absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105'
                    />
                  ) : null}
                  <div className='relative z-10 rounded-md bg-white/80 p-2 shadow-xs backdrop-blur-xs'>
                    <span className='text-xs font-bold uppercase tracking-wider text-[#8a726c]'>{label}</span>
                    <span className='mt-0.5 block text-xs font-semibold text-[#3d3330]'>Routine essentials</span>
                  </div>
                </div>
              ))}
            </div>
            <p className='mt-4 text-center text-xs font-medium text-[#8a7a74]'>
              Ảnh sản phẩm thật hiển thị tại các mục bên dưới
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

function CategoryChips({
  categories,
  selectedId,
  onSelect
}: {
  categories: FilterOption[]
  selectedId: string
  onSelect: (val: string) => void
}) {
  const chips =
    categories.length > 0
      ? categories
      : COSMETIC_CHIP_HINTS.map((name) => ({ id: '', slug: toSlug(name), name }))

  return (
    <section className='mx-auto max-w-7xl px-4 pt-6 md:px-6' aria-label='Danh mục mỹ phẩm'>
      <div className='flex items-center justify-between gap-3'>
        <h2 className='text-sm font-semibold text-[#5c504a]'>Mua theo danh mục</h2>
        {selectedId ? (
          <button
            type='button'
            onClick={() => onSelect('')}
            className='text-xs font-semibold text-[#b07a72] hover:underline'
          >
            Xóa bộ lọc
          </button>
        ) : null}
      </div>
      <div className='mt-3 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'>
        <button
          type='button'
          onClick={() => onSelect('')}
          className={cn(
            'shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition',
            !selectedId
              ? 'border-[#3d3330] bg-[#3d3330] text-white'
              : 'border-[#e5d5ce] bg-white text-[#5c504a] hover:border-[#cbb8af]'
          )}
        >
          Tất cả
        </button>
        {chips.map((chip) => {
          const targetValue = chip.slug || chip.id
          const isActive = Boolean(targetValue) && (selectedId === chip.slug || selectedId === chip.id)
          const isStatic = !targetValue
          return (
            <button
              key={chip.slug || chip.id || chip.name}
              type='button'
              disabled={isStatic}
              onClick={() => targetValue && onSelect(isActive ? '' : targetValue)}
              className={cn(
                'shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition',
                isActive
                  ? 'border-[#3d3330] bg-[#3d3330] text-white'
                  : 'border-[#e5d5ce] bg-white text-[#5c504a]',
                isStatic ? 'cursor-default opacity-60' : 'hover:border-[#cbb8af]'
              )}
            >
              {chip.name}
            </button>
          )
        })}
      </div>
    </section>
  )
}

function ProductShowcase({
  id,
  eyebrow,
  title,
  desc,
  sort,
  categoryId
}: {
  id: string
  eyebrow: string
  title: string
  desc: string
  sort: NonNullable<ProductFilters['sort']>
  categoryId: string
}) {
  const [page, setPage] = useState(1)

  useEffect(() => {
    setPage(1)
  }, [categoryId])

  const filters = useMemo<ProductFilters>(
    () => ({
      sort,
      category_id: categoryId || undefined
    }),
    [sort, categoryId]
  )

  const { data, isLoading } = useProducts(page, GRID_LIMIT, filters)
  const products = data?.products ?? []
  const pagination = data?.pagination

  return (
    <section id={id} className='mx-auto max-w-7xl scroll-mt-28 px-4 py-8 md:px-6'>
      <SectionHeader eyebrow={eyebrow} title={title} desc={desc} />
      <div className='mt-6'>
        {isLoading ? (
          <ProductGridSkeleton />
        ) : products.length === 0 ? (
          <div className='rounded-lg border border-dashed border-[#dccbc4] bg-white/70 p-10 text-center text-sm font-medium text-[#8a7a74]'>
            Chưa có sản phẩm trong danh mục này.
          </div>
        ) : (
          <>
            <motion.div
              variants={staggerContainer}
              initial='hidden'
              whileInView='show'
              viewport={{ once: true, margin: '-40px' }}
              className='grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4'
            >
              {products.map((product) => (
                <motion.div key={product._id} variants={fadeUpItem}>
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </motion.div>
            {pagination && pagination.totalPages > 1 ? (
              <PaginationBar
                pagination={pagination}
                page={page}
                onPageChange={setPage}
                isLoading={isLoading}
                itemLabel='sản phẩm'
              />
            ) : null}
          </>
        )}
      </div>
    </section>
  )
}

function SearchResultsSection({ initialSearch, categoryId }: { initialSearch: string; categoryId: string }) {
  const [page, setPage] = useState(1)

  useEffect(() => {
    setPage(1)
  }, [initialSearch, categoryId])

  const filters = useMemo<ProductFilters>(
    () => ({
      search: initialSearch || undefined,
      sort: 'newest',
      category_id: categoryId || undefined
    }),
    [initialSearch, categoryId]
  )

  const { data, isLoading } = useProducts(page, SEARCH_LIMIT, filters)
  const products = data?.products ?? []
  const pagination = data?.pagination

  return (
    <section id='featured-products' className='mx-auto max-w-7xl scroll-mt-28 px-4 py-6 md:px-6'>
      <SectionHeader
        eyebrow='Tìm kiếm'
        title={`Kết quả cho "${initialSearch}"`}
        desc='Lọc thêm bằng category chips phía trên nếu cần.'
      />
      <div className='mt-6'>
        {isLoading ? (
          <ProductGridSkeleton />
        ) : products.length === 0 ? (
          <div className='rounded-lg border border-dashed border-[#dccbc4] bg-white/70 p-10 text-center text-sm font-medium text-[#8a7a74]'>
            Không tìm thấy sản phẩm phù hợp.
          </div>
        ) : (
          <>
            <motion.div
              variants={staggerContainer}
              initial='hidden'
              animate='show'
              className='grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4'
            >
              {products.map((product) => (
                <motion.div key={product._id} variants={fadeUpItem}>
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </motion.div>
            {pagination && pagination.totalPages > 1 ? (
              <PaginationBar
                pagination={pagination}
                page={page}
                onPageChange={setPage}
                isLoading={isLoading}
                itemLabel='sản phẩm'
              />
            ) : null}
          </>
        )}
      </div>
    </section>
  )
}

function BrandStory() {
  const pillars = [
    {
      icon: Leaf,
      title: 'Thành phần tự nhiên',
      desc: 'Chiết xuất thực vật, ưu tiên công thức tối giản và dịu cho da nhạy cảm.'
    },
    {
      icon: Heart,
      title: 'Cruelty-free',
      desc: 'Cam kết không thử nghiệm trên động vật — làm đẹp có trách nhiệm.'
    },
    {
      icon: Droplets,
      title: 'Công thức dịu nhẹ',
      desc: 'Texture mỏng nhẹ, thấm nhanh — phù hợp routine hằng ngày.'
    }
  ]

  return (
    <section className='mx-auto max-w-7xl px-4 py-8 md:px-6'>
      <div className='overflow-hidden rounded-lg border border-[#eaded8] bg-[linear-gradient(180deg,#fffcfb,#faf6f2)]'>
        <div className='grid gap-8 p-6 md:grid-cols-2 md:p-10'>
          <div>
            <p className='text-xs font-bold uppercase tracking-[0.16em] text-[#b07a72]'>Our story</p>
            <h2 className='mt-2 text-2xl font-semibold tracking-tight text-[#3d3330] md:text-3xl'>
              Vibrant Mart — làn da khỏe từ những điều giản dị
            </h2>
            <p className='mt-4 text-sm leading-7 text-[#6b5f59] md:text-base'>
              Chúng tôi chọn lọc mỹ phẩm chăm sóc da và trang điểm nhẹ nhàng, lấy cảm hứng từ thiên nhiên và khoa học
              làm đẹp hiện đại. Mỗi sản phẩm đều hướng tới sự an toàn, minh bạch và cảm giác thoải mái trên da.
            </p>
            <Link
              to='/user/home#new-arrivals'
              className='mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#b07a72] hover:text-[#8f5f58]'
            >
              Khám phá bộ sưu tập <ArrowRight size={16} />
            </Link>
          </div>
          <div className='space-y-3'>
            {pillars.map(({ icon: Icon, title, desc }) => (
              <div key={title} className='flex gap-4 rounded-lg border border-[#eaded8]/80 bg-white/80 p-4'>
                <span className='grid h-10 w-10 shrink-0 place-items-center rounded-md bg-[#fdf2f0] text-[#b07a72]'>
                  <Icon size={18} />
                </span>
                <div>
                  <h3 className='font-semibold text-[#3d3330]'>{title}</h3>
                  <p className='mt-1 text-sm leading-6 text-[#6b5f59]'>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function PromoStrip() {
  const hasToken = Boolean(getToken())
  const items = [
    { icon: MapPin, title: 'Giao trong 25km', desc: 'Phí ship tính theo khoảng cách, minh bạch.' },
    { icon: ShieldCheck, title: 'Hàng chính hãng', desc: 'Nguồn gốc rõ ràng, kiểm soát chất lượng.' },
    { icon: RefreshCw, title: 'Đổi trả minh bạch', desc: 'Chính sách hỗ trợ sau bán hàng rõ ràng.' },
    { icon: Flower2, title: 'Tư vấn làm đẹp', desc: 'Gợi ý routine phù hợp loại da của bạn.' }
  ]

  return (
    <section className='mx-auto max-w-7xl px-4 pb-2 md:px-6' aria-label='Cam kết dịch vụ'>
      <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-4'>
        {items.map(({ icon: Icon, title, desc }) => (
          <div
            key={title}
            className='flex gap-3 rounded-lg border border-[#eaded8] bg-white/85 p-4 transition hover:border-[#dccbc4]'
          >
            <span className='grid h-10 w-10 shrink-0 place-items-center rounded-md bg-[#f7f3ee] text-[#7a6a62]'>
              <Icon size={18} />
            </span>
            <div>
              <h3 className='text-sm font-semibold text-[#3d3330]'>{title}</h3>
              <p className='mt-1 text-xs leading-5 text-[#8a7a74]'>{desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className='mt-6 flex flex-col items-start justify-between gap-4 rounded-lg border border-[#eaded8] bg-[#fdf8f6] p-5 md:flex-row md:items-center'>
        <div className='flex items-start gap-3'>
          <span className='grid h-10 w-10 place-items-center rounded-md bg-white text-[#b07a72] shadow-sm'>
            <Sun size={18} />
          </span>
          <div>
            <p className='font-semibold text-[#3d3330]'>
              {hasToken
                ? 'Chào mừng bạn trở lại Vibrant Mart!'
                : 'Đăng nhập để lưu routine & theo dõi đơn hàng'}
            </p>
            <p className='mt-1 text-sm text-[#8a7a74]'>
              {hasToken
                ? 'Theo dõi trạng thái giao hàng và quản lý tài khoản của bạn.'
                : 'Ưu đãi dành riêng cho thành viên Vibrant Mart.'}
            </p>
          </div>
        </div>
        <Link
          to={hasToken ? '/user/my-orders' : '/auth/login'}
          className='inline-flex h-10 items-center rounded-md bg-[#3d3330] px-5 text-sm font-semibold text-white transition hover:bg-[#2a2421]'
        >
          {hasToken ? 'Đơn hàng của tôi' : 'Đăng nhập'}
        </Link>
      </div>
    </section>
  )
}
