import { ObjectId } from 'mongodb'

interface BrandType {
  _id?: ObjectId //option
  name: string
  hotline: string
  desc: string
  address: string
  created_at?: Date
  updated_at?: Date
}

export default class Brand {
  _id?: ObjectId
  name: string
  hotline: string
  desc: string
  address: string
  created_at: Date
  updated_at: Date
  constructor(brand: BrandType) {
    const date = new Date()
    this._id = brand._id || new ObjectId()
    this.name = brand.name
    this.desc = brand.desc
    this.hotline = brand.hotline
    this.address = brand.address
    this.created_at = brand.created_at || date
    this.updated_at = brand.updated_at || date
  }
}
