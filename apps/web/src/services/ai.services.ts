import api from '../configs/api'

export type ChatTurn = { role: 'user' | 'assistant'; content: string }

export type ChatProduct = {
  _id: string
  name: string
  price: number
  thumbnail?: string
  origin?: string
}

export type SkincareChatResponse = {
  answer: string
  products: ChatProduct[]
  source: 'openai' | 'rules'
}

/**
 * [Admin] Gợi ý mô tả sản phẩm bằng AI
 */
export const generateProductDescriptionApi = (data: {
  name: string
  brand?: string
  ingredients?: string
  skin_type?: string
  benefits?: string
}) => {
  return api.post<{ message: string; result: { description: string; source: string } }>('/ai/product-description', data)
}

/**
 * Trợ lý chăm sóc da trên storefront. `history` là vài lượt gần nhất để AI hiểu ngữ cảnh.
 */
export const skincareChatApi = (message: string, history: ChatTurn[] = []) => {
  return api.post<{ message: string; result: SkincareChatResponse }>('/ai/chat', { message, history })
}
