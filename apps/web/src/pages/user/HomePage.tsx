import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  Clock,
  Droplets,
  Flower2,
  Heart,
  Leaf,
  MapPin,
  RefreshCw,
  ShieldCheck,
  Sun,
  Zap
} from 'lucide-react'
import ProductCard from '../../components/ui/ProductCard'
import ProductCardSkeleton from '../../components/ui/ProductCardSkeleton'
import HomeHero from '../../components/ui/HomeHero'
import SectionHeader from '../../components/ui/SectionHeader'
import PaginationBar from '../../components/ui/PaginationBar'
import { fadeUpItem, staggerContainer } from '../../constants/motion'
import { useProducts } from '../../hooks/useProducts'
import type { ProductFilters } from '../../services/products.services'
import { getCategoriesApi } from '../../services/categories.services'
import { getToken } from '../../utils/authSession'
import cn from '../../utils/cn'

const GRID_LIMIT = 8
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
        <ProductCardSkeleton key={index} />
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
    <div className='home-cosmetics bg-[#FAF7F2] text-[#2B2118] min-h-screen'>
      <HomeHero />

      {/* Maison Partner Marquee Banner */}
      <section className='border-y border-[#EFECE6] bg-[#FFFFFF] py-4 px-4 overflow-hidden'>
        <div className='mx-auto max-w-7xl flex flex-wrap items-center justify-between gap-6 text-center opacity-70'>
          <span className='font-display font-bold text-xs uppercase tracking-[0.25em] text-[#8C7D70]'>Apex Beauty</span>
          <span className='font-display font-bold text-xs uppercase tracking-[0.25em] text-[#8C7D70]'>Luminary Skincare</span>
          <span className='font-display font-bold text-xs uppercase tracking-[0.25em] text-[#8C7D70]'>Obsidian Botanicals</span>
          <span className='font-display font-bold text-xs uppercase tracking-[0.25em] text-[#8C7D70]'>Veloce Paris</span>
          <span className='font-display font-bold text-xs uppercase tracking-[0.25em] text-[#8C7D70]'>Nectar Organics</span>
        </div>
      </section>

      {/* Flash Drops Banner */}
      <FlashDropsBanner />

      {/* Category Filter Chips */}
      <CategoryChips categories={categories} selectedId={categoryId} onSelect={setCategoryId} />

      {/* Search Results Section if Search Query Active */}
      {urlSearch ? (
        <SearchResultsSection key={`${urlSearch}-${categoryId}`} initialSearch={urlSearch} categoryId={categoryId} />
      ) : null}

      {/* Main New Arrivals Showcase Grid */}
      <ProductShowcase
        key={categoryId || 'all'}
        id='new-arrivals'
        eyebrow='Bảo Chứng Chất Lượng'
        title='Bộ Sưu Tập Mới Nhất'
        desc='Công thức dưỡng da cải tiến, texture mỏng nhẹ tự nhiên — cập nhật routine của bạn.'
        sort='newest'
        categoryId={categoryId}
      />

      <BrandStory />
      <PromoStrip />
    </div>
  )
}

function FlashDropsBanner() {
  return (
    <section className='px-4 py-8 md:px-6'>
      <div className='mx-auto max-w-7xl rounded-3xl border border-[#EFECE6] bg-[#FFFFFF] p-6 shadow-soft md:p-8 flex flex-col md:flex-row items-center justify-between gap-6'>
        <div className='flex items-center gap-4'>
          <span className='grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#2B2118] text-[#FAF7F2] shadow-sm'>
            <Zap size={24} className='text-[#9A8069]' />
          </span>
          <div>
            <div className='flex items-center gap-2'>
              <span className='rounded-full bg-[#9A8069] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white'>Flash Sale 24H</span>
              <span className='text-xs font-semibold text-[#8C7D70] inline-flex items-center gap-1'><Clock size={13} /> Giờ Vàng Giá Sốc</span>
            </div>
            <h3 className='mt-1 font-display text-xl font-bold text-[#2B2118] md:text-2xl'>
              Ưu đãi độc quyền lên tới 40% cho dòng Serum Tế Bào Gốc
            </h3>
          </div>
        </div>

        <a
          href='#new-arrivals'
          className='shrink-0 rounded-full bg-[#2B2118] px-7 py-3 text-xs font-bold uppercase tracking-widest text-[#FAF7F2] hover:bg-[#9A8069] transition-colors shadow-md'
        >
          Xem Sản Phẩm Sốc
        </a>
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
    <section className='bg-[#FAF7F2] px-4 pt-4 md:px-6' aria-label='Danh mục mỹ phẩm'>
      <div className='mx-auto max-w-7xl'>
        <div className='flex items-center justify-between gap-3'>
          <h2 className='font-display text-base font-bold text-[#2B2118]'>Danh Mục Nổi Bật</h2>
          {selectedId ? (
            <button
              type='button'
              onClick={() => onSelect('')}
              className='text-xs font-bold text-[#9A8069] hover:underline'
            >
              Xóa bộ lọc danh mục
            </button>
          ) : null}
        </div>
        <div className='mt-3 flex gap-2.5 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'>
          <button
            type='button'
            onClick={() => onSelect('')}
            className={cn(
              'shrink-0 rounded-full border px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-all',
              !selectedId
                ? 'border-[#2B2118] bg-[#2B2118] text-[#FAF7F2] shadow-sm'
                : 'border-[#EFECE6] bg-white text-[#594D42] hover:border-[#9A8069]'
            )}
          >
            Tất cả
          </button>
          {chips.map((chip) => {
            const targetValue = chip.id
            const isActive = Boolean(selectedId) && (selectedId === chip.slug || selectedId === chip.id)
            const isStatic = !targetValue
            return (
              <button
                key={chip.slug || chip.id || chip.name}
                type='button'
                disabled={isStatic}
                onClick={() => targetValue && onSelect(isActive ? '' : targetValue)}
                className={cn(
                  'shrink-0 rounded-full border px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-all',
                  isActive
                    ? 'border-[#2B2118] bg-[#2B2118] text-[#FAF7F2] shadow-sm'
                    : 'border-[#EFECE6] bg-white text-[#594D42]',
                  isStatic ? 'cursor-default opacity-60' : 'hover:border-[#9A8069]'
                )}
              >
                {chip.name}
              </button>
            )
          })}
        </div>
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
  const [prevCategoryId, setPrevCategoryId] = useState(categoryId)

  if (prevCategoryId !== categoryId) {
    setPrevCategoryId(categoryId)
    setPage(1)
  }

  const filters = useMemo<ProductFilters>(
    () => ({
      sort,
      category_id: categoryId || undefined
    }),
    [sort, categoryId]
  )

  const { data, isLoading, isError, refetch } = useProducts(page, GRID_LIMIT, filters)
  const products = data?.products ?? []
  const pagination = data?.pagination

  return (
    <section id={id} className='scroll-mt-28 bg-[#FAF7F2] px-4 py-10 md:px-6'>
      <div className='mx-auto max-w-7xl'>
        <SectionHeader eyebrow={eyebrow} title={title} desc={desc} />
        <div className='mt-8'>
          {isLoading ? (
            <ProductGridSkeleton />
          ) : isError ? (
            <div className='rounded-2xl border border-[#EFECE6] bg-white p-8 text-center text-sm text-[#8C7D70] shadow-soft'>
              <p>Chưa thể tải sản phẩm từ máy chủ. Vui lòng thử lại.</p>
              <button type='button' onClick={() => void refetch()} className='mt-4 rounded-full bg-[#2B2118] px-6 py-2 text-xs font-bold text-white'>Tải lại</button>
            </div>
          ) : products.length === 0 ? (
            <div className='rounded-2xl border border-dashed border-[#EFECE6] bg-white p-12 text-center text-sm font-medium text-[#8C7D70] shadow-xs'>
              Chưa tìm thấy sản phẩm trong danh mục lựa chọn.
            </div>
          ) : (
            <>
              <motion.div
                variants={staggerContainer}
                initial='hidden'
                animate='show'
                className='grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5 lg:grid-cols-4'
              >
                {products.map((product) => (
                  <motion.div key={product._id} variants={fadeUpItem}>
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </motion.div>
              {pagination && pagination.totalPages > 1 ? (
                <div className='mt-10'>
                  <PaginationBar
                    pagination={pagination}
                    page={page}
                    onPageChange={setPage}
                    isLoading={isLoading}
                    itemLabel='sản phẩm'
                  />
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>
    </section>
  )
}

function SearchResultsSection({ initialSearch, categoryId }: { initialSearch: string; categoryId: string }) {
  const [page, setPage] = useState(1)
  const currentKey = `${initialSearch}:${categoryId}`
  const [prevKey, setPrevKey] = useState(currentKey)

  if (prevKey !== currentKey) {
    setPrevKey(currentKey)
    setPage(1)
  }

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
    <section id='featured-products' className='scroll-mt-28 bg-[#FAF7F2] px-4 py-8 md:px-6'>
      <div className='mx-auto max-w-7xl'>
        <SectionHeader
          eyebrow='Kết Quả Tìm Kiếm'
          title={`Sản phẩm cho "${initialSearch}"`}
          desc='Bạn có thể kết hợp thêm danh mục phía trên để thu hẹp tìm kiếm.'
        />
        <div className='mt-8'>
          {isLoading ? (
            <ProductGridSkeleton />
          ) : products.length === 0 ? (
            <div className='rounded-2xl border border-dashed border-[#EFECE6] bg-white p-12 text-center text-sm font-medium text-[#8C7D70] shadow-xs'>
              Không tìm thấy sản phẩm nào khớp từ khóa "{initialSearch}".
            </div>
          ) : (
            <>
              <motion.div
                variants={staggerContainer}
                initial='hidden'
                animate='show'
                className='grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5 lg:grid-cols-4'
              >
                {products.map((product) => (
                  <motion.div key={product._id} variants={fadeUpItem}>
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </motion.div>
              {pagination && pagination.totalPages > 1 ? (
                <div className='mt-10'>
                  <PaginationBar
                    pagination={pagination}
                    page={page}
                    onPageChange={setPage}
                    isLoading={isLoading}
                    itemLabel='sản phẩm'
                  />
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>
    </section>
  )
}

function BrandStory() {
  const pillars = [
    {
      icon: Leaf,
      title: 'Thành phần hữu cơ tinh khiết',
      desc: 'Ưu tiên chiết xuất thực vật lành tính, không chứa Paraben hay Cồn công nghiệp.'
    },
    {
      icon: Heart,
      title: 'Cruelty-Free 100%',
      desc: 'Cam kết 100% sản phẩm không thử nghiệm trên động vật — làm đẹp văn minh.'
    },
    {
      icon: Droplets,
      title: 'Công thức thẩm thấu sâu',
      desc: 'Texture mỏng nhẹ dịu mát, nuôi dưỡng da khỏe mạnh từ sâu bên trong.'
    }
  ]

  return (
    <section className='px-4 py-12 md:px-6'>
      <div className='mx-auto max-w-7xl overflow-hidden rounded-[2.5rem] border border-[#EFECE6] bg-white shadow-soft'>
        <div className='grid gap-8 p-8 md:grid-cols-2 md:p-12 lg:p-16'>
          <div>
            <p className='text-xs font-bold uppercase tracking-[0.2em] text-[#9A8069]'>Maison Story</p>
            <h2 className='mt-3 font-display text-3xl font-extrabold tracking-tight text-[#2B2118] md:text-4xl'>
              Vibrant Mart — Khởi nguồn từ làn da khỏe thuần khiết
            </h2>
            <p className='mt-5 text-sm leading-relaxed text-[#594D42] md:text-base'>
              Chúng tôi tuyển chọn các dòng mỹ phẩm dưỡng da và trang điểm cao cấp, dung hòa giữa bí quyết thiên nhiên và khoa học làn da hiện đại. Mỗi liệu trình đều giúp bạn cảm nhận sự dễ chịu và vẻ đẹp tự nhiên nhất.
            </p>
            <Link
              to='/user/home#new-arrivals'
              className='mt-8 inline-flex items-center gap-2 rounded-full bg-[#2B2118] px-7 py-3 text-xs font-bold uppercase tracking-widest text-[#FAF7F2] hover:bg-[#9A8069] transition-colors shadow-md'
            >
              Khám phá bộ sưu tập <ArrowRight size={15} />
            </Link>
          </div>
          <div className='space-y-4'>
            {pillars.map(({ icon: Icon, title, desc }) => (
              <div key={title} className='flex gap-4 rounded-2xl border border-[#EFECE6] bg-[#FAF7F2] p-5 shadow-xs transition-all hover:bg-white hover:shadow-soft'>
                <span className='grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white text-[#9A8069] border border-[#EFECE6] shadow-xs'>
                  <Icon size={20} />
                </span>
                <div>
                  <h3 className='font-display text-base font-bold text-[#2B2118]'>{title}</h3>
                  <p className='mt-1 text-xs leading-relaxed text-[#594D42]'>{desc}</p>
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
    { icon: MapPin, title: 'Vận chuyển Toàn quốc', desc: 'Cước phí minh bạch, giao hàng nhanh chóng.' },
    { icon: ShieldCheck, title: 'Chính hãng 100%', desc: 'Kiểm soát chất lượng nghiêm ngặt.' },
    { icon: RefreshCw, title: 'Đổi trả miễn phí 7 ngày', desc: 'Chính sách hậu mãi chu đáo & tin cậy.' },
    { icon: Flower2, title: 'Hỗ trợ chu đáo', desc: 'Đội ngũ tư vấn nhiệt tình, tận tâm.' }
  ]

  return (
    <section className='px-4 pb-12 md:px-6' aria-label='Cam kết dịch vụ'>
      <div className='mx-auto max-w-7xl'>
        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
          {items.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className='flex gap-3.5 rounded-2xl border border-[#EFECE6] bg-white p-5 shadow-xs transition-all hover:shadow-soft'
            >
              <span className='grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#FAF7F2] text-[#9A8069] border border-[#EFECE6]'>
                <Icon size={19} />
              </span>
              <div>
                <h3 className='font-display text-sm font-bold text-[#2B2118]'>{title}</h3>
                <p className='mt-1 text-xs leading-relaxed text-[#8C7D70]'>{desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className='mt-8 flex flex-col items-start justify-between gap-4 rounded-3xl border border-[#EFECE6] bg-white p-6 shadow-soft md:flex-row md:items-center'>
          <div className='flex items-start gap-4'>
            <span className='grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#FAF7F2] text-[#9A8069] border border-[#EFECE6] shadow-xs'>
              <Sun size={20} />
            </span>
            <div>
              <p className='font-display text-base font-bold text-[#2B2118]'>
                {hasToken
                  ? 'Chào mừng bạn quay lại Vibrant Mart!'
                  : 'Đăng nhập để lưu Routine & Theo dõi Đơn hàng'}
              </p>
              <p className='mt-1 text-xs text-[#8C7D70]'>
                {hasToken
                  ? 'Kiểm tra trạng thái vận chuyển và quản lý thông tin tài khoản.'
                  : 'Đặc quyền tích điểm và ưu đãi hấp dẫn dành riêng cho hội viên.'}
              </p>
            </div>
          </div>
          <Link
            to={hasToken ? '/user/my-orders' : '/auth/login'}
            className='inline-flex h-11 items-center rounded-full bg-[#2B2118] px-7 text-xs font-bold uppercase tracking-widest text-[#FAF7F2] transition hover:bg-[#9A8069] shadow-md'
          >
            {hasToken ? 'Đơn hàng của tôi' : 'Đăng nhập ngay'}
          </Link>
        </div>
      </div>
    </section>
  )
}
