import { ObjectId } from 'mongodb'
import { PRODUCT_STATUS } from '~/constants/enums'
import { Media } from '../Other'

interface ProductType {
  _id?: ObjectId
  name: string
  quantity: number
  price: number
  description: string
  rating_number?: number
  brand_id: ObjectId
  origin: string // nguồn gốc,
  volume: number // dung tích
  weight: number
  width: number
  height: number
  soldNumber?: number
  medias?: Media[]
  thumbnail: string
  status?: PRODUCT_STATUS
  category_id: ObjectId
  ship_category_id?: ObjectId
  created_at?: Date
  updated_at?: Date
}

export default class Product {
  _id?: ObjectId
  name: string
  quantity: number
  price: number
  description: string
  rating_number?: number
  brand_id: ObjectId
  origin: string // nguồn gốc,
  volume: number // dung tích
  weight?: number
  width?: number
  height?: number
  soldNumber?: number
  thumbnail: string
  medias?: Media[]
  status?: PRODUCT_STATUS
  category_id: ObjectId
  ship_category_id: ObjectId // giao hàng speed
  created_at: Date
  updated_at: Date

  constructor(product: ProductType) {
    const date = new Date()
    this._id = product._id || new ObjectId()
    this.name = product.name
    this.quantity = product.quantity
    this.price = product.price
    this.description = product.description
    this.rating_number = product.rating_number || 5
    this.brand_id = product.brand_id || new ObjectId()
    this.origin = product.origin
    this.volume = product.volume
    this.weight = product.weight
    this.width = product.width
    this.height = product.height
    this.thumbnail = product.thumbnail
    this.medias = product.medias || []
    this.soldNumber = product.soldNumber || 0
    this.category_id = product.category_id || new ObjectId()
    this.ship_category_id = product.ship_category_id || new ObjectId()
    this.created_at = product.created_at || date
    this.updated_at = product.updated_at || date
  }
}
