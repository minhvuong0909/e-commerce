import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { Product } from '../models/ProductRequests'
import { getToken } from '../utils/authSession'
import {
  addToWishlistApi,
  getWishlistApi,
  mergeWishlistApi,
  previewWishlistApi,
  removeFromWishlistApi,
  type WishlistResult
} from '../services/wishlist.services'
import { getApiErrorMessage } from '../utils/apiError'

const WISHLIST_KEY = 'vibrant_mart_wishlist'
const WISHLIST_EVENT = 'vibrant-mart-wishlist-updated'
const GUEST_MAX = 100

/** Guest (browser) wishlist. */
export function getWishlistIds(): string[] {
  try {
    const raw = localStorage.getItem(WISHLIST_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : []
  } catch {
    return []
  }
}

function setGuestIds(ids: string[]) {
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(ids.slice(0, GUEST_MAX)))
  window.dispatchEvent(new Event(WISHLIST_EVENT))
}

function useGuestIds() {
  const [ids, setIds] = useState<string[]>(getWishlistIds)
  useEffect(() => {
    const sync = () => setIds(getWishlistIds())
    window.addEventListener(WISHLIST_EVENT, sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener(WISHLIST_EVENT, sync)
      window.removeEventListener('storage', sync)
    }
  }, [])
  return ids
}

/** Query key is per session so a different account never sees a cached list. */
const accountKey = (token: string | null) => ['wishlist', token ?? 'guest'] as const

/**
 * Wishlist for the current visitor: stored on the account when signed in (synced across
 * devices), in the browser otherwise. Same API either way.
 */
export function useWishlist() {
  const token = getToken()
  const queryClient = useQueryClient()
  const guestIds = useGuestIds()

  const account = useQuery({
    queryKey: accountKey(token),
    queryFn: async () => (await getWishlistApi()).data.result,
    enabled: Boolean(token),
    staleTime: 60_000
  })

  const accountIds = account.data?.product_ids
  const wishlistIds = useMemo(() => (token ? (accountIds ?? []) : guestIds), [token, accountIds, guestIds])

  const isWishlisted = useCallback((productId: string) => wishlistIds.includes(productId), [wishlistIds])

  const toggleWishlist = useCallback(
    async (product: Product) => {
      const exists = wishlistIds.includes(product._id)
      if (!token) {
        const current = getWishlistIds()
        if (!exists && current.length >= GUEST_MAX) {
          toast.error(`Tối đa ${GUEST_MAX} sản phẩm. Đăng nhập để lưu nhiều hơn.`)
          return
        }
        setGuestIds(exists ? current.filter((id) => id !== product._id) : [product._id, ...current])
        toast.success(exists ? 'Đã bỏ khỏi yêu thích' : 'Đã thêm vào yêu thích')
        return
      }

      const key = accountKey(token)
      const previous = queryClient.getQueryData<WishlistResult>(key)
      // optimistic: the heart flips immediately
      queryClient.setQueryData<WishlistResult>(key, (old) => {
        const base = old ?? { product_ids: [], products: [] }
        return exists
          ? { product_ids: base.product_ids.filter((id) => id !== product._id), products: base.products.filter((p) => p._id !== product._id) }
          : { product_ids: [product._id, ...base.product_ids], products: [product, ...base.products] }
      })
      try {
        if (exists) await removeFromWishlistApi(product._id)
        else await addToWishlistApi(product._id)
        toast.success(exists ? 'Đã bỏ khỏi yêu thích' : 'Đã thêm vào yêu thích')
      } catch (err) {
        queryClient.setQueryData(key, previous)
        toast.error(getApiErrorMessage(err, 'Không cập nhật được danh sách yêu thích'))
      } finally {
        void queryClient.invalidateQueries({ queryKey: key })
      }
    },
    [queryClient, token, wishlistIds]
  )

  return { wishlistIds, count: wishlistIds.length, isWishlisted, toggleWishlist, isSignedIn: Boolean(token) }
}

/** Products for the wishlist page (account list, or guest ids resolved to active products). */
export function useWishlistProducts() {
  const token = getToken()
  const guestIds = useGuestIds()
  const account = useQuery({
    queryKey: accountKey(token),
    queryFn: async () => (await getWishlistApi()).data.result,
    enabled: Boolean(token)
  })
  const guest = useQuery({
    queryKey: ['wishlist-preview', guestIds],
    queryFn: async () => (await previewWishlistApi(guestIds)).data.result,
    enabled: !token && guestIds.length > 0
  })
  if (token) return { products: account.data?.products ?? [], isLoading: account.isLoading, isError: account.isError }
  return { products: guestIds.length ? (guest.data ?? []) : [], isLoading: guest.isLoading && guestIds.length > 0, isError: guest.isError }
}

/** Mount once in the storefront layout: after login, move the browser list into the account. */
export function WishlistLoginMerge() {
  const token = getToken()
  const queryClient = useQueryClient()
  const running = useRef(false)
  useEffect(() => {
    const ids = getWishlistIds()
    if (!token || ids.length === 0 || running.current) return
    running.current = true
    mergeWishlistApi(ids)
      .then((res) => {
        localStorage.removeItem(WISHLIST_KEY)
        window.dispatchEvent(new Event(WISHLIST_EVENT))
        queryClient.setQueryData(accountKey(token), res.data.result)
        toast.success(`Đã lưu ${ids.length} sản phẩm yêu thích vào tài khoản`)
      })
      .catch(() => {
        // keep the browser copy; we will try again on the next page load
      })
      .finally(() => {
        running.current = false
      })
  }, [token, queryClient])
  return null
}
