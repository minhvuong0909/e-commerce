import { useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Check, ClipboardCheck, PackageCheck, PackageSearch, Phone, Truck, X } from 'lucide-react'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Alert from '../../components/ui/Alert'
import StatusBadge from '../../components/ui/StatusBadge'
import { getOrderStatusMeta, mapPaymentMethod, mapPaymentStatus, ORDER_STATUS_CODE } from '../../constants/order'
import { trackGuestOrderApi, type TrackedOrder } from '../../services/orders.services'
import { ROUTE_PATHS } from '../../routes/route.paths'
import { getApiErrorMessage } from '../../utils/apiError'
import { formatImageUrl } from '../../utils/formatImageUrl'
import { getToken } from '../../utils/authSession'
import formatDate from '../../utils/date'
import money from '../../utils/money'
import cn from '../../utils/cn'

const STEPS = [
  { label: 'Đã đặt', icon: ClipboardCheck },
  { label: 'Đã xác nhận', icon: PackageCheck },
  { label: 'Đang giao', icon: Truck },
  { label: 'Đã nhận', icon: Check }
]

function Timeline({ status }: { status: number }) {
  if (status === ORDER_STATUS_CODE.CANCELLED) {
    return (
      <div className='flex items-center gap-2 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700'>
        <X size={16} aria-hidden /> Đơn hàng đã bị hủy.
      </div>
    )
  }
  const reached = status >= ORDER_STATUS_CODE.DELIVERED ? 3 : status
  return (
    <ol className='grid grid-cols-4 gap-2' aria-label='Tiến trình đơn hàng'>
      {STEPS.map((s, i) => {
        const done = i <= reached
        const Icon = s.icon
        return (
          <li key={s.label} className='flex flex-col items-center text-center'>
            <span className={cn('grid h-11 w-11 place-items-center rounded-2xl', done ? 'bg-berry-600 text-white' : 'bg-ink-100 text-ink-400')}>
              <Icon size={19} aria-hidden />
            </span>
            <span className={cn('mt-2 text-xs font-semibold sm:text-sm', done ? 'text-ink-950' : 'text-ink-400')}>{s.label}</span>
            {i === reached ? <span className='sr-only'>(hiện tại)</span> : null}
          </li>
        )
      })}
    </ol>
  )
}

export default function TrackOrderPage() {
  const [params] = useSearchParams()
  const [code, setCode] = useState(params.get('code') ?? '')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [order, setOrder] = useState<TrackedOrder | null>(null)
  const signedIn = Boolean(getToken())

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    if (!code.trim() || !phone.trim()) {
      setError('Vui lòng nhập mã đơn và số điện thoại.')
      return
    }
    try {
      setLoading(true)
      const res = await trackGuestOrderApi(code.trim(), phone.trim())
      setOrder(res.data.result)
    } catch (err) {
      setOrder(null)
      setError(getApiErrorMessage(err, 'Không tra cứu được đơn hàng. Vui lòng thử lại.'))
    } finally {
      setLoading(false)
    }
  }

  const meta = order ? getOrderStatusMeta(order.status) : null

  return (
    <div className='mx-auto max-w-3xl px-4 py-8 md:py-12'>
      <div className='flex items-center gap-4'>
        <span className='grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-berry-50 text-berry-700'>
          <PackageSearch size={26} aria-hidden />
        </span>
        <div>
          <h1 className='font-display text-3xl font-bold md:text-4xl'>Tra cứu đơn hàng</h1>
          <p className='text-ink-600'>Dành cho đơn đặt không cần tài khoản.</p>
        </div>
      </div>

      {signedIn ? (
        <p className='mt-6 rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm text-ink-700'>
          Đơn đặt bằng tài khoản xem trong{' '}
          <Link to={ROUTE_PATHS.USER_ORDERS} className='font-semibold text-berry-700 hover:underline'>
            Đơn hàng của tôi
          </Link>
          .
        </p>
      ) : null}

      <form onSubmit={submit} noValidate className='mt-6 grid gap-4 rounded-3xl border border-ink-200 bg-white p-5 sm:grid-cols-[1fr_1fr_auto] sm:items-end sm:p-6'>
        <Input
          label='Mã đơn hàng'
          placeholder='VD: #D51DD5'
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          autoComplete='off'
          maxLength={25}
          className='font-mono uppercase'
        />
        <Input
          label='Số điện thoại đặt hàng'
          type='tel'
          inputMode='tel'
          autoComplete='tel'
          placeholder='VD: 0900 000 000'
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          leftIcon={<Phone size={16} />}
          maxLength={20}
        />
        <Button type='submit' loading={loading} className='h-12'>
          Tra cứu
        </Button>
      </form>
      <p className='mt-2 px-1 text-xs text-ink-500'>Mã đơn có trong trang xác nhận sau khi đặt hàng, gồm 6 ký tự sau dấu #.</p>

      {error ? <Alert className='mt-6' variant='error' desc={error} /> : null}

      {order && meta ? (
        <section className='mt-8 space-y-4' aria-live='polite'>
          <div className='rounded-3xl border border-ink-200 bg-white p-5 sm:p-6'>
            <div className='flex flex-wrap items-start justify-between gap-3'>
              <div>
                <p className='font-display text-2xl font-bold'>Đơn {order.code}</p>
                <p className='text-sm text-ink-500'>Đặt lúc {formatDate(order.created_at)}</p>
              </div>
              <StatusBadge tone={meta.tone} className='px-3 py-1.5 text-sm'>
                {meta.label}
              </StatusBadge>
            </div>
            <div className='mt-6'>
              <Timeline status={order.status} />
            </div>
          </div>

          <div className='grid gap-4 sm:grid-cols-2'>
            <div className='rounded-3xl border border-ink-200 bg-white p-5'>
              <h2 className='font-semibold'>Người nhận</h2>
              <dl className='mt-2 space-y-1 text-sm text-ink-700'>
                <div>{order.recipient.name || '—'}</div>
                <div>{order.recipient.phone}</div>
                {order.recipient.area ? <div>{order.recipient.area}</div> : null}
              </dl>
            </div>
            <div className='rounded-3xl border border-ink-200 bg-white p-5'>
              <h2 className='font-semibold'>Thanh toán</h2>
              <dl className='mt-2 space-y-1 text-sm text-ink-700'>
                <div>{mapPaymentMethod(order.payment_method)}</div>
                <div>{mapPaymentStatus(order.payment_status)}</div>
              </dl>
            </div>
          </div>

          <div className='rounded-3xl border border-ink-200 bg-white p-5 sm:p-6'>
            <h2 className='font-semibold'>Sản phẩm ({order.items.length})</h2>
            <ul className='mt-3 divide-y divide-ink-100'>
              {order.items.map((it, i) => {
                const img = formatImageUrl(it.thumbnail)
                return (
                  <li key={i} className='flex items-center gap-3 py-3'>
                    <span className='h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-ink-50'>
                      {img ? <img src={img} alt='' className='h-full w-full object-cover' /> : null}
                    </span>
                    <span className='min-w-0 flex-1'>
                      <span className='line-clamp-2 text-sm font-semibold'>{it.name}</span>
                      <span className='text-sm text-ink-500'>
                        {money(it.price)} × {it.quantity}
                      </span>
                    </span>
                    <span className='text-sm font-semibold'>{money(it.price * it.quantity)}</span>
                  </li>
                )
              })}
            </ul>
            <dl className='mt-3 space-y-1.5 border-t border-ink-100 pt-3 text-sm'>
              <div className='flex justify-between'>
                <dt className='text-ink-600'>Phí vận chuyển</dt>
                <dd>{money(order.shipping_fee)}</dd>
              </div>
              <div className='flex justify-between text-base font-semibold'>
                <dt>Tổng cộng</dt>
                <dd>{money(order.total_price)}</dd>
              </div>
            </dl>
          </div>

          {!signedIn ? (
            <p className='text-center text-sm text-ink-600'>
              Muốn theo dõi đơn dễ hơn lần sau?{' '}
              <Link to={ROUTE_PATHS.AUTH_REGISTER} className='font-semibold text-berry-700 hover:underline'>
                Tạo tài khoản
              </Link>
            </p>
          ) : null}
        </section>
      ) : null}
    </div>
  )
}
