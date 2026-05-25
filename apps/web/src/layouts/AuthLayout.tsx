import { motion } from 'framer-motion'
import { BadgeCheck, LockKeyhole, PackageCheck, ShoppingBag } from 'lucide-react'
import { Link, Outlet } from 'react-router-dom'
import { panelMotion } from '../constants/motion'
import heroImage from '../assets/images/background_home.png'

export default function AuthLayout() {
  return (
    <div className='min-h-screen bg-[var(--page-bg)] text-ink-950'>
      <div className='mx-auto grid min-h-screen max-w-7xl gap-6 px-4 py-6 md:grid-cols-[1.05fr_0.95fr] md:px-6'>
        <section className='relative hidden overflow-hidden rounded-3xl bg-ink-950 md:block'>
          <img src={heroImage} alt='' className='absolute inset-0 h-full w-full object-cover opacity-45' />
          <div className='absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.15)_0%,rgba(2,6,23,0.72)_72%,rgba(2,6,23,0.92)_100%)]' />

          <div className='relative flex h-full flex-col justify-between p-8 text-white lg:p-10'>
            <Link to='/user/home' className='flex w-fit items-center gap-3'>
              <span className='grid h-11 w-11 place-items-center rounded-2xl bg-white text-ink-950'>
                <ShoppingBag size={20} />
              </span>
              <span>
                <span className='block text-base font-black'>Vibrant Mart</span>
                <span className='block text-xs font-bold text-white/65'>Premium shopping</span>
              </span>
            </Link>

            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
              <div className='inline-flex items-center gap-2 rounded-full border border-white/[0.15] bg-white/[0.12] px-4 py-2 text-sm font-bold backdrop-blur'>
                <BadgeCheck size={16} className='text-mint-100' />
                Hàng chính hãng, quy trình mua sắm bảo mật
              </div>
              <h1 className='mt-5 max-w-xl text-4xl font-black leading-tight tracking-tight lg:text-5xl'>
                Trải nghiệm mua sắm tối giản, nhanh và đáng tin cậy.
              </h1>
              <div className='mt-8 grid gap-3 lg:grid-cols-2'>
                {[
                  { icon: LockKeyhole, title: 'Bảo mật', desc: 'Token và phiên đăng nhập được quản lý rõ ràng.' },
                  { icon: PackageCheck, title: 'Theo dõi đơn', desc: 'Cập nhật đơn hàng sau khi thanh toán.' }
                ].map(({ icon: Icon, title, desc }) => (
                  <div key={title} className='rounded-2xl border border-white/[0.15] bg-white/[0.12] p-4 backdrop-blur'>
                    <Icon size={19} />
                    <div className='mt-3 text-sm font-black'>{title}</div>
                    <div className='mt-1 text-xs leading-5 text-white/65'>{desc}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        <section className='flex min-h-[calc(100vh-48px)] items-center justify-center'>
          <motion.div
            {...panelMotion}
            className='surface-strong w-full max-w-md rounded-3xl p-6 backdrop-blur md:p-8'
          >
            <div className='mb-6 flex items-center gap-3 md:hidden'>
              <span className='grid h-10 w-10 place-items-center rounded-2xl bg-ink-950 text-white'>
                <ShoppingBag size={18} />
              </span>
              <span>
                <span className='block text-sm font-black'>Vibrant Mart</span>
                <span className='block text-xs font-bold text-slate-500'>Premium shopping</span>
              </span>
            </div>
            <Outlet />
          </motion.div>
        </section>
      </div>
    </div>
  )
}
