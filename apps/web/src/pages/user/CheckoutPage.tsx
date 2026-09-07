import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { BadgeCheck, CreditCard, Loader2, MapPin, PackageCheck, ShieldCheck, Truck } from 'lucide-react'
import { toast } from 'sonner'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import ShippingMapPicker from '../../components/checkout/ShippingMapPicker'
import SavedAddressesPanel from '../../components/profile/SavedAddressesPanel'
import { getCartApi } from '../../services/carts.services'
import { getDeliveryMethodsApi } from '../../services/delivery_methods.services'
import { createGuestOrderApi, createOrderApi } from '../../services/orders.services'
import { getShippingQuoteApi, getStoreInfoApi, reverseGeocodeApi, type ShippingQuote, type StoreInfo } from '../../services/shipping.services'
import { createSavedAddressApi, getSavedAddressesApi, type SavedAddress } from '../../services/user_addresses.services'
import { getPayosPaymentUrlApi } from '../../services/payment.services'
import { validateVoucherApi, type VoucherValidationResult } from '../../services/vouchers.services'
import type { CartItem } from '../../models/CartRequests'
import type { DeliveryMethod } from '../../models/DeliveryRequests'
import { PaymentMethod } from '../../models/OrderRequests'
import { ROUTE_PATHS } from '../../routes/route.paths'
import cn from '../../utils/cn'
import money from '../../utils/money'
import { getApiErrorMessage } from '../../utils/apiError'
import { formatImageUrl } from '../../utils/formatImageUrl'
import { getToken } from '../../utils/authSession'

type ShippingForm = {
  recipient_name: string
  phone: string
  note: string
  address_line: string
  city: string
  district: string
}

type AddressMode = 'manual' | 'map'

const panelClass = 'rounded-lg border border-[#eaded8] bg-white'

const paymentMethodLabel: Record<PaymentMethod, string> = {
  [PaymentMethod.CASH_ON_DELIVERY]: 'Thanh toán khi nhận hàng (COD)',
  [PaymentMethod.CREDIT_CARD]: 'Thẻ tín dụng / Visa / MasterCard',
  [PaymentMethod.PAYPAL]: 'Thanh toán qua PayPal',
  [PaymentMethod.MOMO]: 'Ví điện tử MoMo',
  [PaymentMethod.PAYOS]: 'Chuyển khoản (PayOS)'
}

function TrustBadges({ compact = false }: { compact?: boolean }) {
  const items = [
    { icon: BadgeCheck, label: 'Hàng chính hãng' },
    { icon: ShieldCheck, label: 'Thanh toán bảo mật' },
    { icon: Truck, label: 'Giao trong bán kính 25km' }
  ]

  return (
    <div
      className={cn(
        'flex flex-wrap gap-2',
        compact ? 'justify-center' : 'rounded-lg border border-[#eaded8] bg-[#fdf8f6] p-3'
      )}
    >
      {items.map(({ icon: Icon, label }) => (
        <span
          key={label}
          className='inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[11px] font-semibold text-[#6b5f59] ring-1 ring-[#eaded8]'
        >
          <Icon size={13} className='text-[#b07a72]' />
          {label}
        </span>
      ))}
    </div>
  )
}

export default function CheckoutPage() {
  const navigate = useNavigate()
  const location = useLocation()

  const selectedIds: string[] = useMemo(() => location.state?.items || [], [location.state])
  const guestItems: CartItem[] = useMemo(() => location.state?.guestItems || [], [location.state])
  const isGuestCheckout = guestItems.length > 0
  const initialVoucherCode: string = useMemo(() => location.state?.voucher_code || '', [location.state])

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
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null)
  const [saveThisAddress, setSaveThisAddress] = useState(false)
  const [voucherCode, setVoucherCode] = useState(initialVoucherCode)
  const [voucher, setVoucher] = useState<VoucherValidationResult | null>(null)
  const [voucherLoading, setVoucherLoading] = useState(false)

  const applySavedAddress = useCallback((address: SavedAddress) => {
    setSelectedAddressId(address._id)
    setShipping({
      recipient_name: address.recipient_name,
      phone: address.phone,
      note: address.note || '',
      address_line: address.address_line,
      city: address.city || '',
      district: address.district || ''
    })
    setCoords({ lat: address.lat, lng: address.lng })
    setAddressMode(address.address_source || 'manual')
    setSaveThisAddress(false)
  }, [])

  const patchShipping = (patch: Partial<ShippingForm>) => {
    setSelectedAddressId(null)
    setShipping((prev) => ({ ...prev, ...patch }))
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!isGuestCheckout && selectedIds.length === 0) {
          toast.error('Không có sản phẩm được chọn')
          navigate(ROUTE_PATHS.USER_CART)
          return
        }

        const [cartRes, deliveryRes, storeRes, addressesRes] = await Promise.all([
          isGuestCheckout ? Promise.resolve(null) : getCartApi(),
          getDeliveryMethodsApi(),
          getStoreInfoApi(),
          getToken() ? getSavedAddressesApi().catch(() => null) : Promise.resolve(null)
        ])

        const allItems: CartItem[] = isGuestCheckout ? guestItems : cartRes?.data.data.cartItems || []
        const filtered = isGuestCheckout ? allItems : allItems.filter((item) => selectedIds.includes(item._id))

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

        const addresses = addressesRes?.data?.result ?? []
        const defaultAddress = addresses.find((item) => item.is_default) || addresses[0]
        if (defaultAddress) {
          applySavedAddress(defaultAddress)
        }
      } catch {
        toast.error('Không thể tải dữ liệu')
      }
    }

    fetchData()
  }, [navigate, selectedIds, guestItems, isGuestCheckout, applySavedAddress])

  const subtotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.product_infor.price * item.quantity, 0),
    [cartItems]
  )

  const shippingFee = quote?.shipping_fee ?? 0
  const discount = voucher?.discount || 0
  const total = Math.max(0, subtotal - discount) + shippingFee

  const applyVoucher = useCallback(async () => {
    if (!voucherCode.trim() || subtotal <= 0) return
    try {
      setVoucherLoading(true)
      const res = await validateVoucherApi(voucherCode, subtotal)
      setVoucher(res.data.result)
      toast.success(`Đã áp dụng mã ${res.data.result.voucher.code}`)
    } catch (err) {
      setVoucher(null)
      toast.error(getApiErrorMessage(err, 'Mã giảm giá không hợp lệ'))
    } finally {
      setVoucherLoading(false)
    }
  }, [subtotal, voucherCode])

  const hasAutoAppliedVoucher = useRef(false)
  useEffect(() => {
    if (initialVoucherCode && subtotal > 0 && !voucher && !voucherLoading && !hasAutoAppliedVoucher.current) {
      hasAutoAppliedVoucher.current = true
      const timer = setTimeout(() => {
        void applyVoucher()
      }, 0)
      return () => clearTimeout(timer)
    }
  }, [applyVoucher, initialVoucherCode, subtotal, voucher, voucherLoading])

  const fetchQuote = useCallback(async () => {
    if (!selectedDelivery) return

    const address_line = shipping.address_line.trim()
    const hasCoords = coords != null

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
        lat: coords?.lat,
        lng: coords?.lng,
        delivery_method_id: selectedDelivery
      })

      setQuote(res.data.result)
    } catch (err) {
      setQuote(null)
      setQuoteError(getApiErrorMessage(err, 'Không thể tính phí giao hàng'))
    } finally {
      setQuoteLoading(false)
    }
  }, [coords, selectedDelivery, shipping.address_line, shipping.city, shipping.district])

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchQuote()
    }, addressMode === 'manual' ? 600 : 200)

    return () => clearTimeout(timer)
  }, [fetchQuote, addressMode])

  const handleMapPick = async (picked: { lat: number; lng: number }) => {
    setSelectedAddressId(null)
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

      const commonPayload = {
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
        address_source: addressMode,
        voucher_code: voucher?.voucher.code
      }

      const res = isGuestCheckout
        ? await createGuestOrderApi({
            ...commonPayload,
            items: cartItems.map((item) => ({ product_id: item.product_infor._id, quantity: item.quantity }))
          })
        : await createOrderApi({
            ...commonPayload,
            items: selectedIds
          })

      const orderId = res.data?.result?.insertedId as string | undefined
      toast.success('Đặt hàng thành công!')

      if (!isGuestCheckout && saveThisAddress && !selectedAddressId && quote) {
        try {
          await createSavedAddressApi({
            recipient_name,
            phone,
            note: shipping.note.trim() || undefined,
            address_line,
            city: shipping.city.trim() || undefined,
            district: shipping.district.trim() || undefined,
            lat: quote.lat,
            lng: quote.lng,
            address_source: addressMode,
            is_default: false
          })
        } catch {
          // không chặn luồng đặt hàng nếu lưu địa chỉ thất bại
        }
      }

      if (orderId && paymentMethod === PaymentMethod.PAYOS) {
        try {
          const payosRes = await getPayosPaymentUrlApi(orderId)
          const payosResult = payosRes.data?.result || payosRes.data?.data || payosRes.data
          const payUrl = payosResult?.payUrl
          if (payUrl) {
            toast.success('Đang chuyển hướng tới cổng thanh toán PayOS...')
            window.location.href = payUrl
            return
          }
        } catch (payosErr) {
          toast.error(getApiErrorMessage(payosErr, 'Không thể tạo liên kết thanh toán PayOS. Bạn có thể thanh toán lại trong chi tiết đơn hàng.'))
          navigate(ROUTE_PATHS.USER_ORDER_DETAIL(orderId))
          return
        }
      }

      if (orderId && (paymentMethod === PaymentMethod.MOMO || paymentMethod === PaymentMethod.PAYPAL)) {
        navigate(ROUTE_PATHS.USER_ORDER_DETAIL(orderId))
        return
      }

      navigate(isGuestCheckout ? ROUTE_PATHS.USER_ORDER_RESULT : ROUTE_PATHS.USER_ORDERS, {
        state: { orderId, isGuestCheckout }
      })
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Đặt hàng thất bại'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='mx-auto max-w-7xl px-4 py-8 md:px-6'>
      <div className='mb-6 flex flex-col gap-4'>
        <div>
          <p className='text-xs font-semibold uppercase tracking-[0.14em] text-[#b07a72]'>Secure checkout</p>
          <h1 className='mt-1 text-3xl font-semibold tracking-tight text-[#3d3330]'>
            {isGuestCheckout ? 'Mua nhanh' : 'Thanh toán'}
          </h1>
          <p className='mt-2 max-w-2xl text-sm leading-6 text-[#8a7a74]'>
            Nhập địa chỉ hoặc chọn trên bản đồ. Phí ship được tính theo khoảng cách từ cửa hàng (tối đa 25 km).
          </p>
        </div>
        <TrustBadges />
      </div>

      <div className='grid gap-8 lg:grid-cols-[1fr_340px] xl:grid-cols-[1fr_380px]'>
        <div className='space-y-5'>
          <section className={cn(panelClass, 'p-5 md:p-6')}>
            <div className='mb-4 flex items-center gap-3'>
              <span className='grid h-9 w-9 place-items-center rounded-md bg-[#fdf8f6] text-[#3d3330]'>
                <PackageCheck size={17} />
              </span>
              <h2 className='text-base font-semibold text-[#3d3330]'>Sản phẩm</h2>
            </div>

            <div className='space-y-3'>
              {cartItems.map((item) => {
                const product = item.product_infor
                const firstMedia = product.medias?.[0]
                const mediaUrl = typeof firstMedia === 'string' ? firstMedia : firstMedia?.url
                const image = formatImageUrl(product.thumbnail || mediaUrl)

                return (
                  <div key={item._id} className='flex gap-3 rounded-md border border-[#f0e4de] p-3 sm:items-center'>
                    <div className='aspect-[4/5] w-16 shrink-0 overflow-hidden rounded-md bg-[#f5ebe6] sm:w-20'>
                      {image ? <img src={image} alt={product.name} referrerPolicy='no-referrer' className='h-full w-full object-cover' /> : null}
                    </div>

                    <div className='min-w-0 flex-1'>
                      {product.origin ? (
                        <p className='text-[10px] font-semibold uppercase tracking-wider text-[#b07a72]'>{product.origin}</p>
                      ) : null}
                      <div className='line-clamp-2 text-sm font-semibold text-[#3d3330]'>{product.name}</div>
                      <div className='mt-1 text-xs text-[#8a7a74]'>
                        {money(product.price)} × {item.quantity}
                      </div>
                    </div>

                    <div className='shrink-0 text-sm font-bold text-[#3d3330]'>{money(product.price * item.quantity)}</div>
                  </div>
                )
              })}
            </div>
          </section>

          <section className={cn(panelClass, 'p-5 md:p-6')}>
            <div className='mb-4 flex items-center gap-3'>
              <span className='grid h-9 w-9 place-items-center rounded-md bg-[#fdf8f6] text-[#b07a72]'>
                <MapPin size={17} />
              </span>
              <h2 className='text-base font-semibold text-[#3d3330]'>Địa chỉ nhận hàng</h2>
            </div>

            <div className='mb-5'>
              {!isGuestCheckout ? (
                <>
                  <p className='mb-3 text-sm font-semibold text-[#6b5f59]'>Chọn từ sổ địa chỉ</p>
                  <SavedAddressesPanel selectable selectedId={selectedAddressId} onSelect={applySavedAddress} />
                </>
              ) : (
                <div className='rounded-md border border-[#eaded8] bg-[#fdf8f6] px-4 py-3 text-sm font-medium text-[#6b5f59]'>
                  Khách vãng lai chỉ cần nhập họ tên, số điện thoại và địa chỉ để đặt hàng.
                </div>
              )}
            </div>

            <div className='mb-4 grid grid-cols-2 gap-1 rounded-md bg-[#fdf8f6] p-1'>
              {([
                { id: 'manual' as const, label: 'Nhập địa chỉ' },
                { id: 'map' as const, label: 'Chọn trên bản đồ' }
              ]).map((tab) => (
                <button
                  key={tab.id}
                  type='button'
                  onClick={() => {
                    setAddressMode(tab.id)
                    setSelectedAddressId(null)
                    if (tab.id === 'manual') setCoords(null)
                  }}
                  className={cn(
                    'rounded-md px-3 py-2 text-sm font-semibold transition',
                    addressMode === tab.id ? 'bg-white text-[#3d3330] shadow-sm' : 'text-[#8a7a74] hover:text-[#3d3330]'
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
                onChange={(e) => patchShipping({ recipient_name: e.target.value })}
                required
              />
              <Input
                label='Số điện thoại'
                name='phone'
                value={shipping.phone}
                onChange={(e) => patchShipping({ phone: e.target.value })}
                required
              />
              <div className='md:col-span-2'>
                <Input
                  label='Địa chỉ chi tiết'
                  name='address_line'
                  value={shipping.address_line}
                  onChange={(e) => patchShipping({ address_line: e.target.value })}
                  required
                />
              </div>
              <Input label='Thành phố' name='city' value={shipping.city} onChange={(e) => patchShipping({ city: e.target.value })} />
              <Input
                label='Quận / Huyện'
                name='district'
                value={shipping.district}
                onChange={(e) => patchShipping({ district: e.target.value })}
              />
              <div className='md:col-span-2'>
                <label className='mb-2 block text-sm font-semibold text-[#3d3330]'>Ghi chú giao hàng</label>
                <textarea
                  value={shipping.note}
                  onChange={(e) => patchShipping({ note: e.target.value })}
                  rows={3}
                  placeholder='Ví dụ: Giao giờ hành chính, gọi trước 15 phút...'
                  className='w-full rounded-md border border-[#eaded8] bg-white px-4 py-3 text-sm text-[#3d3330] outline-none transition focus:border-[#cbb8af] focus:ring-2 focus:ring-[#f5d5cf]/50'
                />
              </div>
            </div>

            {!isGuestCheckout && !selectedAddressId ? (
              <label className='mt-4 flex cursor-pointer items-center gap-3 rounded-md border border-[#eaded8] bg-[#fdf8f6] px-4 py-3'>
                <input
                  type='checkbox'
                  checked={saveThisAddress}
                  onChange={(e) => setSaveThisAddress(e.target.checked)}
                  className='h-4 w-4 accent-[#3d3330]'
                />
                <span className='text-sm font-medium text-[#6b5f59]'>Lưu địa chỉ này cho lần mua sau</span>
              </label>
            ) : null}

            {addressMode === 'map' && storeInfo ? (
              <div className='mt-4'>
                <ShippingMapPicker storeLat={storeInfo.lat} storeLng={storeInfo.lng} value={coords} onPick={handleMapPick} />
              </div>
            ) : null}

            <div className='mt-4 rounded-md border border-[#eaded8] bg-[#fdf8f6] px-4 py-3 text-sm'>
              {quoteLoading ? (
                <span className='inline-flex items-center gap-2 font-medium text-[#6b5f59]'>
                  <Loader2 size={16} className='animate-spin' />
                  Đang tính phí giao hàng...
                </span>
              ) : quoteError ? (
                <span className='font-medium text-rose-600'>{quoteError}</span>
              ) : quote ? (
                <div className='space-y-1 font-medium text-[#6b5f59]'>
                  <div>Khoảng cách: {quote.distance_km} km</div>
                  <div>Phí cơ bản: {money(quote.base_shipping_fee)}</div>
                  {quote.express_surcharge > 0 ? <div>Phụ phí hỏa tốc: {money(quote.express_surcharge)}</div> : null}
                </div>
              ) : (
                <span className='font-medium text-[#8a7a74]'>Nhập địa chỉ hoặc chọn trên bản đồ để xem phí ship.</span>
              )}
            </div>
          </section>

          <section className={cn(panelClass, 'p-5 md:p-6')}>
            <div className='mb-4 flex items-center gap-3'>
              <span className='grid h-9 w-9 place-items-center rounded-md bg-[#fdf8f6] text-[#b07a72]'>
                <Truck size={17} />
              </span>
              <h2 className='text-base font-semibold text-[#3d3330]'>Phương thức giao hàng</h2>
            </div>

            <div className='grid gap-3 md:grid-cols-2'>
              {deliveryMethods.map((method) => {
                const isSelected = selectedDelivery === method._id

                return (
                  <label
                    key={method._id}
                    className={cn(
                      'cursor-pointer rounded-md border p-4 transition',
                      isSelected ? 'border-[#3d3330] bg-[#fdf8f6] ring-1 ring-[#3d3330]/10' : 'border-[#eaded8] hover:border-[#cbb8af]'
                    )}
                  >
                    <div className='flex items-start justify-between gap-3'>
                      <div>
                        <div className='font-semibold text-[#3d3330]'>{method.name}</div>
                        <div className='mt-1 text-sm leading-6 text-[#8a7a74]'>{method.description}</div>
                      </div>

                      <input
                        type='radio'
                        name='deliveryMethod'
                        value={method._id}
                        checked={isSelected}
                        onChange={() => setSelectedDelivery(method._id)}
                        className='mt-1 h-4 w-4 accent-[#3d3330]'
                      />
                    </div>
                  </label>
                )
              })}
            </div>
          </section>

          <section className={cn(panelClass, 'p-5 md:p-6')}>
            <div className='mb-4 flex items-center gap-3'>
              <span className='grid h-9 w-9 place-items-center rounded-md bg-[#fdf8f6] text-[#3d3330]'>
                <CreditCard size={17} />
              </span>
              <h2 className='text-base font-semibold text-[#3d3330]'>Phương thức thanh toán</h2>
            </div>

            <div className='grid gap-3 md:grid-cols-2'>
              {(Object.values(PaymentMethod) as PaymentMethod[]).map((method) => {
                const isSelected = paymentMethod === method

                return (
                  <label
                    key={method}
                    className={cn(
                      'flex cursor-pointer items-center justify-between gap-3 rounded-md border p-4 transition',
                      isSelected ? 'border-[#3d3330] bg-[#fdf8f6] ring-1 ring-[#3d3330]/10' : 'border-[#eaded8] hover:border-[#cbb8af]'
                    )}
                  >
                    <span className='text-sm font-semibold text-[#3d3330]'>{paymentMethodLabel[method]}</span>
                    <input
                      type='radio'
                      checked={isSelected}
                      onChange={() => setPaymentMethod(method)}
                      className='h-4 w-4 accent-[#3d3330]'
                    />
                  </label>
                )
              })}
            </div>
          </section>
        </div>

        <aside className={cn(panelClass, 'h-fit p-5 lg:sticky lg:top-28')}>
          <div className='mb-4'>
            <p className='font-semibold text-[#3d3330]'>Tóm tắt đơn hàng</p>
            <p className='mt-1 text-xs text-[#8a7a74]'>{cartItems.length} sản phẩm</p>
          </div>

          <div className='space-y-2 text-sm'>
            <div className='flex justify-between'>
              <span className='text-[#8a7a74]'>Tạm tính</span>
              <span className='font-semibold text-[#3d3330]'>{money(subtotal)}</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-[#8a7a74]'>Phí giao hàng</span>
              <span className='font-semibold text-[#3d3330]'>
                {quoteLoading ? 'Đang tính...' : quote ? money(shippingFee) : 'Chưa tính'}
              </span>
            </div>
            <div>
              <label className='text-xs font-semibold text-[#6b5f59]'>Mã giảm giá</label>
              <div className='mt-2 flex gap-2'>
                <input
                  value={voucherCode}
                  onChange={(e) => setVoucherCode(e.target.value)}
                  placeholder='Nhập mã'
                  className='h-10 min-w-0 flex-1 rounded-md border border-[#eaded8] px-3 text-sm outline-none focus:border-[#cbb8af] focus:ring-2 focus:ring-[#f5d5cf]/50'
                />
                <button
                  type='button'
                  onClick={applyVoucher}
                  disabled={voucherLoading || subtotal <= 0}
                  className='rounded-md border border-[#3d3330] px-3 text-xs font-semibold text-[#3d3330] disabled:opacity-50'
                >
                  {voucherLoading ? '...' : 'Áp dụng'}
                </button>
              </div>
            </div>
            {discount > 0 ? (
              <div className='flex justify-between'>
                <span className='text-[#8a7a74]'>Giảm giá</span>
                <span className='font-semibold text-emerald-600'>-{money(discount)}</span>
              </div>
            ) : null}
            {quote ? (
              <div className='rounded-md bg-[#fdf8f6] px-3 py-2 text-xs font-medium text-[#8a7a74]'>
                {quote.distance_km} km từ cửa hàng · Giao trong bán kính 25 km
              </div>
            ) : null}
          </div>

          <div className='my-4 h-px bg-[#f0e4de]' />

          <div className='flex justify-between gap-4'>
            <span className='text-sm text-[#8a7a74]'>Thanh toán</span>
            <span className='text-xl font-bold text-[#3d3330]'>{money(total)}</span>
          </div>

          <Button
            full
            className='mt-5 !rounded-md !bg-[#3d3330] hover:!bg-[#2a2421]'
            onClick={handleCheckout}
            loading={loading}
            disabled={loading || quoteLoading || !quote || Boolean(quoteError)}
          >
            Xác nhận đặt hàng
          </Button>

          <div className='mt-4'>
            <TrustBadges compact />
          </div>
        </aside>
      </div>
    </div>
  )
}
