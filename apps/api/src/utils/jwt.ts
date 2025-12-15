import { error } from 'console'
import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'
import { reject } from 'lodash'
import { resolve } from 'path'
import { TokenPayload } from '~/models/requests/Users.requests'

dotenv.config()

// signToken là hàm kí token
// kí thành công response token
export const signToken = ({
  payload,
  privateKey,
  options = { algorithm: 'HS256' }
}: {
  payload: string | Object | Buffer // buffer này là kiểu dữ liệu nhập từ bàn phím
  privateKey: string
  options?: jwt.SignOptions
}) => {
  return new Promise<string>((resolve, reject) => {
    jwt.sign(payload, privateKey, options, (error, token) => {
      if (error) throw reject(error)
      else resolve(token as string)
    })
  })
}

// hàm verify token
// lấy token
// verify thành công sẽ trả ra token decode
export const verifyToken = ({ token, privateKey }: { token: string; privateKey: string }) => {
  return new Promise<TokenPayload>((resolve, reject) => {
    jwt.verify(token, privateKey, (error, decode) => {
      if (error) throw reject(error)
      else resolve(decode as TokenPayload)
    })
  })
}
