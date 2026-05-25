import { motion, type HTMLMotionProps } from 'framer-motion'
import type { ReactNode } from 'react'
import { panelMotion } from '../../constants/motion'
import cn from '../../utils/cn'

interface MotionSurfaceProps extends HTMLMotionProps<'div'> {
  children: ReactNode
  tone?: 'default' | 'strong' | 'muted'
  lift?: boolean
}

export default function MotionSurface({
  children,
  className = '',
  tone = 'default',
  lift = false,
  ...props
}: MotionSurfaceProps) {
  const toneClass = tone === 'strong' ? 'surface-strong' : tone === 'muted' ? 'surface-muted' : 'surface-card'

  return (
    <motion.div
      {...panelMotion}
      className={cn('rounded-3xl', toneClass, lift && 'interactive-lift', className)}
      {...props}
    >
      {children}
    </motion.div>
  )
}
