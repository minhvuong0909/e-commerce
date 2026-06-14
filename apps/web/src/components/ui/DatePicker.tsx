import { CalendarDays } from 'lucide-react'
import flatpickr from 'flatpickr'
import { Vietnamese } from 'flatpickr/dist/l10n/vn.js'
import { useEffect, useId, useRef } from 'react'
import type { Instance as FlatpickrInstance } from 'flatpickr/dist/types/instance'
import 'flatpickr/dist/flatpickr.min.css'
import cn from '../../utils/cn'

interface DatePickerProps {
  label?: string
  value?: Date | null
  name?: string
  onChange?: (date: Date | null) => void
  error?: string
  disabled?: boolean
  minYear?: number
  maxYear?: number
}

export default function DatePicker({
  label,
  value,
  name,
  onChange,
  error,
  disabled = false,
  minYear,
  maxYear
}: DatePickerProps) {
  const id = useId()
  const errorId = `${id}-error`
  const inputRef = useRef<HTMLInputElement>(null)
  const fpRef = useRef<FlatpickrInstance | null>(null)
  const onChangeRef = useRef(onChange)

  const currentYear = new Date().getFullYear()
  const yearFrom = minYear ?? currentYear - 100
  const yearTo = maxYear ?? currentYear

  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  useEffect(() => {
    if (!inputRef.current) return

    fpRef.current = flatpickr(inputRef.current, {
      locale: Vietnamese,
      dateFormat: 'd/m/Y',
      allowInput: true,
      disableMobile: true,
      monthSelectorType: 'dropdown',
      maxDate: new Date(yearTo, 11, 31),
      minDate: new Date(yearFrom, 0, 1),
      onChange: (selectedDates) => {
        onChangeRef.current?.(selectedDates[0] ?? null)
      }
    })

    return () => {
      fpRef.current?.destroy()
      fpRef.current = null
    }
  }, [yearFrom, yearTo])

  useEffect(() => {
    if (!fpRef.current) return

    if (value && !Number.isNaN(value.getTime())) {
      fpRef.current.setDate(value, false)
      return
    }

    fpRef.current.clear(false)
  }, [value])

  useEffect(() => {
    if (!fpRef.current) return
    fpRef.current.input.disabled = disabled
  }, [disabled])

  return (
    <div className='space-y-1.5'>
      {label ? (
        <label htmlFor={id} className='text-sm font-bold text-ink-900'>
          {label}
        </label>
      ) : null}

      <div className='relative'>
        <input
          ref={inputRef}
          id={id}
          name={name}
          type='text'
          placeholder='dd/mm/yyyy'
          autoComplete='bday'
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={cn(
            'premium-input pr-11',
            disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer',
            error ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/15' : ''
          )}
        />
        <CalendarDays
          size={17}
          className='pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400'
        />
      </div>

      {error ? (
        <p id={errorId} role='alert' className='text-xs font-semibold text-rose-600'>
          {error}
        </p>
      ) : null}
    </div>
  )
}
