import { ObjectId } from 'mongodb'
import { Media } from '../Other'

// table này để lưu các image của product
interface ProductMediaType {
  _id?: ObjectId
  product_id: ObjectId
  media: Media
}

export default class ProductMedia {
  _id?: ObjectId
  product_id: ObjectId
  media: Media
  constructor(productMedia: ProductMedia) {
    this._id = productMedia._id || new ObjectId()
    this.product_id = productMedia.product_id
    this.media = productMedia.media
  }
}
