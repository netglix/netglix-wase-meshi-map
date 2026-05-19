/* Map component rendered only on client */
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

type Place = {
  name: string
  budget: string
  open_hours: string
  photo_url?: string
  comment?: string
  mood?: string
  lat: number
  lng: number
}

export default function Map({ places, center, onSelect }: { places: Place[]; center: [number, number]; onSelect?: (p: Place) => void }) {
  return (
    <MapContainer center={center} zoom={16} style={{ height: '100%', width: '100%' }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {places.map((p, i) => (
        <CircleMarker
          key={i}
          center={[p.lat, p.lng] as any}
          radius={8}
          pathOptions={{ color: '#ff5722' }}
          eventHandlers={{
            click: () => onSelect && onSelect(p)
          }}
        >
          <Popup>
            <div style={{width:200}}>
              <strong>{p.name}</strong>
              <div style={{fontSize:12}}>{p.budget} ・ {p.open_hours}</div>
              <div style={{marginTop:8}}>{p.comment}</div>
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  )
}
