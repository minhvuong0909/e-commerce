import { describe, expect, it, vi } from 'vitest'
import { DeliveryMethodType, DeliveryStatus } from '~/constants/enums'

vi.mock('../database.service', () => ({ default: {} }))
import { dedupeDeliveryMethods } from '../delivery_methods.services'

const m = (id: string, type: DeliveryMethodType, status: DeliveryStatus, created: string) => ({
  id,
  type,
  status,
  created_at: new Date(created)
})

describe('dedupeDeliveryMethods', () => {
  it('returns one method per type, oldest first among selectable ones', () => {
    const result = dedupeDeliveryMethods([
      m('std-new', DeliveryMethodType.STANDARD, DeliveryStatus.Pending, '2026-09-06'),
      m('exp-new', DeliveryMethodType.EXPRESS, DeliveryStatus.Pending, '2026-09-06'),
      m('std-old', DeliveryMethodType.STANDARD, DeliveryStatus.Pending, '2026-07-18'),
      m('exp-old', DeliveryMethodType.EXPRESS, DeliveryStatus.Pending, '2026-07-18')
    ])
    expect(result.map((x) => x.id)).toEqual(['std-old', 'exp-old'])
  })

  it('prefers a selectable method over an older disabled one', () => {
    const result = dedupeDeliveryMethods([
      m('old-off', DeliveryMethodType.STANDARD, DeliveryStatus.Cancelled, '2026-01-01'),
      m('new-on', DeliveryMethodType.STANDARD, DeliveryStatus.Pending, '2026-09-01')
    ])
    expect(result.map((x) => x.id)).toEqual(['new-on'])
  })
})
