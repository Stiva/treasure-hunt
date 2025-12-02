"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for marker icons in Next.js
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: () => string })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "/leaflet/marker-icon-2x.png",
  iconUrl: "/leaflet/marker-icon.png",
  shadowUrl: "/leaflet/marker-shadow.png",
});

// Custom icons for different location types
const startIcon = new L.Icon({
  iconUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2322c55e' stroke='%23166534' stroke-width='1'%3E%3Cpath d='M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z'/%3E%3C/svg%3E",
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -36],
});

const intermediateIcon = new L.Icon({
  iconUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%235B8FC2' stroke='%231e3a5f' stroke-width='1'%3E%3Cpath d='M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z'/%3E%3C/svg%3E",
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -36],
});

const endIcon = new L.Icon({
  iconUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23D4A84B' stroke='%238B6914' stroke-width='1'%3E%3Cpath d='M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z'/%3E%3C/svg%3E",
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -36],
});

// Component to fit bounds to all markers
function FitBounds({ locations }: { locations: Array<{ lat: number; lng: number }> }) {
  const map = useMap();

  useEffect(() => {
    if (locations.length === 0) return;

    if (locations.length === 1) {
      map.setView([locations[0].lat, locations[0].lng], 16);
    } else {
      const bounds = L.latLngBounds(locations.map((loc) => [loc.lat, loc.lng]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [locations, map]);

  return null;
}

interface LocationData {
  id: number;
  nameIt: string;
  nameEn: string;
  code: string;
  latitude: string | null;
  longitude: string | null;
  isStart: boolean;
  isEnd: boolean;
  orderIndex: number;
}

interface LocationsMapProps {
  locations: LocationData[];
  locale: string;
}

export function LocationsMap({ locations, locale }: LocationsMapProps) {
  // Filter locations with valid coordinates
  const locationsWithCoords = locations.filter(
    (loc) => loc.latitude && loc.longitude
  );

  if (locationsWithCoords.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center bg-muted rounded-lg border border-border">
        <p className="text-muted-foreground">
          {locale === "it"
            ? "Nessuna tappa ha coordinate GPS configurate"
            : "No locations have GPS coordinates configured"}
        </p>
      </div>
    );
  }

  // Default center: Carpi, Italy
  const defaultCenter: [number, number] = [44.7833, 10.8833];

  // Prepare coordinates for bounds fitting
  const boundsCoords = locationsWithCoords.map((loc) => ({
    lat: parseFloat(loc.latitude!),
    lng: parseFloat(loc.longitude!),
  }));

  const getIcon = (location: LocationData) => {
    if (location.isStart) return startIcon;
    if (location.isEnd) return endIcon;
    return intermediateIcon;
  };

  const getLocationTypeLabel = (location: LocationData) => {
    if (location.isStart) return locale === "it" ? "Partenza" : "Start";
    if (location.isEnd) return locale === "it" ? "Arrivo" : "End";
    return locale === "it" ? "Tappa intermedia" : "Intermediate";
  };

  return (
    <div className="space-y-2">
      <div className="h-80 rounded-lg overflow-hidden border border-border">
        <MapContainer
          center={defaultCenter}
          zoom={13}
          className="h-full w-full"
          zoomControl={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <FitBounds locations={boundsCoords} />
          {locationsWithCoords.map((location, index) => (
            <Marker
              key={location.id}
              position={[
                parseFloat(location.latitude!),
                parseFloat(location.longitude!),
              ]}
              icon={getIcon(location)}
            >
              <Popup>
                <div className="text-sm">
                  <div className="font-semibold text-foreground">
                    {index + 1}. {locale === "it" ? location.nameIt : location.nameEn}
                  </div>
                  <div className="text-muted-foreground mt-1">
                    {getLocationTypeLabel(location)}
                  </div>
                  <div className="mt-1">
                    <code className="text-xs bg-muted px-1 py-0.5 rounded">
                      {location.code}
                    </code>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span>{locale === "it" ? "Partenza" : "Start"}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-primary" />
          <span>{locale === "it" ? "Intermedie" : "Intermediate"}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-accent" />
          <span>{locale === "it" ? "Arrivo" : "End"}</span>
        </div>
        {locationsWithCoords.length < locations.length && (
          <div className="text-error">
            {locale === "it"
              ? `${locations.length - locationsWithCoords.length} tappe senza coordinate`
              : `${locations.length - locationsWithCoords.length} locations without coordinates`}
          </div>
        )}
      </div>
    </div>
  );
}
