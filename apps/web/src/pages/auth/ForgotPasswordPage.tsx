import { ArrowLeftOutlined } from '@ant-design/icons'
import { ImageBackground } from '../../components/backgrounds/ImageBackground'
import img from '../../assets/images/background_home.png'
import { ForgotPasswordForm } from '../../components/molecules/auth/ForgotPasswordForm'
import { AuthCard } from '../../components/organisms/AuthCard'
import { Header } from '../../components/organisms/Header'

export const ForgotPasswordPage = () => {
  return (
    <div className='relative min-h-screen flex flex-col'>
      <ImageBackground src={img} />
      <div className='flex justify-center'>
        <div className='w-[90%] max-w-[1200px]'>
          <Header logoText='E-COMMERCE' menuItems={['HOME', 'ABOUT', 'SERVICE', 'CONTACT']} />
        </div>
      </div>
      {/* nút back */}

      <div className='flex flex-1 items-center justify-center px-4'>
        <AuthCard title='Forgot Password'>
          <button
            type='button'
            className='
        absolute
        top-6
        left-6
        text-white/70
        hover:text-white
        transition-colors
      '
          >
            <ArrowLeftOutlined />
          </button>
          <p className='mt-8 text-center text-white/80'>
            <p className='text-indigo-500 font-bold mb-8'>Please enter your email to reset the password</p>
          </p>
          <ForgotPasswordForm />
          <p className='mt-8 text-center text-white/80'>
            Don’t have an Account?{' '}
            <span className='font-semibold text-cyan-500 underline cursor-pointer'>Resend Email</span>
          </p>
        </AuthCard>
      </div>
    </div>
  )
}
