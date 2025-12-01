"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button, Input, Label, Card, CardContent } from "@/components/ui";
import { Loader2, Mail, Key, AlertCircle } from "lucide-react";

interface PlayerLoginFormProps {
  locale: string;
}

export function PlayerLoginForm({ locale }: PlayerLoginFormProps) {
  const t = useTranslations("auth");
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    keyword: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/player/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.error || t("invalidCredentials"));
        return;
      }

      // Redirect to game
      router.push(`/${locale}/play`);
      router.refresh();
    } catch (err) {
      setError("Errore di connessione. Riprova.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card variant="frost" className="border-frost-600/20">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-start gap-2">
              <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              {t("email")}
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              placeholder={t("emailPlaceholder")}
              required
              autoComplete="email"
            />
          </div>

          {/* Session Keyword */}
          <div className="space-y-2">
            <Label htmlFor="keyword" className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              {t("sessionKeyword")}
            </Label>
            <Input
              id="keyword"
              type="text"
              value={formData.keyword}
              onChange={(e) =>
                setFormData({ ...formData, keyword: e.target.value })
              }
              placeholder={t("keywordPlaceholder")}
              required
              autoComplete="off"
            />
            <p className="text-xs text-frost-500">
              Chiedi la parola chiave all'organizzatore dell'evento
            </p>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            variant="sand"
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : null}
            {t("login")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
