import { Form, Result } from 'antd'
import { AppInput } from '../../atoms/AppInput'
import { AppButton } from '../../atoms/AppButton'
import type { ResetPasswordPayload } from '../../../models/auth/auths.request'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { resetPassword } from '../../../services/auth.service'

export const SetNewPasswordForm = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const forgot_password_token = searchParams.get('token')
  console.log('Forgot Password Token: ' + forgot_password_token)

  if (!forgot_password_token) {
    return <Result status='error' title='Link không hợp lệ' subTitle='Vui lòng kiểm tra lại email reset mật khẩu' />
  }
  const handleSubmit = async (values: ResetPasswordPayload) => {
    try {
      await resetPassword({
        ...values,
        forgot_password_token: forgot_password_token
      })
      toast.success('Reset mật khẩu thành công !')
      navigate('/sign-in')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Đăng ký thất bại')
    }
  }

  return (
    <Form layout='vertical' className='space-y-8' onFinish={handleSubmit}>
      <Form.Item
        name='password'
        rules={[
          { required: true, message: 'Password is required' },
          { min: 6, message: 'Minimum 6 characters' }
        ]}
      >
        <AppInput type='password' label='Password' />
      </Form.Item>

      <Form.Item
        name='confirmPassword'
        dependencies={['password']}
        rules={[
          { required: true, message: 'Confirm your password' },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || value === getFieldValue('password')) {
                return Promise.resolve()
              }
              return Promise.reject(new Error('Passwords do not match'))
            }
          })
        ]}
      >
        <AppInput type='password' label='Confirm Password' />
      </Form.Item>

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
        Update Password
      </AppButton>
    </Form>
  )
}
