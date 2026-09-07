import { Request, Response } from 'express'
import deliveryMethodsService from '~/services/delivery_methods.services'

export const seedDeliverysController = async () => {
  await deliveryMethodsService.seedDeliverys()
  console.log('Seed delivery method successfully')
}

export const getAllDeliveryMethodsController = async (req: Request, res: Response) => {
  const deliveryMethods = await deliveryMethodsService.getAllDeliveryMethods()
  res.status(200).json({
    message: 'Get delivery methods successfully',
    result: deliveryMethods
  })
}
