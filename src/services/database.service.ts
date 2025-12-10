import { Collection, Db, MongoClient, ObjectId } from 'mongodb'
import dotenv from 'dotenv'
import User from '~/models/schemas/Users.schema'
import RefreshToken from '~/models/schemas/Refresh_Tokens.schema'
import Role from '~/models/schemas/Role.schema'
import { RoleStatus, USER_ROLE } from '~/constants/enums'

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

  // instance của roles
  get roles(): Collection<Role> {
    return this.db.collection(process.env.DB_ROLES_COLLECTION as string)
  }
}

const databaseService = new DatabaseService()
export default databaseService
