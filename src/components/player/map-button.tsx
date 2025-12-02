"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui";
import { Map, Navigation } from "lucide-react";

// Dynamic import per evitare SSR issues con Leaflet
const MapModal = dynamic(
  () => import("./map-modal").then((mod) => mod.MapModal),
  { ssr: false }
);

interface MapButtonProps {
  locale: string;
  destinationCoords?: {
    latitude: string;
    longitude: string;
  } | null;
}

export function MapButton({ locale, destinationCoords }: MapButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const hasDestination = destinationCoords?.latitude && destinationCoords?.longitude;

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-20 left-4 z-40 h-12 w-12 rounded-full shadow-lg border-frost-600/50 hover:bg-night-700 hover:border-frost-500 ${
          hasDestination
            ? "bg-sand-600 border-sand-500 animate-pulse"
            : "bg-night-800"
        }`}
        title={
          hasDestination
            ? locale === "it"
              ? "GPS attivo - Vedi destinazione sulla mappa"
              : "GPS active - See destination on map"
            : locale === "it"
            ? "Apri mappa"
            : "Open map"
        }
      >
        {hasDestination ? (
          <Navigation className="h-5 w-5 text-white" />
        ) : (
          <Map className="h-5 w-5 text-frost-400" />
        )}
      </Button>
      <MapModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        locale={locale}
        destinationCoords={destinationCoords}
      />
    </>
  );
}
