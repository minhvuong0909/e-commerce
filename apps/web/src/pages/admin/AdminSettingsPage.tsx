import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import { getShopSettingsApi, updateShopSettingsApi, type ShopSettings } from '../../services/shop_settings.services'

const emptySettings: ShopSettings = {
  shop_name: 'Vibrant Mart',
  logo_url: '',
  banner_url: '',
  hotline: '',
  zalo_url: '',
  messenger_url: '',
  warehouse_address: '',
  return_policy: ''
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<ShopSettings>(emptySettings)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    getShopSettingsApi()
      .then((res) => setSettings({ ...emptySettings, ...res.data.result }))
      .catch(() => setSettings(emptySettings))
  }, [])

  const patch = (key: keyof ShopSettings, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  const save = async () => {
    try {
      setLoading(true)
      const res = await updateShopSettingsApi(settings)
      setSettings({ ...emptySettings, ...res.data.result })
      toast.success('Đã lưu cài đặt shop')
    } catch {
      toast.error('Không thể lưu cài đặt shop')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='space-y-6'>
      <div>
        <p className='text-xs font-bold uppercase tracking-[0.16em] text-[#b07a72]'>Storefront settings</p>
        <h1 className='mt-1 text-3xl font-black text-[#3d3330]'>Cài đặt shop</h1>
        <p className='mt-2 text-sm text-[#8a7a74]'>
          Quản lý thông tin hiển thị ngoài trang bán hàng: logo, banner, hotline, Zalo/Messenger và địa chỉ kho.
        </p>
      </div>

      <div className='grid gap-4 rounded-lg border border-[#eaded8] bg-white p-5 md:grid-cols-2'>
        <Input label='Tên shop' name='shop_name' value={settings.shop_name} onChange={(e) => patch('shop_name', e.target.value)} />
        <Input label='Hotline' name='hotline' value={settings.hotline || ''} onChange={(e) => patch('hotline', e.target.value)} />
        <Input label='Logo URL' name='logo_url' value={settings.logo_url || ''} onChange={(e) => patch('logo_url', e.target.value)} />
        <Input label='Banner URL' name='banner_url' value={settings.banner_url || ''} onChange={(e) => patch('banner_url', e.target.value)} />
        <Input label='Zalo URL' name='zalo_url' value={settings.zalo_url || ''} onChange={(e) => patch('zalo_url', e.target.value)} />
        <Input
          label='Messenger URL'
          name='messenger_url'
          value={settings.messenger_url || ''}
          onChange={(e) => patch('messenger_url', e.target.value)}
        />
        <div className='md:col-span-2'>
          <Input
            label='Địa chỉ kho'
            name='warehouse_address'
            value={settings.warehouse_address || ''}
            onChange={(e) => patch('warehouse_address', e.target.value)}
          />
        </div>
        <div className='md:col-span-2'>
          <label className='mb-2 block text-sm font-semibold text-[#3d3330]'>Chính sách đổi trả</label>
          <textarea
            value={settings.return_policy || ''}
            onChange={(e) => patch('return_policy', e.target.value)}
            rows={5}
            className='w-full rounded-md border border-[#eaded8] px-4 py-3 text-sm outline-none focus:border-[#cbb8af] focus:ring-2 focus:ring-[#f5d5cf]/50'
          />
        </div>
      </div>

      <Button onClick={save} loading={loading} className='!rounded-md !bg-[#3d3330] hover:!bg-[#2a2421]'>
        Lưu cài đặt
      </Button>
    </div>
  )
}
