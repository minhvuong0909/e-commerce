import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { PaginationMeta } from '../../models/Pagination'
import cn from '../../utils/cn'

type PaginationBarProps = {
  pagination: PaginationMeta
  page: number
  onPageChange: (page: number) => void
  isLoading?: boolean
  itemLabel?: string
}

function pageWindow(current: number, total: number): Array<number | 'gap'> {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const sorted = [...new Set([1, total, current - 1, current, current + 1])]
    .filter((p) => p >= 1 && p <= total)
    .sort((a, b) => a - b)
  const out: Array<number | 'gap'> = []
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) out.push('gap')
    out.push(p)
  })
  return out
}

const navBtn =
  'grid h-10 w-10 cursor-pointer place-items-center rounded-full border-[1.5px] border-ink-200 bg-white text-ink-950 transition hover:border-ink-950 disabled:pointer-events-none disabled:opacity-40'

export default function PaginationBar({
  pagination,
  page,
  onPageChange,
  isLoading = false,
  itemLabel = 'mục'
}: PaginationBarProps) {
  if (pagination.totalItems === 0) return null
  const total = pagination.totalPages

  return (
    <nav aria-label='Phân trang' className='mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-between'>
      <p className='text-sm text-ink-500'>
        <span className='font-semibold text-ink-950'>{pagination.totalItems}</span> {itemLabel} · trang {pagination.page}/
        {total}
      </p>
      {total > 1 ? (
        <div className='flex items-center gap-1.5'>
          <button
            type='button'
            aria-label='Trang trước'
            className={navBtn}
            disabled={page <= 1 || isLoading}
            onClick={() => onPageChange(page - 1)}
          >
            <ChevronLeft size={18} />
          </button>
          {pageWindow(page, total).map((p, i) =>
            p === 'gap' ? (
              <span key={`gap-${i}`} aria-hidden className='px-1 text-ink-400'>
                …
              </span>
            ) : (
              <button
                key={p}
                type='button'
                aria-current={p === page ? 'page' : undefined}
                disabled={isLoading}
                onClick={() => onPageChange(p)}
                className={cn(
                  'h-10 min-w-10 cursor-pointer rounded-full px-3 text-sm font-semibold transition',
                  p === page ? 'bg-ink-950 text-white' : 'text-ink-700 hover:bg-ink-100'
                )}
              >
                {p}
              </button>
            )
          )}
          <button
            type='button'
            aria-label='Trang sau'
            className={navBtn}
            disabled={page >= total || isLoading}
            onClick={() => onPageChange(page + 1)}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      ) : null}
    </nav>
  )
}
