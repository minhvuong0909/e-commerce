import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Ban, RefreshCw, Search, ShieldCheck, UserRound } from 'lucide-react'
import { toast } from 'sonner'
import AdminTableShell from '../../../components/ui/AdminTable'
import Button from '../../../components/ui/Button'
import PaginationBar from '../../../components/ui/PaginationBar'
import { useDebouncedValue } from '../../../hooks/useDebouncedValue'
import { banUserApi, getUsersApi, unbanUserApi, type AdminUser } from '../../../services/users.services'
import { ADMIN_LIST_LIMIT } from '../../../models/Pagination'
import { getApiErrorMessage } from '../../../utils/apiError'
import cn from '../../../utils/cn'

const VERIFY_LABELS: Record<number, { label: string; tone: string }> = {
  0: { label: 'Chưa xác thực', tone: 'bg-amber-50 text-amber-800 border-amber-200' },
  1: { label: 'Đã xác thực', tone: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  2: { label: 'Đã khóa', tone: 'bg-rose-50 text-rose-800 border-rose-200' }
}

function SkeletonRow() {
  return (
    <tr className='border-b border-slate-100'>
      {[40, 55, 45, 30, 25].map((width, index) => (
        <td key={index} className='p-4'>
          <div className='h-4 animate-pulse rounded-md bg-slate-100' style={{ width: `${width}%` }} />
        </td>
      ))}
    </tr>
  )
}

export default function AdminUsersPage() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [actionId, setActionId] = useState<string | null>(null)
  const debouncedSearch = useDebouncedValue(search)
  const limit = ADMIN_LIST_LIMIT

  const {
    data,
    isLoading,
    isError,
    refetch,
    isFetching
  } = useQuery({
    queryKey: ['admin-users', page, debouncedSearch],
    queryFn: async () => {
      const res = await getUsersApi(page, limit, debouncedSearch)
      return res.data
    }
  })

  const users = data?.data ?? []
  const pagination = data?.pagination
  const error = isError ? 'Không tải được danh sách người dùng' : ''

  const stats = useMemo(() => {
    const list = data?.data || []
    const banned = list.filter((u) => u.verify_status === 2).length
    const verified = list.filter((u) => u.verify_status === 1).length
    return { banned, verified }
  }, [data?.data])

  const handleBanToggle = async (user: AdminUser) => {
    const isBanned = user.verify_status === 2
    const action = isBanned ? 'mở khóa' : 'khóa'
    if (!window.confirm(`${isBanned ? 'Mở khóa' : 'Khóa'} tài khoản ${user.email}?`)) return

    try {
      setActionId(user._id)
      if (isBanned) {
        await unbanUserApi(user._id)
        toast.success('Đã mở khóa tài khoản')
      } else {
        await banUserApi(user._id)
        toast.success('Đã khóa tài khoản')
      }
      refetch()
    } catch (err) {
      toast.error(getApiErrorMessage(err, `Không thể ${action} tài khoản`))
    } finally {
      setActionId(null)
    }
  }

  return (
    <AdminTableShell
      title='Người dùng'
      subTitle='Quản lý tài khoản khách hàng — xem trạng thái, khóa/mở khóa.'
    >
      <div className='mb-6 grid gap-3 sm:grid-cols-3'>
        {[
          { icon: UserRound, label: 'Trang hiện tại', value: String(users.length) },
          { icon: ShieldCheck, label: 'Đã xác thực (trang)', value: String(stats.verified) },
          { icon: Ban, label: 'Đang khóa (trang)', value: String(stats.banned) }
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className='surface-card rounded-3xl p-4'>
            <div className='flex items-center gap-3'>
              <span className='grid h-10 w-10 place-items-center rounded-2xl bg-slate-100 text-ink-950'>
                <Icon size={18} />
              </span>
              <div>
                <div className='text-xs font-bold uppercase tracking-wider text-slate-400'>{label}</div>
                <div className='text-xl font-black text-ink-950'>{value}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className='mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <div className='relative max-w-md flex-1'>
          <Search className='pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400' size={17} />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            placeholder='Tìm theo tên, email, username...'
            className='h-11 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm font-semibold outline-none transition focus:border-brand-500/50 focus:ring-4 focus:ring-brand-500/10'
          />
        </div>
        <Button variant='secondary' onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw size={16} className={isFetching ? 'animate-spin' : ''} />
          Làm mới
        </Button>
      </div>

      {error ? (
        <div className='rounded-3xl border border-rose-200 bg-rose-50 p-6 text-center text-sm font-semibold text-rose-800'>
          {error}
        </div>
      ) : (
        <div className='overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-sm'>
          <table className='min-w-full text-left text-sm'>
            <thead className='border-b border-slate-100 bg-slate-50/80 text-xs font-black uppercase tracking-wider text-slate-500'>
              <tr>
                <th className='p-4'>Khách hàng</th>
                <th className='p-4'>Email</th>
                <th className='p-4'>Trạng thái</th>
                <th className='p-4'>Ngày tạo</th>
                <th className='p-4 text-right'>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array.from({ length: 5 }).map((_, index) => <SkeletonRow key={index} />)
                : users.length === 0
                  ? (
                    <tr>
                      <td colSpan={5} className='p-10 text-center text-sm font-semibold text-slate-500'>
                        Không tìm thấy người dùng nào.
                      </td>
                    </tr>
                  )
                  : users.map((user) => {
                      const verify = VERIFY_LABELS[user.verify_status ?? 0] ?? VERIFY_LABELS[0]
                      const isBanned = user.verify_status === 2
                      return (
                        <tr key={user._id} className='border-b border-slate-100 last:border-0'>
                          <td className='p-4'>
                            <div className='flex items-center gap-3'>
                              <span className='grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-2xl bg-brand-50 text-brand-700'>
                                {user.avatar ? (
                                  <img src={user.avatar} alt='' className='h-full w-full object-cover' />
                                ) : (
                                  <UserRound size={18} />
                                )}
                              </span>
                              <div>
                                <div className='font-black text-ink-950'>{user.name}</div>
                                <div className='text-xs text-slate-500'>@{user.username || '—'}</div>
                              </div>
                            </div>
                          </td>
                          <td className='p-4 font-semibold text-slate-600'>{user.email}</td>
                          <td className='p-4'>
                            <span className={cn('inline-flex rounded-full border px-3 py-1 text-xs font-bold', verify.tone)}>
                              {verify.label}
                            </span>
                          </td>
                          <td className='p-4 text-slate-500'>
                            {user.created_at ? new Date(user.created_at).toLocaleDateString('vi-VN') : '—'}
                          </td>
                          <td className='p-4 text-right'>
                            <button
                              type='button'
                              disabled={actionId === user._id}
                              onClick={() => handleBanToggle(user)}
                              className={cn(
                                'rounded-xl border px-3 py-2 text-xs font-black transition disabled:opacity-50',
                                isBanned
                                  ? 'border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                                  : 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100'
                              )}
                            >
                              {actionId === user._id ? 'Đang xử lý...' : isBanned ? 'Mở khóa' : 'Khóa'}
                            </button>
                          </td>
                        </tr>
                      )
                    })}
            </tbody>
          </table>
        </div>
      )}

      {pagination ? (
        <PaginationBar
          pagination={pagination}
          page={page}
          onPageChange={setPage}
          isLoading={isFetching}
          itemLabel='người dùng'
        />
      ) : null}
    </AdminTableShell>
  )
}
