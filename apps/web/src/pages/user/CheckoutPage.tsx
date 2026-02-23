import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { toast } from 'sonner'
import Button from '../../components/ui/Button'
import { getCartApi } from '../../services/carts.services'
import { createOrderApi } from '../../services/orders.services'
import { getDeliveryMethodsApi } from '../../services/delivery_methods.services'
import type { CartItem } from '../../models/CartRequests'
import { PaymentMethod } from '../../models/OrderRequests'
import type { DeliveryMethod } from '../../models/DeliveryRequests'

const paymentMethodLabel: Record<PaymentMethod, string> = {
  [PaymentMethod.CASH_ON_DELIVERY]: 'Thanh toán khi nhận hàng (COD)',
  [PaymentMethod.CREDIT_CARD]: 'Thẻ tín dụng / Visa / MasterCard',
  [PaymentMethod.PAYPAL]: 'Thanh toán qua PayPal',
  [PaymentMethod.MOMO]: 'Ví điện tử MoMo'
}

export default function CheckoutPage() {
  const navigate = useNavigate()
  const location = useLocation()

  // lấy id của item được chọn từ CartPage
  const selectedIds: string[] = location.state?.items || []

  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [deliveryMethods, setDeliveryMethods] = useState<DeliveryMethod[]>([])
  const [selectedDelivery, setSelectedDelivery] = useState<string>()
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CASH_ON_DELIVERY)
  const [loading, setLoading] = useState(false)

  const money = (n: number) =>
    n.toLocaleString('vi-VN', {
      style: 'currency',
      currency: 'VND'
    })

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (selectedIds.length === 0) {
          toast.error('Không có sản phẩm được chọn')
          navigate('/user/cart')
          return
        }

        const cartRes = await getCartApi()
        const allItems: CartItem[] = cartRes.data.data.cartItems

        // chỉ lấy id đã select
        const filtered = allItems.filter((item) => selectedIds.includes(item._id))

        if (filtered.length === 0) {
          toast.error('Sản phẩm không hợp lệ')
          navigate('/user/cart')
          return
        }

        setCartItems(filtered)

        const deliveryRes = await getDeliveryMethodsApi()
        const methods: DeliveryMethod[] = deliveryRes.data.result

        const available = methods.filter((m) => m.status === 2)

        setDeliveryMethods(available)

        if (available.length > 0) {
          setSelectedDelivery(available[0]._id)
        }
      } catch {
        toast.error('Không thể tải dữ liệu')
      }
    }

    fetchData()
  }, [])

  const subtotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.product_infor.price * item.quantity, 0),
    [cartItems]
  )

  const handleCheckout = async () => {
    if (!selectedDelivery) {
      toast.error('Vui lòng chọn phương thức giao hàng')
      return
    }

    if (cartItems.length === 0) {
      toast.error('Không có sản phẩm để thanh toán')
      return
    }

    try {
      setLoading(true)

      await createOrderApi({
        items: selectedIds,
        payment_method: paymentMethod,
        delivery_method_id: selectedDelivery
      })

      toast.success('Đặt hàng thành công!')
      navigate('/user/orders')
    } catch {
      toast.error('Đặt hàng thất bại')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='mx-auto grid max-w-[1200px] gap-12 lg:grid-cols-[1.6fr_1fr]'>
      {/* LEFT SIDE */}
      <div className='space-y-10'>
        <h2 className='text-3xl font-extrabold'>Thanh toán</h2>

        {/* PRODUCT LIST */}
        <div className='space-y-4'>
          {cartItems.map((item) => {
            const product = item.product_infor
            const image = product.medias?.[0]?.url

            return (
              <div
                key={item._id}
                className='flex items-center gap-6 rounded-3xl border border-white/10 bg-black/50 p-6 backdrop-blur-xl transition hover:border-white/20'
              >
                <div className='h-24 w-24 overflow-hidden rounded-2xl bg-white/5'>
                  {image && <img src={image} alt={product.name} className='h-full w-full object-cover' />}
                </div>

                <div className='flex-1'>
                  <div className='text-lg font-bold'>{product.name}</div>
                  <div className='mt-1 text-sm text-white/60'>
                    {money(product.price)} × {item.quantity}
                  </div>
                </div>

                <div className='text-xl font-black'>{money(product.price * item.quantity)}</div>
              </div>
            )
          })}
        </div>

        {/* DELIVERY METHOD */}
        <div className='rounded-3xl border border-white/10 bg-black/50 p-6 backdrop-blur-xl'>
          <h3 className='mb-5 text-xl font-extrabold'>Phương thức giao hàng</h3>

          <div className='space-y-3'>
            {deliveryMethods.map((method) => {
              const isSelected = selectedDelivery === method._id

              return (
                <label
                  key={method._id}
                  className={`flex cursor-pointer items-center justify-between rounded-2xl border px-5 py-4 transition
        ${isSelected ? 'border-orange-500 bg-orange-500/10' : 'border-white/10 bg-white/5 hover:border-white/20'}`}
                >
                  <div>
                    <div className='font-semibold'>{method.name}</div>
                    <div className='text-xs text-white/50'>{method.description}</div>
                  </div>

                  <input
                    type='radio'
                    name='deliveryMethod'
                    value={method._id}
                    checked={isSelected}
                    onChange={() => setSelectedDelivery(method._id)}
                    className='h-4 w-4 accent-orange-500'
                  />
                </label>
              )
            })}
          </div>
        </div>

        {/* PAYMENT METHOD */}
        <div className='rounded-3xl border border-white/10 bg-black/50 p-6 backdrop-blur-xl'>
          <h3 className='mb-5 text-xl font-extrabold'>Phương thức thanh toán</h3>

          <div className='space-y-3'>
            {(Object.values(PaymentMethod) as PaymentMethod[]).map((method) => {
              const isSelected = paymentMethod === method

              return (
                <label
                  key={method}
                  className={`flex cursor-pointer items-center justify-between rounded-2xl border px-5 py-4 transition
                    ${
                      isSelected
                        ? 'border-orange-500 bg-orange-500/10'
                        : 'border-white/10 bg-white/5 hover:border-white/20'
                    }`}
                >
                  <span className='font-semibold'>{paymentMethodLabel[method]}</span>

                  <input
                    type='radio'
                    checked={isSelected}
                    onChange={() => setPaymentMethod(method)}
                    className='h-4 w-4 accent-orange-500'
                  />
                </label>
              )
            })}
          </div>
        </div>
      </div>

      {/* RIGHT SUMMARY */}
      <div className='h-fit rounded-3xl border border-white/10 bg-black/60 p-8 backdrop-blur-xl shadow-lg lg:sticky lg:top-24'>
        <div className='mb-6 text-xl font-extrabold'>Tóm tắt đơn hàng</div>

        <div className='flex justify-between text-sm'>
          <span className='text-white/60'>Tổng tiền</span>
          <span>{money(subtotal)}</span>
        </div>

        <div className='my-6 h-px bg-white/10' />

        <div className='flex justify-between text-3xl font-black'>
          <span>Thanh toán</span>
          <span>{money(subtotal)}</span>
        </div>

        <Button
          full
          variant='gradient'
          className='mt-8 h-14 text-lg font-bold'
          onClick={handleCheckout}
          loading={loading}
          disabled={loading}
        >
          Xác nhận đặt hàng
        </Button>
      </div>
    </div>
  )
}
