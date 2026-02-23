export interface Product {
  _id: string
  name: string
  price: number
  quantity: number
  description: string
  rating_number: number
  medias: {
    url: string
    type: number
  }[]
  origin: string
}
