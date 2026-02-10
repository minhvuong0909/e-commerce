export default function AdminDashboardPage() {
  const cards = [
    { label: 'Orders', value: '120', icon: '🧾' },
    { label: 'Revenue', value: '50,000,000₫', icon: '💰' },
    { label: 'Products', value: '80', icon: '📦' },
    { label: 'Low Stock', value: '6', icon: '⚠️' }
  ]

  return (
    <div>
      <h1 className='text-2xl font-extrabold text-gray-900'>Dashboard</h1>
      <p className='mt-1 text-gray-600'>Tổng quan hoạt động hệ thống (demo UI).</p>

      <div className='mt-6 grid gap-6 md:grid-cols-4'>
        {cards.map((c) => (
          <div key={c.label} className='rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5'>
            <div className='flex items-center justify-between'>
              <div className='text-sm text-gray-500'>{c.label}</div>
              <div className='text-xl'>{c.icon}</div>
            </div>
            <div className='mt-2 text-2xl font-extrabold text-gray-900'>{c.value}</div>
          </div>
        ))}
      </div>

      <div className='mt-6 grid gap-6 md:grid-cols-2'>
        <div className='rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5'>
          <div className='font-bold text-gray-900'>Recent Orders</div>
          <div className='mt-3 space-y-3 text-sm'>
            {['#1023 Pending', '#1022 Completed', '#1021 Cancelled'].map((x) => (
              <div key={x} className='flex items-center justify-between rounded-2xl border p-3'>
                <span className='font-semibold'>{x}</span>
                <span className='text-gray-500'>View</span>
              </div>
            ))}
          </div>
        </div>

        <div className='rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5'>
          <div className='font-bold text-gray-900'>Low Stock Products</div>
          <div className='mt-3 space-y-3 text-sm'>
            {['Áo thun (2)', 'Giày sneaker (1)', 'Túi xách (0)'].map((x) => (
              <div key={x} className='flex items-center justify-between rounded-2xl border p-3'>
                <span className='font-semibold'>{x}</span>
                <span className='text-red-600 font-bold'>⚠️</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
