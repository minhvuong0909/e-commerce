import { Link } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { ArrowRight, BadgeCheck, PackageCheck, ShieldCheck, ShoppingCart, Star, Truck } from 'lucide-react'
import type { Product } from '../../models/ProductRequests'
import { getAllProductsApi } from '../../services/products.services'
import heroImage from '../../assets/images/background_home.png'

const LIMIT = 0
const PAGE = 0

const formatMoney = (n: number) => n.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.07
    }
  }
}

const item = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0 }
}

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)

  const featuredProducts = useMemo(() => products.slice(0, 8), [products])

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        const res = await getAllProductsApi(PAGE, LIMIT)
        setProducts(res.data.result)
      } catch (error) {
        toast.error('Không thể tải danh sách sản phẩm')
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  return (
    <div className='pb-12'>
      <section className='relative overflow-hidden bg-slate-950 text-white'>
        <img src={heroImage} alt='' className='absolute inset-0 h-full w-full object-cover opacity-28' />
        <div className='absolute inset-0 bg-[linear-gradient(90deg,rgba(2,6,23,0.96),rgba(2,6,23,0.78),rgba(2,6,23,0.35))]' />

        <div className='relative mx-auto grid min-h-[520px] max-w-7xl items-center gap-8 px-4 py-14 md:px-6 lg:grid-cols-[1.1fr_0.9fr]'>
          <motion.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
            <div className='inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-bold text-white/90 backdrop-blur'>
              <BadgeCheck size={16} className='text-emerald-300' />
              Hàng chính hãng, giao nhanh trong ngày
            </div>

            <h1 className='mt-6 max-w-3xl text-4xl font-black leading-[1.05] tracking-tight md:text-6xl'>
              Mua sắm thông minh cho nhịp sống hiện đại
            </h1>

            <p className='mt-5 max-w-2xl text-base leading-7 text-white/72 md:text-lg'>
              Khám phá sản phẩm chọn lọc, giá minh bạch, trải nghiệm đặt hàng mượt mà và hỗ trợ sau bán hàng chuẩn
              doanh nghiệp.
            </p>

            <div className='mt-8 flex flex-col gap-3 sm:flex-row'>
              <a
                href='#featured-products'
                className='inline-flex h-12 items-center justify-center gap-2 rounded-full bg-emerald-500 px-6 text-sm font-black text-slate-950 shadow-xl shadow-emerald-500/25 transition hover:-translate-y-0.5 hover:bg-emerald-400'
              >
                Mua ngay <ArrowRight size={18} />
              </a>
              <Link
                to='/user/orders'
                className='inline-flex h-12 items-center justify-center rounded-full border border-white/20 px-6 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-white/10'
              >
                Theo dõi đơn hàng
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.12, duration: 0.45 }}
            className='hidden lg:block'
          >
            <div className='ml-auto max-w-sm rounded-[2rem] border border-white/15 bg-white/12 p-5 shadow-2xl backdrop-blur-xl'>
              <div className='rounded-3xl bg-white p-5 text-slate-950'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-xs font-black uppercase tracking-[0.18em] text-emerald-700'>Live Store</p>
                    <p className='mt-1 text-2xl font-black'>{products.length || 120}+</p>
                  </div>
                  <div className='grid h-12 w-12 place-items-center rounded-2xl bg-emerald-50 text-emerald-700'>
                    <ShoppingCart size={24} />
                  </div>
                </div>
                <div className='mt-5 space-y-3'>
                  {['Kiểm duyệt chất lượng', 'Giao hàng theo thời gian thực', 'Đổi trả trong 7 ngày'].map((text) => (
                    <div key={text} className='flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm font-bold'>
                      <span className='h-2 w-2 rounded-full bg-emerald-500' />
                      {text}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
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
            whileHover={{ y: -4 }}
            className='flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-lg'
          >
            <span className='grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-slate-950 text-white'>
              <Icon size={20} />
            </span>
            <span>
              <span className='block font-black'>{title}</span>
              <span className='mt-1 block text-sm leading-6 text-slate-500'>{desc}</span>
            </span>
          </motion.div>
        ))}
      </section>

      <section id='featured-products' className='mx-auto max-w-7xl px-4 py-6 md:px-6'>
        <div className='mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between'>
          <div>
            <p className='text-sm font-black uppercase tracking-[0.18em] text-emerald-700'>Featured</p>
            <h2 className='mt-1 text-2xl font-black tracking-tight md:text-3xl'>Sản phẩm nổi bật</h2>
          </div>
          <Link to='/user/home' className='inline-flex items-center gap-2 text-sm font-black text-slate-600 hover:text-slate-950'>
            Xem bộ sưu tập <ArrowRight size={16} />
          </Link>
        </div>

        {loading ? (
          <div className='grid grid-cols-2 gap-4 lg:grid-cols-4'>
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className='h-80 animate-pulse rounded-2xl border border-slate-200 bg-white p-3'>
                <div className='h-44 rounded-xl bg-slate-100' />
                <div className='mt-4 h-4 w-3/4 rounded bg-slate-100' />
                <div className='mt-3 h-4 w-1/2 rounded bg-slate-100' />
              </div>
            ))}
          </div>
        ) : (
          <motion.div
            variants={container}
            initial='hidden'
            animate='show'
            className='grid grid-cols-2 gap-4 lg:grid-cols-4'
          >
            {featuredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </motion.div>
        )}
      </section>
    </div>
  )
}

function ProductCard({ product }: { product: Product }) {
  const image = product.medias?.[0]?.url

  return (
    <motion.article
      variants={item}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.22 }}
      className='group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:border-slate-300 hover:shadow-xl'
    >
      <Link to={`/user/products/${product._id}`} className='block'>
        <div className='relative aspect-[4/3] overflow-hidden bg-slate-100'>
          {image ? (
            <motion.img
              src={image}
              alt={product.name}
              className='h-full w-full object-cover'
              whileHover={{ scale: 1.06 }}
              transition={{ duration: 0.35 }}
            />
          ) : (
            <div className='grid h-full place-items-center text-sm font-bold text-slate-400'>No image</div>
          )}
          <span className='absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-xs font-black text-emerald-700 shadow-sm'>
            Official
          </span>
        </div>

        <div className='p-4'>
          <h3 className='line-clamp-2 min-h-10 text-sm font-black leading-5 text-slate-950'>{product.name}</h3>
          <div className='mt-3 flex items-center justify-between gap-2 text-xs font-bold text-slate-500'>
            <span className='inline-flex items-center gap-1'>
              <Star size={14} className='fill-amber-400 text-amber-400' />
              {product.rating_number || '5.0'}
            </span>
            <span>Còn {product.quantity}</span>
          </div>
          <div className='mt-3 flex items-center justify-between gap-2'>
            <p className='text-base font-black text-slate-950'>{formatMoney(product.price)}</p>
            <span className='grid h-9 w-9 place-items-center rounded-full bg-slate-950 text-white transition group-hover:bg-emerald-500 group-hover:text-slate-950'>
              <ArrowRight size={16} />
            </span>
          </div>
        </div>
      </Link>
    </motion.article>
  )
}
