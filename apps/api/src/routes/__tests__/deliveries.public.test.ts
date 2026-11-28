import { describe, expect, it, vi } from 'vitest'

vi.mock('~/services/database.service', () => ({ default: {} }))
vi.mock('~/controllers/delivery_methods.controllers', () => ({
  getAllDeliveryMethodsController: vi.fn(),
  seedDeliverysController: vi.fn()
}))

import deliveryRoutes from '../deliveries.routes'

type Layer = { route?: { path: string; methods: Record<string, boolean>; stack: Array<{ name: string }> } }

describe('GET /delivery-methods', () => {
  it('is public so guest checkout can load delivery options', () => {
    const layer = (deliveryRoutes.stack as unknown as Layer[]).find((l) => l.route?.path === '/' && l.route.methods.get)
    expect(layer).toBeDefined()
    // only the async wrapper — no access-token or role middleware in front of it
    expect(layer!.route!.stack).toHaveLength(1)
  })
})
