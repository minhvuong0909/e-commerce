import { ObjectId } from 'mongodb'
import { PRODUCT_STATUS } from '~/constants/enums'

export interface CreateProductBody {
  name: string
  quantity: number
  price: number
  description: string
  origin: string // nguồn gốc,
  volume: number // dung tích
  weight: number
  width: number
  height: number
  status?: PRODUCT_STATUS
  images: string[]
  thumbnail: string
  category_id: ObjectId
  brand_id: ObjectId
}
