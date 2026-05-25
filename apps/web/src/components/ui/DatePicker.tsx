import { CalendarDays } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { format } from 'date-fns'
import { AnimatePresence, motion } from 'framer-motion'

interface DatePickerProps {
  label?: string
  value?: Date | null
  name?: string
  onChange?: (date: Date) => void
}

export default function DatePicker({ label, value, onChange }: DatePickerProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(value || null)
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setSelectedDate(value || null)
  }, [value])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (date: Date) => {
    setSelectedDate(date)
    onChange?.(date)
    setOpen(false)
  }

  const generateDays = () => {
    const today = new Date()
    return Array.from({ length: 31 }, (_, index) => new Date(today.getFullYear(), today.getMonth(), index + 1))
  }

  return (
    <div className='relative w-full space-y-1.5' ref={ref}>
      {label ? <label className='text-sm font-bold text-ink-900'>{label}</label> : null}

      <button
        type='button'
        onClick={() => setOpen((value) => !value)}
        className='premium-input flex items-center justify-between text-left'
      >
        <span>{selectedDate ? format(selectedDate, 'dd/MM/yyyy') : 'Chọn ngày'}</span>
        <CalendarDays size={17} className='text-slate-400' />
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className='absolute z-50 mt-2 grid w-full grid-cols-7 gap-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-lift'
          >
            {generateDays().map((day) => {
              const isSelected = selectedDate && format(day, 'dd/MM/yyyy') === format(selectedDate, 'dd/MM/yyyy')

              return (
                <button
                  key={day.toISOString()}
                  type='button'
                  onClick={() => handleSelect(day)}
                  className={[
                    'rounded-xl py-2 text-sm font-bold transition',
                    isSelected ? 'bg-ink-950 text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-ink-950'
                  ].join(' ')}
                >
                  {format(day, 'd')}
                </button>
              )
            })}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
