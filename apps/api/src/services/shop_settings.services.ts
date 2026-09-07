import { ObjectId } from 'mongodb'
import ShopSettings, { ShopSettingsType } from '~/models/schemas/ShopSettings.schema'
import databaseService from './database.service'

const DEFAULT_SETTINGS: ShopSettingsType = {
  shop_name: 'Vibrant Mart',
  hotline: process.env.SHOP_HOTLINE || '',
  zalo_url: process.env.SHOP_ZALO_URL || '',
  messenger_url: process.env.SHOP_MESSENGER_URL || '',
  warehouse_address: process.env.SHOP_WAREHOUSE_ADDRESS || '',
  return_policy: 'Hỗ trợ đổi trả minh bạch theo chính sách của cửa hàng.'
}

class ShopSettingsService {
  async getSettings() {
    const existed = await databaseService.shop_settings.findOne({})
    if (existed) return existed
    return new ShopSettings(DEFAULT_SETTINGS)
  }

  async updateSettings(payload: Partial<ShopSettingsType>) {
    const existing = await databaseService.shop_settings.findOne({})
    const cleanPayload = {
      shop_name: payload.shop_name?.trim() || DEFAULT_SETTINGS.shop_name,
      logo_url: payload.logo_url?.trim() || '',
      banner_url: payload.banner_url?.trim() || '',
      hotline: payload.hotline?.trim() || '',
      zalo_url: payload.zalo_url?.trim() || '',
      messenger_url: payload.messenger_url?.trim() || '',
      warehouse_address: payload.warehouse_address?.trim() || '',
      return_policy: payload.return_policy?.trim() || '',
      updated_at: new Date()
    }

    if (existing?._id) {
      await databaseService.shop_settings.updateOne({ _id: existing._id }, { $set: cleanPayload })
      return databaseService.shop_settings.findOne({ _id: existing._id })
    }

    const settings = new ShopSettings({ _id: new ObjectId(), ...cleanPayload })
    await databaseService.shop_settings.insertOne(settings)
    return settings
  }
}

const shopSettingsService = new ShopSettingsService()
export default shopSettingsService
