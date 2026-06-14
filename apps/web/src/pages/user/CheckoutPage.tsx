import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { CreditCard, Loader2, MapPin, PackageCheck, ShieldCheck, Truck } from 'lucide-react'
import { toast } from 'sonner'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import StatusBadge from '../../components/ui/StatusBadge'
import ShippingMapPicker from '../../components/checkout/ShippingMapPicker'
import { getCartApi } from '../../services/carts.services'
import { getDeliveryMethodsApi } from '../../services/delivery_methods.services'
import { createOrderApi } from '../../services/orders.services'
import { getShippingQuoteApi, getStoreInfoApi, reverseGeocodeApi, type ShippingQuote, type StoreInfo } from '../../services/shipping.services'
import type { CartItem } from '../../models/CartRequests'
import type { DeliveryMethod } from '../../models/DeliveryRequests'
import { PaymentMethod } from '../../models/OrderRequests'
import { ROUTE_PATHS } from '../../routes/route.paths'
import money from '../../utils/money'
import cn from '../../utils/cn'
import { getApiErrorMessage } from '../../utils/apiError'

type ShippingForm = {
  recipient_name: string
  phone: string
  note: string
  address_line: string
  city: string
  district: string
}

type AddressMode = 'manual' | 'map'

const paymentMethodLabel: Record<PaymentMethod, string> = {
  [PaymentMethod.CASH_ON_DELIVERY]: 'Thanh toán khi nhận hàng (COD)',
  [PaymentMethod.CREDIT_CARD]: 'Thẻ tín dụng / Visa / MasterCard',
  [PaymentMethod.PAYPAL]: 'Thanh toán qua PayPal',
  [PaymentMethod.MOMO]: 'Ví điện tử MoMo'
}

export default function CheckoutPage() {
  const navigate = useNavigate()
  const location = useLocation()

  const selectedIds: string[] = useMemo(() => location.state?.items || [], [location.state])

  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [deliveryMethods, setDeliveryMethods] = useState<DeliveryMethod[]>([])
  const [selectedDelivery, setSelectedDelivery] = useState<string>()
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CASH_ON_DELIVERY)
  const [loading, setLoading] = useState(false)
  const [addressMode, setAddressMode] = useState<AddressMode>('manual')
  const [storeInfo, setStoreInfo] = useState<StoreInfo | null>(null)
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [quote, setQuote] = useState<ShippingQuote | null>(null)
  const [quoteLoading, setQuoteLoading] = useState(false)
  const [quoteError, setQuoteError] = useState<string | null>(null)
  const [shipping, setShipping] = useState<ShippingForm>({
    recipient_name: '',
    phone: '',
    note: '',
    address_line: '',
    city: '',
    district: ''
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (selectedIds.length === 0) {
          toast.error('Không có sản phẩm được chọn')
          navigate(ROUTE_PATHS.USER_CART)
          return
        }

        const [cartRes, deliveryRes, storeRes] = await Promise.all([
          getCartApi(),
          getDeliveryMethodsApi(),
          getStoreInfoApi()
        ])

        const allItems: CartItem[] = cartRes.data.data.cartItems
        const filtered = allItems.filter((item) => selectedIds.includes(item._id))

        if (filtered.length === 0) {
          toast.error('Sản phẩm không hợp lệ')
          navigate(ROUTE_PATHS.USER_CART)
          return
        }

        setCartItems(filtered)
        setStoreInfo(storeRes.data.result)

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
  }, [navigate, selectedIds])

  const subtotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.product_infor.price * item.quantity, 0),
    [cartItems]
  )

  const shippingFee = quote?.shipping_fee ?? 0
  const total = subtotal + shippingFee

  const fetchQuote = useCallback(async () => {
    if (!selectedDelivery) return

    const address_line = shipping.address_line.trim()
    const hasCoords = addressMode === 'map' && coords != null

    if (!hasCoords && !address_line) {
      setQuote(null)
      setQuoteError(null)
      return
    }

    try {
      setQuoteLoading(true)
      setQuoteError(null)

      const res = await getShippingQuoteApi({
        address_line: address_line || undefined,
        city: shipping.city.trim() || undefined,
        district: shipping.district.trim() || undefined,
        lat: addressMode === 'map' ? coords?.lat : undefined,
        lng: addressMode === 'map' ? coords?.lng : undefined,
        delivery_method_id: selectedDelivery
      })

      setQuote(res.data.result)
    } catch (err) {
      setQuote(null)
      setQuoteError(getApiErrorMessage(err, 'Không thể tính phí giao hàng'))
    } finally {
      setQuoteLoading(false)
    }
  }, [addressMode, coords, selectedDelivery, shipping.address_line, shipping.city, shipping.district])

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchQuote()
    }, addressMode === 'manual' ? 600 : 200)

    return () => clearTimeout(timer)
  }, [fetchQuote, addressMode])

  const handleMapPick = async (picked: { lat: number; lng: number }) => {
    setCoords(picked)
    setAddressMode('map')

    try {
      const res = await reverseGeocodeApi(picked.lat, picked.lng)
      const result = res.data.result
      setShipping((prev) => ({
        ...prev,
        address_line: result.address_line || prev.address_line,
        city: result.city || prev.city,
        district: result.district || prev.district
      }))
    } catch {
      // quote vẫn chạy theo tọa độ
    }
  }

  const handleCheckout = async () => {
    if (!selectedDelivery) {
      toast.error('Vui lòng chọn phương thức giao hàng')
      return
    }

    if (cartItems.length === 0) {
      toast.error('Không có sản phẩm để thanh toán')
      return
    }

    const recipient_name = shipping.recipient_name.trim()
    const phone = shipping.phone.trim()
    const address_line = shipping.address_line.trim()
    if (!recipient_name || !phone || !address_line) {
      toast.error('Vui lòng nhập đầy đủ thông tin nhận hàng')
      return
    }

    if (!quote || quoteLoading) {
      toast.error('Vui lòng chờ hệ thống tính phí giao hàng')
      return
    }

    if (quoteError) {
      toast.error(quoteError)
      return
    }

    try {
      setLoading(true)

      const res = await createOrderApi({
        items: selectedIds,
        payment_method: paymentMethod,
        delivery_method_id: selectedDelivery,
        recipient_name,
        phone,
        note: shipping.note.trim() || undefined,
        address_line,
        city: shipping.city.trim() || undefined,
        district: shipping.district.trim() || undefined,
        lat: quote.lat,
        lng: quote.lng,
        address_source: addressMode
      })

      const orderId = res.data?.result?.insertedId as string | undefined
      toast.success('Đặt hàng thành công!')

      if (orderId && (paymentMethod === PaymentMethod.MOMO || paymentMethod === PaymentMethod.PAYPAL)) {
        navigate(ROUTE_PATHS.USER_ORDER_DETAIL(orderId))
        return
      }

      navigate(ROUTE_PATHS.USER_ORDERS)
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Đặt hàng thất bại'))
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
          Nhập địa chỉ hoặc chọn trên bản đồ. Phí ship được tính theo khoảng cách từ cửa hàng (tối đa 25 km).
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
                  <div
                    key={item._id}
                    className='flex flex-col gap-4 rounded-3xl border border-slate-200 p-4 sm:flex-row sm:items-center'
                  >
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
              <span className='grid h-10 w-10 place-items-center rounded-2xl bg-mint-50 text-mint-700'>
                <MapPin size={18} />
              </span>
              <h2 className='text-lg font-black text-ink-950'>Địa chỉ nhận hàng</h2>
            </div>

            <div className='mb-4 grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1'>
              {([
                { id: 'manual' as const, label: 'Nhập địa chỉ' },
                { id: 'map' as const, label: 'Chọn trên bản đồ' }
              ]).map((tab) => (
                <button
                  key={tab.id}
                  type='button'
                  onClick={() => {
                    setAddressMode(tab.id)
                    if (tab.id === 'manual') setCoords(null)
                  }}
                  className={cn(
                    'rounded-xl px-3 py-2 text-sm font-bold transition',
                    addressMode === tab.id ? 'bg-white text-ink-950 shadow-sm' : 'text-slate-500 hover:text-ink-950'
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className='grid gap-4 md:grid-cols-2'>
              <Input
                label='Họ tên người nhận'
                name='recipient_name'
                value={shipping.recipient_name}
                onChange={(e) => setShipping((prev) => ({ ...prev, recipient_name: e.target.value }))}
                required
              />
              <Input
                label='Số điện thoại'
                name='phone'
                value={shipping.phone}
                onChange={(e) => setShipping((prev) => ({ ...prev, phone: e.target.value }))}
                required
              />
              <div className='md:col-span-2'>
                <Input
                  label='Địa chỉ chi tiết'
                  name='address_line'
                  value={shipping.address_line}
                  onChange={(e) => setShipping((prev) => ({ ...prev, address_line: e.target.value }))}
                  required
                />
              </div>
              <Input
                label='Thành phố'
                name='city'
                value={shipping.city}
                onChange={(e) => setShipping((prev) => ({ ...prev, city: e.target.value }))}
              />
              <Input
                label='Quận / Huyện'
                name='district'
                value={shipping.district}
                onChange={(e) => setShipping((prev) => ({ ...prev, district: e.target.value }))}
              />
              <div className='md:col-span-2'>
                <label className='mb-2 block text-sm font-bold text-ink-900'>Ghi chú giao hàng</label>
                <textarea
                  value={shipping.note}
                  onChange={(e) => setShipping((prev) => ({ ...prev, note: e.target.value }))}
                  rows={3}
                  placeholder='Ví dụ: Giao giờ hành chính, gọi trước 15 phút...'
                  className='w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-brand-500/50 focus:ring-4 focus:ring-brand-500/10'
                />
              </div>
            </div>

            {addressMode === 'map' && storeInfo ? (
              <div className='mt-4'>
                <ShippingMapPicker
                  storeLat={storeInfo.lat}
                  storeLng={storeInfo.lng}
                  value={coords}
                  onPick={handleMapPick}
                />
              </div>
            ) : null}

            <div className='mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm'>
              {quoteLoading ? (
                <span className='inline-flex items-center gap-2 font-semibold text-slate-600'>
                  <Loader2 size={16} className='animate-spin' />
                  Đang tính phí giao hàng...
                </span>
              ) : quoteError ? (
                <span className='font-semibold text-rose-600'>{quoteError}</span>
              ) : quote ? (
                <div className='space-y-1 font-semibold text-slate-700'>
                  <div>Khoảng cách: {quote.distance_km} km</div>
                  <div>Phí cơ bản: {money(quote.base_shipping_fee)}</div>
                  {quote.express_surcharge > 0 ? <div>Phụ phí hỏa tốc: {money(quote.express_surcharge)}</div> : null}
                </div>
              ) : (
                <span className='font-semibold text-slate-500'>Nhập địa chỉ hoặc chọn trên bản đồ để xem phí ship.</span>
              )}
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
                      isSelected
                        ? 'border-brand-500/50 bg-brand-50 ring-4 ring-brand-500/10'
                        : 'border-slate-200 hover:border-slate-300'
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
                      isSelected
                        ? 'border-ink-950 bg-slate-50 ring-4 ring-slate-950/5'
                        : 'border-slate-200 hover:border-slate-300'
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
              <span className='text-slate-500'>Tạm tính</span>
              <span className='font-bold text-ink-950'>{money(subtotal)}</span>
            </div>
            <div className='flex justify-between text-sm'>
              <span className='text-slate-500'>Phí giao hàng</span>
              <span className='font-bold text-slate-700'>
                {quoteLoading ? 'Đang tính...' : quote ? money(shippingFee) : 'Chưa tính'}
              </span>
            </div>
            {quote ? (
              <div className='rounded-2xl bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-500'>
                {quote.distance_km} km từ cửa hàng · Giao trong bán kính 25 km
              </div>
            ) : null}
          </div>

          <div className='my-6 h-px bg-slate-200' />

          <div className='flex justify-between gap-4'>
            <span className='text-sm font-bold text-slate-500'>Thanh toán</span>
            <span className='text-2xl font-black text-ink-950'>{money(total)}</span>
          </div>

          <Button
            full
            className='mt-6'
            onClick={handleCheckout}
            loading={loading}
            disabled={loading || quoteLoading || !quote || Boolean(quoteError)}
          >
            Xác nhận đặt hàng
          </Button>

          <div className='mt-5 flex items-center gap-2 rounded-2xl bg-slate-50 p-3 text-xs font-semibold leading-5 text-slate-500'>
            <ShieldCheck size={16} className='shrink-0 text-mint-600' />
            Phí ship được tính bằng OpenStreetMap Routing (OSRM) từ 160 Lã Xuân Oai.
          </div>
        </aside>
      </div>
    </div>
  )
}
