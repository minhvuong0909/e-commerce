import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Heart,
  Minus,
  Plus,
  ShoppingBag,
  Star
} from 'lucide-react'
import Alert from '../../components/ui/Alert'
import { useProductDetail } from '../../hooks/useProductDetail'
import { useCartActions } from '../../hooks/useCartActions'
import { useWishlist } from '../../hooks/useWishlist'
import cn from '../../utils/cn'
import money from '../../utils/money'
import { formatImageUrl } from '../../utils/formatImageUrl'
import { createProductReviewApi, getProductReviewsApi, type ProductReview } from '../../services/reviews.services'
import { getApiErrorMessage } from '../../utils/apiError'
import { getToken } from '../../utils/authSession'
import { ROUTE_PATHS } from '../../routes/route.paths'

const RATING_LABELS: Record<number, string> = {
  1: 'Rất kém',
  2: 'Cần cải thiện',
  3: 'Bình thường',
  4: 'Hài lòng',
  5: 'Tuyệt vời'
}

export default function ProductDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const { data: product, isLoading: loading } = useProductDetail(id)
  const { addToCart, isAdding: adding } = useCartActions()
  const { isWishlisted, toggleWishlist } = useWishlist()

  const [qty, setQty] = useState(1)
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [reviews, setReviews] = useState<ProductReview[]>([])
  const [reviewRating, setReviewRating] = useState(5)
  const [hoverRating, setHoverRating] = useState<number | null>(null)
  const [reviewComment, setReviewComment] = useState('')
  const [reviewLoading, setReviewLoading] = useState(false)

  const isFavorited = useMemo(() => (product ? isWishlisted(product._id) : false), [product, isWishlisted])

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
  const isOutOfStock = !product || product.quantity <= 0
  const isOverStock = Boolean(product && product.quantity > 0 && qty > product.quantity)

  const handleAddToCart = useCallback(() => {
    if (!product || isOutOfStock || isOverStock) return
    addToCart({
      product_id: product._id,
      quantity: qty
    })
  }, [product, isOutOfStock, isOverStock, addToCart, qty])

  const handleBuyNow = useCallback(() => {
    if (!product || isOutOfStock || isOverStock) return
    navigate(ROUTE_PATHS.USER_CHECKOUT, {
      state: {
        guestItems: [
          {
            _id: `guest-${product._id}`,
            cart_id: 'guest',
            quantity: qty,
            product_infor: product
          }
        ]
      }
    })
  }, [navigate, isOutOfStock, isOverStock, product, qty])

  useEffect(() => {
    if (!id) return
    let isSubscribed = true
    getProductReviewsApi(id)
      .then((res) => {
        if (isSubscribed) setReviews(res.data.result || [])
      })
      .catch(() => {
        if (isSubscribed) setReviews([])
      })
    return () => {
      isSubscribed = false
    }
  }, [id])

  const handleSubmitReview = useCallback(async () => {
    if (!id || !product) return
    if (!getToken()) return
    if (!reviewComment.trim()) return
    try {
      setReviewLoading(true)
      await createProductReviewApi(id, { rating: reviewRating, comment: reviewComment.trim() })
      setReviewComment('')
      const res = await getProductReviewsApi(id)
      setReviews(res.data.result || [])
    } catch (err) {
      alert(getApiErrorMessage(err, 'Không thể gửi đánh giá'))
    } finally {
      setReviewLoading(false)
    }
  }, [id, product, reviewComment, reviewRating])

  const inc = useCallback(() => {
    setQty((q) => (product ? Math.min(product.quantity, q + 1) : q))
  }, [product])

  const dec = useCallback(() => {
    setQty((q) => Math.max(1, q - 1))
  }, [])

  if (loading) {
    return (
      <div className='mx-auto max-w-7xl px-4 py-8 md:px-6'>
        <div className='grid gap-8 lg:grid-cols-2'>
          <div className='aspect-square animate-pulse rounded-3xl bg-[#F5EFE6]' />
          <div className='space-y-4'>
            <div className='h-8 w-3/4 animate-pulse rounded-xl bg-[#F5EFE6]' />
            <div className='h-5 w-1/2 animate-pulse rounded-xl bg-[#F5EFE6]' />
            <div className='h-16 w-48 animate-pulse rounded-2xl bg-[#F5EFE6]' />
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

  const activeStarCount = hoverRating ?? reviewRating

  return (
    <div className='mx-auto max-w-7xl px-4 py-8 md:px-6 bg-[#FAF7F2] text-[#2B2118] min-h-screen'>
      {/* Back navigation */}
      <Link
        to='/user/home'
        className='mb-6 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#8C7D70] transition hover:text-[#2B2118]'
      >
        <ArrowLeft size={16} />
        Quay lại trang chủ
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className='grid gap-8 lg:grid-cols-2'
      >
        {/* Left Column: Product Image Gallery */}
        <div className='space-y-4'>
          <div className='relative overflow-hidden rounded-3xl border border-[#EFECE6] bg-white shadow-soft'>
            <div className='aspect-square overflow-hidden bg-[#F5EFE6]/40 p-6 flex items-center justify-center'>
              {activeImage ? (
                <img
                  src={activeImage}
                  alt={product.name}
                  referrerPolicy='no-referrer'
                  className='h-full w-full object-contain transition duration-500 hover:scale-105'
                  loading='eager'
                  decoding='async'
                />
              ) : (
                <div className='grid h-full place-items-center text-sm font-medium text-[#8C7D70]'>Chưa có ảnh</div>
              )}
            </div>

            {/* Favorite toggle badge on main image */}
            <button
              type='button'
              onClick={() => toggleWishlist(product)}
              className={cn(
                'absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full border border-[#EFECE6] bg-white/95 text-[#594D42] shadow-md transition hover:border-rose-300',
                isFavorited && 'border-rose-200 bg-rose-50 text-rose-600'
              )}
              aria-label={isFavorited ? 'Bỏ yêu thích' : 'Thêm vào yêu thích'}
            >
              <Heart size={18} className={cn(isFavorited && 'fill-current')} />
            </button>
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
                    'h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-2 transition-all',
                    activeImageIndex === index
                      ? 'border-[#2B2118] ring-2 ring-[#2B2118]/15'
                      : 'border-[#EFECE6] opacity-70 hover:opacity-100'
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
        </div>

        {/* Right Column: Product Info & Actions */}
        <div className='lg:sticky lg:top-28 lg:self-start'>
          <div className='rounded-3xl border border-[#EFECE6] bg-white p-6 shadow-soft md:p-8'>
            {/* Tags & Rating */}
            <div className='flex flex-wrap items-center gap-2'>
              {product.rating_number ? (
                <span className='inline-flex items-center gap-1 rounded-full bg-[#FAF7F2] border border-[#EFECE6] px-3 py-1 text-xs font-bold text-[#2B2118]'>
                  <Star size={13} className='fill-amber-400 text-amber-400' />
                  {Number(product.rating_number).toFixed(1)}
                </span>
              ) : null}
              {product.origin ? (
                <span className='rounded-full bg-[#F5EFE6] px-3 py-1 text-xs font-semibold text-[#8C7D70]'>
                  Xuất xứ: {product.origin}
                </span>
              ) : null}
            </div>

            {/* Title */}
            <h1 className='mt-4 font-display text-2xl font-extrabold leading-snug text-[#2B2118] md:text-3xl'>{product.name}</h1>

            {/* Price Box */}
            <div className='mt-5 rounded-2xl border border-[#EFECE6] bg-[#FAF7F2] p-5 shadow-xs'>
              <p className='text-xs font-bold uppercase tracking-wider text-[#8C7D70]'>Giá Niêm Yết</p>
              <p className='mt-1 text-3xl font-extrabold text-[#C47A5A]'>{money(product.price)}</p>
            </div>

            {/* Specifications Quick Info - ONLY REAL DATA */}
            <div className='mt-5 grid grid-cols-2 gap-2 text-xs font-semibold text-[#594D42] sm:grid-cols-3'>
              <div className='rounded-xl border border-[#EFECE6] bg-[#FAF7F2] px-3.5 py-2.5'>
                <span className='text-[#8C7D70]'>Tình trạng:</span>{' '}
                {isOutOfStock ? (
                  <span className='font-bold text-rose-600'>Hết hàng</span>
                ) : (
                  <span className='font-bold text-emerald-600'>Còn {product.quantity} sp</span>
                )}
              </div>
              {product.volume ? (
                <div className='rounded-xl border border-[#EFECE6] bg-[#FAF7F2] px-3.5 py-2.5'>
                  <span className='text-[#8C7D70]'>Dung tích:</span> {product.volume} ml
                </div>
              ) : null}
              {product.weight ? (
                <div className='rounded-xl border border-[#EFECE6] bg-[#FAF7F2] px-3.5 py-2.5'>
                  <span className='text-[#8C7D70]'>Trọng lượng:</span> {product.weight} g
                </div>
              ) : null}
              {product.soldNumber !== undefined && product.soldNumber > 0 ? (
                <div className='rounded-xl border border-[#EFECE6] bg-[#FAF7F2] px-3.5 py-2.5'>
                  <span className='text-[#8C7D70]'>Đã bán:</span> {product.soldNumber}
                </div>
              ) : null}
            </div>

            {/* Warnings */}
            {(isOutOfStock || isOverStock) && (
              <div className='mt-4'>
                <Alert
                  variant='warning'
                  title={isOutOfStock ? 'Hết hàng' : 'Vượt tồn kho'}
                  desc={isOutOfStock ? 'Sản phẩm hiện đã hết hàng.' : 'Vui lòng giảm số lượng đặt mua.'}
                />
              </div>
            )}

            {/* Quantity Selector */}
            {!isOutOfStock && (
              <div className='mt-6 flex items-center justify-between gap-4 border-t border-[#EFECE6] pt-5'>
                <div>
                  <p className='font-display text-sm font-bold text-[#2B2118]'>Số lượng</p>
                  <p className='mt-0.5 text-xs text-[#8C7D70]'>Chọn số lượng cần mua</p>
                </div>

                <div className='flex items-center rounded-full border border-[#EFECE6] bg-[#FAF7F2] p-1 shadow-xs'>
                  <button
                    type='button'
                    onClick={dec}
                    disabled={qty <= 1}
                    className='grid h-9 w-9 place-items-center rounded-full text-[#2B2118] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40'
                    aria-label='Giảm số lượng'
                  >
                    <Minus size={15} />
                  </button>
                  <span className='w-10 text-center text-sm font-bold text-[#2B2118]'>{qty}</span>
                  <button
                    type='button'
                    onClick={inc}
                    disabled={qty >= product.quantity}
                    className='grid h-9 w-9 place-items-center rounded-full text-[#2B2118] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40'
                    aria-label='Tăng số lượng'
                  >
                    <Plus size={15} />
                  </button>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className='mt-6 grid grid-cols-[1fr_auto] gap-3'>
              <button
                type='button'
                onClick={handleBuyNow}
                disabled={isOutOfStock || isOverStock}
                className='col-span-2 inline-flex min-h-13 items-center justify-center gap-2 rounded-full bg-[#2B2118] px-6 text-sm font-bold uppercase tracking-wider text-white shadow-md transition duration-200 hover:bg-[#9A8069] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50'
              >
                Mua Ngay
              </button>

              <button
                type='button'
                disabled={isOutOfStock || isOverStock || adding}
                onClick={handleAddToCart}
                className='inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-full border-2 border-[#2B2118] bg-white px-6 text-xs font-bold uppercase tracking-wider text-[#2B2118] shadow-xs transition hover:bg-[#FAF7F2] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50'
              >
                <ShoppingBag size={18} />
                <span>{adding ? 'Đang thêm...' : 'Thêm vào giỏ'}</span>
              </button>

              <button
                type='button'
                onClick={() => toggleWishlist(product)}
                aria-label={isFavorited ? 'Bỏ yêu thích' : 'Lưu vào yêu thích'}
                aria-pressed={isFavorited}
                className={cn(
                  'inline-flex h-12 w-12 items-center justify-center rounded-full border-2 border-[#EFECE6] bg-white text-[#594D42] shadow-xs transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600',
                  isFavorited && 'border-rose-300 bg-rose-50 text-rose-600'
                )}
              >
                <Heart size={18} className={cn(isFavorited && 'fill-current')} />
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Description - Only show when actual description exists */}
      {product.description ? (
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.35 }}
          className='mt-10 rounded-3xl border border-[#EFECE6] bg-white p-6 shadow-soft md:p-8'
        >
          <span className='text-xs font-bold uppercase tracking-wider text-[#9A8069]'>Mô tả sản phẩm</span>
          <h2 className='mt-1 font-display text-2xl font-extrabold text-[#2B2118]'>Thông Tin Chi Tiết</h2>
          <div className='mt-4 max-w-4xl space-y-3 text-sm leading-relaxed text-[#594D42] md:text-base'>
            {product.description.split('\n').map((paragraph, idx) => (
              <p key={idx}>{paragraph}</p>
            ))}
          </div>
        </motion.section>
      ) : null}

      {/* Interactive Review Section */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.16, duration: 0.35 }}
        className='mt-8 rounded-3xl border border-[#EFECE6] bg-white p-6 shadow-soft md:p-8'
      >
        <span className='text-xs font-bold uppercase tracking-wider text-[#9A8069]'>Đánh giá</span>
        <div className='mt-2 flex flex-col gap-3 md:flex-row md:items-end md:justify-between'>
          <div>
            <h2 className='font-display text-2xl font-extrabold text-[#2B2118]'>Nhận Xét &amp; Đánh Giá</h2>
            <p className='mt-1 text-xs text-[#8C7D70]'>{reviews.length} nhận xét</p>
          </div>
          {product.rating_number ? (
            <div className='inline-flex items-center gap-1 rounded-full bg-[#FAF7F2] border border-[#EFECE6] px-4 py-1.5 text-sm font-bold text-[#2B2118]'>
              <Star size={15} className='fill-amber-400 text-amber-400' />
              {Number(product.rating_number).toFixed(1)}
            </div>
          ) : null}
        </div>

        <div className='mt-6 grid gap-6 lg:grid-cols-[1fr_380px]'>
          <div className='space-y-3'>
            {reviews.length === 0 ? (
              <div className='rounded-2xl border border-dashed border-[#EFECE6] p-8 text-sm font-medium text-[#8C7D70] text-center bg-[#FAF7F2]'>
                Chưa có đánh giá nào cho sản phẩm này.
              </div>
            ) : (
              reviews.map((review) => (
                <article key={review._id} className='rounded-2xl border border-[#EFECE6] bg-[#FAF7F2] p-5 shadow-xs'>
                  <div className='flex items-center justify-between gap-3'>
                    <p className='font-display font-bold text-[#2B2118]'>{review.customer_name}</p>
                    <span className='inline-flex items-center gap-1 text-xs font-bold text-amber-600 bg-white border border-[#EFECE6] px-3 py-1 rounded-full'>
                      <Star size={13} className='fill-amber-400 text-amber-400' />
                      {review.rating} / 5
                    </span>
                  </div>
                  <p className='mt-2 text-xs leading-relaxed text-[#594D42]'>{review.comment}</p>
                </article>
              ))
            )}
          </div>

          {/* Review Form */}
          <div className='rounded-2xl border border-[#EFECE6] bg-[#FAF7F2] p-6 shadow-xs'>
            <h3 className='font-display font-bold text-[#2B2118] text-base mb-4'>Gửi nhận xét của bạn</h3>
            {getToken() ? (
              <div className='space-y-4'>
                <div>
                  <label className='block text-xs font-bold text-[#594D42] mb-2 uppercase tracking-wider'>Đánh giá chất lượng</label>
                  <div className='flex items-center gap-2'>
                    <div className='flex items-center gap-1'>
                      {[1, 2, 3, 4, 5].map((starIndex) => (
                        <button
                          key={starIndex}
                          type='button'
                          onClick={() => setReviewRating(starIndex)}
                          onMouseEnter={() => setHoverRating(starIndex)}
                          onMouseLeave={() => setHoverRating(null)}
                          className='p-1 transition duration-150 transform hover:scale-110'
                        >
                          <Star
                            size={24}
                            className={cn(
                              starIndex <= activeStarCount
                                ? 'fill-amber-400 text-amber-400'
                                : 'fill-[#E8DDD8] text-[#E8DDD8]'
                            )}
                          />
                        </button>
                      ))}
                    </div>
                    <span className='text-xs font-bold text-[#9A8069] ml-1'>
                      {RATING_LABELS[activeStarCount]} ({activeStarCount} sao)
                    </span>
                  </div>
                </div>

                <div>
                  <label className='block text-xs font-bold text-[#594D42] mb-2 uppercase tracking-wider'>Nội dung nhận xét</label>
                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    rows={4}
                    placeholder='Chia sẻ trải nghiệm và cảm nhận của bạn về sản phẩm...'
                    className='w-full rounded-xl border border-[#EFECE6] bg-white p-3.5 text-xs text-[#2B2118] outline-none transition focus:border-[#9A8069] focus:ring-2 focus:ring-[#9A8069]/20'
                  />
                </div>

                <button
                  type='button'
                  onClick={handleSubmitReview}
                  disabled={reviewLoading || !reviewComment.trim()}
                  className='h-11 w-full rounded-full bg-[#2B2118] text-xs font-bold uppercase tracking-widest text-white shadow-md transition hover:bg-[#9A8069] disabled:opacity-50'
                >
                  {reviewLoading ? 'Đang gửi...' : 'Gửi Đánh Giá Ngay'}
                </button>
              </div>
            ) : (
              <div className='text-xs leading-relaxed text-[#594D42]'>
                Bạn cần{' '}
                <Link to={ROUTE_PATHS.AUTH_LOGIN} className='font-bold text-[#9A8069] hover:underline'>
                  Đăng nhập
                </Link>{' '}
                để viết đánh giá sản phẩm này.
              </div>
            )}
          </div>
        </div>
      </motion.section>
    </div>
  )
}
