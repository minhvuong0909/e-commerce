import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, BadgeCheck, PackageCheck, ShieldCheck, ShoppingCart, Sparkles, Truck } from 'lucide-react'
import ProductCard from '../../components/ui/ProductCard'
import SectionHeader from '../../components/ui/SectionHeader'
import { fadeUpItem, hoverLift, panelMotion, staggerContainer } from '../../constants/motion'
import { useProducts } from '../../hooks/useProducts'
import heroImage from '../../assets/images/background_home.png'

const LIMIT = 0
const PAGE = 0

export default function HomePage() {
  const { data: products = [], isLoading: loading } = useProducts(PAGE, LIMIT)

  const featuredProducts = useMemo(() => products.slice(0, 8), [products])
  const heroProducts = useMemo(() => products.slice(0, 3), [products])

  return (
    <div className='pb-12'>
      <section className='mx-auto max-w-7xl px-4 pt-6 md:px-6'>
        <div className='relative overflow-hidden rounded-3xl bg-brand-50 text-ink-900 shadow-lift border border-brand-100'>
          <img src={heroImage} alt='' className='absolute inset-0 h-full w-full object-cover opacity-20 mix-blend-multiply' />
          <div className='absolute inset-0 bg-[linear-gradient(90deg,rgba(253,250,246,0.96),rgba(253,250,246,0.82),rgba(226,240,229,0.4))]' />

          <div className='relative grid min-h-[560px] gap-8 px-5 py-12 md:px-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center'>
            <motion.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
              <div className='inline-flex items-center gap-2 rounded-full border border-mint-500/30 bg-mint-50/60 px-4 py-2 text-sm font-bold text-mint-600 backdrop-blur-md shadow-sm'>
                <BadgeCheck size={16} className='text-mint-500' />
                Chiết xuất thiên nhiên, an toàn tuyệt đối
              </div>

              <h1 className='mt-6 max-w-3xl text-4xl font-bold leading-tight tracking-tight text-ink-900 md:text-6xl'>
                Vẻ đẹp tinh khiết từ tự nhiên.
              </h1>

              <p className='mt-5 max-w-2xl text-base leading-7 text-ink-500 md:text-lg'>
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
                  Liệu trình của bạn
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.12, duration: 0.45 }}
              className='hidden lg:block'
            >
              <div className='ml-auto max-w-md rounded-3xl border border-white/60 bg-white/40 p-4 shadow-lift backdrop-blur-xl'>
                <div className='surface-strong rounded-3xl p-5 text-ink-900'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <p className='text-xs font-bold uppercase tracking-[0.18em] text-brand-600'>Cửa hàng</p>
                      <p className='mt-1 text-3xl font-bold'>{products.length || 120}+</p>
                    </div>
                    <div className='grid h-12 w-12 place-items-center rounded-2xl bg-brand-50 text-brand-700'>
                      <ShoppingCart size={24} />
                    </div>
                  </div>

                  <div className='mt-5 space-y-3'>
                    {(heroProducts.length ? heroProducts : []).map((product) => (
                      <Link
                        key={product._id}
                        to={`/user/products/${product._id}`}
                        className='flex items-center gap-3 rounded-2xl border border-ink-100 bg-white/60 p-3 transition hover:bg-white hover:shadow-card'
                      >
                        <div className='h-12 w-12 overflow-hidden rounded-xl bg-white'>
                          {product.medias?.[0]?.url ? (
                            <img src={product.medias[0].url} alt={product.name} className='h-full w-full object-cover' />
                          ) : null}
                        </div>
                        <div className='min-w-0 text-ink-900'>
                          <div className='truncate text-sm font-semibold'>{product.name}</div>
                          <div className='text-xs font-medium text-brand-600'>Organic Certified</div>
                        </div>
                      </Link>
                    ))}
                    {!heroProducts.length
                      ? ['100% Thuần chay', 'Không thử nghiệm trên động vật', 'Bao bì tái chế'].map((text) => (
                          <div key={text} className='flex items-center gap-3 rounded-2xl bg-white/60 px-4 py-3 text-sm font-bold text-ink-700'>
                            <span className='h-2 w-2 rounded-full bg-brand-500' />
                            {text}
                          </div>
                        ))
                      : null}
                  </div>
                </div>
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
          title='Best Sellers'
          desc='Khám phá những sản phẩm chăm sóc da được yêu thích nhất từ thiên nhiên.'
          action={
            <Link to='/user/home' className='inline-flex items-center gap-2 text-sm font-bold text-brand-600 hover:text-brand-900'>
              Xem bộ sưu tập <ArrowRight size={16} />
            </Link>
          }
        />

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
          ) : (
            <motion.div variants={staggerContainer} initial='hidden' animate='show' className='grid grid-cols-2 gap-4 lg:grid-cols-4'>
              {featuredProducts.map((product) => (
                <motion.div key={product._id} variants={fadeUpItem}>
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>

        <motion.div {...panelMotion} className='surface-card mt-8 rounded-3xl p-5 md:p-6'>
          <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
            <div className='flex items-start gap-3'>
              <span className='grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-mint-50 text-mint-600 shadow-sm'>
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
