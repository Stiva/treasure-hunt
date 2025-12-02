"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

// Dynamic import to avoid SSR issues with Leaflet
const LocationsMap = dynamic(
  () => import("./locations-map").then((mod) => mod.LocationsMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-80 flex items-center justify-center bg-muted rounded-lg border border-border">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    ),
  }
);

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

interface LocationsMapWrapperProps {
  locations: LocationData[];
  locale: string;
}

export function LocationsMapWrapper({ locations, locale }: LocationsMapWrapperProps) {
  return <LocationsMap locations={locations} locale={locale} />;
}
