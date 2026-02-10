import { Link } from 'react-router-dom'

const products = Array.from({ length: 8 }).map((_, i) => ({
  id: i + 1,
  name: `Sản phẩm demo ${i + 1} – Hàng chính hãng, giao nhanh`,
  price: 199000 + i * 50000,
  sold: 120 + i * 37,
  rating: 4.6 - i * 0.05,
  discount: i % 2 === 0 ? 15 : 0
}))

export default function HomePage() {
  const money = (n: number) => n.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })

  return (
    <div className='space-y-6'>
      {/* HERO */}
      <div className='rounded-3xl border border-white/10 bg-black/25 p-6 backdrop-blur'>
        <div className='inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur'>
          <span className='h-2 w-2 rounded-full bg-orange-500' />
          Ưu đãi hôm nay – Deal ngon mỗi ngày
        </div>

        <h1 className='mt-4 text-2xl font-extrabold md:text-3xl'>
          Khám phá sản phẩm hot <br />
          <span className='bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent'>
            Giá tốt · Giao nhanh · Đổi trả dễ
          </span>
        </h1>

        <p className='mt-2 max-w-xl text-sm text-white/60'>
          Chọn sản phẩm bạn thích và đặt hàng trong vài giây. Vibrant Mart hỗ trợ giao hàng toàn quốc.
        </p>
      </div>

      {/* SECTION TITLE */}
      <div className='flex items-end justify-between gap-3'>
        <h2 className='text-xl font-extrabold'>Sản phẩm nổi bật</h2>
        <Link to='/user/products' className='text-sm font-semibold text-white/60 hover:text-white'>
          Xem tất cả →
        </Link>
      </div>

      {/* PRODUCTS */}
      <div className='grid grid-cols-2 gap-4 md:grid-cols-4'>
        {products.map((p) => (
          <div
            key={p.id}
            className='group overflow-hidden rounded-3xl border border-white/10 bg-black/25 backdrop-blur transition hover:-translate-y-1 hover:border-white/15 hover:shadow-2xl'
          >
            {/* IMAGE */}
            <div className='relative h-40 bg-white/5'>
              {p.discount > 0 && (
                <div className='absolute left-3 top-3 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-3 py-1 text-xs font-extrabold text-white'>
                  -{p.discount}%
                </div>
              )}
            </div>

            {/* BODY */}
            <div className='p-4'>
              <h3 className='line-clamp-2 text-sm font-bold text-white/90 group-hover:text-white'>{p.name}</h3>

              <div className='mt-2 flex items-center justify-between text-xs text-white/55'>
                <span>⭐ {p.rating.toFixed(1)}</span>
                <span>Đã bán {p.sold}</span>
              </div>

              <p className='mt-2 text-lg font-black text-orange-400'>{money(p.price)}</p>

              <Link
                to={`/user/products/${p.id}`}
                className='mt-3 block rounded-2xl bg-gradient-to-r from-orange-500 to-pink-500 py-2 text-center text-sm font-extrabold text-white transition hover:opacity-95'
              >
                Mua ngay
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
