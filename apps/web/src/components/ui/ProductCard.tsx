import { Heart, Plus, Star, Eye } from 'lucide-react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useState, type MouseEvent } from 'react'
import type { Product } from '../../models/ProductRequests'
import { useCartActions } from '../../hooks/useCartActions'
import { useWishlist } from '../../hooks/useWishlist'
import { BADGE_LABELS, BADGE_STYLES, getProductBadges } from '../../utils/productBadges'
import cn from '../../utils/cn'
import money from '../../utils/money'
import { formatImageUrl } from '../../utils/formatImageUrl'
import QuickViewModal from './QuickViewModal'

interface ProductCardProps {
  product: Product
}

function StarRating({ value }: { value: number }) {
  const rating = Math.max(0, Math.min(5, value || 0))
  return (
    <div className='flex items-center gap-0.5' aria-label={`Đánh giá ${rating.toFixed(1)} trên 5`}>
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          size={12}
          className={cn(
            index < Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'fill-[#e8ddd8] text-[#e8ddd8]'
          )}
        />
      ))}
      <span className='ml-1 text-xs font-medium text-[#8a7a74]'>{rating.toFixed(1)}</span>
    </div>
  )
}

export default function ProductCard({ product }: ProductCardProps) {
  const firstMedia = product.medias?.[0]
  const rawImage = product.thumbnail || (typeof firstMedia === 'string' ? firstMedia : firstMedia?.url)
  const image = formatImageUrl(rawImage)
  const outOfStock = product.quantity <= 0
  const badges = getProductBadges(product)

  const { isWishlisted, toggleWishlist } = useWishlist()
  const favorited = isWishlisted(product._id)
  const [quickViewOpen, setQuickViewOpen] = useState(false)

  const { addToCart, isAdding, addingProductId } = useCartActions()
  const isAddingThis = isAdding && addingProductId === product._id

  const handleQuickAdd = (e: MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (outOfStock || isAddingThis) return
    addToCart({ product_id: product._id, quantity: 1, redirect: false })
  }

  const handleFavorite = (e: MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggleWishlist(product)
  }

  const handleOpenQuickView = (e: MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setQuickViewOpen(true)
  }

  return (
    <>
      <motion.article
        layout
        className='group relative flex h-full flex-col overflow-hidden rounded-2xl border border-[#EFECE6] bg-white p-2 transition duration-300 hover:shadow-md'
      >
        <div className='static'>
          <Link to={`/user/products/${product._id}`} className='block'>
            <div className='relative aspect-square overflow-hidden rounded-xl bg-[#F9F9F9]'>
              {image ? (
                <img
                  src={image}
                  alt={product.name}
                  referrerPolicy='no-referrer'
                  className='h-full w-full object-contain p-3 transition duration-500 group-hover:scale-[1.03]'
                  loading='lazy'
                />
              ) : (
                <div className='grid h-full place-items-center text-xs font-medium text-[#a89890]'>Chưa có ảnh</div>
              )}
              {outOfStock ? <div className='absolute inset-0 bg-white/45' /> : null}

              {/* Quick View Button on Image Hover */}
              <button
                type='button'
                onClick={handleOpenQuickView}
                className='absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-bold text-[#3d3330] shadow-md backdrop-blur-sm opacity-0 transition duration-200 group-hover:opacity-100 hover:bg-white hover:text-[#c65f4a]'
                aria-label='Xem nhanh sản phẩm'
              >
                <Eye size={14} />
                <span>Xem nhanh</span>
              </button>
            </div>
          </Link>

          {badges.length > 0 ? (
            <div className='pointer-events-none absolute left-2 top-2 flex max-w-[calc(100%-3rem)] flex-wrap gap-1'>
              {badges.map((badge) => (
                <span
                  key={badge}
                  className={cn(
                    'rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide',
                    BADGE_STYLES[badge]
                  )}
                >
                  {BADGE_LABELS[badge]}
                </span>
              ))}
            </div>
          ) : null}

          <button
            type='button'
            onClick={handleFavorite}
            aria-label={favorited ? 'Bỏ yêu thích' : 'Thêm vào yêu thích'}
            aria-pressed={favorited}
            className={cn(
              'absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full border border-[#eaded8] bg-white/95 text-[#6b5f59] shadow-sm transition hover:border-[#cbb8af]',
              favorited && 'border-rose-200 bg-rose-50 text-rose-600'
            )}
          >
            <Heart size={15} className={cn(favorited && 'fill-current')} />
          </button>

          {!outOfStock ? (
            <div className='absolute bottom-4 right-4'>
              <button
                type='button'
                onClick={handleQuickAdd}
                disabled={isAddingThis}
                className='grid h-9 w-9 place-items-center rounded-full bg-[#2B2118] text-white transition hover:bg-[#433528] disabled:opacity-60 sm:h-11 sm:w-11'
                aria-label='Thêm nhanh vào giỏ'
                title={isAddingThis ? 'Đang thêm...' : 'Thêm nhanh vào giỏ'}
              >
                <Plus size={16} />
              </button>
            </div>
          ) : null}
        </div>

        <div className='flex flex-1 flex-col p-2 sm:p-3'>
          <Link to={`/user/products/${product._id}`} className='flex flex-1 flex-col'>
            {product.origin ? (
              <p className='text-[11px] font-semibold uppercase tracking-[0.12em] text-[#b07a72]'>{product.origin}</p>
            ) : null}
            <h3 className='mt-1 line-clamp-2 text-sm font-semibold leading-snug text-[#3d3330]'>{product.name}</h3>
            <div className='mt-2'>
              <StarRating value={product.rating_number} />
            </div>
            <div className='mt-auto pr-10 pt-5 sm:pr-12'>
              <p className='whitespace-nowrap text-xs font-bold tracking-tight text-[#C85A32] sm:text-base lg:text-lg'>{money(product.price)}</p>
            </div>
          </Link>
        </div>
      </motion.article>

      {quickViewOpen ? (
        <QuickViewModal product={product} onClose={() => setQuickViewOpen(false)} />
      ) : null}
    </>
  )
}
