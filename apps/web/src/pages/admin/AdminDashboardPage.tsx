import { motion } from 'framer-motion'

export default function AdminDashboardPage() {
  const cards = [
    { label: 'Đơn hàng', value: '120', sub: '+12% so với hôm qua' },
    { label: 'Doanh thu', value: '50.000.000 ₫', sub: '+8.5% tuần này' },
    { label: 'Sản phẩm', value: '80', sub: 'Đang bán' },
    { label: 'Sắp hết hàng', value: '6', sub: 'Cần nhập thêm' }
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className='space-y-6'
    >
      {/* HEADER */}
      <div>
        <h1 className='text-2xl font-extrabold'>Bảng điều khiển</h1>
        <p className='mt-1 text-sm text-white/60'>Tổng quan hoạt động kinh doanh hôm nay</p>
      </div>

      {/* STATS */}
      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        {cards.map((c) => (
          <div
            key={c.label}
            className='rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/10'
          >
            <div className='text-sm text-white/60'>{c.label}</div>
            <div className='mt-2 text-2xl font-extrabold'>{c.value}</div>
            <div className='mt-1 text-xs text-white/45'>{c.sub}</div>
          </div>
        ))}
      </div>

      {/* PANELS */}
      <div className='grid gap-4 md:grid-cols-2'>
        {/* RECENT ORDERS */}
        <div className='rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur'>
          <div className='mb-4 flex items-center justify-between'>
            <div className='font-bold'>Đơn hàng gần đây</div>
            <button className='text-xs font-semibold text-white/55 hover:text-white'>Xem tất cả →</button>
          </div>

          <div className='space-y-2 text-sm'>
            {[
              { id: '#1023', status: 'processing', label: 'Chờ xử lý' },
              { id: '#1022', status: 'done', label: 'Hoàn thành' },
              { id: '#1021', status: 'cancel', label: 'Đã huỷ' }
            ].map((x) => (
              <div
                key={x.id}
                className='flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-3'
              >
                <div className='font-semibold'>{x.id}</div>

                <span
                  className={[
                    'rounded-full px-3 py-1 text-xs font-bold',
                    x.status === 'processing' && 'bg-orange-500/15 text-orange-300',
                    x.status === 'done' && 'bg-emerald-500/15 text-emerald-300',
                    x.status === 'cancel' && 'bg-rose-500/15 text-rose-300'
                  ].join(' ')}
                >
                  {x.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* LOW STOCK */}
        <div className='rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur'>
          <div className='mb-4 flex items-center justify-between'>
            <div className='font-bold'>Sản phẩm sắp hết hàng</div>
            <button className='text-xs font-semibold text-white/55 hover:text-white'>Quản lý kho →</button>
          </div>

          <div className='space-y-2 text-sm'>
            {[
              { name: 'Áo thun', qty: 2 },
              { name: 'Giày sneaker', qty: 1 },
              { name: 'Túi xách', qty: 0 }
            ].map((x) => (
              <div
                key={x.name}
                className='flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-3'
              >
                <div className='font-semibold'>{x.name}</div>

                <span
                  className={['text-sm font-extrabold', x.qty === 0 ? 'text-rose-400' : 'text-orange-300'].join(' ')}
                >
                  {x.qty === 0 ? 'Hết hàng' : `${x.qty} còn lại`}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
