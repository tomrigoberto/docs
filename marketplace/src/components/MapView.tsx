"use client";

import { useEffect, useState } from "react";
import { DEFAULT_LAT, DEFAULT_LNG } from "@/lib/location";

interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  label: string;
  type?: string;
  icon?: string;
}

interface MapViewProps {
  markers: MapMarker[];
  center?: { lat: number; lng: number };
  zoom?: number;
  onMarkerClick?: (id: string) => void;
  className?: string;
}

export function MapView({
  markers,
  center,
  zoom = 12,
  onMarkerClick,
  className = "h-[400px] w-full rounded-2xl",
}: MapViewProps) {
  const [MapComponent, setMapComponent] = useState<any>(null);

  useEffect(() => {
    // Dynamic import to avoid SSR issues with Leaflet
    import("leaflet").then((L) => {
      import("react-leaflet").then(({ MapContainer, TileLayer, Marker, Popup }) => {
        // Fix leaflet default marker icon
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
          iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
          shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
        });

        const mapCenter = center || { lat: DEFAULT_LAT, lng: DEFAULT_LNG };

        const Map = () => (
          <MapContainer
            center={[mapCenter.lat, mapCenter.lng]}
            zoom={zoom}
            className={className}
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {markers.map((m) => (
              <Marker key={m.id} position={[m.lat, m.lng]}>
                <Popup>
                  <div
                    className="cursor-pointer text-center font-medium"
                    onClick={() => onMarkerClick?.(m.id)}
                  >
                    <span className="text-lg">{m.icon || "📍"}</span>
                    <br />
                    {m.label}
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        );

        setMapComponent(() => Map);
      });
    });
  }, [markers, center, zoom, className, onMarkerClick]);

  if (!MapComponent) {
    return (
      <div className={`${className} flex items-center justify-center bg-gray-100 rounded-2xl`}>
        <div className="text-center text-gray-400">
          <span className="text-3xl">🗺️</span>
          <p className="mt-2 text-sm">Loading map...</p>
        </div>
      </div>
    );
  }

  return <MapComponent />;
}
