import { useQuery } from '@tanstack/react-query'
import { getCategoriesApi } from '../services/categories.services'

export type StorefrontCategory = { id: string; slug: string; name: string }

export function toSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

const CHIP_ORDER_HINTS = ['Skincare', 'Serum', 'Cleansing', 'Sunscreen', 'Makeup', 'Lip', 'Body']

function findArray(value: unknown): unknown[] {
  if (Array.isArray(value)) return value
  if (!value || typeof value !== 'object') return []
  const obj = value as Record<string, unknown>
  for (const key of ['data', 'result', 'items', 'categories']) {
    const nested = obj[key]
    if (Array.isArray(nested)) return nested
    if (nested && typeof nested === 'object') {
      const inner = findArray(nested)
      if (inner.length) return inner
    }
  }
  return []
}

export function extractCategories(payload: unknown): StorefrontCategory[] {
  return findArray(payload)
    .map((item) => {
      const row = item as { _id?: string; id?: string; slug?: string; name?: string; title?: string }
      const id = row._id || row.id
      const name = row.name || row.title
      if (!id || !name) return null
      return { id, slug: row.slug || toSlug(name), name }
    })
    .filter((item): item is StorefrontCategory => Boolean(item))
}

function rank(name: string) {
  const i = CHIP_ORDER_HINTS.findIndex((hint) => name.toLowerCase().includes(hint.toLowerCase()))
  return i === -1 ? 99 : i
}

/** Real categories from the API, ordered so skincare staples come first. Shared by header + home. */
export function useStorefrontCategories(max = 10) {
  return useQuery({
    queryKey: ['storefront-categories'],
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const res = await getCategoriesApi(1, 100)
      return extractCategories(res.data)
    },
    select: (list) => [...list].sort((a, b) => rank(a.name) - rank(b.name)).slice(0, max)
  })
}
