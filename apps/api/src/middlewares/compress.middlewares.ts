import { NextFunction, Request, Response } from 'express'
import zlib from 'zlib'

/** Dưới ngưỡng này nén không đáng (header + CPU nhiều hơn phần tiết kiệm). */
export const COMPRESS_MIN_BYTES = 1024

/** Chọn thuật toán theo Accept-Encoding: ưu tiên brotli, rồi gzip. */
export function pickEncoding(acceptEncoding: string | undefined): 'br' | 'gzip' | null {
  const accepted = (acceptEncoding || '')
    .toLowerCase()
    .split(',')
    .map((p) => p.trim().split(';'))
    .filter(([, q]) => !q || Number(q.split('=')[1]) > 0)
    .map(([name]) => name)
  if (accepted.includes('br')) return 'br'
  if (accepted.includes('gzip') || accepted.includes('*')) return 'gzip'
  return null
}

/**
 * Nén phản hồi JSON của API (danh sách sản phẩm, đơn hàng…) bằng zlib có sẵn của Node.
 * Chỉ áp dụng cho res.json/res.send với body dạng chuỗi/Buffer kiểu JSON; ảnh/video (sendFile, stream)
 * không đi qua đây nên giữ nguyên Range request.
 */
export function compressJson(req: Request, res: Response, next: NextFunction) {
  const encoding = pickEncoding(req.headers['accept-encoding'])
  if (!encoding || req.method === 'HEAD') return next()

  const send = res.send.bind(res)
  res.send = (body?: unknown) => {
    const type = String(res.getHeader('Content-Type') || '')
    const isText = typeof body === 'string' || Buffer.isBuffer(body)
    if (!isText || !type.includes('json') || res.getHeader('Content-Encoding')) return send(body)
    const raw = Buffer.isBuffer(body) ? body : Buffer.from(body as string)
    if (raw.length < COMPRESS_MIN_BYTES) return send(body)

    const packed =
      encoding === 'br'
        ? zlib.brotliCompressSync(raw, { params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 4 } })
        : zlib.gzipSync(raw, { level: 6 })
    res.setHeader('Content-Encoding', encoding)
    res.append('Vary', 'Accept-Encoding')
    res.removeHeader('Content-Length')
    res.removeHeader('ETag') // ETag tính trên bản chưa nén
    return send(packed)
  }
  next()
}
