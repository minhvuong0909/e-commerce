import { Request, Response } from 'express'
import HTTP_STATUS from '~/constants/httpStatus'
import shopSettingsService from '~/services/shop_settings.services'

export const getShopSettingsController = async (_req: Request, res: Response) => {
  const result = await shopSettingsService.getSettings()
  res.status(HTTP_STATUS.OK).json({ message: 'Get shop settings success', result })
}

export const updateShopSettingsController = async (req: Request, res: Response) => {
  const result = await shopSettingsService.updateSettings(req.body)
  res.status(HTTP_STATUS.OK).json({ message: 'Update shop settings success', result })
}
