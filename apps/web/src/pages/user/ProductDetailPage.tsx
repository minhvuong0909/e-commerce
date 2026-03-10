import { useParams, useNavigate, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'

import Button from '../../components/ui/Button'
import Alert from '../../components/ui/Alert'

import { getProductByIdApi } from '../../services/products.services'
import { addToCartApi } from '../../services/carts.services'

import type { Product } from '../../models/ProductRequests'

export default function ProductDetailPage() {
  const { id } = useParams()
  const nav = useNavigate()

  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(false)
  const [adding, setAdding] = useState(false)
  const [qty, setQty] = useState(1)

  const money = (n: number) => n.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })

  /* ---------------- FETCH PRODUCT ---------------- */

  useEffect(() => {
    if (!id) return

    let mounted = true

    const fetchProduct = async () => {
      try {
        setLoading(true)

        const res = await getProductByIdApi(id)

        if (mounted) {
          setProduct(res.data.data)
        }
      } catch (error) {
        toast.error('Không thể tải chi tiết sản phẩm')
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    fetchProduct()

    return () => {
      mounted = false
    }
  }, [id])

  /* ---------------- ADD TO CART ---------------- */

  const handleAddToCart = async () => {
    if (!product) return

    try {
      setAdding(true)

      await addToCartApi({
        product_id: product._id,
        quantity: qty
      })

      toast.success('Đã thêm vào giỏ hàng')

      nav('/user/cart')
    } catch (error) {
      toast.error('Thêm vào giỏ hàng thất bại')
    } finally {
      setAdding(false)
    }
  }

  /* ---------------- STATE CHECK ---------------- */

  if (loading) {
    return <p className='text-white/60'>Đang tải sản phẩm...</p>
  }

  if (!product) {
    return <Alert variant='error' title='Lỗi' desc='Không tìm thấy sản phẩm.' />
  }

  const outOfStock = product.quantity <= 0
  const overStock = qty > product.quantity

  const inc = () => setQty((q) => Math.min(product.quantity, q + 1))
  const dec = () => setQty((q) => Math.max(1, q - 1))

  const mainImage = product.medias?.[0]?.url

  /* ---------------- UI ---------------- */

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className='space-y-6'
    >
      <div className='grid gap-8 md:grid-cols-2'>
        {/* IMAGE */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className='relative overflow-hidden rounded-3xl border border-white/10 bg-black/25 backdrop-blur'
        >
          <div className='h-80 bg-white/5 overflow-hidden'>
            {mainImage && (
              <motion.img
                src={mainImage}
                alt={product.name}
                className='h-full w-full object-cover'
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                whileHover={{ scale: 1.08 }}
                transition={{ duration: 0.35 }}
              />
            )}
          </div>

          <div className='absolute left-4 top-4'>
            <span className='rounded-full bg-white/10 px-3 py-1 text-xs font-extrabold text-white'>Chính hãng</span>
          </div>
        </motion.div>

        {/* INFO */}
        <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 }}>
          <Link
            to='/user/home'
            className='flex justify-end text-sm font-semibold text-white/55 hover:text-white transition'
          >
            ← Quay lại
          </Link>

          <h1 className='mt-3 text-2xl font-extrabold'>{product.name}</h1>

          <div className='mt-2 flex flex-wrap items-center gap-3 text-sm text-white/60'>
            <span>⭐ {product.rating_number}</span>

            <span className='rounded-full bg-white/5 px-3 py-1'>Xuất xứ: {product.origin}</span>
          </div>

          {/* PRICE */}
          <div className='mt-4 text-3xl font-black text-orange-400'>{money(product.price)}</div>

          {/* STOCK */}
          <div className='mt-2 text-sm text-white/60'>
            Còn lại: <span className='font-bold text-white'>{product.quantity}</span> sản phẩm
          </div>

          {/* WARNING */}
          {(outOfStock || overStock) && (
            <div className='mt-4'>
              <Alert
                variant='warning'
                title={outOfStock ? 'Hết hàng' : 'Vượt tồn kho'}
                desc={outOfStock ? 'Sản phẩm hiện đã hết hàng.' : 'Vui lòng giảm số lượng.'}
              />
            </div>
          )}

          {/* QTY */}
          <div className='mt-5 flex items-center gap-4'>
            <div className='text-sm font-semibold text-white/70'>Số lượng</div>

            <div className='flex items-center gap-2'>
              <button
                onClick={dec}
                disabled={qty <= 1}
                className='h-10 w-10 rounded-2xl bg-white/10 font-extrabold disabled:opacity-40'
              >
                −
              </button>

              <span className='w-10 text-center text-lg font-bold'>{qty}</span>

              <button
                onClick={inc}
                disabled={qty >= product.quantity}
                className='h-10 w-10 rounded-2xl bg-white/10 font-extrabold disabled:opacity-40'
              >
                +
              </button>
            </div>
          </div>

          {/* CTA */}
          <div className='mt-6 grid gap-3 sm:grid-cols-2'>
            <motion.div whileHover={{ scale: 1.04 }}>
              <Button full variant='gradient' disabled={outOfStock || overStock || adding} onClick={handleAddToCart}>
                {adding ? 'Đang thêm...' : 'Thêm vào giỏ'}
              </Button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.04 }}>
              <Button full variant='secondary' disabled={outOfStock || overStock} onClick={() => nav('/user/checkout')}>
                Mua ngay
              </Button>
            </motion.div>
          </div>

          <p className='mt-3 text-xs text-white/45'>Đổi trả miễn phí trong 7 ngày.</p>
        </motion.div>
      </div>

      {/* DESCRIPTION */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className='rounded-3xl border border-white/10 bg-black/25 p-5 backdrop-blur'
      >
        <div className='text-lg font-extrabold'>Mô tả sản phẩm</div>

        <p className='mt-3 text-sm leading-relaxed text-white/70'>{product.description}</p>
      </motion.div>
    </motion.div>
  )
}
