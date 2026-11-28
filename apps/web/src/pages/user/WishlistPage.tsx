import { Link } from 'react-router-dom'
import { ArrowRight, Heart, LogIn } from 'lucide-react'
import ProductCard, { CARD_TINTS } from '../../components/ui/ProductCard'
import ProductCardSkeleton from '../../components/ui/ProductCardSkeleton'
import EmptyState from '../../components/ui/EmptyState'
import { useWishlist, useWishlistProducts } from '../../hooks/useWishlist'
import { ROUTE_PATHS } from '../../routes/route.paths'

export default function WishlistPage() {
  const { count, isSignedIn } = useWishlist()
  const { products, isLoading, isError } = useWishlistProducts()
  const hidden = Math.max(0, count - products.length)

  return (
    <div className='mx-auto max-w-[1320px] px-4 py-8 md:px-6 md:py-12'>
      <div className='flex flex-wrap items-end justify-between gap-4'>
        <div>
          <h1 className='font-display text-4xl font-bold md:text-5xl'>
            Yêu thích <span className='text-ink-300'>({isLoading ? '…' : products.length})</span>
          </h1>
          <p className='mt-2 text-ink-600'>
            {isSignedIn ? 'Đã lưu vào tài khoản — xem lại trên mọi thiết bị.' : 'Đang lưu trên trình duyệt này.'}
          </p>
        </div>
      </div>

      {!isSignedIn && count > 0 ? (
        <div className='mt-6 flex flex-col gap-3 rounded-2xl border border-berry-100 bg-berry-50 p-4 sm:flex-row sm:items-center sm:justify-between'>
          <p className='text-sm text-ink-700'>Đăng nhập để giữ danh sách này khi đổi máy hoặc xóa dữ liệu trình duyệt.</p>
          <Link
            to={ROUTE_PATHS.AUTH_LOGIN}
            state={{ from: ROUTE_PATHS.USER_WISHLIST }}
            className='inline-flex h-10 shrink-0 items-center gap-2 rounded-lg bg-berry-600 px-4 text-sm font-semibold text-white hover:bg-berry-700'
          >
            <LogIn size={16} /> Đăng nhập
          </Link>
        </div>
      ) : null}

      <div className='mt-8'>
        {isLoading ? (
          <div className='grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-3 md:gap-x-5 lg:grid-cols-4' aria-busy='true'>
            {Array.from({ length: 4 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : isError ? (
          <EmptyState icon={<Heart size={28} />} title='Không tải được danh sách yêu thích' desc='Vui lòng thử lại sau ít phút.' />
        ) : products.length === 0 ? (
          <EmptyState
            icon={<Heart size={28} />}
            title='Chưa có sản phẩm yêu thích'
            desc='Bấm vào biểu tượng trái tim trên sản phẩm để lưu lại và mua sau.'
            action={
              <Link
                to={ROUTE_PATHS.USER_HOME}
                className='inline-flex h-12 items-center gap-2 rounded-lg bg-berry-600 px-7 font-semibold text-white hover:bg-berry-700'
              >
                Khám phá sản phẩm <ArrowRight size={18} />
              </Link>
            }
          />
        ) : (
          <>
            <div className='grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-3 md:gap-x-5 md:gap-y-10 lg:grid-cols-4'>
              {products.map((product, i) => (
                <ProductCard key={product._id} product={product} tint={CARD_TINTS[i % CARD_TINTS.length]} />
              ))}
            </div>
            {hidden > 0 ? (
              <p className='mt-8 text-center text-sm text-ink-500'>
                {hidden} sản phẩm đã ngừng bán nên không còn hiển thị.
              </p>
            ) : null}
          </>
        )}
      </div>
    </div>
  )
}
