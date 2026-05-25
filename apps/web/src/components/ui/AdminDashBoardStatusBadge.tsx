import StatusBadge from './StatusBadge'

const StatusBadgeAdapter = ({ status, label }: { status: string; label: string }) => {
  const toneMap = {
    processing: 'processing',
    shipping: 'shipping',
    done: 'done',
    cancel: 'cancel'
  } as const

  const tone = toneMap[status as keyof typeof toneMap] || 'info'

  return <StatusBadge tone={tone}>{label}</StatusBadge>
}

export default StatusBadgeAdapter
