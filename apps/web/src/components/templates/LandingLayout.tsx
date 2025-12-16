import { ImageBackground } from '../backgrounds/ImageBackground'
import { Header } from '../organisms/Header'
import img from '../../../src/assets/images/background_home.png'

export const LandingLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className='min-h-screen flex justify-center'>
      <ImageBackground src={img} overlay />
      <div className='w-[90%] max-w-[1200px] rounded-3xl overflow-hidden'>
        <Header logoText='E-COMMERCE' menuItems={['HOME', 'SERVICES', 'ABOUT', 'CONTACT']} />
        {children}
      </div>
    </div>
  )
}
