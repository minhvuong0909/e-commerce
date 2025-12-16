import { Form } from 'antd'
import { AppInput } from '../../atoms/AppInput'
import { AppButton } from '../../atoms/AppButton'

interface ChangePasswordValues {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export const ChangePasswordForm = () => {
  const handleSubmit = (values: ChangePasswordValues) => {
    console.log('Change password:', values)
    // TODO: call API change password
  }

  return (
    <Form layout='vertical' className='space-y-8' onFinish={handleSubmit}>
      {/* CURRENT PASSWORD */}
      <Form.Item name='currentPassword' rules={[{ required: true, message: 'Current password is required' }]}>
        <AppInput label='Current Password' type='password' />
      </Form.Item>

      {/* NEW PASSWORD */}
      <Form.Item
        name='newPassword'
        rules={[
          { required: true, message: 'New password is required' },
          { min: 6, message: 'Minimum 6 characters' }
        ]}
        hasFeedback
      >
        <AppInput label='New Password' type='password' />
      </Form.Item>

      {/* CONFIRM PASSWORD */}
      <Form.Item
        name='confirmPassword'
        dependencies={['newPassword']}
        hasFeedback
        rules={[
          { required: true, message: 'Confirm your new password' },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || value === getFieldValue('newPassword')) {
                return Promise.resolve()
              }
              return Promise.reject(new Error('Passwords do not match'))
            }
          })
        ]}
      >
        <AppInput label='Confirm New Password' type='password' />
      </Form.Item>

      {/* SUBMIT */}
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
