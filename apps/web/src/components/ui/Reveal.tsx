import type { ReactNode } from 'react'
import { m, useReducedMotion } from 'framer-motion'
import { easeOut } from '../../constants/motion'

interface RevealProps {
  children: ReactNode
  delay?: number
  className?: string
}

/** Fades and lifts its children into view once, when they first scroll on screen. */
export default function Reveal({ children, delay = 0, className }: RevealProps) {
  const reduce = useReducedMotion()
  if (reduce) return <div className={className}>{children}</div>
  return (
    <m.div
      className={className}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -12% 0px' }}
      transition={{ duration: 0.6, delay, ease: easeOut }}
    >
      {children}
    </m.div>
  )
}
