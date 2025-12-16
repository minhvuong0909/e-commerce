import { ImageBackground } from '../../components/backgrounds/ImageBackground'
import { SignUpForm } from '../../components/molecules/auth/SignUpForm'
import { AuthCard } from '../../components/organisms/AuthCard'
import { Header } from '../../components/organisms/Header'
import img from '../../assets/images/background_home.png'

export const SignUpPage = () => {
  return (
    <div className='relative min-h-screen flex flex-col'>
      <ImageBackground src={img} overlay />
      <div className='flex justify-center'>
        <div className='w-[90%] max-w-[1200px]'>
          <Header logoText='E-COMMERCE' menuItems={['HOME', 'ABOUT', 'SERVICE', 'CONTACT']} />
        </div>
      </div>

      <div className='flex flex-1 items-center justify-center px-4'>
        <AuthCard title='Sign Up for Free'>
          <SignUpForm />
        </AuthCard>
      </div>
    </div>
  )
}
