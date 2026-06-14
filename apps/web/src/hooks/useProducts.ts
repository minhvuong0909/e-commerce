import { useQuery } from '@tanstack/react-query'
import { getAllProductsApi, type ProductFilters } from '../services/products.services'
import type { Product } from '../models/ProductRequests'

export interface ProductPagination {
  page: number
  limit: number
  totalItems: number
  totalPages: number
}

export const useProducts = (page: number, limit: number, filters: ProductFilters = {}) => {
  return useQuery({
    queryKey: ['products', page, limit, filters],
    queryFn: async () => {
      const res = await getAllProductsApi(limit, page, filters)
      return {
        products: (res.data.result ?? []) as Product[],
        pagination: res.data.pagination as ProductPagination | undefined
      }
    }
  })
}
