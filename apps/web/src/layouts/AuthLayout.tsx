import { Link, Outlet } from 'react-router-dom'
import { ArrowLeft, Sparkles, ShieldCheck, Heart } from 'lucide-react'
import { ROUTE_PATHS } from '../routes/route.paths'

export default function AuthLayout() {
  return (
    <div className='min-h-screen bg-[#FAF7F2] text-[#2B2118] font-sans selection:bg-[#f5d5cf] selection:text-[#3d3330]'>
      <div className='mx-auto grid min-h-screen max-w-[1440px] md:grid-cols-2'>
        {/* Left Side: Editorial Lifestyle Banner */}
        <section className='relative hidden min-h-screen overflow-hidden bg-[#EFE9E0] md:block'>
          <img
            src='/images/login_skincare_lifestyle.jpg'
            alt='Làn da rạng rỡ tự nhiên'
            className='absolute inset-0 h-full w-full object-cover object-center transition duration-700 hover:scale-105'
          />
          {/* Subtle Warm Overlay */}
          <div className='absolute inset-0 bg-gradient-to-t from-[#2B2118]/90 via-[#2B2118]/30 to-black/10' />

          <div className='relative z-10 flex min-h-screen flex-col justify-between p-10 lg:p-16'>
            {/* Top Brand Logo */}
            <Link
              to={ROUTE_PATHS.USER_HOME}
              className='flex w-fit items-center gap-2 rounded-full bg-white/90 px-5 py-2.5 shadow-lg backdrop-blur-md transition hover:bg-white'
            >
              <span className='grid h-8 w-8 place-items-center rounded-full bg-[#3d3330] text-white'>
                <Sparkles size={16} />
              </span>
              <span className='font-serif text-xl font-bold tracking-tight text-[#3d3330]'>Vibrant Mart</span>
            </Link>

            {/* Bottom Hero Quote */}
            <div className='max-w-lg text-white'>
              <div className='inline-flex items-center gap-2 rounded-full bg-white/20 px-3.5 py-1.5 text-xs font-bold uppercase tracking-widest text-white backdrop-blur-md'>
                <Heart size={14} className='fill-rose-300 text-rose-300' />
                <span>Skincare Community</span>
              </div>

              <h1 className='mt-4 text-3xl font-semibold leading-snug text-white sm:text-4xl lg:text-5xl'>
                Làn da khỏe đẹp<br />
                <span className='font-normal text-[#f0b3a4]'>bắt đầu từ thói quen mỗi ngày.</span>
              </h1>

              <p className='mt-4 text-sm leading-relaxed text-white/85 lg:text-base'>
                Đăng nhập để theo dõi routine cá nhân, tích điểm đổi quà và nhận những ưu đãi dành riêng cho bạn.
              </p>

              <div className='mt-8 flex items-center gap-6 border-t border-white/20 pt-6 text-xs text-white/80'>
                <div className='flex items-center gap-2'>
                  <ShieldCheck size={16} className='text-[#f0b3a4]' />
                  <span>100% Mỹ phẩm chính hãng</span>
                </div>
                <div>•</div>
                <div>Hơn 50,000+ Khách hàng tin dùng</div>
              </div>
            </div>
          </div>
        </section>

        {/* Right Side: Clean Auth Form */}
        <section className='flex min-h-screen flex-col justify-between px-5 py-8 sm:px-10 lg:px-16 bg-[#FAF7F2]'>
          <div className='flex items-center justify-between'>
            <Link
              to={ROUTE_PATHS.USER_HOME}
              className='inline-flex items-center gap-2 rounded-full border border-[#eaded8] bg-white px-4 py-2 text-xs font-bold text-[#786452] shadow-sm transition hover:border-[#c65f4a] hover:text-[#c65f4a]'
            >
              <ArrowLeft size={15} />
              <span>Về cửa hàng</span>
            </Link>

            <span className='text-xs font-semibold text-[#8a7a74] hidden sm:block'>
              Cần trợ giúp? <a href='tel:19001234' className='font-bold text-[#c65f4a] hover:underline'>1900 1234</a>
            </span>
          </div>

          <div className='my-auto py-8'>
            <div className='mb-6 text-center md:hidden'>
              <span className='inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#3d3330] text-white shadow-md mb-2'>
                <Sparkles size={22} />
              </span>
              <h2 className='font-serif text-2xl font-bold text-[#3d3330]'>Vibrant Mart</h2>
              <p className='text-xs text-[#b07a72] font-semibold uppercase tracking-widest mt-1'>Beauty &amp; Skincare</p>
            </div>

            <div className='mx-auto w-full max-w-md overflow-hidden rounded-3xl border border-[#EFECE6] bg-white p-6 shadow-xl shadow-[#3d3330]/5 sm:p-8 lg:p-10'>
              <Outlet />
            </div>
          </div>

          <footer className='text-center text-xs text-[#8a7a74]'>
            © {new Date().getFullYear()} Vibrant Mart · Beauty &amp; Skincare. All rights reserved.
          </footer>
        </section>
      </div>
    </div>
  )
}
