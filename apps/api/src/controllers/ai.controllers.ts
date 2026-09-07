import { Request, Response } from 'express'
import HTTP_STATUS from '~/constants/httpStatus'
import aiService from '~/services/ai.services'

export const generateProductDescriptionController = async (req: Request, res: Response) => {
  const result = await aiService.generateProductDescription(req.body)
  res.status(HTTP_STATUS.OK).json({ message: 'Generate product description success', result })
}

export const skincareChatController = async (req: Request, res: Response) => {
  const { message } = req.body
  const result = await aiService.skincareChat(message)
  res.status(HTTP_STATUS.OK).json({ message: 'AI chat response success', result })
}
