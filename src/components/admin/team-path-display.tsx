"use client";

import { useEffect, useState } from "react";
import { MapPin, Navigation, Flag, Loader2 } from "lucide-react";

interface PathStep {
  order: number;
  locationName: string;
  locationCode: string;
  isStart: boolean;
  isEnd: boolean;
}

interface TeamPathDisplayProps {
  teamId: number;
}

export function TeamPathDisplay({ teamId }: TeamPathDisplayProps) {
  const [path, setPath] = useState<PathStep[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/admin/teams/${teamId}/path`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setPath(data.data);
        } else {
          setError(data.error || "Errore nel caricamento");
        }
        setIsLoading(false);
      })
      .catch(() => {
        setError("Errore di connessione");
        setIsLoading(false);
      });
  }, [teamId]);

  if (isLoading) {
    return (
      <div className="mt-3 pt-3 border-t border-night-700">
        <div className="flex items-center gap-2 text-frost-500 text-sm">
          <Loader2 className="h-3 w-3 animate-spin" />
          <span>Caricamento percorso...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-3 pt-3 border-t border-night-700">
        <p className="text-red-400 text-sm">{error}</p>
      </div>
    );
  }

  if (!path || path.length === 0) {
    return (
      <div className="mt-3 pt-3 border-t border-night-700">
        <p className="text-frost-500 text-sm italic">Nessun percorso assegnato</p>
      </div>
    );
  }

  return (
    <div className="mt-3 pt-3 border-t border-night-700">
      <p className="text-xs text-frost-500 mb-2">Percorso assegnato:</p>
      <div className="flex flex-wrap items-center gap-1.5 text-xs">
        {path.map((step, index) => (
          <span key={step.order} className="flex items-center gap-1">
            {step.isStart ? (
              <span
                className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-green-500/20 text-green-400 font-medium"
                title={step.locationCode}
              >
                <Navigation className="h-3 w-3 flex-shrink-0" />
                <span>{step.locationName || "Partenza"}</span>
              </span>
            ) : step.isEnd ? (
              <span
                className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-sand-500/20 text-sand-400 font-medium"
                title={step.locationCode}
              >
                <Flag className="h-3 w-3 flex-shrink-0" />
                <span>{step.locationName || "Arrivo"}</span>
              </span>
            ) : (
              <span
                className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-frost-600/20 text-frost-300 font-medium"
                title={step.locationCode}
              >
                <MapPin className="h-3 w-3 flex-shrink-0" />
                <span>{step.locationName || `Tappa ${step.order}`}</span>
              </span>
            )}
            {index < path.length - 1 && (
              <span className="text-frost-600 font-bold">→</span>
            )}
          </span>
        ))}
      </div>
    </div>
  );
}
