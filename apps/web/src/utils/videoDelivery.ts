import { formatImageUrl } from './formatImageUrl'

export type VideoSources = {
  /** link phát */
  src: string
  /** ảnh bìa (khung hình đầu video) — null khi video lưu trên server, không có dịch vụ tách khung */
  poster: string | null
  /** true khi Cloudinary chuyển mã: luôn ra MP4 H.264, phát được trên mọi trình duyệt */
  transcoded: boolean
}

const CLOUDINARY_VIDEO = /^(https:\/\/res\.cloudinary\.com\/[^/]+\/video\/upload\/)(.+?)(\.[a-z0-9]{2,5})?$/i

/**
 * URL phát video sản phẩm.
 * Video trên Cloudinary được chuyển mã khi phát (không đổi file gốc):
 * - q_auto: tự chọn bitrate theo nội dung — thường nhẹ hơn file gốc quay từ điện thoại nhiều lần
 * - vc_auto + đuôi .mp4: codec mà mọi trình duyệt đều phát được (MOV/HEVC của iPhone cũng xem được)
 * - w_1280,c_limit: không gửi video 4K cho khung hiển thị ~700px
 * Ảnh bìa: khung hình ở giây 0.5, dạng ảnh JPG nhỏ — hiện ngay thay cho khung đen.
 */
export function videoSources(url?: string | null): VideoSources | null {
  if (!url) return null
  const m = url.match(CLOUDINARY_VIDEO)
  if (!m) return { src: formatImageUrl(url), poster: null, transcoded: false }
  const [, base, publicPath] = m
  return {
    src: `${base}q_auto,vc_auto,w_1280,c_limit/${publicPath}.mp4`,
    poster: `${base}so_0.5,w_800,c_limit,q_auto/${publicPath}.jpg`,
    transcoded: true
  }
}
