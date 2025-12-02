import { randomUUID } from 'crypto'

interface RefreshTokenType {
  _id?: string
  user_id?: string
  token?: string
  expiryDate?: Date
}

export default class RefreshToken {
  _id: string
  user_id: string
  token: string
  expiryDate: Date

  constructor(data: RefreshTokenType = {}) {
    this._id = data._id ?? randomUUID()
    this.user_id = data.user_id ?? randomUUID()
    this.token = data.token ?? ''
    this.expiryDate = data.expiryDate ?? new Date()
  }
}
