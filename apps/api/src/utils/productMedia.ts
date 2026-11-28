import { MediaType } from '~/constants/enums'
import { Media } from '~/models/Other'

export const PRODUCT_MEDIA_LIMITS = { maxItems: 12, maxVideos: 1, maxUrlLength: 2048 } as const

const isVideo = (m: { type?: unknown }) => m.type === MediaType.Video || m.type === 'video'

/** Lỗi đầu tiên của danh sách media gửi lên (null nếu hợp lệ). */
export function validateProductMedias(value: unknown): string | null {
  if (!Array.isArray(value)) return 'Danh sách media không hợp lệ.'
  if (value.length > PRODUCT_MEDIA_LIMITS.maxItems) return `Tối đa ${PRODUCT_MEDIA_LIMITS.maxItems} ảnh/video cho một sản phẩm.`
  for (const item of value) {
    if (!item || typeof item.url !== 'string' || !item.url.trim()) return 'Media thiếu đường dẫn.'
    if (item.url.length > PRODUCT_MEDIA_LIMITS.maxUrlLength || !/^https?:\/\//i.test(item.url.trim()))
      return 'Đường dẫn media phải là http(s).'
    if (item.type !== MediaType.Image && item.type !== MediaType.Video) return 'Loại media không hợp lệ.'
  }
  if (value.filter(isVideo).length > PRODUCT_MEDIA_LIMITS.maxVideos) return 'Mỗi sản phẩm chỉ có 1 video.'
  return null
}

/**
 * Chuẩn hóa trước khi lưu: ảnh trước, video cuối; thumbnail = ảnh đầu tiên
 * (video không bao giờ được dùng làm thumbnail).
 */
export function normalizeProductMedias(medias: Media[]): { medias: Media[]; thumbnail: string | undefined } {
  const clean = medias.map((m) => ({ url: m.url.trim(), type: isVideo(m) ? MediaType.Video : MediaType.Image }))
  const images = clean.filter((m) => m.type === MediaType.Image)
  const videos = clean.filter((m) => m.type === MediaType.Video)
  return { medias: [...images, ...videos], thumbnail: images[0]?.url }
}

/**
 * Stage aggregate: lấy `products.medias` làm nguồn chính (collection `product_medias` cũ chỉ là fallback
 * cho dữ liệu đời trước), rồi tách thành `medias` (chỉ ảnh — mọi chỗ hiển thị đang dùng medias[0] làm ảnh)
 * và `video` (url video hoặc null).
 */
export function productMediaStages() {
  const isVideoExpr = (v: string) => ({ $or: [{ $eq: [`${v}.type`, MediaType.Video] }, { $eq: [`${v}.type`, 'video'] }] })
  return [
    { $lookup: { from: 'product_medias', localField: '_id', foreignField: 'product_id', as: 'medias_infor' } },
    {
      $addFields: {
        _all_medias: {
          $cond: {
            if: { $gt: [{ $size: { $ifNull: ['$medias', []] } }, 0] },
            then: '$medias',
            else: { $map: { input: '$medias_infor', as: 'm', in: '$$m.media' } }
          }
        }
      }
    },
    {
      $addFields: {
        medias: { $filter: { input: '$_all_medias', as: 'm', cond: { $not: [isVideoExpr('$$m')] } } },
        video: {
          $ifNull: [{ $first: { $map: { input: { $filter: { input: '$_all_medias', as: 'm', cond: isVideoExpr('$$m') } }, as: 'v', in: '$$v.url' } } }, null]
        }
      }
    },
    { $project: { medias_infor: 0, _all_medias: 0 } }
  ]
}
