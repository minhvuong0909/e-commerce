import { useQuery } from '@tanstack/react-query'
import { getAllProductsApi, type ProductFilters } from '../services/products.services'
import type { Product } from '../models/ProductRequests'
import type { PaginationMeta } from '../models/Pagination'

export type ProductPagination = PaginationMeta

export const useProducts = (page: number, limit: number, filters: ProductFilters = {}) => {
  const searchKey = filters.search ?? ''
  const sortKey = filters.sort ?? ''
  const catKey = filters.category_id ?? ''
  const brandKey = filters.brand_id ?? ''
  const minKey = filters.minPrice ?? ''
  const maxKey = filters.maxPrice ?? ''
  const statusKey = filters.status ?? ''

  return useQuery({
    queryKey: ['products', page, limit, searchKey, sortKey, catKey, brandKey, minKey, maxKey, statusKey],
    queryFn: async () => {
      const res = await getAllProductsApi(limit, page, filters)
      return {
        products: (res.data.result ?? []) as Product[],
        pagination: res.data.pagination as ProductPagination | undefined
      }
    }
  })
}
