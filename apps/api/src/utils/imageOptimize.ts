import sharp from 'sharp'

/** Kích thước/chất lượng ảnh sản phẩm sau khi tối ưu. */
export const IMAGE_OPTIMIZE = {
  maxSide: 1200, // đủ nét cho khung ảnh lớn nhất trên màn hình retina
  quality: 80,
  maxInputPixels: 50_000_000 // chặn ảnh "bom giải nén" (vd 20000×20000)
} as const

export type OptimizedImage = { width: number; height: number; bytes: number }

/**
 * Chuẩn hóa ảnh upload: xoay theo EXIF, thu về tối đa 1200px (không phóng to ảnh nhỏ),
 * xuất WebP và bỏ metadata (EXIF/GPS của điện thoại không lọt ra ngoài).
 * Ném lỗi nếu input không phải ảnh mà sharp đọc được.
 */
export async function optimizeImage(input: string | Buffer, output: string): Promise<OptimizedImage> {
  const info = await sharp(input, { failOn: 'error', limitInputPixels: IMAGE_OPTIMIZE.maxInputPixels })
    .rotate()
    .resize({ width: IMAGE_OPTIMIZE.maxSide, height: IMAGE_OPTIMIZE.maxSide, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: IMAGE_OPTIMIZE.quality, effort: 4 })
    .toFile(output)
  return { width: info.width, height: info.height, bytes: info.size }
}
