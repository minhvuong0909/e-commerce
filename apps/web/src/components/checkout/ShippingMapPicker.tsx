import { useMemo } from 'react'
import { MapContainer, Marker, TileLayer, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
import 'leaflet/dist/leaflet.css'

const defaultIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

L.Marker.prototype.options.icon = defaultIcon

type ShippingMapPickerProps = {
  storeLat: number
  storeLng: number
  value?: { lat: number; lng: number } | null
  onPick: (coords: { lat: number; lng: number }) => void
}

function MapClickHandler({ onPick }: { onPick: (coords: { lat: number; lng: number }) => void }) {
  useMapEvents({
    click(event) {
      onPick({ lat: event.latlng.lat, lng: event.latlng.lng })
    }
  })
  return null
}

export default function ShippingMapPicker({ storeLat, storeLng, value, onPick }: ShippingMapPickerProps) {
  const center = useMemo(
    () => [value?.lat ?? storeLat, value?.lng ?? storeLng] as [number, number],
    [storeLat, storeLng, value?.lat, value?.lng]
  )

  return (
    <div className='overflow-hidden rounded-2xl border border-slate-200'>
      <MapContainer center={center} zoom={14} scrollWheelZoom className='h-72 w-full'>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
        />
        <Marker position={[storeLat, storeLng]} />
        {value ? <Marker position={[value.lat, value.lng]} /> : null}
        <MapClickHandler onPick={onPick} />
      </MapContainer>
      <p className='border-t border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-500'>
        Nhấn vào bản đồ để chọn vị trí giao hàng. Marker cửa hàng: 160 Lã Xuân Oai.
      </p>
    </div>
  )
}
