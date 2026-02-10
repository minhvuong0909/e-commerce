import deliveryMethodsService from '~/services/delivery_methods.services'

export const seedDeliverysController = async () => {
  try {
    await deliveryMethodsService.seedDeliverys()
    console.log('Seed delivery method successfully')
  } catch (error) {
    throw error
  }
}
