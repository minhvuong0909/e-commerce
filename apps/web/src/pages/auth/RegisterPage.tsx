import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { toast } from 'sonner'
import Alert from '../../components/ui/Alert'
import Button from '../../components/ui/Button'
import DatePicker from '../../components/ui/DatePicker'
import Input from '../../components/ui/Input'
import { registerSchema, type RegisterFormValues } from '../../middlewares/auth.middlewares'
import { ROUTES } from '../../routes/route.paths'
import { registerApi } from '../../services/auths.services'

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
    } catch {
      toast.error('Đăng ký thất bại')
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <div className='mb-5'>
        <h2 className='text-2xl font-black tracking-tight text-ink-950'>Tạo tài khoản</h2>
        <p className='mt-2 text-sm leading-6 text-slate-500'>Lưu giỏ hàng, theo dõi đơn và nhận ưu đãi dành riêng cho bạn.</p>
      </div>

      <Alert variant='info' title='Lưu ý xác minh email' desc='Sau khi đăng ký, bạn cần xác minh email để sử dụng đầy đủ tính năng.' />

      <form className='mt-4 space-y-4' onSubmit={handleSubmit(onSubmit)}>
        <Input label='Họ và tên' placeholder='Nguyễn Văn A' {...register('name')} error={errors.name?.message} />

        <Input label='Email' type='email' placeholder='example@email.com' {...register('email')} error={errors.email?.message} />

        <div>
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
          {errors.date_of_birth ? <p className='mt-1 text-xs font-semibold text-rose-600'>{errors.date_of_birth.message}</p> : null}
        </div>

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

        <Button full type='submit' disabled={isSubmitting} loading={isSubmitting}>
          Đăng ký
        </Button>

        <p className='text-center text-sm text-slate-500'>
          Đã có tài khoản?{' '}
          <Link to={ROUTES.AUTH + ROUTES.LOGIN} className='font-black text-brand-600 hover:text-brand-900'>
            Đăng nhập
          </Link>
        </p>
      </form>
    </motion.div>
  )
}
