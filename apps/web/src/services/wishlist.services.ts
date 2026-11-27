import api from '../configs/api'
import type { Product } from '../models/ProductRequests'

export type WishlistResult = { product_ids: string[]; products: Product[] }

/** Signed-in: account wishlist (active products only, newest first). */
export const getWishlistApi = () => api.get<{ result: WishlistResult }>('/wishlist')
export const addToWishlistApi = (product_id: string) => api.post('/wishlist', { product_id })
export const removeFromWishlistApi = (product_id: string) => api.delete(`/wishlist/${product_id}`)
/** After login: fold the browser-stored list into the account. */
export const mergeWishlistApi = (product_ids: string[]) => api.post<{ result: WishlistResult }>('/wishlist/merge', { product_ids })
/** Guests: resolve browser-stored ids to active products. */
export const previewWishlistApi = (product_ids: string[]) => api.post<{ result: Product[] }>('/wishlist/preview', { product_ids })
