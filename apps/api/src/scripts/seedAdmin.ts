import dotenv from 'dotenv'
import { ObjectId } from 'mongodb'
import { USER_ROLE, UserVerifyStatus } from '~/constants/enums'
import User from '~/models/schemas/Users.schema'
import databaseService from '~/services/database.service'
import { hashPassword } from '~/utils/crypto'

dotenv.config()

const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@vibrantmart.local'
const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'Admin@123456'
const adminName = process.env.SEED_ADMIN_NAME || 'Vibrant Mart Admin'

async function seedAdmin() {
  await databaseService.connect()

  const now = new Date()
  const existing = await databaseService.users.findOne({ email: adminEmail })
  const password = await hashPassword(adminPassword)

  if (existing?._id) {
    await databaseService.users.updateOne(
      { _id: existing._id },
      {
        $set: {
          name: existing.name || adminName,
          password,
          role: USER_ROLE.Admin,
          verify_status: UserVerifyStatus.Verified,
          updated_at: now
        }
      }
    )

    console.log(`Admin account updated: ${adminEmail}`)
    return
  }

  await databaseService.users.insertOne(
    new User({
      _id: new ObjectId(),
      name: adminName,
      email: adminEmail,
      password,
      role: USER_ROLE.Admin,
      verify_status: UserVerifyStatus.Verified,
      created_at: now,
      updated_at: now
    })
  )

  console.log(`Admin account created: ${adminEmail}`)
}

seedAdmin()
  .catch((error) => {
    console.error('Seed admin failed:', error)
    process.exitCode = 1
  })
  .finally(() => {
    process.exit()
  })
