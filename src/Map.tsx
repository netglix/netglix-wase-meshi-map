import { useEffect } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { Restaurant } from './types';

type Props = {
  restaurants: Restaurant[];
  selectedId?: string;
  center: [number, number];
  onSelect: (id: string) => void;
};

function MapRecenter({ center }: { center: [number, number] }) {
  const map = useMap();

  useEffect(() => {
    map.setView(center);
  }, [center, map]);

  return null;
}

export default function Map({ restaurants, selectedId, center, onSelect }: Props) {
  useEffect(() => {
    const icon = L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconAnchor: [12, 41]
    });
    L.Marker.prototype.options.icon = icon;
  }, []);

  return (
    <MapContainer center={center} zoom={16} style={{ height: '100%', width: '100%' }} scrollWheelZoom>
      <MapRecenter center={center} />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {restaurants.map((restaurant) => (
        <Marker
          key={restaurant.id}
          position={[restaurant.lat, restaurant.lng]}
          eventHandlers={{
            click: () => onSelect(restaurant.id)
          }}
        >
          <Popup>
            <strong>{restaurant.name}</strong>
            <br />
            {restaurant.budget} / {restaurant.mood}
            {selectedId === restaurant.id ? <div>選択中</div> : null}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
