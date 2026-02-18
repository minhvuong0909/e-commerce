import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Alert from '../../components/ui/Alert'
import { registerApi } from '../../services/auths.services'
import { toast } from 'sonner'
import { ROUTES } from '../../routes/route.paths'
import DatePicker from '../../components/ui/DatePicker'

import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { registerSchema, type RegisterFormValues } from '../../middlewares/auth.middlewares'

export default function RegisterPage() {
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting }
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange'
  })

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      await registerApi(data)

      toast.success('Đăng ký thành công! Vui lòng kiểm tra email.')
      setTimeout(() => {
        navigate(ROUTES.AUTH + ROUTES.LOGIN)
      }, 1500)
    } catch (error) {
      toast.error('Đăng ký thất bại')
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <div className='mb-5'>
        <h2 className='text-2xl font-extrabold text-white'>Tạo tài khoản</h2>
      </div>

      <Alert variant='info' title='Lưu ý xác minh email' desc='Sau khi đăng ký, bạn cần xác minh email.' />

      <form className='mt-4 space-y-4' onSubmit={handleSubmit(onSubmit)}>
        <Input label='Họ và tên' placeholder='Nguyễn Văn A' {...register('name')} error={errors.name?.message} />

        <Input
          label='Email'
          type='email'
          placeholder='example@email.com'
          {...register('email')}
          error={errors.email?.message}
        />

        {/* DatePicker dùng Controller */}
        <Controller
          name='date_of_birth'
          control={control}
          render={({ field }) => (
            <DatePicker
              label='Ngày sinh'
              value={field.value ? new Date(field.value) : null}
              onChange={(date) => field.onChange(date ? format(date, 'yyyy-MM-dd') : '')}
            />
          )}
        />
        {errors.date_of_birth && <p className='text-sm text-red-400'>{errors.date_of_birth.message}</p>}

        <Input
          label='Mật khẩu'
          type='password'
          placeholder='Tối thiểu 8 ký tự'
          {...register('password')}
          error={errors.password?.message}
        />

        <Input
          label='Nhập lại mật khẩu'
          type='password'
          placeholder='Nhập lại mật khẩu'
          {...register('confirm_password')}
          error={errors.confirm_password?.message}
        />

        <Button full type='submit' variant='gradient' disabled={isSubmitting}>
          {isSubmitting ? 'Đang đăng ký...' : 'Đăng ký'}
        </Button>

        <p className='text-center text-sm text-white/65'>
          Đã có tài khoản?{' '}
          <Link to={ROUTES.AUTH + ROUTES.LOGIN} className='font-semibold text-orange-300 hover:underline'>
            Đăng nhập
          </Link>
        </p>
      </form>
    </motion.div>
  )
}
