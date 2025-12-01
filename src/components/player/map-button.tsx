"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui";
import { Map } from "lucide-react";

// Dynamic import per evitare SSR issues con Leaflet
const MapModal = dynamic(
  () => import("./map-modal").then((mod) => mod.MapModal),
  { ssr: false }
);

interface MapButtonProps {
  locale: string;
}

export function MapButton({ locale }: MapButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 left-4 z-40 h-12 w-12 rounded-full shadow-lg bg-night-800 border-frost-600/50 hover:bg-night-700 hover:border-frost-500"
        title={locale === "it" ? "Apri mappa" : "Open map"}
      >
        <Map className="h-5 w-5 text-frost-400" />
      </Button>
      <MapModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        locale={locale}
      />
    </>
  );
}
