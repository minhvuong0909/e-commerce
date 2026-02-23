export const DeliveryStatus = {
  PENDING: 0,
  IN_TRANSIT: 1,
  ACTIVE: 2,
  CANCELLED: 3
}

export const DeliveryTypes = {
  STANDARD: 0,
  EXPRESS: 1
}

export type DeliveryStatus = (typeof DeliveryStatus)[keyof typeof DeliveryStatus]
export type DeliveryType = (typeof DeliveryTypes)[keyof typeof DeliveryTypes]

export interface DeliveryMethod {
  _id: string
  name: string
  description: string
  status: DeliveryStatus
  type: DeliveryType
}
