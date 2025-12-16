import { Form } from 'antd'
import { AppInput } from '../../atoms/AppInput'
import { AppButton } from '../../atoms/AppButton'

interface Values {
  password: string
  confirmPassword: string
}

export const SetNewPasswordForm = () => {
  const handleSubmit = (values: Values) => {
    console.log('New password:', values)
    // TODO: call API update password
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
