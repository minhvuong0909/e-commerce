import { Heart, Plus, Star } from 'lucide-react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useState, type MouseEvent } from 'react'
import { toast } from 'sonner'
import type { Product } from '../../models/ProductRequests'
import { useCartActions } from '../../hooks/useCartActions'
import { BADGE_LABELS, BADGE_STYLES, getProductBadges } from '../../utils/productBadges'
import cn from '../../utils/cn'
import money from '../../utils/money'

import { formatImageUrl } from '../../utils/formatImageUrl'

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
  const [favorited, setFavorited] = useState(false)
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
    setFavorited((prev) => !prev)
    toast.message(favorited ? 'Đã bỏ khỏi yêu thích' : 'Tính năng yêu thích sắp ra mắt')
  }

  return (
    <motion.article
      layout
      className='group flex h-full flex-col overflow-hidden rounded-lg border border-[#eaded8] bg-white transition hover:border-[#cbb8af] hover:shadow-[0_8px_30px_rgba(61,51,48,0.08)]'
    >
      <div className='relative'>
        <Link to={`/user/products/${product._id}`} className='block'>
          <div className='relative aspect-[4/5] overflow-hidden bg-[#f5ebe6]'>
            {image ? (
              <img
                src={image}
                alt={product.name}
                referrerPolicy='no-referrer'
                className='h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]'
                loading='lazy'
              />
            ) : (
              <div className='grid h-full place-items-center text-xs font-medium text-[#a89890]'>Chưa có ảnh</div>
            )}
            {outOfStock ? <div className='absolute inset-0 bg-white/45' /> : null}
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
          <div className='absolute inset-x-2 bottom-2 translate-y-0 opacity-100 transition sm:translate-y-1 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100'>
            <button
              type='button'
              onClick={handleQuickAdd}
              disabled={isAddingThis}
              className='flex h-10 w-full items-center justify-center gap-2 rounded-md bg-[#3d3330] text-sm font-semibold text-white transition hover:bg-[#2a2421] disabled:opacity-60'
            >
              <Plus size={16} />
              {isAddingThis ? 'Đang thêm...' : 'Thêm vào giỏ hàng'}
            </button>
          </div>
        ) : null}
      </div>

      <div className='flex flex-1 flex-col p-3'>
        <Link to={`/user/products/${product._id}`} className='flex flex-1 flex-col'>
          {product.origin ? (
            <p className='text-[11px] font-semibold uppercase tracking-[0.12em] text-[#b07a72]'>{product.origin}</p>
          ) : null}
          <h3 className='mt-1 line-clamp-2 text-sm font-semibold leading-snug text-[#3d3330]'>{product.name}</h3>
          <div className='mt-2'>
            <StarRating value={product.rating_number} />
          </div>
          <div className='mt-auto pt-3'>
            <p className='text-base font-bold tracking-tight text-[#3d3330]'>{money(product.price)}</p>
          </div>
        </Link>
      </div>
    </motion.article>
  )
}
