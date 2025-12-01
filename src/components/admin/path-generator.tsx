"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
} from "@/components/ui";
import {
  Route,
  Loader2,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Sparkles,
} from "lucide-react";

interface PathGeneratorProps {
  sessionId: number;
  teamsCount: number;
  locationsCount: number;
  hasStart: boolean;
  hasEnd: boolean;
  teamsWithPaths: number;
}

interface PathsInfo {
  canGeneratePaths: boolean;
  validationError?: string;
  stats: {
    totalTeams: number;
    teamsWithPaths: number;
    teamsWithoutPaths: number;
    totalLocations: number;
    intermediateLocations: number;
    maxUniquePaths: number;
    canBeUnique: boolean;
  };
}

export function PathGenerator({
  sessionId,
  teamsCount,
  locationsCount,
  hasStart,
  hasEnd,
  teamsWithPaths: initialTeamsWithPaths,
}: PathGeneratorProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [teamsWithPaths, setTeamsWithPaths] = useState(initialTeamsWithPaths);

  const canGenerate = hasStart && hasEnd && teamsCount > 0 && locationsCount >= 2;
  const pathsGenerated = teamsWithPaths > 0;

  const handleGeneratePaths = async (regenerate = false) => {
    if (regenerate) {
      setIsRegenerating(true);
    } else {
      setIsLoading(true);
    }
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`/api/admin/sessions/${sessionId}/paths`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ regenerate }),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.error || "Errore durante la generazione");
        return;
      }

      setSuccess(data.message || `${data.data.pathsGenerated} percorsi generati!`);
      setTeamsWithPaths(data.data.pathsGenerated);
      router.refresh();
    } catch (err) {
      setError("Errore di connessione");
    } finally {
      setIsLoading(false);
      setIsRegenerating(false);
    }
  };

  return (
    <Card variant="frost">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Route className="h-5 w-5 text-sand-400" />
          Generazione Percorsi
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status */}
        <div className="flex items-center gap-3 p-3 rounded-lg bg-night-800/50">
          {pathsGenerated ? (
            <>
              <CheckCircle className="h-5 w-5 text-green-400" />
              <div>
                <p className="text-frost-200 font-medium">
                  Percorsi generati: {teamsWithPaths}/{teamsCount}
                </p>
                <p className="text-xs text-frost-500">
                  Ogni squadra ha un percorso unico assegnato
                </p>
              </div>
            </>
          ) : (
            <>
              <AlertCircle className="h-5 w-5 text-sand-400" />
              <div>
                <p className="text-frost-200 font-medium">
                  Percorsi non ancora generati
                </p>
                <p className="text-xs text-frost-500">
                  Genera i percorsi per permettere ai giocatori di iniziare
                </p>
              </div>
            </>
          )}
        </div>

        {/* Validation warnings */}
        {!canGenerate && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30">
            <p className="text-sm text-red-400">
              Per generare i percorsi è necessario:
            </p>
            <ul className="text-xs text-red-300 mt-2 space-y-1 list-disc list-inside">
              {!hasStart && <li>Configurare una tappa di partenza</li>}
              {!hasEnd && <li>Configurare una tappa finale</li>}
              {teamsCount === 0 && <li>Creare almeno una squadra</li>}
              {locationsCount < 2 && <li>Aggiungere almeno 2 tappe</li>}
            </ul>
          </div>
        )}

        {/* Error/Success messages */}
        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-sm">
            {success}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-3">
          {!pathsGenerated ? (
            <Button
              variant="sand"
              onClick={() => handleGeneratePaths(false)}
              disabled={!canGenerate || isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4 mr-2" />
              )}
              Genera Percorsi
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={() => handleGeneratePaths(true)}
              disabled={!canGenerate || isRegenerating}
            >
              {isRegenerating ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Rigenera Percorsi
            </Button>
          )}
        </div>

        {/* Info */}
        <p className="text-xs text-frost-500">
          La generazione crea percorsi unici per ogni squadra con le stesse tappe
          di partenza e arrivo, ma ordine diverso delle tappe intermedie.
        </p>
      </CardContent>
    </Card>
  );
}
