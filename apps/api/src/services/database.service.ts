import { Collection, Db, MongoClient, ObjectId } from 'mongodb'
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

dotenv.config()

const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@shoppingcard.0zguu.mongodb.net/?retryWrites=true&w=majority&appName=ShoppingCard`

class DatabaseService {
  private client: MongoClient
  public db: Db

  constructor() {
    this.client = new MongoClient(uri)
    this.db = this.client.db(process.env.DB_NAME)
  }

  async connect() {
    try {
      await this.client.connect()
      await this.db.command({ ping: 1 })
      console.log('MongoDB connected successfully!')
    } catch (err) {
      console.error('MongoDB connection error:', err)
      throw err
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
}

const databaseService = new DatabaseService()
export default databaseService
