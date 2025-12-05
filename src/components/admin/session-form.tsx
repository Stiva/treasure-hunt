"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button, Input, Label, Select, Card, CardContent, Textarea } from "@/components/ui";
import { Loader2 } from "lucide-react";
import type { Session } from "@/lib/db/schema";

interface SessionFormProps {
  session?: Session;
  locale: string;
}

export function SessionForm({ session, locale }: SessionFormProps) {
  const t = useTranslations("admin");
  const router = useRouter();
  const isEditing = !!session;

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Determine initial teamSize selection
  const initialTeamSize = session?.teamSize ?? 2;
  const isCustomSize = initialTeamSize > 4;

  const [formData, setFormData] = useState({
    name: session?.name || "",
    keyword: session?.keyword || "",
    teamSize: initialTeamSize,
    teamSizeSelection: isCustomSize ? "custom" : String(initialTeamSize),
    adminDisplayName: session?.adminDisplayName || "",
    victoryMessageIt: session?.victoryMessageIt || "",
    victoryMessageEn: session?.victoryMessageEn || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const url = isEditing
        ? `/api/admin/sessions/${session.id}`
        : "/api/admin/sessions";
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          keyword: formData.keyword,
          teamSize: formData.teamSize,
          adminDisplayName: formData.adminDisplayName,
          victoryMessageIt: formData.victoryMessageIt,
          victoryMessageEn: formData.victoryMessageEn,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.error || "Errore durante il salvataggio");
        return;
      }

      // Redirect to session detail or sessions list
      if (isEditing) {
        router.refresh();
      } else {
        router.push(`/${locale}/admin/sessions/${data.data.id}`);
      }
    } catch (err) {
      setError("Errore di connessione");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card variant="frost">
        <CardContent className="space-y-6 pt-6">
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Session Name */}
          <div className="space-y-2">
            <Label htmlFor="name" required>
              {t("sessionName")}
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Es: Caccia al Tesoro Natale 2024"
              required
            />
          </div>

          {/* Session Keyword */}
          <div className="space-y-2">
            <Label htmlFor="keyword" required>
              {t("sessionKeyword")}
            </Label>
            <Input
              id="keyword"
              value={formData.keyword}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  keyword: e.target.value.replace(/[^a-zA-Z0-9_-]/g, ""),
                })
              }
              placeholder="Es: natale2024"
              required
            />
            <p className="text-xs text-frost-500">
              I giocatori useranno questa parola chiave per accedere alla sessione.
              Solo lettere, numeri, trattini e underscore.
            </p>
          </div>

          {/* Team Size */}
          <div className="space-y-2">
            <Label htmlFor="teamSize" required>
              {t("teamSize")}
            </Label>
            <div className="flex gap-3">
              <Select
                id="teamSize"
                value={formData.teamSizeSelection}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === "custom") {
                    setFormData({
                      ...formData,
                      teamSizeSelection: "custom",
                      teamSize: formData.teamSize > 4 ? formData.teamSize : 5,
                    });
                  } else {
                    setFormData({
                      ...formData,
                      teamSizeSelection: value,
                      teamSize: parseInt(value),
                    });
                  }
                }}
                className="flex-1"
              >
                <option value="1">{t("solo")}</option>
                <option value="2">{t("couples")}</option>
                <option value="3">3 {t("playersLabel")}</option>
                <option value="4">4 {t("playersLabel")}</option>
                <option value="custom">{t("custom")}</option>
              </Select>
              {formData.teamSizeSelection === "custom" && (
                <Input
                  type="number"
                  min={5}
                  value={formData.teamSize}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      teamSize: Math.max(1, parseInt(e.target.value) || 1),
                    })
                  }
                  className="w-24"
                  placeholder="5+"
                />
              )}
            </div>
            <p className="text-xs text-frost-500">
              {formData.teamSize === 1
                ? "Ogni giocatore partecipa singolarmente con il proprio percorso."
                : formData.teamSize === 2
                ? "I giocatori saranno organizzati in coppie che condividono lo stesso percorso."
                : `I giocatori saranno organizzati in squadre di ${formData.teamSize} persone.`}
            </p>
          </div>

          {/* Admin Display Name */}
          <div className="space-y-2">
            <Label htmlFor="adminDisplayName">
              Nome Admin nella Chat
            </Label>
            <Input
              id="adminDisplayName"
              value={formData.adminDisplayName}
              onChange={(e) =>
                setFormData({ ...formData, adminDisplayName: e.target.value })
              }
              placeholder="Es: Sandyman, Jack Frost..."
            />
            <p className="text-xs text-frost-500">
              Nome che verrà mostrato ai giocatori nella chat di supporto al posto di "Admin".
              Lascia vuoto per usare "Admin".
            </p>
          </div>

          {/* Victory Message IT */}
          <div className="space-y-2">
            <Label htmlFor="victoryMessageIt">
              Messaggio di Vittoria (Italiano)
            </Label>
            <Textarea
              id="victoryMessageIt"
              value={formData.victoryMessageIt}
              onChange={(e) =>
                setFormData({ ...formData, victoryMessageIt: e.target.value })
              }
              placeholder="Es: Complimenti! Avete completato la caccia al tesoro delle Cinque Leggende!"
              rows={3}
            />
            <p className="text-xs text-frost-500">
              Messaggio mostrato ai giocatori quando completano la caccia al tesoro.
              Lascia vuoto per usare il messaggio di default.
            </p>
          </div>

          {/* Victory Message EN */}
          <div className="space-y-2">
            <Label htmlFor="victoryMessageEn">
              Victory Message (English)
            </Label>
            <Textarea
              id="victoryMessageEn"
              value={formData.victoryMessageEn}
              onChange={(e) =>
                setFormData({ ...formData, victoryMessageEn: e.target.value })
              }
              placeholder="E.g.: Congratulations! You have completed the Rise of the Guardians treasure hunt!"
              rows={3}
            />
            <p className="text-xs text-frost-500">
              Message shown to players when they complete the treasure hunt.
              Leave empty to use the default message.
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-3 pt-4">
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
              {isEditing ? "Salva Modifiche" : "Crea Sessione"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
