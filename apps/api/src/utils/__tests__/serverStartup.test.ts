import { describe, expect, it, vi } from 'vitest'
import { initializeServer } from '../serverStartup'

describe('ordered server startup', () => {
  it('opens HTTP only after database and initializers succeed', async () => {
    const order: string[] = []
    const server = await initializeServer({
      connect: async () => {
        order.push('connect')
      },
      initialize: async () => {
        order.push('initialize')
      },
      listen: () => {
        order.push('listen')
        return 'server'
      }
    })
    expect(order).toEqual(['connect', 'initialize', 'listen'])
    expect(server).toBe('server')
  })
  it('never opens HTTP or initializes data when the database fails', async () => {
    const initialize = vi.fn(),
      listen = vi.fn()
    await expect(
      initializeServer({
        connect: async () => {
          throw new Error('DNS unavailable')
        },
        initialize,
        listen
      })
    ).rejects.toThrow('DNS unavailable')
    expect(initialize).not.toHaveBeenCalled()
    expect(listen).not.toHaveBeenCalled()
  })
  it('does not advertise readiness if initialization fails', async () => {
    const listen = vi.fn()
    await expect(
      initializeServer({
        connect: async () => undefined,
        initialize: async () => {
          throw new Error('init failed')
        },
        listen
      })
    ).rejects.toThrow('init failed')
    expect(listen).not.toHaveBeenCalled()
  })
})
