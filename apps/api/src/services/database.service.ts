import { ClientSession, Collection, Db, MongoClient } from 'mongodb'
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

  get vouchers(): Collection<Voucher> {
    return this.db.collection(process.env.DB_VOUCHERS_COLLECTION || 'vouchers')
  }

  get reviews(): Collection<Review> {
    return this.db.collection(process.env.DB_REVIEWS_COLLECTION || 'reviews')
  }
}

const databaseService = new DatabaseService()
export default databaseService
