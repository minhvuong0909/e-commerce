import { Form, message } from 'antd'
import { AppInput } from '../../atoms/AppInput'
import { AppButton } from '../../atoms/AppButton'
import type { ForgotPasswordPayload } from '../../../models/auth/auths.request'
import { forgotPassword } from '../../../services/auth.service'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export const ForgotPasswordForm = () => {
  const [loading, setLoading] = useState<boolean>(false)
  const navigate = useNavigate()
  const handleSubmit = async (values: ForgotPasswordPayload) => {
    try {
      setLoading(true)
      await forgotPassword(values)
      message.success('Vui lòng kiểm tra email để đặt lại mật khẩu')
      navigate('/reset-password')
    } catch (error: any) {
      message.error(error?.response?.data?.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Form layout='vertical' className='space-y-8' onFinish={handleSubmit}>
      <Form.Item
        name='email'
        rules={[
          { required: true, message: 'Email is required' },
          { type: 'email', message: 'Email không hợp lệ' }
        ]}
      >
        <AppInput label='Email' />
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
        Reset Password
      </AppButton>
    </Form>
  )
}
