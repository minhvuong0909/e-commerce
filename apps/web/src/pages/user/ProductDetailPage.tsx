import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronRight, Heart, MessageSquareText, Minus, Package, Plus, ShoppingBag, Star, Zap } from 'lucide-react'
import { toast } from 'sonner'
import Alert from '../../components/ui/Alert'
import Button from '../../components/ui/Button'
import ProductCard, { CARD_TINTS } from '../../components/ui/ProductCard'
import { useProductDetail } from '../../hooks/useProductDetail'
import { useProducts } from '../../hooks/useProducts'
import { useCartActions } from '../../hooks/useCartActions'
import { useWishlist } from '../../hooks/useWishlist'
import cn from '../../utils/cn'
import money from '../../utils/money'
import { formatImageUrl } from '../../utils/formatImageUrl'
import { createProductReviewApi, getProductReviewsApi, type ProductReview } from '../../services/reviews.services'
import { getApiErrorMessage } from '../../utils/apiError'
import { getToken } from '../../utils/authSession'
import { ROUTE_PATHS } from '../../routes/route.paths'
import { easeOut } from '../../constants/motion'

const RATING_LABELS: Record<number, string> = {
  1: 'Rất kém',
  2: 'Cần cải thiện',
  3: 'Bình thường',
  4: 'Hài lòng',
  5: 'Tuyệt vời'
}

const asReviewList = (value: unknown): ProductReview[] => (Array.isArray(value) ? value : [])

function Stars({ value, size = 14 }: { value: number; size?: number }) {
  return (
    <span className='inline-flex' aria-hidden>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={size} className={i <= Math.round(value) ? 'fill-peach-500 text-peach-500' : 'fill-ink-200 text-ink-200'} />
      ))}
    </span>
  )
}

export default function ProductDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const { data: product, isLoading: loading } = useProductDetail(id)
  const { addToCart, isAdding: adding } = useCartActions()
  const { isWishlisted, toggleWishlist } = useWishlist()
  const { data: related } = useProducts(1, 5, { sort: 'best_selling' })

  const [qty, setQty] = useState(1)
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [reviews, setReviews] = useState<ProductReview[]>([])
  const [reviewRating, setReviewRating] = useState(5)
  const [hoverRating, setHoverRating] = useState<number | null>(null)
  const [reviewComment, setReviewComment] = useState('')
  const [reviewLoading, setReviewLoading] = useState(false)

  const isFavorited = product ? isWishlisted(product._id) : false

  const images = useMemo(() => {
    const raw: string[] = []
    if (product?.thumbnail) raw.push(product.thumbnail)
    for (const item of product?.medias ?? []) {
      if (typeof item === 'string') raw.push(item)
      else if (item && typeof item.url === 'string') raw.push(item.url)
    }
    return Array.from(new Set(raw.filter(Boolean))).map((url) => formatImageUrl(url))
  }, [product])

  const activeImage = images[activeImageIndex] ?? images[0]
  const isOutOfStock = !product || product.quantity <= 0
  const isOverStock = Boolean(product && product.quantity > 0 && qty > product.quantity)
  const canBuy = !isOutOfStock && !isOverStock

  const reviewStats = useMemo(() => {
    const counts = [0, 0, 0, 0, 0]
    reviews.forEach((r) => {
      const n = Math.min(5, Math.max(1, Math.round(r.rating)))
      counts[n - 1] += 1
    })
    const avg = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0
    return { counts, avg }
  }, [reviews])

  const handleAddToCart = useCallback(() => {
    if (!product || !canBuy) return
    addToCart({ product_id: product._id, quantity: qty })
  }, [product, canBuy, addToCart, qty])

  const handleBuyNow = useCallback(() => {
    if (!product || !canBuy) return
    navigate(ROUTE_PATHS.USER_CHECKOUT, {
      state: { guestItems: [{ _id: `guest-${product._id}`, cart_id: 'guest', quantity: qty, product_infor: product }] }
    })
  }, [navigate, canBuy, product, qty])

  useEffect(() => {
    if (!id) return
    let alive = true
    getProductReviewsApi(id)
      .then((res) => alive && setReviews(asReviewList(res.data.result)))
      .catch(() => alive && setReviews([]))
    return () => {
      alive = false
    }
  }, [id])

  const handleSubmitReview = useCallback(async () => {
    if (!id || !product || !getToken() || !reviewComment.trim()) return
    try {
      setReviewLoading(true)
      await createProductReviewApi(id, { rating: reviewRating, comment: reviewComment.trim() })
      setReviewComment('')
      const res = await getProductReviewsApi(id)
      setReviews(asReviewList(res.data.result))
      toast.success('Cảm ơn bạn đã đánh giá!')
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Không thể gửi đánh giá'))
    } finally {
      setReviewLoading(false)
    }
  }, [id, product, reviewComment, reviewRating])

  if (loading) {
    return (
      <div className='mx-auto max-w-[1320px] px-4 py-8 md:px-6'>
        <div className='grid gap-10 lg:grid-cols-[1.15fr_1fr]'>
          <div className='aspect-square animate-pulse rounded-4xl bg-ink-100' />
          <div className='space-y-4 pt-4'>
            <div className='h-4 w-24 animate-pulse rounded-full bg-ink-100' />
            <div className='h-12 w-4/5 animate-pulse rounded-2xl bg-ink-100' />
            <div className='h-10 w-40 animate-pulse rounded-2xl bg-ink-100' />
            <div className='h-32 w-full animate-pulse rounded-3xl bg-ink-100' />
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className='mx-auto max-w-2xl px-4 py-16'>
        <Alert variant='error' title='Không tìm thấy sản phẩm' desc='Sản phẩm có thể đã ngừng bán hoặc đường dẫn không đúng.' />
        <Link to={ROUTE_PATHS.USER_HOME} className='mt-6 inline-flex font-semibold text-berry-600 hover:underline'>
          ← Về trang chủ
        </Link>
      </div>
    )
  }

  const activeStarCount = hoverRating ?? reviewRating
  const relatedProducts = (related?.products ?? []).filter((p) => p._id !== product._id).slice(0, 4)
  const specs = [
    product.origin && { label: 'Xuất xứ', value: product.origin },
    product.volume && { label: 'Dung tích', value: `${product.volume} ml` },
    product.weight && { label: 'Trọng lượng', value: `${product.weight} g` },
    { label: 'Đã bán', value: String(product.soldNumber ?? 0) }
  ].filter(Boolean) as Array<{ label: string; value: string }>

  return (
    <div className='mx-auto max-w-[1320px] px-4 pb-10 pt-6 md:px-6'>
      <nav aria-label='Breadcrumb' className='flex items-center gap-1.5 text-sm text-ink-500'>
        <Link to={ROUTE_PATHS.USER_HOME} className='hover:text-ink-950'>
          Trang chủ
        </Link>
        <ChevronRight size={14} aria-hidden />
        <a href={`${ROUTE_PATHS.USER_HOME}#shop`} className='hover:text-ink-950'>
          Cửa hàng
        </a>
        <ChevronRight size={14} aria-hidden />
        <span className='truncate text-ink-950' aria-current='page'>
          {product.name}
        </span>
      </nav>

      <div className='mt-6 grid gap-8 lg:grid-cols-[1.15fr_1fr] lg:gap-14'>
        {/* gallery */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: easeOut }}
          className='flex flex-col-reverse gap-3 md:flex-row'
        >
          {images.length > 1 ? (
            <div className='no-scrollbar flex gap-2 overflow-x-auto md:max-h-[640px] md:w-20 md:flex-col md:overflow-y-auto'>
              {images.map((url, index) => (
                <button
                  key={`${url}-${index}`}
                  type='button'
                  onClick={() => setActiveImageIndex(index)}
                  aria-label={`Xem ảnh ${index + 1}`}
                  aria-pressed={activeImageIndex === index}
                  className={cn(
                    'h-20 w-20 shrink-0 cursor-pointer overflow-hidden rounded-2xl bg-berry-50 ring-2 transition',
                    activeImageIndex === index ? 'ring-berry-500' : 'ring-transparent opacity-60 hover:opacity-100'
                  )}
                >
                  <img src={url} alt='' referrerPolicy='no-referrer' className='h-full w-full object-cover mix-blend-multiply' loading='lazy' />
                </button>
              ))}
            </div>
          ) : null}
          <div className='relative flex-1 overflow-hidden rounded-4xl bg-berry-50'>
            <div className='aspect-square'>
              {activeImage ? (
                <img
                  key={activeImage}
                  src={activeImage}
                  alt={product.name}
                  referrerPolicy='no-referrer'
                  className='h-full w-full object-contain p-8 mix-blend-multiply animate-soft-pop md:p-14'
                />
              ) : (
                <div className='grid h-full place-items-center text-sm text-ink-500'>Chưa có ảnh</div>
              )}
            </div>
            {(product.soldNumber ?? 0) >= 10 ? (
              <span className='chip absolute left-4 top-4 bg-berry-600 text-white'>Bán chạy</span>
            ) : null}
          </div>
        </motion.div>

        {/* info */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.06, ease: easeOut }}
          className='lg:sticky lg:top-36 lg:self-start'
        >
          <p className='eyebrow'>{product.origin || 'Chính hãng'}</p>
          <h1 className='mt-3 font-display text-3xl font-bold leading-[1.1] text-ink-950 md:text-[2.75rem]'>{product.name}</h1>

          <a href='#reviews' className='mt-4 inline-flex items-center gap-2 text-sm text-ink-600 hover:text-ink-950'>
            <Stars value={product.rating_number || reviewStats.avg} />
            <span className='font-semibold text-ink-950'>{(product.rating_number || reviewStats.avg || 0).toFixed(1)}</span>
            <span>· {reviews.length} đánh giá</span>
          </a>

          <div className='mt-6 flex items-end gap-3'>
            <span className='font-display text-4xl font-bold text-ink-950'>{money(product.price)}</span>
            <span className={cn('chip mb-1', isOutOfStock ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-800')}>
              <span className={cn('h-1.5 w-1.5 rounded-full', isOutOfStock ? 'bg-rose-500' : 'bg-emerald-500')} aria-hidden />
              {isOutOfStock ? 'Hết hàng' : product.quantity <= 5 ? `Chỉ còn ${product.quantity}` : 'Còn hàng'}
            </span>
          </div>

          {isOverStock ? <Alert className='mt-5' variant='warning' title='Vượt tồn kho' desc={`Chỉ còn ${product.quantity} sản phẩm.`} /> : null}

          {!isOutOfStock ? (
            <div className='mt-8'>
              <span className='field-label'>Số lượng</span>
              <div className='inline-flex h-12 items-center rounded-lg border border-ink-200 bg-white px-1'>
                <button
                  type='button'
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  disabled={qty <= 1}
                  className='grid h-10 w-10 cursor-pointer place-items-center rounded-full hover:bg-ink-100 disabled:opacity-30'
                  aria-label='Giảm số lượng'
                >
                  <Minus size={16} />
                </button>
                <span className='w-10 text-center font-semibold' aria-live='polite'>
                  {qty}
                </span>
                <button
                  type='button'
                  onClick={() => setQty((q) => Math.min(product.quantity, q + 1))}
                  disabled={qty >= product.quantity}
                  className='grid h-10 w-10 cursor-pointer place-items-center rounded-full hover:bg-ink-100 disabled:opacity-30'
                  aria-label='Tăng số lượng'
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
          ) : null}

          <div className='mt-6 hidden gap-3 sm:flex'>
            <Button variant='accent' size='lg' className='flex-1' disabled={!canBuy} onClick={handleBuyNow}>
              <Zap size={18} /> Mua ngay
            </Button>
            <Button variant='primary' size='lg' className='flex-1' disabled={!canBuy} loading={adding} onClick={handleAddToCart}>
              <ShoppingBag size={18} /> Thêm vào giỏ
            </Button>
            <button
              type='button'
              onClick={() => toggleWishlist(product)}
              aria-label={isFavorited ? 'Bỏ yêu thích' : 'Lưu vào yêu thích'}
              aria-pressed={isFavorited}
              className={cn(
                'grid h-[3.25rem] w-[3.25rem] shrink-0 cursor-pointer place-items-center rounded-full border transition',
                isFavorited ? 'border-berry-300 bg-berry-50 text-berry-600' : 'border-ink-200 text-ink-700 hover:border-berry-300'
              )}
            >
              <Heart size={20} className={cn(isFavorited && 'fill-current')} />
            </button>
          </div>

          <dl className='mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-3xl bg-ink-100 ring-1 ring-ink-100'>
            {specs.map((s) => (
              <div key={s.label} className='bg-white p-4'>
                <dt className='text-xs text-ink-500'>{s.label}</dt>
                <dd className='mt-0.5 font-semibold text-ink-950'>{s.value}</dd>
              </div>
            ))}
          </dl>

          <div className='mt-4 flex items-center gap-3 rounded-3xl bg-lilac-50 p-4 text-sm text-ink-700'>
            <Package size={20} className='shrink-0 text-lilac-700' aria-hidden />
            Phí vận chuyển được tính chính xác theo địa chỉ ở bước thanh toán.
          </div>
        </motion.div>
      </div>

      {/* description */}
      {product.description ? (
        <section className='mt-16 grid gap-6 border-t border-ink-100 pt-10 lg:grid-cols-[280px_1fr]'>
          <h2 className='font-display text-2xl font-bold'>Mô tả sản phẩm</h2>
          <div className='max-w-3xl space-y-4 text-[15px] leading-relaxed text-ink-700'>
            {product.description.split('\n').filter(Boolean).map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </section>
      ) : null}

      {/* reviews */}
      <section id='reviews' className='mt-16 scroll-mt-36 grid gap-10 border-t border-ink-100 pt-10 lg:grid-cols-[280px_1fr]'>
        <div>
          <h2 className='font-display text-2xl font-bold'>Đánh giá</h2>
          <div className='mt-4 flex items-end gap-2'>
            <span className='font-display text-6xl font-bold leading-none'>{reviewStats.avg ? reviewStats.avg.toFixed(1) : '–'}</span>
            <span className='pb-1 text-sm text-ink-500'>/ 5</span>
          </div>
          <div className='mt-2'>
            <Stars value={reviewStats.avg} size={16} />
          </div>
          <p className='mt-1 text-sm text-ink-500'>{reviews.length} đánh giá</p>
          <div className='mt-5 space-y-1.5'>
            {[5, 4, 3, 2, 1].map((n) => {
              const count = reviewStats.counts[n - 1]
              const pct = reviews.length ? (count / reviews.length) * 100 : 0
              return (
                <div key={n} className='flex items-center gap-2 text-xs text-ink-600'>
                  <span className='w-3'>{n}</span>
                  <div className='h-2 flex-1 overflow-hidden rounded-full bg-ink-100'>
                    <div className='h-full rounded-full bg-peach-500' style={{ width: `${pct}%` }} />
                  </div>
                  <span className='w-6 text-right'>{count}</span>
                </div>
              )
            })}
          </div>
        </div>

        <div className='grid gap-6 xl:grid-cols-[1fr_360px]'>
          <div className='space-y-3'>
            {reviews.length === 0 ? (
              <div className='flex flex-col items-center rounded-3xl border border-dashed border-ink-200 p-10 text-center'>
                <MessageSquareText size={28} className='text-ink-300' aria-hidden />
                <p className='mt-3 font-semibold'>Chưa có đánh giá</p>
                <p className='mt-1 text-sm text-ink-500'>Hãy là người đầu tiên chia sẻ trải nghiệm.</p>
              </div>
            ) : (
              reviews.map((review) => (
                <article key={review._id} className='rounded-3xl bg-white p-5 ring-1 ring-ink-100'>
                  <div className='flex items-center gap-3'>
                    <span aria-hidden className='grid h-10 w-10 place-items-center rounded-full bg-berry-100 font-display font-bold text-berry-700'>
                      {(review.customer_name || '?').charAt(0).toUpperCase()}
                    </span>
                    <div className='min-w-0 flex-1'>
                      <p className='truncate font-semibold'>{review.customer_name}</p>
                      <Stars value={review.rating} size={12} />
                      <span className='sr-only'>{review.rating} trên 5 sao</span>
                    </div>
                  </div>
                  <p className='mt-3 text-sm leading-relaxed text-ink-700'>{review.comment}</p>
                </article>
              ))
            )}
          </div>

          <div className='h-fit rounded-3xl border border-berry-100 bg-berry-50 p-6 text-ink-950'>
            <h3 className='font-display text-xl font-bold'>Viết đánh giá</h3>
            {getToken() ? (
              <div className='mt-4 space-y-4'>
                <fieldset>
                  <legend className='text-sm text-ink-600'>Bạn chấm mấy sao?</legend>
                  <div className='mt-2 flex items-center gap-1' onMouseLeave={() => setHoverRating(null)}>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        type='button'
                        onClick={() => setReviewRating(n)}
                        onMouseEnter={() => setHoverRating(n)}
                        aria-label={`${n} sao – ${RATING_LABELS[n]}`}
                        aria-pressed={reviewRating === n}
                        className='cursor-pointer p-1 transition hover:scale-110'
                      >
                        <Star size={26} className={n <= activeStarCount ? 'fill-peach-500 text-peach-500' : 'fill-ink-200 text-ink-200'} />
                      </button>
                    ))}
                    <span className='ml-2 text-sm font-semibold text-peach-700'>{RATING_LABELS[activeStarCount]}</span>
                  </div>
                </fieldset>
                <label className='block'>
                  <span className='text-sm text-ink-600'>Cảm nhận của bạn</span>
                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    rows={4}
                    maxLength={1000}
                    placeholder='Kết cấu, mùi hương, hiệu quả sau khi dùng…'
                    className='mt-2 w-full rounded-2xl border border-ink-200 bg-ink-50 p-3.5 text-sm text-ink-950 outline-none placeholder:text-ink-400 focus:border-berry-500'
                  />
                </label>
                <Button variant='accent' full loading={reviewLoading} disabled={!reviewComment.trim()} onClick={handleSubmitReview}>
                  Gửi đánh giá
                </Button>
              </div>
            ) : (
              <p className='mt-3 text-sm leading-relaxed text-ink-600'>
                <Link to={ROUTE_PATHS.AUTH_LOGIN} className='font-semibold text-emerald-700 hover:underline'>
                  Đăng nhập
                </Link>{' '}
                để chia sẻ trải nghiệm về sản phẩm này.
              </p>
            )}
          </div>
        </div>
      </section>

      {relatedProducts.length ? (
        <section className='mt-16 border-t border-ink-100 pt-10'>
          <h2 className='font-display text-2xl font-bold md:text-3xl'>Có thể bạn cũng thích</h2>
          <div className='mt-6 grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-4 md:gap-x-5'>
            {relatedProducts.map((p, i) => (
              <ProductCard key={p._id} product={p} tint={CARD_TINTS[i % CARD_TINTS.length]} />
            ))}
          </div>
        </section>
      ) : null}

      {/* mobile sticky buy bar (sits above the dock) */}
      <div className='fixed inset-x-3 bottom-[5.25rem] z-40 flex gap-2 rounded-full bg-white p-1.5 shadow-lift ring-1 ring-ink-100 sm:hidden'>
        <button
          type='button'
          onClick={() => toggleWishlist(product)}
          aria-label={isFavorited ? 'Bỏ yêu thích' : 'Lưu vào yêu thích'}
          aria-pressed={isFavorited}
          className={cn('grid h-12 w-12 shrink-0 cursor-pointer place-items-center rounded-full', isFavorited ? 'text-berry-600' : 'text-ink-700')}
        >
          <Heart size={20} className={cn(isFavorited && 'fill-current')} />
        </button>
        <Button variant='primary' className='flex-1' disabled={!canBuy} loading={adding} onClick={handleAddToCart}>
          Thêm giỏ
        </Button>
        <Button variant='accent' className='flex-1' disabled={!canBuy} onClick={handleBuyNow}>
          Mua ngay
        </Button>
      </div>
    </div>
  )
}
