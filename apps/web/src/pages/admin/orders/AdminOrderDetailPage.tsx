import { Link, useParams } from 'react-router-dom'
import { Printer, RefreshCw } from 'lucide-react'
import Button from '../../../components/ui/Button'
import StatusBadge from '../../../components/ui/StatusBadge'

export default function AdminOrderDetailPage() {
  const { id } = useParams()
  const status = 'PENDING'

  return (
    <div className='space-y-6'>
      <div className='flex flex-col gap-3 md:flex-row md:items-center md:justify-between'>
        <div>
          <p className='text-xs font-black uppercase tracking-[0.18em] text-brand-600'>Order detail</p>
          <h1 className='mt-1 text-3xl font-black tracking-tight text-ink-950'>Order #{id}</h1>
          <p className='mt-2 text-sm text-slate-500'>Kiểm tra sản phẩm, thanh toán và trạng thái giao hàng.</p>
        </div>
        <Link to='/admin/orders' className='text-sm font-black text-brand-600 hover:text-brand-900'>
          Quay lại
        </Link>
      </div>

      <div className='grid gap-6 md:grid-cols-3'>
        <section className='surface-strong rounded-3xl p-6 md:col-span-2'>
          <div className='font-black text-ink-950'>Items</div>

          <div className='mt-4 space-y-3'>
            {[
              { name: 'Áo thun', qty: 2, price: 199000 },
              { name: 'Giày sneaker', qty: 1, price: 499000 }
            ].map((item) => (
              <div key={item.name} className='flex items-center justify-between rounded-3xl border border-slate-200 bg-slate-50 p-4'>
                <div>
                  <div className='font-black text-ink-950'>{item.name}</div>
                  <div className='text-sm font-semibold text-slate-500'>Qty: {item.qty}</div>
                </div>
                <div className='font-black text-ink-950'>₫ {item.price.toLocaleString('vi-VN')}</div>
              </div>
            ))}
          </div>
        </section>

        <aside className='surface-card rounded-3xl p-6'>
          <div className='font-black text-ink-950'>Summary</div>

          <div className='mt-4 space-y-3 text-sm'>
            <SummaryRow label='Customer' value='Nguyễn Văn A' />
            <SummaryRow label='Delivery' value='Standard' />
            <SummaryRow label='Payment' value='COD' />
            <div className='flex items-center justify-between gap-3'>
              <span className='text-slate-500'>Status</span>
              <StatusBadge tone='processing'>{status}</StatusBadge>
            </div>

            <div className='border-t border-slate-200 pt-3'>
              <SummaryRow label='Total' value='₫ 897.000' strong />
            </div>
          </div>

          <div className='mt-5 grid gap-2'>
            <Button variant='secondary'>
              <RefreshCw size={16} />
              Update Status
            </Button>
            <Button variant='secondary'>
              <Printer size={16} />
              Print Invoice
            </Button>
          </div>
        </aside>
      </div>
    </div>
  )
}

function SummaryRow({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className='flex justify-between gap-3'>
      <span className='text-slate-500'>{label}</span>
      <span className={strong ? 'font-black text-brand-700' : 'font-black text-ink-950'}>{value}</span>
    </div>
  )
}
