import { Request, Response } from 'express'
import deliveryMethodsService from '~/services/delivery_methods.services'

export const seedDeliverysController = async () => {
  try {
    await deliveryMethodsService.seedDeliverys()
    console.log('Seed delivery method successfully')
  } catch (error) {
    throw error
  }
}

export const getAllDeliveryMethodsController = async (req: Request, res: Response) => {
  try {
    const deliveryMethods = await deliveryMethodsService.getAllDeliveryMethods()
    res.status(200).json({
      message: 'Get delivery methods successfully',
      result: deliveryMethods
    })
  } catch (error) {
    throw error
  }
}
