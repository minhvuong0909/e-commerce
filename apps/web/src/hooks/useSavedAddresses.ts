import { useQuery } from '@tanstack/react-query'
import { getSavedAddressesApi } from '../services/user_addresses.services'

export const SAVED_ADDRESSES_QUERY_KEY = ['saved-addresses'] as const

export function useSavedAddresses() {
  return useQuery({
    queryKey: SAVED_ADDRESSES_QUERY_KEY,
    queryFn: async () => {
      const res = await getSavedAddressesApi()
      return res.data.result ?? []
    }
  })
}
