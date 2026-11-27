import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowLeft, CheckCircle2, Clock, PackageCheck, RefreshCw, ShoppingBag, XCircle } from 'lucide-react'
import { ROUTE_PATHS } from '../../routes/route.paths'
import money from '../../utils/money'
import cn from '../../utils/cn'
import { getToken } from '../../utils/authSession'

type ResultStatus = 'success' | 'failed' | 'pending' | 'placed'

function resolvePaymentResult(params: URLSearchParams): ResultStatus {
  const gatewayStatus = params.get('status')?.toLowerCase()
  const resultCode = params.get('resultCode')

  if (params.get('paymentMethod') === 'COD' && params.get('orderId')) return 'placed'
  if (gatewayStatus === 'pending') return 'pending'
  if (resultCode === '0' || gatewayStatus === 'success') return 'success'
  if (resultCode && resultCode !== '0') return 'failed'
  if (gatewayStatus === 'fail' || gatewayStatus === 'failed') return 'failed'

  const orderId = params.get('orderId')
  if (orderId && !resultCode && !gatewayStatus) return 'pending'
  return 'failed'
}

function getFriendlyErrorMessage(resultCode: string | null, paymentMethod: string): string {
  if (paymentMethod === 'MOMO') {
    switch (resultCode) {
      case '9000':
        return 'Giao dịch đã bị hủy.'
      case '1006':
        return 'Ví MoMo không đủ số dư để thực hiện giao dịch.'
      case '49':
        return 'Bạn đã hủy thanh toán trên ứng dụng MoMo.'
      case '1001':
        return 'Tài khoản MoMo chưa được xác thực.'
      case '1002':
        return 'Giao dịch bị từ chối bởi nhà phát hành ví.'
      case '1005':
        return 'Mã QR hoặc thông tin thanh toán đã hết hạn.'
      default:
        return 'Thanh toán qua MoMo chưa thành công. Vui lòng thử lại.'
    }
  }
  if (paymentMethod === 'PAYOS') return 'Giao dịch PayOS đã bị hủy hoặc chưa thành công.'
  return 'Giao dịch chưa thành công. Bạn có thể thử lại.'
}

export default function OrderResultPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const reduce = useReducedMotion()
  const isSignedIn = Boolean(getToken())

  const resultCode = searchParams.get('resultCode')
  const orderId = searchParams.get('orderId') || ''
  const amountValue = Number(searchParams.get('amount') || '0')
  const transId = searchParams.get('transId') || ''
  const paymentMethod = searchParams.get('paymentMethod') || 'MOMO'
  const paymentMethodLabel =
    { COD: 'Thanh toán khi nhận hàng', PAYPAL: 'PayPal', PAYOS: 'PayOS' }[paymentMethod] ?? 'Ví MoMo'

  const realOrderId = orderId.startsWith('ORDER-') ? orderId.split('-').slice(1).join('-') || orderId.replace('ORDER-', '') : orderId
  const orderCode = realOrderId ? `#${realOrderId.slice(-6).toUpperCase()}` : ''
  const status = resolvePaymentResult(searchParams)
  const orderDetailPath = realOrderId ? ROUTE_PATHS.USER_ORDER_DETAIL(realOrderId) : ROUTE_PATHS.USER_ORDERS
  const friendlyError = getFriendlyErrorMessage(resultCode, paymentMethod)

  const config = {
    placed: {
      icon: PackageCheck,
      title: 'Đặt hàng thành công!',
      desc: 'Shop sẽ xác nhận và liên hệ qua số điện thoại bạn đã nhập trước khi giao.',
      tone: 'bg-lime-300 text-ink-950',
      band: 'from-lime-200 via-lilac-100 to-berry-100'
    },
    success: {
      icon: CheckCircle2,
      title: 'Thanh toán thành công!',
      desc: 'Cảm ơn bạn. Đơn hàng đã được ghi nhận và đang được chuẩn bị.',
      tone: 'bg-lime-300 text-ink-950',
      band: 'from-lime-200 via-lilac-100 to-berry-100'
    },
    failed: {
      icon: XCircle,
      title: 'Thanh toán chưa hoàn tất',
      desc: friendlyError,
      tone: 'bg-rose-500 text-white',
      band: 'from-rose-100 via-berry-50 to-peach-100'
    },
    pending: {
      icon: Clock,
      title: 'Đang xác nhận thanh toán',
      desc: 'Nếu tài khoản đã bị trừ tiền, trạng thái đơn sẽ tự cập nhật sau ít phút.',
      tone: 'bg-peach-300 text-ink-950',
      band: 'from-peach-100 via-lilac-50 to-berry-50'
    }
  }[status]
  const Icon = config.icon
  const positive = status === 'success' || status === 'placed'

  return (
    <div className='mx-auto max-w-xl px-4 py-10 md:py-16'>
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className='overflow-hidden rounded-4xl bg-white ring-1 ring-ink-100'
      >
        <div className={cn('relative flex flex-col items-center bg-gradient-to-br px-6 pb-10 pt-12 text-center', config.band)}>
          <motion.span
            initial={reduce ? false : { scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 16, delay: 0.15 }}
            className={cn('grid h-20 w-20 place-items-center rounded-[1.75rem] shadow-soft', config.tone)}
          >
            <Icon size={38} strokeWidth={2} aria-hidden />
          </motion.span>
          <h1 className='mt-6 font-display text-3xl font-bold md:text-4xl'>{config.title}</h1>
          <p className='mt-2 max-w-sm text-ink-700'>{config.desc}</p>
        </div>

        <div className='space-y-5 p-6 md:p-8'>
          <dl className='divide-y divide-ink-100 rounded-3xl bg-ink-50 px-5 text-sm'>
            {orderCode ? (
              <div className='flex justify-between gap-4 py-3'>
                <dt className='text-ink-500'>Mã đơn</dt>
                <dd className='font-semibold'>{orderCode}</dd>
              </div>
            ) : null}
            {amountValue > 0 ? (
              <div className='flex justify-between gap-4 py-3'>
                <dt className='text-ink-500'>Số tiền</dt>
                <dd className='font-display text-lg font-bold'>{money(amountValue)}</dd>
              </div>
            ) : null}
            <div className='flex justify-between gap-4 py-3'>
              <dt className='text-ink-500'>Phương thức</dt>
              <dd className='font-semibold'>{paymentMethodLabel}</dd>
            </div>
            {transId ? (
              <div className='flex justify-between gap-4 py-3'>
                <dt className='shrink-0 text-ink-500'>Mã giao dịch</dt>
                <dd className='break-all text-right font-mono text-xs font-semibold'>{transId}</dd>
              </div>
            ) : null}
          </dl>

          {status === 'placed' && !isSignedIn ? (
            <p className='rounded-3xl bg-lilac-50 px-5 py-4 text-sm text-lilac-700'>
              Lưu lại mã đơn {orderCode} để tiện tra cứu. Tạo tài khoản để theo dõi đơn hàng trực tuyến cho các lần mua sau.
            </p>
          ) : null}

          <div className='grid gap-2'>
            {status === 'failed' && realOrderId && isSignedIn ? (
              <button
                type='button'
                onClick={() => navigate(orderDetailPath)}
                className='flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-berry-600 font-semibold text-white hover:bg-berry-700'
              >
                <RefreshCw size={17} /> Thử thanh toán lại
              </button>
            ) : null}
            {isSignedIn ? (
              <button
                type='button'
                onClick={() => navigate(orderDetailPath)}
                className={cn(
                  'flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-full font-semibold',
                  positive || status === 'pending' ? 'bg-ink-950 text-white hover:bg-ink-800' : 'border-[1.5px] border-ink-200 hover:border-ink-950'
                )}
              >
                <ShoppingBag size={17} /> Xem đơn hàng
              </button>
            ) : (
              <Link
                to={ROUTE_PATHS.AUTH_REGISTER}
                className='flex h-12 w-full items-center justify-center gap-2 rounded-full bg-ink-950 font-semibold text-white hover:bg-ink-800'
              >
                Tạo tài khoản
              </Link>
            )}
            {status === 'failed' ? (
              <Link
                to={ROUTE_PATHS.USER_CART}
                className='flex h-12 w-full items-center justify-center rounded-full border-[1.5px] border-ink-200 font-semibold hover:border-ink-950'
              >
                Quay lại giỏ hàng
              </Link>
            ) : null}
            <Link
              to={ROUTE_PATHS.USER_HOME}
              className='flex h-12 w-full items-center justify-center gap-2 rounded-full font-semibold text-ink-700 hover:bg-ink-100'
            >
              <ArrowLeft size={17} /> Tiếp tục mua sắm
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
