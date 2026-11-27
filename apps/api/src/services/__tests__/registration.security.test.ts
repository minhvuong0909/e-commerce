import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ObjectId } from 'mongodb'
import { USER_ROLE, UserVerifyStatus } from '~/constants/enums'

const mocks = vi.hoisted(() => ({ insertUser: vi.fn(), insertToken: vi.fn(), send: vi.fn() }))
vi.mock('../database.service', () => ({
  default: { users: { insertOne: mocks.insertUser }, refreshTokens: { insertOne: mocks.insertToken } }
}))
vi.mock('~/utils/crypto', () => ({ hashPassword: vi.fn(async () => 'hashed'), comparePassword: vi.fn() }))
vi.mock('~/utils/jwt', () => ({
  signToken: vi.fn(async () => 'server-signed-token'),
  verifyToken: vi.fn(async () => ({ iat: 1, exp: 2 }))
}))
vi.mock('~/config/mail', () => ({
  createMailTransporter: () => ({ sendMail: mocks.send }),
  getApiBaseUrl: () => 'http://localhost:3000',
  getGmailAuth: () => ({ user: 'test@local' })
}))
vi.mock('~/config/config', () => ({ supabaseConfig: {} }))
import usersService from '../users.services'

describe('registration privilege boundaries', () => {
  beforeEach(() => vi.clearAllMocks())
  it('ignores forged role, verification, identifiers and reset credentials', async () => {
    const forgedId = new ObjectId()
    await usersService.register({
      name: 'Customer',
      email: 'customer@example.test',
      password: 'Test-password-123!',
      confirm_password: 'Test-password-123!',
      role: USER_ROLE.Admin,
      verify_status: UserVerifyStatus.Verified,
      _id: forgedId,
      email_verify_token: 'forged',
      forgot_password_token: 'forged',
      supabase_user_id: 'forged'
    } as any)
    const record = mocks.insertUser.mock.calls[0][0]
    expect(record.role).toBe(USER_ROLE.User)
    expect(record.verify_status).toBe(UserVerifyStatus.Unverified)
    expect(record._id.equals(forgedId)).toBe(false)
    expect(record.email_verify_token).toBe('server-signed-token')
    expect(record.forgot_password_token).toBe('')
    expect(record.supabase_user_id).toBe('')
    expect(record.password).toBe('hashed')
  })
})
