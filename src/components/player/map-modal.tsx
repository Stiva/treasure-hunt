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
}

export function MapModal({ isOpen, onClose, locale }: MapModalProps) {
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [error, setError] = useState<string | null>(null);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="bg-night-900 rounded-xl w-full max-w-lg overflow-hidden border border-frost-700/30 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-frost-700/30">
          <h2 className="text-lg font-semibold text-frost-100 flex items-center gap-2">
            <Navigation className="h-5 w-5 text-frost-400" />
            {locale === "it" ? "La tua posizione" : "Your position"}
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Map Container */}
        <div className="h-80 relative">
          {isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-night-800 z-10">
              <Loader2 className="h-10 w-10 animate-spin text-frost-400 mb-3" />
              <p className="text-frost-400 text-sm">
                {locale === "it"
                  ? "Ricerca posizione..."
                  : "Getting position..."}
              </p>
            </div>
          )}
          {error && !position && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-night-800 p-6 text-center z-10">
              <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 mb-4">
                <p className="text-red-400">{error}</p>
              </div>
              <Button variant="outline" size="sm" onClick={onClose}>
                {locale === "it" ? "Chiudi" : "Close"}
              </Button>
            </div>
          )}
          {position && (
            <MapContainer
              center={position}
              zoom={17}
              className="h-full w-full"
              zoomControl={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <LocationMarker position={position} locale={locale} />
              <RecenterControl position={position} />
            </MapContainer>
          )}
        </div>

        {/* Footer con info */}
        <div className="p-3 border-t border-frost-700/30 bg-night-800/50">
          <div className="flex items-center justify-between text-xs text-frost-500">
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
