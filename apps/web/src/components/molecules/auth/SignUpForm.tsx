import { Form } from 'antd'
import { SignUpFields } from '../../organisms/SignUpFields'
import { AppButton } from '../../atoms/AppButton'
import { useNavigate } from 'react-router-dom'
import type { RegisterPayload } from '../../../models/auth/auths.request'
import { register } from '../../../services/auth.service'
import { toast } from 'react-toastify'

export const SignUpForm = () => {
  const navigate = useNavigate()
  const handleRegister = async (values: RegisterPayload) => {
    try {
      await register(values)
      toast.success('Đăng ký thành công! Vui lòng đăng nhập.')
      navigate('/sign-in')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Đăng ký thất bại')
    }
  }
  return (
    <Form layout='vertical' className='space-y-8' onFinish={handleRegister}>
      <SignUpFields />

      <label className='flex items-center gap-2 text-sm text-white/70'>
        <input type='checkbox' />I accept the terms
      </label>

      <AppButton
        htmlType='submit'
        className='w-full
    h-12
    rounded-full
    bg-gradient-to-r from-blue-500 to-cyan-400
    text-white
    font-medium
    shadow-md
    hover:from-blue-600 hover:to-cyan-500
    transition'
      >
        Sign Up
      </AppButton>
    </Form>
  )
}
