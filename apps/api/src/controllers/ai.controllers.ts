import { Request, Response } from 'express'
import HTTP_STATUS from '~/constants/httpStatus'
import aiService, { CHAT_LIMITS, type ProductDescriptionInput } from '~/services/ai.services'
import { badRequest } from '~/utils/security'

const DESCRIPTION_FIELD_LIMITS: Record<keyof ProductDescriptionInput, number> = {
  name: 200,
  brand: 120,
  ingredients: 1000,
  skin_type: 200,
  benefits: 1000
}

/** Accept only the known string fields, each within its length limit. */
export function parseDescriptionInput(body: unknown): ProductDescriptionInput {
  const raw = (body && typeof body === 'object' ? body : {}) as Record<string, unknown>
  const out: Partial<ProductDescriptionInput> = {}
  for (const [field, max] of Object.entries(DESCRIPTION_FIELD_LIMITS) as Array<[keyof ProductDescriptionInput, number]>) {
    const value = raw[field]
    if (value === undefined || value === null || value === '') continue
    if (typeof value !== 'string' || value.length > max) badRequest(`Trường ${field} phải là chuỗi tối đa ${max} ký tự.`)
    out[field] = value.trim()
  }
  if (!out.name) badRequest('Vui lòng nhập tên sản phẩm.')
  return out as ProductDescriptionInput
}

export const generateProductDescriptionController = async (req: Request, res: Response) => {
  const result = await aiService.generateProductDescription(parseDescriptionInput(req.body))
  res.status(HTTP_STATUS.OK).json({ message: 'Generate product description success', result })
}

export const skincareChatController = async (req: Request, res: Response) => {
  const { message, history } = (req.body ?? {}) as { message?: unknown; history?: unknown }
  if (typeof message !== 'string' || !message.trim() || message.length > CHAT_LIMITS.messageChars)
    badRequest(`Tin nhắn phải có từ 1 đến ${CHAT_LIMITS.messageChars} ký tự.`)
  if (history !== undefined && (!Array.isArray(history) || history.length > 20)) badRequest('Lịch sử hội thoại không hợp lệ.')
  const result = await aiService.skincareChat(message, history)
  res.status(HTTP_STATUS.OK).json({ message: 'AI chat response success', result })
}
