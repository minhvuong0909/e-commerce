import { randomUUID } from 'crypto'
import { ObjectId } from 'mongodb'

interface RefreshTokenType {
  _id?: ObjectId
  user_id?: string
  token?: string
  expiryDate?: Date
}

export default class RefreshToken {
  _id: ObjectId
  user_id: string
  token: string
  expiryDate: Date

  constructor(data: RefreshTokenType = {}) {
    this._id = data._id ?? new ObjectId()
    this.user_id = data.user_id ?? randomUUID()
    this.token = data.token ?? ''
    this.expiryDate = data.expiryDate ?? new Date()
  }
}
