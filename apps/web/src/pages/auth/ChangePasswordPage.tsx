import { ArrowLeftOutlined } from '@ant-design/icons'
import { ImageBackground } from '../../components/backgrounds/ImageBackground'
import img from '../../assets/images/background_home.png'
import { Header } from '../../components/organisms/Header'
import { AuthCard } from '../../components/organisms/AuthCard'
import { ChangePasswordForm } from '../../components/molecules/auth/ChangePasswordForm'

export const ChangePasswordPage = () => {
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
        <AuthCard title='Change Password'>
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
            <p className='text-indigo-500 font-bold mb-8'>Update your password to keep your account secure</p>
          </p>
          <ChangePasswordForm />
        </AuthCard>
      </div>
    </div>
  )
}
