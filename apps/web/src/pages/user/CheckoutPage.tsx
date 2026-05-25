import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { CreditCard, PackageCheck, ShieldCheck, Truck } from 'lucide-react'
import { toast } from 'sonner'
import Button from '../../components/ui/Button'
import StatusBadge from '../../components/ui/StatusBadge'
import { getCartApi } from '../../services/carts.services'
import { getDeliveryMethodsApi } from '../../services/delivery_methods.services'
import { createOrderApi } from '../../services/orders.services'
import type { CartItem } from '../../models/CartRequests'
import type { DeliveryMethod } from '../../models/DeliveryRequests'
import { PaymentMethod } from '../../models/OrderRequests'
import money from '../../utils/money'
import cn from '../../utils/cn'

const paymentMethodLabel: Record<PaymentMethod, string> = {
  [PaymentMethod.CASH_ON_DELIVERY]: 'Thanh toán khi nhận hàng (COD)',
  [PaymentMethod.CREDIT_CARD]: 'Thẻ tín dụng / Visa / MasterCard',
  [PaymentMethod.PAYPAL]: 'Thanh toán qua PayPal',
  [PaymentMethod.MOMO]: 'Ví điện tử MoMo'
}

export default function CheckoutPage() {
  const navigate = useNavigate()
  const location = useLocation()

  const selectedIds: string[] = location.state?.items || []

  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [deliveryMethods, setDeliveryMethods] = useState<DeliveryMethod[]>([])
  const [selectedDelivery, setSelectedDelivery] = useState<string>()
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CASH_ON_DELIVERY)
  const [loading, setLoading] = useState(false)

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
    <div className='mx-auto max-w-7xl px-4 py-8 md:px-6'>
      <div className='mb-6 flex flex-col gap-2'>
        <p className='text-xs font-black uppercase tracking-[0.18em] text-brand-600'>Secure checkout</p>
        <h1 className='text-3xl font-black tracking-tight text-ink-950'>Thanh toán</h1>
        <p className='max-w-2xl text-sm leading-6 text-slate-500'>
          Xác nhận sản phẩm, chọn giao hàng và phương thức thanh toán trước khi đặt hàng.
        </p>
      </div>

      <div className='grid gap-8 lg:grid-cols-[1.55fr_0.88fr]'>
        <div className='space-y-6'>
          <section className='surface-card rounded-3xl p-5 md:p-6'>
            <div className='mb-5 flex items-center gap-3'>
              <span className='grid h-10 w-10 place-items-center rounded-2xl bg-slate-100 text-ink-950'>
                <PackageCheck size={18} />
              </span>
              <h2 className='text-lg font-black text-ink-950'>Sản phẩm</h2>
            </div>

            <div className='space-y-3'>
              {cartItems.map((item) => {
                const product = item.product_infor
                const image = product.medias?.[0]?.url

                return (
                  <div key={item._id} className='flex flex-col gap-4 rounded-3xl border border-slate-200 p-4 sm:flex-row sm:items-center'>
                    <div className='h-24 w-full overflow-hidden rounded-2xl bg-slate-100 sm:w-24'>
                      {image ? <img src={image} alt={product.name} className='h-full w-full object-cover' /> : null}
                    </div>

                    <div className='min-w-0 flex-1'>
                      <div className='line-clamp-2 text-base font-black text-ink-950'>{product.name}</div>
                      <div className='mt-1 text-sm font-semibold text-slate-500'>
                        {money(product.price)} x {item.quantity}
                      </div>
                    </div>

                    <div className='text-left text-lg font-black text-ink-950 sm:text-right'>
                      {money(product.price * item.quantity)}
                    </div>
                  </div>
                )
              })}
            </div>
          </section>

          <section className='surface-card rounded-3xl p-5 md:p-6'>
            <div className='mb-5 flex items-center gap-3'>
              <span className='grid h-10 w-10 place-items-center rounded-2xl bg-brand-50 text-brand-700'>
                <Truck size={18} />
              </span>
              <h2 className='text-lg font-black text-ink-950'>Phương thức giao hàng</h2>
            </div>

            <div className='grid gap-3 md:grid-cols-2'>
              {deliveryMethods.map((method) => {
                const isSelected = selectedDelivery === method._id

                return (
                  <label
                    key={method._id}
                    className={cn(
                      'cursor-pointer rounded-3xl border p-4 transition',
                      isSelected ? 'border-brand-500/50 bg-brand-50 ring-4 ring-brand-500/10' : 'border-slate-200 hover:border-slate-300'
                    )}
                  >
                    <div className='flex items-start justify-between gap-3'>
                      <div>
                        <div className='font-black text-ink-950'>{method.name}</div>
                        <div className='mt-1 text-sm leading-6 text-slate-500'>{method.description}</div>
                      </div>

                      <input
                        type='radio'
                        name='deliveryMethod'
                        value={method._id}
                        checked={isSelected}
                        onChange={() => setSelectedDelivery(method._id)}
                        className='mt-1 h-4 w-4 accent-brand-600'
                      />
                    </div>
                  </label>
                )
              })}
            </div>
          </section>

          <section className='surface-card rounded-3xl p-5 md:p-6'>
            <div className='mb-5 flex items-center gap-3'>
              <span className='grid h-10 w-10 place-items-center rounded-2xl bg-slate-100 text-ink-950'>
                <CreditCard size={18} />
              </span>
              <h2 className='text-lg font-black text-ink-950'>Phương thức thanh toán</h2>
            </div>

            <div className='grid gap-3 md:grid-cols-2'>
              {(Object.values(PaymentMethod) as PaymentMethod[]).map((method) => {
                const isSelected = paymentMethod === method

                return (
                  <label
                    key={method}
                    className={cn(
                      'flex cursor-pointer items-center justify-between gap-3 rounded-3xl border p-4 transition',
                      isSelected ? 'border-ink-950 bg-slate-50 ring-4 ring-slate-950/5' : 'border-slate-200 hover:border-slate-300'
                    )}
                  >
                    <span className='text-sm font-black text-ink-950'>{paymentMethodLabel[method]}</span>
                    <input
                      type='radio'
                      checked={isSelected}
                      onChange={() => setPaymentMethod(method)}
                      className='h-4 w-4 accent-ink-950'
                    />
                  </label>
                )
              })}
            </div>
          </section>
        </div>

        <aside className='surface-strong h-fit rounded-3xl p-6 lg:sticky lg:top-28'>
          <div className='mb-5 flex items-center justify-between gap-4'>
            <div>
              <div className='text-lg font-black text-ink-950'>Tóm tắt đơn hàng</div>
              <div className='mt-1 text-sm font-semibold text-slate-500'>{cartItems.length} sản phẩm</div>
            </div>
            <StatusBadge tone='success'>Bảo mật</StatusBadge>
          </div>

          <div className='space-y-3'>
            <div className='flex justify-between text-sm'>
              <span className='text-slate-500'>Tổng tiền</span>
              <span className='font-bold text-ink-950'>{money(subtotal)}</span>
            </div>
            <div className='flex justify-between text-sm'>
              <span className='text-slate-500'>Phí giao hàng</span>
              <span className='font-bold text-slate-700'>Theo phương thức</span>
            </div>
          </div>

          <div className='my-6 h-px bg-slate-200' />

          <div className='flex justify-between gap-4'>
            <span className='text-sm font-bold text-slate-500'>Thanh toán</span>
            <span className='text-2xl font-black text-ink-950'>{money(subtotal)}</span>
          </div>

          <Button full className='mt-6' onClick={handleCheckout} loading={loading} disabled={loading}>
            Xác nhận đặt hàng
          </Button>

          <div className='mt-5 flex items-center gap-2 rounded-2xl bg-slate-50 p-3 text-xs font-semibold leading-5 text-slate-500'>
            <ShieldCheck size={16} className='shrink-0 text-mint-600' />
            Thông tin thanh toán được xử lý qua kết nối bảo mật.
          </div>
        </aside>
      </div>
    </div>
  )
}
