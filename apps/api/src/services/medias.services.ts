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

        // chạy mỗi 5 phút
        setInterval(cleanupTempFolder, 5 * 60 * 1000) // này sẽ dọn trong folder tmp
        // console.log('File path: ' + file.filepath)

        // console.log('image comprise: ' + infor)

        // xóa file cũ
        // const isDel = fs.unlinkSync(file.filepath)
        // console.log('Deleted: ' + Boolean(isDel))

        // return ra url cho ngta truy cập ảnh
        const url: Media = {
          url: isProduction
            ? `${process.env.HOST}/static/image/${newFilename}`
            : `http://localhost:${process.env.PORT}/static/image/${newFilename}`,
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
        const url: Media = {
          url: isProduction
            ? `${process.env.HOST}/static/video/${file.newFilename}`
            : `http://localhost:${process.env.PORT}/static/video/${file.newFilename}`,
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
