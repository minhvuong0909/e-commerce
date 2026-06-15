import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { toast } from 'sonner'
import Alert from '../../components/ui/Alert'
import Button from '../../components/ui/Button'
import DatePicker from '../../components/ui/DatePicker'
import Input from '../../components/ui/Input'
import PasswordStrength from '../../components/ui/PasswordStrength'
import { registerSchema, type RegisterFormValues } from '../../middlewares/auth.middlewares'
import { ROUTES } from '../../routes/route.paths'
import { registerApi } from '../../services/auths.services'
import { parseLocalDateString } from '../../utils/date'

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

  const passwordValue = useWatch({ control, name: 'password' }) || ''

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      const res = await registerApi(data)
      const emailSent = res.data?.data?.email_sent !== false

      if (emailSent) {
        toast.success('Đăng ký thành công! Vui lòng kiểm tra email.')
      } else {
        toast.warning('Tài khoản đã tạo nhưng chưa gửi được email xác minh. Vui lòng dùng chức năng gửi lại email.')
      }
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

      <form className='mt-4 space-y-4' onSubmit={handleSubmit(onSubmit)} noValidate>
        <Input
          label='Họ và tên'
          placeholder='Nguyễn Văn A'
          autoComplete='name'
          {...register('name')}
          error={errors.name?.message}
        />

        <Input
          label='Email'
          type='email'
          placeholder='example@email.com'
          autoComplete='email'
          {...register('email')}
          error={errors.email?.message}
        />

        <Controller
          name='date_of_birth'
          control={control}
          render={({ field }) => (
            <DatePicker
              label='Ngày sinh'
              value={parseLocalDateString(field.value)}
              onChange={(date) => field.onChange(date ? format(date, 'yyyy-MM-dd') : '')}
              error={errors.date_of_birth?.message}
            />
          )}
        />

        <div className='space-y-2'>
          <Input
            label='Mật khẩu'
            type='password'
            placeholder='Tối thiểu 8 ký tự'
            autoComplete='new-password'
            {...register('password')}
            error={errors.password?.message}
          />
          <PasswordStrength password={passwordValue} />
        </div>

        <Input
          label='Nhập lại mật khẩu'
          type='password'
          placeholder='Nhập lại mật khẩu'
          autoComplete='new-password'
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
