import { Form } from 'antd'
import { AppInput } from '../atoms/AppInput'
import { AppDate } from '../atoms/AppDate'
export const SignUpFields = () => (
  <div className='space-y-6'>
    <Form.Item name='name' rules={[{ required: true, message: 'Vui lòng nhập tên' }]}>
      <AppInput label='Full Name' />
    </Form.Item>

    <Form.Item
      name='email'
      rules={[
        { required: true, message: 'Vui lòng nhập email' },
        { type: 'email', message: 'Email không hợp lệ' }
      ]}
    >
      <AppInput label='Email' />
    </Form.Item>

    <Form.Item name='password' rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}>
      <AppInput label='Password' type='password' />
    </Form.Item>

    <Form.Item
      name='confirm_password'
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
      <AppInput label='Confirm Password' type='password' />
    </Form.Item>

    <Form.Item name='date_of_birth' rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}>
      <AppDate label='Date of birth' />
    </Form.Item>
  </div>
)
