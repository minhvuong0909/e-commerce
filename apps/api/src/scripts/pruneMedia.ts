import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'
import { UPLOAD_IMAGE_DIR, UPLOAD_VIDEO_DIR } from '~/constants/dir'
import databaseService from '~/services/database.service'
import { isMediaReferenced, MediaRef } from '~/utils/mediaCleanup'

dotenv.config()

/**
 * Quét uploads/image + uploads/video, tìm file không còn sản phẩm/cài đặt/avatar nào dùng
 * (ảnh tải lên rồi bỏ form, file còn sót từ trước khi có dọn tự động…).
 *
 *   npx ts-node src/scripts/pruneMedia.ts            → chỉ liệt kê (mặc định, không xóa gì)
 *   npx ts-node src/scripts/pruneMedia.ts --apply    → xóa thật
 *   --min-age-hours=24                               → bỏ qua file mới hơn (đang chờ admin bấm Lưu)
 *
 * Nhớ trỏ DATABASE_URL/DB_NAME đúng DB mà thư mục uploads này phục vụ.
 */
async function main() {
  const apply = process.argv.includes('--apply')
  const ageArg = process.argv.find((a) => a.startsWith('--min-age-hours='))
  const minAgeHours = ageArg ? Number(ageArg.split('=')[1]) : 24
  if (!Number.isFinite(minAgeHours) || minAgeHours < 0) throw new Error('--min-age-hours phải là số ≥ 0')
  const cutoff = Date.now() - minAgeHours * 3600_000

  await databaseService.connect()
  let unused = 0
  let bytes = 0
  for (const [kind, dir] of [
    ['image', UPLOAD_IMAGE_DIR],
    ['video', UPLOAD_VIDEO_DIR]
  ] as const) {
    if (!fs.existsSync(dir)) continue
    for (const entry of await fs.promises.readdir(dir, { withFileTypes: true })) {
      if (!entry.isFile() || entry.name.startsWith('.')) continue // bỏ qua temp/ và .gitkeep
      const filePath = path.join(dir, entry.name)
      const stat = await fs.promises.stat(filePath)
      if (stat.mtimeMs > cutoff) continue
      const ref: MediaRef = { kind: 'local', key: `${kind}/${entry.name}`, filePath }
      if (await isMediaReferenced(ref)) continue
      unused++
      bytes += stat.size
      if (apply) await fs.promises.unlink(filePath)
      console.log(`${apply ? 'đã xóa ' : 'không dùng'}  ${ref.key}  (${(stat.size / 1024).toFixed(0)} KB)`)
    }
  }
  const mb = (bytes / 1024 / 1024).toFixed(1)
  console.log(
    unused === 0
      ? 'Không có file thừa.'
      : apply
        ? `Đã xóa ${unused} file, giải phóng ${mb} MB.`
        : `${unused} file không dùng (${mb} MB). Chạy lại với --apply để xóa.`
  )
}

main()
  .catch((err) => {
    console.error(err?.message || err)
    process.exitCode = 1
  })
  .finally(() => databaseService.close())
