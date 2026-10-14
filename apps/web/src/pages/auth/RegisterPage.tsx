import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import Alert from '../../components/ui/Alert'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import PasswordStrength from '../../components/ui/PasswordStrength'
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

  const passwordValue = useWatch({ control, name: 'password' }) || ''

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      const res = await registerApi({ ...data, confirm_password: data.password })
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
        <h2 className='font-display text-3xl font-extrabold tracking-tight text-[#1C1917]'>Tạo tài khoản</h2>
        <p className='mt-2 text-xs leading-relaxed text-[#786C60]'>Lưu giỏ hàng, theo dõi đơn và nhận ưu đãi độc quyền dành riêng cho bạn.</p>
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

        <Button full variant='accent' type='submit' disabled={isSubmitting} loading={isSubmitting} className='!rounded-xl !py-3'>
          Đăng ký tài khoản
        </Button>

        <p className='text-center text-xs text-[#786C60]'>
          Đã có tài khoản?{' '}
          <Link to={ROUTES.AUTH + ROUTES.LOGIN} className='font-bold text-[#A16207] hover:underline'>
            Đăng nhập
          </Link>
        </p>
      </form>
    </motion.div>
  )
}
