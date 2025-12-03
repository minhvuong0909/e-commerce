import { JwtPayload } from 'jsonwebtoken'
import { TokenType } from '~/constants/enums'

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
