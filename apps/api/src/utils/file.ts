import fs from 'fs' // giúp thao tác file | folder
import { Request } from 'express'
// initFolder: hàm check xem có folder uploads ?
import { UPLOAD_IMAGE_DIR, UPLOAD_IMAGE_TEMP_DIR, UPLOAD_VIDEO_DIR } from '~/constants/dir'
import formidable, { File } from 'formidable'
import HTTP_STATUS from '~/constants/httpStatus'
import { ErrorWithStatus } from '~/models/Errors'

// nếu có thì xử lý và tạo giúp mình
export const initFolder = () => {
  ;[UPLOAD_IMAGE_DIR, UPLOAD_VIDEO_DIR].forEach((dir) => {
    // check nếu mà url kh dẫn đến thư mục thì mình tạo mới
    if (!fs.existsSync(UPLOAD_IMAGE_TEMP_DIR)) {
      fs.mkdirSync(UPLOAD_IMAGE_TEMP_DIR, {
        recursive: true // đệ quy
      }) // đợi nó tạo xong ròi xử lý tiếp
    }
  })
}

// handleUploadImage: hàm nhận vào req
// sau đó ép req đi qua formidable và return ra file ảnh
// sharp xử lý và nhận đc các file ảnh
export const handleUploadImage = async (req: Request) => {
  // check form có truyền lên hợp lệ ?
  const form = formidable({
    uploadDir: UPLOAD_IMAGE_TEMP_DIR,
    maxFields: 4, // tối đa 1 file
    maxFiles: 4,
    maxFileSize: 300 * 1024, // 300KB
    maxTotalFileSize: 1200 * 1024, // 1,2MB
    keepExtensions: true, // giữ lại đuôi file khi req upload
    filter: ({
      name,
      originalFilename,
      mimetype
      // name là tên chứa field của file trong form input (html)
      // originalFilename: tên gốc của file
      // mimeType: kiểu của file 'video/mp4' || 'image/jpeg'
    }) => {
      const valid = name === 'image' && Boolean(mimetype?.includes('image')) // check mimetype có phải là image không
      if (!valid) {
        form.emit('error' as any, new Error('File Type Invalid') as any) // hiển thị sự kiện trên form
      }
      return valid
    }
  })

  // parse form, file
  return new Promise<File[]>((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) return reject(err)
      if (!files.image) {
        return reject(new Error('Image is empty'))
      }
      return resolve(files.image as File[])
    })
  })
}

export const VIDEO_MAX_BYTES = 50 * 1024 * 1024
const VIDEO_MIME_EXT: Record<string, 'mp4' | 'webm' | 'mov'> = {
  'video/mp4': 'mp4',
  'video/webm': 'webm',
  'video/quicktime': 'mov'
}

/**
 * Nhận diện video theo chữ ký file (không tin mimetype/đuôi do client gửi):
 * MP4/MOV có hộp `ftyp` ở byte 4, WebM bắt đầu bằng EBML 1A 45 DF A3.
 */
export function detectVideoExt(head: Buffer): 'mp4' | 'webm' | 'mov' | null {
  if (head.length >= 12 && head.toString('latin1', 4, 8) === 'ftyp') {
    return head.toString('latin1', 8, 10) === 'qt' ? 'mov' : 'mp4'
  }
  if (head.length >= 4 && head.readUInt32BE(0) === 0x1a45dfa3) return 'webm'
  return null
}

const uploadError = (message: string, status: number = HTTP_STATUS.BAD_REQUEST) => new ErrorWithStatus({ message, status })
const removeQuietly = (filepath: string) => fs.promises.unlink(filepath).catch(() => undefined)

// hàm upload video: 1 file, field "video", tối đa 50MB, chỉ mp4/webm/mov
export const handleUploadVideo = async (req: Request) => {
  await fs.promises.mkdir(UPLOAD_VIDEO_DIR, { recursive: true })
  let rejectedType = false
  const form = formidable({
    uploadDir: UPLOAD_VIDEO_DIR,
    maxFiles: 1,
    maxFields: 2,
    maxFileSize: VIDEO_MAX_BYTES,
    filter: ({ name, mimetype }) => {
      const valid = name === 'video' && Boolean(mimetype && VIDEO_MIME_EXT[mimetype])
      if (!valid) rejectedType = true
      return valid
    }
  })

  const files = await new Promise<File[]>((resolve, reject) => {
    form.parse(req, (err, _fields, parsed) => {
      const received = (parsed?.video as File[] | undefined) ?? []
      if (err) {
        received.forEach((f) => removeQuietly(f.filepath))
        const tooBig = (err as { httpCode?: number }).httpCode === 413 || /maxFileSize|maxTotalFileSize/i.test(String(err.message))
        return reject(tooBig ? uploadError('Video tối đa 50MB.', 413) : uploadError('Không đọc được file video.'))
      }
      if (!received.length) return reject(uploadError(rejectedType ? 'Chỉ hỗ trợ video MP4, WebM hoặc MOV.' : 'Chưa chọn video.'))
      resolve(received)
    })
  })

  return Promise.all(
    files.map(async (video) => {
      const handle = await fs.promises.open(video.filepath, 'r')
      const head = Buffer.alloc(16)
      await handle.read(head, 0, 16, 0).finally(() => handle.close())
      const ext = detectVideoExt(head)
      if (!ext) {
        await removeQuietly(video.filepath)
        throw uploadError('File không phải video MP4, WebM hoặc MOV hợp lệ.')
      }
      const finalPath = `${video.filepath}.${ext}`
      await fs.promises.rename(video.filepath, finalPath)
      video.filepath = finalPath
      video.newFilename = `${video.newFilename}.${ext}`
      return video
    })
  )
}
// hàm lấy tên file
export const getNameFormFullNameFile = (filename: string) => {
  // abc.png => adc
  const nameArr = filename.split('.')
  nameArr.pop() // xóa cuối
  return nameArr.join('-') // như slug
}

// hàm lấy extension của video
export const getExtension = (filename: string) => {
  // adc.mp4 => mp4
  const nameArr = filename.split('.')
  return nameArr[nameArr.length - 1]
}
