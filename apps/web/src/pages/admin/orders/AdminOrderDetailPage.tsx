import { Link, useParams } from 'react-router-dom'

export default function AdminOrderDetailPage() {
  const { id } = useParams()

  // demo data
  const status = 'PENDING'

  return (
    <div>
      <div className='flex items-center justify-between'>
        <h1 className='text-2xl font-extrabold'>Order #{id}</h1>
        <Link to='/admin/orders' className='font-semibold text-primary'>
          ← Back
        </Link>
      </div>

      <div className='mt-6 grid gap-6 md:grid-cols-3'>
        <div className='md:col-span-2 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5'>
          <div className='font-bold text-gray-900'>Items</div>

          <div className='mt-4 space-y-3'>
            {[
              { name: 'Áo thun', qty: 2, price: 199000 },
              { name: 'Giày sneaker', qty: 1, price: 499000 }
            ].map((x, idx) => (
              <div key={idx} className='flex items-center justify-between rounded-2xl border p-4'>
                <div>
                  <div className='font-semibold'>{x.name}</div>
                  <div className='text-sm text-gray-500'>Qty: {x.qty}</div>
                </div>
                <div className='font-bold'>₫ {x.price.toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>

        <div className='rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5'>
          <div className='font-bold text-gray-900'>Summary</div>

          <div className='mt-4 space-y-2 text-sm'>
            <div className='flex justify-between'>
              <span>Customer</span>
              <span className='font-semibold'>Nguyễn Văn A</span>
            </div>
            <div className='flex justify-between'>
              <span>Delivery</span>
              <span className='font-semibold'>Standard</span>
            </div>
            <div className='flex justify-between'>
              <span>Payment</span>
              <span className='font-semibold'>COD</span>
            </div>
            <div className='flex justify-between'>
              <span>Status</span>
              <span className='font-semibold'>{status}</span>
            </div>

            <div className='border-t pt-3 flex justify-between font-bold'>
              <span>Total</span>
              <span className='text-primary'>₫ 897.000</span>
            </div>
          </div>

          <div className='mt-5 grid gap-2'>
            <button className='rounded-2xl border bg-white px-4 py-2 font-semibold hover:bg-gray-50'>
              Update Status (demo)
            </button>
            <button className='rounded-2xl border bg-white px-4 py-2 font-semibold hover:bg-gray-50'>
              Print Invoice (demo)
            </button>
          </div>

          <div className='mt-4 text-xs text-gray-500'>
            ⚠️ Admin không bị rule “Cancel Pending” như User, nhưng vẫn nên quản lý status chuẩn.
          </div>
        </div>
      </div>
    </div>
  )
}
