import { Link, useLocation } from 'react-router-dom'

const orders = [
  {
    id: 1,
    code: '#1023',
    status: 'processing',
    statusLabel: 'Đang xử lý',
    total: 299000,
    items: 3,
    date: '11/02/2026'
  },
  {
    id: 2,
    code: '#1022',
    status: 'shipping',
    statusLabel: 'Đang giao',
    total: 890000,
    items: 2,
    date: '09/02/2026'
  },
  {
    id: 3,
    code: '#1021',
    status: 'done',
    statusLabel: 'Hoàn tất',
    total: 1490000,
    items: 1,
    date: '05/02/2026'
  }
] as const

type Status = 'all' | 'processing' | 'shipping' | 'done' | 'cancel'

export default function MyOrdersPage() {
  const location = useLocation()
  const money = (n: number) => n.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })

  const statusFromQuery = new URLSearchParams(location.search).get('status') as Status | null
  const activeStatus: Status = statusFromQuery || 'all'

  const tabs: { label: string; value: Status }[] = [
    { label: 'Tất cả', value: 'all' },
    { label: 'Đang xử lý', value: 'processing' },
    { label: 'Đang giao', value: 'shipping' },
    { label: 'Hoàn tất', value: 'done' }
  ]

  const filtered = activeStatus === 'all' ? orders : orders.filter((o) => o.status === activeStatus)

  const badgeClass = (status: string) => {
    if (status === 'processing') return 'bg-orange-500/15 text-orange-200 border-orange-500/20'
    if (status === 'shipping') return 'bg-sky-500/15 text-sky-200 border-sky-500/20'
    if (status === 'done') return 'bg-emerald-500/15 text-emerald-200 border-emerald-500/20'
    return 'bg-white/10 text-white/70 border-white/10'
  }

  return (
    <div className='space-y-5'>
      {/* HEADER */}
      <div>
        <h1 className='text-xl font-extrabold'>Đơn hàng của tôi</h1>
        <p className='mt-1 text-sm text-white/60'>Theo dõi trạng thái và xem chi tiết các đơn hàng bạn đã đặt.</p>
      </div>

      {/* TABS */}
      <div className='flex flex-wrap gap-2'>
        {tabs.map((t) => {
          const active = activeStatus === t.value
          return (
            <Link
              key={t.value}
              to={`/user/orders${t.value === 'all' ? '' : `?status=${t.value}`}`}
              className={[
                'rounded-2xl px-4 py-2 text-sm font-semibold transition',
                active ? 'bg-white/12 text-white' : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
              ].join(' ')}
            >
              {t.label}
            </Link>
          )
        })}
      </div>

      {/* EMPTY */}
      {filtered.length === 0 ? (
        <div className='rounded-3xl border border-white/10 bg-black/25 p-10 text-center text-white/70 backdrop-blur'>
          <div className='text-lg font-extrabold text-white'>Chưa có đơn hàng</div>
          <p className='mt-2 text-sm text-white/60'>Bạn chưa có đơn hàng nào trong mục này.</p>

          <div className='mt-6'>
            <Link
              to='/user/home'
              className='inline-flex rounded-2xl bg-gradient-to-r from-orange-500 to-pink-500 px-6 py-3 text-sm font-extrabold text-white'
            >
              Tiếp tục mua sắm
            </Link>
          </div>
        </div>
      ) : (
        <div className='overflow-hidden rounded-3xl border border-white/10 bg-black/25 backdrop-blur'>
          {filtered.map((o) => (
            <Link key={o.id} to={`/user/orders/${o.id}`} className='block p-4 transition hover:bg-white/5'>
              <div className='flex items-start justify-between gap-4'>
                <div>
                  <div className='flex items-center gap-2'>
                    <span className='text-sm font-extrabold'>Mã đơn {o.code}</span>
                    <span
                      className={['rounded-full border px-3 py-1 text-xs font-extrabold', badgeClass(o.status)].join(
                        ' '
                      )}
                    >
                      {o.statusLabel}
                    </span>
                  </div>

                  <div className='mt-1 text-sm text-white/70'>
                    {o.items} sản phẩm • Đặt ngày {o.date}
                  </div>
                </div>

                <div className='text-right'>
                  <div className='text-xs text-white/55'>Tổng thanh toán</div>
                  <div className='text-lg font-black text-orange-300'>{money(o.total)}</div>
                  <div className='mt-1 text-xs text-white/55'>Xem chi tiết →</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
