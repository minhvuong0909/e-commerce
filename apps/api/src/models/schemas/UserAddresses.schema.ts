import { ObjectId } from 'mongodb'

export interface UserAddressType {
  _id?: ObjectId
  user_id: ObjectId
  label?: string
  recipient_name: string
  phone: string
  note?: string
  address_line: string
  city?: string
  district?: string
  lat: number
  lng: number
  address_source?: 'manual' | 'map'
  is_default?: boolean
  created_at?: Date
  updated_at?: Date
}

export default class UserAddress {
  _id?: ObjectId
  user_id: ObjectId
  label: string
  recipient_name: string
  phone: string
  note: string
  address_line: string
  city: string
  district: string
  lat: number
  lng: number
  address_source: 'manual' | 'map'
  is_default: boolean
  created_at: Date
  updated_at: Date

  constructor(data: UserAddressType) {
    const now = new Date()
    this._id = data._id || new ObjectId()
    this.user_id = data.user_id
    this.label = data.label || ''
    this.recipient_name = data.recipient_name
    this.phone = data.phone
    this.note = data.note || ''
    this.address_line = data.address_line
    this.city = data.city || ''
    this.district = data.district || ''
    this.lat = data.lat
    this.lng = data.lng
    this.address_source = data.address_source || 'manual'
    this.is_default = data.is_default ?? false
    this.created_at = data.created_at || now
    this.updated_at = data.updated_at || now
  }
}
