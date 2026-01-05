// file này dùng để lưu các url của file nhận từ request
import path from 'path'
// khi client upload image lên ta sẽ lưu tạm vào temp để sharp xử lý xong ròi mới lưu vào uploads
export const UPLOAD_IMAGE_TEMP_DIR = path.resolve('uploads/image/temp')
export const UPLOAD_IMAGE_DIR = path.resolve('uploads/image')
export const UPLOAD_VIDEO_DIR = path.resolve('uploads/video')
