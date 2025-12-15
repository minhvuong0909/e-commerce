import { JwtPayload } from 'jsonwebtoken'
import { TokenType } from '~/constants/enums'
import { ParsedQs } from 'qs'

// define user request
export interface LoginRequestBody {
  email: string
  password: string
}

// payload sau khi verifyToken thành công
export interface TokenPayload extends JwtPayload {
  user_id: string
  token_type: TokenType
  iat: number
  exp: number // thời gian hết hạn token
}

// register
export interface RegisterRequestBody {
  name: string
  email: string
  password: string
  confirm_password: string
  date_of_birth: string
}

// verify email
export interface EmailVerifyReqQuery extends ParsedQs {
  email_verify_token: string
}

// logout
export interface LogoutRequestBody {
  refresh_token: string
}

// forgot passoword
export interface ForgotPasswordRequestBody {
  email: string
}

// verify forgot password token
export interface VerifyForgotPasswordRequestBody {
  forgot_password_token: string
}

// reset password
export interface ResetPasswordReqBody {
  password: string
  confirm_password: string
  forgot_password_token: string
}

// update profile request
export interface UpdateProfileRequestBody {
  name?: string
  date_of_birth?: string //vì ngta truyền lên string dạng ISO8601, k phải date
  bio?: string
  location?: string
  website?: string
  username?: string
  avatar?: string
  cover_photo?: string
}

// change password
export interface ChangePasswordReqBody {
  old_password: string
  password: string
  confirm_password: string
}
