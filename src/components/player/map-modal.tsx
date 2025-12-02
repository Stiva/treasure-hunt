"use client";

import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { Button } from "@/components/ui";
import { X, Navigation, Loader2, LocateFixed } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix per le icone marker in Next.js
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: () => string })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "/leaflet/marker-icon-2x.png",
  iconUrl: "/leaflet/marker-icon.png",
  shadowUrl: "/leaflet/marker-shadow.png",
});

// Custom red icon for destination marker
const destinationIcon = new L.Icon({
  iconUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23ef4444' stroke='%23991b1b' stroke-width='1'%3E%3Cpath d='M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z'/%3E%3C/svg%3E",
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -36],
});

// Componente per centrare la mappa sulla posizione
function RecenterControl({ position }: { position: [number, number] }) {
  const map = useMap();

  const handleRecenter = () => {
    map.setView(position, 17, { animate: true });
  };

  return (
    <div className="leaflet-top leaflet-right">
      <div className="leaflet-control leaflet-bar">
        <button
          onClick={handleRecenter}
          className="bg-white hover:bg-gray-100 p-2 rounded shadow-md"
          title="Centra sulla posizione"
        >
          <LocateFixed className="h-5 w-5 text-gray-700" />
        </button>
      </div>
    </div>
  );
}

// Componente per aggiornare la posizione del marker
function LocationMarker({
  position,
  locale,
}: {
  position: [number, number];
  locale: string;
}) {
  const map = useMap();

  useEffect(() => {
    map.setView(position, map.getZoom());
  }, [position, map]);

  return (
    <Marker position={position}>
      <Popup>{locale === "it" ? "Sei qui!" : "You are here!"}</Popup>
    </Marker>
  );
}

interface MapModalProps {
  isOpen: boolean;
  onClose: () => void;
  locale: string;
  destinationCoords?: {
    latitude: string;
    longitude: string;
  } | null;
}

export function MapModal({ isOpen, onClose, locale, destinationCoords }: MapModalProps) {
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Parse destination coordinates
  const destinationPosition: [number, number] | null =
    destinationCoords?.latitude && destinationCoords?.longitude
      ? [parseFloat(destinationCoords.latitude), parseFloat(destinationCoords.longitude)]
      : null;
  const [isLoading, setIsLoading] = useState(true);
  const [accuracy, setAccuracy] = useState<number | null>(null);

  useEffect(() => {
    if (!isOpen) {
      // Reset state quando la modale si chiude
      setPosition(null);
      setError(null);
      setIsLoading(true);
      setAccuracy(null);
      return;
    }

    if (!navigator.geolocation) {
      setError(
        locale === "it"
          ? "Geolocalizzazione non supportata dal tuo browser"
          : "Geolocation not supported by your browser"
      );
      setIsLoading(false);
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setPosition([pos.coords.latitude, pos.coords.longitude]);
        setAccuracy(pos.coords.accuracy);
        setIsLoading(false);
        setError(null);
      },
      (err) => {
        let errorMessage: string;
        switch (err.code) {
          case err.PERMISSION_DENIED:
            errorMessage =
              locale === "it"
                ? "Permesso di geolocalizzazione negato. Abilita la posizione nelle impostazioni del browser."
                : "Geolocation permission denied. Enable location in browser settings.";
            break;
          case err.POSITION_UNAVAILABLE:
            errorMessage =
              locale === "it"
                ? "Posizione non disponibile. Assicurati che il GPS sia attivo."
                : "Position unavailable. Make sure GPS is enabled.";
            break;
          case err.TIMEOUT:
            errorMessage =
              locale === "it"
                ? "Timeout nella richiesta della posizione. Riprova."
                : "Position request timed out. Please try again.";
            break;
          default:
            errorMessage =
              locale === "it"
                ? "Errore nel recupero della posizione"
                : "Error getting position";
        }
        setError(errorMessage);
        setIsLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 5000,
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [isOpen, locale]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-card rounded-2xl w-full max-w-lg overflow-hidden border border-border shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Navigation className="h-5 w-5 text-muted-foreground" />
            {locale === "it" ? "La tua posizione" : "Your position"}
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Map Container */}
        <div className="h-80 relative">
          {isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted z-10">
              <Loader2 className="h-10 w-10 animate-spin text-muted-foreground mb-3" />
              <p className="text-muted-foreground text-sm">
                {locale === "it"
                  ? "Ricerca posizione..."
                  : "Getting position..."}
              </p>
            </div>
          )}
          {error && !position && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted p-6 text-center z-10">
              <div className="p-4 rounded-xl bg-error/10 border border-error/30 mb-4">
                <p className="text-error">{error}</p>
              </div>
              <Button variant="outline" size="sm" onClick={onClose}>
                {locale === "it" ? "Chiudi" : "Close"}
              </Button>
            </div>
          )}
          {position && (
            <MapContainer
              center={destinationPosition || position}
              zoom={destinationPosition ? 15 : 17}
              className="h-full w-full"
              zoomControl={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <LocationMarker position={position} locale={locale} />
              <RecenterControl position={position} />
              {/* Destination marker */}
              {destinationPosition && (
                <Marker position={destinationPosition} icon={destinationIcon}>
                  <Popup>
                    {locale === "it"
                      ? "Destinazione - Prossima tappa"
                      : "Destination - Next stage"}
                  </Popup>
                </Marker>
              )}
            </MapContainer>
          )}
        </div>

        {/* Footer con info */}
        <div className="p-3 border-t border-border bg-muted/50">
          {destinationPosition && (
            <div className="flex items-center gap-2 mb-2 text-xs text-accent">
              <div className="w-3 h-3 bg-error rounded-full" />
              <span>
                {locale === "it"
                  ? "Marker rosso = Destinazione (prossima tappa)"
                  : "Red marker = Destination (next stage)"}
              </span>
            </div>
          )}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {locale === "it"
                ? "Posizione aggiornata in tempo reale"
                : "Position updates in real-time"}
            </span>
            {accuracy && (
              <span>
                {locale === "it" ? "Precisione" : "Accuracy"}: ~
                {Math.round(accuracy)}m
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
