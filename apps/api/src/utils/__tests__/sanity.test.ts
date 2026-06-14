import { describe, it, expect } from 'vitest'
import HTTP_STATUS from '~/constants/httpStatus'

describe('vitest setup sanity', () => {
  it('resolves the ~ alias to src', () => {
    expect(HTTP_STATUS.OK).toBe(200)
  })
})
