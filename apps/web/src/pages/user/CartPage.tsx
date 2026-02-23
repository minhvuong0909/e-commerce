import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useState, useMemo } from 'react'
import { toast } from 'sonner'
import Button from '../../components/ui/Button'
import Alert from '../../components/ui/Alert'
import { getCartApi } from '../../services/carts.services'
import type { CartItem } from '../../models/CartRequests'

export default function CartPage() {
  const navigate = useNavigate()

  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const money = (n: number) =>
    n.toLocaleString('vi-VN', {
      style: 'currency',
      currency: 'VND'
    })

  useEffect(() => {
    const fetchCart = async () => {
      try {
        setLoading(true)
        const res = await getCartApi()

        const items = res.data.data.cartItems
        setCartItems(items)

        // mặc định chọn tất cả
        setSelectedItems(items.map((i: CartItem) => i._id))
      } catch {
        toast.error('Không thể tải giỏ hàng')
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
    return <div className='flex justify-center py-16 text-white/60'>Đang tải giỏ hàng...</div>
  }

  if (cartItems.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center rounded-3xl border border-white/10 bg-black/50 p-12 text-center backdrop-blur-xl'>
        <div className='text-xl font-extrabold'>Giỏ hàng trống</div>
        <Link to='/user/home'>
          <Button className='mt-6' variant='gradient'>
            Bắt đầu mua sắm
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      {/* HEADER */}
      <div className='flex items-end justify-between'>
        <h1 className='text-2xl font-extrabold'>Giỏ hàng ({cartItems.length} sản phẩm)</h1>

        <button onClick={toggleAll} className='text-sm font-semibold text-orange-400 hover:text-orange-300'>
          {selectedItems.length === cartItems.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
        </button>
      </div>

      {stockFail && (
        <Alert variant='warning' title='Số lượng vượt tồn kho' desc='Vui lòng điều chỉnh trước khi thanh toán.' />
      )}

      <div className='grid gap-8 lg:grid-cols-[1.6fr_1fr]'>
        {/* LEFT – CART ITEMS */}
        <div className='space-y-4'>
          {cartItems.map((item) => {
            const product = item.product_infor
            const image = product.medias?.[0]?.url
            const isSelected = selectedItems.includes(item._id)

            return (
              <label
                key={item._id}
                className={`group relative flex cursor-pointer gap-5 rounded-3xl border p-5 backdrop-blur-xl transition
                ${
                  isSelected
                    ? 'border-orange-500 bg-orange-500/10'
                    : 'border-white/10 bg-black/50 hover:border-white/20'
                }`}
              >
                <input type='checkbox' checked={isSelected} onChange={() => toggleItem(item._id)} className='hidden' />

                <div
                  className={`mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition
                  ${isSelected ? 'border-orange-500 bg-orange-500' : 'border-white/30'}`}
                >
                  {isSelected && (
                    <svg
                      className='h-3.5 w-3.5 text-white'
                      fill='none'
                      viewBox='0 0 24 24'
                      stroke='currentColor'
                      strokeWidth={3}
                    >
                      <path strokeLinecap='round' strokeLinejoin='round' d='M5 13l4 4L19 7' />
                    </svg>
                  )}
                </div>

                <div className='h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-white/5'>
                  {image && (
                    <img
                      src={image}
                      alt={product.name}
                      className='h-full w-full object-cover transition duration-300 group-hover:scale-105'
                    />
                  )}
                </div>

                <div className='flex-1'>
                  <div className='text-lg font-bold'>{product.name}</div>

                  <div className='mt-1 text-sm text-white/60'>
                    {money(product.price)} × {item.quantity}
                  </div>

                  <div className='mt-2 text-xl font-black'>{money(product.price * item.quantity)}</div>
                </div>
              </label>
            )
          })}
        </div>

        {/* RIGHT – SUMMARY */}
        <div className='h-fit rounded-3xl border border-white/10 bg-black/60 p-6 backdrop-blur-xl shadow-lg lg:sticky lg:top-24'>
          <div className='mb-4 text-lg font-extrabold'>Tóm tắt thanh toán</div>

          <div className='flex justify-between text-sm'>
            <span className='text-white/60'>Tổng tiền</span>
            <span>{money(subtotal)}</span>
          </div>

          <div className='my-5 h-px bg-white/10' />

          <div className='flex justify-between text-2xl font-black'>
            <span>Thanh toán</span>
            <span>{money(subtotal)}</span>
          </div>

          <Button
            full
            variant='gradient'
            className='mt-6 h-12 text-base font-bold'
            disabled={selectedItems.length === 0 || stockFail}
            onClick={handleCheckout}
          >
            Thanh toán ({selectedItems.length})
          </Button>
        </div>
      </div>
    </div>
  )
}
