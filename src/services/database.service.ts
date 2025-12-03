import { Db, MongoClient } from 'mongodb'
import dotenv from 'dotenv'

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
}

const databaseService = new DatabaseService()
export default databaseService
