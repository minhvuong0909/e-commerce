import { useState } from 'react'
import { Link } from 'react-router-dom'
import { X, Star, ShoppingBag, Eye, ShieldCheck, Truck } from 'lucide-react'
import type { Product } from '../../models/ProductRequests'
import { formatImageUrl } from '../../utils/formatImageUrl'
import money from '../../utils/money'
import { useCartActions } from '../../hooks/useCartActions'
import { ROUTE_PATHS } from '../../routes/route.paths'
import Button from './Button'

interface QuickViewModalProps {
  product: Product | null
  onClose: () => void
}

export default function QuickViewModal({ product, onClose }: QuickViewModalProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const { addToCart, isAdding } = useCartActions()

  if (!product) return null

  const medias = product.medias || []
  const allImages = [
    product.thumbnail,
    ...medias.map((m) => (typeof m === 'string' ? m : m?.url))
  ].filter(Boolean) as string[]

  const currentImageRaw = allImages[selectedImageIndex] || product.thumbnail
  const currentImage = formatImageUrl(currentImageRaw)
  const outOfStock = product.quantity <= 0

  const handleAddToCart = () => {
    if (outOfStock) return
    addToCart({ product_id: product._id, quantity, redirect: false })
    onClose()
  }

  return (
    <div
      className='fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200'
      onClick={onClose}
    >
      <div
        className='relative w-full max-w-3xl overflow-hidden rounded-3xl border border-[#eaded8] bg-white shadow-2xl transition-all'
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type='button'
          onClick={onClose}
          className='absolute right-4 top-4 z-10 grid h-9 w-9 place-items-center rounded-full bg-[#f5ebe6] text-[#4a403c] transition hover:bg-[#eaded8] hover:text-[#2b2118]'
          aria-label='Đóng xem nhanh'
        >
          <X size={18} />
        </button>

        <div className='grid grid-cols-1 md:grid-cols-2'>
          {/* Gallery */}
          <div className='p-6 bg-[#FAF7F5] flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-[#eaded8]'>
            <div className='relative aspect-square w-full max-w-[280px] overflow-hidden rounded-2xl bg-white shadow-sm'>
              {currentImage ? (
                <img
                  src={currentImage}
                  alt={product.name}
                  className='h-full w-full object-contain p-4'
                />
              ) : (
                <div className='grid h-full place-items-center text-xs font-medium text-[#a89890]'>Chưa có ảnh</div>
              )}
            </div>

            {allImages.length > 1 ? (
              <div className='mt-4 flex gap-2 overflow-x-auto max-w-full pb-1'>
                {allImages.slice(0, 5).map((img, idx) => {
                  const formatted = formatImageUrl(img)
                  return (
                    <button
                      key={idx}
                      type='button'
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`h-12 w-12 rounded-xl overflow-hidden border-2 transition ${
                        selectedImageIndex === idx ? 'border-[#c65f4a]' : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={formatted} alt='' className='h-full w-full object-cover' />
                    </button>
                  )
                })}
              </div>
            ) : null}
          </div>

          {/* Details */}
          <div className='p-6 flex flex-col justify-between'>
            <div>
              {product.origin ? (
                <span className='inline-block text-[11px] font-bold uppercase tracking-widest text-[#b07a72]'>
                  {product.origin}
                </span>
              ) : null}

              <h2 className='mt-1 text-xl font-bold leading-tight text-[#3d3330]'>{product.name}</h2>

              <div className='mt-2 flex items-center gap-2'>
                <div className='flex items-center gap-1 text-amber-400'>
                  <Star size={15} className='fill-amber-400' />
                  <span className='text-xs font-bold text-[#3d3330]'>
                    {(product.rating_number || 5.0).toFixed(1)}
                  </span>
                </div>
                <span className='text-xs text-[#8a7a74]'>• {product.soldNumber || 0} đã bán</span>
                <span className={`ml-auto text-xs font-bold px-2 py-0.5 rounded-full ${outOfStock ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                  {outOfStock ? 'Hết hàng' : `Còn ${product.quantity} sp`}
                </span>
              </div>

              <div className='mt-4 text-2xl font-black text-[#c65f4a]'>
                {money(product.price)}
              </div>

              {product.description ? (
                <p className='mt-3 text-xs leading-relaxed text-[#6b5f59] line-clamp-3'>
                  {product.description}
                </p>
              ) : null}

              <div className='mt-4 space-y-2 border-t border-[#f2e7e1] pt-4 text-xs text-[#6b5f59]'>
                <div className='flex items-center gap-2'>
                  <ShieldCheck size={16} className='text-[#b07a72]' />
                  <span>100% Chính hãng & Phân phối chính thức</span>
                </div>
                <div className='flex items-center gap-2'>
                  <Truck size={16} className='text-[#b07a72]' />
                  <span>Giao hàng nhanh 2 - 4 ngày toàn quốc</span>
                </div>
              </div>
            </div>

            <div className='mt-6 pt-4 border-t border-[#f2e7e1] flex items-center gap-3'>
              {!outOfStock ? (
                <div className='flex items-center rounded-xl border border-[#eaded8] bg-[#faf7f5] p-1'>
                  <button
                    type='button'
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className='grid h-8 w-8 place-items-center rounded-lg text-sm font-bold text-[#4a403c] hover:bg-white'
                  >
                    -
                  </button>
                  <span className='w-8 text-center text-xs font-bold text-[#3d3330]'>{quantity}</span>
                  <button
                    type='button'
                    onClick={() => setQuantity((q) => Math.min(product.quantity, q + 1))}
                    className='grid h-8 w-8 place-items-center rounded-lg text-sm font-bold text-[#4a403c] hover:bg-white'
                  >
                    +
                  </button>
                </div>
              ) : null}

              <Button
                variant='gradient'
                full
                loading={isAdding}
                disabled={outOfStock}
                onClick={handleAddToCart}
              >
                <ShoppingBag size={16} />
                <span>{outOfStock ? 'Hết hàng' : 'Thêm vào giỏ'}</span>
              </Button>

              <Link
                to={ROUTE_PATHS.USER_PRODUCT_DETAIL(product._id)}
                onClick={onClose}
                className='grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-[#eaded8] bg-white text-[#4a403c] transition hover:border-[#c65f4a] hover:text-[#c65f4a]'
                title='Xem chi tiết đầy đủ'
              >
                <Eye size={18} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
