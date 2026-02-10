import { useParams, useNavigate, Link } from 'react-router-dom'
import { useMemo, useState } from 'react'
import Button from '../../components/ui/Button'
import Alert from '../../components/ui/Alert'

export default function ProductDetailPage() {
  const { id } = useParams()
  const nav = useNavigate()

  // MOCK DATA
  const product = useMemo(() => {
    return {
      id,
      name: `Sản phẩm demo #${id} – Hàng chính hãng, giao nhanh`,
      price: 299000,
      originalPrice: 399000,
      rating: 4.8,
      sold: 1240,
      stock: 8,
      brand: 'Vibrant Official',
      desc: 'Sản phẩm chất lượng cao, thiết kế hiện đại, phù hợp sử dụng hằng ngày. Hỗ trợ đổi trả trong 7 ngày nếu sản phẩm lỗi.'
    }
  }, [id])

  const [qty, setQty] = useState(1)

  const money = (n: number) => n.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })

  const discount = Math.max(0, Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100))

  const outOfStock = product.stock <= 0
  const overStock = qty > product.stock

  const inc = () => setQty((q) => Math.min(product.stock, q + 1))
  const dec = () => setQty((q) => Math.max(1, q - 1))

  return (
    <div className='space-y-6'>
      {/* TOP */}
      <div className='grid gap-8 md:grid-cols-2'>
        {/* IMAGE */}
        <div className='relative overflow-hidden rounded-3xl border border-white/10 bg-black/25 backdrop-blur'>
          <div className='h-80 bg-white/5' />

          {/* BADGES */}
          <div className='absolute left-4 top-4 flex gap-2'>
            <span className='rounded-full bg-white/10 px-3 py-1 text-xs font-extrabold text-white'>Chính hãng</span>
            {discount > 0 && (
              <span className='rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-3 py-1 text-xs font-extrabold text-white'>
                -{discount}%
              </span>
            )}
          </div>
        </div>

        {/* INFO */}
        <div>
          <Link
            to='/user/home'
            className='flex justify-end text-sm font-semibold text-white/55 hover:text-white transition '
          >
            ← Quay lại
          </Link>

          <h1 className='mt-3 text-2xl font-extrabold'>{product.name}</h1>

          <div className='mt-2 flex flex-wrap items-center gap-3 text-sm text-white/60'>
            <span>⭐ {product.rating}</span>
            <span>Đã bán {product.sold.toLocaleString('vi-VN')}</span>
            <span className='rounded-full bg-white/5 px-3 py-1'>{product.brand}</span>
          </div>

          {/* PRICE */}
          <div className='mt-4 flex items-end gap-3'>
            <div className='text-3xl font-black text-orange-400'>{money(product.price)}</div>

            {discount > 0 && (
              <div className='pb-1 text-sm text-white/45 line-through'>{money(product.originalPrice)}</div>
            )}
          </div>

          {/* STOCK */}
          <div className='mt-2 text-sm text-white/60'>
            Còn lại: <span className='font-bold text-white'>{product.stock}</span> sản phẩm
          </div>

          {/* WARNING */}
          {(outOfStock || overStock) && (
            <div className='mt-4'>
              <Alert
                variant='warning'
                title={outOfStock ? 'Hết hàng' : 'Vượt tồn kho'}
                desc={
                  outOfStock
                    ? 'Sản phẩm hiện đã hết hàng, vui lòng quay lại sau.'
                    : 'Vui lòng giảm số lượng để phù hợp tồn kho.'
                }
              />
            </div>
          )}

          {/* QTY */}
          <div className='mt-5 flex items-center gap-4'>
            <div className='text-sm font-semibold text-white/70'>Số lượng</div>

            <div className='flex items-center gap-2'>
              <button
                onClick={dec}
                disabled={qty <= 1}
                className='h-10 w-10 rounded-2xl bg-white/10 font-extrabold transition hover:bg-white/12 disabled:opacity-40'
              >
                −
              </button>

              <span className='w-10 text-center text-lg font-bold'>{qty}</span>

              <button
                onClick={inc}
                disabled={qty >= product.stock}
                className='h-10 w-10 rounded-2xl bg-white/10 font-extrabold transition hover:bg-white/12 disabled:opacity-40'
              >
                +
              </button>
            </div>
          </div>

          {/* CTA */}
          <div className='mt-6 grid gap-3 sm:grid-cols-2'>
            <Button full variant='gradient' disabled={outOfStock || overStock} onClick={() => nav('/user/cart')}>
              Thêm vào giỏ
            </Button>

            <Button full variant='secondary' disabled={outOfStock || overStock} onClick={() => nav('/user/checkout')}>
              Mua ngay
            </Button>
          </div>

          <p className='mt-3 text-xs text-white/45'>
            Đổi trả miễn phí trong 7 ngày. Hỗ trợ kiểm tra hàng trước khi nhận.
          </p>
        </div>
      </div>

      {/* DESCRIPTION */}
      <div className='grid gap-4 md:grid-cols-3'>
        <div className='rounded-3xl border border-white/10 bg-black/25 p-5 backdrop-blur md:col-span-2'>
          <div className='text-lg font-extrabold'>Mô tả sản phẩm</div>
          <p className='mt-3 text-sm leading-relaxed text-white/70'>{product.desc}</p>
        </div>

        <div className='rounded-3xl border border-white/10 bg-black/25 p-5 backdrop-blur'>
          <div className='text-lg font-extrabold'>Thông tin giao hàng</div>

          <div className='mt-3 space-y-3 text-sm text-white/70'>
            <div className='flex justify-between'>
              <span className='text-white/55'>Giao tiêu chuẩn</span>
              <span className='font-semibold text-white'>2–4 ngày</span>
            </div>

            <div className='flex justify-between'>
              <span className='text-white/55'>Giao nhanh</span>
              <span className='font-semibold text-white'>1–2 ngày</span>
            </div>

            <div className='flex justify-between'>
              <span className='text-white/55'>Phí vận chuyển</span>
              <span className='font-semibold text-white'>Từ 15.000 ₫</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
