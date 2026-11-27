import { DeliveryMethodType, DeliveryStatus } from '~/constants/enums'
import databaseService from './database.service'
import { ObjectId } from 'mongodb'
class DeliveryMethodsService {
  async seedDeliverys() {
    const deliveryMethods = [
      {
        _id: new ObjectId(), // auto id
        type: DeliveryMethodType.STANDARD,
        name: 'Giao hàng tiêu chuẩn',
        description: 'Giao trong 3-5 ngày, phí ship theo khoảng cách từ cửa hàng',
        status: DeliveryStatus.Pending,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        _id: new ObjectId(),
        type: DeliveryMethodType.EXPRESS,
        name: 'Giao hàng hỏa tốc',
        description: 'Giao trong 1-2 ngày, phụ phí hỏa tốc + phí ship theo khoảng cách',
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

  async getAllDeliveryMethods() {
    const deliveryMethods = await databaseService.delivery_methods.find().toArray()
    return dedupeDeliveryMethods(deliveryMethods)
  }
}

type DeliveryMethodLike = { type: DeliveryMethodType; status: DeliveryStatus; created_at?: Date }

/**
 * One method per type for checkout. Older seeds left duplicate documents per type; both are still
 * referenced by past orders, so they stay in the database but are not offered twice.
 * Prefers the selectable (Pending) document, then the oldest.
 */
export function dedupeDeliveryMethods<T extends DeliveryMethodLike>(methods: T[]): T[] {
  const time = (m: T) => (m.created_at ? new Date(m.created_at).getTime() : 0)
  const byType = new Map<DeliveryMethodType, T>()
  for (const m of methods) {
    const current = byType.get(m.type)
    const better =
      !current ||
      (m.status === DeliveryStatus.Pending && current.status !== DeliveryStatus.Pending) ||
      (m.status === current.status && time(m) < time(current))
    if (better) byType.set(m.type, m)
  }
  return [...byType.values()].sort((a, b) => a.type - b.type)
}
let deliveryMethodsService = new DeliveryMethodsService()
export default deliveryMethodsService
