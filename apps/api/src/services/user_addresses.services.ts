import { ObjectId } from 'mongodb'
import HTTP_STATUS from '~/constants/httpStatus'
import { ADDRESS_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'
import { UserAddressInput } from '~/models/requests/UserAddresses.requests'
import UserAddress from '~/models/schemas/UserAddresses.schema'
import databaseService from './database.service'

class UserAddressService {
  private userObjectId(user_id: string) {
    return new ObjectId(user_id)
  }

  async listByUserId(user_id: string) {
    return databaseService.user_addresses
      .find({ user_id: this.userObjectId(user_id) })
      .sort({ is_default: -1, updated_at: -1 })
      .toArray()
  }

  private async clearDefault(user_id: string) {
    await databaseService.user_addresses.updateMany(
      { user_id: this.userObjectId(user_id) },
      { $set: { is_default: false, updated_at: new Date() } }
    )
  }

  async create(user_id: string, payload: UserAddressInput) {
    const userObjectId = this.userObjectId(user_id)
    const count = await databaseService.user_addresses.countDocuments({ user_id: userObjectId })
    const isDefault = payload.is_default ?? count === 0

    if (isDefault) {
      await this.clearDefault(user_id)
    }

    const address = new UserAddress({
      user_id: userObjectId,
      label: payload.label,
      recipient_name: payload.recipient_name.trim(),
      phone: payload.phone.trim(),
      note: payload.note?.trim(),
      address_line: payload.address_line.trim(),
      city: payload.city?.trim(),
      district: payload.district?.trim(),
      lat: Number(payload.lat),
      lng: Number(payload.lng),
      address_source: payload.address_source,
      is_default: isDefault
    })

    const result = await databaseService.user_addresses.insertOne(address)
    return { ...address, _id: result.insertedId }
  }

  async update(user_id: string, address_id: string, payload: Partial<UserAddressInput>) {
    const existing = await databaseService.user_addresses.findOne({
      _id: new ObjectId(address_id),
      user_id: this.userObjectId(user_id)
    })

    if (!existing) {
      throw new ErrorWithStatus({
        message: ADDRESS_MESSAGES.ADDRESS_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    if (payload.is_default) {
      await this.clearDefault(user_id)
    }

    const updateDoc: Record<string, unknown> = { updated_at: new Date() }
    if (payload.label !== undefined) updateDoc.label = payload.label.trim()
    if (payload.recipient_name !== undefined) updateDoc.recipient_name = payload.recipient_name.trim()
    if (payload.phone !== undefined) updateDoc.phone = payload.phone.trim()
    if (payload.note !== undefined) updateDoc.note = payload.note.trim()
    if (payload.address_line !== undefined) updateDoc.address_line = payload.address_line.trim()
    if (payload.city !== undefined) updateDoc.city = payload.city.trim()
    if (payload.district !== undefined) updateDoc.district = payload.district.trim()
    if (payload.lat !== undefined) updateDoc.lat = Number(payload.lat)
    if (payload.lng !== undefined) updateDoc.lng = Number(payload.lng)
    if (payload.address_source !== undefined) updateDoc.address_source = payload.address_source
    if (payload.is_default !== undefined) updateDoc.is_default = payload.is_default

    const updated = await databaseService.user_addresses.findOneAndUpdate(
      { _id: new ObjectId(address_id), user_id: this.userObjectId(user_id) },
      { $set: updateDoc },
      { returnDocument: 'after' }
    )

    return updated
  }

  async delete(user_id: string, address_id: string) {
    const deleted = await databaseService.user_addresses.findOneAndDelete({
      _id: new ObjectId(address_id),
      user_id: this.userObjectId(user_id)
    })

    if (!deleted) {
      throw new ErrorWithStatus({
        message: ADDRESS_MESSAGES.ADDRESS_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    if (deleted.is_default) {
      const next = await databaseService.user_addresses.findOne({
        user_id: this.userObjectId(user_id)
      })
      if (next) {
        await databaseService.user_addresses.updateOne(
          { _id: next._id },
          { $set: { is_default: true, updated_at: new Date() } }
        )
      }
    }
  }
}

const userAddressService = new UserAddressService()
export default userAddressService
