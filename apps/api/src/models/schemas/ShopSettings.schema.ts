import { ObjectId } from 'mongodb'

export interface ShopSettingsType {
  _id?: ObjectId
  shop_name: string
  logo_url?: string
  banner_url?: string
  hotline?: string
  zalo_url?: string
  messenger_url?: string
  warehouse_address?: string
  return_policy?: string
  created_at?: Date
  updated_at?: Date
}

export default class ShopSettings {
  _id?: ObjectId
  shop_name: string
  logo_url: string
  banner_url: string
  hotline: string
  zalo_url: string
  messenger_url: string
  warehouse_address: string
  return_policy: string
  created_at: Date
  updated_at: Date

  constructor(settings: ShopSettingsType) {
    const date = new Date()
    this._id = settings._id || new ObjectId()
    this.shop_name = settings.shop_name || 'Vibrant Mart'
    this.logo_url = settings.logo_url || ''
    this.banner_url = settings.banner_url || ''
    this.hotline = settings.hotline || ''
    this.zalo_url = settings.zalo_url || ''
    this.messenger_url = settings.messenger_url || ''
    this.warehouse_address = settings.warehouse_address || ''
    this.return_policy = settings.return_policy || ''
    this.created_at = settings.created_at || date
    this.updated_at = settings.updated_at || date
  }
}
