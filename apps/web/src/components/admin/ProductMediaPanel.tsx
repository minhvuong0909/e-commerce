import { useRef, type ChangeEvent } from 'react'
import { Film, ImagePlus, RefreshCw, Trash2 } from 'lucide-react'
import {
  formatBytes,
  IMAGE_MAX_BYTES,
  MAX_IMAGES,
  VIDEO_ACCEPT,
  VIDEO_MAX_BYTES,
  type ProductMediaState
} from '../../hooks/useProductMedia'
import { formatImageUrl } from '../../utils/formatImageUrl'

const removeBtn =
  'absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-white/95 text-rose-600 shadow-sm transition sm:opacity-0 sm:group-hover:opacity-100 focus-visible:opacity-100'

/** Khối quản lý ảnh + video giới thiệu cho form tạo/sửa sản phẩm. */
export default function ProductMediaPanel({
  media,
  onError,
  disabled
}: {
  media: ProductMediaState
  onError: (message: string) => void
  disabled?: boolean
}) {
  const imageInput = useRef<HTMLInputElement>(null)
  const videoInput = useRef<HTMLInputElement>(null)

  const pickImages = (e: ChangeEvent<HTMLInputElement>) => {
    const err = media.addImages(Array.from(e.target.files || []))
    onError(err ?? '')
    e.target.value = ''
  }
  const pickVideo = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) onError(media.setVideoFile(file) ?? '')
    e.target.value = ''
  }

  const tiles = [
    ...media.images.map((url) => ({ key: url, src: formatImageUrl(url), remove: () => media.removeImage(url), isNew: false })),
    ...media.pending.map((p) => ({ key: p.id, src: p.preview, remove: () => media.removePending(p.id), isNew: true }))
  ]
  const video = media.video
  const uploading = media.videoProgress !== null

  return (
    <div className='space-y-6'>
      {/* ảnh */}
      <div>
        <div className='flex items-baseline justify-between gap-3'>
          <h3 className='text-base font-black text-ink-950'>Ảnh sản phẩm</h3>
          <span className='text-xs font-semibold text-ink-500'>
            {media.imageCount}/{MAX_IMAGES}
          </span>
        </div>
        <p className='mt-1 text-xs text-ink-500'>Ảnh đầu tiên làm ảnh bìa · tối đa {formatBytes(IMAGE_MAX_BYTES)} mỗi ảnh, hệ thống tự nén khi tải lên.</p>

        <div className='mt-3 grid grid-cols-3 gap-2'>
          {tiles.map((t, i) => (
            <div key={t.key} className='group relative aspect-square overflow-hidden rounded-2xl border border-ink-200 bg-ink-50'>
              {t.src ? <img src={t.src} alt='' referrerPolicy='no-referrer' className='h-full w-full object-cover' /> : null}
              {i === 0 ? <span className='absolute bottom-1.5 left-1.5 rounded-full bg-white/95 px-2 py-0.5 text-[10px] font-bold text-ink-700'>Ảnh bìa</span> : null}
              {t.isNew ? <span className='absolute left-1.5 top-1.5 rounded-full bg-berry-600 px-2 py-0.5 text-[10px] font-bold text-white'>Mới</span> : null}
              <button type='button' onClick={t.remove} disabled={disabled} className={removeBtn} aria-label='Xóa ảnh'>
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          {media.imageCount < MAX_IMAGES ? (
            <button
              type='button'
              onClick={() => imageInput.current?.click()}
              disabled={disabled}
              className='flex aspect-square flex-col items-center justify-center gap-1 rounded-2xl border border-dashed border-ink-300 bg-ink-50 text-ink-500 transition hover:border-berry-300 hover:bg-berry-50 hover:text-berry-700 disabled:opacity-50'
            >
              <ImagePlus size={22} />
              <span className='text-xs font-bold'>Thêm ảnh</span>
            </button>
          ) : null}
        </div>
        <input ref={imageInput} type='file' hidden multiple accept='image/*' onChange={pickImages} />
      </div>

      {/* video */}
      <div>
        <h3 className='text-base font-black text-ink-950'>Video giới thiệu</h3>
        <p className='mt-1 text-xs text-ink-500'>MP4, WebM hoặc MOV · tối đa {formatBytes(VIDEO_MAX_BYTES)} · 1 video, hiện cuối thư viện ảnh.</p>

        {video ? (
          <div className='mt-3 overflow-hidden rounded-2xl border border-ink-200 bg-white'>
            <video
              key={video.kind === 'new' ? video.preview : video.url}
              src={video.kind === 'new' ? video.preview : formatImageUrl(video.url)}
              controls
              preload='metadata'
              playsInline
              className='aspect-video w-full bg-ink-950 object-contain'
            />
            <div className='flex flex-wrap items-center justify-between gap-2 p-3'>
              <span className='min-w-0 truncate text-xs font-semibold text-ink-600'>
                {video.kind === 'new' ? `${video.file.name} · ${formatBytes(video.file.size)} · chưa lưu` : 'Video hiện tại'}
              </span>
              <div className='flex gap-2'>
                <button
                  type='button'
                  onClick={() => videoInput.current?.click()}
                  disabled={disabled || uploading}
                  className='inline-flex h-9 items-center gap-1.5 rounded-full border border-ink-200 px-3 text-xs font-bold text-ink-700 transition hover:bg-ink-50 disabled:opacity-50'
                >
                  <RefreshCw size={13} /> Thay video
                </button>
                <button
                  type='button'
                  onClick={media.removeVideo}
                  disabled={disabled || uploading}
                  className='inline-flex h-9 items-center gap-1.5 rounded-full border border-rose-200 px-3 text-xs font-bold text-rose-600 transition hover:bg-rose-50 disabled:opacity-50'
                >
                  <Trash2 size={13} /> Xóa
                </button>
              </div>
            </div>
            {uploading ? (
              <div className='px-3 pb-3' role='status' aria-live='polite'>
                <div className='h-2 overflow-hidden rounded-full bg-ink-100'>
                  <div className='h-full rounded-full bg-berry-600 transition-[width]' style={{ width: `${media.videoProgress}%` }} />
                </div>
                <p className='mt-1 text-xs font-semibold text-ink-600'>Đang tải video lên… {media.videoProgress}%</p>
              </div>
            ) : null}
          </div>
        ) : (
          <button
            type='button'
            onClick={() => videoInput.current?.click()}
            disabled={disabled}
            className='mt-3 flex h-28 w-full flex-col items-center justify-center gap-1.5 rounded-2xl border border-dashed border-ink-300 bg-ink-50 text-ink-500 transition hover:border-berry-300 hover:bg-berry-50 hover:text-berry-700 disabled:opacity-50'
          >
            <Film size={24} />
            <span className='text-sm font-bold'>Thêm video</span>
          </button>
        )}
        <input ref={videoInput} type='file' hidden accept={VIDEO_ACCEPT} onChange={pickVideo} />
      </div>
    </div>
  )
}
