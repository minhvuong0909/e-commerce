import type { Product } from '../models/ProductRequests'

export const NEW_PRODUCT_DAYS = 30
export const BESTSELLER_MIN_SOLD = 10

export type ProductBadge = 'NEW' | 'BESTSELLER' | 'OUT_OF_STOCK'

export function getProductBadges(product: Product): ProductBadge[] {
  const badges: ProductBadge[] = []

  if (product.quantity <= 0) {
    badges.push('OUT_OF_STOCK')
    return badges
  }

  if (product.created_at) {
    const created = new Date(product.created_at)
    const ageMs = Date.now() - created.getTime()
    if (ageMs >= 0 && ageMs <= NEW_PRODUCT_DAYS * 24 * 60 * 60 * 1000) {
      badges.push('NEW')
    }
  }

  if ((product.soldNumber ?? 0) >= BESTSELLER_MIN_SOLD) {
    badges.push('BESTSELLER')
  }

  return badges
}

export const BADGE_LABELS: Record<ProductBadge, string> = {
  NEW: 'NEW',
  BESTSELLER: 'BESTSELLER',
  OUT_OF_STOCK: 'OUT OF STOCK'
}

export const BADGE_STYLES: Record<ProductBadge, string> = {
  NEW: 'bg-[#3d3330] text-white',
  BESTSELLER: 'bg-[#b07a72] text-white',
  OUT_OF_STOCK: 'bg-[#6b5f59] text-white'
}
