import { useCallback, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Heart, Minus, PackageCheck, Plus, ShieldCheck, ShoppingCart, Star, Truck } from 'lucide-react'
import Alert from '../../components/ui/Alert'
import Button from '../../components/ui/Button'
import { useProductDetail } from '../../hooks/useProductDetail'
import { useCartActions } from '../../hooks/useCartActions'
import money from '../../utils/money'

export default function ProductDetailPage() {
  const { id } = useParams()

  const { data: product, isLoading: loading } = useProductDetail(id)
  const { addToCart, isAdding: adding } = useCartActions()

  const [qty, setQty] = useState(1)

  const handleAddToCart = useCallback(() => {
    if (!product) return

    addToCart({
      product_id: product._id,
      quantity: qty
    })
  }, [product, qty, addToCart])

  const inc = useCallback(() => setQty((q) => Math.min(product?.quantity || 1, q + 1)), [product?.quantity])
  const dec = useCallback(() => setQty((q) => Math.max(1, q - 1)), [])

  if (loading) {
    return (
      <div className='mx-auto max-w-7xl px-4 py-8 md:px-6'>
        <div className='grid gap-8 lg:grid-cols-2'>
          <div className='aspect-square animate-pulse rounded-3xl bg-slate-200' />
          <div className='space-y-4'>
            <div className='h-8 w-3/4 animate-pulse rounded bg-slate-200' />
            <div className='h-5 w-1/2 animate-pulse rounded bg-slate-200' />
            <div className='h-12 w-48 animate-pulse rounded bg-slate-200' />
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className='mx-auto max-w-7xl px-4 py-8 md:px-6'>
        <Alert variant='error' title='Lỗi' desc='Không tìm thấy sản phẩm.' />
      </div>
    )
  }

  const outOfStock = product.quantity <= 0
  const overStock = qty > product.quantity
  const mainImage = product.medias?.[0]?.url

  return (
    <div className='mx-auto max-w-7xl px-4 py-8 md:px-6'>
      <Link to='/user/home' className='mb-6 inline-flex items-center gap-2 text-sm font-black text-slate-500 transition hover:text-ink-950'>
        <ArrowLeft size={17} />
        Quay lại cửa hàng
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28 }}
        className='grid gap-8 lg:grid-cols-[1fr_0.92fr]'
      >
        <div className='space-y-4'>
          <div className='surface-card relative overflow-hidden rounded-3xl'>
            <div className='aspect-square bg-slate-100'>
              {mainImage ? (
                <motion.img
                  src={mainImage}
                  alt={product.name}
                  className='h-full w-full object-cover'
                  initial={{ opacity: 0, scale: 1.02 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.035 }}
                  transition={{ duration: 0.35 }}
                />
              ) : (
                <div className='grid h-full place-items-center text-sm font-bold text-slate-400'>No image</div>
              )}
            </div>
            <span className='absolute left-4 top-4 rounded-full bg-white/95 px-4 py-2 text-xs font-black text-brand-700 shadow-sm'>
              Hàng chính hãng
            </span>
          </div>

          <div className='grid gap-3 sm:grid-cols-3'>
            {[Truck, ShieldCheck, PackageCheck].map((Icon, index) => (
              <div key={index} className='surface-card rounded-3xl p-4'>
                <Icon size={19} className='text-brand-600' />
                <div className='mt-3 text-sm font-black text-ink-950'>
                  {index === 0 ? 'Giao nhanh' : index === 1 ? 'Bảo hành rõ ràng' : `Còn ${product.quantity}`}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className='lg:sticky lg:top-28 lg:self-start'>
          <div className='surface-strong rounded-3xl p-5 md:p-7'>
            <div className='flex flex-wrap items-center gap-2'>
              <span className='inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-black text-amber-700'>
                <Star size={14} className='fill-amber-400 text-amber-400' />
                {product.rating_number || '5.0'}
              </span>
              <span className='rounded-full bg-brand-50 px-3 py-1 text-xs font-black text-brand-700'>
                Xuất xứ: {product.origin || 'Đang cập nhật'}
              </span>
            </div>

            <h1 className='mt-4 text-3xl font-black leading-tight tracking-tight text-ink-950 md:text-4xl'>{product.name}</h1>

            <div className='mt-5 rounded-3xl bg-slate-50 p-4'>
              <p className='text-sm font-bold text-slate-500'>Giá bán</p>
              <p className='mt-1 text-3xl font-black text-ink-950'>{money(product.price)}</p>
            </div>

            {(outOfStock || overStock) && (
              <div className='mt-5'>
                <Alert
                  variant='warning'
                  title={outOfStock ? 'Hết hàng' : 'Vượt tồn kho'}
                  desc={outOfStock ? 'Sản phẩm hiện đã hết hàng.' : 'Vui lòng giảm số lượng.'}
                />
              </div>
            )}

            <div className='mt-6 flex flex-wrap items-center justify-between gap-4'>
              <div>
                <p className='text-sm font-black text-ink-950'>Số lượng</p>
                <p className='mt-1 text-xs font-semibold text-slate-500'>Chọn số lượng phù hợp với tồn kho</p>
              </div>

              <div className='flex items-center rounded-2xl border border-slate-200 bg-white p-1 shadow-sm'>
                <button
                  onClick={dec}
                  disabled={qty <= 1}
                  className='grid h-10 w-10 place-items-center rounded-xl text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40'
                  aria-label='Giảm số lượng'
                >
                  <Minus size={17} />
                </button>
                <span className='w-12 text-center text-base font-black'>{qty}</span>
                <button
                  onClick={inc}
                  disabled={qty >= product.quantity}
                  className='grid h-10 w-10 place-items-center rounded-xl text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40'
                  aria-label='Tăng số lượng'
                >
                  <Plus size={17} />
                </button>
              </div>
            </div>

            <div className='mt-6 grid gap-3 sm:grid-cols-[1fr_auto]'>
              <Button full disabled={outOfStock || overStock || adding} loading={adding} onClick={handleAddToCart}>
                <ShoppingCart size={18} />
                {adding ? 'Đang thêm...' : 'Thêm vào giỏ'}
              </Button>

              <button
                className='inline-flex min-h-12 items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 text-slate-600 shadow-sm transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600'
                aria-label='Lưu sản phẩm'
              >
                <Heart size={18} />
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.section
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08, duration: 0.28 }}
        className='surface-card mt-8 rounded-3xl p-6'
      >
        <p className='text-xs font-black uppercase tracking-[0.18em] text-brand-600'>Description</p>
        <h2 className='mt-1 text-2xl font-black tracking-tight text-ink-950'>Mô tả sản phẩm</h2>
        <p className='mt-4 max-w-4xl text-sm leading-7 text-slate-600 md:text-base'>{product.description}</p>
      </motion.section>
    </div>
  )
}
