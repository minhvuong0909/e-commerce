import type { JSX } from 'react'
import type { DeliveryStatus } from '../../models/DeliveryRequests'
interface Props {
  status: DeliveryStatus
}

const statusMap: Record<DeliveryStatus, { label: string; className: string; icon: JSX.Element }> = {
  0: {
    label: 'Đã giao',
    className: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    icon: (
      <svg className='h-3.5 w-3.5' fill='none' stroke='currentColor' strokeWidth='2' viewBox='0 0 24 24'>
        <path strokeLinecap='round' strokeLinejoin='round' d='M5 13l4 4L19 7' />
      </svg>
    )
  },

  1: {
    label: 'Đang vận chuyển',
    className: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
    icon: (
      <svg className='h-3.5 w-3.5' fill='none' stroke='currentColor' strokeWidth='2' viewBox='0 0 24 24'>
        <path strokeLinecap='round' strokeLinejoin='round' d='M3 10h11M9 21V3' />
      </svg>
    )
  },

  2: {
    label: 'Đang chờ xử lý',
    className: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
    icon: (
      <svg className='h-3.5 w-3.5' fill='none' stroke='currentColor' strokeWidth='2' viewBox='0 0 24 24'>
        <circle cx='12' cy='12' r='10' />
      </svg>
    )
  },

  3: {
    label: 'Đã hủy',
    className: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    icon: (
      <svg className='h-3.5 w-3.5' fill='none' stroke='currentColor' strokeWidth='2' viewBox='0 0 24 24'>
        <path strokeLinecap='round' strokeLinejoin='round' d='M6 18L18 6M6 6l12 12' />
      </svg>
    )
  }
}

export default function DeliveryStatusBadge({ status }: Props) {
  const config = statusMap[status]

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${config.className}`}
    >
      {config.icon}
      {config.label}
    </span>
  )
}
