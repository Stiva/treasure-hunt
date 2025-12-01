"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Button,
  Input,
  Label,
  Textarea,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui";
import { Loader2, Info } from "lucide-react";
import type { Location } from "@/lib/db/schema";

interface LocationFormProps {
  location?: Location;
  sessionId: number;
  locale: string;
  locationsCount: number;
}

export function LocationForm({
  location,
  sessionId,
  locale,
  locationsCount,
}: LocationFormProps) {
  const t = useTranslations("admin");
  const router = useRouter();
  const isEditing = !!location;

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    code: location?.code || "",
    nameIt: location?.nameIt || "",
    nameEn: location?.nameEn || "",
    riddleIt: location?.riddleIt || "",
    riddleEn: location?.riddleEn || "",
    hint1It: location?.hint1It || "",
    hint1En: location?.hint1En || "",
    hint2It: location?.hint2It || "",
    hint2En: location?.hint2En || "",
    hint3It: location?.hint3It || "",
    hint3En: location?.hint3En || "",
    isStart: location?.isStart || false,
    isEnd: location?.isEnd || false,
    orderIndex: location?.orderIndex ?? locationsCount,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const url = isEditing
        ? `/api/admin/sessions/${sessionId}/locations/${location.id}`
        : `/api/admin/sessions/${sessionId}/locations`;
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.error || "Errore durante il salvataggio");
        return;
      }

      router.push(`/${locale}/admin/sessions/${sessionId}/locations`);
      router.refresh();
    } catch (err) {
      setError("Errore di connessione");
    } finally {
      setIsLoading(false);
    }
  };

  const updateField = (field: string, value: string | boolean | number) => {
    setFormData((prev) => {
      const newData = { ...prev, [field]: value };
      // If setting as start, can't be end
      if (field === "isStart" && value === true) {
        newData.isEnd = false;
      }
      // If setting as end, can't be start
      if (field === "isEnd" && value === true) {
        newData.isStart = false;
      }
      return newData;
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Basic Info */}
      <Card variant="frost">
        <CardHeader>
          <CardTitle>Informazioni Base</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Code */}
          <div className="space-y-2">
            <Label htmlFor="code" required>
              {t("locationCode")}
            </Label>
            <Input
              id="code"
              value={formData.code}
              onChange={(e) =>
                updateField(
                  "code",
                  e.target.value.replace(/[^a-zA-Z0-9_-]/g, "").toUpperCase()
                )
              }
              placeholder="Es: ALBERO_MAGICO"
              required
            />
            <p className="text-xs text-frost-500">
              La parola chiave segreta che i giocatori dovranno inserire per
              sbloccare la tappa successiva. Solo lettere maiuscole, numeri,
              trattini e underscore.
            </p>
          </div>

          {/* Names */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nameIt" required>
                {t("locationName")} (IT)
              </Label>
              <Input
                id="nameIt"
                value={formData.nameIt}
                onChange={(e) => updateField("nameIt", e.target.value)}
                placeholder="Es: L'Albero Magico"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nameEn" required>
                {t("locationName")} (EN)
              </Label>
              <Input
                id="nameEn"
                value={formData.nameEn}
                onChange={(e) => updateField("nameEn", e.target.value)}
                placeholder="Es: The Magic Tree"
                required
              />
            </div>
          </div>

          {/* Type Selection */}
          <div className="space-y-2">
            <Label>Tipo di Tappa</Label>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isStart}
                  onChange={(e) => updateField("isStart", e.target.checked)}
                  className="w-4 h-4 rounded border-night-700 bg-pitch-800 text-green-500 focus:ring-green-500 focus:ring-offset-pitch-900"
                />
                <span className="text-frost-200">Tappa di Partenza</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isEnd}
                  onChange={(e) => updateField("isEnd", e.target.checked)}
                  className="w-4 h-4 rounded border-night-700 bg-pitch-800 text-sand-500 focus:ring-sand-500 focus:ring-offset-pitch-900"
                />
                <span className="text-frost-200">Tappa Finale</span>
              </label>
            </div>
            <p className="text-xs text-frost-500">
              Le tappe di partenza e arrivo sono comuni a tutti i team. Le tappe
              intermedie saranno visitate in ordine diverso.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Riddle */}
      <Card variant="frost">
        <CardHeader>
          <CardTitle>{t("riddleText")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-3 rounded-lg bg-frost-600/10 border border-frost-600/20">
            <div className="flex gap-2">
              <Info className="h-4 w-4 text-frost-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-frost-400">
                L'indovinello viene mostrato ai giocatori quando sbloccano questa
                tappa. Deve guidarli verso la posizione fisica dove troveranno il
                codice della prossima tappa.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="riddleIt">Indovinello (IT)</Label>
              <Textarea
                id="riddleIt"
                value={formData.riddleIt}
                onChange={(e) => updateField("riddleIt", e.target.value)}
                placeholder="Scrivi l'indovinello in italiano..."
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="riddleEn">Indovinello (EN)</Label>
              <Textarea
                id="riddleEn"
                value={formData.riddleEn}
                onChange={(e) => updateField("riddleEn", e.target.value)}
                placeholder="Write the riddle in English..."
                rows={4}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hints */}
      <Card variant="frost">
        <CardHeader>
          <CardTitle>{t("hintTexts")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-3 rounded-lg bg-frost-600/10 border border-frost-600/20">
            <div className="flex gap-2">
              <Info className="h-4 w-4 text-frost-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-frost-400">
                I giocatori possono richiedere fino a 3 indizi per ogni tappa,
                con un'attesa di 3 minuti tra un indizio e l'altro. Configura
                indizi progressivamente più espliciti.
              </p>
            </div>
          </div>

          {/* Hint 1 */}
          <div>
            <h4 className="font-medium text-frost-200 mb-3">Indizio 1 (suggerimento leggero)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="hint1It">IT</Label>
                <Textarea
                  id="hint1It"
                  value={formData.hint1It}
                  onChange={(e) => updateField("hint1It", e.target.value)}
                  placeholder="Primo indizio in italiano..."
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hint1En">EN</Label>
                <Textarea
                  id="hint1En"
                  value={formData.hint1En}
                  onChange={(e) => updateField("hint1En", e.target.value)}
                  placeholder="First hint in English..."
                  rows={2}
                />
              </div>
            </div>
          </div>

          {/* Hint 2 */}
          <div>
            <h4 className="font-medium text-frost-200 mb-3">Indizio 2 (suggerimento medio)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="hint2It">IT</Label>
                <Textarea
                  id="hint2It"
                  value={formData.hint2It}
                  onChange={(e) => updateField("hint2It", e.target.value)}
                  placeholder="Secondo indizio in italiano..."
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hint2En">EN</Label>
                <Textarea
                  id="hint2En"
                  value={formData.hint2En}
                  onChange={(e) => updateField("hint2En", e.target.value)}
                  placeholder="Second hint in English..."
                  rows={2}
                />
              </div>
            </div>
          </div>

          {/* Hint 3 */}
          <div>
            <h4 className="font-medium text-frost-200 mb-3">Indizio 3 (suggerimento esplicito)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="hint3It">IT</Label>
                <Textarea
                  id="hint3It"
                  value={formData.hint3It}
                  onChange={(e) => updateField("hint3It", e.target.value)}
                  placeholder="Terzo indizio in italiano..."
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hint3En">EN</Label>
                <Textarea
                  id="hint3En"
                  value={formData.hint3En}
                  onChange={(e) => updateField("hint3En", e.target.value)}
                  placeholder="Third hint in English..."
                  rows={2}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.back()}
          disabled={isLoading}
        >
          Annulla
        </Button>
        <Button type="submit" variant="sand" disabled={isLoading}>
          {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {isEditing ? "Salva Modifiche" : "Crea Tappa"}
        </Button>
      </div>
    </form>
  );
}
