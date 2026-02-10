import { Link } from 'react-router-dom'
import AdminTableShell from '../../../components/ui/AdminTable'
const orders = [
  { id: 1023, user: 'Nguyễn Văn A', total: 299000, status: 'PENDING' },
  { id: 1022, user: 'Trần Thị B', total: 899000, status: 'COMPLETED' },
  { id: 1021, user: 'Lê Văn C', total: 499000, status: 'CANCELLED' }
]

function StatusChip({ status }: { status: string }) {
  const map: Record<string, string> = {
    PENDING: 'bg-yellow-50 text-yellow-700',
    COMPLETED: 'bg-green-50 text-green-700',
    CANCELLED: 'bg-red-50 text-red-700'
  }

  return <span className={`rounded-full px-3 py-1 font-semibold ${map[status]}`}>{status}</span>
}

export default function AdminOrdersPage() {
  return (
    <AdminTableShell title='Orders'>
      <table className='w-full text-sm'>
        <thead className='bg-gray-50 text-gray-600'>
          <tr>
            <th className='p-4 text-left'>Order</th>
            <th className='p-4 text-left'>Customer</th>
            <th className='p-4 text-left'>Total</th>
            <th className='p-4 text-left'>Status</th>
            <th className='p-4 text-left'>Actions</th>
          </tr>
        </thead>

        <tbody>
          {orders.map((o) => (
            <tr key={o.id} className='border-t'>
              <td className='p-4 font-semibold'>#{o.id}</td>
              <td className='p-4'>{o.user}</td>
              <td className='p-4'>₫ {o.total.toLocaleString()}</td>
              <td className='p-4'>
                <StatusChip status={o.status} />
              </td>
              <td className='p-4'>
                <Link
                  to={`/admin/orders/${o.id}`}
                  className='rounded-xl border px-3 py-1 font-semibold hover:bg-gray-50'
                >
                  👁 View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </AdminTableShell>
  )
}
