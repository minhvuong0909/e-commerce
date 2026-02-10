import { Outlet } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function AuthLayout() {
  return (
    <div className='relative min-h-screen overflow-hidden bg-[#0b0b10] text-white'>
      {/* Gradient blobs */}
      <div className='pointer-events-none absolute inset-0'>
        <div className='absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-orange-500/30 via-pink-500/25 to-purple-500/30 blur-3xl' />
        <div className='absolute -bottom-40 left-0 h-[520px] w-[520px] rounded-full bg-gradient-to-tr from-emerald-500/25 via-sky-500/20 to-indigo-500/25 blur-3xl' />
      </div>

      <div className='relative mx-auto flex min-h-screen max-w-7xl items-center px-4 py-10'>
        <div className='grid w-full gap-10 md:grid-cols-2 items-center'>
          {/* LEFT – Marketing + Illustration */}
          <div className='hidden md:block'>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <div className='inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold backdrop-blur'>
                <span className='h-2 w-2 rounded-full bg-orange-500' />
                Mua sắm an tâm – Đăng nhập bảo mật
              </div>

              <h1 className='mt-6 text-4xl font-extrabold leading-tight'>
                Mua sắm nhanh, dễ dàng <br />
                <span className='bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent'>
                  Nhanh · Tiện · An toàn
                </span>
              </h1>

              <p className='mt-4 max-w-md text-sm text-white/70'>
                Đăng nhập hoặc tạo tài khoản để theo dõi đơn hàng, lưu sản phẩm yêu thích và nhận ưu đãi độc quyền mỗi
                ngày.
              </p>

              {/* Illustration */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.5 }}
                className='mt-10 max-w-md'
              >
                <AuthIllustration />
              </motion.div>
            </motion.div>
          </div>

          {/* RIGHT – Auth Card */}
          <div className='mx-auto w-full max-w-md'>
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className='relative'
            >
              <div className='pointer-events-none absolute -inset-2 rounded-[28px] bg-gradient-to-r from-orange-500/20 via-pink-500/15 to-purple-500/20 blur-xl' />

              <div className='relative rounded-[28px] border border-white/10 bg-black/45 p-6 shadow-2xl backdrop-blur-xl'>
                <Outlet />
              </div>
            </motion.div>

            <p className='mt-4 text-center text-xs text-white/45'>
              © {new Date().getFullYear()} Vibrant Mart. Nền tảng mua sắm trực tuyến.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// cho chuẩn AuthLayout
function AuthIllustration() {
  return (
    <svg viewBox='0 0 420 260' className='w-full'>
      <defs>
        <linearGradient id='grad1' x1='0%' y1='0%' x2='100%' y2='100%'>
          <stop offset='0%' stopColor='#fb923c' />
          <stop offset='100%' stopColor='#ec4899' />
        </linearGradient>
      </defs>

      {/* Card */}
      <rect x='40' y='40' rx='20' ry='20' width='220' height='140' fill='url(#grad1)' opacity='0.9' />
      <rect x='70' y='70' rx='10' ry='10' width='160' height='18' fill='white' opacity='0.9' />
      <rect x='70' y='100' rx='10' ry='10' width='120' height='14' fill='white' opacity='0.7' />
      <rect x='70' y='125' rx='10' ry='10' width='90' height='14' fill='white' opacity='0.6' />

      {/* Floating bubbles */}
      <circle cx='320' cy='80' r='26' fill='#22c55e' opacity='0.6' />
      <circle cx='350' cy='140' r='18' fill='#38bdf8' opacity='0.6' />
      <circle cx='300' cy='180' r='14' fill='#a855f7' opacity='0.6' />
    </svg>
  )
}
