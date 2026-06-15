import { useQueryClient } from '@tanstack/react-query'
import { MapPin, Star, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import Button from '../ui/Button'
import { SAVED_ADDRESSES_QUERY_KEY, useSavedAddresses } from '../../hooks/useSavedAddresses'
import {
  deleteSavedAddressApi,
  updateSavedAddressApi,
  type SavedAddress
} from '../../services/user_addresses.services'
import { getApiErrorMessage } from '../../utils/apiError'
import cn from '../../utils/cn'

type SavedAddressesPanelProps = {
  onSelect?: (address: SavedAddress) => void
  selectable?: boolean
  selectedId?: string | null
  variant?: 'default' | 'cosmetics'
}

export default function SavedAddressesPanel({
  onSelect,
  selectable = false,
  selectedId = null,
  variant = 'default'
}: SavedAddressesPanelProps) {
  const isCosmetics = variant === 'cosmetics'
  const cardSelected = isCosmetics
    ? 'border-[#3d3330] bg-[#fdf8f6] ring-1 ring-[#3d3330]/10'
    : 'border-brand-500 bg-brand-50 ring-4 ring-brand-500/10'
  const cardDefault = isCosmetics ? 'border-[#eaded8] bg-white hover:border-[#cbb8af]' : 'border-slate-200 bg-white'
  const skeletonClass = isCosmetics ? 'rounded-lg bg-[#fdf8f6]' : 'rounded-3xl bg-slate-100'
  const emptyBorder = isCosmetics ? 'border-[#dccbc4] bg-[#fdf8f6]' : 'border-slate-200 bg-slate-50'
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
    if (!window.confirm('Xóa địa chỉ này?')) return
    try {
      await deleteSavedAddressApi(id)
      toast.success('Đã xóa địa chỉ')
      queryClient.invalidateQueries({ queryKey: SAVED_ADDRESSES_QUERY_KEY })
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Không thể xóa địa chỉ'))
    }
  }

  if (isLoading) {
    return <div className={cn('h-24 animate-pulse', skeletonClass)} />
  }

  if (isError) {
    return (
      <p className='rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-800'>
        Không tải được sổ địa chỉ.
      </p>
    )
  }

  if (addresses.length === 0) {
    return (
      <div className={cn('rounded-lg border border-dashed px-5 py-8 text-center', emptyBorder)}>
        <MapPin size={28} className={cn('mx-auto', isCosmetics ? 'text-[#cbb8af]' : 'text-slate-400')} />
        <p className={cn('mt-3 text-sm font-semibold', isCosmetics ? 'text-[#6b5f59]' : 'text-slate-600')}>Chưa có địa chỉ đã lưu</p>
        <p className={cn('mt-1 text-xs', isCosmetics ? 'text-[#8a7a74]' : 'text-slate-500')}>
          Địa chỉ sẽ được lưu khi bạn checkout hoặc thêm tại đây sau khi đặt hàng.
        </p>
      </div>
    )
  }

  return (
    <div className='space-y-3'>
      {addresses.map((address) => {
        const isSelected = selectable && selectedId === address._id
        return (
          <div
            key={address._id}
            className={cn('rounded-lg border p-4 transition', isSelected ? cardSelected : cardDefault)}
          >
            <div className='flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between'>
              <button
                type='button'
                disabled={!selectable}
                onClick={() => onSelect?.(address)}
                className={cn('min-w-0 flex-1 text-left', selectable && 'cursor-pointer')}
              >
                <div className='flex flex-wrap items-center gap-2'>
                  <span className={cn('font-semibold', isCosmetics ? 'text-[#3d3330]' : 'font-black text-ink-950')}>
                    {address.recipient_name}
                  </span>
                  <span className={cn('text-sm font-semibold', isCosmetics ? 'text-[#8a7a74]' : 'text-slate-500')}>{address.phone}</span>
                  {address.is_default ? (
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                        isCosmetics ? 'bg-[#b07a72]/15 text-[#b07a72]' : 'bg-brand-100 text-brand-700'
                      )}
                    >
                      Mặc định
                    </span>
                  ) : null}
                  {address.label ? (
                    <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-bold', isCosmetics ? 'bg-[#f0e4de] text-[#6b5f59]' : 'bg-slate-100 text-slate-600')}>
                      {address.label}
                    </span>
                  ) : null}
                </div>
                <p className={cn('mt-2 text-sm leading-6', isCosmetics ? 'text-[#6b5f59]' : 'text-slate-600')}>
                  {address.address_line}
                  {address.district ? `, ${address.district}` : ''}
                  {address.city ? `, ${address.city}` : ''}
                </p>
                {address.note ? <p className='mt-1 text-xs text-slate-500'>Ghi chú: {address.note}</p> : null}
              </button>

              {!selectable ? (
                <div className='flex shrink-0 gap-2'>
                  {!address.is_default ? (
                    <Button type='button' variant='secondary' onClick={() => handleSetDefault(address)}>
                      <Star size={14} />
                      Mặc định
                    </Button>
                  ) : null}
                  <button
                    type='button'
                    onClick={() => handleDelete(address._id)}
                    className='inline-flex h-10 items-center gap-1 rounded-xl border border-rose-200 bg-rose-50 px-3 text-xs font-black text-rose-700 hover:bg-rose-100'
                  >
                    <Trash2 size={14} />
                    Xóa
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        )
      })}
    </div>
  )
}
