import { useEffect, useRef, useState } from 'react'
import { uploadImageApi, uploadVideoApi } from '../services/medias.services'
import type { Product } from '../models/ProductRequests'

/** Khớp enum MediaType ở backend. */
export const MEDIA_TYPE = { IMAGE: 0, VIDEO: 1 } as const
export const IMAGE_MAX_BYTES = 300 * 1024 // giới hạn của /medias/upload-image
export const VIDEO_MAX_BYTES = 50 * 1024 * 1024 // giới hạn của /medias/upload-video
export const VIDEO_ACCEPT = 'video/mp4,video/webm,video/quicktime'
const VIDEO_TYPES = VIDEO_ACCEPT.split(',')
export const MAX_IMAGES = 11 // backend cho tối đa 12 media, chừa 1 chỗ cho video

export type SavedMedia = { url: string; type: number }
export type PendingImage = { id: string; file: File; preview: string }
export type VideoState = { kind: 'existing'; url: string } | { kind: 'new'; file: File; preview: string } | null

export const formatBytes = (n: number) => (n >= 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)}MB` : `${Math.round(n / 1024)}KB`)

/** API trả { url: [{ url, type }] }; chấp nhận cả dạng cũ (chuỗi / object) cho chắc. */
function uploadedUrl(data: unknown): string {
  const raw = (data as { url?: unknown })?.url
  const first = Array.isArray(raw) ? raw[0] : raw
  if (typeof first === 'string') return first
  return (first as { url?: string } | undefined)?.url || ''
}

function initialImages(product?: Product): string[] {
  const urls = (product?.medias ?? [])
    .filter((m) => typeof m === 'string' || m?.type !== MEDIA_TYPE.VIDEO)
    .map((m) => (typeof m === 'string' ? m : m?.url))
    .filter((u): u is string => Boolean(u))
  return Array.from(new Set(urls))
}

/** State + upload cho ảnh và video của một sản phẩm (dùng ở trang tạo và sửa). */
export function useProductMedia(product?: Product) {
  const [images, setImages] = useState<string[]>(() => initialImages(product))
  const [pending, setPending] = useState<PendingImage[]>([])
  const [video, setVideo] = useState<VideoState>(() => (product?.video ? { kind: 'existing', url: product.video } : null))
  const [videoProgress, setVideoProgress] = useState<number | null>(null)

  // giải phóng object URL của preview khi rời trang
  const previews = useRef(new Set<string>())
  useEffect(() => {
    const set = previews.current
    return () => set.forEach((u) => URL.revokeObjectURL(u))
  }, [])
  const makePreview = (file: File) => {
    const url = URL.createObjectURL(file)
    previews.current.add(url)
    return url
  }
  const dropPreview = (url: string) => {
    URL.revokeObjectURL(url)
    previews.current.delete(url)
  }

  const imageCount = images.length + pending.length

  /** Trả về thông báo lỗi (nếu có file bị bỏ qua) để trang hiển thị. */
  const addImages = (files: File[]): string | null => {
    const notImage = files.filter((f) => !f.type.startsWith('image/'))
    const tooBig = files.filter((f) => f.type.startsWith('image/') && f.size > IMAGE_MAX_BYTES)
    const ok = files.filter((f) => f.type.startsWith('image/') && f.size <= IMAGE_MAX_BYTES).slice(0, Math.max(0, MAX_IMAGES - imageCount))
    setPending((prev) => [
      ...prev,
      ...ok.map((file) => ({ id: `${file.name}-${file.lastModified}-${Math.random()}`, file, preview: makePreview(file) }))
    ])
    if (tooBig.length) return `Ảnh tối đa ${formatBytes(IMAGE_MAX_BYTES)}: ${tooBig.map((f) => `${f.name} (${formatBytes(f.size)})`).join(', ')}.`
    if (notImage.length) return 'Chỉ chọn file ảnh ở mục này.'
    if (ok.length < files.length - tooBig.length - notImage.length) return `Tối đa ${MAX_IMAGES} ảnh cho một sản phẩm.`
    return null
  }

  const removeImage = (url: string) => setImages((prev) => prev.filter((u) => u !== url))
  const removePending = (id: string) =>
    setPending((prev) => {
      const item = prev.find((p) => p.id === id)
      if (item) dropPreview(item.preview)
      return prev.filter((p) => p.id !== id)
    })

  const setVideoFile = (file: File): string | null => {
    if (!VIDEO_TYPES.includes(file.type)) return 'Chỉ hỗ trợ video MP4, WebM hoặc MOV.'
    if (file.size > VIDEO_MAX_BYTES) return `Video tối đa ${formatBytes(VIDEO_MAX_BYTES)} (file này ${formatBytes(file.size)}).`
    setVideo((prev) => {
      if (prev?.kind === 'new') dropPreview(prev.preview)
      return { kind: 'new', file, preview: makePreview(file) }
    })
    return null
  }

  const removeVideo = () =>
    setVideo((prev) => {
      if (prev?.kind === 'new') dropPreview(prev.preview)
      return null
    })

  /** Upload phần mới rồi trả danh sách media cuối cùng để gửi kèm sản phẩm. */
  const uploadAll = async (): Promise<SavedMedia[]> => {
    const uploaded = await Promise.all(
      pending.map(async (item) => {
        const fd = new FormData()
        fd.append('image', item.file)
        const url = uploadedUrl((await uploadImageApi(fd)).data)
        if (!url) throw new Error(`Không lấy được đường dẫn ảnh ${item.file.name}.`)
        return url
      })
    )
    let videoUrl: string | null = null
    if (video?.kind === 'existing') videoUrl = video.url
    if (video?.kind === 'new') {
      const fd = new FormData()
      fd.append('video', video.file)
      setVideoProgress(0)
      try {
        videoUrl = uploadedUrl((await uploadVideoApi(fd, setVideoProgress)).data)
      } finally {
        setVideoProgress(null)
      }
      if (!videoUrl) throw new Error('Không lấy được đường dẫn video.')
    }
    const medias: SavedMedia[] = [...images, ...uploaded].map((url) => ({ url, type: MEDIA_TYPE.IMAGE }))
    if (videoUrl) medias.push({ url: videoUrl, type: MEDIA_TYPE.VIDEO })
    return medias
  }

  const reset = () => {
    pending.forEach((p) => dropPreview(p.preview))
    if (video?.kind === 'new') dropPreview(video.preview)
    setImages(initialImages(product))
    setPending([])
    setVideo(product?.video ? { kind: 'existing', url: product.video } : null)
  }

  return { images, pending, video, videoProgress, imageCount, addImages, removeImage, removePending, setVideoFile, removeVideo, uploadAll, reset }
}

export type ProductMediaState = ReturnType<typeof useProductMedia>
