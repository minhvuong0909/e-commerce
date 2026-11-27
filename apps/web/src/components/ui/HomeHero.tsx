import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, ArrowUpRight, Star } from 'lucide-react'
import { useProducts } from '../../hooks/useProducts'
import { ROUTE_PATHS } from '../../routes/route.paths'
import { formatImageUrl } from '../../utils/formatImageUrl'
import money from '../../utils/money'
import { easeOut } from '../../constants/motion'

const searchHref = (q: string) => `${ROUTE_PATHS.USER_HOME}?search=${encodeURIComponent(q)}#shop`

/** Bento hero: brand statement + live best-seller + two shortcut tiles. */
export default function HomeHero() {
  const reduce = useReducedMotion()
  const { data } = useProducts(1, 1, { sort: 'best_selling' })
  const star = data?.products?.[0]
  const totalProducts = data?.pagination?.totalItems
  const starImg = star
    ? formatImageUrl(
        star.thumbnail || (typeof star.medias?.[0] === 'string' ? (star.medias[0] as string) : (star.medias?.[0] as { url?: string })?.url)
      )
    : undefined

  const rise = (delay = 0) =>
    reduce
      ? {}
      : { initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6, delay, ease: easeOut } }

  return (
    <section className='px-4 pt-4 md:px-6 md:pt-6'>
      <div className='mx-auto grid max-w-[1320px] gap-3 md:gap-4 lg:grid-cols-12 lg:grid-rows-[auto_auto]'>
        {/* statement */}
        <motion.div
          {...rise(0)}
          className='relative overflow-hidden rounded-4xl bg-ink-950 p-7 text-white sm:p-10 lg:col-span-7 lg:row-span-2 lg:p-14'
        >
          <div aria-hidden className='pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-berry-500/40 blur-3xl' />
          <div aria-hidden className='pointer-events-none absolute -bottom-32 left-10 h-72 w-72 rounded-full bg-lilac-500/30 blur-3xl' />

          <div className='relative flex h-full flex-col'>
            <span className='chip w-fit bg-white/10 text-lime-200'>
              <span className='h-1.5 w-1.5 rounded-full bg-lime-300' aria-hidden /> Skincare · Makeup · Body
            </span>

            <h1 className='mt-6 font-display text-[2.75rem] font-extrabold leading-[0.95] sm:text-6xl lg:text-[5.25rem]'>
              Glow theo
              <br />
              cách của{' '}
              <span className='relative inline-block'>
                <span className='bg-gradient-to-r from-berry-300 via-berry-200 to-lilac-200 bg-clip-text text-transparent'>bạn.</span>
                <svg aria-hidden viewBox='0 0 200 20' className='absolute -bottom-2 left-0 w-full text-lime-300' preserveAspectRatio='none'>
                  <path d='M2 14 C 50 2, 150 2, 198 12' stroke='currentColor' strokeWidth='5' fill='none' strokeLinecap='round' />
                </svg>
              </span>
            </h1>

            <p className='mt-6 max-w-md text-base leading-relaxed text-ink-300 sm:text-lg'>
              Chọn đúng sản phẩm cho từng bước routine — từ làm sạch, serum đến chống nắng. Mua nhanh, giao tận nơi.
            </p>

            <div className='mt-8 flex flex-wrap gap-3'>
              <a
                href='#shop'
                className='inline-flex h-[3.25rem] items-center gap-2 rounded-full bg-berry-500 px-7 font-semibold text-white shadow-glow transition hover:bg-berry-400'
              >
                Mua sắm ngay <ArrowRight size={18} />
              </a>
              <a
                href='#routine'
                className='inline-flex h-[3.25rem] items-center rounded-full border-[1.5px] border-white/25 px-7 font-semibold text-white transition hover:border-white hover:bg-white/5'
              >
                Xây routine 4 bước
              </a>
            </div>

            <div className='mt-auto flex flex-wrap gap-x-10 gap-y-4 pt-12 text-sm text-ink-300'>
              {totalProducts ? (
                <div>
                  <div className='font-display text-3xl font-bold text-white'>{totalProducts}+</div>
                  sản phẩm đang bán
                </div>
              ) : null}
              <div>
                <div className='font-display text-3xl font-bold text-white'>3</div>
                cách thanh toán
              </div>
              <div>
                <div className='font-display text-3xl font-bold text-white'>24/7</div>
                theo dõi đơn hàng
              </div>
            </div>
          </div>
        </motion.div>

        {/* live best-seller */}
        <motion.div {...rise(0.08)} className='relative min-h-[22rem] overflow-hidden rounded-4xl lg:col-span-5'>
          <img
            src='/images/hero_slide_routine.jpg'
            alt='Routine chăm sóc da buổi sáng'
            className='absolute inset-0 h-full w-full object-cover'
            fetchPriority='high'
          />
          <div aria-hidden className='absolute inset-0 bg-gradient-to-t from-ink-950/60 via-transparent to-transparent' />
          {star ? (
            <Link
              to={ROUTE_PATHS.USER_PRODUCT_DETAIL(star._id)}
              className='group absolute inset-x-4 bottom-4 flex items-center gap-3 rounded-3xl bg-white/95 p-3 pr-4 shadow-lift backdrop-blur transition hover:bg-white sm:inset-x-auto sm:left-4 sm:max-w-sm motion-safe:animate-float'
            >
              <span className='h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-berry-50'>
                {starImg ? <img src={starImg} alt='' className='h-full w-full object-contain p-1 mix-blend-multiply' /> : null}
              </span>
              <span className='min-w-0 flex-1'>
                <span className='flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-berry-600'>
                  <Star size={11} className='fill-current' aria-hidden /> Bán chạy nhất
                </span>
                <span className='mt-0.5 block truncate text-sm font-semibold text-ink-950'>{star.name}</span>
                <span className='text-sm font-bold text-ink-950'>{money(star.price)}</span>
              </span>
              <ArrowUpRight size={18} className='shrink-0 text-ink-500 transition group-hover:text-berry-600' aria-hidden />
            </Link>
          ) : null}
        </motion.div>

        {/* shortcut tiles */}
        <motion.a
          {...rise(0.16)}
          href={searchHref('chống nắng')}
          className='group relative flex min-h-[12rem] flex-col justify-between overflow-hidden rounded-4xl bg-peach-200 p-6 lg:col-span-3'
        >
          <img
            src='/images/spf-routine-essentials.png'
            alt=''
            aria-hidden
            className='absolute -bottom-6 -right-6 h-40 w-40 object-contain transition duration-500 group-hover:-rotate-6 group-hover:scale-110'
          />
          <span className='chip w-fit bg-white/70 text-ink-950'>Mùa nắng</span>
          <span className='relative font-display text-2xl font-bold leading-tight text-ink-950'>
            Chống nắng
            <br />
            mỗi ngày
          </span>
        </motion.a>
        <motion.a
          {...rise(0.22)}
          href={`${ROUTE_PATHS.USER_HOME}?sort=newest#shop`}
          className='group relative flex min-h-[12rem] flex-col justify-between overflow-hidden rounded-4xl bg-lime-300 p-6 lg:col-span-2'
        >
          <span className='chip w-fit bg-ink-950 text-lime-200'>New</span>
          <span className='font-display text-2xl font-bold leading-tight text-ink-950'>Hàng mới về</span>
          <span className='absolute right-5 top-5 grid h-10 w-10 place-items-center rounded-full bg-ink-950 text-white transition group-hover:rotate-45'>
            <ArrowUpRight size={18} aria-hidden />
          </span>
        </motion.a>
      </div>
    </section>
  )
}
