import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { BadgeCheck, Check, CreditCard, Loader2, Lock, MapPin, PackageCheck, ShieldCheck, Truck, Zap } from 'lucide-react'
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

const panelClass = 'rounded-3xl border border-[#EFECE6] bg-white p-6 shadow-soft md:p-8'

const paymentMethodMeta: Record<PaymentMethod, { label: string; desc: string; badge?: string }> = {
  [PaymentMethod.CASH_ON_DELIVERY]: {
    label: 'Thanh Toán Khi Nhận Hàng (COD)',
    desc: 'Kiểm tra hàng trước khi thanh toán cho shipper.'
  },
  [PaymentMethod.CREDIT_CARD]: {
    label: 'Thẻ Tín Dụng / Visa / MasterCard',
    desc: 'Cổng thanh toán bảo mật quốc tế SSL 256-bit.'
  },
  [PaymentMethod.PAYPAL]: {
    label: 'Thanh Toán Qua Cổng PayPal',
    desc: 'Thanh toán an toàn bằng tài khoản PayPal cá nhân.'
  },
  [PaymentMethod.MOMO]: {
    label: 'Ví Điện Tử MoMo (Quét Mã QR)',
    desc: 'Thanh toán tức thì qua ứng dụng MoMo trên điện thoại.'
  },
  [PaymentMethod.PAYOS]: {
    label: 'Chuyển Khoản Ngân Hàng QR Code (PayOS)',
    desc: 'Tự động xác nhận giao dịch qua mọi ứng dụng Ngân Hàng / VietQR.',
    badge: 'Khuyên Dùng · Nhanh Nhất'
  }
}

function TrustBadges({ compact = false }: { compact?: boolean }) {
  const items = [
    { icon: BadgeCheck, label: 'Cam kết 100% chính hãng' },
    { icon: ShieldCheck, label: 'Bảo mật thông tin & SSL' },
    { icon: Truck, label: 'Giao hàng toàn quốc an toàn' }
  ]

  return (
    <div
      className={cn(
        'flex flex-wrap gap-2.5',
        compact ? 'justify-center' : 'rounded-2xl border border-[#EFECE6] bg-[#FAF7F2] p-4'
      )}
    >
      {items.map(({ icon: Icon, label }) => (
        <span
          key={label}
          className='inline-flex items-center gap-2 rounded-full border border-[#EFECE6] bg-white px-3.5 py-1.5 text-xs font-bold text-[#594D42] shadow-xs'
        >
          <Icon size={14} className='text-[#9A8069]' />
          {label}
        </span>
      ))}
    </div>
  )
}

function CheckoutStepper({ step }: { step: 1 | 2 | 3 }) {
  const steps = [
    { num: 1, label: 'Địa Chỉ Giao Hàng' },
    { num: 2, label: 'Đơn Vị Vận Chuyển' },
    { num: 3, label: 'Thanh Toán & Xác Nhận' }
  ]

  return (
    <div className='mb-8 rounded-3xl border border-[#EFECE6] bg-white p-4 shadow-xs'>
      <div className='flex items-center justify-between gap-2 max-w-3xl mx-auto'>
        {steps.map((s, idx) => {
          const isActive = s.num <= step
          const isCurrent = s.num === step

          return (
            <div key={s.num} className='flex items-center gap-2.5 flex-1 last:flex-none'>
              <div className='flex items-center gap-2.5'>
                <span
                  className={cn(
                    'grid h-8 w-8 place-items-center rounded-full text-xs font-bold transition-all',
                    isActive
                      ? 'bg-[#2B2118] text-[#FAF7F2] shadow-sm'
                      : 'bg-[#FAF7F2] text-[#8C7D70] border border-[#EFECE6]'
                  )}
                >
                  {s.num < step ? <Check size={14} strokeWidth={3} /> : s.num}
                </span>
                <span
                  className={cn(
                    'hidden sm:inline font-display text-xs font-bold tracking-tight',
                    isCurrent ? 'text-[#2B2118]' : isActive ? 'text-[#594D42]' : 'text-[#8C7D70]'
                  )}
                >
                  {s.label}
                </span>
              </div>
              {idx < steps.length - 1 ? (
                <div className='h-0.5 min-w-4 flex-1 bg-[#EFECE6] mx-2 hidden sm:block' />
              ) : null}
            </div>
          )
        })}
      </div>
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
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.PAYOS)
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
        toast.error('Không thể tải dữ liệu thanh toán')
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
      toast.success(`Đã áp dụng mã giảm giá ${res.data.result.voucher.code}`)
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
      toast.error(getApiErrorMessage(err, 'Đặt hàng thất bại. Vui lòng thử lại.'))
    } finally {
      setLoading(false)
    }
  }

  // Active step calculation
  const currentStep: 1 | 2 | 3 = quote ? 3 : selectedDelivery ? 2 : 1

  return (
    <div className='mx-auto max-w-7xl px-4 py-8 md:px-6 bg-[#FAF7F2] text-[#2B2118] min-h-screen'>
      {/* Header Info */}
      <div className='mb-6 flex flex-col gap-3'>
        <div className='flex items-center justify-between'>
          <div>
            <p className='text-xs font-bold uppercase tracking-[0.2em] text-[#9A8069]'>Commercial Checkout Engine</p>
            <h1 className='mt-1 font-display text-3xl font-extrabold tracking-tight text-[#2B2118] md:text-4xl'>
              {isGuestCheckout ? 'Xác Nhận Đặt Hàng Vãng Lai' : 'Thanh Toán Đơn Hàng'}
            </h1>
          </div>
          <div className='hidden sm:flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200'>
            <Lock size={13} /> Bảo mật SSL 256-bit
          </div>
        </div>
        <TrustBadges />
      </div>

      {/* Stepper Indicator */}
      <CheckoutStepper step={currentStep} />

      <div className='grid gap-8 lg:grid-cols-[1fr_340px] xl:grid-cols-[1fr_380px]'>
        <div className='space-y-6'>
          {/* Section 1: Cart Items */}
          <section className={panelClass}>
            <div className='mb-4 flex items-center justify-between border-b border-[#EFECE6] pb-4'>
              <div className='flex items-center gap-3'>
                <span className='grid h-10 w-10 place-items-center rounded-2xl bg-[#FAF7F2] text-[#9A8069] border border-[#EFECE6]'>
                  <PackageCheck size={19} />
                </span>
                <h2 className='font-display text-lg font-bold text-[#2B2118]'>1. Sản Phẩm Đặt Mua ({cartItems.length})</h2>
              </div>
            </div>

            <div className='space-y-3'>
              {cartItems.map((item) => {
                const product = item.product_infor
                const firstMedia = product.medias?.[0]
                const mediaUrl = typeof firstMedia === 'string' ? firstMedia : firstMedia?.url
                const image = formatImageUrl(product.thumbnail || mediaUrl)

                return (
                  <div key={item._id} className='flex gap-4 rounded-2xl border border-[#EFECE6] bg-[#FAF7F2] p-3.5 sm:items-center'>
                    <div className='aspect-square w-16 shrink-0 overflow-hidden rounded-xl bg-white border border-[#EFECE6] sm:w-20'>
                      {image ? <img src={image} alt={product.name} referrerPolicy='no-referrer' className='h-full w-full object-cover' /> : null}
                    </div>

                    <div className='min-w-0 flex-1'>
                      {product.origin ? (
                        <p className='text-[10px] font-bold uppercase tracking-[0.14em] text-[#9A8069]'>{product.origin}</p>
                      ) : null}
                      <div className='line-clamp-2 font-display text-xs font-bold text-[#2B2118]'>{product.name}</div>
                      <div className='mt-1 text-xs text-[#8C7D70] font-medium'>
                        {money(product.price)} × {item.quantity}
                      </div>
                    </div>

                    <div className='shrink-0 text-sm font-extrabold text-[#C47A5A]'>{money(product.price * item.quantity)}</div>
                  </div>
                )
              })}
            </div>
          </section>

          {/* Section 2: Delivery Address & Map */}
          <section className={panelClass}>
            <div className='mb-4 flex items-center justify-between border-b border-[#EFECE6] pb-4'>
              <div className='flex items-center gap-3'>
                <span className='grid h-10 w-10 place-items-center rounded-2xl bg-[#FAF7F2] text-[#9A8069] border border-[#EFECE6]'>
                  <MapPin size={19} />
                </span>
                <h2 className='font-display text-lg font-bold text-[#2B2118]'>2. Địa Chỉ Nhận Hàng</h2>
              </div>
            </div>

            <div className='mb-5'>
              {!isGuestCheckout ? (
                <>
                  <p className='mb-3 text-xs font-bold uppercase tracking-wider text-[#594D42]'>Chọn từ sổ địa chỉ cá nhân</p>
                  <SavedAddressesPanel selectable selectedId={selectedAddressId} onSelect={applySavedAddress} />
                </>
              ) : (
                <div className='rounded-2xl border border-[#EFECE6] bg-[#FAF7F2] p-4 text-xs font-medium text-[#594D42]'>
                  Khách vãng lai: Nhập thông tin liên hệ chính xác để shipper gọi giao hàng.
                </div>
              )}
            </div>

            <div className='mb-5 grid grid-cols-2 gap-2 rounded-2xl bg-[#FAF7F2] p-1 border border-[#EFECE6]'>
              {([
                { id: 'manual' as const, label: 'Nhập địa chỉ thủ công' },
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
                    'rounded-xl px-3 py-2 text-xs font-bold uppercase tracking-wider transition-all',
                    addressMode === tab.id
                      ? 'bg-[#2B2118] text-[#FAF7F2] shadow-sm'
                      : 'text-[#8C7D70] hover:text-[#2B2118]'
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
                  label='Địa chỉ chi tiết (Số nhà, tên đường...)'
                  name='address_line'
                  value={shipping.address_line}
                  onChange={(e) => patchShipping({ address_line: e.target.value })}
                  required
                />
              </div>
              <Input label='Tỉnh / Thành phố' name='city' value={shipping.city} onChange={(e) => patchShipping({ city: e.target.value })} />
              <Input
                label='Quận / Huyện'
                name='district'
                value={shipping.district}
                onChange={(e) => patchShipping({ district: e.target.value })}
              />
              <div className='md:col-span-2'>
                <label className='mb-2 block text-xs font-bold uppercase tracking-wider text-[#594D42]'>Ghi chú cho shipper</label>
                <textarea
                  value={shipping.note}
                  onChange={(e) => patchShipping({ note: e.target.value })}
                  rows={3}
                  placeholder='Ví dụ: Giao giờ hành chính, gọi trước 15 phút...'
                  className='w-full rounded-2xl border border-[#EFECE6] bg-white px-4 py-3 text-xs text-[#2B2118] placeholder-[#A3968B] outline-none transition focus:border-[#9A8069] focus:ring-2 focus:ring-[#9A8069]/20'
                />
              </div>
            </div>

            {!isGuestCheckout && !selectedAddressId ? (
              <label className='mt-4 flex cursor-pointer items-center gap-3 rounded-2xl border border-[#EFECE6] bg-[#FAF7F2] px-4 py-3 hover:bg-white transition-colors'>
                <input
                  type='checkbox'
                  checked={saveThisAddress}
                  onChange={(e) => setSaveThisAddress(e.target.checked)}
                  className='h-4 w-4 rounded accent-[#2B2118]'
                />
                <span className='text-xs font-bold text-[#594D42]'>Lưu địa chỉ này vào sổ địa chỉ cá nhân</span>
              </label>
            ) : null}

            {addressMode === 'map' && storeInfo ? (
              <div className='mt-4 overflow-hidden rounded-2xl border border-[#EFECE6]'>
                <ShippingMapPicker storeLat={storeInfo.lat} storeLng={storeInfo.lng} value={coords} onPick={handleMapPick} />
              </div>
            ) : null}

            <div className='mt-4 rounded-2xl border border-[#EFECE6] bg-[#FAF7F2] px-4 py-3 text-xs'>
              {quoteLoading ? (
                <span className='inline-flex items-center gap-2 font-bold text-[#9A8069]'>
                  <Loader2 size={16} className='animate-spin' />
                  Đang tính toán cước vận chuyển chính xác...
                </span>
              ) : quoteError ? (
                <span className='font-bold text-rose-600'>{quoteError}</span>
              ) : quote ? (
                <div className='space-y-1 font-medium text-[#594D42]'>
                  <div className='flex justify-between items-center'>
                    <span>Khoảng cách từ trung tâm kho:</span>
                    <span className='font-bold text-[#2B2118]'>{quote.distance_km} km</span>
                  </div>
                  <div className='flex justify-between items-center'>
                    <span>Cước phí giao hàng cơ bản:</span>
                    <span className='font-bold text-[#C47A5A]'>{money(quote.base_shipping_fee)}</span>
                  </div>
                  {quote.express_surcharge > 0 ? (
                    <div className='flex justify-between items-center'>
                      <span>Phụ phí hỏa tốc:</span>
                      <span className='font-bold text-amber-600'>{money(quote.express_surcharge)}</span>
                    </div>
                  ) : null}
                </div>
              ) : (
                <span className='font-medium text-[#8C7D70]'>Nhập địa chỉ ở trên để hệ thống tự động tính cước giao hàng.</span>
              )}
            </div>
          </section>

          {/* Section 3: Delivery Methods */}
          <section className={panelClass}>
            <div className='mb-4 flex items-center gap-3 border-b border-[#EFECE6] pb-4'>
              <span className='grid h-10 w-10 place-items-center rounded-2xl bg-[#FAF7F2] text-[#9A8069] border border-[#EFECE6]'>
                <Truck size={19} />
              </span>
              <h2 className='font-display text-lg font-bold text-[#2B2118]'>3. Đơn Vị Vận Chuyển</h2>
            </div>

            <div className='grid gap-3 md:grid-cols-2'>
              {deliveryMethods.map((method) => {
                const isSelected = selectedDelivery === method._id

                return (
                  <label
                    key={method._id}
                    className={cn(
                      'cursor-pointer rounded-2xl border p-4 transition-all',
                      isSelected
                        ? 'border-[#2B2118] bg-[#FAF7F2] ring-1 ring-[#2B2118]/15 shadow-xs'
                        : 'border-[#EFECE6] bg-white hover:border-[#9A8069]'
                    )}
                  >
                    <div className='flex items-start justify-between gap-3'>
                      <div>
                        <div className='font-display text-sm font-bold text-[#2B2118]'>{method.name}</div>
                        <div className='mt-1 text-xs text-[#8C7D70] leading-relaxed'>{method.description}</div>
                      </div>

                      <input
                        type='radio'
                        name='deliveryMethod'
                        value={method._id}
                        checked={isSelected}
                        onChange={() => setSelectedDelivery(method._id)}
                        className='mt-1 h-4 w-4 accent-[#2B2118]'
                      />
                    </div>
                  </label>
                )
              })}
            </div>
          </section>

          {/* Section 4: Payment Methods */}
          <section className={panelClass}>
            <div className='mb-4 flex items-center justify-between border-b border-[#EFECE6] pb-4'>
              <div className='flex items-center gap-3'>
                <span className='grid h-10 w-10 place-items-center rounded-2xl bg-[#FAF7F2] text-[#9A8069] border border-[#EFECE6]'>
                  <CreditCard size={19} />
                </span>
                <h2 className='font-display text-lg font-bold text-[#2B2118]'>4. Phương Thức Thanh Toán</h2>
              </div>
              <span className='text-xs font-semibold text-[#8C7D70] inline-flex items-center gap-1'><Zap size={14} className='text-amber-500' /> Khuyên dùng PayOS</span>
            </div>

            <div className='space-y-3'>
              {(Object.values(PaymentMethod) as PaymentMethod[]).map((method) => {
                const isSelected = paymentMethod === method
                const meta = paymentMethodMeta[method]

                return (
                  <label
                    key={method}
                    className={cn(
                      'flex cursor-pointer items-center justify-between gap-4 rounded-2xl border p-4 transition-all',
                      isSelected
                        ? 'border-[#2B2118] bg-[#FAF7F2] ring-2 ring-[#2B2118]/15 shadow-sm'
                        : 'border-[#EFECE6] bg-white hover:border-[#9A8069]'
                    )}
                  >
                    <div className='space-y-1 min-w-0'>
                      <div className='flex items-center gap-2 flex-wrap'>
                        <span className='font-display text-xs font-bold text-[#2B2118]'>{meta.label}</span>
                        {meta.badge ? (
                          <span className='rounded-full bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 text-[9px] font-extrabold text-emerald-800 uppercase tracking-wide'>
                            {meta.badge}
                          </span>
                        ) : null}
                      </div>
                      <p className='text-xs text-[#8C7D70]'>{meta.desc}</p>
                    </div>

                    <input
                      type='radio'
                      checked={isSelected}
                      onChange={() => setPaymentMethod(method)}
                      className='h-4 w-4 shrink-0 accent-[#2B2118]'
                    />
                  </label>
                )
              })}
            </div>
          </section>
        </div>

        {/* Order Summary Sidebar */}
        <aside className={cn(panelClass, 'h-fit lg:sticky lg:top-28')}>
          <div className='mb-4 border-b border-[#EFECE6] pb-4'>
            <p className='font-display text-base font-bold text-[#2B2118]'>Tóm Tắt Đơn Hàng</p>
            <p className='mt-1 text-xs text-[#8C7D70]'>{cartItems.length} sản phẩm</p>
          </div>

          <div className='space-y-3 text-xs font-medium text-[#594D42]'>
            <div className='flex justify-between'>
              <span>Tạm tính sản phẩm</span>
              <span className='font-bold text-[#2B2118]'>{money(subtotal)}</span>
            </div>
            <div className='flex justify-between'>
              <span>Phí vận chuyển</span>
              <span className='font-bold text-[#9A8069]'>
                {quoteLoading ? 'Đang tính...' : quote ? money(shippingFee) : 'Chưa tính'}
              </span>
            </div>
            
            <div className='pt-2'>
              <label className='text-xs font-bold uppercase tracking-wider text-[#594D42]'>Mã Voucher / Ưu Đãi</label>
              <div className='mt-2 flex gap-2'>
                <input
                  value={voucherCode}
                  onChange={(e) => setVoucherCode(e.target.value)}
                  placeholder='Nhập mã ưu đãi'
                  className='h-10 min-w-0 flex-1 rounded-xl border border-[#EFECE6] bg-white px-3 text-xs text-[#2B2118] outline-none focus:border-[#9A8069]'
                />
                <button
                  type='button'
                  onClick={applyVoucher}
                  disabled={voucherLoading || subtotal <= 0}
                  className='rounded-xl border border-[#2B2118] bg-[#2B2118] px-3.5 text-xs font-bold text-white hover:bg-[#9A8069] disabled:opacity-50 transition-all'
                >
                  {voucherLoading ? '...' : 'Áp dụng'}
                </button>
              </div>
            </div>

            {discount > 0 ? (
              <div className='flex justify-between text-emerald-600 font-bold'>
                <span>Voucher giảm giá</span>
                <span>-{money(discount)}</span>
              </div>
            ) : null}

            {quote ? (
              <div className='rounded-2xl bg-[#FAF7F2] p-3 text-[11px] text-[#8C7D70] border border-[#EFECE6]'>
                Khoảng cách {quote.distance_km} km từ trung tâm kho. Vận chuyển hỏa tốc trong bán kính 25 km.
              </div>
            ) : null}
          </div>

          <div className='my-5 h-px bg-[#EFECE6]' />

          <div className='flex justify-between items-end gap-4'>
            <span className='text-xs font-bold uppercase tracking-wider text-[#8C7D70]'>Tổng Tiền Thanh Toán</span>
            <span className='text-2xl font-extrabold text-[#C47A5A]'>{money(total)}</span>
          </div>

          <Button
            full
            className='mt-6 !rounded-full !bg-[#2B2118] !py-4 !text-xs !font-bold !uppercase !tracking-widest !text-[#FAF7F2] shadow-md hover:!bg-[#9A8069] transition-all disabled:opacity-50'
            onClick={handleCheckout}
            loading={loading}
            disabled={loading || quoteLoading || !quote || Boolean(quoteError)}
          >
            Xác Nhận Đặt Hàng Ngay
          </Button>

          <div className='mt-5'>
            <TrustBadges compact />
          </div>
        </aside>
      </div>
    </div>
  )
}
