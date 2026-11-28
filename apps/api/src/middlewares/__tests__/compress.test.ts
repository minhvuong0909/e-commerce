import { describe, expect, it } from 'vitest'
import express from 'express'
import http from 'http'
import zlib from 'zlib'
import { AddressInfo } from 'net'
import { compressJson, pickEncoding } from '../compress.middlewares'

const big = { items: Array.from({ length: 200 }, (_, i) => ({ id: i, name: `Sản phẩm số ${i}`, price: 100000 + i })) }

async function request(path: string, acceptEncoding?: string) {
  const app = express()
  app.use(compressJson)
  app.get('/big', (_req, res) => res.json(big))
  app.get('/small', (_req, res) => res.json({ ok: true }))
  app.get('/text', (_req, res) => res.type('text/html').send('<p>' + 'x'.repeat(5000) + '</p>'))
  const server = app.listen(0)
  const { port } = server.address() as AddressInfo
  try {
    return await new Promise<{ headers: http.IncomingHttpHeaders; body: Buffer }>((resolve, reject) => {
      http
        .get({ port, path, headers: acceptEncoding ? { 'Accept-Encoding': acceptEncoding } : {} }, (res) => {
          const chunks: Buffer[] = []
          res.on('data', (c) => chunks.push(c))
          res.on('end', () => resolve({ headers: res.headers, body: Buffer.concat(chunks) }))
        })
        .on('error', reject)
    })
  } finally {
    server.close()
  }
}

describe('pickEncoding', () => {
  it('prefers brotli, falls back to gzip, honours q=0', () => {
    expect(pickEncoding('gzip, deflate, br')).toBe('br')
    expect(pickEncoding('gzip, deflate')).toBe('gzip')
    expect(pickEncoding('br;q=0, gzip')).toBe('gzip')
    expect(pickEncoding('identity')).toBeNull()
    expect(pickEncoding(undefined)).toBeNull()
  })
})

describe('compressJson', () => {
  it('gzips large JSON and the payload round-trips', async () => {
    const r = await request('/big', 'gzip')
    expect(r.headers['content-encoding']).toBe('gzip')
    expect(r.headers.vary).toMatch(/Accept-Encoding/)
    const raw = JSON.stringify(big)
    expect(r.body.length).toBeLessThan(raw.length / 3)
    expect(JSON.parse(zlib.gunzipSync(r.body).toString())).toEqual(big)
  })

  it('uses brotli when offered', async () => {
    const r = await request('/big', 'br, gzip')
    expect(r.headers['content-encoding']).toBe('br')
    expect(JSON.parse(zlib.brotliDecompressSync(r.body).toString())).toEqual(big)
  })

  it('leaves small JSON, non-JSON and clients without gzip alone', async () => {
    expect((await request('/small', 'gzip')).headers['content-encoding']).toBeUndefined()
    expect((await request('/text', 'gzip')).headers['content-encoding']).toBeUndefined()
    const plain = await request('/big')
    expect(plain.headers['content-encoding']).toBeUndefined()
    expect(JSON.parse(plain.body.toString())).toEqual(big)
  })
})
