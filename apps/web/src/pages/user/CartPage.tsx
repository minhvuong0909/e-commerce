import { useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { ArrowRight, Check, Lock, Minus, Plus, ShoppingBag, Tag, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import Alert from '../../components/ui/Alert'
import Button from '../../components/ui/Button'
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
import { ROUTE_PATHS } from '../../routes/route.paths'

const imageOf = (p: Product) => {
  const first = p.medias?.[0]
  return formatImageUrl(p.thumbnail || (typeof first === 'string' ? first : first?.url))
}

function CartAddOns({ cartProductIds }: { cartProductIds: Set<string> }) {
  const { data, isLoading } = useProducts(1, 8, { sort: 'best_selling' })
  const { addToCart, isAdding, addingProductId } = useCartActions()
  const addons = useMemo(
    () => (data?.products ?? []).filter((p) => !cartProductIds.has(p._id) && p.quantity > 0).slice(0, 4),
    [data?.products, cartProductIds]
  )
  if (isLoading || addons.length === 0) return null

  return (
    <section className='mt-12'>
      <h2 className='font-display text-2xl font-bold'>Thêm vào routine?</h2>
      <p className='mt-1 text-sm text-ink-500'>Những món khách thường mua kèm.</p>
      <div className='mt-5 grid gap-3 sm:grid-cols-2'>
        {addons.map((product) => {
          const img = imageOf(product)
          const loading = isAdding && addingProductId === product._id
          return (
            <div key={product._id} className='flex items-center gap-3 rounded-3xl bg-white p-3 ring-1 ring-ink-100'>
              <Link to={ROUTE_PATHS.USER_PRODUCT_DETAIL(product._id)} className='h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-lilac-50'>
                {img ? <img src={img} alt='' referrerPolicy='no-referrer' className='h-full w-full object-contain p-1 mix-blend-multiply' /> : null}
              </Link>
              <div className='min-w-0 flex-1'>
                <p className='line-clamp-1 text-sm font-semibold'>{product.name}</p>
                <p className='text-sm text-ink-600'>{money(product.price)}</p>
              </div>
              <button
                type='button'
                onClick={() => addToCart({ product_id: product._id, quantity: 1, redirect: false })}
                disabled={loading}
                aria-label={`Thêm ${product.name}`}
                className='grid h-10 w-10 shrink-0 cursor-pointer place-items-center rounded-full bg-ink-950 text-white transition hover:bg-berry-600 disabled:opacity-50'
              >
                {loading ? <span className='h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent' /> : <Plus size={18} />}
              </button>
            </div>
          )
        })}
      </div>
    </section>
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
  const cartProductIds = useMemo(() => new Set(cartItems.map((item) => item.product_infor._id)), [cartItems])
  const invalidateCart = () => queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY })

  const handleRemoveItem = async (id: string) => {
    try {
      setMutatingId(id)
      await removeCartItemApi(id)
      queryClient.setQueryData<CartItem[]>(CART_QUERY_KEY, (prev = []) => prev.filter((item) => item._id !== id))
      toast.success('Đã xóa khỏi giỏ hàng')
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
    if (!window.confirm('Xóa toàn bộ sản phẩm trong giỏ?')) return
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

  const toggleItem = (id: string) =>
    setDeselectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const allSelected = cartItems.length > 0 && selectedItems.length === cartItems.length
  const toggleAll = () => setDeselectedIds(allSelected ? new Set(cartItems.map((i) => i._id)) : new Set())

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
  const stockFail = selectedCartItems.some((item) => item.quantity > item.product_infor.quantity)

  const handleCheckout = () => {
    if (selectedItems.length === 0) {
      toast.error('Vui lòng chọn sản phẩm để thanh toán')
      return
    }
    navigate(ROUTE_PATHS.USER_CHECKOUT, { state: { items: selectedItems, voucher_code: voucher?.voucher.code } })
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

  if (!isLoading && cartItems.length === 0) {
    return (
      <div className='mx-auto max-w-3xl px-4 py-16 md:px-6'>
        <EmptyState
          icon={<ShoppingBag size={28} />}
          title='Giỏ hàng đang trống'
          desc='Chưa có gì ở đây cả. Dạo một vòng và chọn vài món cho routine của bạn nhé.'
          action={
            <Link
              to={ROUTE_PATHS.USER_HOME}
              className='inline-flex h-12 items-center gap-2 rounded-full bg-ink-950 px-7 font-semibold text-white transition hover:bg-berry-600'
            >
              Bắt đầu mua sắm <ArrowRight size={18} />
            </Link>
          }
        />
      </div>
    )
  }

  return (
    <div className='mx-auto max-w-[1320px] px-4 py-8 md:px-6 md:py-12'>
      <div className='flex flex-wrap items-end justify-between gap-4'>
        <div>
          <h1 className='font-display text-4xl font-bold md:text-5xl'>
            Giỏ hàng <span className='text-ink-300'>({isLoading ? '…' : cartItems.length})</span>
          </h1>
        </div>
        {!isLoading ? (
          <div className='flex items-center gap-2'>
            <Button variant='ghost' size='sm' onClick={toggleAll}>
              {allSelected ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
            </Button>
            <Button variant='ghost' size='sm' className='!text-rose-600 hover:!bg-rose-50' onClick={handleClearCart} disabled={clearing || isFetching}>
              <Trash2 size={15} /> Xóa hết
            </Button>
          </div>
        ) : null}
      </div>

      {stockFail ? (
        <Alert className='mt-6' variant='warning' title='Số lượng vượt tồn kho' desc='Vui lòng điều chỉnh trước khi thanh toán.' />
      ) : null}

      <div className='mt-8 grid gap-8 lg:grid-cols-[1fr_400px] lg:gap-12'>
        <div>
          {isLoading ? (
            <div className='space-y-3' aria-busy='true'>
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className='h-36 animate-pulse rounded-3xl bg-ink-100' />
              ))}
            </div>
          ) : (
            <ul className='divide-y divide-ink-100 rounded-4xl bg-white px-4 ring-1 ring-ink-100 sm:px-6'>
              {cartItems.map((item) => {
                const product = item.product_infor
                const img = imageOf(product)
                const selected = selectedItems.includes(item._id)
                const busy = mutatingId === item._id
                return (
                  <li key={item._id} className={cn('flex gap-4 py-5 transition', busy && 'opacity-60')}>
                    <button
                      type='button'
                      role='checkbox'
                      aria-checked={selected}
                      aria-label={`Chọn ${product.name}`}
                      onClick={() => toggleItem(item._id)}
                      className={cn(
                        'mt-1 grid h-6 w-6 shrink-0 cursor-pointer place-items-center rounded-lg border-[1.5px] transition',
                        selected ? 'border-ink-950 bg-ink-950 text-white' : 'border-ink-300 bg-white text-transparent hover:border-ink-950'
                      )}
                    >
                      <Check size={14} strokeWidth={3} />
                    </button>

                    <Link
                      to={ROUTE_PATHS.USER_PRODUCT_DETAIL(product._id)}
                      className='h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-berry-50 sm:h-28 sm:w-28'
                    >
                      {img ? <img src={img} alt='' loading='lazy' referrerPolicy='no-referrer' className='h-full w-full object-contain p-2 mix-blend-multiply' /> : null}
                    </Link>

                    <div className='flex min-w-0 flex-1 flex-col'>
                      <div className='flex items-start justify-between gap-3'>
                        <div className='min-w-0'>
                          <p className='text-xs font-medium uppercase tracking-wider text-ink-500'>{product.origin || 'Chính hãng'}</p>
                          <Link to={ROUTE_PATHS.USER_PRODUCT_DETAIL(product._id)} className='mt-0.5 line-clamp-2 font-semibold hover:text-berry-600'>
                            {product.name}
                          </Link>
                          <p className='mt-0.5 text-sm text-ink-500'>{money(product.price)}</p>
                        </div>
                        <p className='shrink-0 font-display text-lg font-bold'>{money(product.price * item.quantity)}</p>
                      </div>

                      <div className='mt-auto flex items-center justify-between pt-3'>
                        <div className='inline-flex h-10 items-center rounded-full border-[1.5px] border-ink-200 px-0.5'>
                          <button
                            type='button'
                            aria-label='Giảm số lượng'
                            disabled={busy || item.quantity <= 1}
                            onClick={() => handleUpdateQuantity(item, item.quantity - 1)}
                            className='grid h-8 w-8 cursor-pointer place-items-center rounded-full hover:bg-ink-100 disabled:opacity-30'
                          >
                            <Minus size={14} />
                          </button>
                          <span className='w-8 text-center text-sm font-semibold' aria-live='polite'>
                            {item.quantity}
                          </span>
                          <button
                            type='button'
                            aria-label='Tăng số lượng'
                            disabled={busy || item.quantity >= product.quantity}
                            onClick={() => handleUpdateQuantity(item, item.quantity + 1)}
                            className='grid h-8 w-8 cursor-pointer place-items-center rounded-full hover:bg-ink-100 disabled:opacity-30'
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <button
                          type='button'
                          onClick={() => handleRemoveItem(item._id)}
                          disabled={busy}
                          aria-label={`Xóa ${product.name}`}
                          className='grid h-10 w-10 cursor-pointer place-items-center rounded-full text-ink-500 transition hover:bg-rose-50 hover:text-rose-600 disabled:opacity-40'
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                      {item.quantity > product.quantity ? (
                        <p className='mt-2 text-xs font-semibold text-rose-600'>Chỉ còn {product.quantity} sản phẩm</p>
                      ) : null}
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
          <CartAddOns cartProductIds={cartProductIds} />
        </div>

        <aside className='h-fit rounded-4xl bg-ink-950 p-6 text-white lg:sticky lg:top-36 sm:p-8'>
          <h2 className='font-display text-2xl font-bold'>Tóm tắt</h2>
          <p className='mt-1 text-sm text-ink-400'>{selectedItems.length} sản phẩm được chọn</p>

          <form onSubmit={handleApplyPromo} className='mt-6'>
            <label htmlFor='promo' className='text-sm text-ink-300'>
              Mã giảm giá
            </label>
            <div className='mt-2 flex gap-2'>
              <div className='relative min-w-0 flex-1'>
                <Tag size={16} className='pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-400' aria-hidden />
                <input
                  id='promo'
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  placeholder='VD: GLOW10'
                  className='h-12 w-full rounded-full border-[1.5px] border-white/15 bg-white/5 pl-10 pr-4 text-sm font-semibold uppercase tracking-wider text-white outline-none placeholder:normal-case placeholder:tracking-normal placeholder:text-ink-400 focus:border-lime-300'
                />
              </div>
              <button
                type='submit'
                disabled={voucherLoading || subtotal <= 0}
                className='h-12 shrink-0 cursor-pointer rounded-full bg-white px-5 text-sm font-semibold text-ink-950 transition hover:bg-lime-300 disabled:opacity-40'
              >
                {voucherLoading ? '…' : 'Áp dụng'}
              </button>
            </div>
            {voucher ? (
              <p className='mt-2 text-sm font-semibold text-lime-300'>
                ✓ Mã {voucher.voucher.code}: giảm {money(discount)}
              </p>
            ) : null}
          </form>

          <dl className='mt-6 space-y-3 border-t border-white/10 pt-6 text-sm'>
            <div className='flex justify-between'>
              <dt className='text-ink-300'>Tạm tính</dt>
              <dd className='font-semibold'>{money(subtotal)}</dd>
            </div>
            {discount > 0 ? (
              <div className='flex justify-between text-lime-300'>
                <dt>Giảm giá</dt>
                <dd className='font-semibold'>−{money(discount)}</dd>
              </div>
            ) : null}
            <div className='flex justify-between'>
              <dt className='text-ink-300'>Vận chuyển</dt>
              <dd className='text-ink-300'>Tính ở bước sau</dd>
            </div>
          </dl>

          <div className='mt-6 flex items-end justify-between border-t border-white/10 pt-6'>
            <span className='text-ink-300'>Tổng tạm tính</span>
            <span className='font-display text-3xl font-bold'>{money(estimatedTotal)}</span>
          </div>

          <button
            type='button'
            disabled={isLoading || selectedItems.length === 0 || stockFail}
            onClick={handleCheckout}
            className='mt-6 flex h-14 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-berry-500 font-semibold text-white shadow-glow transition hover:bg-berry-400 disabled:pointer-events-none disabled:opacity-40'
          >
            Thanh toán <ArrowRight size={18} />
          </button>
          <p className='mt-4 flex items-center justify-center gap-1.5 text-xs text-ink-400'>
            <Lock size={12} aria-hidden /> Thanh toán qua cổng PayOS / MoMo hoặc COD
          </p>
        </aside>
      </div>
    </div>
  )
}
