import { ClientSession, Collection, CreateIndexesOptions, Db, IndexSpecification, MongoClient } from 'mongodb'
import dotenv from 'dotenv'
import User from '~/models/schemas/Users.schema'
import RefreshToken from '~/models/schemas/Refresh_Tokens.schema'
import Product from '~/models/schemas/Products.schema'
import Category from '~/models/schemas/Categories.schema'
import Brand from '~/models/schemas/Brands.schema'
import ProductMedia from '~/models/schemas/ProductImages.schema'
import Cart from '~/models/schemas/Carts.schema'
import CartItems from '~/models/schemas/CartItems.schema'
import Order from '~/models/schemas/Orders.schema'
import OrderItems from '~/models/schemas/OrderItems.Schema'
import Delivery from '~/models/schemas/Deliverys.schema'
import Payment from '~/models/schemas/Payments.schema'
import UserAddress from '~/models/schemas/UserAddresses.schema'
import ShopSettings from '~/models/schemas/ShopSettings.schema'
import Voucher from '~/models/schemas/Vouchers.schema'
import Review from '~/models/schemas/Reviews.schema'
import type { WishlistItem } from './wishlist.services'

dotenv.config()

/**
 * The connection string must come from DATABASE_URL. There is deliberately no hard-coded
 * fallback cluster: a stale fallback silently pointed at a cluster that no longer resolves.
 */
export function resolveDatabaseUrl(env: NodeJS.ProcessEnv = process.env): string | null {
  const value = (env.DATABASE_URL ?? '').trim().replace(/^['"]|['"]$/g, '')
  return /^mongodb(\+srv)?:\/\//.test(value) ? value : null
}

const databaseUrl = resolveDatabaseUrl()
// Placeholder only keeps construction side-effect free; connect() refuses to use it.
const UNCONFIGURED_PLACEHOLDER = 'mongodb://127.0.0.1:1/unconfigured'

class DatabaseService {
  private client: MongoClient
  public db: Db

  constructor() {
    this.client = new MongoClient(databaseUrl ?? UNCONFIGURED_PLACEHOLDER)
    this.db = this.client.db(process.env.DB_NAME)
  }

  async connect() {
    if (!databaseUrl) {
      throw new Error('DATABASE_URL chưa được cấu hình hoặc không phải chuỗi mongodb:// / mongodb+srv:// hợp lệ.')
    }
    await this.client.connect()
    await this.db.command({ ping: 1 })
    console.log('MongoDB connected successfully!')
  }

  async close() {
    await this.client.close()
  }

  /** Idempotent; safe to run on every start. Only touches documents that carry the field. */
  async ensureIndexes() {
    await this.orders.createIndex(
      { idempotency_key: 1 },
      {
        name: 'uniq_order_idempotency_key',
        unique: true,
        partialFilterExpression: { idempotency_key: { $type: 'string' } }
      }
    )
    await this.vouchers.createIndex({ code: 1 }, { name: 'uniq_voucher_code', unique: true })
    await this.wishlist_items.createIndex({ user_id: 1, product_id: 1 }, { name: 'uniq_wishlist_item', unique: true })
    await this.wishlist_items.createIndex({ user_id: 1, created_at: -1 }, { name: 'wishlist_by_user' })
    await this.ensureQueryIndexes()
  }

  /**
   * Index phục vụ truy vấn (không ràng buộc dữ liệu): thiếu chúng thì mỗi lần đăng nhập, xem giỏ, xem đơn,
   * lấy danh sách sản phẩm ($lookup product_medias) đều quét toàn collection.
   * Lỗi ở đây chỉ ghi log, không chặn server khởi động.
   */
  private async ensureQueryIndexes() {
    const specs: [Collection<any>, IndexSpecification, CreateIndexesOptions][] = [
      [this.users, { email: 1 }, { name: 'users_by_email' }],
      [this.users, { supabase_user_id: 1 }, { name: 'users_by_supabase_id', sparse: true }],
      [this.refreshTokens, { token: 1 }, { name: 'refresh_by_token' }],
      [this.refreshTokens, { user_id: 1 }, { name: 'refresh_by_user' }],
      // token hết hạn tự bị MongoDB xóa (vốn đã vô hiệu vì JWT hết hạn)
      [this.refreshTokens, { exp: 1 }, { name: 'refresh_ttl', expireAfterSeconds: 0 }],
      [this.products, { created_at: -1 }, { name: 'products_newest' }],
      [this.products, { category_id: 1, created_at: -1 }, { name: 'products_by_category' }],
      [this.products, { brand_id: 1, created_at: -1 }, { name: 'products_by_brand' }],
      [this.products, { price: 1 }, { name: 'products_by_price' }],
      [this.products, { soldNumber: -1 }, { name: 'products_best_selling' }],
      [this.product_media, { product_id: 1 }, { name: 'product_media_by_product' }],
      [this.carts, { user_id: 1, status: 1 }, { name: 'carts_by_user_status' }],
      [this.cart_items, { cart_id: 1 }, { name: 'cart_items_by_cart' }],
      [this.orders, { user_id: 1, created_at: -1 }, { name: 'orders_by_user' }],
      [this.orders, { status: 1, created_at: -1 }, { name: 'orders_by_status' }],
      [this.order_items, { order_id: 1 }, { name: 'order_items_by_order' }],
      [this.payments, { order_id: 1, payment_method: 1 }, { name: 'payments_by_order' }],
      [this.reviews, { product_id: 1, visible: 1, created_at: -1 }, { name: 'reviews_by_product' }],
      [this.user_addresses, { user_id: 1 }, { name: 'addresses_by_user' }]
    ]
    const results = await Promise.allSettled(specs.map(([col, key, opts]) => col.createIndex(key, opts)))
    results.forEach((r, i) => {
      if (r.status === 'rejected') console.error(`Không tạo được index ${specs[i][2].name}:`, r.reason?.message || r.reason)
    })
  }
  /** Fail closed on standalone MongoDB: never fall back to partial order writes. */
  async withTransaction<T>(work: (session: ClientSession) => Promise<T>): Promise<T> {
    const session = this.client.startSession()
    try {
      return (await session.withTransaction(() => work(session), {
        readConcern: { level: 'snapshot' },
        writeConcern: { w: 'majority' }
      })) as T
    } finally {
      await session.endSession()
    }
  }
  // lấy instance của users
  // collection chứa nhiều user
  get users(): Collection<User> {
    return this.db.collection(process.env.DB_USERS_COLLECTION as string)
  }

  // instance của refresh_tokens
  get refreshTokens(): Collection<RefreshToken> {
    return this.db.collection(process.env.DB_REFRESHTOKENS_COLLECTION as string)
  }

  // instance của products
  get products(): Collection<Product> {
    return this.db.collection(process.env.DB_PRODUCTS_COLLECTION as string)
  }

  // instance của categories
  get categories(): Collection<Category> {
    return this.db.collection(process.env.DB_CATEGORY_COLLECTION as string)
  }

  // instance của categories
  get brands(): Collection<Brand> {
    return this.db.collection(process.env.DB_BRANDS_COLLECTION as string)
  }

  // instance của products
  get product_media(): Collection<ProductMedia> {
    return this.db.collection(process.env.DB_PRODUCT_MEDIA_COLLECTION as string)
  }

  // instance của carts
  get carts(): Collection<Cart> {
    return this.db.collection(process.env.DB_CARTS_COLLECTION as string)
  }

  // instance của cart items
  get cart_items(): Collection<CartItems> {
    return this.db.collection(process.env.DB_CART_ITEMS_COLLECTION as string)
  }

  // instance của orders
  get orders(): Collection<Order> {
    return this.db.collection(process.env.DB_ORDERS_COLLECTION as string)
  }

  // instance của order items
  get order_items(): Collection<OrderItems> {
    return this.db.collection(process.env.DB_ORDER_ITEMS_COLLECTION as string)
  }

  // instance của delivery methods
  get delivery_methods(): Collection<Delivery> {
    return this.db.collection(process.env.DB_DELIVERY_METHODS_COLLECTION as string)
  }

  // instance của payment
  get payments(): Collection<Payment> {
    return this.db.collection(process.env.DB_PAYMENTS_COLLECTION as string)
  }

  get user_addresses(): Collection<UserAddress> {
    return this.db.collection((process.env.DB_USER_ADDRESSES_COLLECTION as string) || 'user_addresses')
  }

  get shop_settings(): Collection<ShopSettings> {
    return this.db.collection(process.env.DB_SHOP_SETTINGS_COLLECTION || 'shop_settings')
  }

  get wishlist_items(): Collection<WishlistItem> {
    return this.db.collection(process.env.DB_WISHLIST_COLLECTION || 'wishlist_items')
  }

  get vouchers(): Collection<Voucher> {
    return this.db.collection(process.env.DB_VOUCHERS_COLLECTION || 'vouchers')
  }

  get reviews(): Collection<Review> {
    return this.db.collection(process.env.DB_REVIEWS_COLLECTION || 'reviews')
  }
}

const databaseService = new DatabaseService()
export default databaseService
