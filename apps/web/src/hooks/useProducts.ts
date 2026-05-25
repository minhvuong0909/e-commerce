import { useQuery } from '@tanstack/react-query'
import { getAllProductsApi } from '../services/products.services'
import type { Product } from '../models/ProductRequests'

export const useProducts = (page: number, limit: number) => {
  return useQuery({
    queryKey: ['products', page, limit],
    queryFn: async () => {
      const res = await getAllProductsApi(limit, page)
      // Giả định API trả về res.data.result là danh sách sản phẩm.
      return res.data.result as Product[]
    }
  })
}
