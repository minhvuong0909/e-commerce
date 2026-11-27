import { Request, Response } from 'express'
import HTTP_STATUS from '~/constants/httpStatus'
import aiService from '~/services/ai.services'
import { badRequest } from '~/utils/security'

export const generateProductDescriptionController = async (req: Request, res: Response) => {
  const result = await aiService.generateProductDescription(req.body)
  res.status(HTTP_STATUS.OK).json({ message: 'Generate product description success', result })
}

export const skincareChatController = async (req: Request, res: Response) => {
  const { message } = req.body
  if (typeof message !== 'string' || !message.trim() || message.length > 2000)
    badRequest('Tin nhắn phải có từ 1 đến 2000 ký tự.')
  const result = await aiService.skincareChat(message)
  res.status(HTTP_STATUS.OK).json({ message: 'AI chat response success', result })
}
