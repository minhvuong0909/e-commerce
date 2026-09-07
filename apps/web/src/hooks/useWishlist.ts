import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import type { Product } from '../models/ProductRequests'

const WISHLIST_KEY = 'vibrant_mart_wishlist'
const WISHLIST_EVENT = 'vibrant-mart-wishlist-updated'

export function getWishlistIds(): string[] {
  try {
    const raw = localStorage.getItem(WISHLIST_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function useWishlist() {
  const [wishlistIds, setWishlistIds] = useState<string[]>(getWishlistIds)

  const syncWishlist = useCallback(() => {
    setWishlistIds(getWishlistIds())
  }, [])

  useEffect(() => {
    window.addEventListener(WISHLIST_EVENT, syncWishlist)
    window.addEventListener('storage', syncWishlist)
    return () => {
      window.removeEventListener(WISHLIST_EVENT, syncWishlist)
      window.removeEventListener('storage', syncWishlist)
    }
  }, [syncWishlist])

  const isWishlisted = useCallback(
    (productId: string) => wishlistIds.includes(productId),
    [wishlistIds]
  )

  const toggleWishlist = useCallback((product: Product) => {
    try {
      const current = getWishlistIds()
      const exists = current.includes(product._id)
      let updated: string[]

      if (exists) {
        updated = current.filter((id) => id !== product._id)
        toast.info(`Đã bỏ "${product.name}" khỏi danh sách yêu thích`)
      } else {
        updated = [...current, product._id]
        toast.success(`Đã thêm "${product.name}" vào danh sách yêu thích ❤️`)
      }

      localStorage.setItem(WISHLIST_KEY, JSON.stringify(updated))
      setWishlistIds(updated)
      window.dispatchEvent(new Event(WISHLIST_EVENT))
    } catch {
      toast.error('Không thể cập nhật danh sách yêu thích')
    }
  }, [])

  return {
    wishlistIds,
    count: wishlistIds.length,
    isWishlisted,
    toggleWishlist
  }
}
