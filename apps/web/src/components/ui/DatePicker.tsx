import { useState, useRef, useEffect } from 'react'
import { format } from 'date-fns'
import { motion, AnimatePresence } from 'framer-motion'

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
    const days = []
    for (let i = 1; i <= 31; i++) {
      days.push(new Date(today.getFullYear(), today.getMonth(), i))
    }
    return days
  }

  return (
    <div className='relative w-full' ref={ref}>
      {label && <label className='mb-1 block text-sm text-white/70'>{label}</label>}

      {/* Input */}
      <div
        onClick={() => setOpen(!open)}
        className='flex cursor-pointer items-center justify-between rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-white backdrop-blur-md transition hover:border-orange-400'
      >
        <span className='text-sm'>{selectedDate ? format(selectedDate, 'dd/MM/yyyy') : 'Chọn ngày'}</span>

        <svg className='h-4 w-4 text-white/60' fill='none' stroke='currentColor' strokeWidth='2' viewBox='0 0 24 24'>
          <path strokeLinecap='round' strokeLinejoin='round' d='M8 9l4-4 4 4m0 6l-4 4-4-4' />
        </svg>
      </div>

      {/* Calendar */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className='absolute z-50 mt-2 grid w-full grid-cols-7 gap-2 rounded-2xl border border-white/10 bg-black/90 p-4 backdrop-blur-xl'
          >
            {generateDays().map((day, index) => {
              const isSelected = selectedDate && format(day, 'dd/MM/yyyy') === format(selectedDate, 'dd/MM/yyyy')

              return (
                <button
                  key={index}
                  onClick={() => handleSelect(day)}
                  className={`rounded-lg py-1 text-sm transition 
                    ${isSelected ? 'bg-orange-500 text-white' : 'text-white/70 hover:bg-white/10'}
                  `}
                >
                  {format(day, 'd')}
                </button>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
