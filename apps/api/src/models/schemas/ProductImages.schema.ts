import { ObjectId } from 'mongodb'
import { Media } from '../Other'

// table này để lưu các image của product
interface ProductImagesType {
  _id?: ObjectId
  product_id: ObjectId
  media: Media
}
