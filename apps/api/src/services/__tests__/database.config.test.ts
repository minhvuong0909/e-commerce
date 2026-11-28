import { describe, expect, it } from 'vitest'
import { resolveDatabaseUrl } from '../database.service'

describe('resolveDatabaseUrl', () => {
  it('accepts mongodb and mongodb+srv URLs, trimming quotes and spaces', () => {
    expect(resolveDatabaseUrl({ DATABASE_URL: ' mongodb+srv://u:p@cluster.example/db ' })).toBe('mongodb+srv://u:p@cluster.example/db')
    expect(resolveDatabaseUrl({ DATABASE_URL: '"mongodb://localhost:27017/?replicaSet=rs0"' })).toBe(
      'mongodb://localhost:27017/?replicaSet=rs0'
    )
  })

  it('returns null instead of falling back to a hard-coded cluster', () => {
    expect(resolveDatabaseUrl({})).toBeNull()
    expect(resolveDatabaseUrl({ DATABASE_URL: '' })).toBeNull()
    expect(resolveDatabaseUrl({ DATABASE_URL: 'postgres://nope', DB_USERNAME: 'u', DB_PASSWORD: 'p' })).toBeNull()
  })
})
