import { Link, Outlet } from 'react-router-dom'
import { ArrowLeft, Sparkles } from 'lucide-react'
import { ROUTE_PATHS } from '../routes/route.paths'
import BrandMark from '../components/ui/BrandMark'

const COLLAGE = [
  { src: '/images/serum-routine-essentials.png', cls: 'bg-berry-200 rotate-[-4deg]' },
  { src: '/images/spf-routine-essentials.png', cls: 'bg-peach-200 rotate-[3deg] translate-y-8' },
  { src: '/images/lip-routine-essentials.png', cls: 'bg-lime-300 rotate-[2deg]' },
  { src: '/images/cleanser-routine-essentials.jpg', cls: 'bg-lilac-200 rotate-[-3deg] translate-y-8' }
]

export default function AuthLayout() {
  return (
    <div className='min-h-screen bg-canvas text-ink-950'>
      <div className='mx-auto grid min-h-screen max-w-[1440px] lg:grid-cols-[1.05fr_1fr]'>
        {/* brand side */}
        <section className='relative m-3 hidden overflow-hidden rounded-4xl border border-berry-100 bg-berry-50 text-ink-950 lg:flex lg:flex-col'>

          <div className='relative flex flex-1 flex-col p-12 xl:p-16'>
            <Link to={ROUTE_PATHS.USER_HOME} aria-label='Vibrant Mart'>
              <BrandMark />
            </Link>

            <div className='mt-12 grid max-w-[22rem] grid-cols-2 gap-4 [@media(max-height:860px)]:max-w-[16rem]' aria-hidden>
              {COLLAGE.map((c) => (
                <div key={c.src} className={`aspect-square overflow-hidden rounded-[2rem] ${c.cls}`}>
                  <img src={c.src} alt='' className='h-full w-full object-cover mix-blend-multiply' />
                </div>
              ))}
            </div>

            <div className='mt-auto pt-16'>
              <span className='chip border border-berry-200 bg-white text-berry-700'>
                <Sparkles size={13} aria-hidden /> Vibrant Mart
              </span>
              <h1 className='mt-5 font-display text-5xl font-extrabold leading-[0.98] xl:text-6xl'>
                Routine đẹp
                <br />
                bắt đầu từ <span className='text-berry-600'>đây.</span>
              </h1>
              <p className='mt-5 max-w-md text-ink-600'>
                Một tài khoản để lưu địa chỉ, thanh toán online và theo dõi mọi đơn hàng của bạn.
              </p>
            </div>
          </div>
        </section>

        {/* form side */}
        <section className='flex min-h-screen flex-col px-5 py-6 sm:px-10 lg:px-16'>
          <div className='flex items-center justify-between'>
            <Link to={ROUTE_PATHS.USER_HOME} className='lg:hidden' aria-label='Vibrant Mart'>
              <BrandMark />
            </Link>
            <Link
              to={ROUTE_PATHS.USER_HOME}
              className='ml-auto inline-flex h-10 items-center gap-2 rounded-lg px-4 text-sm font-medium text-ink-600 transition hover:bg-ink-100 hover:text-ink-950'
            >
              <ArrowLeft size={16} /> Về cửa hàng
            </Link>
          </div>

          <div className='my-auto w-full py-10'>
            <div className='mx-auto w-full max-w-[420px]'>
              <Outlet />
            </div>
          </div>

          <footer className='text-center text-xs text-ink-400'>© {new Date().getFullYear()} Vibrant Mart</footer>
        </section>
      </div>
    </div>
  )
}
