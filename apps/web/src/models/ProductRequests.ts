export interface Product {
  _id: string
  name: string
  price: number
  quantity: number
  description: string
  rating_number: number
  thumbnail?: string
  medias: Array<string | { url: string; type?: number }>
  origin: string
  volume?: number
  weight?: number
  soldNumber?: number
  created_at?: string
}

export interface CreateProductRequest extends Omit<Product, '_id' | 'rating_number'> {
  brand_id: string
  volume?: number
  weight?: number
  width?: number
  height?: number
  category_id: string
}
