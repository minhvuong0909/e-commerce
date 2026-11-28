import { afterAll, describe, expect, it } from 'vitest'
import fs from 'fs'
import os from 'os'
import path from 'path'
import sharp from 'sharp'
import { IMAGE_OPTIMIZE, optimizeImage } from '~/utils/imageOptimize'

sharp.cache(false) // Windows: sharp giữ handle file trong cache, chặn việc xóa thư mục tạm
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'img-opt-'))
afterAll(() => fs.rmSync(dir, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 }))

/** Ảnh "chụp điện thoại" giả: nhiều chi tiết để nén không quá dễ. */
async function photo(width: number, height: number, withExif = false) {
  const raw = Buffer.alloc(width * height * 3)
  for (let i = 0; i < raw.length; i++) raw[i] = (i * 7 + ((i / 3) % width) * 3) & 0xff
  let img = sharp(raw, { raw: { width, height, channels: 3 } }).jpeg({ quality: 95 })
  if (withExif) img = img.withMetadata({ orientation: 6, exif: { IFD0: { Make: 'TestPhone' } } })
  return img.toBuffer()
}

describe('optimizeImage', () => {
  it('shrinks a large photo to at most 1200px WebP and makes it much smaller', async () => {
    const input = await photo(3000, 2000)
    const out = path.join(dir, 'big.webp')
    const r = await optimizeImage(input, out)
    expect(Math.max(r.width, r.height)).toBe(IMAGE_OPTIMIZE.maxSide)
    expect(r.width / r.height).toBeCloseTo(1.5, 1)
    expect(r.bytes).toBeLessThan(input.length / 3)
    expect((await sharp(out).metadata()).format).toBe('webp')
  })

  it('never enlarges small images', async () => {
    const r = await optimizeImage(await photo(400, 300), path.join(dir, 'small.webp'))
    expect([r.width, r.height]).toEqual([400, 300])
  })

  it('applies EXIF rotation and strips metadata', async () => {
    const out = path.join(dir, 'rotated.webp')
    const r = await optimizeImage(await photo(800, 400, true), out)
    expect([r.width, r.height]).toEqual([400, 800]) // orientation 6 = xoay 90°
    const meta = await sharp(out).metadata()
    expect(meta.exif).toBeUndefined()
    expect(meta.orientation).toBeUndefined()
  })

  it('rejects files that are not images', async () => {
    await expect(optimizeImage(Buffer.from('<html>not an image</html>'), path.join(dir, 'bad.webp'))).rejects.toThrow()
  })
})
