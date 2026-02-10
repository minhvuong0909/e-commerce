import { DeliveryMethodType, DeliveryStatus } from '~/constants/enums'
import databaseService from './database.service'
import { ObjectId } from 'mongodb'
class DeliveryMethodsService {
  async seedDeliverys() {
    const deliveryMethods = [
      {
        _id: new ObjectId(), // auto id
        type: DeliveryMethodType.STANDARD,
        name: 'Standard Delivery',
        description: 'Giao hàng tiêu chuẩn (3-5 ngày)',
        status: DeliveryStatus.Pending,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        _id: new ObjectId(),
        type: DeliveryMethodType.EXPRESS,
        name: 'Express Delivery',
        description: 'Giao hàng nhanh (1-2 ngày)',
        status: DeliveryStatus.Pending,
        created_at: new Date(),
        updated_at: new Date()
      }
    ] as const

    for (const item of deliveryMethods) {
      // Check if already exists by type
      const existed = await databaseService.delivery_methods.findOne({ type: item.type })

      if (!existed) {
        await databaseService.delivery_methods.insertOne(item)
        console.log(`Seeded delivery method: ${item.type}`)
      } else {
        console.log(`Delivery method already exists: ${item.type}`)
      }
    }
  }
}
let deliveryMethodsService = new DeliveryMethodsService()
export default deliveryMethodsService
