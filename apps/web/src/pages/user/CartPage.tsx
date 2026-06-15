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

const panelClass = 'rounded-lg border border-[#eaded8] bg-white'

function CartListSkeleton() {
  return (
    <div className='space-y-3' aria-busy='true' aria-label='Đang tải giỏ hàng'>
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className={cn(panelClass, 'h-32 animate-pulse bg-[#fdf8f6]')} />
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
      <h2 className='text-sm font-semibold text-[#3d3330]'>Gợi ý thêm cho routine</h2>
      <p className='mt-1 text-xs text-[#8a7a74]'>Son dưỡng, sữa rửa mặt, kem chống nắng — thêm nhanh vào giỏ.</p>
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
  const image = product.medias?.[0]?.url

  return (
    <div className={cn(panelClass, 'flex items-center gap-3 p-3')}>
      <div className='h-16 w-14 shrink-0 overflow-hidden rounded-md bg-[#f5ebe6]'>
        {image ? <img src={image} alt='' className='h-full w-full object-cover' /> : null}
      </div>
      <div className='min-w-0 flex-1'>
        <p className='line-clamp-2 text-sm font-semibold text-[#3d3330]'>{product.name}</p>
        <p className='mt-0.5 text-sm font-bold text-[#3d3330]'>{money(product.price)}</p>
      </div>
      <button
        type='button'
        onClick={onAdd}
        disabled={loading || product.quantity <= 0}
        className='shrink-0 rounded-md border border-[#3d3330] px-3 py-1.5 text-xs font-semibold text-[#3d3330] transition hover:bg-[#3d3330] hover:text-white disabled:opacity-50'
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

  const stockFail = selectedCartItems.some((item) => item.quantity > item.product_infor.quantity)

  const handleCheckout = () => {
    if (selectedItems.length === 0) {
      toast.error('Vui lòng chọn sản phẩm để thanh toán')
      return
    }
    navigate('/user/checkout', { state: { items: selectedItems } })
  }

  const handleApplyPromo = (e: FormEvent) => {
    e.preventDefault()
    if (!promoCode.trim()) {
      toast.error('Vui lòng nhập mã giảm giá')
      return
    }
    toast.message('Mã giảm giá sắp ra mắt — chưa áp dụng vào tổng tiền.')
  }

  const showEmpty = !isLoading && cartItems.length === 0

  if (showEmpty) {
    return (
      <div className='mx-auto max-w-5xl px-4 py-10 md:px-6'>
        <EmptyState
          icon={<PackageOpen size={26} />}
          title='Giỏ hàng trống'
          desc='Khám phá sản phẩm skincare và thêm vào giỏ để bắt đầu routine làm đẹp.'
          action={
            <Link
              to='/user/home'
              className='inline-flex min-h-11 items-center justify-center rounded-md bg-[#3d3330] px-5 text-sm font-semibold text-white transition hover:bg-[#2a2421]'
            >
              Bắt đầu mua sắm
            </Link>
          }
        />
      </div>
    )
  }

  return (
    <div className='mx-auto max-w-7xl px-4 py-8 md:px-6'>
      <div className='mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between'>
        <div>
          <p className='text-xs font-semibold uppercase tracking-[0.14em] text-[#b07a72]'>Your bag</p>
          <h1 className='mt-1 text-3xl font-semibold tracking-tight text-[#3d3330]'>Giỏ hàng</h1>
          <p className='mt-2 text-sm text-[#8a7a74]'>
            {isLoading ? 'Đang tải...' : `${cartItems.length} sản phẩm`}
          </p>
        </div>

        {!isLoading && cartItems.length > 0 ? (
          <div className='flex items-center gap-4 text-sm font-semibold'>
            <button type='button' onClick={toggleAll} className='text-[#b07a72] hover:text-[#8f5f58]'>
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
            <div className='space-y-3'>
              {cartItems.map((item) => {
                const product = item.product_infor
                const image = product.medias?.[0]?.url
                const isSelected = selectedItems.includes(item._id)

                return (
                  <label
                    key={item._id}
                    className={cn(
                      panelClass,
                      'grid cursor-pointer gap-4 p-4 transition sm:grid-cols-[auto_96px_1fr_auto] sm:items-center',
                      isSelected ? 'border-[#3d3330] ring-1 ring-[#3d3330]/10' : 'hover:border-[#cbb8af]'
                    )}
                  >
                    <input type='checkbox' checked={isSelected} onChange={() => toggleItem(item._id)} className='sr-only' />

                    <span
                      className={cn(
                        'grid h-5 w-5 place-items-center rounded border transition',
                        isSelected ? 'border-[#3d3330] bg-[#3d3330] text-white' : 'border-[#dccbc4] bg-white text-transparent'
                      )}
                    >
                      <Check size={12} strokeWidth={3} />
                    </span>

                    <div className='aspect-[4/5] w-full overflow-hidden rounded-md bg-[#f5ebe6] sm:w-24'>
                      {image ? (
                        <img src={image} alt={product.name} loading='lazy' className='h-full w-full object-cover' />
                      ) : null}
                    </div>

                    <div className='min-w-0'>
                      {product.origin ? (
                        <p className='text-[10px] font-semibold uppercase tracking-wider text-[#b07a72]'>{product.origin}</p>
                      ) : null}
                      <div className='line-clamp-2 text-sm font-semibold text-[#3d3330]'>{product.name}</div>
                      <p className='mt-1 text-xs text-[#8a7a74]'>{money(product.price)} / sản phẩm</p>

                      <div className='mt-3 inline-flex items-center rounded-md border border-[#eaded8]' onClick={(e) => e.preventDefault()}>
                        <button
                          type='button'
                          aria-label='Giảm số lượng'
                          disabled={mutatingId === item._id || item.quantity <= 1}
                          onClick={() => handleUpdateQuantity(item, item.quantity - 1)}
                          className='grid h-8 w-8 place-items-center text-[#5c504a] hover:bg-[#fdf8f6] disabled:opacity-40'
                        >
                          <Minus size={14} />
                        </button>
                        <span className='w-8 text-center text-sm font-semibold'>{item.quantity}</span>
                        <button
                          type='button'
                          aria-label='Tăng số lượng'
                          disabled={mutatingId === item._id || item.quantity >= product.quantity}
                          onClick={() => handleUpdateQuantity(item, item.quantity + 1)}
                          className='grid h-8 w-8 place-items-center text-[#5c504a] hover:bg-[#fdf8f6] disabled:opacity-40'
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>

                    <div className='flex flex-col items-start sm:items-end'>
                      <p className='text-base font-bold text-[#3d3330]'>{money(product.price * item.quantity)}</p>
                      <button
                        type='button'
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          handleRemoveItem(item._id)
                        }}
                        disabled={mutatingId === item._id}
                        className='mt-2 inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700 disabled:opacity-50'
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

        <aside className={cn(panelClass, 'h-fit p-5 lg:sticky lg:top-28')}>
          <div className='flex items-center gap-2'>
            <span className='grid h-9 w-9 place-items-center rounded-md bg-[#3d3330] text-white'>
              <Sparkles size={16} />
            </span>
            <div>
              <p className='font-semibold text-[#3d3330]'>Tóm tắt đơn</p>
              <p className='text-xs text-[#8a7a74]'>{selectedItems.length} sản phẩm đã chọn</p>
            </div>
          </div>

          <form onSubmit={handleApplyPromo} className='mt-5'>
            <label className='text-xs font-semibold text-[#6b5f59]'>Mã giảm giá</label>
            <div className='mt-2 flex gap-2'>
              <div className='relative min-w-0 flex-1'>
                <Tag className='pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#a89890]' size={15} />
                <input
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  placeholder='Nhập mã'
                  className='h-10 w-full rounded-md border border-[#eaded8] bg-white pl-9 pr-3 text-sm outline-none focus:border-[#cbb8af] focus:ring-2 focus:ring-[#f5d5cf]/50'
                />
              </div>
              <button
                type='submit'
                className='shrink-0 rounded-md border border-[#3d3330] px-4 text-sm font-semibold text-[#3d3330] hover:bg-[#fdf8f6]'
              >
                Áp dụng
              </button>
            </div>
          </form>

          <div className='mt-5 space-y-2 text-sm'>
            <div className='flex justify-between'>
              <span className='text-[#8a7a74]'>Tạm tính</span>
              <span className='font-semibold text-[#3d3330]'>{money(subtotal)}</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-[#8a7a74]'>Phí vận chuyển</span>
              <span className='font-medium text-[#b07a72]'>Tính ở checkout</span>
            </div>
          </div>

          <div className='my-4 h-px bg-[#f0e4de]' />

          <div className='flex items-end justify-between'>
            <span className='text-sm text-[#8a7a74]'>Tổng tạm tính</span>
            <span className='text-xl font-bold text-[#3d3330]'>{money(subtotal)}</span>
          </div>

          <button
            type='button'
            disabled={isLoading || selectedItems.length === 0 || stockFail}
            onClick={handleCheckout}
            className='mt-5 flex h-11 w-full items-center justify-center rounded-md bg-[#3d3330] text-sm font-semibold text-white transition hover:bg-[#2a2421] disabled:opacity-50'
          >
            Thanh toán ({selectedItems.length})
          </button>

          <p className='mt-3 text-center text-[11px] leading-5 text-[#8a7a74]'>
            Hàng chính hãng · Thanh toán bảo mật · Giao trong bán kính 25km
          </p>
        </aside>
      </div>
    </div>
  )
}
