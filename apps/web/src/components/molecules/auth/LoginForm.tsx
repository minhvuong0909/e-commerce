import { Form } from 'antd'
import { AppInput } from '../../atoms/AppInput'
import { AppButton } from '../../atoms/AppButton'
import { useState } from 'react'
import { login } from '../../../services/auth.service'
import { saveAuth } from '../../../utils/auth'
import { toast } from 'react-toastify'
import type { AxiosError } from 'axios'
import { useNavigate } from 'react-router-dom'

export const LoginForm = () => {
  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const navigate = useNavigate()

  const handleLogin = async () => {
    // chặn refresh trang
    try {
      const res = await login({ email, password })
      // destructering
      const { access_token, refresh_token } = res.data.result.tokens
      saveAuth({ access_token, refresh_token })
      toast.success('Login successfully')
      // sau chỉ login thành công thì chyển trang
      navigate('/')
    } catch (err) {
      const error = err as AxiosError<any>
      toast.error(error.response?.data?.message || 'Login Fail')
    }
  }
  return (
    <Form layout='vertical' className='space-y-8' onFinish={handleLogin}>
      <Form.Item
        name='email'
        rules={[
          { required: true, message: 'Vui lòng nhập email' },
          { type: 'email', message: 'Email không hợp lệ' }
        ]}
      >
        <AppInput label='Email' value={email} onChange={(e) => setEmail(e.target.value)} />
      </Form.Item>

      <Form.Item name='password' rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}>
        <AppInput label='Password' type='password' value={password} onChange={(e) => setPassword(e.target.value)} />
      </Form.Item>

      <div className='flex justify-between text-sm text-white/70'>
        <label className='flex items-center gap-2 cursor-pointer'>
          <input type='checkbox' />
          Remember Me
        </label>
        <span className='hover:underline cursor-pointer'>Forgot Password?</span>
      </div>

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
        Login
      </AppButton>
    </Form>
  )
}
