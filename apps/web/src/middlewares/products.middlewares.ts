import { z } from 'zod'

export const createProductSchema = z.object({
  name: z.string().min(1, 'Vui lòng nhập tên sản phẩm'),
  price: z.number().min(0, 'Giá sản phẩm phải lớn hơn hoặc bằng 0'),
  quantity: z.number().min(0, 'Số lượng phải lớn hơn hoặc bằng 0'),
  description: z.string().min(1, 'Vui lòng nhập mô tả sản phẩm'),
  origin: z.string().min(1, 'Vui lòng nhập xuất xứ sản phẩm'),
  brand_id: z.string().min(1, 'Vui lòng chọn thương hiệu'),
  category_id: z.string().min(1, 'Vui lòng chọn danh mục'),
  ship_category_id: z.string().min(1, 'Vui lòng chọn danh mục vận chuyển'),
  volume: z.number().optional(),
  weight: z.number().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  medias: z
    .array(
      z.object({
        url: z.string().min(1, 'Vui lòng nhập URL hình ảnh'),
        type: z.number().min(0, 'Loại hình ảnh không hợp lệ')
      })
    )
    .min(1, 'Vui lòng thêm ít nhất một hình ảnh')
})
