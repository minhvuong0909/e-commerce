import img from '../../assets/images/background_home.png'
import { ImageBackground } from '../../components/backgrounds/ImageBackground'
import { Header } from '../../components/organisms/Header'
import { AuthCard } from '../../components/organisms/AuthCard'
import { LoginForm } from '../../components/molecules/auth/LoginForm'

export const LoginPage = () => {
  return (
    <div className='relative min-h-screen flex flex-col'>
      <ImageBackground src={img} />
      <div className='flex justify-center'>
        <div className='w-[90%] max-w-[1200px]'>
          <Header logoText='E-COMMERCE' menuItems={['HOME', 'ABOUT', 'SERVICE', 'CONTACT']} />
        </div>
      </div>

      <div className='flex flex-1 items-center justify-center px-4'>
        <AuthCard title='LOGIN'>
          <LoginForm />
          <p className='mt-8 text-center text-white/80'>
            Don’t have an Account? <span className='font-semibold text-cyan-50 underline cursor-pointer'>Register</span>
          </p>
        </AuthCard>
      </div>
    </div>
  )
}
