import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { RefreshCw, Search } from 'lucide-react'
import AdminTableShell from '../../../components/ui/AdminTable'
import PaginationBar from '../../../components/ui/PaginationBar'
import StatusBadge from '../../../components/ui/StatusBadge'
import { getOrderStatusMeta } from '../../../constants/order'
import { useDebouncedValue } from '../../../hooks/useDebouncedValue'
import type { OrderApiResponse } from '../../../models/OrderRequests'
import { ADMIN_LIST_LIMIT } from '../../../models/Pagination'
import { getAllOrdersApi } from '../../../services/orders.services'
import money from '../../../utils/money'

export default function AdminOrdersPage() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const debouncedSearch = useDebouncedValue(search)

  const {
    data,
    isLoading: loading,
    isError,
    refetch,
    isFetching
  } = useQuery({
    queryKey: ['admin-orders', page, debouncedSearch],
    queryFn: async () => {
      const res = await getAllOrdersApi(ADMIN_LIST_LIMIT, page, debouncedSearch)
      return {
        orders: (res.data.result ?? []) as OrderApiResponse[],
        pagination: res.data.pagination
      }
    }
  })

  const orders = data?.orders ?? []
  const pagination = data?.pagination
  const error = isError ? 'Không tải được danh sách đơn hàng' : ''

  return (
    <AdminTableShell title='Đơn hàng' subTitle='Theo dõi đơn hàng, thanh toán và trạng thái vận chuyển.'>
      <div className='space-y-5'>
        <div className='surface-card flex flex-col gap-3 rounded-3xl p-4 md:flex-row md:items-center md:justify-between'>
          <div className='relative w-full md:max-w-sm'>
            <Search size={16} className='pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400' />
            <input
              type='search'
              aria-label='Tìm đơn hàng theo mã, khách hàng hoặc thanh toán'
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              placeholder='Tìm theo mã đơn, khách, MoMo/PayPal...'
              className='premium-input pl-10'
            />
          </div>

          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className='inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50'
          >
            <RefreshCw size={15} className={isFetching ? 'animate-spin' : ''} />
            Reload
          </button>
        </div>

        {error ? (
          <div className='rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-900'>
            {error}
          </div>
        ) : null}

        <div className='surface-strong overflow-x-auto rounded-3xl'>
          <table className='w-full text-sm'>
            <thead>
              <tr className='border-b border-slate-200 bg-slate-50/80'>
                <th className='px-5 py-4 text-left text-xs font-black uppercase tracking-[0.12em] text-slate-400'>Đơn hàng</th>
                <th className='px-5 py-4 text-left text-xs font-black uppercase tracking-[0.12em] text-slate-400'>Khách hàng</th>
                <th className='px-5 py-4 text-left text-xs font-black uppercase tracking-[0.12em] text-slate-400'>Tổng tiền</th>
                <th className='px-5 py-4 text-left text-xs font-black uppercase tracking-[0.12em] text-slate-400'>Trạng thái</th>
                <th className='px-5 py-4 text-right text-xs font-black uppercase tracking-[0.12em] text-slate-400'>Thao tác</th>
              </tr>
            </thead>

            <tbody>
              {loading
                ? Array.from({ length: 5 }).map((_, index) => (
                    <tr key={index} className='border-b border-slate-100'>
                      <td className='p-4'><div className='h-4 w-28 animate-pulse rounded bg-slate-100' /></td>
                      <td className='p-4'><div className='h-4 w-40 animate-pulse rounded bg-slate-100' /></td>
                      <td className='p-4'><div className='h-4 w-28 animate-pulse rounded bg-slate-100' /></td>
                      <td className='p-4'><div className='h-7 w-28 animate-pulse rounded-full bg-slate-100' /></td>
                      <td className='p-4'><div className='ml-auto h-4 w-20 animate-pulse rounded bg-slate-100' /></td>
                    </tr>
                  ))
                : null}

              {!loading && orders.length === 0 ? (
                <tr>
                  <td colSpan={5} className='px-5 py-14 text-center text-sm font-semibold text-slate-500'>
                    Không tìm thấy đơn hàng nào.
                  </td>
                </tr>
              ) : null}

              {!loading
                ? orders.map((order) => {
                    const status = getOrderStatusMeta(order.status)
                    return (
                      <tr key={order._id} className='border-b border-slate-100 transition hover:bg-slate-50/80 last:border-0'>
                        <td className='px-5 py-4'>
                          <div className='font-mono font-black text-ink-950'>#{order._id.slice(-8).toUpperCase()}</div>
                          <div className='mt-0.5 text-xs font-semibold text-slate-400'>
                            {new Date(order.created_at).toLocaleDateString('vi-VN')}
                          </div>
                        </td>
                        <td className='px-5 py-4'>
                          <div className='max-w-[220px] truncate font-semibold text-slate-600'>{order.user_id}</div>
                        </td>
                        <td className='px-5 py-4 font-mono font-black text-ink-950'>
                          {money(order.total_price + order.shipping_fee)}
                        </td>
                        <td className='px-5 py-4'>
                          <StatusBadge tone={status.tone}>{status.label}</StatusBadge>
                        </td>
                        <td className='px-5 py-4 text-right'>
                          <Link
                            to={`/admin/orders/${order._id}`}
                            className='rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-600 transition hover:bg-slate-100 hover:text-ink-950'
                          >
                            Xem
                          </Link>
                        </td>
                      </tr>
                    )
                  })
                : null}
            </tbody>
          </table>
        </div>

        {pagination ? (
          <PaginationBar
            pagination={pagination}
            page={page}
            onPageChange={setPage}
            isLoading={isFetching}
            itemLabel='đơn hàng'
          />
        ) : null}
      </div>
    </AdminTableShell>
  )
}
