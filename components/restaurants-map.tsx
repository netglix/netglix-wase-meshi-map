"use client";

import "leaflet/dist/leaflet.css";

import L from "leaflet";
import { useEffect } from "react";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";

import type { Restaurant } from "@/lib/restaurant-schema";

type RestaurantsMapProps = {
  restaurants: Restaurant[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  center: [number, number];
};

const markerIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function FocusMap({ restaurant }: { restaurant?: Restaurant }) {
  const map = useMap();

  useEffect(() => {
    if (!restaurant) return;
    map.flyTo([restaurant.lat, restaurant.lng], 15, { duration: 0.5 });
  }, [map, restaurant]);

  return null;
}

export function RestaurantsMap({
  restaurants,
  selectedId,
  onSelect,
  center,
}: RestaurantsMapProps) {
  const selectedRestaurant = restaurants.find((item) => item.id === selectedId);

  return (
    <MapContainer
      center={center}
      zoom={14}
      className="map-container"
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FocusMap restaurant={selectedRestaurant} />
      {restaurants.map((restaurant) => (
        <Marker
          key={restaurant.id}
          icon={markerIcon}
          position={[restaurant.lat, restaurant.lng]}
          eventHandlers={{ click: () => onSelect(restaurant.id) }}
        />
      ))}
    </MapContainer>
  );
}
