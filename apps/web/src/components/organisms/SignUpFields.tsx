import { Form } from 'antd'
import { AppInput } from '../atoms/AppInput'

export const SignUpFields = () => (
  <div className='space-y-6'>
    <Form.Item name='name'>
      <AppInput label='Full Name' />
    </Form.Item>

    <Form.Item name='email'>
      <AppInput label='Email' />
    </Form.Item>

    <Form.Item name='password'>
      <AppInput label='Password' type='password' />
    </Form.Item>

    <Form.Item name='confirm-password'>
      <AppInput label='Confirm Password' type='password' />
    </Form.Item>
  </div>
)
