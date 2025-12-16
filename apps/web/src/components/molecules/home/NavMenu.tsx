interface NavMenuProps {
  items: string[]
}

export const NavMenu = ({ items }: NavMenuProps) => {
  return (
    <nav className='flex gap-8 text-sm'>
      {items.map((item) => (
        <a key={item} className='hover:text-white cursor-pointer'>
          {item}
        </a>
      ))}
    </nav>
  )
}
