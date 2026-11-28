import { describe, expect, it } from 'vitest'
import { MediaType } from '~/constants/enums'
import { normalizeProductMedias, validateProductMedias } from '~/utils/productMedia'
import { detectVideoExt } from '~/utils/file'

const img = (n: number) => ({ url: `https://cdn.test/${n}.jpg`, type: MediaType.Image })
const vid = { url: 'https://api.test/static/video/a.mp4', type: MediaType.Video }

describe('validateProductMedias', () => {
  it('accepts images plus one video', () => {
    expect(validateProductMedias([img(1), vid, img(2)])).toBeNull()
  })
  it('rejects a second video', () => {
    expect(validateProductMedias([vid, { ...vid, url: 'https://api.test/b.mp4' }])).toMatch(/1 video/)
  })
  it('rejects non-http urls and unknown types', () => {
    expect(validateProductMedias([{ url: 'javascript:alert(1)', type: MediaType.Image }])).toMatch(/http/)
    expect(validateProductMedias([{ url: 'https://x.test/a.jpg', type: 7 }])).toMatch(/Loại/)
  })
  it('caps the number of items', () => {
    expect(validateProductMedias(Array.from({ length: 13 }, (_, i) => img(i)))).toMatch(/Tối đa/)
  })
})

describe('normalizeProductMedias', () => {
  it('puts images first, the video last, and never uses the video as thumbnail', () => {
    const r = normalizeProductMedias([vid, img(1), img(2)])
    expect(r.medias.map((m) => m.type)).toEqual([MediaType.Image, MediaType.Image, MediaType.Video])
    expect(r.thumbnail).toBe(img(1).url)
  })
  it('has no thumbnail when there are only videos', () => {
    expect(normalizeProductMedias([vid]).thumbnail).toBeUndefined()
  })
})

describe('detectVideoExt', () => {
  const ftyp = (brand: string) => Buffer.concat([Buffer.from([0, 0, 0, 0x18]), Buffer.from('ftyp' + brand + '\0\0\0\0', 'latin1')])
  it('recognises mp4, mov and webm by signature', () => {
    expect(detectVideoExt(ftyp('isom'))).toBe('mp4')
    expect(detectVideoExt(ftyp('qt  '))).toBe('mov')
    expect(detectVideoExt(Buffer.from([0x1a, 0x45, 0xdf, 0xa3, 0, 0, 0, 0]))).toBe('webm')
  })
  it('rejects files that only claim to be video', () => {
    expect(detectVideoExt(Buffer.from('<html><script>alert(1)</script>', 'latin1'))).toBeNull()
    expect(detectVideoExt(Buffer.alloc(0))).toBeNull()
  })
})
