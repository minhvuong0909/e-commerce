import { Eye, Heart, Plus, Star } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useState, type MouseEvent } from 'react'
import type { Product } from '../../models/ProductRequests'
import { useCartActions } from '../../hooks/useCartActions'
import { useWishlist } from '../../hooks/useWishlist'
import { BADGE_LABELS, BADGE_STYLES, getProductBadges } from '../../utils/productBadges'
import cn from '../../utils/cn'
import money from '../../utils/money'
import { formatImageUrl } from '../../utils/formatImageUrl'
import { ROUTE_PATHS } from '../../routes/route.paths'
import QuickViewModal from './QuickViewModal'

interface ProductCardProps {
  product: Product
  /** soft tint behind the product shot; cycles on grids for a playful rhythm */
  tint?: 'blush' | 'lilac' | 'peach' | 'mist'
}

const TINTS = {
  blush: 'bg-ink-100',
  lilac: 'bg-ink-100',
  peach: 'bg-ink-100',
  mist: 'bg-ink-100'
} as const

export const CARD_TINTS = Object.keys(TINTS) as Array<keyof typeof TINTS>

export default function ProductCard({ product, tint = 'blush' }: ProductCardProps) {
  const firstMedia = product.medias?.[0]
  const image = formatImageUrl(product.thumbnail || (typeof firstMedia === 'string' ? firstMedia : firstMedia?.url))
  const secondMedia = product.medias?.[1]
  const hoverImage = secondMedia
    ? formatImageUrl(typeof secondMedia === 'string' ? secondMedia : secondMedia?.url)
    : undefined
  const outOfStock = product.quantity <= 0
  const badges = getProductBadges(product)
  const rating = Math.max(0, Math.min(5, product.rating_number || 0))
  const href = ROUTE_PATHS.USER_PRODUCT_DETAIL(product._id)

  const { isWishlisted, toggleWishlist } = useWishlist()
  const favorited = isWishlisted(product._id)
  const [quickViewOpen, setQuickViewOpen] = useState(false)
  const { addToCart, isAdding, addingProductId } = useCartActions()
  const isAddingThis = isAdding && addingProductId === product._id

  const stop = (e: MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  return (
    <>
      <article className='group relative flex h-full flex-col'>
        <div className={cn('relative overflow-hidden rounded-2xl', TINTS[tint])}>
          <Link to={href} className='block aspect-[4/5] focus-visible:outline-none' aria-label={product.name}>
            {image ? (
              <div className='relative h-full w-full'>
                <img
                  src={image}
                  alt=''
                  referrerPolicy='no-referrer'
                  loading='lazy'
                  className={cn(
                    'h-full w-full object-contain p-6 mix-blend-multiply transition duration-500 ease-out',
                    outOfStock && 'opacity-50 grayscale',
                    hoverImage && '[@media(hover:hover)]:group-hover:opacity-0'
                  )}
                />
                {hoverImage ? (
                  <img
                    src={hoverImage}
                    alt=''
                    aria-hidden
                    referrerPolicy='no-referrer'
                    loading='lazy'
                    className='absolute inset-0 h-full w-full object-contain p-6 opacity-0 mix-blend-multiply transition duration-500 [@media(hover:hover)]:group-hover:opacity-100'
                  />
                ) : null}
              </div>
            ) : (
              <div className='grid h-full place-items-center text-xs text-ink-500'>Chưa có ảnh</div>
            )}
          </Link>

          {badges.length > 0 ? (
            <div className='pointer-events-none absolute left-3 top-3 flex flex-wrap gap-1.5'>
              {badges.map((badge) => (
                <span
                  key={badge}
                  className={cn('rounded-md px-2 py-0.5 text-[11px] font-semibold', BADGE_STYLES[badge])}
                >
                  {BADGE_LABELS[badge]}
                </span>
              ))}
            </div>
          ) : null}

          <button
            type='button'
            onClick={(e) => {
              stop(e)
              toggleWishlist(product)
            }}
            aria-label={favorited ? 'Bỏ yêu thích' : 'Thêm vào yêu thích'}
            aria-pressed={favorited}
            className={cn(
              'absolute right-3 top-3 grid h-10 w-10 cursor-pointer place-items-center rounded-full bg-white text-ink-700 transition hover:text-berry-600',
              favorited && 'text-berry-600'
            )}
          >
            <Heart size={18} className={cn(favorited && 'fill-current')} />
          </button>

          {/* hover actions — always visible on touch (no hover) */}
          <div className='absolute inset-x-3 bottom-3 flex gap-2 transition duration-300 [@media(hover:hover)]:translate-y-2 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:translate-y-0 [@media(hover:hover)]:group-hover:opacity-100 [@media(hover:hover)]:group-focus-within:translate-y-0 [@media(hover:hover)]:group-focus-within:opacity-100'>
            <button
              type='button'
              onClick={(e) => {
                stop(e)
                setQuickViewOpen(true)
              }}
              className='hidden h-11 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-white text-[13px] font-semibold text-ink-950 shadow-soft transition hover:bg-ink-50 sm:inline-flex'
            >
              <Eye size={16} /> Xem nhanh
            </button>
            {!outOfStock ? (
              <button
                type='button'
                onClick={(e) => {
                  stop(e)
                  if (!isAddingThis) addToCart({ product_id: product._id, quantity: 1, redirect: false })
                }}
                disabled={isAddingThis}
                aria-label={`Thêm ${product.name} vào giỏ`}
                className='ml-auto grid h-11 w-11 shrink-0 cursor-pointer place-items-center rounded-lg bg-berry-600 text-white shadow-soft transition hover:bg-berry-700 disabled:opacity-60'
              >
                {isAddingThis ? (
                  <span className='h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent' />
                ) : (
                  <Plus size={20} />
                )}
              </button>
            ) : null}
          </div>
        </div>

        <Link to={href} className='mt-3 flex flex-1 flex-col px-1 focus-visible:outline-none'>
          <div className='flex items-center justify-between gap-2 text-xs text-ink-500'>
            <span className='truncate font-medium uppercase tracking-wider'>{product.origin || 'Chính hãng'}</span>
            {rating > 0 ? (
              <span className='inline-flex shrink-0 items-center gap-1 font-semibold text-ink-700'>
                <Star size={12} className='fill-peach-500 text-peach-500' aria-hidden />
                {rating.toFixed(1)}
                <span className='sr-only'>trên 5 sao</span>
              </span>
            ) : null}
          </div>
          <h3 className='mt-1 line-clamp-2 text-[15px] font-medium leading-snug text-ink-950 group-hover:text-berry-700'>
            {product.name}
          </h3>
          <div className='mt-auto flex items-baseline gap-2 pt-2'>
            <span className='text-base font-semibold text-ink-950'>{money(product.price)}</span>
            {(product.soldNumber ?? 0) > 0 ? (
              <span className='text-xs text-ink-500'>· đã bán {product.soldNumber}</span>
            ) : null}
          </div>
        </Link>
      </article>

      {quickViewOpen ? <QuickViewModal product={product} onClose={() => setQuickViewOpen(false)} /> : null}
    </>
  )
}
