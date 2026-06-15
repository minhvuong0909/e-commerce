export interface UserAddressInput {
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
