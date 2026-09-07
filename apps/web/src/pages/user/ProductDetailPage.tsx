import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
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

  const isFavorited = product ? isWishlisted(product._id) : false

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
  const outOfStock = product ? product.quantity <= 0 : false
  const overStock = product ? qty > product.quantity : false

  const variantChips = useMemo(() => {
    if (!product) return []
    const volume = product.volume ? `${product.volume}ml` : 'Full size'
    return [volume]
  }, [product])
  const [selectedVariant, setSelectedVariant] = useState(() => variantChips[0] || '')
  if (variantChips.length > 0 && !selectedVariant) {
    setSelectedVariant(variantChips[0])
  }

  const handleAddToCart = useCallback(() => {
    if (!product) return
    addToCart({
      product_id: product._id,
      quantity: qty
    })
  }, [product, qty, addToCart])

  const handleBuyNow = useCallback(() => {
    if (!product || outOfStock || overStock) return
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
  }, [navigate, outOfStock, overStock, product, qty])

  useEffect(() => {
    if (!id) return
    getProductReviewsApi(id)
      .then((res) => setReviews(res.data.result || []))
      .catch(() => setReviews([]))
  }, [id])

  const handleSubmitReview = async () => {
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
  }

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

  const activeStarCount = hoverRating ?? reviewRating

  return (
    <div className='mx-auto max-w-7xl px-4 py-8 md:px-6 [--home-blush:#fdf2f0]'>
      {/* Back navigation */}
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
        className='grid gap-8 lg:grid-cols-2'
      >
        {/* Left Column: Product Image Gallery (Aspect Square 1:1) */}
        <div className='space-y-4'>
          <div className='relative overflow-hidden rounded-3xl border border-[#eaded8] bg-white shadow-xs'>
            <div className='aspect-square overflow-hidden bg-[#fdf2f0]/30 p-6 flex items-center justify-center'>
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
                <div className='grid h-full place-items-center text-sm font-medium text-[#8a7a74]'>Chưa có ảnh</div>
              )}
            </div>

            <span className='absolute left-4 top-4 rounded-full border border-[#eaded8] bg-white/95 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-[#8a726c] shadow-xs backdrop-blur-md'>
              Chính hãng 100%
            </span>

            {/* Favorite toggle badge on main image */}
            <button
              type='button'
              onClick={() => toggleWishlist(product)}
              className={cn(
                'absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full border border-[#eaded8] bg-white/95 text-[#6b5f59] shadow-md transition hover:border-rose-300',
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
                    'h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-2 transition',
                    activeImageIndex === index
                      ? 'border-[#2B2118] ring-2 ring-[#2B2118]/15'
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

        {/* Right Column: Product Info & Actions */}
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
            <h1 className='mt-3.5 text-2xl font-bold leading-snug text-[#2B2118] md:text-3xl'>{product.name}</h1>

            {/* Price Box */}
            <div className='mt-5 rounded-2xl border border-[#eaded8] bg-[#fdf2f0]/60 p-4'>
              <p className='text-xs font-bold uppercase tracking-wider text-[#8a726c]'>Giá bán</p>
              <p className='mt-1 text-3xl font-black text-[#C85A32]'>{money(product.price)}</p>
            </div>

            {/* Specifications Quick Info (Removed duplicate Volume/Dung tich) */}
            <div className='mt-5 grid grid-cols-2 gap-2 text-xs font-semibold text-[#5c504a] sm:grid-cols-3'>
              {product.weight ? (
                <div className='rounded-xl border border-[#eaded8]/80 bg-[#faf5f3] px-3 py-2'>
                  <span className='text-[#8a7a74]'>Trọng lượng:</span> {product.weight} g
                </div>
              ) : null}
              <div className='rounded-xl border border-[#eaded8]/80 bg-[#faf5f3] px-3 py-2'>
                <span className='text-[#8a7a74]'>Kho:</span>{' '}
                {outOfStock ? (
                  <span className='font-bold text-rose-600'>Hết hàng</span>
                ) : (
                  <span className='font-bold text-emerald-600'>Còn {product.quantity} sp</span>
                )}
              </div>
              {product.soldNumber !== undefined ? (
                <div className='rounded-xl border border-[#eaded8]/80 bg-[#faf5f3] px-3 py-2'>
                  <span className='text-[#8a7a74]'>Đã bán:</span> {product.soldNumber}
                </div>
              ) : null}
            </div>

            {/* Volume / Variant Selection */}
            <div className='mt-5'>
              <div className='flex items-center justify-between gap-3'>
                <p className='text-sm font-bold text-[#2B2118]'>Dung tích tùy chọn</p>
              </div>
              <div className='mt-2.5 flex flex-wrap gap-2'>
                {variantChips.map((chip) => (
                  <button
                    key={chip}
                    type='button'
                    onClick={() => setSelectedVariant(chip)}
                    className={cn(
                      'rounded-full border px-4 py-2 text-xs font-bold transition',
                      selectedVariant === chip
                        ? 'border-[#2B2118] bg-[#2B2118] text-white shadow-sm'
                        : 'border-[#eaded8] bg-white text-[#5c504a] hover:border-[#b07a72] hover:bg-[#fdf8f6]'
                    )}
                  >
                    {chip}
                  </button>
                ))}
              </div>
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
                <p className='text-sm font-bold text-[#2B2118]'>Số lượng</p>
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

            {/* Action Buttons */}
            <div className='mt-6 grid grid-cols-[1fr_auto] gap-3'>
              <button
                type='button'
                onClick={handleBuyNow}
                disabled={outOfStock || overStock}
                className='col-span-2 inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-[#2B2118] px-6 text-base font-bold text-white shadow-md transition duration-200 hover:-translate-y-0.5 hover:bg-[#433528] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50'
              >
                Mua ngay
              </button>

              {/* High-Contrast "Thêm vào giỏ" button */}
              <button
                type='button'
                disabled={outOfStock || overStock || adding}
                onClick={handleAddToCart}
                className='inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl border-2 border-[#2B2118] bg-white px-6 text-sm font-bold text-[#2B2118] shadow-xs transition hover:bg-[#FAF7F2] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50'
              >
                <ShoppingBag size={18} />
                <span>{adding ? 'Đang thêm...' : 'Thêm vào giỏ'}</span>
              </button>

              {/* Heart Wishlist button next to Add To Cart */}
              <button
                type='button'
                onClick={() => toggleWishlist(product)}
                aria-label={isFavorited ? 'Bỏ yêu thích' : 'Lưu vào yêu thích'}
                aria-pressed={isFavorited}
                className={cn(
                  'inline-flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-[#eaded8] bg-white text-[#6b5f59] shadow-xs transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600',
                  isFavorited && 'border-rose-300 bg-rose-50 text-rose-600'
                )}
              >
                <Heart size={18} className={cn(isFavorited && 'fill-current')} />
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Mobile Fixed Bottom Bar */}
      <div className='fixed inset-x-0 bottom-0 z-40 border-t border-[#eaded8] bg-white/95 px-4 py-3 shadow-[0_-10px_30px_rgba(61,51,48,0.08)] backdrop-blur md:hidden'>
        <div className='mx-auto flex max-w-7xl items-center gap-3'>
          <div className='min-w-0 flex-1'>
            <p className='truncate text-xs font-semibold text-[#8a7a74]'>{product.name}</p>
            <p className='text-base font-black text-[#C85A32]'>{money(product.price)}</p>
          </div>
          <button
            type='button'
            onClick={handleBuyNow}
            disabled={outOfStock || overStock}
            className='h-11 rounded-xl bg-[#2B2118] px-6 text-sm font-bold text-white shadow-md disabled:opacity-50'
          >
            Mua ngay
          </button>
        </div>
      </div>

      {/* Description */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.35 }}
        className='mt-10 rounded-3xl border border-[#eaded8] bg-white/80 p-6 shadow-xs backdrop-blur-xs md:p-8'
      >
        <span className='text-xs font-bold uppercase tracking-wider text-[#8a726c]'>Mô tả & Công dụng</span>
        <h2 className='mt-1 text-2xl font-bold text-[#2B2118]'>Thông tin chi tiết sản phẩm</h2>
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

      {/* Interactive Review Section */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.16, duration: 0.35 }}
        className='mt-6 rounded-3xl border border-[#eaded8] bg-white/80 p-6 shadow-xs backdrop-blur-xs md:p-8'
      >
        <span className='text-xs font-bold uppercase tracking-wider text-[#8a726c]'>Đánh giá khách hàng</span>
        <div className='mt-2 flex flex-col gap-3 md:flex-row md:items-end md:justify-between'>
          <div>
            <h2 className='text-2xl font-bold text-[#2B2118]'>Review sản phẩm</h2>
            <p className='mt-1 text-sm text-[#8a7a74]'>{reviews.length} đánh giá hiển thị</p>
          </div>
          <div className='inline-flex items-center gap-1 rounded-full bg-[#fdf2f0] px-3 py-1 text-sm font-bold text-[#b07a72]'>
            <Star size={15} className='fill-[#b07a72]' />
            {product.rating_number || 5}
          </div>
        </div>

        <div className='mt-5 grid gap-6 lg:grid-cols-[1fr_380px]'>
          <div className='space-y-3'>
            {reviews.length === 0 ? (
              <div className='rounded-2xl border border-dashed border-[#dccbc4] p-6 text-sm font-medium text-[#8a7a74] text-center'>
                Chưa có đánh giá nào. Hãy là người đầu tiên trải nghiệm và chia sẻ!
              </div>
            ) : (
              reviews.map((review) => (
                <article key={review._id} className='rounded-2xl border border-[#eaded8] bg-white p-4 shadow-xs'>
                  <div className='flex items-center justify-between gap-3'>
                    <p className='font-bold text-[#3d3330]'>{review.customer_name}</p>
                    <span className='inline-flex items-center gap-1 text-xs font-bold text-amber-500 bg-amber-50 px-2 py-1 rounded-full'>
                      <Star size={13} className='fill-amber-400' />
                      {review.rating} / 5
                    </span>
                  </div>
                  <p className='mt-2 text-sm leading-6 text-[#5c504a]'>{review.comment}</p>
                </article>
              ))
            )}
          </div>

          {/* Review Form with Interactive Star Rating */}
          <div className='rounded-2xl border border-[#eaded8] bg-[#fdf8f6] p-5 shadow-xs'>
            <h3 className='font-bold text-[#2B2118] text-base mb-3'>Viết đánh giá của bạn</h3>
            {getToken() ? (
              <div className='space-y-4'>
                <div>
                  <label className='block text-xs font-bold text-[#786452] mb-1.5'>Đánh giá chất lượng</label>
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
                                : 'fill-[#e8ddd8] text-[#e8ddd8]'
                            )}
                          />
                        </button>
                      ))}
                    </div>
                    <span className='text-xs font-bold text-[#c65f4a] ml-1'>
                      {RATING_LABELS[activeStarCount]} ({activeStarCount} sao)
                    </span>
                  </div>
                </div>

                <div>
                  <label className='block text-xs font-bold text-[#786452] mb-1.5'>Nội dung nhận xét</label>
                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    rows={4}
                    placeholder='Cảm nhận của bạn về kết cấu, mùi hương, hiệu quả sử dụng...'
                    className='w-full rounded-xl border border-[#eaded8] bg-white p-3 text-sm text-[#3d3330] outline-none transition focus:border-[#c65f4a] focus:ring-2 focus:ring-[#f5d5cf]/60'
                  />
                </div>

                <button
                  type='button'
                  onClick={handleSubmitReview}
                  disabled={reviewLoading || !reviewComment.trim()}
                  className='h-11 w-full rounded-xl bg-[#2B2118] text-sm font-bold text-white shadow-md transition hover:bg-[#433528] disabled:opacity-50'
                >
                  {reviewLoading ? 'Đang gửi...' : 'Gửi đánh giá ngay'}
                </button>
              </div>
            ) : (
              <div className='text-sm leading-relaxed text-[#6b5f59]'>
                Bạn cần{' '}
                <Link to={ROUTE_PATHS.AUTH_LOGIN} className='font-bold text-[#c65f4a] hover:underline'>
                  Đăng nhập
                </Link>{' '}
                để viết đánh giá sản phẩm.
              </div>
            )}
          </div>
        </div>
      </motion.section>
    </div>
  )
}
