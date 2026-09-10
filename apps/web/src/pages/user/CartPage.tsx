import { useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { Check, Minus, PackageOpen, Plus, Sparkles, Tag, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import Alert from '../../components/ui/Alert'
import EmptyState from '../../components/ui/EmptyState'
import { CART_QUERY_KEY, useCart } from '../../hooks/useCart'
import { useCartActions } from '../../hooks/useCartActions'
import { useProducts } from '../../hooks/useProducts'
import { clearCartApi, removeCartItemApi, updateCartItemApi } from '../../services/carts.services'
import type { CartItem } from '../../models/CartRequests'
import type { Product } from '../../models/ProductRequests'
import { getApiErrorMessage } from '../../utils/apiError'
import money from '../../utils/money'
import cn from '../../utils/cn'
import { formatImageUrl } from '../../utils/formatImageUrl'
import { validateVoucherApi, type VoucherValidationResult } from '../../services/vouchers.services'

const panelClass = 'rounded-2xl border border-[#EFECE6] bg-white shadow-soft'
const FREE_SHIPPING_THRESHOLD = 500000

function CartListSkeleton() {
  return (
    <div className='space-y-3' aria-busy='true' aria-label='Đang tải giỏ hàng'>
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className={cn(panelClass, 'h-32 animate-pulse bg-[#F5EFE6]')} />
      ))}
    </div>
  )
}

function CartAddOns({ cartProductIds }: { cartProductIds: Set<string> }) {
  const { data, isLoading } = useProducts(1, 8, { sort: 'best_selling' })
  const { addToCart, isAdding, addingProductId } = useCartActions()

  const addons = useMemo(
    () => (data?.products ?? []).filter((p) => !cartProductIds.has(p._id)).slice(0, 4),
    [data?.products, cartProductIds]
  )

  if (isLoading || addons.length === 0) return null

  return (
    <section className='mt-8'>
      <h2 className='font-display text-base font-bold text-[#2B2118]'>Gợi ý thêm cho Routine của bạn</h2>
      <p className='mt-1 text-xs text-[#8C7D70]'>Son dưỡng, sữa rửa mặt, kem chống nắng — thêm nhanh vào giỏ.</p>
      <div className='mt-4 grid gap-3 sm:grid-cols-2'>
        {addons.map((product) => (
          <CartAddOnRow
            key={product._id}
            product={product}
            onAdd={() => addToCart({ product_id: product._id, quantity: 1, redirect: false })}
            loading={isAdding && addingProductId === product._id}
          />
        ))}
      </div>
    </section>
  )
}

function CartAddOnRow({
  product,
  onAdd,
  loading
}: {
  product: Product
  onAdd: () => void
  loading: boolean
}) {
  const firstMedia = product.medias?.[0]
  const mediaUrl = typeof firstMedia === 'string' ? firstMedia : firstMedia?.url
  const image = formatImageUrl(product.thumbnail || mediaUrl)

  return (
    <div className={cn(panelClass, 'flex items-center gap-3 p-3.5')}>
      <div className='h-16 w-14 shrink-0 overflow-hidden rounded-xl bg-[#F5EFE6] border border-[#EFECE6]'>
        {image ? <img src={image} alt='' referrerPolicy='no-referrer' className='h-full w-full object-cover' /> : null}
      </div>
      <div className='min-w-0 flex-1'>
        <p className='line-clamp-2 text-xs font-bold text-[#2B2118]'>{product.name}</p>
        <p className='mt-0.5 text-xs font-extrabold text-[#C47A5A]'>{money(product.price)}</p>
      </div>
      <button
        type='button'
        onClick={onAdd}
        disabled={loading || product.quantity <= 0}
        className='shrink-0 rounded-full border border-[#2B2118] bg-white px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-[#2B2118] transition hover:bg-[#2B2118] hover:text-white disabled:opacity-50'
      >
        {loading ? '...' : 'Thêm'}
      </button>
    </div>
  )
}

export default function CartPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data: cartItems = [], isLoading, isFetching } = useCart()

  const [deselectedIds, setDeselectedIds] = useState<Set<string>>(new Set())
  const [mutatingId, setMutatingId] = useState<string | null>(null)
  const [clearing, setClearing] = useState(false)
  const [promoCode, setPromoCode] = useState('')
  const [voucher, setVoucher] = useState<VoucherValidationResult | null>(null)
  const [voucherLoading, setVoucherLoading] = useState(false)

  const selectedItems = useMemo(
    () => cartItems.filter((item) => !deselectedIds.has(item._id)).map((item) => item._id),
    [cartItems, deselectedIds]
  )

  const cartProductIds = useMemo(
    () => new Set(cartItems.map((item) => item.product_infor._id)),
    [cartItems]
  )

  const invalidateCart = () => queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY })

  const handleRemoveItem = async (id: string) => {
    try {
      setMutatingId(id)
      await removeCartItemApi(id)
      queryClient.setQueryData<CartItem[]>(CART_QUERY_KEY, (prev = []) => prev.filter((item) => item._id !== id))
      toast.success('Đã xóa sản phẩm khỏi giỏ hàng')
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Xóa sản phẩm thất bại'))
      invalidateCart()
    } finally {
      setMutatingId(null)
    }
  }

  const handleUpdateQuantity = async (item: CartItem, nextQty: number) => {
    if (nextQty < 1) return
    if (nextQty > item.product_infor.quantity) {
      toast.error('Không đủ hàng trong kho')
      return
    }
    try {
      setMutatingId(item._id)
      await updateCartItemApi(item._id, nextQty)
      queryClient.setQueryData<CartItem[]>(CART_QUERY_KEY, (prev = []) =>
        prev.map((x) => (x._id === item._id ? { ...x, quantity: nextQty } : x))
      )
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Cập nhật số lượng thất bại'))
      invalidateCart()
    } finally {
      setMutatingId(null)
    }
  }

  const handleClearCart = async () => {
    try {
      setClearing(true)
      await clearCartApi()
      queryClient.setQueryData<CartItem[]>(CART_QUERY_KEY, [])
      toast.success('Đã xóa toàn bộ giỏ hàng')
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Xóa giỏ hàng thất bại'))
      invalidateCart()
    } finally {
      setClearing(false)
    }
  }

  const toggleItem = (id: string) => {
    setDeselectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleAll = () => {
    const allSelected = cartItems.length > 0 && selectedItems.length === cartItems.length
    setDeselectedIds(allSelected ? new Set(cartItems.map((i) => i._id)) : new Set())
  }

  const selectedCartItems = useMemo(
    () => cartItems.filter((item) => selectedItems.includes(item._id)),
    [cartItems, selectedItems]
  )

  const subtotal = useMemo(
    () => selectedCartItems.reduce((sum, item) => sum + item.product_infor.price * item.quantity, 0),
    [selectedCartItems]
  )
  const discount = voucher?.discount || 0
  const estimatedTotal = Math.max(0, subtotal - discount)
  const remainingForFreeShip = Math.max(0, FREE_SHIPPING_THRESHOLD - estimatedTotal)
  const freeShipProgress = Math.min(100, (estimatedTotal / FREE_SHIPPING_THRESHOLD) * 100)

  const stockFail = selectedCartItems.some((item) => item.quantity > item.product_infor.quantity)

  const handleCheckout = () => {
    if (selectedItems.length === 0) {
      toast.error('Vui lòng chọn sản phẩm để thanh toán')
      return
    }
    navigate('/user/checkout', { state: { items: selectedItems, voucher_code: voucher?.voucher.code } })
  }

  const handleApplyPromo = async (e: FormEvent) => {
    e.preventDefault()
    if (!promoCode.trim()) {
      toast.error('Vui lòng nhập mã giảm giá')
      return
    }
    try {
      setVoucherLoading(true)
      const res = await validateVoucherApi(promoCode, subtotal)
      setVoucher(res.data.result)
      toast.success(`Đã áp dụng mã ${res.data.result.voucher.code}`)
    } catch (err) {
      setVoucher(null)
      toast.error(getApiErrorMessage(err, 'Mã giảm giá không hợp lệ'))
    } finally {
      setVoucherLoading(false)
    }
  }

  const showEmpty = !isLoading && cartItems.length === 0

  if (showEmpty) {
    return (
      <div className='mx-auto max-w-5xl px-4 py-12 md:px-6 bg-[#FAF7F2] min-h-screen'>
        <EmptyState
          icon={<PackageOpen size={28} className='text-[#9A8069]' />}
          title='Giỏ hàng của bạn đang trống'
          desc='Khám phá bộ sưu tập mỹ phẩm cao cấp và bắt đầu routine dưỡng da chuẩn chuyên gia.'
          action={
            <Link
              to='/user/home'
              className='inline-flex min-h-12 items-center justify-center rounded-full bg-[#2B2118] px-8 text-xs font-bold uppercase tracking-wider text-[#FAF7F2] shadow-md transition hover:bg-[#9A8069]'
            >
              Khám phá ngay
            </Link>
          }
        />
      </div>
    )
  }

  return (
    <div className='mx-auto max-w-7xl px-4 py-8 md:px-6 bg-[#FAF7F2] text-[#2B2118] min-h-screen'>
      <div className='mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between'>
        <div>
          <p className='text-xs font-bold uppercase tracking-[0.2em] text-[#9A8069]'>Maison Shopping Bag</p>
          <h1 className='mt-1 font-display text-3xl font-extrabold tracking-tight text-[#2B2118] md:text-4xl'>Giỏ Hàng Của Bạn</h1>
          <p className='mt-2 text-xs text-[#8C7D70]'>
            {isLoading ? 'Đang tải sản phẩm...' : `${cartItems.length} sản phẩm trong giỏ`}
          </p>
        </div>

        {!isLoading && cartItems.length > 0 ? (
          <div className='flex items-center gap-4 text-xs font-bold uppercase tracking-wider'>
            <button type='button' onClick={toggleAll} className='text-[#9A8069] hover:underline'>
              {selectedItems.length === cartItems.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
            </button>
            <button
              type='button'
              onClick={handleClearCart}
              disabled={clearing || isFetching}
              className='inline-flex items-center gap-1.5 text-rose-600 hover:text-rose-700 disabled:opacity-50'
            >
              <Trash2 size={15} />
              Xóa tất cả
            </button>
          </div>
        ) : null}
      </div>

      {stockFail ? (
        <div className='mb-5'>
          <Alert variant='warning' title='Số lượng vượt tồn kho' desc='Vui lòng điều chỉnh trước khi thanh toán.' />
        </div>
      ) : null}

      <div className='grid gap-8 lg:grid-cols-[1fr_340px] xl:grid-cols-[1fr_380px]'>
        <div>
          {isLoading ? (
            <CartListSkeleton />
          ) : (
            <div className='space-y-3.5'>
              {cartItems.map((item) => {
                const product = item.product_infor
                const firstMedia = product.medias?.[0]
                const mediaUrl = typeof firstMedia === 'string' ? firstMedia : firstMedia?.url
                const image = formatImageUrl(product.thumbnail || mediaUrl)
                const isSelected = selectedItems.includes(item._id)

                return (
                  <label
                    key={item._id}
                    className={cn(
                      panelClass,
                      'grid cursor-pointer gap-4 p-4 transition-all sm:grid-cols-[auto_96px_1fr_auto] sm:items-center',
                      isSelected ? 'border-[#2B2118] ring-1 ring-[#2B2118]/15' : 'hover:border-[#9A8069]'
                    )}
                  >
                    <input type='checkbox' checked={isSelected} onChange={() => toggleItem(item._id)} className='sr-only' />

                    <span
                      className={cn(
                        'grid h-5 w-5 place-items-center rounded border transition-all',
                        isSelected ? 'border-[#2B2118] bg-[#2B2118] text-white' : 'border-[#EFECE6] bg-white text-transparent'
                      )}
                    >
                      <Check size={12} strokeWidth={3} />
                    </span>

                    <div className='aspect-square w-24 overflow-hidden rounded-xl bg-[#F5EFE6] border border-[#EFECE6] sm:w-24'>
                      {image ? (
                        <img src={image} alt={product.name} loading='lazy' referrerPolicy='no-referrer' className='h-full w-full object-cover' />
                      ) : null}
                    </div>

                    <div className='min-w-0'>
                      {product.origin ? (
                        <p className='text-[10px] font-bold uppercase tracking-[0.14em] text-[#9A8069]'>{product.origin}</p>
                      ) : null}
                      <div className='line-clamp-2 font-display text-sm font-bold text-[#2B2118]'>{product.name}</div>
                      <p className='mt-1 text-xs text-[#8C7D70]'>{money(product.price)} / sản phẩm</p>

                      <div className='mt-3 inline-flex items-center rounded-full border border-[#EFECE6] bg-[#FAF7F2] p-0.5' onClick={(e) => e.preventDefault()}>
                        <button
                          type='button'
                          aria-label='Giảm số lượng'
                          disabled={mutatingId === item._id || item.quantity <= 1}
                          onClick={() => handleUpdateQuantity(item, item.quantity - 1)}
                          className='grid h-8 w-8 place-items-center rounded-full text-[#2B2118] transition hover:bg-white disabled:opacity-40'
                        >
                          <Minus size={14} />
                        </button>
                        <span className='w-8 text-center text-xs font-bold text-[#2B2118]'>{item.quantity}</span>
                        <button
                          type='button'
                          aria-label='Tăng số lượng'
                          disabled={mutatingId === item._id || item.quantity >= product.quantity}
                          onClick={() => handleUpdateQuantity(item, item.quantity + 1)}
                          className='grid h-8 w-8 place-items-center rounded-full text-[#2B2118] transition hover:bg-white disabled:opacity-40'
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>

                    <div className='flex flex-col items-start sm:items-end'>
                      <p className='text-base font-extrabold text-[#C47A5A]'>{money(product.price * item.quantity)}</p>
                      <button
                        type='button'
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          handleRemoveItem(item._id)
                        }}
                        disabled={mutatingId === item._id}
                        className='mt-2 inline-flex items-center gap-1 text-xs font-bold text-rose-600 hover:underline disabled:opacity-50'
                      >
                        <Trash2 size={13} />
                        Xóa
                      </button>
                    </div>
                  </label>
                )
              })}
            </div>
          )}

          <CartAddOns cartProductIds={cartProductIds} />
        </div>

        <aside className={cn(panelClass, 'h-fit p-6 lg:sticky lg:top-28')}>
          <div className='flex items-center gap-3 border-b border-[#EFECE6] pb-4'>
            <span className='grid h-10 w-10 place-items-center rounded-xl bg-[#2B2118] text-[#FAF7F2]'>
              <Sparkles size={18} className='text-[#9A8069]' />
            </span>
            <div>
              <p className='font-display text-base font-bold text-[#2B2118]'>Tóm Tắt Đơn Hàng</p>
              <p className='text-xs text-[#8C7D70]'>{selectedItems.length} sản phẩm được chọn</p>
            </div>
          </div>

          <form onSubmit={handleApplyPromo} className='mt-5'>
            <label className='text-xs font-bold uppercase tracking-wider text-[#594D42]'>Mã Voucher / Ưu Đãi</label>
            <div className='mt-2 flex gap-2'>
              <div className='relative min-w-0 flex-1'>
                <Tag className='pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#8C7D70]' size={15} />
                <input
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  placeholder='Nhập mã giảm giá'
                  className='h-10 w-full rounded-xl border border-[#EFECE6] bg-white pl-9 pr-3 text-xs text-[#2B2118] outline-none focus:border-[#9A8069]'
                />
              </div>
              <button
                type='submit'
                disabled={voucherLoading || subtotal <= 0}
                className='shrink-0 rounded-xl border border-[#2B2118] bg-[#2B2118] px-4 text-xs font-bold text-white hover:bg-[#9A8069] transition-colors'
              >
                {voucherLoading ? '...' : 'Áp dụng'}
              </button>
            </div>
            {voucher ? (
              <p className='mt-2 text-xs font-bold text-emerald-600'>
                Đã giảm {money(discount)} với mã {voucher.voucher.code}
              </p>
            ) : null}
          </form>

          {/* Freeship Progress Bar */}
          <div className='mt-5 rounded-2xl border border-[#EFECE6] bg-[#FAF7F2] p-4'>
            <div className='flex items-center justify-between gap-3 text-xs font-bold text-[#2B2118]'>
              <span>{remainingForFreeShip > 0 ? `Mua thêm ${money(remainingForFreeShip)} để Freeship` : 'Đã đủ điều kiện Miễn Phí Vận Chuyển 🚚'}</span>
              <span>{Math.round(freeShipProgress)}%</span>
            </div>
            <div className='mt-3 h-2.5 overflow-hidden rounded-full bg-white border border-[#EFECE6]'>
              <div className='h-full rounded-full bg-[#9A8069] transition-all duration-500' style={{ width: `${freeShipProgress}%` }} />
            </div>
          </div>

          <div className='mt-5 space-y-2.5 text-xs font-medium text-[#594D42]'>
            <div className='flex justify-between'>
              <span>Tạm tính sản phẩm</span>
              <span className='font-bold text-[#2B2118]'>{money(subtotal)}</span>
            </div>
            <div className='flex justify-between'>
              <span>Cước phí vận chuyển</span>
              <span className='font-bold text-[#9A8069]'>Tính tại trang checkout</span>
            </div>
            {discount > 0 ? (
              <div className='flex justify-between text-emerald-600 font-bold'>
                <span>Voucher giảm giá</span>
                <span>-{money(discount)}</span>
              </div>
            ) : null}
          </div>

          <div className='my-4 h-px bg-[#EFECE6]' />

          <div className='flex items-end justify-between'>
            <span className='text-xs font-bold uppercase tracking-wider text-[#8C7D70]'>Tổng Tạm Tính</span>
            <span className='text-2xl font-extrabold text-[#C47A5A]'>{money(estimatedTotal)}</span>
          </div>

          <button
            type='button'
            disabled={isLoading || selectedItems.length === 0 || stockFail}
            onClick={handleCheckout}
            className='mt-6 flex h-12 w-full items-center justify-center rounded-full bg-[#2B2118] text-xs font-bold uppercase tracking-widest text-[#FAF7F2] transition hover:bg-[#9A8069] shadow-md disabled:opacity-50'
          >
            Tiến Hành Thanh Toán ({selectedItems.length})
          </button>

          <p className='mt-4 text-center text-[11px] leading-relaxed text-[#8C7D70]'>
            Cam kết sản phẩm chính hãng · Bảo mật thanh toán SSL
          </p>
        </aside>
      </div>
    </div>
  )
}
