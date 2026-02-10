import { Link } from 'react-router-dom'
import Button from '../../components/ui/Button'
import Alert from '../../components/ui/Alert'

export default function CartPage() {
  const cartItems = [
    { id: 1, name: 'Sản phẩm A', price: 390000, qty: 1, stock: 8 },
    { id: 2, name: 'Sản phẩm B', price: 1490000, qty: 2, stock: 1 }
  ]

  const money = (n: number) => n.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })

  const subtotal = cartItems.reduce((s, x) => s + x.price * x.qty, 0)
  const totalQty = cartItems.reduce((s, x) => s + x.qty, 0)

  const stockFail = cartItems.some((x) => x.qty > x.stock)

  // MOCK phí ship
  const shippingFee = subtotal >= 1500000 ? 0 : 25000
  const total = subtotal + shippingFee

  const freeShipTarget = 1500000
  const needMoreForFreeShip = Math.max(0, freeShipTarget - subtotal)

  /* EMPTY STATE */
  if (cartItems.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center rounded-3xl border border-white/10 bg-black/25 p-10 text-center backdrop-blur'>
        <div className='text-lg font-extrabold'>Giỏ hàng trống</div>
        <p className='mt-2 text-sm text-white/60'>Bạn chưa thêm sản phẩm nào vào giỏ hàng.</p>

        <div className='mt-6 w-56'>
          <Link to='/user/home'>
            <Button full variant='gradient'>
              Bắt đầu mua sắm
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className='space-y-5'>
      {/* HEADER */}
      <div className='flex items-end justify-between gap-3'>
        <div>
          <h1 className='text-xl font-extrabold'>
            Giỏ hàng <span className='text-sm font-semibold text-white/50'>({totalQty} sản phẩm)</span>
          </h1>
          <p className='mt-1 text-sm text-white/60'>Kiểm tra sản phẩm và số lượng trước khi thanh toán.</p>
        </div>

        <Link to='/user/home' className='text-sm font-semibold text-white/60 hover:text-white'>
          Mua thêm →
        </Link>
      </div>

      {/* WARNING */}
      {stockFail && (
        <Alert
          variant='warning'
          title='Số lượng vượt tồn kho'
          desc='Vui lòng điều chỉnh số lượng sản phẩm trước khi thanh toán.'
        />
      )}

      {/* FREESHIP TIP */}
      {needMoreForFreeShip > 0 ? (
        <div className='rounded-3xl border border-white/10 bg-white/5 p-4 text-sm text-white/70 backdrop-blur'>
          Thêm <span className='font-extrabold text-white'>{money(needMoreForFreeShip)}</span> để được{' '}
          <span className='font-extrabold text-white'>miễn phí vận chuyển</span>.
        </div>
      ) : (
        <div className='rounded-3xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-100 backdrop-blur'>
          🎉 Bạn đã đủ điều kiện <span className='font-extrabold'>miễn phí vận chuyển</span>.
        </div>
      )}

      <div className='grid gap-4 md:grid-cols-3'>
        {/* CART ITEMS */}
        <div className='space-y-3 md:col-span-2'>
          {cartItems.map((x) => {
            const fail = x.qty > x.stock

            return (
              <div key={x.id} className='rounded-3xl border border-white/10 bg-black/25 p-4 backdrop-blur'>
                <div className='flex gap-4'>
                  {/* IMAGE */}
                  <div className='h-24 w-24 rounded-2xl bg-white/5' />

                  {/* INFO */}
                  <div className='flex-1'>
                    <div className='flex justify-between gap-4'>
                      <div>
                        <div className='text-sm font-extrabold'>{x.name}</div>
                        <div className='mt-1 text-xs text-white/55'>Còn lại: {x.stock} sản phẩm</div>
                      </div>

                      <button className='text-sm font-semibold text-rose-300 hover:text-rose-400 hover:underline'>
                        Xóa
                      </button>
                    </div>

                    <div className='mt-4 flex items-center justify-between'>
                      {/* PRICE */}
                      <div>
                        <div className='text-xs text-white/55'>
                          {money(x.price)} × {x.qty}
                        </div>
                        <div className='text-lg font-black'>{money(x.price * x.qty)}</div>
                      </div>

                      {/* QTY */}
                      <div className='flex items-center gap-2'>
                        <button
                          disabled={x.qty <= 1}
                          className='h-10 w-10 rounded-2xl bg-white/10 transition hover:bg-white/12 disabled:opacity-40'
                        >
                          −
                        </button>

                        <span className='w-8 text-center font-bold'>{x.qty}</span>

                        <button
                          disabled={x.qty >= x.stock}
                          className='h-10 w-10 rounded-2xl bg-white/10 transition hover:bg-white/12 disabled:opacity-40'
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {fail && (
                      <div className='mt-3 rounded-2xl border border-rose-500/25 bg-rose-500/10 p-3 text-sm text-rose-100'>
                        Số lượng vượt quá tồn kho cho phép.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* SUMMARY */}
        <div className='h-fit rounded-3xl border border-white/10 bg-black/25 p-4 backdrop-blur'>
          <div className='mb-4 font-extrabold'>Tóm tắt thanh toán</div>

          <div className='space-y-2 text-sm'>
            <div className='flex justify-between text-white/70'>
              <span>Tạm tính</span>
              <span className='font-semibold text-white'>{money(subtotal)}</span>
            </div>

            <div className='flex justify-between text-white/70'>
              <span>Phí vận chuyển</span>
              <span className='font-semibold text-white'>{shippingFee === 0 ? 'Miễn phí' : money(shippingFee)}</span>
            </div>

            <div className='my-3 h-px bg-white/10' />

            <div className='flex justify-between'>
              <span className='text-white/70'>Tổng thanh toán</span>
              <span className='text-lg font-black'>{money(total)}</span>
            </div>
          </div>

          <div className='mt-4 space-y-2'>
            <Link to='/user/checkout'>
              <Button full variant='gradient' disabled={stockFail}>
                Thanh toán ngay
              </Button>
            </Link>

            {stockFail && (
              <p className='text-center text-xs text-rose-200/80'>Không thể thanh toán khi số lượng vượt tồn kho.</p>
            )}

            <Link to='/user/home'>
              <Button full variant='secondary'>
                Tiếp tục mua sắm
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
