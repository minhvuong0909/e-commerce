import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { CheckCircle, XCircle, Loader2, ShoppingBag, ArrowLeft } from 'lucide-react'
import Button from '../../components/ui/Button'
import { ROUTE_PATHS } from '../../routes/route.paths'
import money from '../../utils/money'

type ResultStatus = 'loading' | 'success' | 'failed'

export default function OrderResultPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState<ResultStatus>('loading')

  // Lấy thông tin từ URL mà cổng thanh toán redirect về
  const gatewayStatus = searchParams.get('status')
  const resultCode = searchParams.get('resultCode')
  const orderId = searchParams.get('orderId') || ''
  const amountStr = searchParams.get('amount') || '0'
  const gatewayMessage = searchParams.get('message') || ''
  const transId = searchParams.get('transId') || ''
  const paymentMethod = searchParams.get('paymentMethod') || 'MOMO'
  const amountValue = Number(amountStr)
  const paymentMethodLabel = paymentMethod === 'PAYPAL' ? 'PayPal' : 'Ví MoMo'

  // query orderId
  const realOrderId = orderId.startsWith('ORDER-') ? orderId.split('-')[1] || '' : orderId

  useEffect(() => {
    // resultCode = 0 là thành công, PayPal callback gửi status=success
    if (resultCode === '0' || gatewayStatus === 'success') {
      setStatus('success')
    } else {
      setStatus('failed')
    }
  }, [gatewayStatus, resultCode])

  return (
    <div className='mx-auto max-w-2xl px-4 py-12 md:px-6'>
      <div className='surface-card overflow-hidden rounded-3xl'>
        {/* Header */}
        {status === 'loading' && (
          <div className='flex flex-col items-center gap-4 p-12 text-center'>
            <Loader2 size={56} className='animate-spin text-slate-400' />
            <h1 className='text-2xl font-black text-ink-950'>Đang xử lý...</h1>
            <p className='text-sm text-slate-500'>Vui lòng đợi trong giây lát</p>
          </div>
        )}

        {status === 'success' && (
          <>
            <div
              className='flex flex-col items-center gap-3 p-10 text-center'
              style={{
                background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'
              }}
            >
              <div
                className='grid h-20 w-20 place-items-center rounded-full'
                style={{ background: 'rgba(255,255,255,0.2)' }}
              >
                <CheckCircle size={44} className='text-white' />
              </div>
              <h1 className='text-2xl font-black text-white'>Thanh toán thành công!</h1>
              <p className='text-sm font-medium text-white/80'>Đơn hàng của bạn đã được xác nhận và đang được xử lý</p>
            </div>

            <div className='space-y-4 p-6 md:p-8'>
              {/* Thông tin giao dịch */}
              <div className='space-y-3 rounded-2xl bg-slate-50 p-5'>
                {amountValue > 0 && (
                  <>
                    <div className='flex items-center justify-between text-sm'>
                      <span className='text-slate-500'>Số tiền</span>
                      <span className='text-xl font-black text-green-600'>{money(amountValue)}</span>
                    </div>
                    <div className='h-px bg-slate-200' />
                  </>
                )}
                <div className='flex items-center justify-between text-sm'>
                  <span className='text-slate-500'>Phương thức</span>
                  <span className='font-bold text-ink-950'>{paymentMethodLabel}</span>
                </div>
                <div className='h-px bg-slate-200' />
                <div className='flex items-center justify-between text-sm'>
                  <span className='text-slate-500'>Mã giao dịch</span>
                  <span className='break-all text-right font-mono font-bold text-ink-950'>
                    {transId || 'Đang cập nhật'}
                  </span>
                </div>
                <div className='h-px bg-slate-200' />
                <div className='flex items-center justify-between text-sm'>
                  <span className='text-slate-500'>Trạng thái</span>
                  <span className='inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700'>
                    <span className='h-1.5 w-1.5 rounded-full bg-green-500' />
                    Thành công
                  </span>
                </div>
              </div>

              <p className='rounded-2xl border border-green-200 bg-green-50 p-4 text-center text-sm font-semibold leading-6 text-green-700'>
                📧 Email xác nhận thanh toán đã được gửi đến hộp thư của bạn!
              </p>

              {/* Actions */}
              <div className='flex flex-col gap-3 pt-2 sm:flex-row'>
                <Button
                  full
                  onClick={() =>
                    navigate(realOrderId ? ROUTE_PATHS.USER_ORDER_DETAIL(realOrderId) : ROUTE_PATHS.USER_ORDERS)
                  }
                >
                  <ShoppingBag size={16} />
                  Xem đơn hàng
                </Button>
                <Button full variant='outline' onClick={() => navigate(ROUTE_PATHS.USER_HOME)}>
                  <ArrowLeft size={16} />
                  Tiếp tục mua sắm
                </Button>
              </div>
            </div>
          </>
        )}

        {status === 'failed' && (
          <>
            <div
              className='flex flex-col items-center gap-3 p-10 text-center'
              style={{
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
              }}
            >
              <div
                className='grid h-20 w-20 place-items-center rounded-full'
                style={{ background: 'rgba(255,255,255,0.2)' }}
              >
                <XCircle size={44} className='text-white' />
              </div>
              <h1 className='text-2xl font-black text-white'>Thanh toán thất bại</h1>
              <p className='text-sm font-medium text-white/80'>{gatewayMessage || 'Giao dịch không thành công'}</p>
            </div>

            <div className='space-y-4 p-6 md:p-8'>
              <div className='rounded-2xl border border-red-200 bg-red-50 p-4 text-center text-sm font-semibold leading-6 text-red-700'>
                Vui lòng thử lại hoặc chọn phương thức thanh toán khác.
              </div>

              <div className='flex flex-col gap-3 pt-2 sm:flex-row'>
                <Button full onClick={() => navigate(ROUTE_PATHS.USER_ORDERS)}>
                  <ShoppingBag size={16} />
                  Xem đơn hàng
                </Button>
                <Button full variant='outline' onClick={() => navigate(ROUTE_PATHS.USER_HOME)}>
                  <ArrowLeft size={16} />
                  Về trang chủ
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
