import { Request } from 'express'
import { UPLOAD_IMAGE_DIR } from '~/constants/dir'
import fs from 'fs'
import { getNameFormFullNameFile, handleUploadImage, handleUploadVideo } from '~/utils/file'
import sharp from 'sharp'
import { Media } from '~/models/Other'
import { isProduction } from '~/config/config'
import { MediaType } from '~/constants/enums'
import { cleanupTempFolder } from '~/utils/cleanupTemp'
class MediaServices {
  private async uploadToCloudinary(filePath: string, folder: string) {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim()
    const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET?.trim()
    if (!cloudName || !uploadPreset) return null

    const form = new FormData()
    const bytes = await fs.promises.readFile(filePath)
    form.append('file', new Blob([bytes]), 'image.jpg')
    form.append('upload_preset', uploadPreset)
    form.append('folder', folder)

    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: form
    })
    if (!res.ok) {
      throw new Error(`Cloudinary upload failed: ${res.status}`)
    }
    const data = await res.json()
    return data.secure_url as string
  }

  // sharp sẽ xử lý trong service
  async hanleUploadImage(req: Request) {
    // lấy file từ req đã lọc qua formidable
    const files = await handleUploadImage(req)
    const result = await Promise.all(
      files.map(async (file) => {
        // upload file sau đó xóa đuôi + .jpg
        const newFilename = getNameFormFullNameFile(file.newFilename) + '.jpg'
        const newPath = UPLOAD_IMAGE_DIR + '/' + newFilename
        // gọi sharp để nén
        const infor = await sharp(file.filepath).rotate().jpeg().toFile(newPath)

        // Dọn dẹp file tạm sau khi xử lý xong (không dùng setInterval trong vòng lặp để tránh memory leak)
        cleanupTempFolder()
        // console.log('File path: ' + file.filepath)

        // console.log('image comprise: ' + infor)

        // xóa file cũ
        // const isDel = fs.unlinkSync(file.filepath)
        // console.log('Deleted: ' + Boolean(isDel))

        // return ra url cho ngta truy cập ảnh
        const apiBase = (process.env.API_URL || process.env.HOST || `http://localhost:${process.env.PORT || 3000}`).replace(/\/+$/, '')
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
    return result
  }

  async handleUploadVideo(req: Request) {
    const files = await handleUploadVideo(req) // lấy file trong req
    const result = await Promise.all(
      files.map(async (file) => {
        // trả ra link
        const apiBase = (process.env.API_URL || process.env.HOST || `http://localhost:${process.env.PORT || 3000}`).replace(/\/+$/, '')
        const url: Media = {
          url: `${apiBase}/static/video/${file.newFilename}`,
          type: MediaType.Video
        }
        return url
      })
    )
    return result
  }
}

let mediaServices = new MediaServices()
export default mediaServices
