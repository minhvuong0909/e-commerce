import { ArrowLeftOutlined } from '@ant-design/icons'
import { SetNewPasswordForm } from '../../components/molecules/auth/SetNewPasswordForm'
import img from '../../assets/images/background_home.png'
import { ImageBackground } from '../../components/backgrounds/ImageBackground'
import { Header } from '../../components/organisms/Header'
import { AuthCard } from '../../components/organisms/AuthCard'

export const SetNewPasswordPage = () => {
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
        <AuthCard title='Set New Password'>
          {/* Back button */}
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

          <p className='text-center text-indigo-500 font-bold mb-8 mt-4'>
            Create a new password. Ensure it differs from previous ones for security
          </p>

          <SetNewPasswordForm />
        </AuthCard>
      </div>
    </div>
  )
}
