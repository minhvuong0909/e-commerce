import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ObjectId } from 'mongodb'
import { UserVerifyStatus } from '~/constants/enums'

const mocks = vi.hoisted(() => ({
  findUser: vi.fn(),
  insertToken: vi.fn(),
  deleteTokens: vi.fn(),
  deleteToken: vi.fn(),
  compare: vi.fn()
}))
vi.mock('../database.service', () => ({
  default: {
    users: { findOne: mocks.findUser },
    refreshTokens: { insertOne: mocks.insertToken, deleteMany: mocks.deleteTokens, deleteOne: mocks.deleteToken }
  }
}))
vi.mock('~/utils/crypto', () => ({ hashPassword: vi.fn(), comparePassword: mocks.compare }))
vi.mock('~/utils/jwt', () => ({
  signToken: vi.fn(async () => 'token'),
  verifyToken: vi.fn(async () => ({ iat: 1, exp: 2 }))
}))
vi.mock('~/config/mail', () => ({
  createMailTransporter: () => ({ sendMail: vi.fn() }),
  getApiBaseUrl: () => 'http://localhost:3000',
  getGmailAuth: () => ({ user: 'test@local' })
}))
vi.mock('~/config/config', () => ({ supabaseConfig: {} }))
import usersService from '../users.services'

describe('locked accounts cannot obtain tokens', () => {
  const id = new ObjectId()
  beforeEach(() => vi.clearAllMocks())

  it('rejects password login for a banned account even with the right password', async () => {
    mocks.findUser.mockResolvedValue({ _id: id, password: 'h', verify_status: UserVerifyStatus.Banned })
    mocks.compare.mockResolvedValue(true)
    await expect(usersService.login({ email: 'a@b.test', password: 'pw' })).rejects.toMatchObject({ status: 403 })
    expect(mocks.insertToken).not.toHaveBeenCalled()
  })

  it('still reports a wrong password first (does not reveal that the account is locked)', async () => {
    mocks.findUser.mockResolvedValue({ _id: id, password: 'h', verify_status: UserVerifyStatus.Banned })
    mocks.compare.mockResolvedValue(false)
    await expect(usersService.login({ email: 'a@b.test', password: 'nope' })).rejects.toMatchObject({ status: 422 })
  })

  it('refuses to refresh tokens for a banned account and revokes its sessions', async () => {
    mocks.findUser.mockResolvedValue({ _id: id, verify_status: UserVerifyStatus.Banned })
    await expect(
      usersService.refreshToken({ user_id: id.toHexString(), refresh_token: 'r', exp: 2 })
    ).rejects.toMatchObject({ status: 403 })
    expect(mocks.deleteTokens).toHaveBeenCalledWith({ user_id: id })
    expect(mocks.insertToken).not.toHaveBeenCalled()
  })

  it('lets an active account log in normally', async () => {
    mocks.findUser.mockResolvedValue({ _id: id, password: 'h', verify_status: UserVerifyStatus.Verified })
    mocks.compare.mockResolvedValue(true)
    await expect(usersService.login({ email: 'a@b.test', password: 'pw' })).resolves.toBeTruthy()
    expect(mocks.insertToken).toHaveBeenCalledOnce()
  })
})
