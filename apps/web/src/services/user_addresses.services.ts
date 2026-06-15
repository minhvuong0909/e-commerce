import api from '../configs/api'

export type SavedAddress = {
  _id: string
  label?: string
  recipient_name: string
  phone: string
  note?: string
  address_line: string
  city?: string
  district?: string
  lat: number
  lng: number
  address_source?: 'manual' | 'map'
  is_default?: boolean
}

export type SavedAddressPayload = {
  label?: string
  recipient_name: string
  phone: string
  note?: string
  address_line: string
  city?: string
  district?: string
  lat: number
  lng: number
  address_source?: 'manual' | 'map'
  is_default?: boolean
}

export const getSavedAddressesApi = () => api.get<{ result: SavedAddress[] }>('/users/addresses')

export const createSavedAddressApi = (data: SavedAddressPayload) =>
  api.post<{ result: SavedAddress }>('/users/addresses', data)

export const updateSavedAddressApi = (id: string, data: Partial<SavedAddressPayload>) =>
  api.patch<{ result: SavedAddress }>(`/users/addresses/${id}`, data)

export const deleteSavedAddressApi = (id: string) => api.delete(`/users/addresses/${id}`)
