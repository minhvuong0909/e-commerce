import { ObjectId } from 'mongodb'

interface CategoryType {
  _id?: ObjectId
  name: string
  desc: string
  slug?: string // đánh dấu từng category của url
  created_at?: Date
  updated_at?: Date
}

export default class Category {
  _id: ObjectId
  name: string
  desc: string
  slug?: string
  created_at: Date
  updated_at: Date
  constructor(category: CategoryType) {
    const date = new Date()
    this._id = category._id || new ObjectId()
    this.name = category.name
    this.desc = category.desc
    this.slug = category.slug
    this.created_at = category.created_at || date
    this.updated_at = category.updated_at || date
  }
}
