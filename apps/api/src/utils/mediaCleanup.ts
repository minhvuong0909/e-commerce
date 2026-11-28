import crypto from 'crypto'
import fs from 'fs'
import path from 'path'
import { UPLOAD_IMAGE_DIR, UPLOAD_VIDEO_DIR } from '~/constants/dir'
import databaseService from '~/services/database.service'
import { fetchWithTimeout, HTTP_TIMEOUTS } from '~/utils/http'

/**
 * Dọn file media không còn dùng khi admin xóa ảnh/video khỏi sản phẩm hoặc xóa sản phẩm.
 *
 * - File lưu trên server (/static/image|video/<tên>): xóa khỏi uploads/ — nhận theo tên file chứ không theo host,
 *   vì API_URL có thể đã đổi (IP LAN cũ, domain mới…).
 * - File trên Cloudinary: chỉ xóa được khi có CLOUDINARY_API_KEY + CLOUDINARY_API_SECRET (upload preset
 *   unsigned không có quyền xóa). Thiếu thì bỏ qua, file vẫn nằm trên Cloudinary như trước.
 * - Trước khi xóa luôn kiểm tra không còn sản phẩm/cài đặt/avatar nào trỏ tới file đó (ảnh có thể dùng chung).
 * - Lỗi khi dọn chỉ ghi log, không bao giờ làm hỏng thao tác lưu sản phẩm.
 */

export type MediaRef =
  | { kind: 'local'; key: string; filePath: string }
  | { kind: 'cloudinary'; key: string; resource: 'image' | 'video'; publicId: string }

const LOCAL_MEDIA = /\/static\/(image|video)\/([^/?#]+)(?:[?#].*)?$/
const CLOUDINARY_MEDIA = /^https:\/\/res\.cloudinary\.com\/[^/]+\/(image|video)\/upload\/(.+?)(?:[?#].*)?$/i
// URL lưu trong DB là secure_url lúc upload: .../upload/v1712345678/<public id>.<đuôi>
const CLOUDINARY_VERSION = /^v\d+$/

/** Nhận dạng URL media do hệ thống quản lý; URL ngoài (ảnh dán từ web khác) trả null → không đụng tới. */
export function parseMediaUrl(url: unknown): MediaRef | null {
  if (typeof url !== 'string' || !url) return null

  const local = url.match(LOCAL_MEDIA)
  if (local) {
    const [, kind, rawName] = local
    let name: string
    try {
      name = decodeURIComponent(rawName)
    } catch {
      return null
    }
    // chỉ tên file trơn: chặn ../, thư mục con, file ẩn
    if (name !== path.basename(name) || name.startsWith('.')) return null
    const dir = kind === 'video' ? UPLOAD_VIDEO_DIR : UPLOAD_IMAGE_DIR
    return { kind: 'local', key: `${kind}/${name}`, filePath: path.join(dir, name) }
  }

  const cloud = url.match(CLOUDINARY_MEDIA)
  if (cloud) {
    const [, resource, rest] = cloud
    const segments = rest.split('/')
    if (segments.length > 1 && CLOUDINARY_VERSION.test(segments[0])) segments.shift()
    const publicId = segments.join('/').replace(/\.[a-z0-9]{2,5}$/i, '')
    if (!publicId) return null
    return {
      kind: 'cloudinary',
      key: `${resource}:${publicId}`,
      resource: resource.toLowerCase() as 'image' | 'video',
      publicId
    }
  }
  return null
}

/** Tất cả URL media của một sản phẩm (danh sách medias + thumbnail). */
export function productMediaUrls(product: { medias?: { url?: string }[] | null; thumbnail?: string | null } | null) {
  if (!product) return []
  return [...(product.medias || []).map((m) => m?.url), product.thumbnail].filter((u): u is string => !!u)
}

/** Những media có trong `before` nhưng không còn trong `after` (so theo file, không theo chuỗi URL). */
export function removedMedia(before: string[], after: string[]): MediaRef[] {
  const kept = new Set(after.map((u) => parseMediaUrl(u)?.key).filter(Boolean))
  const out = new Map<string, MediaRef>()
  for (const url of before) {
    const ref = parseMediaUrl(url)
    if (ref && !kept.has(ref.key) && !out.has(ref.key)) out.set(ref.key, ref)
  }
  return [...out.values()]
}

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/** Regex khớp mọi URL trỏ tới cùng file (bất kể host hay transform Cloudinary). */
function refPattern(ref: MediaRef) {
  if (ref.kind === 'local') {
    const [kind, name] = ref.key.split('/')
    return new RegExp(`/static/${kind}/(?:${escapeRegex(name)}|${escapeRegex(encodeURIComponent(name))})(?:[?#]|$)`)
  }
  return new RegExp(
    `res\\.cloudinary\\.com/[^/]+/${ref.resource}/upload/(?:[^/]+/)*${escapeRegex(ref.publicId)}(?:\\.[a-zA-Z0-9]{2,5})?(?:[?#]|$)`
  )
}

/** Còn chỗ nào trong DB dùng file này không (sản phẩm khác, bảng media cũ, logo/banner shop, avatar). */
export async function isMediaReferenced(ref: MediaRef) {
  const re = refPattern(ref)
  const checks = [
    databaseService.products.findOne({ $or: [{ 'medias.url': re }, { thumbnail: re }] }, { projection: { _id: 1 } }),
    databaseService.product_media.findOne({ 'media.url': re }, { projection: { _id: 1 } }),
    databaseService.shop_settings.findOne({ $or: [{ logo_url: re }, { banner_url: re }] }, { projection: { _id: 1 } }),
    databaseService.users.findOne({ avatar: re }, { projection: { _id: 1 } })
  ]
  return (await Promise.all(checks)).some(Boolean)
}

export function cloudinaryDeleteConfigured() {
  return !!(
    process.env.CLOUDINARY_CLOUD_NAME?.trim() &&
    process.env.CLOUDINARY_API_KEY?.trim() &&
    process.env.CLOUDINARY_API_SECRET?.trim()
  )
}

/** Chữ ký API Cloudinary: sha1 của các tham số sắp xếp theo tên + secret. */
export function cloudinarySignature(params: Record<string, string | number>, secret: string) {
  const toSign = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join('&')
  return crypto
    .createHash('sha1')
    .update(toSign + secret)
    .digest('hex')
}

async function destroyOnCloudinary(ref: Extract<MediaRef, { kind: 'cloudinary' }>) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME!.trim()
  const apiKey = process.env.CLOUDINARY_API_KEY!.trim()
  const secret = process.env.CLOUDINARY_API_SECRET!.trim()
  const timestamp = Math.floor(Date.now() / 1000)
  const params = { public_id: ref.publicId, invalidate: 'true', timestamp }
  const body = new URLSearchParams({
    ...Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)])),
    api_key: apiKey,
    signature: cloudinarySignature(params, secret)
  })
  const res = await fetchWithTimeout(
    `https://api.cloudinary.com/v1_1/${cloudName}/${ref.resource}/destroy`,
    { method: 'POST', body },
    { timeoutMs: HTTP_TIMEOUTS.mediaUpload, service: 'cloudinary' }
  )
  if (!res.ok) throw new Error(`Cloudinary destroy failed: ${res.status}`)
}

export type CleanupResult = { deleted: string[]; kept: string[]; skipped: string[]; failed: string[] }

/** Xóa các media đã bị bỏ, nếu không còn ai dùng. Không ném lỗi. */
export async function deleteUnusedMedia(refs: MediaRef[]): Promise<CleanupResult> {
  const result: CleanupResult = { deleted: [], kept: [], skipped: [], failed: [] }
  for (const ref of refs) {
    try {
      if (await isMediaReferenced(ref)) {
        result.kept.push(ref.key)
        continue
      }
      if (ref.kind === 'local') {
        await fs.promises.unlink(ref.filePath).catch((err: NodeJS.ErrnoException) => {
          if (err.code !== 'ENOENT') throw err // file đã không còn thì coi như xong
        })
        result.deleted.push(ref.key)
      } else if (cloudinaryDeleteConfigured()) {
        await destroyOnCloudinary(ref)
        result.deleted.push(ref.key)
      } else {
        result.skipped.push(ref.key)
      }
    } catch (err) {
      result.failed.push(ref.key)
      console.error('Media cleanup error:', ref.key, (err as Error)?.message || err)
    }
  }
  return result
}

/** So media trước/sau khi lưu và dọn phần bị bỏ. */
export function cleanupRemovedMedia(before: string[], after: string[]) {
  const refs = removedMedia(before, after)
  if (!refs.length) return Promise.resolve<CleanupResult>({ deleted: [], kept: [], skipped: [], failed: [] })
  return deleteUnusedMedia(refs)
}
