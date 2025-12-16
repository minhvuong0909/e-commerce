import { Form } from 'antd'
import { AppInput } from '../../atoms/AppInput'
import { AppButton } from '../../atoms/AppButton'

interface ForgotPasswordValues {
  email: string
}

export const ForgotPasswordForm = () => {
  const handleSubmit = (values: ForgotPasswordValues) => {
    console.log('Reset password for:', values.email)
    // TODO: call API forgot password
  }

  return (
    <Form layout='vertical' className='space-y-8' onFinish={handleSubmit}>
      <Form.Item name='email'>
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
