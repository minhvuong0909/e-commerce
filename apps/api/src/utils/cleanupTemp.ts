import fs from 'fs'
import path from 'path'
import { UPLOAD_IMAGE_TEMP_DIR } from '~/constants/dir'

const TEMP_DIR = path.resolve(UPLOAD_IMAGE_TEMP_DIR)
const MAX_AGE = 10 * 60 * 1000 // 10 phút

export function cleanupTempFolder() {
  if (!fs.existsSync(TEMP_DIR)) return

  const now = Date.now()

  fs.readdir(TEMP_DIR, (err, files) => {
    if (err) return

    files.forEach((file) => {
      const filePath = path.join(TEMP_DIR, file)

      fs.stat(filePath, (err, stat) => {
        if (err) return

        const age = now - stat.mtimeMs

        if (age > MAX_AGE) {
          fs.unlink(filePath, (err) => {
            if (!err) {
              console.log('🧹 Deleted temp file:', file)
            }
          })
        }
      })
    })
  })
}
