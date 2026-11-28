import crypto from 'crypto'
import fs from 'fs'
import os from 'os'
import path from 'path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const found = { products: null as unknown, legacy: null as unknown }
vi.mock('~/services/database.service', () => ({
  default: {
    products: { findOne: vi.fn(async () => found.products) },
    product_media: { findOne: vi.fn(async () => found.legacy) },
    shop_settings: { findOne: vi.fn(async () => null) },
    users: { findOne: vi.fn(async () => null) }
  }
}))

import databaseService from '~/services/database.service'
import { UPLOAD_IMAGE_DIR, UPLOAD_VIDEO_DIR } from '~/constants/dir'
import {
  cleanupRemovedMedia,
  cloudinarySignature,
  deleteUnusedMedia,
  parseMediaUrl,
  productMediaUrls,
  removedMedia
} from '../mediaCleanup'

const CLOUD = 'https://res.cloudinary.com/demo/image/upload/v1712345678/vibrant-mart/products/abc123.webp'

describe('parseMediaUrl', () => {
  it('recognises local files by name regardless of host', () => {
    const a = parseMediaUrl('http://192.168.0.104:3000/static/image/x1.webp')
    const b = parseMediaUrl('https://api.shop.vn/static/image/x1.webp?v=2')
    expect(a).toEqual({ kind: 'local', key: 'image/x1.webp', filePath: path.join(UPLOAD_IMAGE_DIR, 'x1.webp') })
    expect(b?.key).toBe(a?.key)
    expect(parseMediaUrl('http://h/static/video/v.mp4')).toMatchObject({
      filePath: path.join(UPLOAD_VIDEO_DIR, 'v.mp4')
    })
  })

  it('never yields a path outside the upload dirs', () => {
    expect(parseMediaUrl('http://h/static/image/..%2F..%2F.env')).toBeNull()
    expect(parseMediaUrl('http://h/static/image/%2e%2e')).toBeNull()
    expect(parseMediaUrl('http://h/static/image/.gitkeep')).toBeNull()
    expect(parseMediaUrl('http://h/static/image/bad%E0%A4%A')).toBeNull()
  })

  it('extracts the Cloudinary public id and resource type', () => {
    expect(parseMediaUrl(CLOUD)).toMatchObject({
      kind: 'cloudinary',
      resource: 'image',
      publicId: 'vibrant-mart/products/abc123'
    })
    expect(parseMediaUrl('https://res.cloudinary.com/demo/video/upload/v1/vibrant-mart/videos/clip.mov')).toMatchObject(
      {
        resource: 'video',
        publicId: 'vibrant-mart/videos/clip'
      }
    )
  })

  it('ignores external links and junk', () => {
    expect(parseMediaUrl('https://images.unsplash.com/photo-1.jpg')).toBeNull()
    expect(parseMediaUrl('')).toBeNull()
    expect(parseMediaUrl(undefined)).toBeNull()
  })
})

describe('removedMedia', () => {
  it('returns only files that disappeared, compared by file not URL string', () => {
    const before = [
      'http://old-ip/static/image/a.webp',
      'http://old-ip/static/image/b.webp',
      CLOUD,
      'https://ext.com/x.jpg'
    ]
    const after = ['https://new-host/static/image/a.webp']
    expect(removedMedia(before, after).map((r) => r.key)).toEqual([
      'image/b.webp',
      'image:vibrant-mart/products/abc123'
    ])
  })

  it('dedupes and collects thumbnail too', () => {
    const urls = productMediaUrls({ medias: [{ url: 'h/static/image/a.webp' }], thumbnail: 'h/static/image/a.webp' })
    expect(removedMedia(urls, [])).toHaveLength(1)
  })
})

describe('cloudinarySignature', () => {
  it('signs sorted params with the secret (Cloudinary spec)', () => {
    const expected = crypto.createHash('sha1').update('public_id=sample&timestamp=1315060510abcd').digest('hex')
    expect(cloudinarySignature({ timestamp: 1315060510, public_id: 'sample' }, 'abcd')).toBe(expected)
  })
})

describe('deleteUnusedMedia', () => {
  let dir: string
  beforeEach(() => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), 'media-cleanup-'))
    found.products = null
    found.legacy = null
    delete process.env.CLOUDINARY_API_SECRET
  })
  afterEach(() => fs.rmSync(dir, { recursive: true, force: true }))

  const localRef = (name: string) => {
    const filePath = path.join(dir, name)
    fs.writeFileSync(filePath, 'x')
    return { kind: 'local' as const, key: `image/${name}`, filePath }
  }

  it('deletes a file nobody references', async () => {
    const ref = localRef('gone.webp')
    const r = await deleteUnusedMedia([ref])
    expect(r.deleted).toEqual(['image/gone.webp'])
    expect(fs.existsSync(ref.filePath)).toBe(false)
  })

  it('keeps a file still used by another product, matching any host', async () => {
    const ref = localRef('shared.webp')
    found.products = { _id: 'other' }
    const r = await deleteUnusedMedia([ref])
    expect(r.kept).toEqual(['image/shared.webp'])
    expect(fs.existsSync(ref.filePath)).toBe(true)
    const calls = vi.mocked(databaseService.products.findOne).mock.calls
    const query = calls[calls.length - 1][0] as { $or: { 'medias.url': RegExp }[] }
    const re = query.$or[0]['medias.url']
    expect(re.test('http://any-host:3000/static/image/shared.webp')).toBe(true)
    expect(re.test('http://h/static/image/shared.webp.bak')).toBe(false)
    expect(re.test('http://h/static/image/notshared.webp')).toBe(false)
  })

  it('treats an already-missing file as done, and skips Cloudinary without an API secret', async () => {
    const missing = { kind: 'local' as const, key: 'image/none.webp', filePath: path.join(dir, 'none.webp') }
    const r = await deleteUnusedMedia([missing, parseMediaUrl(CLOUD)!])
    expect(r.deleted).toEqual(['image/none.webp'])
    expect(r.skipped).toEqual(['image:vibrant-mart/products/abc123'])
    expect(r.failed).toEqual([])
  })

  it('never throws when the DB check fails', async () => {
    const ref = localRef('keep-on-error.webp')
    vi.mocked(databaseService.products.findOne).mockRejectedValueOnce(new Error('db down'))
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const r = await deleteUnusedMedia([ref])
    spy.mockRestore()
    expect(r.failed).toEqual(['image/keep-on-error.webp'])
    expect(fs.existsSync(ref.filePath)).toBe(true)
  })

  it('cleanupRemovedMedia is a no-op when nothing was removed', async () => {
    const r = await cleanupRemovedMedia(['h/static/image/a.webp'], ['h2/static/image/a.webp'])
    expect(r.deleted).toEqual([])
  })
})
