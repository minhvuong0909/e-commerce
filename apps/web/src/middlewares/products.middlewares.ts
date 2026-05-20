import { z } from 'zod'

const optionalNumber = (message: string) =>
  z.preprocess((value) => {
    if (value === '' || value === undefined || value === null) {
      return undefined
    }

    if (typeof value === 'number' && Number.isNaN(value)) {
      return undefined
    }

    return value
  }, z.coerce.number().min(0, message).optional())

const mediaSchema = z.object({
  url: z.string(),
  type: z.number()
})

export const createProductSchema = z.object({
  name: z.string().trim().min(1, 'Vui lòng nhập tên sản phẩm'),

  price: z.coerce.number().min(0, 'Giá phải lớn hơn hoặc bằng 0'),

  quantity: z.coerce.number().int('Tồn kho phải là số nguyên').min(0, 'Tồn kho phải lớn hơn hoặc bằng 0'),

  description: z.string().trim().min(1, 'Vui lòng nhập mô tả sản phẩm'),

  rating_number: z.coerce.number().optional().default(0),

  medias: z.array(mediaSchema).default([]),

  origin: z.string().trim().min(1, 'Vui lòng nhập xuất xứ'),

  brand_id: z.string().trim().min(1, 'Vui lòng nhập thương hiệu'),

  volume: optionalNumber('Volume phải lớn hơn hoặc bằng 0'),

  weight: optionalNumber('Weight phải lớn hơn hoặc bằng 0'),

  width: optionalNumber('Width phải lớn hơn hoặc bằng 0'),

  height: optionalNumber('Height phải lớn hơn hoặc bằng 0'),

  category_id: z.string().trim().min(1, 'Vui lòng nhập danh mục sản phẩm')
})

export type CreateProductFormInput = z.input<typeof createProductSchema>
export type CreateProductFormValues = z.output<typeof createProductSchema>

export default mediaSchema
