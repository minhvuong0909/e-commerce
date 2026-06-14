import { describe, it, expect } from 'vitest'
import { OrderStatus } from '~/constants/enums'
import { canTransitionOrderStatus, isValidOrderStatus } from '~/utils/orderStatus'

describe('isValidOrderStatus', () => {
  it('accepts every defined OrderStatus value', () => {
    expect(isValidOrderStatus(OrderStatus.Pending)).toBe(true)
    expect(isValidOrderStatus(OrderStatus.Cancelled)).toBe(true)
  })

  it('rejects numbers outside the enum range', () => {
    expect(isValidOrderStatus(99)).toBe(false)
    expect(isValidOrderStatus(-1)).toBe(false)
  })

  it('rejects non-integer and non-number values', () => {
    expect(isValidOrderStatus('1')).toBe(false)
    expect(isValidOrderStatus(1.5)).toBe(false)
    expect(isValidOrderStatus(undefined)).toBe(false)
    expect(isValidOrderStatus(null)).toBe(false)
  })
})

describe('canTransitionOrderStatus', () => {
  it('allows Pending to move to Confirmed or Cancelled', () => {
    expect(canTransitionOrderStatus(OrderStatus.Pending, OrderStatus.Confirmed)).toBe(true)
    expect(canTransitionOrderStatus(OrderStatus.Pending, OrderStatus.Cancelled)).toBe(true)
  })

  it('allows the full forward flow Confirmed -> Shipped -> Delivered', () => {
    expect(canTransitionOrderStatus(OrderStatus.Confirmed, OrderStatus.Shipped)).toBe(true)
    expect(canTransitionOrderStatus(OrderStatus.Shipped, OrderStatus.Delivered)).toBe(true)
  })

  it('forbids skipping steps (Pending -> Shipped)', () => {
    expect(canTransitionOrderStatus(OrderStatus.Pending, OrderStatus.Shipped)).toBe(false)
  })

  it('forbids leaving terminal states', () => {
    expect(canTransitionOrderStatus(OrderStatus.Delivered, OrderStatus.Cancelled)).toBe(false)
    expect(canTransitionOrderStatus(OrderStatus.Cancelled, OrderStatus.Pending)).toBe(false)
  })

  it('forbids cancelling a shipped order', () => {
    expect(canTransitionOrderStatus(OrderStatus.Shipped, OrderStatus.Cancelled)).toBe(false)
  })

  it('forbids no-op transition to the same status', () => {
    expect(canTransitionOrderStatus(OrderStatus.Pending, OrderStatus.Pending)).toBe(false)
  })
})
