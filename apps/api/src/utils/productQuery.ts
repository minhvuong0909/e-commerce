import { ObjectId } from 'mongodb'
import { PRODUCT_STATUS } from '~/constants/enums'

export interface ProductQueryParams {
  search?: string
  category_id?: string
  brand_id?: string
  minPrice?: string | number
  maxPrice?: string | number
  status?: string | number
  sort?: string
  page?: string | number
  limit?: string | number
}

/** Escape các ký tự đặc biệt của regex để search theo tên an toàn (tránh ReDoS / lỗi cú pháp). */
export function escapeRegex(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Dựng $match stage cho danh sách sản phẩm từ query params.
 * Chỉ thêm điều kiện khi tham số hợp lệ — bỏ qua giá trị rỗng/không hợp lệ.
 */
export function buildProductMatchStage(q: ProductQueryParams): Record<string, any> {
  const match: Record<string, any> = {}

  if (q.search && q.search.trim()) {
    match.name = { $regex: escapeRegex(q.search.trim()), $options: 'i' }
  }

  if (q.category_id && ObjectId.isValid(q.category_id)) {
    match.category_id = new ObjectId(q.category_id)
  }

  if (q.brand_id && ObjectId.isValid(q.brand_id)) {
    match.brand_id = new ObjectId(q.brand_id)
  }

  const min = q.minPrice !== undefined && q.minPrice !== '' ? Number(q.minPrice) : undefined
  const max = q.maxPrice !== undefined && q.maxPrice !== '' ? Number(q.maxPrice) : undefined
  const priceFilter: Record<string, number> = {}
  if (min !== undefined && !Number.isNaN(min)) priceFilter.$gte = min
  if (max !== undefined && !Number.isNaN(max)) priceFilter.$lte = max
  if (Object.keys(priceFilter).length > 0) {
    match.price = priceFilter
  }

  if (q.status !== undefined && q.status !== '') {
    const statusNum = Number(q.status)
    if (statusNum === PRODUCT_STATUS.Active || statusNum === PRODUCT_STATUS.Stock) {
      match.status = statusNum
    }
  }

  return match
}

/** Dựng $sort stage. Mặc định sản phẩm mới nhất trước. */
export function buildProductSortStage(sort?: string): Record<string, 1 | -1> {
  switch (sort) {
    case 'price_asc':
      return { price: 1 }
    case 'price_desc':
      return { price: -1 }
    case 'best_selling':
      return { soldNumber: -1 }
    case 'newest':
    default:
      return { created_at: -1 }
  }
}

/** Chuẩn hóa phân trang: page/limit luôn >= 1, có chặn trên cho limit. */
export function parsePagination(
  page?: string | number,
  limit?: string | number
): { page: number; limit: number; skip: number } {
  const parsedPage = Math.max(1, Number(page) || 1)
  const parsedLimit = Math.min(100, Math.max(1, Number(limit) || 10))
  return {
    page: parsedPage,
    limit: parsedLimit,
    skip: (parsedPage - 1) * parsedLimit
  }
}
