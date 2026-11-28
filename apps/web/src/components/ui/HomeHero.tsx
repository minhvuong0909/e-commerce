import { Link } from 'react-router-dom'
import { m, useReducedMotion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { useProducts } from '../../hooks/useProducts'
import { ROUTE_PATHS } from '../../routes/route.paths'
import { formatImageUrl } from '../../utils/formatImageUrl'
import money from '../../utils/money'
import { easeOut } from '../../constants/motion'

/** Home hero: short headline + CTA on the left, lifestyle photo with the current best-seller on the right. */
export default function HomeHero() {
  const reduce = useReducedMotion()
  const { data } = useProducts(1, 1, { sort: 'best_selling' })
  const rise = (delay: number) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 20 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.6, delay, ease: easeOut }
        }
  const star = data?.products?.[0]
  const starImg = star
    ? formatImageUrl(
        star.thumbnail ||
          (typeof star.medias?.[0] === 'string'
            ? (star.medias[0] as string)
            : (star.medias?.[0] as { url?: string })?.url)
      )
    : undefined

  return (
    <section className='px-4 pt-4 md:px-6 md:pt-6'>
      <div className='mx-auto grid max-w-[1320px] overflow-hidden rounded-4xl bg-ink-100 lg:grid-cols-2'>
        <div className='flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-16 lg:py-20'>
          <m.p {...rise(0)} className='eyebrow'>
            Skincare · Makeup · Body
          </m.p>
          <m.h1
            {...rise(0.08)}
            className='mt-4 font-display text-4xl font-semibold leading-[1.1] text-ink-950 sm:text-5xl lg:text-[3.5rem]'
          >
            Chăm da đúng cách,
            <br />
            từng bước một.
          </m.h1>
          <m.p {...rise(0.16)} className='mt-5 max-w-md text-base leading-relaxed text-ink-600'>
            Chọn sản phẩm theo từng bước routine, từ làm sạch, serum đến chống nắng. Giao hàng tận nơi, theo dõi đơn dễ
            dàng.
          </m.p>
          <m.div {...rise(0.24)} className='mt-8 flex flex-wrap gap-3'>
            <a
              href='#shop'
              className='inline-flex h-12 items-center gap-2 rounded-lg bg-berry-600 px-6 text-sm font-semibold text-white transition hover:bg-berry-700'
            >
              Mua sắm ngay <ArrowRight size={16} aria-hidden />
            </a>
            <a
              href='#routine'
              className='inline-flex h-12 items-center rounded-lg border border-ink-300 bg-white px-6 text-sm font-semibold text-ink-950 transition hover:border-berry-300'
            >
              Routine 4 bước
            </a>
          </m.div>
        </div>

        <div className='relative min-h-[20rem] overflow-hidden lg:min-h-[32rem]'>
          <m.img
            src='/images/hero_slide_routine.jpg'
            alt='Routine chăm sóc da buổi sáng'
            className='absolute inset-0 h-full w-full object-cover'
            fetchPriority='high'
            initial={reduce ? undefined : { scale: 1.12 }}
            animate={reduce ? undefined : { scale: 1 }}
            transition={{ duration: 1.6, ease: easeOut }}
          />
          {star ? (
            <m.div
              className='absolute inset-x-4 bottom-4 sm:inset-x-auto sm:left-5 sm:bottom-5 sm:w-80'
              {...(reduce
                ? {}
                : {
                    initial: { opacity: 0, y: 24 },
                    animate: { opacity: 1, y: 0 },
                    transition: { duration: 0.6, delay: 0.7, ease: easeOut }
                  })}
            >
              <Link
                to={ROUTE_PATHS.USER_PRODUCT_DETAIL(star._id)}
                className='flex items-center gap-3 rounded-xl bg-white p-3 shadow-soft transition hover:bg-ink-50'
              >
                <span className='h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-ink-100'>
                  {starImg ? (
                    <img src={starImg} alt='' className='h-full w-full object-contain p-1 mix-blend-multiply' />
                  ) : null}
                </span>
                <span className='min-w-0 flex-1'>
                  <span className='block text-[11px] font-semibold uppercase tracking-wider text-berry-600'>
                    Bán chạy nhất
                  </span>
                  <span className='mt-0.5 block truncate text-sm font-medium text-ink-950'>{star.name}</span>
                  <span className='text-sm font-semibold text-ink-950'>{money(star.price)}</span>
                </span>
              </Link>
            </m.div>
          ) : null}
        </div>
      </div>
    </section>
  )
}
