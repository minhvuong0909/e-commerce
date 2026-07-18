import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Headphones,
  RefreshCw,
  ShieldCheck,
  ShoppingBag,
  XCircle
} from 'lucide-react'
import { ROUTE_PATHS } from '../../routes/route.paths'
import money from '../../utils/money'
import cn from '../../utils/cn'

type ResultStatus = 'success' | 'failed' | 'pending'

const panelClass = 'rounded-lg border border-[#eaded8] bg-white overflow-hidden'

function resolvePaymentResult(params: URLSearchParams): ResultStatus {
  const gatewayStatus = params.get('status')?.toLowerCase()
  const resultCode = params.get('resultCode')

  if (gatewayStatus === 'pending') return 'pending'
  if (resultCode === '0' || gatewayStatus === 'success') return 'success'
  if (resultCode && resultCode !== '0') return 'failed'
  if (gatewayStatus === 'fail' || gatewayStatus === 'failed') return 'failed'

  const orderId = params.get('orderId')
  if (orderId && !resultCode && !gatewayStatus) return 'pending'

  return 'failed'
}

function TrustStrip() {
  const items = [
    { icon: ShieldCheck, text: 'Thanh toán bảo mật' },
    { icon: Headphones, text: 'support@vibrantmart.local' },
    { icon: RefreshCw, text: 'Đổi trả minh bạch' }
  ]

  return (
    <div className='mt-6 rounded-lg border border-[#eaded8] bg-[#fdf8f6] p-4'>
      <p className='text-xs font-semibold uppercase tracking-wide text-[#8a7a74]'>Hỗ trợ & cam kết</p>
      <ul className='mt-3 space-y-2'>
        {items.map(({ icon: Icon, text }) => (
          <li key={text} className='flex items-center gap-2 text-sm text-[#6b5f59]'>
            <Icon size={15} className='shrink-0 text-[#b07a72]' />
            {text}
          </li>
        ))}
      </ul>
    </div>
  )
}

function getFriendlyErrorMessage(resultCode: string | null, paymentMethod: string): string {
  if (paymentMethod === 'MOMO') {
    if (!resultCode) return 'Giao dịch không thành công. Vui lòng thử lại.'
    switch (resultCode) {
      case '9000':
        return 'Giao dịch đã bị hủy bởi người dùng.'
      case '1006':
        return 'Tài khoản ví MoMo không đủ số dư để thực hiện giao dịch.'
      case '49':
        return 'Giao dịch bị từ chối do người dùng hủy thanh toán trên ứng dụng MoMo.'
      case '1001':
        return 'Giao dịch bị từ chối do tài khoản của bạn chưa được xác thực.'
      case '1002':
        return 'Giao dịch bị từ chối do nhà phát hành ví MoMo.'
      case '1005':
        return 'Giao dịch thất bại do mã QR hoặc thông tin thanh toán đã hết hạn.'
      case '1':
      case '99':
      default:
        return 'Giao dịch thanh toán qua MoMo không thành công. Vui lòng thử lại.'
    }
  }
  if (paymentMethod === 'PAYOS') {
    return 'Giao dịch chuyển khoản qua PayOS đã bị hủy hoặc không thành công.'
  }
  return 'Giao dịch không thành công. Bạn có thể thử lại.'
}

export default function OrderResultPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const gatewayStatus = searchParams.get('status')
  const resultCode = searchParams.get('resultCode')
  const orderId = searchParams.get('orderId') || ''
  const amountStr = searchParams.get('amount') || '0'
  const transId = searchParams.get('transId') || ''
  const paymentMethod = searchParams.get('paymentMethod') || 'MOMO'
  const amountValue = Number(amountStr)
  const paymentMethodLabel = (() => {
    if (paymentMethod === 'PAYPAL') return 'PayPal'
    if (paymentMethod === 'PAYOS') return 'PayOS'
    return 'Ví MoMo'
  })()

  const realOrderId = orderId.startsWith('ORDER-') ? orderId.split('-').slice(1).join('-') || orderId.replace('ORDER-', '') : orderId
  const orderCode = realOrderId ? `#${realOrderId.slice(-6).toUpperCase()}` : ''

  const status = resolvePaymentResult(searchParams)

  const orderDetailPath = realOrderId ? ROUTE_PATHS.USER_ORDER_DETAIL(realOrderId) : ROUTE_PATHS.USER_ORDERS

  const friendlyError = getFriendlyErrorMessage(resultCode, paymentMethod)

  const headerConfig = {
    success: {
      icon: CheckCircle2,
      title: 'Thanh toán thành công',
      desc: 'Cảm ơn bạn! Đơn hàng đang được xử lý.',
      bg: 'bg-[linear-gradient(180deg,#fdf8f6_0%,#f5ebe6_100%)]',
      iconWrap: 'bg-[#b07a72]/15 text-[#b07a72]'
    },
    failed: {
      icon: XCircle,
      title: 'Thanh toán chưa hoàn tất',
      desc: friendlyError,
      bg: 'bg-[linear-gradient(180deg,#fff5f5_0%,#fdf8f6_100%)]',
      iconWrap: 'bg-rose-100 text-rose-600'
    },
    pending: {
      icon: Clock,
      title: 'Đang xử lý thanh toán',
      desc: 'Giao dịch đang được xác nhận. Vui lòng kiểm tra lại đơn hàng sau vài phút.',
      bg: 'bg-[linear-gradient(180deg,#fffbf7_0%,#fdf8f6_100%)]',
      iconWrap: 'bg-amber-100 text-amber-700'
    }
  }[status]

  const HeaderIcon = headerConfig.icon

  return (
    <div className='mx-auto max-w-xl px-4 py-10 md:px-6 md:py-14'>
      <div className={panelClass}>
        <div className={cn('flex flex-col items-center px-6 py-10 text-center', headerConfig.bg)}>
          <span className={cn('grid h-16 w-16 place-items-center rounded-full', headerConfig.iconWrap)}>
            <HeaderIcon size={32} strokeWidth={1.75} />
          </span>
          <h1 className='mt-5 text-2xl font-semibold text-[#3d3330]'>{headerConfig.title}</h1>
          <p className='mt-2 max-w-sm text-sm leading-6 text-[#8a7a74]'>{headerConfig.desc}</p>
        </div>

        <div className='space-y-4 p-6 md:p-8'>
          {(orderCode || amountValue > 0 || transId) && (
            <div className='space-y-3 rounded-lg border border-[#f0e4de] bg-[#fdf8f6] p-4 text-sm'>
              {orderCode ? (
                <div className='flex justify-between gap-4'>
                  <span className='text-[#8a7a74]'>Mã đơn</span>
                  <span className='font-semibold text-[#3d3330]'>{orderCode}</span>
                </div>
              ) : null}
              {amountValue > 0 ? (
                <div className='flex justify-between gap-4'>
                  <span className='text-[#8a7a74]'>Số tiền</span>
                  <span className='text-lg font-bold text-[#3d3330]'>{money(amountValue)}</span>
                </div>
              ) : null}
              <div className='flex justify-between gap-4'>
                <span className='text-[#8a7a74]'>Phương thức</span>
                <span className='font-semibold text-[#3d3330]'>{paymentMethodLabel}</span>
              </div>
              {transId ? (
                <div className='flex justify-between gap-4'>
                  <span className='shrink-0 text-[#8a7a74]'>Mã GD</span>
                  <span className='break-all text-right font-mono text-xs font-semibold text-[#3d3330]'>{transId}</span>
                </div>
              ) : null}
            </div>
          )}

          {status === 'success' ? (
            <p className='rounded-lg border border-[#eaded8] bg-[#fdf8f6] px-4 py-3 text-center text-sm leading-6 text-[#6b5f59]'>
              Dự kiến giao trong bán kính 25km — shop sẽ xác nhận và liên hệ khi đơn sẵn sàng giao.
              {gatewayStatus || resultCode ? (
                <span className='mt-1 block text-xs text-[#8a7a74]'>Email xác nhận sẽ được gửi nếu bạn đã bật thông báo.</span>
              ) : null}
            </p>
          ) : null}

          {status === 'pending' ? (
            <p className='rounded-lg border border-amber-200/80 bg-amber-50/80 px-4 py-3 text-sm leading-6 text-amber-900'>
              Nếu đã trừ tiền, trạng thái sẽ cập nhật tự động. Bạn có thể mở chi tiết đơn để kiểm tra hoặc thanh toán lại.
            </p>
          ) : null}

          {status === 'failed' ? (
            <p className='rounded-lg border border-rose-200/80 bg-rose-50/80 px-4 py-3 text-sm leading-6 text-rose-800'>
              {friendlyError}
            </p>
          ) : null}

          <div className='flex flex-col gap-2 pt-1'>
            {status === 'failed' && realOrderId ? (
              <button
                type='button'
                onClick={() => navigate(orderDetailPath)}
                className='flex h-11 w-full items-center justify-center gap-2 rounded-md bg-[#3d3330] text-sm font-semibold text-white hover:bg-[#2a2421]'
              >
                <RefreshCw size={16} />
                Thử thanh toán lại
              </button>
            ) : null}

            <button
              type='button'
              onClick={() => navigate(orderDetailPath)}
              className={cn(
                'flex h-11 w-full items-center justify-center gap-2 rounded-md text-sm font-semibold',
                status === 'failed' && realOrderId
                  ? 'border border-[#3d3330] text-[#3d3330] hover:bg-[#fdf8f6]'
                  : 'bg-[#3d3330] text-white hover:bg-[#2a2421]'
              )}
            >
              <ShoppingBag size={16} />
              Xem đơn hàng
            </button>

            {status === 'failed' ? (
              <Link
                to={ROUTE_PATHS.USER_CART}
                className='flex h-11 w-full items-center justify-center gap-2 rounded-md border border-[#eaded8] text-sm font-semibold text-[#3d3330] hover:bg-[#fdf8f6]'
              >
                Quay lại giỏ hàng
              </Link>
            ) : null}

            <Link
              to={ROUTE_PATHS.USER_HOME}
              className='flex h-11 w-full items-center justify-center gap-2 rounded-md border border-[#eaded8] text-sm font-semibold text-[#6b5f59] hover:bg-[#fdf8f6]'
            >
              <ArrowLeft size={16} />
              Tiếp tục mua sắm
            </Link>
          </div>

          <TrustStrip />
        </div>
      </div>
    </div>
  )
}
