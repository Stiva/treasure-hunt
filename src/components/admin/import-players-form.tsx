"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, Label } from "@/components/ui";
import { Loader2, Upload, FileSpreadsheet, AlertCircle, CheckCircle } from "lucide-react";

interface ImportPlayersFormProps {
  sessionId: number;
  locale: string;
}

interface ImportResult {
  imported: number;
  skipped: number;
  duplicateEmails: string[];
}

export function ImportPlayersForm({ sessionId, locale }: ImportPlayersFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const parseCSV = (text: string): Array<{ firstName: string; lastName: string; email: string }> => {
    const lines = text.trim().split(/\r?\n/);
    const players: Array<{ firstName: string; lastName: string; email: string }> = [];

    // Skip header row if present
    const startIndex = lines[0]?.toLowerCase().includes("email") ? 1 : 0;

    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Handle both comma and semicolon separators
      const parts = line.includes(";") ? line.split(";") : line.split(",");

      if (parts.length >= 3) {
        const firstName = parts[0]?.trim().replace(/^["']|["']$/g, "");
        const lastName = parts[1]?.trim().replace(/^["']|["']$/g, "");
        const email = parts[2]?.trim().replace(/^["']|["']$/g, "");

        if (firstName && lastName && email && email.includes("@")) {
          players.push({ firstName, lastName, email });
        }
      }
    }

    return players;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setError(null);
      setResult(null);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) {
      setError("Seleziona un file");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const text = await selectedFile.text();
      const players = parseCSV(text);

      if (players.length === 0) {
        setError("Nessun giocatore valido trovato nel file. Verifica il formato.");
        return;
      }

      const response = await fetch(`/api/admin/sessions/${sessionId}/players/import`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ players }),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.error || "Errore durante l'importazione");
        return;
      }

      setResult(data.data);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      router.refresh();
    } catch (err) {
      setError("Errore di connessione o file non valido");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-start gap-2">
          <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      {result && (
        <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-sm flex items-start gap-2">
          <CheckCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">
              {result.imported} giocatori importati con successo
              {result.skipped > 0 && `, ${result.skipped} saltati (email duplicate)`}
            </p>
            {result.duplicateEmails.length > 0 && (
              <p className="mt-1 text-green-500/80">
                Email duplicate: {result.duplicateEmails.join(", ")}
              </p>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Label htmlFor="file" className="mb-2 block">
            Seleziona File CSV o Excel
          </Label>
          <div className="relative">
            <Input
              ref={fileInputRef}
              id="file"
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileChange}
              className="file:mr-4 file:py-1 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-frost-600 file:text-white hover:file:bg-frost-500 file:cursor-pointer cursor-pointer"
            />
          </div>
          {selectedFile && (
            <p className="mt-2 text-sm text-frost-400 flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4" />
              {selectedFile.name}
            </p>
          )}
        </div>
        <div className="flex items-end">
          <Button
            onClick={handleImport}
            disabled={!selectedFile || isLoading}
            variant="sand"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Upload className="h-4 w-4 mr-2" />
            )}
            Importa
          </Button>
        </div>
      </div>

      <p className="text-xs text-frost-500">
        Formati supportati: CSV (separatori: virgola o punto e virgola). La prima
        riga può essere un'intestazione.
      </p>
    </div>
  );
}
