"use client";

import { useState } from "react";
import { Map, X } from "lucide-react";
import { Button, Card, CardContent } from "@/components/ui";
import { LocationsMapWrapper } from "./locations-map-wrapper";

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

interface LocationsMapToggleProps {
  locations: LocationData[];
  locale: string;
}

export function LocationsMapToggle({ locations, locale }: LocationsMapToggleProps) {
  const [showMap, setShowMap] = useState(false);

  // Check if any location has coordinates
  const hasLocationsWithCoords = locations.some(
    (loc) => loc.latitude && loc.longitude
  );

  if (!hasLocationsWithCoords && locations.length > 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowMap(!showMap)}
          className="gap-2"
        >
          {showMap ? (
            <>
              <X className="h-4 w-4" />
              {locale === "it" ? "Nascondi Mappa" : "Hide Map"}
            </>
          ) : (
            <>
              <Map className="h-4 w-4" />
              {locale === "it" ? "Mostra Mappa" : "Show Map"}
            </>
          )}
        </Button>
      </div>

      {showMap && (
        <Card variant="frost">
          <CardContent className="pt-4">
            <LocationsMapWrapper locations={locations} locale={locale} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
