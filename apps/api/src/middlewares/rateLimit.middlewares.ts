import rateLimit from 'express-rate-limit'
import HTTP_STATUS from '~/constants/httpStatus'

// Giới hạn các endpoint nhạy cảm về xác thực (login, forgot password) để chống brute-force.
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  limit: 10, // tối đa 10 request / IP / cửa sổ
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    message: 'Quá nhiều lần thử. Vui lòng thử lại sau ít phút.'
  },
  statusCode: HTTP_STATUS.TOO_MANY_REQUESTS
})

export const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 giờ
  limit: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    message: 'Bạn đã yêu cầu khôi phục mật khẩu quá nhiều lần. Vui lòng thử lại sau.'
  },
  statusCode: HTTP_STATUS.TOO_MANY_REQUESTS
})
