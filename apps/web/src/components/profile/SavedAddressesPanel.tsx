import { useQueryClient } from '@tanstack/react-query'
import { Check, MapPin, Star, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { SAVED_ADDRESSES_QUERY_KEY, useSavedAddresses } from '../../hooks/useSavedAddresses'
import { deleteSavedAddressApi, updateSavedAddressApi, type SavedAddress } from '../../services/user_addresses.services'
import { getApiErrorMessage } from '../../utils/apiError'
import cn from '../../utils/cn'
import { useConfirm } from '../ui/ConfirmDialog'

type SavedAddressesPanelProps = {
  onSelect?: (address: SavedAddress) => void
  selectable?: boolean
  selectedId?: string | null
  /** kept for backwards compatibility */
  variant?: 'default' | 'cosmetics'
}

export default function SavedAddressesPanel({ onSelect, selectable = false, selectedId = null }: SavedAddressesPanelProps) {
  const confirm = useConfirm()
  const queryClient = useQueryClient()
  const { data: addresses = [], isLoading, isError } = useSavedAddresses()

  const handleSetDefault = async (address: SavedAddress) => {
    try {
      await updateSavedAddressApi(address._id, { is_default: true })
      toast.success('Đã đặt làm địa chỉ mặc định')
      queryClient.invalidateQueries({ queryKey: SAVED_ADDRESSES_QUERY_KEY })
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Không thể cập nhật địa chỉ'))
    }
  }

  const handleDelete = async (id: string) => {
    if (!(await confirm('Xóa địa chỉ này?'))) return
    try {
      await deleteSavedAddressApi(id)
      toast.success('Đã xóa địa chỉ')
      queryClient.invalidateQueries({ queryKey: SAVED_ADDRESSES_QUERY_KEY })
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Không thể xóa địa chỉ'))
    }
  }

  if (isLoading) return <div className='h-24 animate-pulse rounded-3xl bg-ink-100' />

  if (isError) {
    return <p className='rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700'>Không tải được sổ địa chỉ.</p>
  }

  if (addresses.length === 0) {
    return (
      <div className='rounded-3xl border border-dashed border-ink-200 px-5 py-8 text-center'>
        <MapPin size={26} className='mx-auto text-ink-300' aria-hidden />
        <p className='mt-3 text-sm font-semibold'>Chưa có địa chỉ đã lưu</p>
        <p className='mt-1 text-xs text-ink-500'>Địa chỉ sẽ được lưu khi bạn chọn “Lưu địa chỉ” lúc thanh toán.</p>
      </div>
    )
  }

  return (
    <div className={cn('grid gap-3', selectable && 'sm:grid-cols-2')}>
      {addresses.map((address) => {
        const isSelected = selectable && selectedId === address._id
        const body = (
          <>
            <div className='flex flex-wrap items-center gap-2'>
              <span className='font-semibold text-ink-950'>{address.recipient_name}</span>
              <span className='text-sm text-ink-500'>{address.phone}</span>
              {address.is_default ? <span className='chip bg-berry-100 px-2 py-0.5 text-[11px] text-berry-700'>Mặc định</span> : null}
              {address.label ? <span className='chip bg-ink-100 px-2 py-0.5 text-[11px] text-ink-700'>{address.label}</span> : null}
            </div>
            <p className='mt-1.5 text-sm leading-relaxed text-ink-600'>
              {address.address_line}
              {address.district ? `, ${address.district}` : ''}
              {address.city ? `, ${address.city}` : ''}
            </p>
            {address.note ? <p className='mt-1 text-xs text-ink-500'>Ghi chú: {address.note}</p> : null}
          </>
        )

        if (selectable) {
          return (
            <button
              key={address._id}
              type='button'
              onClick={() => onSelect?.(address)}
              aria-pressed={isSelected}
              className={cn(
                'relative cursor-pointer rounded-3xl border p-4 pr-12 text-left transition',
                isSelected ? 'border-berry-500 bg-white' : 'border-ink-100 bg-white hover:border-ink-300'
              )}
            >
              {body}
              <span
                className={cn(
                  'absolute right-4 top-4 grid h-6 w-6 place-items-center rounded-full border',
                  isSelected ? 'border-berry-600 bg-berry-600 text-white' : 'border-ink-300 text-transparent'
                )}
              >
                <Check size={13} strokeWidth={3} />
              </span>
            </button>
          )
        }

        return (
          <div key={address._id} className='flex flex-col gap-3 rounded-3xl bg-white p-4 ring-1 ring-ink-100 sm:flex-row sm:items-start'>
            <div className='min-w-0 flex-1'>{body}</div>
            <div className='flex shrink-0 gap-2'>
              {!address.is_default ? (
                <button
                  type='button'
                  onClick={() => handleSetDefault(address)}
                  className='inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg border border-ink-200 px-3.5 text-xs font-semibold hover:border-berry-300'
                >
                  <Star size={13} /> Mặc định
                </button>
              ) : null}
              <button
                type='button'
                onClick={() => handleDelete(address._id)}
                aria-label='Xóa địa chỉ'
                className='grid h-9 w-9 cursor-pointer place-items-center rounded-full text-ink-500 hover:bg-rose-50 hover:text-rose-600'
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
