import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { getProductsApi } from '../../services/products.services'
import type { Product } from '../../models/ProductRequests'

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)

  const money = (n: number) => n.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        const res = await getProductsApi()
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
    <div className='space-y-6'>
      {/* HERO */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className='rounded-3xl border border-white/10 bg-black/25 p-6 backdrop-blur'
      >
        <div className='inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur'>
          <span className='h-2 w-2 rounded-full bg-orange-500' />
          Ưu đãi hôm nay – Deal ngon mỗi ngày
        </div>

        <h1 className='mt-4 text-2xl font-extrabold md:text-3xl'>
          Khám phá sản phẩm hot <br />
          <span className='bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent'>
            Giá tốt · Giao nhanh · Đổi trả dễ
          </span>
        </h1>

        <p className='mt-2 max-w-xl text-sm text-white/60'>Chọn sản phẩm bạn thích và đặt hàng trong vài giây.</p>
      </motion.div>

      {/* TITLE */}
      <div className='flex items-end justify-between gap-3'>
        <h2 className='text-xl font-extrabold'>Sản phẩm nổi bật</h2>

        <Link to='/user/products' className='text-sm font-semibold text-white/60 hover:text-white'>
          Xem tất cả →
        </Link>
      </div>

      {/* PRODUCTS */}
      {loading ? (
        <p className='text-white/60'>Đang tải sản phẩm...</p>
      ) : (
        <motion.div
          initial='hidden'
          animate='show'
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: {
                staggerChildren: 0.08
              }
            }
          }}
          className='grid grid-cols-2 gap-4 md:grid-cols-4'
        >
          {products.map((p) => {
            const image = p.medias?.[0]?.url

            return (
              <motion.div
                key={p._id}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  show: { opacity: 1, y: 0 }
                }}
                whileHover={{ y: -6, scale: 1.02 }}
                transition={{ duration: 0.25 }}
                className='group overflow-hidden rounded-3xl border border-white/10 bg-black/25 backdrop-blur hover:border-white/15 hover:shadow-2xl'
              >
                {/* IMAGE */}
                <div className='h-40 bg-white/5 overflow-hidden'>
                  {image && (
                    <motion.img
                      src={image}
                      alt={p.name}
                      className='h-full w-full object-cover'
                      whileHover={{ scale: 1.08 }}
                      transition={{ duration: 0.3 }}
                    />
                  )}
                </div>

                {/* BODY */}
                <div className='p-4'>
                  <h3 className='line-clamp-2 text-sm font-bold text-white/90 group-hover:text-white'>{p.name}</h3>

                  <div className='mt-2 flex items-center justify-between text-xs text-white/55'>
                    <span>⭐ {p.rating_number}</span>
                    <span>Còn {p.quantity} sản phẩm</span>
                  </div>

                  <p className='mt-2 text-lg font-black text-orange-400'>{money(p.price)}</p>

                  <Link
                    to={`/user/products/${p._id}`}
                    className='mt-3 block rounded-2xl bg-gradient-to-r from-orange-500 to-pink-500 py-2 text-center text-sm font-extrabold text-white transition hover:opacity-95'
                  >
                    Xem chi tiết
                  </Link>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      )}
    </div>
  )
}
