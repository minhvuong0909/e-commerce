import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, Banknote, Check, Loader2, Lock, MapPinned, PenLine, QrCode, Smartphone, Wallet } from 'lucide-react'
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

const paymentMethodMeta: Record<PaymentMethod, { label: string; desc: string; badge?: string; icon: typeof Wallet }> = {
  [PaymentMethod.CASH_ON_DELIVERY]: {
    label: 'Thanh toán khi nhận hàng',
    desc: 'Trả tiền mặt cho shipper khi nhận hàng.',
    icon: Banknote
  },
  [PaymentMethod.CREDIT_CARD]: {
    label: 'Thẻ quốc tế',
    desc: 'Chưa hỗ trợ.',
    icon: Wallet
  },
  [PaymentMethod.PAYPAL]: {
    label: 'PayPal',
    desc: 'Thanh toán bằng tài khoản PayPal.',
    icon: Wallet
  },
  [PaymentMethod.MOMO]: {
    label: 'Ví MoMo',
    desc: 'Quét mã bằng ứng dụng MoMo.',
    icon: Smartphone
  },
  [PaymentMethod.PAYOS]: {
    label: 'Chuyển khoản QR (PayOS)',
    desc: 'Quét VietQR bằng app ngân hàng, tự động xác nhận.',
    badge: 'Nhanh nhất',
    icon: QrCode
  }
}

function Step({ n, title, done, children, aside }: { n: number; title: string; done?: boolean; children: ReactNode; aside?: ReactNode }) {
  return (
    <section className='rounded-4xl bg-white p-5 ring-1 ring-ink-100 sm:p-8'>
      <div className='mb-6 flex items-center gap-3'>
        <span
          className={cn(
            'grid h-9 w-9 shrink-0 place-items-center rounded-full font-display text-sm font-bold transition',
            done ? 'bg-lime-300 text-ink-950' : 'bg-ink-950 text-white'
          )}
        >
          {done ? <Check size={16} strokeWidth={3} aria-label='Đã xong' /> : n}
        </span>
        <h2 className='font-display text-xl font-bold sm:text-2xl'>{title}</h2>
        {aside ? <div className='ml-auto'>{aside}</div> : null}
      </div>
      {children}
    </section>
  )
}

const optionCls = (selected: boolean) =>
  cn(
    'relative flex cursor-pointer items-start gap-3 rounded-3xl border-[1.5px] p-4 transition',
    selected ? 'border-ink-950 bg-white shadow-soft' : 'border-ink-100 bg-white hover:border-ink-300'
  )

function Radio({ checked }: { checked: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        'mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border-[1.5px] transition',
        checked ? 'border-ink-950' : 'border-ink-300'
      )}
    >
      <span className={cn('h-2.5 w-2.5 rounded-full transition', checked ? 'bg-ink-950' : 'bg-transparent')} />
    </span>
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
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(isGuestCheckout ? PaymentMethod.CASH_ON_DELIVERY : PaymentMethod.PAYOS)
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
    if (loading) return
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

      navigate(isGuestCheckout ? `${ROUTE_PATHS.USER_ORDER_RESULT}?orderId=${encodeURIComponent(orderId ?? '')}&status=pending&paymentMethod=COD` : ROUTE_PATHS.USER_ORDERS, {
        state: { orderId, isGuestCheckout }
      })
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Đặt hàng thất bại. Vui lòng thử lại.'))
    } finally {
      setLoading(false)
    }
  }

  const contactDone = Boolean(shipping.recipient_name.trim() && shipping.phone.trim() && shipping.address_line.trim())
  const availablePayments = (Object.values(PaymentMethod) as PaymentMethod[]).filter(
    (method) => method !== PaymentMethod.CREDIT_CARD && (!isGuestCheckout || method === PaymentMethod.CASH_ON_DELIVERY)
  )
  const canSubmit = !loading && !quoteLoading && Boolean(quote) && !quoteError

  return (
    <div className='mx-auto max-w-[1320px] px-4 py-8 md:px-6 md:py-12'>
      <Link
        to={isGuestCheckout ? ROUTE_PATHS.USER_HOME : ROUTE_PATHS.USER_CART}
        className='inline-flex items-center gap-1.5 text-sm font-medium text-ink-600 hover:text-ink-950'
      >
        <ArrowLeft size={16} /> {isGuestCheckout ? 'Tiếp tục mua sắm' : 'Quay lại giỏ hàng'}
      </Link>
      <div className='mt-3 flex flex-wrap items-end justify-between gap-3'>
        <h1 className='font-display text-4xl font-bold md:text-5xl'>Thanh toán</h1>
        {isGuestCheckout ? (
          <p className='text-sm text-ink-600'>
            Mua không cần tài khoản ·{' '}
            <Link to={ROUTE_PATHS.AUTH_LOGIN} className='font-semibold text-berry-600 hover:underline'>
              Đăng nhập
            </Link>{' '}
            để thanh toán online
          </p>
        ) : null}
      </div>

      <div className='mt-8 grid gap-6 lg:grid-cols-[1fr_420px] lg:gap-10'>
        <div className='space-y-4'>
          <Step n={1} title='Thông tin nhận hàng' done={contactDone}>
            {!isGuestCheckout ? (
              <div className='mb-6'>
                <p className='field-label'>Sổ địa chỉ</p>
                <SavedAddressesPanel selectable selectedId={selectedAddressId} onSelect={applySavedAddress} />
              </div>
            ) : null}

            <div role='tablist' aria-label='Cách nhập địa chỉ' className='mb-5 inline-flex rounded-full bg-ink-100 p-1'>
              {[
                { id: 'manual' as const, label: 'Nhập tay', icon: PenLine },
                { id: 'map' as const, label: 'Ghim trên bản đồ', icon: MapPinned }
              ].map((tab) => (
                <button
                  key={tab.id}
                  type='button'
                  role='tab'
                  aria-selected={addressMode === tab.id}
                  onClick={() => {
                    setAddressMode(tab.id)
                    setSelectedAddressId(null)
                    if (tab.id === 'manual') setCoords(null)
                  }}
                  className={cn(
                    'inline-flex h-10 cursor-pointer items-center gap-2 rounded-full px-4 text-sm font-semibold transition',
                    addressMode === tab.id ? 'bg-white text-ink-950 shadow-xs' : 'text-ink-600 hover:text-ink-950'
                  )}
                >
                  <tab.icon size={16} aria-hidden /> {tab.label}
                </button>
              ))}
            </div>

            {addressMode === 'map' && storeInfo ? (
              <div className='mb-5'>
                <ShippingMapPicker storeLat={storeInfo.lat} storeLng={storeInfo.lng} value={coords} onPick={handleMapPick} />
              </div>
            ) : null}

            <div className='grid gap-4 md:grid-cols-2'>
              <Input
                label='Họ tên người nhận'
                name='recipient_name'
                autoComplete='name'
                value={shipping.recipient_name}
                onChange={(e) => patchShipping({ recipient_name: e.target.value })}
                required
              />
              <Input
                label='Số điện thoại'
                name='phone'
                type='tel'
                inputMode='tel'
                autoComplete='tel'
                value={shipping.phone}
                onChange={(e) => patchShipping({ phone: e.target.value })}
                required
              />
              <div className='md:col-span-2'>
                <Input
                  label='Địa chỉ (số nhà, tên đường)'
                  name='address_line'
                  autoComplete='street-address'
                  value={shipping.address_line}
                  onChange={(e) => patchShipping({ address_line: e.target.value })}
                  required
                />
              </div>
              <Input label='Tỉnh / Thành phố' name='city' value={shipping.city} onChange={(e) => patchShipping({ city: e.target.value })} />
              <Input label='Quận / Huyện' name='district' value={shipping.district} onChange={(e) => patchShipping({ district: e.target.value })} />
              <div className='md:col-span-2'>
                <label htmlFor='ship-note' className='field-label'>
                  Ghi chú cho shipper <span className='font-normal text-ink-500'>(không bắt buộc)</span>
                </label>
                <textarea
                  id='ship-note'
                  value={shipping.note}
                  onChange={(e) => patchShipping({ note: e.target.value })}
                  rows={2}
                  placeholder='VD: Giao giờ hành chính, gọi trước 15 phút'
                  className='field'
                />
              </div>
            </div>

            {!isGuestCheckout && !selectedAddressId ? (
              <label className='mt-4 inline-flex cursor-pointer items-center gap-3 text-sm'>
                <input
                  type='checkbox'
                  checked={saveThisAddress}
                  onChange={(e) => setSaveThisAddress(e.target.checked)}
                  className='h-5 w-5 rounded accent-ink-950'
                />
                Lưu địa chỉ này cho lần sau
              </label>
            ) : null}
          </Step>

          <Step n={2} title='Vận chuyển' done={Boolean(quote)}>
            <div className='grid gap-3 md:grid-cols-2'>
              {deliveryMethods.map((method) => {
                const isSelected = selectedDelivery === method._id
                return (
                  <label key={method._id} className={optionCls(isSelected)}>
                    <input
                      type='radio'
                      name='deliveryMethod'
                      value={method._id}
                      checked={isSelected}
                      onChange={() => setSelectedDelivery(method._id)}
                      className='sr-only'
                    />
                    <Radio checked={isSelected} />
                    <span className='min-w-0'>
                      <span className='block font-semibold'>{method.name}</span>
                      <span className='mt-0.5 block text-sm leading-relaxed text-ink-500'>{method.description}</span>
                    </span>
                  </label>
                )
              })}
            </div>

            <div className='mt-4 rounded-3xl bg-ink-50 px-5 py-4 text-sm' aria-live='polite'>
              {quoteLoading ? (
                <span className='inline-flex items-center gap-2 font-medium text-ink-700'>
                  <Loader2 size={16} className='animate-spin' /> Đang tính phí giao hàng…
                </span>
              ) : quoteError ? (
                <span className='font-semibold text-rose-600'>{quoteError}</span>
              ) : quote ? (
                <dl className='grid gap-1.5 text-ink-700'>
                  <div className='flex justify-between'>
                    <dt>Khoảng cách</dt>
                    <dd className='font-semibold text-ink-950'>{quote.distance_km} km</dd>
                  </div>
                  <div className='flex justify-between'>
                    <dt>Phí cơ bản</dt>
                    <dd className='font-semibold text-ink-950'>{money(quote.base_shipping_fee)}</dd>
                  </div>
                  {quote.express_surcharge > 0 ? (
                    <div className='flex justify-between'>
                      <dt>Phụ phí hỏa tốc</dt>
                      <dd className='font-semibold text-ink-950'>{money(quote.express_surcharge)}</dd>
                    </div>
                  ) : null}
                </dl>
              ) : (
                <span className='text-ink-500'>Nhập địa chỉ để xem phí giao hàng.</span>
              )}
            </div>
          </Step>

          <Step
            n={3}
            title='Thanh toán'
            done={Boolean(quote) && contactDone}
            aside={isGuestCheckout ? <span className='chip bg-peach-100 text-peach-700'>Khách: chỉ COD</span> : undefined}
          >
            <div className='grid gap-3'>
              {availablePayments.map((method) => {
                const isSelected = paymentMethod === method
                const meta = paymentMethodMeta[method]
                const Icon = meta.icon
                return (
                  <label key={method} className={optionCls(isSelected)}>
                    <input
                      type='radio'
                      name='paymentMethod'
                      checked={isSelected}
                      onChange={() => setPaymentMethod(method)}
                      className='sr-only'
                    />
                    <Radio checked={isSelected} />
                    <span className='min-w-0 flex-1'>
                      <span className='flex flex-wrap items-center gap-2 font-semibold'>
                        {meta.label}
                        {meta.badge ? <span className='chip bg-lime-200 px-2 py-0.5 text-[11px] text-lime-700'>{meta.badge}</span> : null}
                      </span>
                      <span className='mt-0.5 block text-sm text-ink-500'>{meta.desc}</span>
                    </span>
                    <span className='grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-ink-50 text-ink-700'>
                      <Icon size={20} aria-hidden />
                    </span>
                  </label>
                )
              })}
            </div>
          </Step>
        </div>

        {/* summary */}
        <aside className='h-fit space-y-4 lg:sticky lg:top-36'>
          <div className='rounded-4xl bg-white p-5 ring-1 ring-ink-100 sm:p-6'>
            <h2 className='font-display text-xl font-bold'>Đơn hàng ({cartItems.length})</h2>
            <ul className='mt-4 max-h-72 space-y-3 overflow-y-auto pr-1'>
              {cartItems.map((item) => {
                const product = item.product_infor
                const first = product.medias?.[0]
                const image = formatImageUrl(product.thumbnail || (typeof first === 'string' ? first : first?.url))
                return (
                  <li key={item._id} className='flex items-center gap-3'>
                    <span className='relative h-16 w-16 shrink-0 rounded-2xl bg-berry-50'>
                      {image ? (
                        <img src={image} alt='' referrerPolicy='no-referrer' className='h-full w-full rounded-2xl object-contain p-1 mix-blend-multiply' />
                      ) : null}
                      <span className='absolute -right-1.5 -top-1.5 grid h-6 min-w-6 place-items-center rounded-full bg-ink-950 px-1 text-xs font-bold text-white'>
                        {item.quantity}
                      </span>
                    </span>
                    <span className='line-clamp-2 min-w-0 flex-1 text-sm font-medium'>{product.name}</span>
                    <span className='shrink-0 text-sm font-semibold'>{money(product.price * item.quantity)}</span>
                  </li>
                )
              })}
            </ul>

            <div className='mt-5 flex gap-2 border-t border-ink-100 pt-5'>
              <input
                value={voucherCode}
                onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                placeholder='Mã giảm giá'
                aria-label='Mã giảm giá'
                className='field h-11 min-w-0 flex-1 rounded-full uppercase'
              />
              <Button variant='secondary' onClick={applyVoucher} loading={voucherLoading} disabled={subtotal <= 0 || !voucherCode.trim()}>
                Áp dụng
              </Button>
            </div>

            <dl className='mt-5 space-y-2.5 text-sm'>
              <div className='flex justify-between'>
                <dt className='text-ink-600'>Tạm tính</dt>
                <dd className='font-semibold'>{money(subtotal)}</dd>
              </div>
              <div className='flex justify-between'>
                <dt className='text-ink-600'>Vận chuyển</dt>
                <dd className='font-semibold'>{quoteLoading ? 'Đang tính…' : quote ? money(shippingFee) : '—'}</dd>
              </div>
              {discount > 0 ? (
                <div className='flex justify-between text-emerald-700'>
                  <dt>Giảm giá ({voucher?.voucher.code})</dt>
                  <dd className='font-semibold'>−{money(discount)}</dd>
                </div>
              ) : null}
            </dl>
            <div className='mt-5 flex items-end justify-between border-t border-ink-100 pt-5'>
              <span className='font-semibold'>Tổng cộng</span>
              <span className='font-display text-3xl font-bold'>{money(total)}</span>
            </div>

            <Button full variant='accent' size='lg' className='mt-6' onClick={handleCheckout} loading={loading} disabled={!canSubmit}>
              <Lock size={16} /> Đặt hàng · {money(total)}
            </Button>
            {!quote && !quoteLoading ? <p className='mt-3 text-center text-xs text-ink-500'>Hoàn tất địa chỉ để tính phí và đặt hàng.</p> : null}
          </div>
        </aside>
      </div>
    </div>
  )
}
