import { AlertTriangle, CheckCircle2, Clock3 } from 'lucide-react'

const StatusBadge = ({ status, label }: { status: string; label: string }) => {
  const styles =
    status === 'processing'
      ? 'bg-amber-500/15 text-amber-300 ring-1 ring-inset ring-amber-400/20'
      : status === 'done'
        ? 'bg-emerald-500/15 text-emerald-300 ring-1 ring-inset ring-emerald-400/20'
        : 'bg-rose-500/15 text-rose-300 ring-1 ring-inset ring-rose-400/20'

  const Icon = status === 'processing' ? Clock3 : status === 'done' ? CheckCircle2 : AlertTriangle

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${styles}`}>
      <Icon size={14} />
      {label}
    </span>
  )
}

export default StatusBadge
