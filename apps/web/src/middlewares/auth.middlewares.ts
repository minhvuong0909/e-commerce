import { z } from 'zod'

export const registerSchema = z
  .object({
    name: z.string().min(1, 'Vui lòng nhập họ và tên'),

    email: z.string().min(1, 'Vui lòng nhập email').email('Email không hợp lệ'),

    password: z.string().min(8, 'Mật khẩu tối thiểu 8 ký tự'),

    confirm_password: z.string(),

    date_of_birth: z.string().min(1, 'Vui lòng chọn ngày sinh')
  })
  .refine((data) => data.password === data.confirm_password, {
    message: 'Mật khẩu không khớp',
    path: ['confirm_password']
  })

export type RegisterFormValues = z.infer<typeof registerSchema>
