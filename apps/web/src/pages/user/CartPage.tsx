import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { Check, Minus, PackageOpen, Plus, ShoppingBag, Trash2, Truck } from 'lucide-react'
import { toast } from 'sonner'
import Alert from '../../components/ui/Alert'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import { CART_QUERY_KEY, useCart } from '../../hooks/useCart'
import { clearCartApi, removeCartItemApi, updateCartItemApi } from '../../services/carts.services'
import type { CartItem } from '../../models/CartRequests'
import { getApiErrorMessage } from '../../utils/apiError'
import money from '../../utils/money'
import cn from '../../utils/cn'

function CartListSkeleton() {
  return (
    <div className='space-y-4' aria-busy='true' aria-label='Đang tải giỏ hàng'>
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className='h-36 animate-pulse rounded-3xl border border-slate-200 bg-white' />
      ))}
    </div>
  )
}

export default function CartPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data: cartItems = [], isLoading, isFetching } = useCart()

  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [mutatingId, setMutatingId] = useState<string | null>(null)
  const [clearing, setClearing] = useState(false)

  useEffect(() => {
    if (cartItems.length > 0) {
      setSelectedItems((prev) => {
        const valid = prev.filter((id) => cartItems.some((item) => item._id === id))
        return valid.length > 0 ? valid : cartItems.map((item) => item._id)
      })
    } else {
      setSelectedItems([])
    }
  }, [cartItems])

  const invalidateCart = () => queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY })

  const handleRemoveItem = async (id: string) => {
    try {
      setMutatingId(id)
      await removeCartItemApi(id)
      queryClient.setQueryData<CartItem[]>(CART_QUERY_KEY, (prev = []) => prev.filter((item) => item._id !== id))
      setSelectedItems((prev) => prev.filter((x) => x !== id))
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
      setSelectedItems([])
      toast.success('Đã xóa toàn bộ giỏ hàng')
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Xóa giỏ hàng thất bại'))
      invalidateCart()
    } finally {
      setClearing(false)
    }
  }

  const toggleItem = (id: string) => {
    setSelectedItems((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  const toggleAll = () => {
    if (selectedItems.length === cartItems.length) {
      setSelectedItems([])
    } else {
      setSelectedItems(cartItems.map((i) => i._id))
    }
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

  const showEmpty = !isLoading && cartItems.length === 0

  if (showEmpty) {
    return (
      <div className='mx-auto max-w-5xl px-4 py-10 md:px-6'>
        <EmptyState
          icon={<PackageOpen size={26} />}
          title='Giỏ hàng trống'
          desc='Khám phá sản phẩm nổi bật và thêm những món phù hợp vào giỏ hàng.'
          action={
            <Link
              to='/user/home'
              className='inline-flex min-h-12 items-center justify-center rounded-2xl bg-ink-950 px-5 text-sm font-bold text-white transition hover:bg-brand-600'
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
          <p className='text-xs font-black uppercase tracking-[0.18em] text-brand-600'>Shopping bag</p>
          <h1 className='mt-1 text-3xl font-black tracking-tight text-ink-950'>Giỏ hàng</h1>
          <p className='mt-2 text-sm text-slate-500'>
            {isLoading ? 'Đang tải...' : `${cartItems.length} sản phẩm trong giỏ của bạn`}
          </p>
        </div>

        {!isLoading && cartItems.length > 0 ? (
          <div className='flex items-center gap-4'>
            <button type='button' onClick={toggleAll} className='text-sm font-black text-brand-600 transition hover:text-brand-900'>
              {selectedItems.length === cartItems.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
            </button>
            <button
              type='button'
              onClick={handleClearCart}
              disabled={clearing || isFetching}
              className='inline-flex items-center gap-1.5 text-sm font-black text-rose-600 transition hover:text-rose-700 disabled:opacity-50'
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

      <div className='grid gap-8 lg:grid-cols-[1.6fr_0.86fr]'>
        <div>
          {isLoading ? (
            <CartListSkeleton />
          ) : (
            <div className='space-y-4'>
              {cartItems.map((item) => {
                const product = item.product_infor
                const image = product.medias?.[0]?.url
                const isSelected = selectedItems.includes(item._id)

                return (
                  <label
                    key={item._id}
                    className={cn(
                      'surface-card grid cursor-pointer gap-4 rounded-3xl border p-4 transition sm:grid-cols-[auto_112px_1fr_auto] sm:items-center',
                      isSelected ? 'border-brand-500/45 ring-2 ring-brand-500/10' : 'border-slate-200 hover:border-slate-300'
                    )}
                  >
                    <input type='checkbox' checked={isSelected} onChange={() => toggleItem(item._id)} className='sr-only' />

                    <span
                      className={cn(
                        'grid h-6 w-6 place-items-center rounded-full border transition',
                        isSelected ? 'border-brand-600 bg-brand-600 text-white' : 'border-slate-300 bg-white text-transparent'
                      )}
                    >
                      <Check size={14} strokeWidth={3} />
                    </span>

                    <div className='h-28 w-full overflow-hidden rounded-2xl bg-slate-100 sm:h-28 sm:w-28'>
                      {image ? (
                        <img src={image} alt={product.name} loading='lazy' decoding='async' className='h-full w-full object-cover' />
                      ) : null}
                    </div>

                    <div className='min-w-0'>
                      <div className='line-clamp-2 text-base font-black text-ink-950'>{product.name}</div>
                      <div className='mt-3 flex items-center gap-3'>
                        <div className='inline-flex items-center rounded-2xl border border-slate-200 bg-white p-1' onClick={(e) => e.preventDefault()}>
                          <button
                            type='button'
                            aria-label='Giảm số lượng'
                            disabled={mutatingId === item._id || item.quantity <= 1}
                            onClick={() => handleUpdateQuantity(item, item.quantity - 1)}
                            className='grid h-9 w-9 place-items-center rounded-xl text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40'
                          >
                            <Minus size={16} />
                          </button>
                          <span className='w-10 text-center text-sm font-black'>{item.quantity}</span>
                          <button
                            type='button'
                            aria-label='Tăng số lượng'
                            disabled={mutatingId === item._id || item.quantity >= product.quantity}
                            onClick={() => handleUpdateQuantity(item, item.quantity + 1)}
                            className='grid h-9 w-9 place-items-center rounded-xl text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40'
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                        <span className='text-sm font-semibold text-slate-500'>{money(product.price)} / sp</span>
                      </div>
                      <div className='mt-3 inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-1 text-xs font-bold text-slate-500'>
                        <Truck size={14} />
                        Còn {product.quantity} trong kho
                      </div>
                    </div>

                    <div className='text-left sm:text-right'>
                      <div className='text-xs font-bold uppercase tracking-[0.12em] text-slate-400'>Thành tiền</div>
                      <div className='mt-1 text-xl font-black text-ink-950'>{money(product.price * item.quantity)}</div>
                      <button
                        type='button'
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          handleRemoveItem(item._id)
                        }}
                        disabled={mutatingId === item._id}
                        className='mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-rose-500 transition hover:text-rose-700 disabled:opacity-50'
                      >
                        <Trash2 size={14} />
                        Xóa
                      </button>
                    </div>
                  </label>
                )
              })}
            </div>
          )}
        </div>

        <aside className='surface-strong h-fit rounded-3xl p-6 lg:sticky lg:top-28'>
          <div className='flex items-center gap-3'>
            <span className='grid h-11 w-11 place-items-center rounded-2xl bg-ink-950 text-white'>
              <ShoppingBag size={19} />
            </span>
            <div>
              <div className='text-lg font-black text-ink-950'>Tóm tắt thanh toán</div>
              <div className='text-sm font-semibold text-slate-500'>{selectedItems.length} sản phẩm đã chọn</div>
            </div>
          </div>

          <div className='mt-6 space-y-3'>
            <div className='flex justify-between text-sm'>
              <span className='text-slate-500'>Tạm tính</span>
              <span className='font-bold text-ink-950'>{money(subtotal)}</span>
            </div>
            <div className='flex justify-between text-sm'>
              <span className='text-slate-500'>Phí vận chuyển</span>
              <span className='font-bold text-mint-600'>Tính ở bước sau</span>
            </div>
          </div>

          <div className='my-6 h-px bg-slate-200' />

          <div className='flex items-end justify-between gap-4'>
            <span className='text-sm font-bold text-slate-500'>Thanh toán</span>
            <span className='text-2xl font-black text-ink-950'>{money(subtotal)}</span>
          </div>

          <Button full className='mt-6' disabled={isLoading || selectedItems.length === 0 || stockFail} onClick={handleCheckout}>
            Thanh toán ({selectedItems.length})
          </Button>
        </aside>
      </div>
    </div>
  )
}
