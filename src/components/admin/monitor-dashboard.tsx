"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui";
import {
  MapPin,
  Trophy,
  Clock,
  Users,
  CheckCircle,
  Circle,
} from "lucide-react";
import type { Location, Player } from "@/lib/db/schema";
import type { TeamWithPlayers } from "@/lib/db/queries/teams";

interface TeamWithProgress extends TeamWithPlayers {
  path: Array<{ location: Location; stageOrder: number }>;
  totalStages: number;
}

interface MonitorDashboardProps {
  teams: TeamWithProgress[];
  locations: Location[];
  sessionId: number;
  locale: string;
}

export function MonitorDashboard({
  teams: initialTeams,
  locations,
  sessionId,
  locale,
}: MonitorDashboardProps) {
  const [teams, setTeams] = useState(initialTeams);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Auto-refresh every 5 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(
          `/api/admin/sessions/${sessionId}/teams`
        );
        const data = await response.json();
        if (data.success) {
          setTeams((prev) =>
            prev.map((team) => {
              const updated = data.data.find(
                (t: TeamWithPlayers) => t.id === team.id
              );
              return updated
                ? { ...team, ...updated }
                : team;
            })
          );
          setLastUpdate(new Date());
        }
      } catch (err) {
        console.error("Error refreshing teams:", err);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [sessionId]);

  const getProgressPercentage = (team: TeamWithProgress) => {
    if (!team.totalStages) return 0;
    if (team.finishedAt) return 100;
    return Math.round((team.currentStage / (team.totalStages - 1)) * 100);
  };

  const formatTime = (date: Date | string | null) => {
    if (!date) return "-";
    const d = new Date(date);
    return d.toLocaleTimeString("it-IT", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getElapsedTime = (start: Date | string | null, end: Date | string | null) => {
    if (!start) return "-";
    const startDate = new Date(start);
    const endDate = end ? new Date(end) : new Date();
    const diffMs = endDate.getTime() - startDate.getTime();
    const mins = Math.floor(diffMs / 60000);
    const secs = Math.floor((diffMs % 60000) / 1000);
    return `${mins}:${String(secs).padStart(2, "0")}`;
  };

  return (
    <div className="space-y-6">
      {/* Last Update */}
      <div className="text-sm text-frost-500 text-right">
        Ultimo aggiornamento: {formatTime(lastUpdate)}
      </div>

      {/* Teams List */}
      {teams.length === 0 ? (
        <Card variant="frost">
          <CardContent className="py-12 text-center">
            <Users className="h-12 w-12 mx-auto text-frost-600 mb-4" />
            <h3 className="text-lg font-medium text-frost-200 mb-2">
              Nessuna squadra
            </h3>
            <p className="text-frost-400">
              Crea delle squadre e genera i percorsi per iniziare il monitoraggio
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {teams
            .sort((a, b) => {
              // Sort: completed first (by finish time), then in progress (by stage desc), then not started
              if (a.finishedAt && b.finishedAt) {
                return (
                  new Date(a.finishedAt).getTime() -
                  new Date(b.finishedAt).getTime()
                );
              }
              if (a.finishedAt) return -1;
              if (b.finishedAt) return 1;
              if (a.startedAt && !b.startedAt) return -1;
              if (!a.startedAt && b.startedAt) return 1;
              return b.currentStage - a.currentStage;
            })
            .map((team, idx) => (
              <Card key={team.id} variant="frost">
                <CardContent className="py-4">
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    {/* Rank/Position */}
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-night-800 flex items-center justify-center">
                      {team.finishedAt ? (
                        <Trophy className="h-6 w-6 text-sand-400" />
                      ) : (
                        <span className="text-xl font-bold text-frost-300">
                          {idx + 1}
                        </span>
                      )}
                    </div>

                    {/* Team Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-frost-100 truncate">
                          {team.name}
                        </h3>
                        {team.finishedAt && (
                          <span className="px-2 py-0.5 rounded text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
                            Completato
                          </span>
                        )}
                        {team.startedAt && !team.finishedAt && (
                          <span className="px-2 py-0.5 rounded text-xs font-medium bg-sand-500/20 text-sand-400 border border-sand-500/30">
                            In gioco
                          </span>
                        )}
                        {!team.startedAt && (
                          <span className="px-2 py-0.5 rounded text-xs font-medium bg-pitch-800 text-frost-500 border border-night-700">
                            Non iniziato
                          </span>
                        )}
                      </div>

                      {/* Players */}
                      <p className="text-sm text-frost-500 mb-2">
                        {team.players
                          .map((p) => `${p.firstName} ${p.lastName}`)
                          .join(", ") || "Nessun giocatore"}
                      </p>

                      {/* Progress Bar */}
                      {team.totalStages > 0 && (
                        <div className="w-full bg-night-800 rounded-full h-2 mb-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-500 ${
                              team.finishedAt
                                ? "bg-green-500"
                                : "bg-frost-500"
                            }`}
                            style={{ width: `${getProgressPercentage(team)}%` }}
                          />
                        </div>
                      )}

                      {/* Stage Progress with Location Codes */}
                      {team.path.length > 0 && (
                        <div className="flex items-center gap-1 flex-wrap">
                          {team.path.map((p, stageIdx) => (
                            <div
                              key={stageIdx}
                              className="flex items-center gap-1"
                            >
                              {stageIdx > 0 && (
                                <span className="text-frost-600 text-xs">→</span>
                              )}
                              <span
                                className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${
                                  stageIdx < team.currentStage ||
                                  team.finishedAt
                                    ? "bg-green-500/20 text-green-400"
                                    : stageIdx === team.currentStage
                                    ? "bg-sand-500/20 text-sand-400"
                                    : "bg-night-700 text-frost-500"
                                }`}
                                title={p.location.code}
                              >
                                {locale === "it"
                                  ? p.location.nameIt
                                  : p.location.nameEn}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="flex gap-4 text-sm">
                      <div className="text-center">
                        <p className="text-frost-500">Tappa</p>
                        <p className="font-medium text-frost-200">
                          {team.currentStage + 1}/{team.totalStages || "?"}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-frost-500">Indizi</p>
                        <p className="font-medium text-frost-200">
                          {team.hintsUsedCurrentStage}/3
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-frost-500">Tempo</p>
                        <p className="font-medium text-frost-200">
                          {getElapsedTime(team.startedAt, team.finishedAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      )}
    </div>
  );
}
