import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ObjectId } from 'mongodb'
import { USER_ROLE, UserVerifyStatus } from '~/constants/enums'
const mocks = vi.hoisted(() => ({ user: vi.fn() }))
vi.mock('~/services/users.services', () => ({ default: { findUserById: mocks.user } }))
vi.mock('~/services/database.service', () => ({ default: {} }))
vi.mock('~/controllers/products.controllers', () => ({
  createProductController: vi.fn(),
  updateProductController: vi.fn(),
  deleteProductController: vi.fn(),
  getProductsController: vi.fn(),
  getProductByIdController: vi.fn()
}))
import { checkPermissions } from '~/middlewares/users.middlewares'
import productRouter from '../products.routers'
vi.mock('~/controllers/payment.controllers', () => ({
  createMoMoPaymentController: vi.fn(),
  momoWebhookController: vi.fn(),
  momoReturnController: vi.fn(),
  createPayPalPaymentController: vi.fn(),
  paypalSuccessController: vi.fn(),
  mockMoMoPaymentSuccessController: vi.fn(),
  createPayOSPaymentController: vi.fn(),
  payosWebhookController: vi.fn(),
  payosReturnController: vi.fn(),
  payosCancelController: vi.fn()
}))
vi.mock('~/config/payment', () => ({ isMoMoSandboxMode: false }))
import paymentRouter from '../payment.routers'

describe('catalog role boundaries', () => {
  beforeEach(() => vi.clearAllMocks())
  const request = () => ({ decode_authorization: { user_id: new ObjectId().toHexString() } }) as any
  it.each([USER_ROLE.User, USER_ROLE.Staff])('denies non-admin role %s', async (role) => {
    mocks.user.mockResolvedValue({ role, verify_status: UserVerifyStatus.Verified })
    const next = vi.fn()
    await expect(checkPermissions(USER_ROLE.Admin)(request(), {} as any, next)).rejects.toMatchObject({ status: 403 })
    expect(next).not.toHaveBeenCalled()
  })
  it('denies a banned administrator', async () => {
    mocks.user.mockResolvedValue({ role: USER_ROLE.Admin, verify_status: UserVerifyStatus.Banned })
    await expect(checkPermissions(USER_ROLE.Admin)(request(), {} as any, vi.fn())).rejects.toMatchObject({
      status: 403
    })
  })
  it('allows an active administrator', async () => {
    mocks.user.mockResolvedValue({ role: USER_ROLE.Admin, verify_status: UserVerifyStatus.Verified })
    const next = vi.fn()
    await checkPermissions(USER_ROLE.Admin)(request(), {} as any, next)
    expect(next).toHaveBeenCalledOnce()
  })
  it('wires role and verification guards to every product mutation', () => {
    const routes = (productRouter as any).stack.filter((layer: any) => layer.route).map((layer: any) => layer.route)
    for (const route of routes.filter((route: any) => !route.methods.get)) {
      const roleGuard = route.stack.find((layer: any) => layer.handle.toString().includes('allowedRoles'))
      expect(roleGuard, route.path).toBeTruthy()
      expect(route.stack.some((layer: any) => layer.handle.name === 'requireVerifiedEmail')).toBe(true)
    }
  })
  it('keeps the public MoMo webhook before the authenticated dynamic route', () => {
    const routes = (paymentRouter as any).stack
      .filter((layer: any) => layer.route?.methods.post)
      .map((layer: any) => layer.route.path)
    expect(routes.indexOf('/momo/webhook')).toBeLessThan(routes.indexOf('/momo/:order_id'))
    expect(routes).not.toContain('/momo/mock-success/:order_id')
  })
})
