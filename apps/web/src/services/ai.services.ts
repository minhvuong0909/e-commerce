import api from '../configs/api'

export type SkincareChatResponse = {
  answer: string
  products: Array<{
    _id: string
    name: string
    price: number
    thumbnail: string
    tag: string
  }>
}

/**
 * [Admin] Tự động tạo mô hình mô tả sản phẩm bằng AI
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
 * Gửi câu hỏi tư vấn da liễu tới Backend AI Assistant Endpoint
 */
export const skincareChatApi = (message: string) => {
  return api.post<{ message: string; result: SkincareChatResponse }>('/ai/chat', { message })
}
