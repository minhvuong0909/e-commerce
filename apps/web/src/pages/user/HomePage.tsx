import { useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  ArrowRight,
  Droplet,
  PackageSearch,
  SearchX,
  SlidersHorizontal,
  Sparkles,
  Sun,
  Waves,
  X
} from 'lucide-react'
import ProductCard, { CARD_TINTS } from '../../components/ui/ProductCard'
import ProductCardSkeleton from '../../components/ui/ProductCardSkeleton'
import HomeHero from '../../components/ui/HomeHero'
import SectionHeader from '../../components/ui/SectionHeader'
import PaginationBar from '../../components/ui/PaginationBar'
import EmptyState from '../../components/ui/EmptyState'
import Button from '../../components/ui/Button'
import Reveal from '../../components/ui/Reveal'
import { fadeUpItem, staggerContainer } from '../../constants/motion'
import { useProducts } from '../../hooks/useProducts'
import { useStorefrontCategories } from '../../hooks/useStorefrontCategories'
import type { ProductFilters } from '../../services/products.services'
import { getToken } from '../../utils/authSession'
import { ROUTE_PATHS } from '../../routes/route.paths'
import cn from '../../utils/cn'

const GRID_LIMIT = 12
type Sort = NonNullable<ProductFilters['sort']>

const SORTS: Array<{ value: Sort; label: string }> = [
  { value: 'newest', label: 'Mới nhất' },
  { value: 'best_selling', label: 'Bán chạy' },
  { value: 'price_asc', label: 'Giá thấp → cao' },
  { value: 'price_desc', label: 'Giá cao → thấp' }
]

const searchHref = (q: string) => `${ROUTE_PATHS.USER_HOME}?search=${encodeURIComponent(q)}#shop`

export default function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const search = searchParams.get('search') ?? ''
  const categoryId = searchParams.get('category') ?? ''
  const sortParam = searchParams.get('sort') as Sort | null
  const sort: Sort = SORTS.some((s) => s.value === sortParam) ? (sortParam as Sort) : 'newest'

  const updateParams = (patch: Record<string, string | null>) => {
    const next = new URLSearchParams(searchParams)
    Object.entries(patch).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)))
    setSearchParams(next, { replace: true, preventScrollReset: true })
  }

  return (
    <div>
      <HomeHero />
      
      <Reveal><BestSellerRail /></Reveal>
      <Reveal><RoutineSection /></Reveal>
      <ShopSection
        search={search}
        categoryId={categoryId}
        sort={sort}
        onCategory={(id) => updateParams({ category: id || null })}
        onSort={(s) => updateParams({ sort: s === 'newest' ? null : s })}
        onClearSearch={() => updateParams({ search: null })}
      />
      <Reveal><JoinBand /></Reveal>
    </div>
  )
}

/* ───────── Horizontal best-seller rail ───────── */
function BestSellerRail() {
  const { data, isLoading } = useProducts(1, 10, { sort: 'best_selling' })
  const products = data?.products ?? []
  const railRef = useRef<HTMLDivElement>(null)

  const scroll = (dir: 1 | -1) => {
    const el = railRef.current
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: 'smooth' })
  }

  if (!isLoading && products.length === 0) return null

  return (
    <section className='pt-14 md:pt-20' aria-label='Sản phẩm bán chạy'>
      <div className='mx-auto max-w-[1320px] px-4 md:px-6'>
        <SectionHeader
          eyebrow='Bán chạy'
          title='Được chọn nhiều nhất'
          desc='Những sản phẩm khách hàng Vibrant Mart mua nhiều nhất thời gian gần đây.'
          action={
            <div className='hidden gap-2 md:flex'>
              <button
                type='button'
                onClick={() => scroll(-1)}
                aria-label='Cuộn trái'
                className='grid h-12 w-12 cursor-pointer place-items-center rounded-full border border-ink-200 bg-white transition hover:border-berry-300'
              >
                <ArrowLeft size={18} />
              </button>
              <button
                type='button'
                onClick={() => scroll(1)}
                aria-label='Cuộn phải'
                className='grid h-12 w-12 cursor-pointer place-items-center rounded-full bg-berry-600 text-white transition hover:bg-berry-700'
              >
                <ArrowRight size={18} />
              </button>
            </div>
          }
        />
      </div>
      <div
        ref={railRef}
        className='no-scrollbar mt-8 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 pb-2 md:scroll-px-6 md:px-6 xl:px-[max(1.5rem,calc((100vw-1320px)/2+1.5rem))]'
      >
        {(isLoading ? Array.from({ length: 5 }) : products).map((p, i) => (
          <div key={p ? (p as { _id: string })._id : i} className='w-[70%] shrink-0 snap-start sm:w-[42%] md:w-[30%] lg:w-[23%]'>
            {p ? <ProductCard product={p as (typeof products)[number]} tint={CARD_TINTS[i % CARD_TINTS.length]} /> : <ProductCardSkeleton />}
          </div>
        ))}
      </div>
    </section>
  )
}

/* ───────── Routine education ───────── */
function RoutineSection() {
  const steps = [
    { n: '01', title: 'Làm sạch', desc: 'Tẩy trang & sữa rửa mặt, gỡ bụi bẩn và dầu thừa.', q: 'sữa rửa mặt', icon: Waves, bg: 'bg-ink-100' },
    { n: '02', title: 'Serum', desc: 'Hoạt chất tập trung cho mối quan tâm riêng của da.', q: 'serum', icon: Droplet, bg: 'bg-ink-100' },
    { n: '03', title: 'Dưỡng ẩm', desc: 'Khóa ẩm, giữ hàng rào da khỏe và mềm mịn.', q: 'kem dưỡng', icon: Sparkles, bg: 'bg-ink-100' },
    { n: '04', title: 'Chống nắng', desc: 'Bước cuối cùng của buổi sáng, không nên bỏ qua.', q: 'chống nắng', icon: Sun, bg: 'bg-ink-100' }
  ]

  return (
    <section id='routine' className='scroll-mt-32 px-4 pt-14 md:px-6 md:pt-20'>
      <div className='mx-auto max-w-[1320px] overflow-hidden rounded-4xl bg-white p-6 ring-1 ring-ink-200 sm:p-10 lg:p-12'>
        <div className='grid gap-10 lg:grid-cols-[0.9fr_1.6fr] lg:gap-14'>
          <div>
            <p className='eyebrow'>
              Routine cơ bản
            </p>
            <h2 className='mt-3 font-display text-3xl font-semibold leading-tight md:text-4xl'>
              4 bước cho làn da khỏe và sáng
            </h2>
            <p className='mt-4 text-[15px] leading-relaxed text-ink-600'>
              Không cần 10 bước. Bắt đầu từ nền tảng đúng, rồi thêm sản phẩm theo nhu cầu. Chọn một bước để xem sản phẩm phù hợp.
            </p>
            <img
              src='/images/login_skincare_lifestyle.jpg'
              alt='Sản phẩm skincare trên bàn trang điểm'
              loading='lazy'
              className='mt-8 hidden aspect-[4/3] w-full rounded-2xl object-cover lg:block'
            />
          </div>
          <ol className='grid gap-3 sm:grid-cols-2'>
            {steps.map(({ n, title, desc, q, icon: Icon, bg }) => (
              <li key={n}>
                <a
                  href={searchHref(q)}
                  className={cn('group flex h-full min-h-[13rem] flex-col rounded-2xl p-6 transition hover:bg-ink-200', bg)}
                >
                  <div className='flex items-start justify-between'>
                    <span className='font-display text-3xl font-semibold text-ink-400'>{n}</span>
                    <span className='grid h-11 w-11 place-items-center rounded-xl bg-white text-ink-950'>
                      <Icon size={22} aria-hidden />
                    </span>
                  </div>
                  <h3 className='mt-auto font-display text-xl font-semibold text-ink-950'>{title}</h3>
                  <p className='mt-1.5 text-sm leading-relaxed text-ink-700'>{desc}</p>
                  <span className='mt-4 inline-flex items-center gap-1 text-sm font-semibold text-ink-950'>
                    Xem sản phẩm <ArrowRight size={15} className='transition group-hover:translate-x-1' aria-hidden />
                  </span>
                </a>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}

/* ───────── Shop grid: search + category + sort, all in the URL ───────── */
function ShopSection({
  search,
  categoryId,
  sort,
  onCategory,
  onSort,
  onClearSearch
}: {
  search: string
  categoryId: string
  sort: Sort
  onCategory: (id: string) => void
  onSort: (s: Sort) => void
  onClearSearch: () => void
}) {
  const key = `${search}|${categoryId}|${sort}`
  const [page, setPage] = useState(1)
  const [prevKey, setPrevKey] = useState(key)
  if (prevKey !== key) {
    setPrevKey(key)
    setPage(1)
  }

  const { data: categories = [] } = useStorefrontCategories(12)
  const filters = useMemo<ProductFilters>(
    () => ({ sort, search: search || undefined, category_id: categoryId || undefined }),
    [sort, search, categoryId]
  )
  const { data, isLoading, isError, refetch, isFetching } = useProducts(page, GRID_LIMIT, filters)
  const products = data?.products ?? []
  const pagination = data?.pagination
  const activeCategory = categories.find((c) => c.id === categoryId)

  const goPage = (p: number) => {
    setPage(p)
    document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const chip = (active: boolean) =>
    cn(
      'chip h-10 cursor-pointer border px-4 transition',
      active ? 'border-berry-200 bg-berry-50 text-berry-700' : 'border-ink-200 bg-white text-ink-700 hover:border-berry-300'
    )

  return (
    <section id='shop' className='scroll-mt-32 px-4 pt-14 md:px-6 md:pt-20'>
      <div className='mx-auto max-w-[1320px]'>
        <SectionHeader
          eyebrow={search ? 'Kết quả tìm kiếm' : 'Cửa hàng'}
          title={search ? `“${search}”` : activeCategory ? activeCategory.name : 'Tất cả sản phẩm'}
          desc={
            pagination
              ? `${pagination.totalItems} sản phẩm${activeCategory && search ? ` trong ${activeCategory.name}` : ''}`
              : undefined
          }
        />

        {/* filter bar */}
        <div className='sticky top-[4.5rem] z-30 -mx-4 mt-6 bg-canvas/90 px-4 py-3 backdrop-blur md:static md:mx-0 md:bg-transparent md:px-0 md:backdrop-blur-none lg:top-[7.25rem]'>
          <div className='flex flex-col gap-3 md:flex-row md:items-center'>
            <div className='no-scrollbar flex min-w-0 flex-1 gap-2 overflow-x-auto'>
              {search ? (
                <button type='button' onClick={onClearSearch} className='chip h-10 shrink-0 cursor-pointer bg-berry-100 px-4 text-berry-700 hover:bg-berry-200'>
                  Từ khóa: {search} <X size={14} aria-hidden />
                  <span className='sr-only'>Xóa từ khóa</span>
                </button>
              ) : null}
              <button type='button' aria-pressed={!categoryId} onClick={() => onCategory('')} className={chip(!categoryId)}>
                Tất cả
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  type='button'
                  aria-pressed={categoryId === c.id}
                  onClick={() => onCategory(categoryId === c.id ? '' : c.id)}
                  className={chip(categoryId === c.id)}
                >
                  {c.name}
                </button>
              ))}
            </div>
            <label className='relative inline-flex shrink-0 items-center'>
              <SlidersHorizontal size={16} className='pointer-events-none absolute left-4 text-ink-500' aria-hidden />
              <span className='sr-only'>Sắp xếp</span>
              <select
                value={sort}
                onChange={(e) => onSort(e.target.value as Sort)}
                className='h-10 cursor-pointer appearance-none rounded-full border border-ink-200 bg-white pl-10 pr-9 text-sm font-semibold text-ink-950 outline-none transition hover:border-berry-300 focus:border-berry-500'
              >
                {SORTS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
              <span aria-hidden className='pointer-events-none absolute right-4 text-xs text-ink-500'>
                ▾
              </span>
            </label>
          </div>
        </div>

        <div className={cn('mt-6 transition-opacity', isFetching && !isLoading && 'opacity-60')} aria-busy={isFetching}>
          {isLoading ? (
            <div className='grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-3 md:gap-x-5 lg:grid-cols-4'>
              {Array.from({ length: 8 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : isError ? (
            <EmptyState
              icon={<PackageSearch size={28} />}
              title='Không tải được sản phẩm'
              desc='Kết nối tới máy chủ đang gặp sự cố. Thử lại sau giây lát nhé.'
              action={
                <Button variant='primary' onClick={() => void refetch()}>
                  Thử lại
                </Button>
              }
            />
          ) : products.length === 0 ? (
            <EmptyState
              icon={<SearchX size={28} />}
              title='Chưa có sản phẩm phù hợp'
              desc={search ? `Không tìm thấy sản phẩm cho “${search}”. Thử từ khóa khác hoặc bỏ bớt bộ lọc.` : 'Danh mục này đang được cập nhật.'}
              action={
                <Button
                  variant='secondary'
                  onClick={() => {
                    onClearSearch()
                    onCategory('')
                  }}
                >
                  Xóa bộ lọc
                </Button>
              }
            />
          ) : (
            <>
              <motion.div
                key={`${key}-${page}`}
                variants={staggerContainer}
                initial='hidden'
                animate='show'
                className='grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-3 md:gap-x-5 md:gap-y-10 lg:grid-cols-4'
              >
                {products.map((product, i) => (
                  <motion.div key={product._id} variants={fadeUpItem}>
                    <ProductCard product={product} tint={CARD_TINTS[i % CARD_TINTS.length]} />
                  </motion.div>
                ))}
              </motion.div>
              {pagination ? (
                <PaginationBar pagination={pagination} page={page} onPageChange={goPage} isLoading={isFetching} itemLabel='sản phẩm' />
              ) : null}
            </>
          )}
        </div>
      </div>
    </section>
  )
}

function JoinBand() {
  const hasToken = Boolean(getToken())
  if (hasToken) return null
  return (
    <section className='px-4 pt-14 md:px-6 md:pt-20'>
      <div className='relative mx-auto max-w-[1320px] overflow-hidden rounded-4xl border border-berry-100 bg-berry-50 px-6 py-12 text-ink-950 sm:px-12 md:py-16'>
        <div className='relative flex flex-col gap-8 md:flex-row md:items-center md:justify-between'>
          <div className='max-w-xl'>
            <h2 className='font-display text-3xl font-semibold leading-tight md:text-4xl'>
              Tạo tài khoản, mua nhanh hơn lần sau.
            </h2>
            <p className='mt-4 text-ink-600'>
              Lưu địa chỉ, thanh toán online và theo dõi mọi đơn hàng trong một tài khoản.
            </p>
          </div>
          <Link
            to={ROUTE_PATHS.AUTH_REGISTER}
            className='inline-flex h-12 shrink-0 items-center gap-2 self-start rounded-lg bg-berry-600 px-7 font-semibold text-white transition hover:bg-berry-700 md:self-auto'
          >
            Đăng ký miễn phí <ArrowRight size={18} aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  )
}
