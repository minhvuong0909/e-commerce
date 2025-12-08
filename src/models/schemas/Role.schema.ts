import { randomUUID } from 'crypto'
import { RoleStatus, USER_ROLE } from '~/constants/enums'
import { ObjectId } from 'mongodb'

// định nghĩa role
interface RoleType {
  _id?: ObjectId
  role: USER_ROLE
  description?: string
  status: RoleStatus
  created_at?: Date
  updated_at?: Date
}

// table role
export default class Role {
  _id?: ObjectId
  role: USER_ROLE
  description?: string
  status: RoleStatus
  created_at?: Date
  updated_at?: Date
  constructor(data: RoleType) {
    const date = new Date()
    this._id = data._id ?? new ObjectId()
    this.role = data.role
    this.description = data.description ?? ''
    this.status = data.status
    this.created_at = data.created_at ?? date
    this.updated_at = data.updated_at ?? date
  }
}
