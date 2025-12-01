"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Button,
  Input,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui";
import {
  Loader2,
  Play,
  MapPin,
  Key,
  Lightbulb,
  Trophy,
  Clock,
  LogOut,
  RefreshCw,
} from "lucide-react";
import { ChatButton } from "./chat-button";
import { MapButton } from "./map-button";
import type { Player, Team, Location } from "@/lib/db/schema";

interface GameState {
  team: Team;
  currentLocation: Location | null;
  nextLocation: Partial<Location> | null;
  totalStages: number;
  isCompleted: boolean;
}

interface GameDashboardProps {
  player: Player;
  team: Team;
  gameState: GameState;
  pathLength: number;
  locale: string;
}

export function GameDashboard({
  player,
  team: initialTeam,
  gameState: initialGameState,
  pathLength,
  locale,
}: GameDashboardProps) {
  const t = useTranslations("game");
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [gameState, setGameState] = useState(initialGameState);
  const [team, setTeam] = useState(initialTeam);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  // Polling for real-time sync (for couples mode)
  const refreshGameState = useCallback(async () => {
    try {
      const response = await fetch("/api/player/game");
      const data = await response.json();
      if (data.success) {
        setGameState({
          team: data.data.team,
          currentLocation: data.data.currentLocation,
          nextLocation: data.data.nextLocation,
          totalStages: data.data.totalStages,
          isCompleted: data.data.isCompleted,
        });
        setTeam(data.data.team);
      }
    } catch (err) {
      console.error("Error refreshing game state:", err);
    }
  }, []);

  // Poll every 3 seconds for real-time sync
  useEffect(() => {
    const interval = setInterval(refreshGameState, 3000);
    return () => clearInterval(interval);
  }, [refreshGameState]);

  // Cooldown timer
  useEffect(() => {
    if (team.lastHintRequestedAt) {
      const cooldownMs = 3 * 60 * 1000;
      const timeSinceLastHint =
        Date.now() - new Date(team.lastHintRequestedAt).getTime();
      const remainingMs = Math.max(0, cooldownMs - timeSinceLastHint);
      setCooldownSeconds(Math.ceil(remainingMs / 1000));

      if (remainingMs > 0) {
        const timer = setInterval(() => {
          setCooldownSeconds((prev) => Math.max(0, prev - 1));
        }, 1000);
        return () => clearInterval(timer);
      }
    }
  }, [team.lastHintRequestedAt]);

  const handleStartGame = async () => {
    setIsLoading("start");
    setError(null);

    try {
      const response = await fetch("/api/player/game", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "start" }),
      });
      const data = await response.json();

      if (!data.success) {
        setError(data.error);
        return;
      }

      setSuccess(data.message);
      await refreshGameState();
    } catch (err) {
      setError("Errore di connessione");
    } finally {
      setIsLoading(null);
    }
  };

  const handleSubmitCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setIsLoading("submit");
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/player/game", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "submit_code", code: code.trim() }),
      });
      const data = await response.json();

      if (!data.success) {
        setError(data.error);
        return;
      }

      setSuccess(data.message);
      setCode("");
      await refreshGameState();
    } catch (err) {
      setError("Errore di connessione");
    } finally {
      setIsLoading(null);
    }
  };

  const handleRequestHint = async () => {
    setIsLoading("hint");
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/player/game", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "request_hint" }),
      });
      const data = await response.json();

      if (!data.success) {
        setError(data.error);
        return;
      }

      setSuccess(data.message);
      await refreshGameState();
    } catch (err) {
      setError("Errore di connessione");
    } finally {
      setIsLoading(null);
    }
  };

  const handleLogout = async () => {
    setIsLoading("logout");
    try {
      await fetch("/api/player/auth", { method: "DELETE" });
      router.push(`/${locale}/play/login`);
      router.refresh();
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const formatCooldown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${String(secs).padStart(2, "0")}`;
  };

  const nextLoc = gameState.nextLocation;
  const hints = [
    { it: nextLoc?.hint1It, en: nextLoc?.hint1En },
    { it: nextLoc?.hint2It, en: nextLoc?.hint2En },
    { it: nextLoc?.hint3It, en: nextLoc?.hint3En },
  ];
  const visibleHints = hints.slice(0, team.hintsUsedCurrentStage);

  // Game completed
  if (gameState.isCompleted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-night-950 to-pitch-950 p-4">
        <Card variant="frost" className="max-w-md w-full text-center">
          <CardContent className="py-8">
            <Trophy className="h-16 w-16 mx-auto text-sand-400 mb-4" />
            <h1 className="text-2xl font-bold text-frost-100 mb-2">
              {t("congratulations")}
            </h1>
            <p className="text-frost-400 mb-6">{t("gameCompleted")}</p>
            <Button variant="ghost" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              {t("logout") || "Esci"}
            </Button>
          </CardContent>
        </Card>
        <MapButton locale={locale} />
        <ChatButton locale={locale} />
      </div>
    );
  }

  // Game not started
  if (!team.startedAt) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-night-950 to-pitch-950 p-4">
        <Card variant="frost" className="max-w-md w-full text-center">
          <CardContent className="py-8">
            <Play className="h-16 w-16 mx-auto text-frost-400 mb-4" />
            <h1 className="text-2xl font-bold text-frost-100 mb-2">
              Pronto per iniziare?
            </h1>
            <p className="text-frost-400 mb-2">
              Ciao <strong>{player.firstName}</strong>!
            </p>
            <p className="text-frost-400 mb-6">
              Squadra: <strong>{team.name}</strong>
            </p>
            <Button
              variant="sand"
              size="lg"
              onClick={handleStartGame}
              disabled={isLoading !== null}
            >
              {isLoading === "start" ? (
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              ) : (
                <Play className="h-5 w-5 mr-2" />
              )}
              Inizia la Caccia!
            </Button>
          </CardContent>
        </Card>
        <MapButton locale={locale} />
        <ChatButton locale={locale} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-night-950 to-pitch-950 p-4">
      <div className="max-w-lg mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-frost-100">{team.name}</h1>
            <p className="text-sm text-frost-400">
              {t("stageOf", {
                current: team.currentStage + 1,
                total: pathLength,
              })}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={refreshGameState}
              disabled={isLoading !== null}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              disabled={isLoading !== null}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Messages */}
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

        {/* Current Location */}
        {gameState.currentLocation && (
          <Card variant="frost">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <MapPin className="h-4 w-4 text-green-400" />
                {t("currentStage")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-frost-200">
                {locale === "it"
                  ? gameState.currentLocation.nameIt
                  : gameState.currentLocation.nameEn}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Riddle */}
        {nextLoc && (
          <Card variant="frost">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Key className="h-4 w-4 text-sand-400" />
                {t("riddle")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-frost-200 whitespace-pre-wrap">
                {locale === "it" ? nextLoc.riddleIt : nextLoc.riddleEn}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Code Input */}
        <Card variant="frost">
          <CardContent className="pt-4">
            <form onSubmit={handleSubmitCode} className="flex gap-2">
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder={t("codePlaceholder")}
                className="flex-1 font-mono uppercase"
                disabled={isLoading !== null}
              />
              <Button
                type="submit"
                variant="sand"
                disabled={!code.trim() || isLoading !== null}
              >
                {isLoading === "submit" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  t("submitCode")
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Hints */}
        <Card variant="frost">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <Lightbulb className="h-4 w-4 text-frost-400" />
                {t("hint")}
              </CardTitle>
              <span className="text-sm text-frost-500">
                {t("hintsRemaining", { count: 3 - team.hintsUsedCurrentStage })}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            {/* Show unlocked hints */}
            {visibleHints.length > 0 && (
              <div className="space-y-3 mb-4">
                {visibleHints.map((hint, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg bg-night-800 border border-night-700"
                  >
                    <p className="text-xs text-frost-500 mb-1">
                      {t("hintNumber", { number: idx + 1 })}
                    </p>
                    <p className="text-frost-300 text-sm">
                      {locale === "it" ? hint.it : hint.en}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Request hint button */}
            {team.hintsUsedCurrentStage < 3 && (
              <>
                {cooldownSeconds > 0 ? (
                  <div className="flex items-center justify-center gap-2 text-frost-500 text-sm py-2">
                    <Clock className="h-4 w-4" />
                    {t("hintCooldown", {
                      minutes: Math.floor(cooldownSeconds / 60),
                      seconds: String(cooldownSeconds % 60).padStart(2, "0"),
                    })}
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    onClick={handleRequestHint}
                    disabled={isLoading !== null}
                    className="w-full"
                  >
                    {isLoading === "hint" ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Lightbulb className="h-4 w-4 mr-2" />
                    )}
                    {t("requestHint")}
                  </Button>
                )}
              </>
            )}

            {team.hintsUsedCurrentStage >= 3 && (
              <p className="text-center text-frost-500 text-sm">
                {t("noMoreHints")}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
      <MapButton locale={locale} />
      <ChatButton locale={locale} />
    </div>
  );
}
