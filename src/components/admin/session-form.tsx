"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button, Input, Label, Select, Card, CardContent, Textarea } from "@/components/ui";
import { Loader2, ChevronDown, ChevronRight, BookOpen } from "lucide-react";
import type { HelpContent } from "@/types/database";
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

  // Stato separato per le stringhe raw delle textarea help content
  // Questo evita il bug del cursore che salta alla fine ad ogni keystroke
  const [helpTexts, setHelpTexts] = useState({
    rulesIt: (session?.helpContentIt as HelpContent | null)?.rules?.join("\n") || "",
    stepsIt: (session?.helpContentIt as HelpContent | null)?.steps?.join("\n") || "",
    tipsIt: (session?.helpContentIt as HelpContent | null)?.tips?.join("\n") || "",
    rulesEn: (session?.helpContentEn as HelpContent | null)?.rules?.join("\n") || "",
    stepsEn: (session?.helpContentEn as HelpContent | null)?.steps?.join("\n") || "",
    tipsEn: (session?.helpContentEn as HelpContent | null)?.tips?.join("\n") || "",
  });

  // State for collapsible help content section
  const [showHelpContent, setShowHelpContent] = useState(
    !!(session?.helpContentIt || session?.helpContentEn)
  );

  // Helper per convertire stringa in array (usato solo al submit)
  const parseHelpContent = (text: string): string[] => {
    return text.split("\n").filter((line) => line.trim());
  };

  // Check if any help content is configured
  const hasHelpContent =
    helpTexts.rulesIt || helpTexts.stepsIt || helpTexts.tipsIt ||
    helpTexts.rulesEn || helpTexts.stepsEn || helpTexts.tipsEn;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Costruisci helpContent dagli stati stringa (conversione solo al submit)
    const helpContentIt = (helpTexts.rulesIt || helpTexts.stepsIt || helpTexts.tipsIt)
      ? {
          rules: parseHelpContent(helpTexts.rulesIt),
          steps: parseHelpContent(helpTexts.stepsIt),
          tips: parseHelpContent(helpTexts.tipsIt),
        }
      : null;

    const helpContentEn = (helpTexts.rulesEn || helpTexts.stepsEn || helpTexts.tipsEn)
      ? {
          rules: parseHelpContent(helpTexts.rulesEn),
          steps: parseHelpContent(helpTexts.stepsEn),
          tips: parseHelpContent(helpTexts.tipsEn),
        }
      : null;

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
          helpContentIt,
          helpContentEn,
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

          {/* Help Content Section - Collapsible */}
          <div className="border border-night-700 rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => setShowHelpContent(!showHelpContent)}
              className="w-full flex items-center gap-3 p-4 bg-night-800/50 hover:bg-night-800 transition-colors text-left"
            >
              {showHelpContent ? (
                <ChevronDown className="h-5 w-5 text-frost-400" />
              ) : (
                <ChevronRight className="h-5 w-5 text-frost-400" />
              )}
              <BookOpen className="h-5 w-5 text-frost-400" />
              <span className="font-medium text-frost-200">
                Personalizza &quot;Come si Gioca&quot;
              </span>
              <span className="text-xs text-frost-500 ml-auto">
                {hasHelpContent ? "Personalizzato" : "Default"}
              </span>
            </button>

            {showHelpContent && (
              <div className="p-4 space-y-6 bg-night-900/30">
                <p className="text-sm text-frost-400">
                  Personalizza i contenuti della pagina &quot;Come si Gioca&quot; per questa sessione.
                  Lascia vuoto per usare i testi predefiniti.
                </p>

                {/* Italian Help Content */}
                <div className="space-y-4">
                  <h4 className="font-medium text-frost-300 border-b border-night-700 pb-2">
                    🇮🇹 Italiano
                  </h4>

                  <div className="space-y-2">
                    <Label htmlFor="helpRulesIt">Regole del Gioco</Label>
                    <Textarea
                      id="helpRulesIt"
                      value={helpTexts.rulesIt}
                      onChange={(e) => setHelpTexts({ ...helpTexts, rulesIt: e.target.value })}
                      placeholder="Una regola per riga...&#10;Es: La caccia si svolge a squadre&#10;Ogni tappa ha un indovinello da risolvere"
                      rows={5}
                    />
                    <p className="text-xs text-frost-500">
                      Una regola per riga. Saranno mostrate come lista numerata.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="helpStepsIt">Come Giocare</Label>
                    <Textarea
                      id="helpStepsIt"
                      value={helpTexts.stepsIt}
                      onChange={(e) => setHelpTexts({ ...helpTexts, stepsIt: e.target.value })}
                      placeholder="Un passo per riga...&#10;Es: Leggi l'indovinello&#10;Trova il luogo descritto"
                      rows={5}
                    />
                    <p className="text-xs text-frost-500">
                      Un passo per riga. Saranno mostrati come istruzioni numerate.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="helpTipsIt">Suggerimenti</Label>
                    <Textarea
                      id="helpTipsIt"
                      value={helpTexts.tipsIt}
                      onChange={(e) => setHelpTexts({ ...helpTexts, tipsIt: e.target.value })}
                      placeholder="Un suggerimento per riga...&#10;Es: Usa gli indizi se sei bloccato&#10;Non correre, goditi l'avventura!"
                      rows={3}
                    />
                    <p className="text-xs text-frost-500">
                      Un suggerimento per riga. Saranno mostrati in riquadri evidenziati.
                    </p>
                  </div>
                </div>

                {/* English Help Content */}
                <div className="space-y-4">
                  <h4 className="font-medium text-frost-300 border-b border-night-700 pb-2">
                    🇬🇧 English
                  </h4>

                  <div className="space-y-2">
                    <Label htmlFor="helpRulesEn">Game Rules</Label>
                    <Textarea
                      id="helpRulesEn"
                      value={helpTexts.rulesEn}
                      onChange={(e) => setHelpTexts({ ...helpTexts, rulesEn: e.target.value })}
                      placeholder="One rule per line...&#10;E.g.: The hunt is played in teams&#10;Each stage has a riddle to solve"
                      rows={5}
                    />
                    <p className="text-xs text-frost-500">
                      One rule per line. Will be shown as a numbered list.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="helpStepsEn">How to Play</Label>
                    <Textarea
                      id="helpStepsEn"
                      value={helpTexts.stepsEn}
                      onChange={(e) => setHelpTexts({ ...helpTexts, stepsEn: e.target.value })}
                      placeholder="One step per line...&#10;E.g.: Read the riddle&#10;Find the described location"
                      rows={5}
                    />
                    <p className="text-xs text-frost-500">
                      One step per line. Will be shown as numbered instructions.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="helpTipsEn">Tips</Label>
                    <Textarea
                      id="helpTipsEn"
                      value={helpTexts.tipsEn}
                      onChange={(e) => setHelpTexts({ ...helpTexts, tipsEn: e.target.value })}
                      placeholder="One tip per line...&#10;E.g.: Use hints if you're stuck&#10;Don't rush, enjoy the adventure!"
                      rows={3}
                    />
                    <p className="text-xs text-frost-500">
                      One tip per line. Will be shown in highlighted boxes.
                    </p>
                  </div>
                </div>
              </div>
            )}
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
