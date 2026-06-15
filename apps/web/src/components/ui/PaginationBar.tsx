import Button from './Button'
import type { PaginationMeta } from '../../models/Pagination'

type PaginationBarProps = {
  pagination: PaginationMeta
  page: number
  onPageChange: (page: number) => void
  isLoading?: boolean
  itemLabel?: string
}

export default function PaginationBar({
  pagination,
  page,
  onPageChange,
  isLoading = false,
  itemLabel = 'mục'
}: PaginationBarProps) {
  if (pagination.totalItems === 0) return null

  return (
    <div className='mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
      <p className='text-sm font-semibold text-slate-500'>
        Trang {pagination.page}/{pagination.totalPages} · {pagination.totalItems} {itemLabel}
      </p>
      {pagination.totalPages > 1 ? (
        <div className='flex gap-2'>
          <Button variant='secondary' disabled={page <= 1 || isLoading} onClick={() => onPageChange(page - 1)}>
            Trước
          </Button>
          <Button
            variant='secondary'
            disabled={page >= pagination.totalPages || isLoading}
            onClick={() => onPageChange(page + 1)}
          >
            Sau
          </Button>
        </div>
      ) : null}
    </div>
  )
}
