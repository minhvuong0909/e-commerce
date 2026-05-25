import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Check, PackageOpen, ShoppingBag, Truck } from 'lucide-react'
import { toast } from 'sonner'
import Alert from '../../components/ui/Alert'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import { getCartApi } from '../../services/carts.services'
import type { CartItem } from '../../models/CartRequests'
import money from '../../utils/money'
import cn from '../../utils/cn'

export default function CartPage() {
  const navigate = useNavigate()

  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchCart = async () => {
      try {
        setLoading(true)
        const res = await getCartApi()

        const items = res.data.data.cartItems
        setCartItems(items)
        setSelectedItems(items.map((i: CartItem) => i._id))
      } finally {
        setLoading(false)
      }
    }

    fetchCart()
  }, [])

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

    navigate('/user/checkout', {
      state: { items: selectedItems }
    })
  }

  if (loading) {
    return (
      <div className='mx-auto max-w-7xl px-4 py-10 md:px-6'>
        <div className='grid gap-8 lg:grid-cols-[1.6fr_0.8fr]'>
          <div className='space-y-4'>
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className='h-36 animate-pulse rounded-3xl bg-white shadow-sm' />
            ))}
          </div>
          <div className='h-72 animate-pulse rounded-3xl bg-white shadow-sm' />
        </div>
      </div>
    )
  }

  if (cartItems.length === 0) {
    return (
      <div className='mx-auto max-w-5xl px-4 py-10 md:px-6'>
        <EmptyState
          icon={<PackageOpen size={26} />}
          title='Giỏ hàng trống'
          desc='Khám phá sản phẩm nổi bật và thêm những món phù hợp vào giỏ hàng.'
          action={
            <Link
              to='/user/home'
              className='inline-flex min-h-12 items-center justify-center rounded-2xl bg-ink-950 px-5 text-sm font-bold text-white shadow-card transition hover:-translate-y-0.5 hover:bg-brand-600'
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
          <p className='mt-2 text-sm text-slate-500'>{cartItems.length} sản phẩm trong giỏ của bạn</p>
        </div>

        <button onClick={toggleAll} className='text-sm font-black text-brand-600 transition hover:text-brand-900'>
          {selectedItems.length === cartItems.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
        </button>
      </div>

      {stockFail ? (
        <div className='mb-5'>
          <Alert variant='warning' title='Số lượng vượt tồn kho' desc='Vui lòng điều chỉnh trước khi thanh toán.' />
        </div>
      ) : null}

      <div className='grid gap-8 lg:grid-cols-[1.6fr_0.86fr]'>
        <div className='space-y-4'>
          {cartItems.map((item) => {
            const product = item.product_infor
            const image = product.medias?.[0]?.url
            const isSelected = selectedItems.includes(item._id)

            return (
              <label
                key={item._id}
                className={cn(
                  'surface-card interactive-lift group relative grid cursor-pointer gap-4 rounded-3xl p-4 transition sm:grid-cols-[auto_112px_1fr_auto] sm:items-center',
                  isSelected ? 'border-brand-500/[0.45] ring-4 ring-brand-500/10' : 'border-slate-200 hover:border-slate-300'
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
                    <img src={image} alt={product.name} className='h-full w-full object-cover transition duration-300 group-hover:scale-105' />
                  ) : null}
                </div>

                <div className='min-w-0'>
                  <div className='line-clamp-2 text-base font-black text-ink-950'>{product.name}</div>
                  <div className='mt-2 text-sm font-semibold text-slate-500'>
                    {money(product.price)} x {item.quantity}
                  </div>
                  <div className='mt-3 inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-1 text-xs font-bold text-slate-500'>
                    <Truck size={14} />
                    Còn {product.quantity} trong kho
                  </div>
                </div>

                <div className='text-left sm:text-right'>
                  <div className='text-xs font-bold uppercase tracking-[0.12em] text-slate-400'>Thành tiền</div>
                  <div className='mt-1 text-xl font-black text-ink-950'>{money(product.price * item.quantity)}</div>
                </div>
              </label>
            )
          })}
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

          <Button full className='mt-6' disabled={selectedItems.length === 0 || stockFail} onClick={handleCheckout}>
            Thanh toán ({selectedItems.length})
          </Button>
        </aside>
      </div>
    </div>
  )
}
