import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight, Minus, Plus, ShoppingBag, Star, X } from 'lucide-react'
import type { Product } from '../../models/ProductRequests'
import { formatImageUrl } from '../../utils/formatImageUrl'
import money from '../../utils/money'
import cn from '../../utils/cn'
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
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    closeRef.current?.focus()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [onClose])

  if (!product) return null

  const allImages = [product.thumbnail, ...(product.medias || []).map((m) => (typeof m === 'string' ? m : m?.url))].filter(
    Boolean
  ) as string[]
  const currentImage = formatImageUrl(allImages[selectedImageIndex] || product.thumbnail)
  const outOfStock = product.quantity <= 0

  const handleAddToCart = () => {
    if (outOfStock) return
    addToCart({ product_id: product._id, quantity, redirect: false })
    onClose()
  }

  return (
    <div
      className='fixed inset-0 z-[100] flex items-end justify-center bg-ink-950/50 p-0 backdrop-blur-sm sm:items-center sm:p-4'
      onClick={onClose}
    >
      <div
        className='relative max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-t-4xl bg-white shadow-lift animate-soft-pop sm:rounded-4xl'
        onClick={(e) => e.stopPropagation()}
        role='dialog'
        aria-modal='true'
        aria-labelledby='quickview-title'
      >
        <button
          ref={closeRef}
          type='button'
          onClick={onClose}
          className='absolute right-4 top-4 z-10 grid h-10 w-10 cursor-pointer place-items-center rounded-full bg-white text-ink-950 shadow-soft transition hover:bg-ink-100'
          aria-label='Đóng'
        >
          <X size={18} />
        </button>

        <div className='grid md:grid-cols-2'>
          <div className='bg-berry-50 p-6 md:p-8'>
            <div className='aspect-square overflow-hidden rounded-3xl'>
              {currentImage ? (
                <img src={currentImage} alt={product.name} className='h-full w-full object-contain p-6 mix-blend-multiply' />
              ) : (
                <div className='grid h-full place-items-center text-xs text-ink-500'>Chưa có ảnh</div>
              )}
            </div>
            {allImages.length > 1 ? (
              <div className='no-scrollbar mt-4 flex gap-2 overflow-x-auto'>
                {allImages.slice(0, 6).map((img, idx) => (
                  <button
                    key={idx}
                    type='button'
                    onClick={() => setSelectedImageIndex(idx)}
                    aria-label={`Ảnh ${idx + 1}`}
                    aria-current={selectedImageIndex === idx}
                    className={cn(
                      'h-14 w-14 shrink-0 cursor-pointer overflow-hidden rounded-2xl bg-white ring-2 transition',
                      selectedImageIndex === idx ? 'ring-ink-950' : 'ring-transparent opacity-70 hover:opacity-100'
                    )}
                  >
                    <img src={formatImageUrl(img)} alt='' className='h-full w-full object-cover' />
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <div className='flex flex-col p-6 md:p-8'>
            <span className='text-xs font-semibold uppercase tracking-wider text-berry-600'>{product.origin || 'Chính hãng'}</span>
            <h2 id='quickview-title' className='mt-2 font-display text-2xl font-bold leading-tight text-ink-950 md:text-3xl'>
              {product.name}
            </h2>
            <div className='mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-600'>
              {product.rating_number ? (
                <span className='inline-flex items-center gap-1 font-semibold text-ink-950'>
                  <Star size={14} className='fill-peach-500 text-peach-500' aria-hidden /> {product.rating_number.toFixed(1)}
                </span>
              ) : null}
              <span>Đã bán {product.soldNumber || 0}</span>
              <span className={cn('chip ml-auto', outOfStock ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-800')}>
                {outOfStock ? 'Hết hàng' : `Còn ${product.quantity}`}
              </span>
            </div>

            <div className='mt-5 font-display text-3xl font-bold text-ink-950'>{money(product.price)}</div>

            {product.description ? (
              <p className='mt-4 line-clamp-4 text-sm leading-relaxed text-ink-600'>{product.description}</p>
            ) : null}

            <div className='mt-auto flex items-center gap-3 pt-8'>
              {!outOfStock ? (
                <div className='flex h-12 items-center rounded-full border-[1.5px] border-ink-200 px-1'>
                  <button
                    type='button'
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className='grid h-10 w-10 cursor-pointer place-items-center rounded-full text-ink-700 hover:bg-ink-100'
                    aria-label='Giảm số lượng'
                  >
                    <Minus size={16} />
                  </button>
                  <span className='w-8 text-center text-sm font-bold' aria-live='polite'>
                    {quantity}
                  </span>
                  <button
                    type='button'
                    onClick={() => setQuantity((q) => Math.min(product.quantity, q + 1))}
                    className='grid h-10 w-10 cursor-pointer place-items-center rounded-full text-ink-700 hover:bg-ink-100'
                    aria-label='Tăng số lượng'
                  >
                    <Plus size={16} />
                  </button>
                </div>
              ) : null}
              <Button variant='accent' size='lg' full loading={isAdding} disabled={outOfStock} onClick={handleAddToCart}>
                <ShoppingBag size={18} />
                {outOfStock ? 'Hết hàng' : 'Thêm vào giỏ'}
              </Button>
            </div>
            <Link
              to={ROUTE_PATHS.USER_PRODUCT_DETAIL(product._id)}
              onClick={onClose}
              className='mt-4 inline-flex items-center gap-1 self-start text-sm font-semibold text-ink-950 underline decoration-berry-300 decoration-2 underline-offset-4 hover:text-berry-600'
            >
              Xem chi tiết sản phẩm <ArrowUpRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
