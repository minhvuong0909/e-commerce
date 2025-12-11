import { Request } from 'express'
import { TokenPayload } from './models/requests/Users.requests'

// định nghĩa request token by decode
declare module 'express' {
  interface Request {
    decode_authorization?: TokenPayload
    decode_refresh_token?: TokenPayload
    decode_email_verify_token?: TokenPayLoad
    decode_forgot_password_token?: TokenPayLoad
  }
}
