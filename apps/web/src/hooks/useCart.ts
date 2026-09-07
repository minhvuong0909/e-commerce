import { useQuery } from '@tanstack/react-query'
import { getCartApi } from '../services/carts.services'
import type { CartItem } from '../models/CartRequests'

export const CART_QUERY_KEY = ['cart'] as const

export const useCart = (enabled = true) => {
  return useQuery({
    queryKey: CART_QUERY_KEY,
    queryFn: async () => {
      const res = await getCartApi()
      return (res.data.data.cartItems ?? []) as CartItem[]
    },
    enabled,
    staleTime: 60_000,
    gcTime: 5 * 60_000
  })
}
