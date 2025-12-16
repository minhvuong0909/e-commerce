import { Form } from 'antd'
import { AppInput } from '../../atoms/AppInput'
import { AppButton } from '../../atoms/AppButton'

export const LoginForm = () => {
  return (
    <Form layout='vertical' className='space-y-8'>
      <Form.Item name='email'>
        <AppInput label='Email' />
      </Form.Item>

      <Form.Item name='password'>
        <AppInput label='Password' type='password' />
      </Form.Item>

      <div className='flex justify-between text-sm text-white/70'>
        <label className='flex items-center gap-2 cursor-pointer'>
          <input type='checkbox' />
          Remember Me
        </label>
        <span className='hover:underline cursor-pointer'>Forgot Password?</span>
      </div>

      <AppButton
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
        Login
      </AppButton>
    </Form>
  )
}
