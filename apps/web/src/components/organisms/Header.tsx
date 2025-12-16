import { Logo } from '../atoms/Logo'
import { NavMenu } from '../molecules/home/NavMenu'
import { AuthActions } from '../molecules/home/AuthActions'
import { HeaderBackground } from '../backgrounds/HeaderBackground'

interface HeaderProps {
  logoText: string
  menuItems: string[]
}

export const Header = ({ logoText, menuItems }: HeaderProps) => {
  return (
    <header className='relative px-10 py-6 flex items-center justify-between'>
      <HeaderBackground />
      <div className='flex items-center gap-10 text-blue-600'>
        <Logo text={logoText} />
        <NavMenu items={menuItems} />
      </div>
      <AuthActions primaryText='SIGN UP' secondaryText='LOG IN' />
    </header>
  )
}
