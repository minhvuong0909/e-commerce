import { z } from 'zod'

export const registerSchema = z.object({
  name: z.string().trim().min(1, 'Vui lòng nhập họ và tên'),
  email: z.string().trim().min(1, 'Vui lòng nhập email').email('Email không hợp lệ'),
  password: z.string().min(8, 'Mật khẩu tối thiểu 8 ký tự').max(50, 'Mật khẩu tối đa 50 ký tự')
    .regex(/[a-z]/, 'Cần ít nhất một chữ thường')
    .regex(/[A-Z]/, 'Cần ít nhất một chữ hoa')
    .regex(/[0-9]/, 'Cần ít nhất một chữ số')
    .regex(/[^A-Za-z0-9]/, 'Cần ít nhất một ký tự đặc biệt')
})

export type RegisterFormValues = z.infer<typeof registerSchema>
