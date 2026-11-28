import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, RefreshCw, Save, Sparkles, Trash2 } from 'lucide-react'
import { useForm, useWatch, type UseFormRegisterReturn } from 'react-hook-form'
import { toast } from 'sonner'
import AdminTableShell from '../../../components/ui/AdminTable'
import Button from '../../../components/ui/Button'
import Alert from '../../../components/ui/Alert'
import {
  createProductSchema,
  type CreateProductFormInput,
  type CreateProductFormValues
} from '../../../middlewares/products.middlewares'
import { useProductDetail } from '../../../hooks/useProductDetail'
import { getBrandsApi } from '../../../services/brands.services'
import { getCategoriesApi } from '../../../services/categories.services'
import ProductMediaPanel from '../../../components/admin/ProductMediaPanel'
import { useProductMedia } from '../../../hooks/useProductMedia'
import { deleteProductApi, updateProductApi } from '../../../services/products.services'
import { generateProductDescriptionApi } from '../../../services/ai.services'
import type { Product } from '../../../models/ProductRequests'
import { getApiErrorMessage } from '../../../utils/apiError'
import { ROUTE_PATHS } from '../../../routes/route.paths'
import { useConfirm } from '../../../components/ui/ConfirmDialog'

type SelectOption = { id: string; name: string }

type ApiOptionItem = { _id?: string; id?: string; name?: string; title?: string }

function InputError({ message }: { message?: string }) {
  if (!message) return null
  return <p className='mt-2 text-xs font-semibold text-rose-600'>{message}</p>
}

function findArrayData(value: unknown): unknown[] {
  if (Array.isArray(value)) return value
  if (!value || typeof value !== 'object') return []
  const obj = value as Record<string, unknown>
  for (const key of ['data', 'result', 'items', 'brands', 'categories']) {
    const found = findArrayData(obj[key])
    if (found.length) return found
  }
  return []
}

function normalizeOptions(response: unknown): SelectOption[] {
  return findArrayData(response)
    .map((item) => {
      const option = item as ApiOptionItem
      const id = String(option._id || option.id || '')
      return { id, name: option.name || option.title || id }
    })
    .filter((item) => item.id)
}

function objectIdToString(value: unknown): string {
  if (!value) return ''
  if (typeof value === 'string') return value
  if (typeof value === 'object' && value !== null && '$oid' in value) {
    return String((value as { $oid: string }).$oid)
  }
  return String(value)
}

function mapProductToDefaults(product: Product): CreateProductFormInput {
  const p = product as unknown as CreateProductFormInput & {
    brand_id?: unknown
    category_id?: unknown
  }
  return {
    name: p.name || '',
    price: p.price ?? 0,
    quantity: p.quantity ?? 0,
    description: p.description || '',
    rating_number: p.rating_number ?? 0,
    origin: p.origin || '',
    brand_id: objectIdToString(p.brand_id),
    category_id: objectIdToString(p.category_id),
    volume: p.volume,
    weight: p.weight,
    width: p.width,
    height: p.height,
    medias: []
  }
}

export default function AdminProductEditPage() {
  const { id } = useParams<{ id: string }>()
  const { data: product, isLoading: productLoading, error: productError } = useProductDetail(id)

  if (productLoading) {
    return (
      <div className='flex min-h-[320px] flex-col items-center justify-center gap-3'>
        <RefreshCw className='h-8 w-8 animate-spin text-brand-600' />
        <p className='text-sm font-semibold text-ink-500'>Đang tải sản phẩm...</p>
      </div>
    )
  }

  if (productError || !product || !id) {
    return (
      <Alert
        variant='error'
        title='Không tải được sản phẩm'
        desc={getApiErrorMessage(productError, 'Sản phẩm không tồn tại hoặc đã bị xóa.')}
      />
    )
  }

  return <ProductEditForm key={product._id} productId={id} product={product} />
}

function ProductEditForm({ productId, product }: { productId: string; product: Product }) {
  const confirm = useConfirm()
  const nav = useNavigate()
  const media = useProductMedia(product)
  const [submitError, setSubmitError] = useState('')
  const [brandOptions, setBrandOptions] = useState<SelectOption[]>([])
  const [categoryOptions, setCategoryOptions] = useState<SelectOption[]>([])
  const [optionLoading, setOptionLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting, isValid }
  } = useForm<CreateProductFormInput, unknown, CreateProductFormValues>({
    resolver: zodResolver(createProductSchema),
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: mapProductToDefaults(product)
  })

  const watchedValues = useWatch({ control })
  const canSubmit = useMemo(() => isValid && !isSubmitting, [isValid, isSubmitting])

  const handleGenerateDescription = async () => {
    const name = String(watchedValues?.name || '').trim()
    if (!name) {
      setSubmitError('Nhập tên sản phẩm trước khi dùng AI viết mô tả.')
      return
    }

    try {
      setAiLoading(true)
      setSubmitError('')
      const brand = brandOptions.find((item) => item.id === watchedValues?.brand_id)?.name
      const res = await generateProductDescriptionApi({
        name,
        brand,
        ingredients: watchedValues?.description || undefined,
        benefits: 'làm sạch, phục hồi hàng rào bảo vệ da, hỗ trợ routine skincare'
      })
      setValue('description', res.data.result.description, { shouldDirty: true, shouldValidate: true })
    } catch (error) {
      setSubmitError(getApiErrorMessage(error, 'AI chưa tạo được mô tả'))
    } finally {
      setAiLoading(false)
    }
  }

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setOptionLoading(true)
        const [brandsRes, categoriesRes] = await Promise.all([getBrandsApi(1, 100), getCategoriesApi(1, 100)])
        setBrandOptions(normalizeOptions(brandsRes))
        setCategoryOptions(normalizeOptions(categoriesRes))
      } catch {
        setSubmitError('Không thể tải danh sách thương hiệu hoặc danh mục.')
      } finally {
        setOptionLoading(false)
      }
    }
    fetchOptions()
  }, [])

  const onSubmit = async (values: CreateProductFormValues) => {
    try {
      setSubmitError('')
      const medias = await media.uploadAll()

      await updateProductApi(productId, { ...values, medias })
      toast.success('Cập nhật sản phẩm thành công')
      nav(ROUTE_PATHS.ADMIN_PRODUCTS)
    } catch (error) {
      setSubmitError(getApiErrorMessage(error, 'Không thể cập nhật sản phẩm'))
    }
  }

  const handleDelete = async () => {
    if (!(await confirm('Xóa sản phẩm này? Hành động không thể hoàn tác.'))) return
    try {
      setDeleting(true)
      await deleteProductApi(productId)
      toast.success('Đã xóa sản phẩm')
      nav(ROUTE_PATHS.ADMIN_PRODUCTS)
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Không thể xóa sản phẩm'))
    } finally {
      setDeleting(false)
    }
  }

  return (
    <AdminTableShell
      title='Chỉnh sửa sản phẩm'
      subTitle={`Cập nhật thông tin sản phẩm #${productId.slice(-8).toUpperCase()}`}
      createTo={ROUTE_PATHS.ADMIN_PRODUCTS}
      createLabel='Quay lại danh sách'
    >
      <div className='space-y-5'>
        {submitError ? <Alert variant='error' title='Không thể lưu' desc={submitError} /> : null}

        <form onSubmit={handleSubmit(onSubmit)} className='grid gap-6 2xl:grid-cols-[1.7fr_0.9fr]'>
          <section className='surface-strong rounded-3xl p-5 md:p-7'>
            <div className='mb-7'>
              <h2 className='text-xl font-black text-ink-950'>Thông tin sản phẩm</h2>
            </div>

            <div className='grid gap-5 md:grid-cols-2'>
              <label className='md:col-span-2'>
                <div className='mb-2 text-sm font-black text-ink-950'>Tên sản phẩm</div>
                <input {...register('name')} className='premium-input h-14 text-base' />
                <InputError message={errors.name?.message} />
              </label>

              <label>
                <div className='mb-2 text-sm font-black text-ink-950'>Thương hiệu</div>
                <select {...register('brand_id')} disabled={optionLoading} className='premium-input h-14 cursor-pointer text-base disabled:opacity-60'>
                  <option value=''>{optionLoading ? 'Đang tải...' : 'Chọn thương hiệu'}</option>
                  {brandOptions.map((brand) => (
                    <option key={brand.id} value={brand.id}>
                      {brand.name}
                    </option>
                  ))}
                </select>
                <InputError message={errors.brand_id?.message} />
              </label>

              <label>
                <div className='mb-2 text-sm font-black text-ink-950'>Danh mục</div>
                <select {...register('category_id')} disabled={optionLoading} className='premium-input h-14 cursor-pointer text-base disabled:opacity-60'>
                  <option value=''>{optionLoading ? 'Đang tải...' : 'Chọn danh mục'}</option>
                  {categoryOptions.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <InputError message={errors.category_id?.message} />
              </label>

              <FormInput label='Giá bán (VND)' type='number' register={register('price', { valueAsNumber: true })} error={errors.price?.message} />
              <FormInput label='Tồn kho' type='number' register={register('quantity', { valueAsNumber: true })} error={errors.quantity?.message} />
              <FormInput label='Xuất xứ' register={register('origin')} error={errors.origin?.message} />

              <FormInput
                label='Dung tích'
                type='number'
                register={register('volume', { setValueAs: (value) => (value === '' ? undefined : Number(value)) })}
                error={errors.volume?.message}
              />
              <FormInput
                label='Trọng lượng'
                type='number'
                register={register('weight', { setValueAs: (value) => (value === '' ? undefined : Number(value)) })}
                error={errors.weight?.message}
              />
              <FormInput
                label='Độ rộng'
                type='number'
                register={register('width', { setValueAs: (value) => (value === '' ? undefined : Number(value)) })}
                error={errors.width?.message}
              />
              <FormInput
                label='Độ cao'
                type='number'
                register={register('height', { setValueAs: (value) => (value === '' ? undefined : Number(value)) })}
                error={errors.height?.message}
              />

              <label className='md:col-span-2'>
                <div className='mb-2 flex items-center justify-between gap-3'>
                  <span className='text-sm font-black text-ink-950'>Mô tả</span>
                  <button
                    type='button'
                    onClick={handleGenerateDescription}
                    disabled={aiLoading}
                    className='inline-flex items-center gap-1.5 rounded-full border border-ink-200 bg-white px-3 py-1 text-xs font-bold text-berry-600 transition hover:bg-berry-50 disabled:opacity-50'
                  >
                    <Sparkles size={13} />
                    {aiLoading ? 'AI đang viết...' : 'AI viết mô tả'}
                  </button>
                </div>
                <textarea rows={7} {...register('description')} className='w-full resize-none rounded-2xl border border-ink-200 bg-white px-4 py-4 text-base font-semibold text-ink-950 outline-none transition focus:border-brand-500/[0.55] focus:ring-4 focus:ring-brand-500/10' />
                <InputError message={errors.description?.message} />
              </label>
            </div>

            <div className='mt-7 flex flex-col gap-3 sm:flex-row'>
              <Button type='submit' disabled={!canSubmit} loading={isSubmitting}>
                <Save size={18} />
                Cập nhật
              </Button>
              <Link to={ROUTE_PATHS.ADMIN_PRODUCTS} className='inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl px-5 text-sm font-bold text-ink-600 transition hover:bg-ink-100 hover:text-ink-950'>
                <ArrowLeft size={16} />
                Quay lại
              </Link>
            </div>
          </section>

          <section className='surface-card space-y-5 rounded-3xl p-5 md:p-7'>
            <div>
              <h2 className='text-xl font-black text-ink-950'>Hình ảnh & video</h2>
              <p className='mt-2 text-sm text-ink-500'>Xóa hoặc thêm rồi bấm lưu để áp dụng.</p>
            </div>

            <ProductMediaPanel media={media} onError={setSubmitError} disabled={isSubmitting} />

            <div className='rounded-3xl border border-ink-200 bg-ink-50 p-5 text-sm'>
              <PreviewRow label='Tên' value={watchedValues?.name || '-'} />
              <PreviewRow label='Giá' value={`${Number(watchedValues?.price || 0).toLocaleString('vi-VN')}đ`} />
              <PreviewRow label='Tồn kho' value={String(watchedValues?.quantity || 0)} />
              <PreviewRow label='Ảnh' value={String(media.imageCount)} />
              <PreviewRow label='Video' value={media.video ? 'Có' : 'Không'} />
            </div>

            <div className='rounded-3xl border border-rose-200 bg-rose-50 p-4'>
              <div className='text-sm font-black text-rose-900'>Khu vực nguy hiểm</div>
              <p className='mt-1 text-xs text-rose-700'>Không nên xóa sản phẩm đang có đơn hàng liên quan.</p>
              <Button type='button' variant='danger' full className='mt-3' loading={deleting} onClick={handleDelete}>
                <Trash2 size={16} />
                Xóa sản phẩm
              </Button>
            </div>
          </section>
        </form>
      </div>
    </AdminTableShell>
  )
}

function FormInput({
  label,
  register,
  error,
  type = 'text'
}: {
  label: string
  register: UseFormRegisterReturn
  error?: string
  type?: string
}) {
  return (
    <label>
      <div className='mb-2 text-sm font-black text-ink-950'>{label}</div>
      <input type={type} min={type === 'number' ? 0 : undefined} {...register} className='premium-input h-14 text-base' />
      <InputError message={error} />
    </label>
  )
}

function PreviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className='flex items-center justify-between gap-3 py-1'>
      <span className='text-ink-500'>{label}</span>
      <span className='font-black text-ink-950'>{value}</span>
    </div>
  )
}
