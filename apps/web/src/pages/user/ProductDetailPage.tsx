import { useCallback, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Heart,
  Minus,
  PackageCheck,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Star,
  Truck
} from 'lucide-react'
import Alert from '../../components/ui/Alert'
import { useProductDetail } from '../../hooks/useProductDetail'
import { useCartActions } from '../../hooks/useCartActions'
import cn from '../../utils/cn'
import money from '../../utils/money'
import { formatImageUrl } from '../../utils/formatImageUrl'

export default function ProductDetailPage() {
  const { id } = useParams()

  const { data: product, isLoading: loading } = useProductDetail(id)
  const { addToCart, isAdding: adding } = useCartActions()

  const [qty, setQty] = useState(1)
  const [activeImageIndex, setActiveImageIndex] = useState(0)

  const images = useMemo(() => {
    const rawList: string[] = []
    if (product?.thumbnail) rawList.push(product.thumbnail)
    if (Array.isArray(product?.medias)) {
      for (const item of product.medias) {
        if (typeof item === 'string') rawList.push(item)
        else if (item && typeof item === 'object' && 'url' in item && typeof item.url === 'string') {
          rawList.push(item.url)
        }
      }
    }
    const uniqueList = Array.from(new Set(rawList.filter(Boolean)))
    return uniqueList.map((url) => formatImageUrl(url))
  }, [product])

  const activeImage = images[activeImageIndex] ?? images[0]

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
          <div className='aspect-square animate-pulse rounded-3xl bg-[#f7f3ee]' />
          <div className='space-y-4'>
            <div className='h-8 w-3/4 animate-pulse rounded-xl bg-[#f7f3ee]' />
            <div className='h-5 w-1/2 animate-pulse rounded-xl bg-[#f7f3ee]' />
            <div className='h-16 w-48 animate-pulse rounded-2xl bg-[#f7f3ee]' />
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

  return (
    <div className='mx-auto max-w-7xl px-4 py-8 md:px-6 [--home-blush:#fdf2f0]'>
      {/* Back to store navigation */}
      <Link
        to='/user/home'
        className='mb-6 inline-flex items-center gap-2 text-sm font-semibold text-[#8a7a74] transition hover:text-[#3d3330]'
      >
        <ArrowLeft size={16} />
        Quay lại trang chủ
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className='grid gap-8 lg:grid-cols-[1fr_0.95fr]'
      >
        {/* Left Column: Image Gallery */}
        <div className='space-y-4'>
          <div className='relative overflow-hidden rounded-3xl border border-[#eaded8] bg-white shadow-xs'>
            <div className='aspect-square overflow-hidden bg-[#fdf2f0]/40'>
              {activeImage ? (
                <img
                  src={activeImage}
                  alt={product.name}
                  referrerPolicy='no-referrer'
                  className='h-full w-full object-cover transition duration-500 hover:scale-105'
                  loading='eager'
                  decoding='async'
                />
              ) : (
                <div className='grid h-full place-items-center text-sm font-medium text-[#8a7a74]'>Chưa có ảnh</div>
              )}
            </div>

            <span className='absolute left-4 top-4 rounded-full border border-[#eaded8] bg-white/90 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-[#8a726c] shadow-xs backdrop-blur-xs'>
              Chính hãng 100%
            </span>
          </div>

          {/* Thumbnail Strip */}
          {images.length > 1 ? (
            <div className='flex gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'>
              {images.map((url, index) => (
                <button
                  key={`${url}-${index}`}
                  type='button'
                  onClick={() => setActiveImageIndex(index)}
                  aria-label={`Xem ảnh ${index + 1}`}
                  aria-pressed={activeImageIndex === index}
                  className={cn(
                    'h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-2 transition',
                    activeImageIndex === index
                      ? 'border-[#3d3330] ring-2 ring-[#3d3330]/15'
                      : 'border-[#eaded8] opacity-70 hover:opacity-100'
                  )}
                >
                  <img
                    src={url}
                    alt=''
                    referrerPolicy='no-referrer'
                    className='h-full w-full object-cover'
                    loading='lazy'
                    decoding='async'
                  />
                </button>
              ))}
            </div>
          ) : null}

          {/* Guarantee Highlights */}
          <div className='grid gap-3 sm:grid-cols-3'>
            {[
              { icon: Truck, title: 'Giao hàng tận nơi', desc: 'Đóng gói cẩn thận' },
              { icon: ShieldCheck, title: 'Cam kết chất lượng', desc: '100% Chính hãng' },
              { icon: PackageCheck, title: 'Còn hàng', desc: `${product.quantity} sản phẩm` }
            ].map(({ icon: Icon, title, desc }, index) => (
              <div key={index} className='rounded-2xl border border-[#eaded8] bg-white/80 p-3.5 text-center shadow-xs backdrop-blur-xs'>
                <Icon size={20} className='mx-auto text-[#b07a72]' />
                <div className='mt-2 text-xs font-bold text-[#3d3330]'>{title}</div>
                <div className='mt-0.5 text-[11px] font-medium text-[#8a7a74]'>{desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Product Detail & Purchase */}
        <div className='lg:sticky lg:top-28 lg:self-start'>
          <div className='rounded-3xl border border-[#eaded8] bg-white/80 p-6 shadow-xs backdrop-blur-xs md:p-8'>
            {/* Tags & Rating */}
            <div className='flex flex-wrap items-center gap-2'>
              <span className='inline-flex items-center gap-1 rounded-full bg-[#fdf2f0] px-3 py-1 text-xs font-bold text-[#b07a72]'>
                <Star size={13} className='fill-[#b07a72] text-[#b07a72]' />
                {product.rating_number || '5.0'}
              </span>
              {product.origin ? (
                <span className='rounded-full bg-[#f7f3ee] px-3 py-1 text-xs font-semibold text-[#8a726c]'>
                  Xuất xứ: {product.origin}
                </span>
              ) : null}
            </div>

            {/* Title */}
            <h1 className='mt-3.5 text-2xl font-black leading-snug text-[#3d3330] md:text-3xl'>{product.name}</h1>

            {/* Price Box */}
            <div className='mt-5 rounded-2xl border border-[#eaded8] bg-[#fdf2f0]/60 p-4'>
              <p className='text-xs font-bold uppercase tracking-wider text-[#8a726c]'>Giá bán</p>
              <p className='mt-1 text-3xl font-extrabold text-[#3d3330]'>{money(product.price)}</p>
            </div>

            {/* Specifications Quick Info */}
            <div className='mt-5 grid grid-cols-2 gap-2 text-xs font-semibold text-[#5c504a]'>
              {product.volume ? (
                <div className='rounded-xl border border-[#eaded8]/80 bg-[#faf5f3] px-3 py-2'>
                  <span className='text-[#8a7a74]'>Dung tích:</span> {product.volume} ml
                </div>
              ) : null}
              {product.weight ? (
                <div className='rounded-xl border border-[#eaded8]/80 bg-[#faf5f3] px-3 py-2'>
                  <span className='text-[#8a7a74]'>Trọng lượng:</span> {product.weight} g
                </div>
              ) : null}
              <div className='rounded-xl border border-[#eaded8]/80 bg-[#faf5f3] px-3 py-2'>
                <span className='text-[#8a7a74]'>Tình trạng:</span>{' '}
                {outOfStock ? (
                  <span className='font-bold text-rose-600'>Hết hàng</span>
                ) : (
                  <span className='font-bold text-emerald-600'>Còn {product.quantity} sản phẩm</span>
                )}
              </div>
              {product.soldNumber !== undefined ? (
                <div className='rounded-xl border border-[#eaded8]/80 bg-[#faf5f3] px-3 py-2'>
                  <span className='text-[#8a7a74]'>Đã bán:</span> {product.soldNumber}
                </div>
              ) : null}
            </div>

            {/* Warnings */}
            {(outOfStock || overStock) && (
              <div className='mt-4'>
                <Alert
                  variant='warning'
                  title={outOfStock ? 'Hết hàng' : 'Vượt tồn kho'}
                  desc={outOfStock ? 'Sản phẩm hiện đã hết hàng.' : 'Vui lòng giảm số lượng đặt mua.'}
                />
              </div>
            )}

            {/* Quantity Selector */}
            <div className='mt-6 flex items-center justify-between gap-4 border-t border-[#eaded8] pt-5'>
              <div>
                <p className='text-sm font-bold text-[#3d3330]'>Số lượng</p>
                <p className='mt-0.5 text-xs text-[#8a7a74]'>Chọn số lượng bạn muốn đặt</p>
              </div>

              <div className='flex items-center rounded-2xl border border-[#eaded8] bg-[#faf5f3] p-1 shadow-xs'>
                <button
                  type='button'
                  onClick={dec}
                  disabled={qty <= 1}
                  className='grid h-9 w-9 place-items-center rounded-xl text-[#3d3330] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40'
                  aria-label='Giảm số lượng'
                >
                  <Minus size={15} />
                </button>
                <span className='w-10 text-center text-sm font-black text-[#3d3330]'>{qty}</span>
                <button
                  type='button'
                  onClick={inc}
                  disabled={qty >= product.quantity}
                  className='grid h-9 w-9 place-items-center rounded-xl text-[#3d3330] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40'
                  aria-label='Tăng số lượng'
                >
                  <Plus size={15} />
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className='mt-6 grid gap-3 sm:grid-cols-[1fr_auto]'>
              <button
                type='button'
                disabled={outOfStock || overStock || adding}
                onClick={handleAddToCart}
                className='inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#3d3330] px-6 text-sm font-bold text-white shadow-xs transition hover:bg-[#2a2220] disabled:cursor-not-allowed disabled:opacity-50'
              >
                <ShoppingBag size={18} />
                {adding ? 'Đang thêm vào giỏ...' : 'Thêm vào giỏ hàng'}
              </button>

              <button
                type='button'
                className='inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-[#eaded8] bg-white text-[#8a7a74] shadow-xs transition hover:border-[#b07a72] hover:bg-[#fdf2f0] hover:text-[#b07a72]'
                aria-label='Lưu sản phẩm'
              >
                <Heart size={18} />
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Product Description Section */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.35 }}
        className='mt-10 rounded-3xl border border-[#eaded8] bg-white/80 p-6 shadow-xs backdrop-blur-xs md:p-8'
      >
        <span className='text-xs font-bold uppercase tracking-wider text-[#8a726c]'>Mô tả & Công dụng</span>
        <h2 className='mt-1 text-2xl font-black text-[#3d3330]'>Thông tin chi tiết sản phẩm</h2>
        <div className='mt-4 max-w-4xl space-y-3 text-sm leading-relaxed text-[#5c504a] md:text-base'>
          {product.description ? (
            product.description.split('\n').map((paragraph, idx) => (
              <p key={idx}>{paragraph}</p>
            ))
          ) : (
            <p className='italic text-[#8a7a74]'>Chưa có thông tin mô tả chi tiết cho sản phẩm này.</p>
          )}
        </div>
      </motion.section>
    </div>
  )
}
