import { ObjectId } from 'mongodb'
import { PRODUCT_STATUS } from '~/constants/enums'
import databaseService from './database.service'
import { badRequest } from '~/utils/security'

export const WISHLIST_MAX = 200
const PREVIEW_MAX = 100

export type WishlistItem = { _id?: ObjectId; user_id: ObjectId; product_id: ObjectId; created_at: Date }

/** Accept only well-formed product ids, de-duplicated, preserving order. */
export function parseProductIds(input: unknown, max: number): ObjectId[] {
  if (!Array.isArray(input)) badRequest('Danh sách sản phẩm không hợp lệ.')
  if (input.length > max) badRequest(`Tối đa ${max} sản phẩm.`)
  const seen = new Set<string>()
  const ids: ObjectId[] = []
  for (const raw of input) {
    if (typeof raw !== 'string' || !ObjectId.isValid(raw)) badRequest('Mã sản phẩm không hợp lệ.')
    const key = raw.toLowerCase()
    if (!seen.has(key)) {
      seen.add(key)
      ids.push(new ObjectId(raw))
    }
  }
  return ids
}

const PRODUCT_PROJECTION = {
  name: 1,
  price: 1,
  quantity: 1,
  thumbnail: 1,
  origin: 1,
  rating_number: 1,
  soldNumber: 1,
  status: 1,
  created_at: 1
} as const

class WishlistService {
  /** Active products for the given ids, in the given order (missing/inactive ones dropped). */
  async productsByIds(ids: ObjectId[]) {
    if (!ids.length) return []
    const docs = await databaseService.products
      .find({ _id: { $in: ids }, status: PRODUCT_STATUS.Active }, { projection: PRODUCT_PROJECTION })
      .toArray()
    const byId = new Map(docs.map((d) => [String(d._id), { ...d, medias: [] }]))
    return ids.map((id) => byId.get(String(id))).filter((p): p is NonNullable<typeof p> => Boolean(p))
  }

  async preview(product_ids: unknown) {
    return this.productsByIds(parseProductIds(product_ids, PREVIEW_MAX))
  }

  async list(user_id: string) {
    const items = await databaseService.wishlist_items
      .find({ user_id: new ObjectId(user_id) }, { projection: { product_id: 1 } })
      .sort({ created_at: -1 })
      .limit(WISHLIST_MAX)
      .toArray()
    const products = await this.productsByIds(items.map((i) => i.product_id))
    return { product_ids: products.map((p) => String(p._id)), products }
  }

  async add(user_id: string, product_id: string) {
    const [pid] = parseProductIds([product_id], 1)
    const uid = new ObjectId(user_id)
    const product = await databaseService.products.findOne({ _id: pid, status: PRODUCT_STATUS.Active }, { projection: { _id: 1 } })
    if (!product) badRequest('Sản phẩm không còn được bán.')
    const count = await databaseService.wishlist_items.countDocuments({ user_id: uid })
    if (count >= WISHLIST_MAX) badRequest(`Danh sách yêu thích tối đa ${WISHLIST_MAX} sản phẩm.`)
    // upsert: adding twice (double click, two tabs) is a no-op
    await databaseService.wishlist_items.updateOne(
      { user_id: uid, product_id: pid },
      { $setOnInsert: { user_id: uid, product_id: pid, created_at: new Date() } },
      { upsert: true }
    )
    return { product_id: String(pid) }
  }

  async remove(user_id: string, product_id: string) {
    const [pid] = parseProductIds([product_id], 1)
    await databaseService.wishlist_items.deleteOne({ user_id: new ObjectId(user_id), product_id: pid })
    return { product_id: String(pid) }
  }

  /** Fold a guest's browser wishlist into the account after login (keeps the cap, skips unknown products). */
  async merge(user_id: string, product_ids: unknown) {
    const uid = new ObjectId(user_id)
    const ids = parseProductIds(product_ids, WISHLIST_MAX)
    const valid = await this.productsByIds(ids)
    const existing = await databaseService.wishlist_items.countDocuments({ user_id: uid })
    const room = Math.max(0, WISHLIST_MAX - existing)
    const now = new Date()
    const ops = valid.slice(0, room).map((p) => ({
      updateOne: {
        filter: { user_id: uid, product_id: p._id },
        update: { $setOnInsert: { user_id: uid, product_id: p._id, created_at: now } },
        upsert: true
      }
    }))
    if (ops.length) await databaseService.wishlist_items.bulkWrite(ops, { ordered: false })
    return this.list(user_id)
  }
}

const wishlistService = new WishlistService()
export default wishlistService
