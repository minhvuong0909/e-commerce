import { Request } from 'express'
import { UPLOAD_IMAGE_DIR } from '~/constants/dir'
import fs from 'fs'
import path from 'path'
import { getNameFormFullNameFile, handleUploadImage, handleUploadVideo, removeQuietly, uploadError } from '~/utils/file'
import { optimizeImage } from '~/utils/imageOptimize'
import { Media } from '~/models/Other'
import { MediaType } from '~/constants/enums'
import { cleanupTempFolder } from '~/utils/cleanupTemp'
import { fetchWithTimeout, HTTP_TIMEOUTS } from '~/utils/http'
class MediaServices {
  private async uploadToCloudinary(filePath: string, folder: string, resource: 'image' | 'video' = 'image') {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim()
    const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET?.trim()
    if (!cloudName || !uploadPreset) return null

    const form = new FormData()
    const bytes = await fs.promises.readFile(filePath)
    form.append('file', new Blob([bytes]), path.basename(filePath))
    form.append('upload_preset', uploadPreset)
    form.append('folder', folder)

    const res = await fetchWithTimeout(
      `https://api.cloudinary.com/v1_1/${cloudName}/${resource}/upload`,
      { method: 'POST', body: form },
      { timeoutMs: resource === 'video' ? HTTP_TIMEOUTS.mediaUpload * 4 : HTTP_TIMEOUTS.mediaUpload, service: 'cloudinary' }
    )
    if (!res.ok) {
      throw new Error(`Cloudinary upload failed: ${res.status}`)
    }
    const data = await res.json()
    return data.secure_url as string
  }

  // ảnh: nén + thu nhỏ + WebP bằng sharp (utils/imageOptimize.ts), rồi đẩy Cloudinary nếu có cấu hình
  async hanleUploadImage(req: Request) {
    const files = await handleUploadImage(req)
    await fs.promises.mkdir(UPLOAD_IMAGE_DIR, { recursive: true })
    const apiBase = (process.env.API_URL || process.env.HOST || `http://localhost:${process.env.PORT || 3000}`).replace(/\/+$/, '')
    try {
      return await Promise.all(
        files.map(async (file) => {
          const newFilename = `${getNameFormFullNameFile(file.newFilename) || file.newFilename}.webp`
          const newPath = path.join(UPLOAD_IMAGE_DIR, newFilename)
          try {
            // đọc vào buffer: sharp không giữ handle file gốc nên xóa file tạm được ngay (Windows)
            await optimizeImage(await fs.promises.readFile(file.filepath), newPath)
          } catch {
            await removeQuietly(newPath)
            throw uploadError('File không phải ảnh hợp lệ hoặc định dạng chưa hỗ trợ (dùng JPG, PNG, WebP).')
          }
          const cloudinaryUrl = await this.uploadToCloudinary(newPath, process.env.CLOUDINARY_FOLDER || 'vibrant-mart/products').catch(
            (err) => {
              console.error('Cloudinary upload error:', err?.message || err)
              return null
            }
          )
          const url: Media = {
            url: cloudinaryUrl || `${apiBase}/static/image/${newFilename}`,
            type: MediaType.Image
          }
          return url
        })
      )
    } finally {
      // ảnh gốc (có thể vài MB) chỉ cần trong lúc xử lý
      await Promise.all(files.map((f) => removeQuietly(f.filepath)))
      cleanupTempFolder()
    }
  }

  async handleUploadVideo(req: Request) {
    const files = await handleUploadVideo(req)
    const apiBase = (process.env.API_URL || process.env.HOST || `http://localhost:${process.env.PORT || 3000}`).replace(/\/+$/, '')
    return Promise.all(
      files.map(async (file) => {
        const cloudinaryUrl = await this.uploadToCloudinary(
          file.filepath,
          process.env.CLOUDINARY_VIDEO_FOLDER || 'vibrant-mart/videos',
          'video'
        ).catch((err) => {
          console.error('Cloudinary video upload error:', err?.message || err)
          return null
        })
        if (cloudinaryUrl) await fs.promises.unlink(file.filepath).catch(() => undefined)
        const url: Media = {
          url: cloudinaryUrl || `${apiBase}/static/video/${file.newFilename}`,
          type: MediaType.Video
        }
        return url
      })
    )
  }
}

let mediaServices = new MediaServices()
export default mediaServices
