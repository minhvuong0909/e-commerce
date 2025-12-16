import { Button } from 'antd'
import clsx from 'clsx'

interface Props {
  children: React.ReactNode
  type?: 'primary' | 'default'
  variant?: 'solid' | 'outline'
  className?: string
  htmlType?: 'button' | 'submit' | 'reset'
}

export const AppButton = ({ children, type = 'default', htmlType, variant = 'solid', className }: Props) => {
  return (
    <Button
      type={type}
      htmlType={htmlType}
      className={clsx(
        'rounded-full px-5 h-9 text-sm',
        variant === 'outline' && 'bg-transparent border border-white text-white',
        className
      )}
    >
      {children}
    </Button>
  )
}
