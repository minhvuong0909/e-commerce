import { Form } from 'antd'
import { SignUpFields } from '../../organisms/SignUpFields'
import { AppButton } from '../../atoms/AppButton'

export const SignUpForm = () => (
  <Form layout='vertical' className='space-y-8'>
    <SignUpFields />

    <label className='flex items-center gap-2 text-sm text-white/70'>
      <input type='checkbox' />I accept the terms
    </label>

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
      Sign Up
    </AppButton>
  </Form>
)
