import api from '../configs/api'

export type ShopSettings = {
  shop_name: string
  logo_url?: string
  banner_url?: string
  hotline?: string
  zalo_url?: string
  messenger_url?: string
  warehouse_address?: string
  return_policy?: string
}

export const getShopSettingsApi = () => api.get<{ result: ShopSettings }>('/shop-settings')

export const updateShopSettingsApi = (payload: ShopSettings) => api.put('/shop-settings', payload)
