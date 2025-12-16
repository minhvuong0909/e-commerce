import { AppButton } from '../../atoms/AppButton'

interface AuthActionsProps {
  primaryText: string
  secondaryText: string
}

export const AuthActions = ({ primaryText, secondaryText }: AuthActionsProps) => {
  return (
    <div className='flex gap-3'>
      <AppButton type='primary' className='bg-blue-600'>
        {primaryText}
      </AppButton>

      <AppButton variant='outline'>{secondaryText}</AppButton>
    </div>
  )
}
