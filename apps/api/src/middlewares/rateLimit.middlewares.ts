import rateLimit from 'express-rate-limit'
import HTTP_STATUS from '~/constants/httpStatus'
const commonOptions = {
  standardHeaders: 'draft-7' as const,
  legacyHeaders: false,
  statusCode: HTTP_STATUS.TOO_MANY_REQUESTS
}

export const shippingLimiter = rateLimit({
  ...commonOptions,
  windowMs: 60_000,
  limit: 30,
  message: { message: 'Quá nhiều yêu cầu địa chỉ/giao hàng. Vui lòng thử lại sau.' }
})

export const uploadLimiter = rateLimit({
  ...commonOptions,
  windowMs: 15 * 60_000,
  limit: 20,
  message: { message: 'Quá nhiều lần tải lên. Vui lòng thử lại sau.' }
})
export const aiLimiter = rateLimit({
  ...commonOptions,
  windowMs: 60_000,
  limit: 10,
  message: { message: 'Quá nhiều yêu cầu AI. Vui lòng thử lại sau.' }
})
export const guestOrderLimiter = rateLimit({
  ...commonOptions,
  windowMs: 15 * 60_000,
  limit: 10,
  message: { message: 'Quá nhiều yêu cầu đặt hàng. Vui lòng thử lại sau.' }
})

// Giới hạn các endpoint nhạy cảm về xác thực (login, forgot password) để chống brute-force.
export const authLimiter = rateLimit({
  ...commonOptions,
  windowMs: 15 * 60 * 1000, // 15 phút
  limit: 10, // tối đa 10 request / IP / cửa sổ
  message: {
    message: 'Quá nhiều lần thử. Vui lòng thử lại sau ít phút.'
  }
})

export const forgotPasswordLimiter = rateLimit({
  ...commonOptions,
  windowMs: 60 * 60 * 1000, // 1 giờ
  limit: 5,
  message: {
    message: 'Bạn đã yêu cầu khôi phục mật khẩu quá nhiều lần. Vui lòng thử lại sau.'
  }
})

/** Public voucher check: enough for real checkouts, too slow to enumerate codes. */
export const voucherValidateLimiter = rateLimit({
  ...commonOptions,
  windowMs: 60_000,
  limit: 15,
  message: { message: 'Bạn thử mã giảm giá quá nhiều lần. Vui lòng thử lại sau ít phút.' }
})
