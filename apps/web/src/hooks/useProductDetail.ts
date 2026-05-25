import { useQuery } from '@tanstack/react-query'
import { getProductByIdApi } from '../services/products.services'
import type { Product } from '../models/ProductRequests'

export const useProductDetail = (id?: string) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      if (!id) throw new Error('Product ID is required')
      const res = await getProductByIdApi(id)
      return res.data.data as Product
    },
    enabled: !!id // Chỉ gọi API khi id tồn tại
  })
}
