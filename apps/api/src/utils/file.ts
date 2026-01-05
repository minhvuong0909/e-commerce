import fs from 'fs' // giúp thao tác file | folder
import { Request } from 'express'
// initFolder: hàm check xem có folder uploads ?
import { UPLOAD_IMAGE_DIR, UPLOAD_IMAGE_TEMP_DIR, UPLOAD_VIDEO_DIR } from '~/constants/dir'
import formidable, { File } from 'formidable'

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
      return resolve(files.image)
    })
  })
}

// hàm lấy tên file
export const getNameFormFullNameFile = (filename: string) => {
  // abc.png => adc
  const nameArr = filename.split('.')
  nameArr.pop() // xóa cuối
  return nameArr.join('-') // như slug
}
